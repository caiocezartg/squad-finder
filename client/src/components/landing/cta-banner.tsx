import { Link } from "@tanstack/react-router";
import { signIn, useSession } from "@/lib/auth-client";
import * as motion from "motion/react-client";

export function CTABanner() {
  const { data: session } = useSession();

  const handleSignIn = () => {
    signIn.social({
      provider: "discord",
      callbackURL: window.location.origin + "/rooms",
    });
  };

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
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.5 }}
      >
        <h2 className="font-heading text-3xl font-bold sm:text-5xl">
          Ready to Find Your{" "}
          <span className="text-accent">Squad</span>?
        </h2>
        <p className="mt-4 text-muted text-lg max-w-xl mx-auto">
          Join hundreds of players already using SquadFinder to build the
          perfect team.
        </p>

        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link to="/rooms" className="btn-accent gap-2 text-base px-8 py-3">
            Browse Rooms
          </Link>
          {!session?.user && (
            <button
              onClick={handleSignIn}
              className="btn-ghost gap-2 text-base px-8 py-3"
            >
              <svg
                className="size-5"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128c.126-.094.252-.192.373-.292a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03z" />
              </svg>
              Create Account
            </button>
          )}
        </div>

        <p className="mt-6 text-xs text-muted/60">
          Free forever. No credit card required.
        </p>
      </motion.div>
    </section>
  );
}
