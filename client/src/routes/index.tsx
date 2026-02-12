import { createFileRoute } from '@tanstack/react-router'
import { HeroSection } from '@/components/landing/hero-section'
import { HowItWorks } from '@/components/landing/how-it-works'
import { PopularGames } from '@/components/landing/popular-games'
import { FAQSection } from '@/components/landing/faq-section'
import { CTABanner } from '@/components/landing/cta-banner'

export const Route = createFileRoute('/')({
  component: HomePage,
})

function HomePage() {
  return (
    <>
      <HeroSection />
      <PopularGames />
      <HowItWorks />
      <FAQSection />
      <CTABanner />

      {/* Footer for landing page */}
      <footer className="border-t border-border/50 py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <span className="font-heading text-sm font-bold text-muted">
              Squad<span className="text-accent">Finder</span>
            </span>
            <p className="text-xs text-muted/60">
              &copy; {new Date().getFullYear()} SquadFinder. Built for gamers.
            </p>
          </div>
        </div>
      </footer>
    </>
  )
}
