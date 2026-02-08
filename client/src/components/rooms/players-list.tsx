import type { Player } from "@/types";

interface PlayersListProps {
  players: Player[];
  maxPlayers: number | undefined;
}

export function PlayersList({ players, maxPlayers }: PlayersListProps) {
  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-xl font-semibold mb-4">
        Players ({players.length}/{maxPlayers ?? "?"})
      </h2>
      {players.length === 0 ? (
        <p className="text-gray-500">Waiting for players to connect...</p>
      ) : (
        <ul className="space-y-2">
          {players.map((player) => (
            <li
              key={player.id}
              className="flex items-center justify-between p-2 bg-gray-50 rounded"
            >
              <span className="font-medium">{player.name}</span>
              {player.isHost && (
                <span className="text-xs bg-yellow-200 text-yellow-800 px-2 py-1 rounded">
                  Host
                </span>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
