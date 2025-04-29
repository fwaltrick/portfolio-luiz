// src/components/Header.tsx
import { useState, useEffect, useRef } from 'react' // Certifique-se que useEffect e useRef estão importados
import { Link, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import LanguageSwitcher from '../LanguageSwitcher' // Verifique o caminho

const Header = () => {
  const { t } = useTranslation()
  const location = useLocation()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  // Refs para o container do menu e o botão que o abre/fecha
  const menuRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)

  const isProjectDetailPage = location.pathname.includes('/project/')

  const isActive = (path: string) => {
    if (path === '/' && location.pathname === '/') return true
    if (path === '/about' && location.pathname === '/about') return true
    return false
  }

  // Hook useEffect para lidar com cliques fora do menu
  useEffect(() => {
    // Handler para verificar o clique
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      // Verifica se o clique foi realmente fora do menu E fora do botão
      // Checa se os refs existem e se o target do evento não está contido neles
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        // Se o clique foi fora, fecha o menu
        setMobileMenuOpen(false)
      }
    }

    // Adiciona o listener somente se o menu estiver aberto
    if (mobileMenuOpen) {
      // Usar 'mousedown' geralmente captura cliques antes de outros eventos e funciona bem aqui
      document.addEventListener('mousedown', handleClickOutside)
      // Adicionar 'touchstart' para melhor responsividade em mobile
      document.addEventListener('touchstart', handleClickOutside)
    }

    // Função de limpeza: remove os listeners quando o componente desmontar ou o menu fechar
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('touchstart', handleClickOutside)
    }
  }, [mobileMenuOpen]) // A dependência garante que o efeito rode quando o menu abrir/fechar

  // Classes do Header
  const headerClasses = `w-full py-4 z-50 ${
    isProjectDetailPage
      ? 'absolute top-0 left-0 right-0'
      : 'relative border-b border-jumbo-200'
  }`

  return (
    // Adiciona ref aqui se precisar checar cliques no header inteiro, mas geralmente não é necessário
    <header className={headerClasses}>
      <div className="container-custom flex items-center justify-between">
        {/* Logo */}
        <div>
          <Link
            to="/"
            className={`tracking-[0.015em] text-4xl font-[Staatliches] ${
              isProjectDetailPage ? 'text-white' : 'text-gray-900'
            }`}
          >
            LUIZ DOMINGUEZ
          </Link>
        </div>

        {/* Navegação Desktop */}
        <div className="hidden md:flex items-center gap-6">
          {/* Links Desktop */}
          <Link
            to="/"
            className={`text-md font-sans hover:underline ${
              isActive('/') ? 'font-bold' : ''
            } ${isProjectDetailPage ? 'text-white' : 'text-gray-700'}`}
          >
            {t('nav.home')}
          </Link>
          <Link
            to="/about"
            className={`text-md font-sans hover:underline ${
              isActive('/about') ? 'font-bold' : ''
            } ${isProjectDetailPage ? 'text-white' : 'text-gray-700'}`}
          >
            {t('nav.about')}
          </Link>
          <a
            href="mailto:domluiz@gmail.com"
            className={`text-md font-sans hover:underline ${
              isProjectDetailPage ? 'text-white' : 'text-gray-700'
            }`}
          >
            {t('nav.contact')}
          </a>
          <LanguageSwitcher />
        </div>

        {/* Botão Mobile */}
        <div className="md:hidden">
          <button
            ref={buttonRef} // Aplica a ref ao botão
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className={`p-2 rounded focus:outline-none focus:ring-1 focus:ring-offset-1 ${
              isProjectDetailPage
                ? 'text-white focus:ring-jumbo-50'
                : 'text-gray-700 focus:ring-jumbo-200'
            }`}
            aria-label="Menu"
            aria-expanded={mobileMenuOpen}
            aria-controls="mobile-menu"
          >
            {/* Icons */}
            {mobileMenuOpen ? (
              <svg
                /* ... Icone X ... */ className="w-6 h-6"
                aria-hidden="true"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            ) : (
              <svg
                /* ... Icone Hamburguer ... */ className="w-6 h-6"
                aria-hidden="true"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4 6h16M4 12h16m-7 6h7"
                />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Menu Mobile */}
      {/* Aplica a ref ao container do menu */}
      <div
        ref={menuRef}
        id="mobile-menu"
        className={`
          md:hidden overflow-hidden transition-all duration-300 ease-in-out
          ${
            isProjectDetailPage
              ? 'bg-jumbo-950 bg-opacity-90 text-jumbo-50'
              : 'bg-jumbo-50'
          }
          ${
            mobileMenuOpen
              ? 'max-h-screen opacity-100 pointer-events-auto mt-4 py-4 border-t border-jumbo-200'
              : 'max-h-0 opacity-0 pointer-events-none'
          }
        `}
        aria-hidden={!mobileMenuOpen}
      >
        {/* Conteúdo do Menu */}
        <div className="container-custom">
          <nav className="flex flex-col gap-6">
            {/* Links Mobile */}
            <Link
              to="/"
              className={`block px-2 py-1 text-sm font-sans rounded hover:bg-gray-100 ${
                isActive('/') ? 'font-bold' : ''
              } ${isProjectDetailPage ? 'hover:text-gray-900' : ''}`}
              onClick={() => setMobileMenuOpen(false)}
            >
              {t('nav.home')}
            </Link>
            <Link
              to="/about"
              className={`block px-2 py-1 text-sm font-sans rounded hover:bg-gray-100 ${
                isActive('/about') ? 'font-bold' : ''
              } ${isProjectDetailPage ? 'hover:text-gray-900' : ''}`}
              onClick={() => setMobileMenuOpen(false)}
            >
              {t('nav.about')}
            </Link>
            <a
              href="mailto:domluiz@gmail.com"
              className={`block px-2 py-1 text-sm font-sans rounded hover:bg-gray-100 ${
                isProjectDetailPage ? 'hover:text-gray-900' : ''
              }`}
              onClick={() => setMobileMenuOpen(false)}
            >
              {t('nav.contact')}
            </a>
            <div className="border-gray-200 mt-2">
              <LanguageSwitcher />
            </div>
          </nav>
        </div>
      </div>
    </header>
  )
}

export default Header
