import { useState, useCallback } from "react";

export interface UseMessageLogReturn {
  messages: string[];
  addMessage: (msg: string) => void;
  clearMessages: () => void;
}

export function useMessageLog(maxMessages = 20): UseMessageLogReturn {
  const [messages, setMessages] = useState<string[]>([]);

  const addMessage = useCallback(
    (msg: string) => {
      const timestamp = new Date().toLocaleTimeString();
      setMessages((prev) => [...prev.slice(-(maxMessages - 1)), `${timestamp}: ${msg}`]);
    },
    [maxMessages]
  );

  const clearMessages = useCallback(() => {
    setMessages([]);
  }, []);

  return { messages, addMessage, clearMessages };
}
