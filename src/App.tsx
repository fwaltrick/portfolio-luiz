// src/App.tsx
import React, { useState, useEffect } from 'react'
import { Routes, Route } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { AnimatePresence } from 'framer-motion'
import AboutPage from './pages/About'
import ProjectDetail from './pages/ProjectDetail'
import HomePage from './pages/Home'
import Header from './components/ui/Header'
import Footer from './components/ui/Footer'
import { Project } from './types'
import { projects as projectsFromFile } from './data/projectsData'

const App: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const { t, i18n } = useTranslation()

  // Efeito para carregar projetos
  useEffect(() => {
    const updateProjects = async () => {
      try {
        setLoading(true)

        // Traduza os projetos
        const translatedProjects = projectsFromFile.map((project) => ({
          ...project,
          title: project.titleKey ? t(project.titleKey) : project.title,
          category: project.categoryKey
            ? t(project.categoryKey)
            : project.category,
        }))

        setProjects(translatedProjects)
        setLoading(false)
      } catch (error) {
        console.error('Error processing projects:', error)
        setLoading(false)
      }
    }

    updateProjects()
  }, [t, i18n.language])

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow">
        <AnimatePresence mode="wait">
          <Routes>
            <Route
              path="/"
              element={<HomePage projects={projects} loading={loading} />}
            />
            <Route path="/about" element={<AboutPage />} />
            <Route
              path="/project/:slug"
              element={<ProjectDetail projects={projects} />}
            />
          </Routes>
        </AnimatePresence>
      </main>
      <Footer />
    </div>
  )
}

export default App
