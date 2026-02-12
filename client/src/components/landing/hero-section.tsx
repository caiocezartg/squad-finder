import { Link } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { signIn, useSession } from '@/lib/auth-client'
import { api } from '@/lib/api'
import * as motion from 'motion/react-client'
import type { GamesResponse } from '@/types'
import { BackgroundRipple } from './background-ripple'

export function HeroSection() {
  const { data: session } = useSession()

  const { data: gamesData } = useQuery({
    queryKey: ['games'],
    queryFn: () => api.get<GamesResponse>('/api/games'),
    staleTime: 60_000,
  })

  const gameCount = gamesData?.games?.length ?? 0

  const handleSignIn = () => {
    signIn.social({
      provider: 'discord',
      callbackURL: window.location.origin + '/rooms',
    })
  }

  return (
    <section className="relative overflow-hidden">
      <BackgroundRipple />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_80%_50%,rgba(0,255,162,0.06),transparent_55%)] pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_20%_80%,rgba(88,101,242,0.04),transparent_50%)] pointer-events-none" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-20 sm:pt-28 sm:pb-24">
        <div className="max-w-full flex flex-col items-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4 }}
          >
            {gameCount > 0 && (
              <span className="inline-flex items-center gap-2 rounded-full bg-accent/5 border border-accent/15 px-4 py-1.5 text-xs font-semibold text-accent mb-6">
                <span className="size-1.5 rounded-full bg-accent animate-pulse" />
                {gameCount} GAMES SUPPORTED
              </span>
            )}
          </motion.div>

          <motion.h1
            className="font-heading text-5xl font-extrabold leading-[0.95] tracking-tight sm:text-6xl lg:text-7xl xl:text-9xl"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            STOP PLAYING
            <br />
            GAMES&nbsp;
            <span className="relative">
              <span className="text-accent">ALONE</span>
              <motion.span
                className="absolute bottom-3 left-0 h-[3px] bg-accent/60 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: '100%' }}
                transition={{ duration: 0.6, delay: 0.7, ease: 'easeOut' }}
              />
            </span>
          </motion.h1>

          <motion.p
            className="mt-6 text-base text-muted leading-relaxed sm:text-lg max-w-md text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <strong className="text-offwhite">Create</strong> or{' '}
            <strong className="text-offwhite">join rooms</strong>, fill your squad, and get a
            Discord invite the second your team is ready.
          </motion.p>

          {/* CTAs */}
          <motion.div
            className="mt-8 flex flex-col sm:flex-row items-start gap-3"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.45 }}
          >
            <Link to="/rooms" className="btn-accent gap-2 text-base px-7 py-3">
              <svg
                className="size-5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
              >
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              Explore rooms
            </Link>
            {!session?.user && (
              <button onClick={handleSignIn} className="btn-discord gap-2 text-base px-7 py-3">
                <svg className="size-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
                </svg>
                Sign in with Discord
              </button>
            )}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.45 }}
            className="relative max-w-4xl rounded-xl overflow-hidden mt-12 -mb-8"
          >
            <img src="rooms_lp.png" alt="Demonstration of all rooms" className="w-full h-auto" />
          </motion.div>
        </div>
      </div>

      <div className="absolute inset-x-0 bottom-0 h-20 lg:h-[400px] bg-gradient-to-t from-background/100 to-transparent pointer-events-none" />
    </section>
  )
}
