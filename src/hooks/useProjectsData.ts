// src/hooks/useProjectsData.ts (enhanced version)
import { useState, useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { Project } from '../types'
import { getProjectsDataSource } from '../services/projectsService'

// Cache structure to store projects by language and source
interface ProjectsCache {
  [key: string]: {
    timestamp: number
    projects: Project[]
  }
}

// Cache expiration time (5 minutes)
const CACHE_EXPIRATION = 5 * 60 * 1000

// Global cache object
const projectsCache: ProjectsCache = {}

interface UseProjectsDataOptions {
  initialProjects?: Project[]
  useTina?: boolean
  cacheTime?: number // Allow custom cache time
}

export function useProjectsData({
  initialProjects,
  useTina = true,
  cacheTime = CACHE_EXPIRATION,
}: UseProjectsDataOptions = {}) {
  const [projects, setProjects] = useState<Project[]>(initialProjects || [])
  const [loading, setLoading] = useState(initialProjects ? false : true)
  const [error, setError] = useState<Error | null>(null)
  const { t, i18n } = useTranslation()

  // Use ref for the latest fetch request to handle race conditions
  const latestRequestId = useRef(0)

  useEffect(() => {
    // If we have initial projects, use them and skip fetching
    if (initialProjects) {
      setProjects(initialProjects)
      setLoading(false)
      return
    }

    const fetchProjects = async () => {
      // Generate a unique ID for this request
      const requestId = ++latestRequestId.current

      setLoading(true)
      setError(null)

      const isGerman = i18n.language.startsWith('de')
      const cacheKey = `${isGerman ? 'de' : 'en'}_${useTina ? 'tina' : 'local'}`

      // Check if we have a valid cached version
      const cachedData = projectsCache[cacheKey]
      const now = Date.now()

      if (cachedData && now - cachedData.timestamp < cacheTime) {
        // Use cached data if it's still valid
        setProjects(cachedData.projects)
        setLoading(false)
        return
      }

      const dataSource = getProjectsDataSource(useTina, isGerman, t)

      try {
        // Try to fetch from the primary data source
        const fetchedProjects = await dataSource.fetchProjects()

        // Check if this is still the latest request
        if (requestId !== latestRequestId.current) return

        if (fetchedProjects.length > 0) {
          // Cache the results
          projectsCache[cacheKey] = {
            timestamp: now,
            projects: fetchedProjects,
          }

          setProjects(fetchedProjects)
          return
        }

        // If primary source returned no projects and it was Tina, try fallback
        if (useTina) {
          const fallbackSource = getProjectsDataSource(false, isGerman, t)
          const fallbackProjects = await fallbackSource.fetchProjects()

          // Check if this is still the latest request
          if (requestId !== latestRequestId.current) return

          // Cache the fallback results
          projectsCache[`${isGerman ? 'de' : 'en'}_local`] = {
            timestamp: now,
            projects: fallbackProjects,
          }

          setProjects(fallbackProjects)
        } else {
          // If the primary source was already the fallback, just use empty array
          setProjects([])
        }
      } catch (err) {
        // Check if this is still the latest request
        if (requestId !== latestRequestId.current) return

        console.error('Error fetching projects:', err)
        setError(err instanceof Error ? err : new Error(String(err)))

        // Try fallback if primary source failed and it was Tina
        if (useTina) {
          try {
            const fallbackSource = getProjectsDataSource(false, isGerman, t)
            const fallbackProjects = await fallbackSource.fetchProjects()

            // Check if this is still the latest request
            if (requestId !== latestRequestId.current) return

            // Cache the fallback results
            projectsCache[`${isGerman ? 'de' : 'en'}_local`] = {
              timestamp: now,
              projects: fallbackProjects,
            }

            setProjects(fallbackProjects)
            // We still keep the error since the primary source failed
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
          } catch (fallbackErr) {
            // Both sources failed, update the error
            setError(new Error('All data sources failed to fetch projects'))
          }
        }
      } finally {
        // Only update loading state if this is still the latest request
        if (requestId === latestRequestId.current) {
          setLoading(false)
        }
      }
    }

    fetchProjects()
  }, [t, i18n.language, initialProjects, useTina, cacheTime])

  return { projects, loading, error }
}
