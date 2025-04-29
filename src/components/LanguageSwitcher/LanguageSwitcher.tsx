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

  // --- REVERTENDO PARA p-1 DO CONTAINER ---
  const containerClasses = `inline-flex items-center border rounded-md p-1 gap-2 relative w-fit ${
    // Revertido para p-1
    isProjectPage
      ? 'border-white/30 bg-transparent'
      : 'border-jumbo-200 bg-jumbo-50'
  }`

  // --- REVERTENDO PARA px-2 py-1 NOS BOTÕES ---
  const fixedButtonWidth = 'w-10' // Mantendo w-10
  const baseButtonClasses = `relative z-10 bg-transparent ${fixedButtonWidth} text-center px-2 py-1 text-sm font-sans rounded cursor-pointer transition-colors duration-300 ease-in-out` // Revertido para px-2 py-1

  const activeTextClasses = 'text-white font-medium'
  const inactiveTextClasses = isProjectPage
    ? 'text-jumbo-50/80 hover:text-jumbo-50'
    : 'text-jumbo-600 hover:text-jumbo-900'

  // Translação não muda (w-10 + gap-2)
  const indicatorTranslate = 'translate-x-12'

  // --- AJUSTE POSIÇÃO INDICADOR PARA p-1 DO CONTAINER ---
  const indicatorVerticalPosition = 'top-1 bottom-1' // Revertido para top-1 bottom-1
  const indicatorHorizontalPosition = 'left-1' // Revertido para left-1
  const indicatorWidth = fixedButtonWidth // Mantém w-10

  return (
    <div
      className={containerClasses}
      role="radiogroup"
      aria-label="Select language"
    >
      {/* Indicador Deslizante */}
      <div
        className={`
          absolute ${indicatorVerticalPosition} ${indicatorHorizontalPosition} ${indicatorWidth}
          rounded bg-jumbo-950 shadow-sm
          transition-transform duration-300 ease-in-out
          pointer-events-none
          ${isGerman ? 'translate-x-0' : indicatorTranslate}
        `}
        aria-hidden="true"
      />

      {/* Botão DE */}
      <button
        onClick={() => toggleLanguage('de')}
        className={`${baseButtonClasses} ${
          isGerman ? activeTextClasses : inactiveTextClasses
        }`}
        aria-label="Auf Deutsch umschalten"
        aria-pressed={isGerman}
      >
        DE
      </button>

      {/* Botão EN */}
      <button
        onClick={() => toggleLanguage('en')}
        className={`${baseButtonClasses} ${
          !isGerman ? activeTextClasses : inactiveTextClasses
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
