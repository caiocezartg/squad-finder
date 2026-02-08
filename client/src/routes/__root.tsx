import { createRootRoute, Link, Outlet } from "@tanstack/react-router";
import { useSession, signOut } from "@/lib/auth-client";

export const Route = createRootRoute({
  component: RootLayout,
});

function RootLayout() {
  const { data: session } = useSession();

  const handleSignOut = async () => {
    await signOut();
    window.location.href = "/";
  };

  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-6">
            <Link to="/" className="text-xl font-bold text-indigo-600">
              SquadFinder
            </Link>
            {session?.user && (
              <Link to="/rooms" className="text-gray-600 hover:text-gray-900 font-medium">
                Rooms
              </Link>
            )}
          </div>
          <nav className="flex items-center gap-4">
            {session?.user ? (
              <>
                <span className="text-sm text-gray-600">{session.user.name}</span>
                {session.user.image && (
                  <img src={session.user.image} alt="Avatar" className="w-8 h-8 rounded-full" />
                )}
                <button
                  onClick={handleSignOut}
                  className="text-sm text-gray-600 hover:text-gray-900"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <Link to="/" className="text-sm text-gray-600 hover:text-gray-900">
                Sign In
              </Link>
            )}
          </nav>
        </div>
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="border-t border-gray-200 bg-white py-4">
        <div className="mx-auto max-w-7xl px-4 text-center text-sm text-gray-500 sm:px-6 lg:px-8">
          SquadFinder - Find your gaming squad
        </div>
      </footer>
    </div>
  );
}
