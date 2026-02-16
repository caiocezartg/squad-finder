# SquadFinder - Business Rules

## Overview

SquadFinder connects gamers to form complete teams (premades) for multiplayer games.

---

## Domain Entities

### User

- Authenticated via Discord OAuth (Better Auth)
- Has Discord avatar and username
- Can create rooms, join rooms, and leave rooms

### Game

- Predefined list of 19 supported games (seeded in database)
- Each game has: name, slug, coverUrl (IGDB), minPlayers, maxPlayers
- Games cannot be created/modified by users (admin-only via seed)

### Room

- Created by a host (authenticated user)
- Has unique 6-character alphanumeric code (uppercase)
- Associated with exactly one game
- Status: `waiting` | `playing` | `finished`
- All rooms are public (available to everyone)

### RoomMember

- Links users to rooms
- Host is automatically added as first member on room creation
- Tracks when user joined the room

---

## Room Rules

### Creation

1. User must be authenticated to create a room
2. Room name is required (1-100 characters)
3. Game selection is required (must be valid gameId from games table)
4. `maxPlayers` defaults to selected game's `maxPlayers` if not provided
5. User can override `maxPlayers` with custom value (min: 2, max: 20)
6. Room code is auto-generated (6 uppercase alphanumeric characters)
7. Room status starts as `waiting`
8. Host is automatically added as first room member

### Joining

1. User must be authenticated to join
2. Room must exist (lookup by code)
3. Room status must be `waiting`
4. User cannot already be a member of the room
5. Room cannot be full (current members < maxPlayers)

### Leaving

1. User must be authenticated to leave
2. User must be a member of the room
3. If host leaves:
   - All members are removed
   - Room is deleted
4. Regular member leaving just removes their membership

### Visibility

- All rooms with `waiting` status appear in the available rooms list
- Rooms can also be joined directly via room code

---

## Authentication Rules

1. Discord OAuth is the only authentication method
2. Session is managed by Better Auth
3. Protected routes require valid session
4. Unauthenticated requests to protected routes return 401

---

## API Response Standards

### Success Responses

- 200: OK (GET, POST actions like join/leave)
- 201: Created (POST new resource like room)

### Error Responses

All errors follow this structure:

```json
{
  "error": "ERROR_CODE",
  "message": "Human-readable description"
}
```

Error codes:

- 400: Bad Request (validation errors)
- 401: Unauthorized (not authenticated)
- 404: Not Found (resource doesn't exist)
- 409: Conflict (duplicate entries)
- 422: Unprocessable Entity (business rule violations)
- 500: Internal Server Error (unexpected errors)

---

## Future Considerations (Phase 3+)

### WebSocket Events

- `room:join` - Broadcast when user joins
- `room:leave` - Broadcast when user leaves
- `room:update` - Room state changes
- `room:ready` - Room is full, show Discord invite

### Room Ready State

- When room reaches `maxPlayers`, show Discord server invite
- Host can share their Discord server invite link
- Consider auto-generating Discord voice channel (future)
