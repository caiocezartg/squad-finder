import { useState } from "react";
import type { Game } from "@/types";

interface CreateRoomFormProps {
  games: Game[];
  onSubmit: (data: { name: string; gameId: string; maxPlayers?: number }) => void;
  isLoading?: boolean;
}

export function CreateRoomForm({ games, onSubmit, isLoading }: CreateRoomFormProps) {
  const [roomName, setRoomName] = useState("");
  const [selectedGameId, setSelectedGameId] = useState("");
  const [maxPlayers, setMaxPlayers] = useState<number | "">("");

  const selectedGame = games.find((g) => g.id === selectedGameId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!roomName || !selectedGameId) return;

    const data: { name: string; gameId: string; maxPlayers?: number } = {
      name: roomName,
      gameId: selectedGameId,
    };

    if (maxPlayers) {
      data.maxPlayers = maxPlayers;
    }

    onSubmit(data);
  };

  return (
    <div className="bg-white shadow rounded-lg p-6 mb-8">
      <h2 className="text-xl font-semibold mb-4">Create a Room</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="roomName" className="block text-sm font-medium text-gray-700">
            Room Name
          </label>
          <input
            type="text"
            id="roomName"
            value={roomName}
            onChange={(e) => setRoomName(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 px-3 py-2 border"
            placeholder="My awesome room"
            required
          />
        </div>

        <div>
          <label htmlFor="game" className="block text-sm font-medium text-gray-700">
            Game
          </label>
          <select
            id="game"
            value={selectedGameId}
            onChange={(e) => setSelectedGameId(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 px-3 py-2 border"
            required
          >
            <option value="">Select a game</option>
            {games.map((game) => (
              <option key={game.id} value={game.id}>
                {game.name} ({game.minPlayers}-{game.maxPlayers} players)
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="maxPlayers" className="block text-sm font-medium text-gray-700">
            Max Players (optional, defaults to game max: {selectedGame?.maxPlayers ?? "?"})
          </label>
          <input
            type="number"
            id="maxPlayers"
            value={maxPlayers}
            onChange={(e) => setMaxPlayers(e.target.value ? parseInt(e.target.value) : "")}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 px-3 py-2 border"
            min={2}
            max={20}
            placeholder={selectedGame?.maxPlayers?.toString() ?? ""}
          />
        </div>

        <button
          type="submit"
          disabled={isLoading || !roomName || !selectedGameId}
          className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? "Creating..." : "Create Room"}
        </button>
      </form>
    </div>
  );
}
