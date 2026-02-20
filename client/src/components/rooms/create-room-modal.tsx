import { useForm, Controller } from 'react-hook-form'
import { useState, useRef } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Dialog } from '@base-ui-components/react/dialog'
import { Select } from '@base-ui-components/react/select'
import * as motion from 'motion/react-client'
import { X, Loader2, ChevronsUpDown, Check } from 'lucide-react'
import { createRoomInputSchema } from '@squadfinder/schemas'
import { AlertBox } from '@/components/ui/alert-box'
import type { Game } from '@/types'
import type { CreateRoomInput } from '@squadfinder/schemas'

const formSchema = createRoomInputSchema.extend({
  gameId: z.uuid({ error: 'Please select a game' }),
})

type FormInput = z.input<typeof formSchema>
type FormValues = z.output<typeof formSchema>

interface CreateRoomModalProps {
  games: Game[]
  onSubmit: (data: CreateRoomInput) => Promise<unknown>
  isLoading?: boolean
  open: boolean
  onOpenChange: (open: boolean) => void
}

// ─── Tags Chip Input ──────────────────────────────────────────────────────────

interface TagsChipInputProps {
  value: string[]
  onChange: (tags: string[]) => void
  onBlur: () => void
  hasError: boolean
}

function TagsChipInput({ value: tags, onChange, onBlur, hasError }: TagsChipInputProps) {
  const [inputValue, setInputValue] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  const atLimit = tags.length >= 5

  const addTag = (raw: string) => {
    const tag = raw.replace(/^#+/, '').trim().toLowerCase()
    if (!tag || atLimit || tags.includes(tag)) return
    onChange([...tags, tag])
  }

  const removeTag = (index: number) => {
    onChange(tags.filter((_, i) => i !== index))
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      addTag(inputValue)
      setInputValue('')
    } else if (e.key === 'Backspace' && inputValue === '' && tags.length > 0) {
      removeTag(tags.length - 1)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    if (val.endsWith(',')) {
      addTag(val.slice(0, -1))
      setInputValue('')
    } else {
      setInputValue(val)
    }
  }

  return (
    <div
      className={`input-field flex flex-wrap gap-1.5 items-center min-h-[42px] cursor-text ${hasError ? 'border-danger/50 focus-within:border-danger/70 focus-within:ring-danger/20' : ''}`}
      onClick={() => inputRef.current?.focus()}
    >
      {tags.map((tag, index) => (
        <span
          key={index}
          className="bg-surface-light border border-border-light rounded-md px-2 py-0.5 text-xs text-offwhite flex items-center gap-1"
        >
          #{tag}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              removeTag(index)
            }}
            className="text-muted hover:text-offwhite ml-1 text-sm leading-none"
            aria-label={`Remove tag ${tag}`}
          >
            ×
          </button>
        </span>
      ))}
      {tags.length === 0 && inputValue === '' && (
        <span className="text-muted/60 text-sm pointer-events-none">type a tag...</span>
      )}
      {!atLimit && (
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onBlur={onBlur}
          maxLength={15}
          className="flex-1 min-w-[80px] bg-transparent text-sm text-offwhite outline-none placeholder:text-muted/60"
          placeholder={tags.length > 0 ? 'add more...' : ''}
          aria-label="Add tag"
        />
      )}
    </div>
  )
}

// ─── Create Room Modal ────────────────────────────────────────────────────────

