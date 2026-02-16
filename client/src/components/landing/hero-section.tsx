import { Link } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { signIn, useSession } from '@/lib/auth-client'
import { api } from '@/lib/api'
import * as motion from 'motion/react-client'
import type { GamesResponse } from '@/types'
import { Search } from 'lucide-react'
import { DiscordIcon } from '@/components/ui/icons'
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
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            {gameCount > 0 && (
              <span className="inline-flex items-center gap-2 rounded-full bg-accent/5 border border-accent/15 px-4 py-1.5 text-xs font-semibold text-accent mb-2">
                <span className="size-1.5 rounded-full bg-accent animate-pulse" />
                {gameCount} GAMES SUPPORTED
              </span>
            )}
          </motion.div>

          <motion.h1
            className="font-heading text-5xl font-extrabold leading-[0.95] tracking-tight sm:text-6xl lg:text-7xl xl:text-8xl"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            STOP PLAYING
            <br />
            GAMES&nbsp;
            <span className="relative text-accent">
              ALONE
              <motion.span
                className="absolute bottom-0 left-0 h-[3px] bg-accent/60 rounded-full"
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
            <Link to="/rooms" className="btn-accent gap-2 text-base px-7 py-3 w-full md:w-auto">
              <Search className="size-5" strokeWidth={2.5} />
              Explore rooms
            </Link>
            {!session?.user && (
              <button
                onClick={handleSignIn}
                className="btn-discord gap-2 text-base px-7 py-3 w-full md:w-auto"
              >
                <DiscordIcon className="size-5" />
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
