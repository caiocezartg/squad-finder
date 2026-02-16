import { Dialog } from '@base-ui-components/react/dialog'
import * as motion from 'motion/react-client'
import { X } from 'lucide-react'
import { DiscordIcon } from '@/components/ui/icons'

interface JoinRoomAuthModalProps {
  open: boolean
  roomCode: string | null
  onOpenChange: (open: boolean) => void
  onSignIn: () => void
}

export function JoinRoomAuthModal({
  open,
  roomCode,
  onOpenChange,
  onSignIn,
}: JoinRoomAuthModalProps) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm" />
        <Dialog.Popup className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            className="w-full max-w-xl rounded-2xl border border-border bg-surface shadow-2xl shadow-black/50"
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div className="flex items-center justify-between border-b border-border px-6 py-4">
              <Dialog.Title className="font-heading text-lg font-bold">
                Sign in required
              </Dialog.Title>
              <Dialog.Close className="size-8 rounded-lg flex items-center justify-center text-muted hover:text-offwhite hover:bg-surface-hover transition-colors">
                <X className="size-5" />
              </Dialog.Close>
            </div>

            <div className="px-6 py-6">
              <p className="text-sm leading-relaxed text-offwhite">
                You can explore rooms list as a guest, but joining a room and viewing full details
                requires signing in with Discord.
              </p>
              {roomCode && (
                <p className="mt-3 text-sm text-muted">
                  Room you are trying to join:{' '}
                  <span className="font-mono font-semibold text-offwhite">{roomCode}</span>
                </p>
              )}

              <div className="mt-6 flex flex-col gap-2 sm:flex-row">
                <Dialog.Close className="btn-ghost h-11 flex-1 justify-center">
                  Maybe later
                </Dialog.Close>
                <button onClick={onSignIn} className="btn-discord h-11 flex-1 justify-center gap-2">
                  <DiscordIcon className="size-4" />
                  Continue with Discord
                </button>
              </div>
            </div>
          </motion.div>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
