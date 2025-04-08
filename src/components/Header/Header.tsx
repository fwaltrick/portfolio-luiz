// src/components/Header.tsx
import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import LanguageSwitcher from '../LanguageSwitcher'

const Header = () => {
  const { t } = useTranslation()
  const location = useLocation()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  // Verifica se estamos em uma página de detalhes de projeto
  const isProjectDetailPage = location.pathname.includes('/project/')

  // Função para verificar se um link está ativo
  const isActive = (path: string) => {
    if (path === '/' && location.pathname === '/') return true
    if (path === '/about' && location.pathname === '/about') return true
    return false
  }

  // Classes para o header - POSICIONAMENTO ABSOLUTO em páginas de detalhe
  const headerClasses = `w-full py-4 z-50 ${
    isProjectDetailPage
      ? 'absolute top-0 left-0 right-0'
      : 'relative border-b border-gray-200'
  }`

  return (
    <header className={headerClasses}>
      <div className="container-custom flex items-center justify-between">
        {/* Logo à esquerda */}
        <div>
          <Link
            to="/"
            className={`tracking-[0.015em] text-4xl font-[Staatliches] ${
              isProjectDetailPage ? 'text-white' : ''
            }`}
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
            } ${isProjectDetailPage ? 'text-white' : ''}`}
          >
            {t('nav.home')}
          </Link>
          <Link
            to="/about"
            className={`text-md font-sans hover:underline ${
              isActive('/about') ? 'font-bold' : ''
            } ${isProjectDetailPage ? 'text-white' : ''}`}
          >
            {t('nav.about')}
          </Link>
          <a
            href="mailto:domluiz@gmail.com"
            className={`text-md font-sans hover:underline ${
              isProjectDetailPage ? 'text-white' : ''
            }`}
          >
            {t('nav.contact')}
          </a>
          <LanguageSwitcher />
        </div>

        {/* Mobile */}
        <div className="md:hidden">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className={`p-2 ${isProjectDetailPage ? 'text-white' : ''}`}
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

      {/* Menu Mobile Expandido */}
      {mobileMenuOpen && (
        <div
          className={`md:hidden mt-4 py-4 border-t ${
            isProjectDetailPage
              ? 'bg-black bg-opacity-90 text-white'
              : 'bg-jumbo-50'
          }`}
        >
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
              <div className="mt-4 pt-4 border-t">
                <LanguageSwitcher />
              </div>
            </nav>
          </div>
        </div>
      )}
    </header>
  )
}

export default Header
