import type { Room, Game } from "@/types";

interface RoomCardProps {
  room: Room;
  game: Game | undefined;
  onJoin: (roomCode: string) => void;
  isLoading?: boolean;
}

export function RoomCard({ room, game, onJoin, isLoading }: RoomCardProps) {
  return (
    <div className="border rounded-lg p-4 flex items-center justify-between">
      <div>
        <h3 className="font-semibold">{room.name}</h3>
        <p className="text-sm text-gray-500">
          {game?.name ?? "Unknown game"} | Code: {room.code} | Max: {room.maxPlayers}
        </p>
      </div>
      <button
        onClick={() => onJoin(room.code)}
        disabled={isLoading}
        className="btn-primary disabled:opacity-50"
      >
        Join
      </button>
    </div>
  );
}
