import { Link } from '@tanstack/react-router'
import { signIn, useSession } from '@/lib/auth-client'
import * as motion from 'motion/react-client'
import { DiscordIcon } from '@/components/ui/icons'

export function CTABanner() {
  const { data: session } = useSession()

  const handleSignIn = () => {
    signIn.social({
      provider: 'discord',
      callbackURL: window.location.origin + '/rooms',
    })
  }

  return (
    <section className="relative py-24 border-t border-border/50">
      {/* Background glow */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-[500px] h-[300px] bg-accent/5 rounded-full blur-[100px]" />
      </div>

      <motion.div
        className="relative mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 text-center"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-100px' }}
        transition={{ duration: 0.5 }}
      >
        <h2 className="font-heading text-3xl font-bold sm:text-5xl">
          Ready to find your <span className="text-accent">squad</span>?
        </h2>
        <p className="mt-4 text-muted text-lg max-w-xl mx-auto">
          Join hundreds of players already using SquadFinder to build the perfect team.
        </p>

        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link to="/rooms" className="btn-accent gap-2 text-base px-8 py-3">
            Browse Rooms
          </Link>
          {!session?.user && (
            <button onClick={handleSignIn} className="btn-ghost gap-2 text-base px-8 py-3">
              <DiscordIcon className="size-5" />
              Create Account
            </button>
          )}
        </div>
      </motion.div>
    </section>
  )
}
