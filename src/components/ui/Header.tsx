import React, { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import LanguageSwitcher from './LanguageSwitcher'

const Header = () => {
  const { t } = useTranslation()
  const location = useLocation()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  // Função para verificar se um link está ativo
  const isActive = (path: string) => {
    if (path === '/' && location.pathname === '/') return true
    if (path === '/about' && location.pathname === '/about') return true
    return false
  }

  return (
    <header className="w-full py-4 border-b border-gray-200">
      <div className="container-custom flex items-center justify-between">
        {/* Logo à esquerda */}
        <div>
          <Link
            to="/"
            className="tracking-(0.015em) text-4xl font-[Staatliches]"
          >
            LUIZ DOMINGUEZ
          </Link>
        </div>

        {/* Versão Desktop - Itens de navegação e seletor à direita */}
        <div className="hidden md:flex items-center gap-6">
          <Link
            to="/"
            className={`text-md font-sans hover:underline ${
              isActive('/') ? 'font-bold' : ''
            }`}
          >
            {t('nav.home')}
          </Link>
          <Link
            to="/about"
            className={`text-md font-sans hover:underline ${
              isActive('/about') ? 'font-bold' : ''
            }`}
          >
            {t('nav.about')}
          </Link>
          <a
            href="mailto:domluiz@gmail.com"
            className="text-md font-sans hover:underline"
          >
            {t('nav.contact')}
          </a>
          <LanguageSwitcher />
        </div>

        {/* Botão do menu mobile - Só aparece em telas pequenas */}
        <div className="md:hidden">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2"
            aria-label="Menu"
          >
            {mobileMenuOpen ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                className="w-6 h-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                className="w-6 h-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16m-7 6h7"
                />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Menu Mobile Expandido - Só aparece quando o menu está aberto e em telas pequenas */}
      {mobileMenuOpen && (
        <div className="md:hidden mt-4 py-4 border-t">
          <div className="container-custom">
            <nav className="flex flex-col gap-4">
              <Link
                to="/"
                className={`text-sm font-sans hover:underline ${
                  isActive('/') ? 'font-bold' : ''
                }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                {t('nav.home')}
              </Link>
              <Link
                to="/about"
                className={`text-sm font-sans hover:underline ${
                  isActive('/about') ? 'font-bold' : ''
                }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                {t('nav.about')}
              </Link>
              <a
                href="mailto:domluiz@gmail.com"
                className="text-sm font-sans hover:underline"
                onClick={() => setMobileMenuOpen(false)}
              >
                {t('nav.contact')}
              </a>
            </nav>
            <div className="mt-4 pt-4 border-t">
              <LanguageSwitcher />
            </div>
          </div>
        </div>
      )}
    </header>
  )
}

export default Header
