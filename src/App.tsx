// App.tsx
import React, { useState, useEffect } from 'react'
import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import AboutPage from './pages/About'
import ProjectDetail from './pages/ProjectDetail'
import Header from './components/ui/Header'
import Footer from './components/ui/Footer'

// Project interface
interface Project {
  id: string
  title: string
  category: string
  imageUrl: string
  slug: string
}

const App: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        // Get the current language from localStorage or default to 'de'
        const currentLang = localStorage.getItem('i18nextLng') || 'de'

        // Fetch the translation file
        const response = await fetch(`/locales/${currentLang}/translation.json`)

        if (!response.ok) {
          throw new Error(`Failed to load translation file: ${response.status}`)
        }

        const translationData = await response.json()

        // Extract project data from the translation file
        const projectsData = translationData.projects || {}

        // Transform the project data into our Project interface format
        const formattedProjects: Project[] = Object.entries(projectsData).map(
          ([key, value]: [string, any]) => ({
            id: key,
            title: value.title,
            category: value.category,
            imageUrl: `/images/projects/${key}-00-thumbnail.jpg`, // Assuming a consistent image path pattern
            slug: key,
          }),
        )


        setProjects(formattedProjects)
      } catch (error) {
        console.error('Error loading projects from translation file:', error)
        // Fallback to empty array
        setProjects([])
      } finally {
        setLoading(false)
      }
    }

    fetchProjects()
  }, [])

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
