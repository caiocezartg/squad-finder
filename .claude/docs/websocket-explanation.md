# WebSocket Implementation Guide - SquadFinder

This document explains the WebSocket implementation in SquadFinder, covering both server and client code.

## Table of Contents
1. [Overview](#overview)
2. [Why WebSocket for This Use Case](#why-websocket-for-this-use-case)
3. [Server Implementation](#server-implementation)
4. [Client Implementation](#client-implementation)
5. [Message Flow](#message-flow)
6. [Key Patterns](#key-patterns)

---

## Overview

SquadFinder uses WebSockets for two main real-time features:
1. **Room List Updates** - When rooms are created/deleted, all users viewing the lobby see updates instantly
2. **Room Lobby Updates** - When players join/leave a room, everyone in that room sees updates

### Architecture
```
┌─────────────┐     HTTP (create/join/leave)     ┌─────────────┐
│   Client    │ ◄──────────────────────────────► │   Server    │
│  (React)    │                                  │  (Fastify)  │
│             │     WebSocket (real-time)        │             │
│             │ ◄──────────────────────────────► │             │
└─────────────┘                                  └─────────────┘
```

---

## Why WebSocket for This Use Case

### Comparison: Polling vs WebSocket

| Aspect | Polling (refetchInterval) | WebSocket |
|--------|---------------------------|-----------|
| Updates | Every X seconds | Instant |
| Server Load | O(users × polls/min) | O(events) |
| Latency | 0 to X seconds | ~50ms |
| Scalability | Poor at scale | Good |
| Complexity | Simple | Moderate |

### For 100+ Concurrent Rooms
- **Polling**: 100 users × 6 polls/min = 600 requests/min (wasteful)
- **WebSocket**: Only sends messages when rooms actually change

### Recommendation
WebSocket is the right choice for SquadFinder because:
1. Gaming requires low-latency updates (instant room visibility)
2. Room events are infrequent but important
3. Users expect real-time feedback when joining/leaving

---

## Server Implementation

### 1. Message Types (`types.ts`)

All WebSocket messages are validated using Zod schemas for type safety.

```typescript
// Base message structure - all messages have type and timestamp
export const baseWsMessageSchema = z.object({
  type: wsMessageTypeSchema,
  timestamp: z.number().optional(),
});

// Example: join_room message from client
export const joinRoomMessageSchema = baseWsMessageSchema.extend({
  type: z.literal('join_room'),
  payload: z.object({
    roomCode: z.string().length(6),
  }),
});
```

**Message Types:**
- `join_room` / `leave_room` - Client requests to join/leave a room's WebSocket channel
- `room_joined` - Server confirms join with player list
- `player_joined` / `player_left` - Broadcast when players enter/exit
- `room_ready` - Broadcast when room reaches max players
- `subscribe_lobby` / `unsubscribe_lobby` - Subscribe to room list updates
- `room_created` / `room_deleted` - Broadcast to lobby subscribers

### 2. WebSocket Plugin (`ws.plugin.ts`)

The plugin handles WebSocket connections and message routing.

```typescript
fastify.get('/ws', { websocket: true }, async (socket, request) => {
  // 1. Authenticate via session cookie
  const session = request.session;
  if (!session?.user?.id) {
    socket.close(4001, 'Unauthorized');
    return;
  }

  // 2. Create client data object (attached to socket)
  const client: WsClient = {
    userId: session.user.id,
    userName: session.user.name,
    roomCode: null,      // Which room they're viewing
    isInLobby: false,    // Subscribed to room list?
    send: (message) => socket.send(JSON.stringify(message)),
  };
  setClientData(socket, client);

  // 3. Handle incoming messages
  socket.on('message', async (rawData) => {
    const data = JSON.parse(rawData.toString());
    const result = wsIncomingMessageSchema.safeParse(data);

    switch (result.data.type) {
      case 'join_room':
        await handleJoinRoom(socket, message, db);
        break;
      case 'subscribe_lobby':
        handleSubscribeLobby(socket);
        break;
      // ... other handlers
    }
  });

  // 4. Clean up on disconnect
  socket.on('close', () => handleDisconnect(socket));
});
```

**Key Concepts:**
- **Authentication**: Uses session cookie from HTTP request headers
- **Client Data**: `WsClient` object stored in WeakMap, associated with socket
- **Message Validation**: Zod ensures only valid messages are processed

### 3. Room Handler (`handlers/room.handler.ts`)

Manages room subscriptions and broadcasts.

```typescript
// In-memory tracking structures
const rooms: Map<string, Set<WebSocket>> = new Map();      // roomCode → sockets
const clientData: WeakMap<WebSocket, WsClient> = new WeakMap();  // socket → client info
const lobbySubscribers: Set<WebSocket> = new Set();        // sockets viewing room list
```

**Why These Data Structures?**

- **Map for rooms**: Fast lookup by room code, easy iteration over room members
- **WeakMap for clientData**: Automatically garbage collected when socket is gone
- **Set for subscribers**: Prevents duplicates, O(1) add/remove

**Joining a Room:**
```typescript
export async function handleJoinRoom(socket, message, db) {
  const { roomCode } = message.payload;
  const client = getClientData(socket);

  // 1. Validate room exists in database
  const room = await roomRepository.findByCode(roomCode);
  if (!room) {
    sendError(socket, 'ROOM_NOT_FOUND', `Room "${roomCode}" not found`);
    return;
  }

  // 2. Validate user is a member (joined via HTTP first)
  const membership = await roomMemberRepository.findByRoomAndUser(room.id, client.userId);
  if (!membership) {
    sendError(socket, 'NOT_ROOM_MEMBER', 'You are not a member of this room');
    return;
  }

  // 3. Add socket to room's socket set
  let roomSockets = rooms.get(roomCode);
  if (!roomSockets) {
    roomSockets = new Set();
    rooms.set(roomCode, roomSockets);
  }
  roomSockets.add(socket);
  client.roomCode = roomCode;

  // 4. Send room_joined with all current players
  const members = await roomMemberRepository.findByRoomId(room.id);
  const players = await Promise.all(members.map(async (m) => ({
    id: m.userId,
    name: (await userRepository.findById(m.userId))?.name ?? 'Unknown',
    isHost: m.userId === room.hostId,
  })));

  sendToSocket(socket, {
    type: 'room_joined',
    payload: { roomId: room.id, roomCode, players },
  });

  // 5. Broadcast player_joined to others in room
  broadcastToRoom(roomCode, {
    type: 'player_joined',
    payload: { player: { id: client.userId, name: client.userName } },
  }, socket); // exclude the joining socket

  // 6. Check if room is now full
  if (members.length >= room.maxPlayers) {
    broadcastToRoom(roomCode, {
      type: 'room_ready',
      payload: { message: 'Room is full! Time to play!' },
    });
  }
}
```

**Broadcasting to Room:**
```typescript
function broadcastToRoom(roomCode: string, message: unknown, excludeSocket?: WebSocket) {
  const roomSockets = rooms.get(roomCode);
  if (!roomSockets) return;

  for (const socket of roomSockets) {
    if (socket !== excludeSocket) {
      sendToSocket(socket, message);
    }
  }
}
```

**Lobby Subscriptions:**
```typescript
// Called by HTTP controller when room is created
export function broadcastRoomCreated(room: Room) {
  const message = { type: 'room_created', payload: { room } };
  for (const socket of lobbySubscribers) {
    sendToSocket(socket, message);
  }
}

// Called by HTTP controller when host leaves (room deleted)
export function broadcastRoomDeleted(roomId: string, roomCode: string) {
  const message = { type: 'room_deleted', payload: { roomId, roomCode } };
  for (const socket of lobbySubscribers) {
    sendToSocket(socket, message);
  }
}
```

---

## Client Implementation

### 1. WebSocket Client Class (`lib/ws-client.ts`)

Handles connection management, reconnection, and message dispatch.

```typescript
export class WebSocketClient {
  private ws: WebSocket | null = null;
  private url: string;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private listeners: Map<string, Set<(payload: unknown) => void>> = new Map();

  connect(): void {
    // Prevent duplicate connections (React StrictMode fix)
    if (this.ws?.readyState === WebSocket.OPEN ||
        this.ws?.readyState === WebSocket.CONNECTING) {
      return;
    }

    this.ws = new WebSocket(this.url);

    this.ws.onopen = () => {
      this.reconnectAttempts = 0;
      this.emit('connected', {});
    };

    this.ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      this.emit(data.type, data.payload);
    };

    this.ws.onclose = () => {
      this.emit('disconnected', {});
      this.scheduleReconnect();
    };
  }

  disconnect(): void {
    if (!this.ws) return;

    // Remove handlers BEFORE closing (prevents race condition callbacks)
    this.ws.onopen = null;
    this.ws.onclose = null;
    this.ws.onerror = null;
    this.ws.onmessage = null;

    this.ws.close();
    this.ws = null;
  }

  send(type: string, payload: unknown): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ type, payload, timestamp: Date.now() }));
    }
  }

  on(type: string, callback: (payload: unknown) => void): () => void {
    if (!this.listeners.has(type)) {
      this.listeners.set(type, new Set());
    }
    this.listeners.get(type)!.add(callback);

    // Return unsubscribe function
    return () => this.listeners.get(type)?.delete(callback);
  }
}
```

**Key Features:**
- **Singleton-ish**: Can be reused across components
- **Auto-reconnect**: Exponential backoff on disconnect
- **Event emitter pattern**: Components subscribe to specific message types
- **React StrictMode safe**: Checks connection state before connecting

### 2. React Hook (`hooks/use-websocket.ts`)

Provides React-friendly interface to WebSocket.

```typescript
export function useWebSocket(options: UseWebSocketOptions) {
  const [isConnected, setIsConnected] = useState(false);
  const clientRef = useRef<WebSocketClient | null>(null);

  useEffect(() => {
    const client = new WebSocketClient(options.url);
    clientRef.current = client;

    // Track connection state
    const unsubConnect = client.on('connected', () => setIsConnected(true));
    const unsubDisconnect = client.on('disconnected', () => setIsConnected(false));

    if (options.autoConnect) {
      client.connect();
    }

    // Cleanup on unmount
    return () => {
      unsubConnect();
      unsubDisconnect();
      client.disconnect();
    };
  }, [options.url]);

  const send = useCallback((type: string, payload: unknown) => {
    clientRef.current?.send(type, payload);
  }, []);

  const on = useCallback((type: string, callback: (payload: unknown) => void) => {
    return clientRef.current?.on(type, callback) ?? (() => {});
  }, []);

  return { isConnected, send, on };
}
```

### 3. Room List Page (`routes/rooms/index.tsx`)

Uses WebSocket for real-time room list updates.

```typescript
function RoomsPage() {
  const queryClient = useQueryClient();

  // Connect to WebSocket
  const { isConnected, send, on } = useWebSocket({
    url: wsUrl,
    autoConnect: true,
  });

  // Subscribe to lobby when connected
  useEffect(() => {
    if (isConnected) {
      send("subscribe_lobby", {});
    }
  }, [isConnected, send]);

  // Handle room events
  useEffect(() => {
    const unsubscribeCreated = on("room_created", (raw) => {
      const data = raw as RoomCreatedPayload;

      // Update TanStack Query cache directly
      queryClient.setQueryData<RoomsResponse>(["rooms"], (old) => {
        if (!old) return { rooms: [data.room] };
        if (old.rooms.some((r) => r.id === data.room.id)) return old; // Avoid duplicates
        return { rooms: [...old.rooms, data.room] };
      });
    });

    const unsubscribeDeleted = on("room_deleted", (raw) => {
      const data = raw as RoomDeletedPayload;

      queryClient.setQueryData<RoomsResponse>(["rooms"], (old) => {
        if (!old) return { rooms: [] };
        return { rooms: old.rooms.filter((r) => r.id !== data.roomId) };
      });
    });

    return () => {
      unsubscribeCreated();
      unsubscribeDeleted();
    };
  }, [on, queryClient]);

  // Initial data still loaded via HTTP
  const { data: roomsData } = useQuery({
    queryKey: ["rooms"],
    queryFn: () => api.get<RoomsResponse>("/api/rooms"),
  });
}
```

**Pattern: HTTP + WebSocket Hybrid**
- HTTP for initial data fetch and mutations (create/join/leave)
- WebSocket for real-time updates to cached data
- TanStack Query cache is the single source of truth

---

## Message Flow

### Creating a Room
```
User A (browser)              Server                    User B (browser)
     │                           │                           │
     │──POST /api/rooms──────────►                           │
     │                           │                           │
     │◄──201 { room }────────────│                           │
     │                           │                           │
     │                           │──room_created────────────►│
     │                           │    (via WebSocket)        │
     │                           │                           │
     │   Navigate to /rooms/:code                            │
     │──ws: join_room { code }───►                           │
     │                           │                           │
     │◄──ws: room_joined─────────│                           │
     │      { players: [...] }   │                           │
```

### Joining a Room
```
User A (in room)              Server                    User B (joining)
     │                           │                           │
     │                           │◄──POST /rooms/:code/join──│
     │                           │                           │
     │                           │──200 OK──────────────────►│
     │                           │                           │
     │                           │◄──ws: join_room { code }──│
     │                           │                           │
     │                           │──ws: room_joined─────────►│
     │                           │                           │
     │◄──ws: player_joined───────│                           │
     │      { player: B }        │                           │
```

### Leaving a Room (Host)
```
User A (host)                 Server                    Lobby viewers
     │                           │                           │
     │──POST /rooms/:code/leave──►                           │
     │                           │   (room deleted)          │
     │◄──200 OK──────────────────│                           │
     │                           │                           │
     │                           │──ws: room_deleted────────►│
     │                           │   (to lobby subscribers)  │
```

---

## Key Patterns

### 1. HTTP for Mutations, WebSocket for Events
- **Create/Join/Leave** → HTTP POST (ensures database consistency)
- **Real-time updates** → WebSocket broadcast (instant UI updates)

### 2. Two-Level Subscription
- **Lobby level**: Users viewing room list subscribe to `room_created`/`room_deleted`
- **Room level**: Users in a specific room subscribe to `player_joined`/`player_left`

### 3. Database Validation on WebSocket Actions
```typescript
// Don't trust client data - validate against database
const membership = await roomMemberRepository.findByRoomAndUser(room.id, client.userId);
if (!membership) {
  sendError(socket, 'NOT_ROOM_MEMBER', 'You are not a member');
  return;
}
```

### 4. Graceful Cleanup
```typescript
socket.on('close', () => {
  // Remove from lobby subscribers
  lobbySubscribers.delete(socket);

  // Remove from room and broadcast to others
  if (client.roomCode) {
    rooms.get(client.roomCode)?.delete(socket);
    broadcastToRoom(client.roomCode, { type: 'player_left', payload: { playerId: client.userId } });
  }
});
```

### 5. React StrictMode Compatibility
```typescript
// In connect(): prevent double connection
if (this.ws?.readyState === WebSocket.CONNECTING) return;

// In disconnect(): remove handlers before close
this.ws.onclose = null;  // Prevents callback during unmount
this.ws.close();
```

---

## Files Reference

| File | Purpose |
|------|---------|
| `server/src/infrastructure/websocket/types.ts` | Message schemas and types |
| `server/src/infrastructure/websocket/ws.plugin.ts` | Fastify WebSocket setup |
| `server/src/infrastructure/websocket/handlers/room.handler.ts` | Room subscription logic |
| `client/src/lib/ws-client.ts` | WebSocket client class |
| `client/src/hooks/use-websocket.ts` | React hook for WebSocket |
| `client/src/routes/rooms/index.tsx` | Room list with live updates |
| `client/src/routes/rooms/$code.tsx` | Room lobby with player updates |
