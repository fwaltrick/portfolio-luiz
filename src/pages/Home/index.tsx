// src/pages/Home/index.tsx
import React, { useState, useMemo, useCallback } from 'react'
import CategoryFilter from '../../components/ui/CategoryFilter'
import ProjectGrid from '../../components/ui/ProjectGrid'
import ProjectGridSkeleton from '../../components/ui/ProjectSkeleton'
import { Project } from '../../types'

interface HomeProps {
  projects: Project[]
  loading: boolean
}

const Home: React.FC<HomeProps> = ({ projects, loading }) => {
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])

  // Handler para mudança de categoria
  const handleCategoryChange = useCallback((newCategories: string[]) => {
    setSelectedCategories(newCategories)
  }, [])

  // Extract unique categories for the filter
  const categories = useMemo(() => {
    if (!projects?.length) return []
    const uniqueCategories = [
      ...new Set(projects.map((project) => project.category)),
    ]
    return uniqueCategories.sort()
  }, [projects])

  // Filter projects based on selected categories
  const filteredProjects = useMemo(() => {
    if (selectedCategories.length === 0) {
      return projects
    }
    return projects.filter((project) =>
      selectedCategories.includes(project.category),
    )
  }, [projects, selectedCategories])

  // Logs para debug
  console.log('Home render - loading:', loading)
  console.log('Home render - projects length:', projects?.length || 0)
  console.log('Home render - categories length:', categories?.length || 0)

  return (
    <div className="container-custom pt-4">
      <CategoryFilter
        categories={categories}
        selectedCategories={selectedCategories}
        onCategoryChange={handleCategoryChange}
      />
      <ProjectGrid projects={filteredProjects} />
    </div>
  )
}

export default Home
