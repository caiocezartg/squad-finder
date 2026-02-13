import { useState } from "react";
import { Dialog } from "@base-ui-components/react/dialog";
import * as motion from "motion/react-client";
import type { Game } from "@/types";

interface CreateRoomModalProps {
  games: Game[];
  onSubmit: (data: {
    name: string;
    gameId: string;
    maxPlayers?: number;
    discordLink: string;
  }) => void;
  isLoading?: boolean;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateRoomModal({
  games,
  onSubmit,
  isLoading,
  open,
  onOpenChange,
}: CreateRoomModalProps) {
  const [roomName, setRoomName] = useState("");
  const [selectedGameId, setSelectedGameId] = useState("");
  const [maxPlayers, setMaxPlayers] = useState<number | "">("");
  const [discordLink, setDiscordLink] = useState("");

  const selectedGame = games.find((g) => g.id === selectedGameId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!roomName || !selectedGameId || !discordLink) return;

    const data: {
      name: string;
      gameId: string;
      maxPlayers?: number;
      discordLink: string;
    } = {
      name: roomName,
      gameId: selectedGameId,
      discordLink,
    };

    if (maxPlayers) data.maxPlayers = maxPlayers;

    onSubmit(data);
  };

  const resetForm = () => {
    setRoomName("");
    setSelectedGameId("");
    setMaxPlayers("");
    setDiscordLink("");
  };

  return (
    <Dialog.Root
      open={open}
      onOpenChange={(isOpen) => {
        onOpenChange(isOpen);
        if (!isOpen) resetForm();
      }}
    >
      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm" />
        <Dialog.Popup className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            className="w-full max-w-lg rounded-2xl border border-border bg-surface p-0 shadow-2xl shadow-black/50"
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.2 }}
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-border px-6 py-4">
              <Dialog.Title className="font-heading text-lg font-bold">
                Create a Room
              </Dialog.Title>
              <Dialog.Close className="size-8 rounded-lg flex items-center justify-center text-muted hover:text-offwhite hover:bg-surface-hover transition-colors">
                <svg
                  className="size-5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </Dialog.Close>
            </div>

            {/* Body */}
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              {/* Room Name */}
              <div>
                <label
                  htmlFor="modal-roomName"
                  className="block text-sm font-medium text-offwhite mb-1.5"
                >
                  Room Name
                </label>
                <input
                  type="text"
                  id="modal-roomName"
                  value={roomName}
                  onChange={(e) => setRoomName(e.target.value)}
                  className="input-field"
                  placeholder="e.g. Ranked grind tonight"
                  required
                  maxLength={100}
                />
              </div>

              {/* Game Select */}
              <div>
                <label
                  htmlFor="modal-game"
                  className="block text-sm font-medium text-offwhite mb-1.5"
                >
                  Game
                </label>
                <select
                  id="modal-game"
                  value={selectedGameId}
                  onChange={(e) => setSelectedGameId(e.target.value)}
                  className="input-field"
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

              {/* Max Players */}
              <div>
                <label
                  htmlFor="modal-maxPlayers"
                  className="block text-sm font-medium text-offwhite mb-1.5"
                >
                  Max Players{" "}
                  <span className="text-muted font-normal">
                    (defaults to {selectedGame?.maxPlayers ?? "game max"})
                  </span>
                </label>
                <input
                  type="number"
                  id="modal-maxPlayers"
                  value={maxPlayers}
                  onChange={(e) =>
                    setMaxPlayers(e.target.value ? parseInt(e.target.value) : "")
                  }
                  className="input-field"
                  min={2}
                  max={20}
                  placeholder={selectedGame?.maxPlayers?.toString() ?? "5"}
                />
              </div>

              {/* Discord Link */}
              <div>
                <label
                  htmlFor="modal-discordLink"
                  className="block text-sm font-medium text-offwhite mb-1.5"
                >
                  Discord Invite Link
                </label>
                <input
                  type="url"
                  id="modal-discordLink"
                  value={discordLink}
                  onChange={(e) => setDiscordLink(e.target.value)}
                  className="input-field"
                  placeholder="https://discord.gg/..."
                  required
                />
                <p className="mt-1 text-xs text-muted">
                  Shared with all players when the room is full.
                </p>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={isLoading || !roomName || !selectedGameId || !discordLink}
                className="btn-accent w-full py-3 mt-2"
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <svg
                      className="size-4 animate-spin"
                      viewBox="0 0 24 24"
                      fill="none"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                      />
                    </svg>
                    Creating...
                  </span>
                ) : (
                  "Create Room"
                )}
              </button>
            </form>
          </motion.div>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
