import { useForm, Controller } from 'react-hook-form'
import { useState, useRef, type ChangeEvent, type KeyboardEvent } from 'react'
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

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      addTag(inputValue)
      setInputValue('')
    } else if (e.key === 'Backspace' && inputValue === '' && tags.length > 0) {
      removeTag(tags.length - 1)
    }
  }

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value

    if (value.endsWith(',')) {
      addTag(value.slice(0, -1))
      setInputValue('')
      return
    }

    setInputValue(value)
  }

  return (
    <div
      className={`input-field flex min-h-[44px] cursor-text flex-wrap items-center gap-2 ${
        hasError ? 'border-danger/50 focus-within:border-danger/70 focus-within:ring-danger/20' : ''
      }`}
      onClick={() => inputRef.current?.focus()}
    >
      {tags.map((tag, index) => (
        <span
          key={index}
          className="inline-flex items-center gap-1 rounded-md border border-border-light bg-surface-light px-2 py-0.5 text-xs text-offwhite"
        >
          #{tag}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              removeTag(index)
            }}
            className="ml-0.5 flex items-center justify-center text-muted transition-colors hover:text-offwhite"
            aria-label={`Remove tag ${tag}`}
          >
            <X className="size-[10px]" strokeWidth={3} />
          </button>
        </span>
      ))}

      {!atLimit && (
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onBlur={onBlur}
          maxLength={15}
          className="min-w-[96px] flex-1 bg-transparent text-sm text-offwhite outline-none placeholder:text-muted/60"
          placeholder={tags.length === 0 ? 'Type a tag...' : 'Add more...'}
          aria-label="Add tag"
        />
      )}
    </div>
  )
}

