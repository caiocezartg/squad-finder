import { useState } from 'react'
import * as motion from 'motion/react-client'
import { DiscordIcon } from '@/components/ui/icons'

interface DiscordLinkCardProps {
  discordLink: string
  isRoomReady: boolean
}

export function DiscordLinkCard({ discordLink, isRoomReady }: DiscordLinkCardProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(discordLink)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const isValidDiscordLink =
    discordLink.startsWith('https://discord.gg/') ||
    discordLink.startsWith('https://discord.com/invite/')

  if (!isRoomReady || !isValidDiscordLink) return null

  return (
    <motion.div
      className="rounded-xl border border-discord/30 bg-discord/5 p-5"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="flex items-start gap-3">
        <div className="size-10 rounded-xl bg-discord/10 border border-discord/20 flex items-center justify-center shrink-0">
          <DiscordIcon className="size-5 text-discord" />
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="font-heading text-sm font-bold text-offwhite">Discord Invite</h3>
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
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
