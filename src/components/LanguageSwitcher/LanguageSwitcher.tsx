import React, { useCallback } from 'react'
import { useTranslation } from 'react-i18next'

interface LanguageSwitcherProps {
  isProjectPage?: boolean
}

const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({
  isProjectPage = false,
}) => {
  const { i18n } = useTranslation()
  const isGerman = i18n.language === 'de'

  const toggleLanguage = useCallback(
    (lang: string) => {
      i18n.changeLanguage(lang)
    },
    [i18n],
  )

  // Determine classes condicionais baseadas em isProjectPage
  const containerClasses = `flex items-center gap-2 border rounded-md p-1 ${
    isProjectPage
      ? 'border-white/30 bg-transparent language-switcher-container'
      : 'border-jumbo-200 bg-jumbo-50'
  }`

  // Classes para botões inativos
  const inactiveButtonClasses = isProjectPage
    ? 'bg-transparent text-jumbo-50/80 hover:bg-jumbo-50/20'
    : 'bg-transparent text-jumbo-600 hover:bg-jumbo-100'

  return (
    <div
      className={containerClasses}
      role="radiogroup"
      aria-label="Select language"
    >
      <button
        onClick={() => toggleLanguage('de')}
        className={`px-2 py-1 text-sm font-sans rounded transition-all cursor-pointer ${
          isGerman
            ? 'bg-jumbo-950 text-white font-medium'
            : inactiveButtonClasses
        }`}
        aria-label="Auf Deutsch umschalten"
        aria-pressed={isGerman}
      >
        DE
      </button>
      <button
        onClick={() => toggleLanguage('en')}
        className={`px-2 py-1 text-sm font-sans rounded transition-all cursor-pointer ${
          !isGerman
            ? 'bg-jumbo-950 text-white font-medium'
            : inactiveButtonClasses
        }`}
        aria-label="Switch to English"
        aria-pressed={!isGerman}
      >
        EN
      </button>
    </div>
  )
}

export default LanguageSwitcher
