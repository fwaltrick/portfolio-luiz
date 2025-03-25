import React, { useCallback } from 'react'
import { useTranslation } from 'react-i18next'

const LanguageSwitcher: React.FC = () => {
  const { i18n } = useTranslation()
  const isGerman = i18n.language === 'de'

  const toggleLanguage = useCallback(
    (lang: string) => {
      i18n.changeLanguage(lang)
    },
    [i18n],
  )

  return (
    <div
      className="flex items-center gap-2 border border-gray-300 rounded-md p-1 bg-white"
      role="radiogroup"
      aria-label="Select language"
    >
      <button
        onClick={() => toggleLanguage('de')}
        className={`px-2 py-1 text-sm font-sans rounded transition-all cursor-pointer ${
          isGerman
            ? 'bg-black text-white font-medium'
            : 'bg-transparent text-gray-600 hover:bg-gray-100'
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
            ? 'bg-black text-white font-medium'
            : 'bg-transparent text-gray-600 hover:bg-gray-100'
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
