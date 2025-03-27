// src/App.tsx
import React, { useState, useEffect } from 'react'
import { Routes, Route } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import AboutPage from './pages/About'
import ProjectDetail from './pages/ProjectDetail'
import Home from './pages/Home'
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

        // Use os projetos do arquivo projectsData.ts
        console.log(
          'Loading projects from projectsData.ts:',
          projectsFromFile.map((p) => p.slug),
        )

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
        <Routes>
          <Route
            path="/"
            element={<Home projects={projects} loading={loading} />}
          />
          <Route path="/about" element={<AboutPage />} />
          <Route
            path="/project/:slug"
            element={<ProjectDetail projects={projects} />}
          />
        </Routes>
      </main>
      <Footer />
    </div>
  )
}

export default App
