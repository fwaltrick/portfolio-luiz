import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Project } from '../types'

// Cache structure
interface CategoryCache {
  timestamp: number
  en: string[]
  de: string[]
}

// Cache key for local storage
const CACHE_KEY = 'project_categories_cache'
// Cache expiration time (24 hours)
const CACHE_EXPIRY = 24 * 60 * 60 * 1000

// Correct fallback categories
const FALLBACK_CATEGORIES = {
  en: ['Exhibition', 'Graphic & Editorial Design', 'TV & Cinema Advertising'],
  de: ['Ausstellung', 'Grafik- & Editorialdesign', 'TV- & Kinowerbung'],
}

export function useCategories(projects: Project[] = []) {
  const { i18n } = useTranslation()
  const isGerman = i18n.language.startsWith('de')

  // Extract, deduplicate, and sort categories from projects
  const categories = useMemo(() => {
    // If no projects, try to get from cache
    if (!projects || projects.length === 0) {
      try {
        const cachedData = localStorage.getItem(CACHE_KEY)
        if (cachedData) {
          const cache = JSON.parse(cachedData) as CategoryCache
          // Check if cache is still valid
          if (Date.now() - cache.timestamp < CACHE_EXPIRY) {
            return isGerman ? cache.de : cache.en
          }
        }
      } catch (error) {
        console.warn('Failed to read categories from cache:', error)
      }

      // Return fallback categories if no cache or projects
      return isGerman ? FALLBACK_CATEGORIES.de : FALLBACK_CATEGORIES.en
    }

    // Extract categories from projects
    const uniqueCategories = [
      ...new Set(projects.map((project) => project.category).filter(Boolean)),
    ].sort()

    // Cache the categories for future use
    try {
      // First, extract both language versions if available
      const enCategories = [
        ...new Set(
          projects.map((p) => p.category_en || p.category).filter(Boolean),
        ),
      ].sort()

      const deCategories = [
        ...new Set(
          projects.map((p) => p.category_de || p.category).filter(Boolean),
        ),
      ].sort()

      // Save to cache
      const cacheData: CategoryCache = {
        timestamp: Date.now(),
        en: enCategories.length > 0 ? enCategories : FALLBACK_CATEGORIES.en,
        de: deCategories.length > 0 ? deCategories : FALLBACK_CATEGORIES.de,
      }

      localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData))
    } catch (error) {
      console.warn('Failed to cache categories:', error)
    }

    return uniqueCategories.length > 0
      ? uniqueCategories
      : isGerman
      ? FALLBACK_CATEGORIES.de
      : FALLBACK_CATEGORIES.en
  }, [projects, isGerman])

  return categories
}
