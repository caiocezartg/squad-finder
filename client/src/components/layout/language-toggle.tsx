import { useTranslation } from 'react-i18next'

export function LanguageToggle() {
  const { i18n } = useTranslation()
  const isEN = i18n.resolvedLanguage === 'en'

  const handleToggle = () => {
    void i18n.changeLanguage(isEN ? 'pt-BR' : 'en')
  }

  return (
    <button
      type="button"
      onClick={handleToggle}
      title={isEN ? 'Mudar para Português' : 'Switch to English'}
      className="flex items-center gap-1.5 rounded-lg border border-border px-2.5 py-1.5 text-xs font-medium text-muted hover:border-border-light hover:text-offwhite transition-colors"
    >
      {isEN ? '🇧🇷 PT' : '🇺🇸 EN'}
    </button>
  )
}
