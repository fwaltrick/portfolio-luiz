// src/App.tsx
import React from 'react'
import { Outlet } from 'react-router-dom'
import Header from './components/Header'
import Footer from './components/Footer'
import ProjectsProvider from './contexts/ProjectsProvider'
import ScrollToTop from './components/ScrollToTop' // Importe o componente

const App: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col relative">
      <ProjectsProvider>
        <Header />
        <ScrollToTop />
        <main className="flex-grow">
          <Outlet />
        </main>
        <Footer />
      </ProjectsProvider>
    </div>
  )
}

export default App
