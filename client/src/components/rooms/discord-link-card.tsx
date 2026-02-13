import { useState } from "react";
import * as motion from "motion/react-client";

interface DiscordLinkCardProps {
  discordLink: string;
  isRoomReady: boolean;
}

export function DiscordLinkCard({
  discordLink,
  isRoomReady,
}: DiscordLinkCardProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(discordLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isValidDiscordLink =
    discordLink.startsWith("https://discord.gg/") ||
    discordLink.startsWith("https://discord.com/invite/");

  if (!isRoomReady || !isValidDiscordLink) return null;

  return (
    <motion.div
      className="rounded-xl border border-discord/30 bg-discord/5 p-5"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="flex items-start gap-3">
        <div className="size-10 rounded-xl bg-discord/10 border border-discord/20 flex items-center justify-center shrink-0">
          <svg className="size-5 text-discord" fill="currentColor" viewBox="0 0 24 24">
            <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128c.126-.094.252-.192.373-.292a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03z" />
          </svg>
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="font-heading text-sm font-bold text-offwhite">
            Discord Invite
          </h3>
          <p className="text-xs text-muted mt-0.5 mb-3">
            Room is full! Join the Discord server to start playing.
          </p>

          <div className="flex items-center gap-2">
            <code className="flex-1 min-w-0 rounded-lg bg-surface border border-border px-3 py-2 text-xs text-offwhite truncate font-mono">
              {discordLink}
            </code>
            <button
              onClick={handleCopy}
              className="shrink-0 rounded-lg bg-discord/10 border border-discord/20 px-3 py-2 text-xs font-medium text-discord hover:bg-discord/20 transition-colors"
            >
              {copied ? "Copied!" : "Copy"}
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
