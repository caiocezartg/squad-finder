import { useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import type { Room, RoomsResponse } from "@/types";

export interface UseRoomsCacheReturn {
  addRoom: (room: Room) => void;
  removeRoom: (roomId: string) => void;
}

export function useRoomsCache(): UseRoomsCacheReturn {
  const queryClient = useQueryClient();

  const addRoom = useCallback(
    (room: Room) => {
      queryClient.setQueryData<RoomsResponse>(["rooms"], (old) => {
        if (!old) return { rooms: [room] };
        // Avoid duplicates
        if (old.rooms.some((r) => r.id === room.id)) return old;
        return { rooms: [...old.rooms, room] };
      });
    },
    [queryClient]
  );

  const removeRoom = useCallback(
    (roomId: string) => {
      queryClient.setQueryData<RoomsResponse>(["rooms"], (old) => {
        if (!old) return { rooms: [] };
        return { rooms: old.rooms.filter((r) => r.id !== roomId) };
      });
    },
    [queryClient]
  );

  return { addRoom, removeRoom };
}
