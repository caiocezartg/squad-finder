import * as motion from 'motion/react-client'

const DISCORD_PATH =
  'M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128c.126-.094.252-.192.373-.292a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03z'

/* ─── Illustration: Step 1 — Discord Sign In ─── */

function DiscordClickIllustration() {
  return (
    <div className="relative h-32 sm:h-40 flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(88,101,242,0.06),transparent_70%)]" />

      {/* Discord button */}
      <motion.div
        className="relative z-10 flex items-center gap-2 rounded-lg bg-discord px-4 py-2 text-xs font-semibold text-white shadow-lg shadow-discord/20"
        whileInView={{ scale: [1, 1, 0.93, 1, 1] }}
        viewport={{ once: true }}
        transition={{ duration: 2.2, times: [0, 0.45, 0.5, 0.55, 1] }}
      >
        <svg className="size-3.5" fill="currentColor" viewBox="0 0 24 24">
          <path d={DISCORD_PATH} />
        </svg>
        Sign in
      </motion.div>

      {/* Animated cursor */}
      <motion.svg
        className="absolute z-20 size-5 drop-shadow-md"
        viewBox="0 0 24 24"
        fill="#F0F0F0"
        style={{ top: '50%', left: '50%' }}
        initial={{ x: 50, y: -30, opacity: 0 }}
        whileInView={{
          x: [50, 12, 12, 12],
          y: [-30, 4, 4, 4],
          opacity: [0, 1, 1, 0],
        }}
        viewport={{ once: true }}
        transition={{ duration: 2.2, times: [0, 0.4, 0.65, 0.82] }}
      >
        <path d="M6 2L6 18L10.5 13.5L14 21L16 20L12.5 12.5L18 12.5L6 2Z" />
      </motion.svg>

      {/* Click ripple */}
      <motion.div
        className="absolute z-0 size-3 rounded-full bg-discord/30"
        initial={{ scale: 0, opacity: 0 }}
        whileInView={{ scale: [0, 8], opacity: [0.6, 0] }}
        viewport={{ once: true }}
        transition={{ delay: 1, duration: 0.6, ease: 'easeOut' }}
      />

      {/* Success checkmark */}
      <motion.div
        className="absolute top-3 right-4 z-10 size-6 rounded-full bg-accent/15 flex items-center justify-center"
        initial={{ scale: 0, opacity: 0 }}
        whileInView={{ scale: 1, opacity: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 1.4, duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
      >
        <svg
          className="size-3 text-accent"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="20 6 9 17 4 12" />
        </svg>
      </motion.div>
    </div>
  )
}

/* ─── Illustration: Step 2 — Browse Rooms ─── */

function RoomBrowseIllustration() {
  const rooms = [
    { color: 'bg-red-500/50', name: 'Valorant 5v5', players: '3/5' },
    { color: 'bg-blue-500/50', name: 'LoL Ranked', players: '2/5' },
    { color: 'bg-amber-500/50', name: 'CS2 Comp', players: '4/5' },
  ]

  return (
    <div className="relative h-32 sm:h-40 flex flex-col items-center justify-center gap-1.5 overflow-hidden px-5 sm:px-8">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(0,255,162,0.04),transparent_70%)]" />

      {rooms.map((room, i) => (
        <motion.div
          key={i}
          className={`relative z-10 w-full flex items-center gap-2.5 rounded-lg border px-3 py-1.5 text-[10px] ${
            i === 2
              ? 'border-accent/25 bg-accent/5'
              : 'border-border bg-surface/80'
          }`}
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 + i * 0.15, duration: 0.35 }}
        >
          <div className={`size-4 rounded shrink-0 ${room.color}`} />
          <span className="text-offwhite/80 font-medium truncate">
            {room.name}
          </span>
          <span className="ml-auto text-muted shrink-0">{room.players}</span>
        </motion.div>
      ))}

      {/* Cursor near selected card */}
      <motion.svg
        className="absolute z-20 size-4 drop-shadow right-5 sm:right-8 bottom-5 sm:bottom-7"
        viewBox="0 0 24 24"
        fill="rgba(240,240,240,0.7)"
        initial={{ opacity: 0, x: 16 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.9, duration: 0.4 }}
      >
        <path d="M6 2L6 18L10.5 13.5L14 21L16 20L12.5 12.5L18 12.5L6 2Z" />
      </motion.svg>
    </div>
  )
}

/* ─── Illustration: Step 3 — Squad Fill ─── */

