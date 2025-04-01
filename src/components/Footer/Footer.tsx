import React from 'react'
import { Link } from 'react-router-dom'

const Footer = () => {
  return (
    <footer className="py-4 border-t border-gray-200">
      <div className="container-custom flex justify-between items-center">
        <div>
          <Link
            to="/"
            className="text-xl tracking-(0.015em) font-[Staatliches] font-bold"
          >
            LUIZ DOMINGUEZ
          </Link>
        </div>

        <div className="flex gap-4">
          <Link
            to="/impressum"
            className="text-sm text-gray-600 hover:underline"
          >
            Impressum
          </Link>
          <a
            href="mailto:domluiz@gmail.com"
            className="text-sm text-gray-600 hover:underline"
          >
            domluiz@gmail.com
          </a>
        </div>
      </div>
    </footer>
  )
}

export default Footer