const languageOptions = [
  { value: 'pt-br', label: 'PT-BR' },
  { value: 'en', label: 'EN' },
] as const

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
  const selectedGame = games.find((game) => game.id === selectedGameId)

  const maxPlayersHelperText = selectedGame
    ? `Leave empty to use ${selectedGame.maxPlayers} players (${selectedGame.name} default).`
    : 'Leave empty to use the selected game max players.'

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
        <Dialog.Popup className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto p-3 sm:p-5">
          <motion.div
            className="my-4 w-full max-w-2xl rounded-2xl border border-border bg-surface shadow-2xl shadow-black/50 sm:my-8"
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div className="flex items-center justify-between border-b border-border px-6 py-4">
              <Dialog.Title className="font-heading text-lg font-bold">Create a Room</Dialog.Title>
              <Dialog.Close className="flex size-8 items-center justify-center rounded-lg text-muted transition-colors hover:bg-surface-hover hover:text-offwhite">
                <X className="size-5" />
              </Dialog.Close>
            </div>

            <form onSubmit={onFormSubmit} className="flex flex-col gap-6 p-5 sm:p-6 lg:p-7">
              <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                <div className="space-y-1.5 lg:col-span-2">
                  <label
                    htmlFor="modal-roomName"
                    className="block whitespace-nowrap text-sm font-medium text-offwhite"
                  >
                    Room Name
                  </label>
                  <input
                    id="modal-roomName"
                    type="text"
                    className={errors.name ? 'input-field-error' : 'input-field'}
                    placeholder="e.g. Ranked grind tonight"
                    {...register('name')}
                  />
                  {errors.name && <p className="field-error">{errors.name.message}</p>}
                </div>

                <div className="space-y-1.5 lg:col-span-2">
                  <div className="grid grid-cols-1 lg:grid-cols-[1fr_160px] gap-4">
                    <div className="space-y-1.5">
                      <label
                        htmlFor="modal-gameId"
                        className="block whitespace-nowrap text-sm font-medium text-offwhite"
                      >
                        Game
                      </label>
                      <Controller
                        name="gameId"
                        control={control}
                        render={({ field }) => {
                          const selectedOption = games.find((game) => game.id === field.value)
                          const selectedLabel = selectedOption
                            ? `${selectedOption.name} (${selectedOption.minPlayers}-${selectedOption.maxPlayers} players)`
                            : null

                          return (
                            <Select.Root
                              value={field.value || null}
                              onValueChange={(value) => {
                                field.onChange(value)
                              }}
                            >
                              <Select.Trigger
                                id="modal-gameId"
                                className={`flex h-[44px] w-full cursor-default select-none items-center justify-between rounded-lg border px-4 text-sm transition-colors duration-200 focus:outline-none focus:ring-1 ${
                                  errors.gameId
                                    ? 'border-danger/50 bg-surface text-offwhite focus:border-danger/70 focus:ring-danger/20'
                                    : 'border-border-light bg-surface text-offwhite hover:border-muted/30 focus:border-accent/50 focus:ring-accent/20'
                                } data-[popup-open]:border-accent/50 data-[popup-open]:ring-1 data-[popup-open]:ring-accent/20`}
                              >
                                <span className={`truncate ${field.value ? '' : 'text-muted/60'}`}>
                                  {selectedLabel ?? 'Select a game'}
                                </span>
                                <Select.Icon className="flex items-center text-muted">
                                  <ChevronsUpDown className="size-3" />
                                </Select.Icon>
                              </Select.Trigger>
                              <Select.Portal>
                                <Select.Positioner
                                  className="z-[60] select-none outline-none"
                                  sideOffset={8}
                                >
                                  <Select.Popup className="origin-[var(--transform-origin)] rounded-xl border border-border bg-surface shadow-2xl shadow-black/50 transition-[transform,scale,opacity] data-[ending-style]:scale-95 data-[ending-style]:opacity-0 data-[starting-style]:scale-95 data-[starting-style]:opacity-0">
                                    <Select.ScrollUpArrow className="flex h-5 w-full cursor-default items-center justify-center bg-surface text-muted" />
                                    <Select.List className="relative max-h-[var(--available-height)] overflow-y-auto py-1">
                                      {games.map((game) => (
                                        <Select.Item
                                          key={game.id}
                                          value={game.id}
                                          className="grid min-w-[var(--anchor-width)] cursor-default select-none grid-cols-[1rem_1fr] items-center gap-2 px-3 py-2.5 text-sm text-offwhite outline-none data-[highlighted]:bg-surface-hover data-[highlighted]:text-accent"
                                        >
                                          <Select.ItemIndicator className="col-start-1">
                                            <Check className="size-3.5" />
                                          </Select.ItemIndicator>
                                          <Select.ItemText className="col-start-2">
                                            {game.name} ({game.minPlayers}-{game.maxPlayers}{' '}
                                            players)
                                          </Select.ItemText>
                                        </Select.Item>
                                      ))}
                                    </Select.List>
                                    <Select.ScrollDownArrow className="flex h-5 w-full cursor-default items-center justify-center bg-surface text-muted" />
                                  </Select.Popup>
                                </Select.Positioner>
                              </Select.Portal>
                            </Select.Root>
                          )
                        }}
                      />
                      {errors.gameId && <p className="field-error">{errors.gameId.message}</p>}
                    </div>

                    <div className="space-y-1.5">
                      <label
                        htmlFor="modal-maxPlayers"
                        className="block whitespace-nowrap text-sm font-medium text-offwhite"
                      >
                        Player Limit <span className="font-normal text-muted">(optional)</span>
                      </label>
                      <input
                        id="modal-maxPlayers"
                        type="number"
                        className={errors.maxPlayers ? 'input-field-error' : 'input-field'}
                        min={2}
                        max={20}
                        placeholder={selectedGame?.maxPlayers?.toString() ?? ''}
                        {...register('maxPlayers', {
                          setValueAs: (value: string) =>
                            value === '' || isNaN(Number(value)) ? undefined : Number(value),
                        })}
                      />
                      {errors.maxPlayers && (
                        <p className="field-error">{errors.maxPlayers.message}</p>
                      )}
                    </div>
                  </div>
                  <p className="text-xs text-muted">{maxPlayersHelperText}</p>
                </div>

                <div className="space-y-1.5 lg:col-span-2">
                  <label
                    htmlFor="modal-discordLink"
                    className="block whitespace-nowrap text-sm font-medium text-offwhite"
                  >
                    Discord Invite Link
                  </label>
                  <input
                    id="modal-discordLink"
                    type="url"
                    className={errors.discordLink ? 'input-field-error' : 'input-field'}
                    placeholder="https://discord.gg/..."
                    {...register('discordLink')}
                  />
                  <p className="text-xs text-muted">
                    Shared with all players when the room is full.
                  </p>
                  {errors.discordLink && (
                    <p className="field-error">{errors.discordLink.message}</p>
                  )}
                </div>

                <div className="space-y-1.5 lg:col-span-2">
                  <label className="block whitespace-nowrap text-sm font-medium text-offwhite">
                    Tags <span className="font-normal text-muted">(optional)</span>
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
                  <p className="text-xs text-muted">Press Enter or comma to add - max 5 tags</p>
                  {errors.tags && <p className="field-error">{errors.tags.message}</p>}
                </div>

                <div className="space-y-1.5 lg:col-span-2">
                  <label className="block whitespace-nowrap text-sm font-medium text-offwhite">
                    Language
                  </label>
                  <Controller
                    name="language"
                    control={control}
                    render={({ field }) => (
                      <div className="grid grid-cols-2 gap-2">
                        {languageOptions.map(({ value, label }) => (
                          <button
                            key={value}
                            type="button"
                            onClick={() => field.onChange(value)}
                            className={`rounded-lg px-4 py-2.5 text-sm font-medium transition-colors ${
                              field.value === value
                                ? 'border border-accent/20 bg-accent/10 text-accent'
                                : 'border border-border bg-surface text-muted hover:border-border-light hover:text-offwhite'
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
              </div>

              {errors.root && (
                <AlertBox
                  type="error"
                  message={errors.root.message ?? 'An error occurred'}
                  onClose={() => clearErrors('root')}
                />
              )}

              <button type="submit" disabled={isLoading} className="btn-accent mt-1 w-full py-3">
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