function SquadFillIllustration() {
  const totalSlots = 5

  return (
    <div className="relative h-32 sm:h-40 flex flex-col items-center justify-center gap-3 sm:gap-4 overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_80%,rgba(0,255,162,0.05),transparent_60%)]" />

      {/* Player slots */}
      <div className="relative z-10 flex items-center gap-1.5 sm:gap-2">
        {Array.from({ length: totalSlots }).map((_, i) => (
          <motion.div
            key={i}
            className="size-7 sm:size-9 rounded-full border-2 flex items-center justify-center"
            initial={{
              borderColor: 'rgba(42, 42, 47, 1)',
              backgroundColor: 'transparent',
            }}
            whileInView={{
              borderColor: [
                'rgba(42, 42, 47, 1)',
                'rgba(0, 255, 162, 0.4)',
              ],
              backgroundColor: ['transparent', 'rgba(0, 255, 162, 0.1)'],
            }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 + i * 0.3, duration: 0.3 }}
          >
            <motion.svg
              className="size-3 sm:size-3.5 text-accent"
              viewBox="0 0 24 24"
              fill="currentColor"
              initial={{ opacity: 0, scale: 0.5 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.5 + i * 0.3, duration: 0.2 }}
            >
              <circle cx="12" cy="8" r="4" />
              <path d="M20 21a8 8 0 0 0-16 0" />
            </motion.svg>
          </motion.div>
        ))}
      </div>

      {/* "Discord link ready" badge */}
      <motion.div
        className="relative z-10 flex items-center gap-1.5 rounded-full bg-accent/10 border border-accent/20 px-3 py-1 text-[10px] font-semibold text-accent"
        initial={{ opacity: 0, y: 8 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 2.1, duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
      >
        <svg
          className="size-3"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
          <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
        </svg>
        Discord link ready
      </motion.div>
    </div>
  )
}

/* ─── Steps Data ─── */

const steps = [
  {
    number: 1,
    title: 'Sign In with Discord',
    description:
      'One click. No forms, no passwords. Your Discord avatar is your identity.',
    Illustration: DiscordClickIllustration,
  },
  {
    number: 2,
    title: 'Find or Create a Room',
    description:
      'Browse rooms by game or spin up your own with a Discord invite link.',
    Illustration: RoomBrowseIllustration,
  },
  {
    number: 3,
    title: 'Squad Up & Play',
    description:
      'Room fills up, Discord link unlocks. Join voice and dominate together.',
    Illustration: SquadFillIllustration,
  },
]

/* ─── Main Component ─── */

export function HowItWorks() {
  return (
    <section className="relative py-24 border-t border-border/50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.5 }}
        >
          <span className="section-label">How It Works</span>
          <h2 className="mt-3 font-heading text-3xl font-bold sm:text-4xl">
            From login to full squad in under a minute.
          </h2>
        </motion.div>

        {/* Desktop: horizontal timeline + cards */}
        <div className="hidden md:block">
          <div className="relative">
            {/* Connector line */}
            <motion.div
              className="absolute top-5 left-[calc(16.666%)] right-[calc(16.666%)] h-[2px] bg-border-light origin-left"
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.8, delay: 0.2, ease: 'easeOut' }}
            />

            <div className="grid grid-cols-3 gap-8">
              {steps.map((step, i) => (
                <div
                  key={step.number}
                  className="flex flex-col items-center"
                >
                  {/* Circle on the line */}
                  <motion.div
                    className="relative z-10 size-10 rounded-full bg-accent text-background flex items-center justify-center font-heading text-sm font-extrabold shadow-[0_0_20px_rgba(0,255,162,0.25)]"
                    initial={{ opacity: 0, scale: 0 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true, margin: '-80px' }}
                    transition={{
                      duration: 0.4,
                      delay: 0.3 + i * 0.2,
                      ease: [0.23, 1, 0.32, 1],
                    }}
                  >
                    {step.number}
                  </motion.div>

                  {/* Card */}
                  <motion.div
                    className="mt-6 w-full rounded-2xl border border-border bg-surface overflow-hidden"
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: '-50px' }}
                    transition={{ duration: 0.5, delay: 0.5 + i * 0.2 }}
                  >
                    <div className="border-b border-border/50 bg-background/50">
                      <step.Illustration />
                    </div>
                    <div className="p-5">
                      <h3 className="font-heading text-base font-bold mb-1.5">
                        {step.title}
                      </h3>
                      <p className="text-sm text-muted leading-relaxed">
                        {step.description}
                      </p>
                    </div>
                  </motion.div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Mobile: vertical timeline + cards */}
        <div className="md:hidden">
          <div className="relative pl-10">
            {/* Vertical line */}
            <motion.div
              className="absolute left-[15px] top-0 bottom-0 w-[2px] bg-border-light origin-top"
              initial={{ scaleY: 0 }}
              whileInView={{ scaleY: 1 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.8, delay: 0.2, ease: 'easeOut' }}
            />

            <div className="space-y-10">
              {steps.map((step, i) => (
                <div key={step.number} className="relative">
                  {/* Circle on the vertical line */}
                  <motion.div
                    className="absolute -left-10 top-0 z-10 size-8 rounded-full bg-accent text-background flex items-center justify-center font-heading text-xs font-extrabold shadow-[0_0_16px_rgba(0,255,162,0.2)]"
                    initial={{ opacity: 0, scale: 0 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true, margin: '-50px' }}
                    transition={{
                      duration: 0.4,
                      delay: 0.3 + i * 0.15,
                      ease: [0.23, 1, 0.32, 1],
                    }}
                  >
                    {step.number}
                  </motion.div>

                  {/* Card */}
                  <motion.div
                    className="rounded-2xl border border-border bg-surface overflow-hidden"
                    initial={{ opacity: 0, x: 16 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, margin: '-50px' }}
                    transition={{ duration: 0.5, delay: 0.4 + i * 0.15 }}
                  >
                    <div className="border-b border-border/50 bg-background/50">
                      <step.Illustration />
                    </div>
                    <div className="p-4">
                      <h3 className="font-heading text-base font-bold mb-1">
                        {step.title}
                      </h3>
                      <p className="text-sm text-muted leading-relaxed">
                        {step.description}
                      </p>
                    </div>
                  </motion.div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
