import { useEffect, useRef, useState, useCallback } from "react";
import { WebSocketClient, type WebSocketEventHandler } from "@/lib/ws-client";

export interface UseWebSocketOptions {
  url: string;
  autoConnect?: boolean;
  reconnectInterval?: number;
  maxReconnectAttempts?: number;
}

export interface UseWebSocketReturn {
  isConnected: boolean;
  connect: () => void;
  disconnect: () => void;
  send: (type: string, data: unknown) => void;
  on: (event: string, handler: WebSocketEventHandler) => () => void;
}

export function useWebSocket(options: UseWebSocketOptions): UseWebSocketReturn {
  const { url, autoConnect = true, reconnectInterval, maxReconnectAttempts } = options;

  const [isConnected, setIsConnected] = useState(false);
  const clientRef = useRef<WebSocketClient | null>(null);

  useEffect(() => {
    const client = new WebSocketClient({
      url,
      reconnectInterval,
      maxReconnectAttempts,
      onOpen: () => setIsConnected(true),
      onClose: () => setIsConnected(false),
      onError: (error) => console.error("WebSocket error:", error),
    });

    clientRef.current = client;

    if (autoConnect) {
      client.connect();
    }

    return () => {
      client.disconnect();
    };
  }, [url, autoConnect, reconnectInterval, maxReconnectAttempts]);

  const connect = useCallback(() => {
    clientRef.current?.connect();
  }, []);

  const disconnect = useCallback(() => {
    clientRef.current?.disconnect();
  }, []);

  const send = useCallback((type: string, data: unknown) => {
    clientRef.current?.send(type, data);
  }, []);

  const on = useCallback((event: string, handler: WebSocketEventHandler) => {
    if (!clientRef.current) {
      return () => {
        // noop
      };
    }
    return clientRef.current.on(event, handler);
  }, []);

  return {
    isConnected,
    connect,
    disconnect,
    send,
    on,
  };
}
