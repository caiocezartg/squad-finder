import { createRootRoute, Link, Outlet, useMatches } from '@tanstack/react-router'
import { useSession, signIn, signOut } from '@/lib/auth-client'
import { useState } from 'react'
import { Users, ChevronDown, LogOut } from 'lucide-react'
import { DiscordIcon } from '@/components/ui/icons'
import { NotificationsMenu } from '@/components/layout/notifications-menu'

export const Route = createRootRoute({
  component: RootLayout,
})

function RootLayout() {
  const { data: session } = useSession()
  const [menuOpen, setMenuOpen] = useState(false)
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const matches = useMatches()
  const isLanding = matches.length > 0 && matches[matches.length - 1]?.fullPath === '/'

  const handleSignOut = async () => {
    await signOut()
    window.location.href = '/'
  }

  const handleSignIn = () => {
    signIn.social({
      provider: 'discord',
      callbackURL: window.location.origin + '/rooms',
    })
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-8">
            <Link to="/" className="flex items-center gap-2 group">
              <div className="size-8 rounded-lg bg-accent/10 border border-accent/20 flex items-center justify-center group-hover:bg-accent/20 transition-colors">
                <Users className="size-4 text-accent" />
              </div>
              <span className="font-heading text-lg font-bold text-offwhite">
                Squad<span className="text-accent">Finder</span>
              </span>
            </Link>

            <nav className="hidden md:flex items-center gap-1">
              <Link
                to="/rooms"
                className="px-3 py-2 text-sm font-medium text-muted hover:text-offwhite transition-colors rounded-lg hover:bg-surface-hover"
              >
                ALL ROOMS
              </Link>
              {session?.user && (
                <Link
                  to="/rooms/my"
                  className="px-3 py-2 text-sm font-medium text-muted hover:text-offwhite transition-colors rounded-lg hover:bg-surface-hover"
                >
                  MY ROOMS
                </Link>
              )}
            </nav>
          </div>

          <div className="flex items-center gap-3">
            {session?.user ? (
              <>
                {(menuOpen || notificationsOpen) && (
                  <button
                    type="button"
                    aria-label="Close menu"
                    className="fixed inset-0 z-40 cursor-default appearance-none border-none bg-transparent"
                    onClick={() => {
                      setMenuOpen(false)
                      setNotificationsOpen(false)
                    }}
                  />
                )}

                <NotificationsMenu
                  enabled={!!session?.user}
                  isOpen={notificationsOpen}
                  onToggle={() => {
                    setNotificationsOpen((prev) => !prev)
                    setMenuOpen(false)
                  }}
                  onClose={() => setNotificationsOpen(false)}
                />

                <div className="relative">
                  <button
                    onClick={() => {
                      setMenuOpen((prev) => !prev)
                      setNotificationsOpen(false)
                    }}
                    className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-surface-hover transition-colors"
                  >
                    {session.user.image ? (
                      <img
                        src={session.user.image}
                        alt=""
                        className="size-7 rounded-full ring-1 ring-border"
                      />
                    ) : (
                      <div className="size-7 rounded-full bg-accent/20 flex items-center justify-center text-xs font-bold text-accent">
                        {session.user.name?.charAt(0)?.toUpperCase()}
                      </div>
                    )}
                    <span className="hidden sm:block text-sm font-medium text-offwhite">
                      {session.user.name}
                    </span>
                    <ChevronDown className="size-4 text-muted" />
                  </button>

                  {menuOpen && (
                    <div className="absolute right-0 top-full mt-2 z-50 w-48 rounded-xl border border-border bg-surface p-1 shadow-2xl shadow-black/50">
                      <div className="px-3 py-2 border-b border-border mb-1">
                        <p className="text-xs text-muted truncate">{session.user.email}</p>
                      </div>
                      <button
                        onClick={() => {
                          setMenuOpen(false)
                          handleSignOut()
                        }}
                        className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-muted hover:text-offwhite hover:bg-surface-hover transition-colors"
                      >
                        <LogOut className="size-4" />
                        Sign Out
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <button onClick={handleSignIn} className="btn-discord gap-2">
                <DiscordIcon className="size-4" />
                Sign In
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      {!isLanding && (
        <footer className="border-t border-border/50 py-6">
          <div className="mx-auto max-w-7xl px-4 text-center text-xs text-muted sm:px-6 lg:px-8">
            SquadFinder &mdash; Find your gaming squad
          </div>
        </footer>
      )}
    </div>
  )
}
