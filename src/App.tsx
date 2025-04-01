// src/App.tsx
import React from 'react'
import { Routes, Route } from 'react-router-dom'
import AboutPage from './pages/About'
import ProjectDetail from './pages/ProjectDetail'
import HomePage from './pages/Home'
import Header from './components/Header'
import Footer from './components/Footer'
import ProjectsProvider from './contexts/ProjectsProvider'

const App: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <ProjectsProvider>
        <Header />
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/project/:slug" element={<ProjectDetail />} />
          </Routes>
        </main>
        <Footer />
      </ProjectsProvider>
    </div>
  )
}

export default App