export function CreateRoomModal({
  games,
  onSubmit,
  isLoading,
  open,
  onOpenChange,
}: CreateRoomModalProps) {
  const {
    register,
    handleSubmit,
    control,
    watch,
    reset,
    setError,
    clearErrors,
    formState: { errors },
  } = useForm<FormInput, unknown, FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      gameId: '',
      maxPlayers: undefined,
      discordLink: '',
      tags: [],
      language: 'pt-br',
    },
  })

  const selectedGameId = watch('gameId')
  const selectedGame = games.find((g) => g.id === selectedGameId)

  const onFormSubmit = handleSubmit(async (data) => {
    try {
      clearErrors('root')
      await onSubmit(data as unknown as CreateRoomInput)
    } catch (err) {
      setError('root', {
        message: err instanceof Error ? err.message : 'Failed to create room',
      })
    }
  })

  return (
    <Dialog.Root
      open={open}
      onOpenChange={(isOpen) => {
        onOpenChange(isOpen)
        if (!isOpen) reset()
      }}
    >
      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm" />
        <Dialog.Popup className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            className="w-full max-w-lg rounded-2xl border border-border bg-surface p-0 shadow-2xl shadow-black/50"
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.2 }}
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-border px-6 py-4">
              <Dialog.Title className="font-heading text-lg font-bold">Create a Room</Dialog.Title>
              <Dialog.Close className="size-8 rounded-lg flex items-center justify-center text-muted hover:text-offwhite hover:bg-surface-hover transition-colors">
                <X className="size-5" />
              </Dialog.Close>
            </div>

            {/* Body */}
            <form onSubmit={onFormSubmit} className="p-6 space-y-5">
              {/* Room Name */}
              <div>
                <label
                  htmlFor="modal-roomName"
                  className="block text-sm font-medium text-offwhite mb-1.5"
                >
                  Room Name
                </label>
                <input
                  type="text"
                  id="modal-roomName"
                  className={errors.name ? 'input-field-error' : 'input-field'}
                  placeholder="e.g. Ranked grind tonight"
                  maxLength={100}
                  {...register('name')}
                />
                {errors.name && <p className="field-error">{errors.name.message}</p>}
              </div>

              {/* Game Select */}
              <div>
                <label htmlFor="modal-gameId" className="block text-sm font-medium text-offwhite mb-1.5">Game</label>
                <Controller
                  name="gameId"
                  control={control}
                  render={({ field }) => (
                    <Select.Root
                      value={field.value || null}
                      onValueChange={(value) => {
                        field.onChange(value)
                      }}
                    >
                      <Select.Trigger
                        id="modal-gameId"
                        className={`flex h-[42px] w-full cursor-default items-center justify-between rounded-lg border px-4 text-sm transition-colors duration-200 select-none focus:outline-none focus:ring-1 ${
                          errors.gameId
                            ? 'border-danger/50 bg-surface text-offwhite focus:border-danger/70 focus:ring-danger/20'
                            : 'border-border-light bg-surface text-offwhite hover:border-muted/30 focus:border-accent/50 focus:ring-accent/20'
                        } data-[popup-open]:border-accent/50 data-[popup-open]:ring-1 data-[popup-open]:ring-accent/20`}
                      >
                        <span className={field.value ? '' : 'text-muted/60'}>
                          {field.value
                            ? (() => {
                                const g = games.find((g) => g.id === field.value)
                                return g
                                  ? `${g.name} (${g.minPlayers}-${g.maxPlayers} players)`
                                  : field.value
                              })()
                            : 'Select a game'}
                        </span>
                        <Select.Icon className="flex items-center text-muted">
                          <ChevronsUpDown className="size-3" />
                        </Select.Icon>
                      </Select.Trigger>
                      <Select.Portal>
                        <Select.Positioner
                          className="z-[60] outline-none select-none"
                          sideOffset={8}
                        >
                          <Select.Popup className="origin-[var(--transform-origin)] rounded-xl border border-border bg-surface shadow-2xl shadow-black/50 transition-[transform,scale,opacity] data-[ending-style]:scale-95 data-[ending-style]:opacity-0 data-[starting-style]:scale-95 data-[starting-style]:opacity-0">
                            <Select.ScrollUpArrow className="flex h-5 w-full cursor-default items-center justify-center bg-surface text-muted" />
                            <Select.List className="relative py-1 overflow-y-auto max-h-[var(--available-height)]">
                              {games.map((game) => (
                                <Select.Item
                                  key={game.id}
                                  value={game.id}
                                  className="grid min-w-[var(--anchor-width)] cursor-default grid-cols-[1rem_1fr] items-center gap-2 px-3 py-2.5 text-sm text-offwhite outline-none select-none data-[highlighted]:bg-surface-hover data-[highlighted]:text-accent"
                                >
                                  <Select.ItemIndicator className="col-start-1">
                                    <Check className="size-3.5" />
                                  </Select.ItemIndicator>
                                  <Select.ItemText className="col-start-2">
                                    {game.name} ({game.minPlayers}-{game.maxPlayers} players)
                                  </Select.ItemText>
                                </Select.Item>
                              ))}
                            </Select.List>
                            <Select.ScrollDownArrow className="flex h-5 w-full cursor-default items-center justify-center bg-surface text-muted" />
                          </Select.Popup>
                        </Select.Positioner>
                      </Select.Portal>
                    </Select.Root>
                  )}
                />
                {errors.gameId && <p className="field-error">{errors.gameId.message}</p>}
              </div>

              {/* Max Players */}
              <div>
                <label
                  htmlFor="modal-maxPlayers"
                  className="block text-sm font-medium text-offwhite mb-1.5"
                >
                  Max Players{' '}
                  <span className="text-muted font-normal">
                    (defaults to {selectedGame?.maxPlayers ?? 'game max'})
                  </span>
                </label>
                <input
                  type="number"
                  id="modal-maxPlayers"
                  className={errors.maxPlayers ? 'input-field-error' : 'input-field'}
                  min={2}
                  max={20}
                  placeholder={selectedGame?.maxPlayers?.toString() ?? '5'}
                  {...register('maxPlayers', {
                    setValueAs: (v: string) =>
                      v === '' || isNaN(Number(v)) ? undefined : Number(v),
                  })}
                />
                {errors.maxPlayers && <p className="field-error">{errors.maxPlayers.message}</p>}
              </div>

              {/* Tags */}
              <div>
                <label className="block text-sm font-medium text-offwhite mb-1.5">
                  Tags <span className="text-muted font-normal">(optional)</span>
                </label>
                <Controller
                  name="tags"
                  control={control}
                  render={({ field }) => (
                    <TagsChipInput
                      value={field.value ?? []}
                      onChange={field.onChange}
                      onBlur={field.onBlur}
                      hasError={!!errors.tags}
                    />
                  )}
                />
                <p className="mt-1 text-xs text-muted">
                  Press Enter or comma to add · max 5 tags
                </p>
                {errors.tags && <p className="field-error">{errors.tags.message}</p>}
              </div>

              {/* Language */}
              <div>
                <label className="block text-sm font-medium text-offwhite mb-1.5">Language</label>
                <Controller
                  name="language"
                  control={control}
                  render={({ field }) => (
                    <div className="flex gap-2">
                      {(
                        [
                          { value: 'pt-br', label: '🇧🇷 PT-BR' },
                          { value: 'en', label: '🇺🇸 EN' },
                        ] as const
                      ).map(({ value, label }) => (
                        <button
                          key={value}
                          type="button"
                          onClick={() => field.onChange(value)}
                          className={`flex-1 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                            field.value === value
                              ? 'bg-accent/10 text-accent border border-accent/20'
                              : 'bg-surface text-muted border border-border hover:border-border-light hover:text-offwhite'
                          }`}
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                  )}
                />
                {errors.language && <p className="field-error">{errors.language.message}</p>}
              </div>

              {/* Discord Link */}
              <div>
                <label
                  htmlFor="modal-discordLink"
                  className="block text-sm font-medium text-offwhite mb-1.5"
                >
                  Discord Invite Link
                </label>
                <input
                  type="url"
                  id="modal-discordLink"
                  className={errors.discordLink ? 'input-field-error' : 'input-field'}
                  placeholder="https://discord.gg/..."
                  {...register('discordLink')}
                />
                <p className="mt-1 text-xs text-muted">
                  Shared with all players when the room is full.
                </p>
                {errors.discordLink && <p className="field-error">{errors.discordLink.message}</p>}
              </div>

              {/* API Error */}
              {errors.root && (
                <AlertBox
                  type="error"
                  message={errors.root.message ?? 'An error occurred'}
                  onClose={() => clearErrors('root')}
                />
              )}

              {/* Submit */}
              <button type="submit" disabled={isLoading} className="btn-accent w-full py-3 mt-2">
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="size-4 animate-spin" />
                    Creating...
                  </span>
                ) : (
                  'Create Room'
                )}
              </button>
            </form>
          </motion.div>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
