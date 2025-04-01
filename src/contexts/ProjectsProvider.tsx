// src/contexts/ProjectsProvider.tsx
import React, { useState, useEffect, ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { Project } from '../types'
import { projects as projectsFromFile } from '../data/projectsData'
import ProjectsContext from './ProjectsContext'

interface ProjectsProviderProps {
  children: ReactNode
  // Podemos manter opções para testes ou casos especiais
  initialProjects?: Project[]
  initialLoading?: boolean
}

const ProjectsProvider: React.FC<ProjectsProviderProps> = ({
  children,
  initialProjects,
  initialLoading = true,
}) => {
  const [projects, setProjects] = useState<Project[]>(initialProjects || [])
  const [loading, setLoading] = useState(initialLoading)
  const { t, i18n } = useTranslation()

  // Efeito para carregar e traduzir projetos
  useEffect(() => {
    if (initialProjects) {
      // Se projetos iniciais foram fornecidos, usamos eles e não fazemos a tradução
      setProjects(initialProjects)
      setLoading(false)
      return
    }

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
  }, [t, i18n.language, initialProjects])

  return (
    <ProjectsContext.Provider value={{ projects, loading }}>
      {children}
    </ProjectsContext.Provider>
  )
}

export default ProjectsProvider
