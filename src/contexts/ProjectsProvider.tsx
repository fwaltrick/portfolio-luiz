/* eslint-disable @typescript-eslint/no-explicit-any */
// src/contexts/ProjectsProvider.tsx
import React, { useState, useEffect, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Project } from '../types'
import ProjectsContext from './ProjectsContext'
import { client } from '../../tina/__generated__/client'

interface ProjectsProviderProps {
  children: React.ReactNode
  initialProjects?: Project[]
  useTina?: boolean
}

const ProjectsProvider: React.FC<ProjectsProviderProps> = ({
  children,
  initialProjects,
  useTina = true,
}) => {
  const [rawProjects, setRawProjects] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const { i18n } = useTranslation()
  const isGerman = i18n.language.startsWith('de')

  // Fetch raw projects data only once
  useEffect(() => {
    if (initialProjects) {
      setRawProjects(initialProjects)
      setLoading(false)
      return
    }

    const fetchProjects = async () => {
      try {
        setLoading(true)
        setError(null)

        if (useTina) {
          try {
            const result = await client.queries.projectConnection()
            const edges = result.data.projectConnection?.edges || []

            if (edges.length > 0) {
              setRawProjects(edges.map((edge) => edge?.node))
              setLoading(false)
              return
            }
          } catch (tinaError) {
            console.error('Error fetching from TinaCMS:', tinaError)
          }
        }

        // Fallback to file data
        // setRawProjects(projectsFromFile)
      } catch (err) {
        setError(err instanceof Error ? err : new Error(String(err)))
      } finally {
        setLoading(false)
      }
    }

    fetchProjects()
  }, [initialProjects, useTina])

  // Transform and sort raw projects based on current language
  const projects = useMemo(() => {
    // First transform the raw projects
    const transformedProjects = rawProjects.map((project) => {
      // For TinaCMS projects
      if (project._sys) {
        return {
          id: project._sys.filename,
          title: isGerman ? project.title_de : project.title_en,
          slug: project.slug,
          category: isGerman ? project.category_de : project.category_en,
          client: project.client,
          agency: project.agency,
          year: project.year,
          creativeDirection: project.creativeDirection,
          copyright: project.copyright,
          imageUrl: project.coverImage,
          order: typeof project.order === 'number' ? project.order : 9999, // Default to high number if order not set
          // Store original data for potential direct access
          _raw: project,
        }
      }

      // For local file projects
      return {
        ...project,
        title: project.titleKey
          ? isGerman
            ? project.title_de
            : project.title_en
          : project.title,
        category: project.categoryKey
          ? isGerman
            ? project.category_de
            : project.category_en
          : project.category,
        order: typeof project.order === 'number' ? project.order : 9999, // Ensure local projects have order too
      }
    })

    // Then sort the projects by order (ascending)
    return transformedProjects.sort((a, b) => {
      // Primary sort by order field
      if (a.order !== b.order) {
        return a.order - b.order
      }

      // Secondary sort by year (most recent first) if orders are equal
      const yearA = parseInt(a.year || '0', 10)
      const yearB = parseInt(b.year || '0', 10)
      if (yearA !== yearB) {
        return yearB - yearA
      }

      // Tertiary sort by title alphabetically if years are also equal
      return (a.title || '').localeCompare(b.title || '')
    })
  }, [rawProjects, isGerman])

  // Create a memoized context value
  const contextValue = useMemo(
    () => ({
      projects,
      loading,
      error,
    }),
    [projects, loading, error],
  )

  return (
    <ProjectsContext.Provider value={contextValue}>
      {children}
    </ProjectsContext.Provider>
  )
}

export default ProjectsProvider
