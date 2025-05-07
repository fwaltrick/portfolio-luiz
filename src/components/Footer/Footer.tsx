import React from 'react'
import { Link, useLocation } from 'react-router-dom'

const Footer: React.FC = () => {
  const location = useLocation()

  // Verifica se estamos em uma página de detalhes de projeto
  const isProjectDetailPage = location.pathname.includes('/project/')

  // Classes condicionais baseadas na página atual
  const footerClasses = isProjectDetailPage
    ? 'py-4 bg-jumbo-950 text-white'
    : 'py-4 border-t border-jumbo-200'

  const logoClasses = isProjectDetailPage
    ? 'text-l md:text-xl tracking-(0.015em) font-[Staatliches] text-white'
    : 'text-l md:text-xl tracking-(0.015em) font-[Staatliches] '

  const linkClasses = isProjectDetailPage
    ? 'text-sm text-jumbo-300 hover:text-white hover:underline transition-colors duration-300'
    : 'text-sm text-gray-600 hover:underline'

  return (
    <footer className={footerClasses}>
      <div className="container-custom flex justify-between items-center">
        <div>
          <Link to="/" className={logoClasses}>
            LUIZ DOMINGUEZ
          </Link>
        </div>

        <div className="flex gap-4">
          <Link to="/impressum" className={linkClasses}>
            Impressum
          </Link>
          <a href="mailto:domluiz@gmail.com" className={linkClasses}>
            domluiz@gmail.com
          </a>
        </div>
      </div>
    </footer>
  )
}

export default Footer
