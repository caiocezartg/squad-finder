import * as motion from 'motion/react-client'
import { Accordion } from '@base-ui-components/react/accordion'
import { Plus } from 'lucide-react'

const FAQ_ITEMS = [
  {
    question: 'Is SquadFinder free?',
    answer:
      'Yes, 100% free. No credit card required, no premium plans. Just sign in with your Discord account and start playing.',
  },
  {
    question: 'Do I need to create an account?',
    answer:
      'You sign in with your Discord account in one click — no forms, no extra passwords. Your Discord avatar and username are your identity on SquadFinder.',
  },
  {
    question: 'How many rooms can I create?',
    answer:
      'There is no limit. You can create as many rooms as you want, for any game available on the platform.',
  },
  {
    question: 'When is the Discord link shared?',
    answer:
      'The Discord server invite is shared as soon as the room reaches its max player count. When the last slot is filled, all members get access to the invite link.',
  },
  {
    question: 'What happens if the host leaves?',
    answer:
      'If the room creator leaves, the room is closed and all members are removed. Regular members can leave without affecting the room.',
  },
  {
    question: 'Can I choose the number of players?',
    answer:
      "Yes. By default, the player count matches the selected game's max players, but you can customize it between 2 and 20 when creating a room.",
  },
  {
    question: 'What games are supported?',
    answer:
      'We currently support 19 popular games including League of Legends, Valorant, CS2, Dota 2, Fortnite, Overwatch 2, and more. The list is constantly updated.',
  },
  {
    question: 'Can I join a room by code?',
    answer:
      'Yes. Every room has a unique 6-character code that can be shared. Just enter the code to join the room directly.',
  },
] as const

export function FAQSection() {
  return (
    <section className="relative py-24 border-t border-border/50">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.5 }}
        >
          <span className="section-label">FAQ</span>
          <h2 className="mt-3 font-heading text-3xl font-bold sm:text-4xl">
            Frequently Asked Questions
          </h2>
          <p className="mt-3 text-muted">Everything you need to know before building your squad.</p>
        </motion.div>

        <Accordion.Root className="space-y-2">
          {FAQ_ITEMS.map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.35, delay: i * 0.05 }}
            >
              <Accordion.Item className="group/item rounded-xl border border-border bg-surface/50 transition-colors duration-200 data-[panel-open]:border-accent/20 data-[panel-open]:bg-surface hover:border-border-light">
                <Accordion.Header>
                  <Accordion.Trigger className="group flex w-full items-center justify-between gap-4 px-5 py-4 text-left">
                    <span className="text-sm font-semibold text-offwhite sm:text-base">
                      {item.question}
                    </span>
                    <Plus className="size-5 shrink-0 text-muted transition-all duration-200 group-data-[panel-open]:rotate-45 group-data-[panel-open]:text-accent" />
                  </Accordion.Trigger>
                </Accordion.Header>
                <Accordion.Panel className="h-[var(--accordion-panel-height)] overflow-hidden transition-[height] duration-200 ease-out data-[ending-style]:h-0 data-[starting-style]:h-0">
                  <p className="px-5 pb-4 text-sm leading-relaxed text-muted">{item.answer}</p>
                </Accordion.Panel>
              </Accordion.Item>
            </motion.div>
          ))}
        </Accordion.Root>
      </div>
    </section>
  )
}
