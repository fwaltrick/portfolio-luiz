import React, { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import LanguageSwitcher from '../LanguageSwitcher'
import './Header.css'

const Header = () => {
  const { t } = useTranslation()
  const location = useLocation()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  // Verifica se estamos em uma página de detalhes de projeto
  const isProjectDetailPage = location.pathname.includes('/project/')

  // Estado para controlar a transparência do header ao rolar a página
  const [scrolled, setScrolled] = useState(false)

  // Efeito para controlar a transparência do header ao rolar
  useEffect(() => {
    if (!isProjectDetailPage) return

    const handleScroll = () => {
      // Adiciona classe quando a página é rolada além de 100px
      if (window.scrollY > 100) {
        setScrolled(true)
      } else {
        setScrolled(false)
      }
    }

    window.addEventListener('scroll', handleScroll)

    // Limpeza ao desmontar
    return () => {
      window.removeEventListener('scroll', handleScroll)
    }
  }, [isProjectDetailPage])

  // Função para verificar se um link está ativo
  const isActive = (path: string) => {
    if (path === '/' && location.pathname === '/') return true
    if (path === '/about' && location.pathname === '/about') return true
    return false
  }

  // Classes condicionais para o header
  const headerClasses = `w-full py-4 ${
    isProjectDetailPage
      ? `project-detail-header ${scrolled ? 'scrolled' : ''}`
      : 'border-b border-gray-200'
  }`

  return (
    <header className={headerClasses}>
      <div className="container-custom flex items-center justify-between">
        {/* Logo à esquerda */}
        <div>
          <Link
            to="/"
            className={`tracking-(0.015em) text-4xl font-[Staatliches] ${
              isProjectDetailPage ? 'text-white header-logo' : ''
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
            } ${isProjectDetailPage ? 'text-white header-link' : ''}`}
          >
            {t('nav.home')}
          </Link>
          <Link
            to="/about"
            className={`text-md font-sans hover:underline ${
              isActive('/about') ? 'font-bold' : ''
            } ${isProjectDetailPage ? 'text-white header-link' : ''}`}
          >
            {t('nav.about')}
          </Link>
          <a
            href="mailto:domluiz@gmail.com"
            className={`text-md font-sans hover:underline ${
              isProjectDetailPage ? 'text-white header-link' : ''
            }`}
          >
            {t('nav.contact')}
          </a>
          <LanguageSwitcher />
        </div>

        {/* Botão do menu mobile - Só aparece em telas pequenas */}
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

      {/* Menu Mobile Expandido - Só aparece quando o menu está aberto e em telas pequenas */}
      {mobileMenuOpen && (
        <div
          className={`md:hidden mt-4 py-4 border-t ${
            isProjectDetailPage ? 'bg-black bg-opacity-90 text-white' : ''
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
