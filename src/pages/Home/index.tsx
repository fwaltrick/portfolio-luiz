import React, { useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import CategoryFilter from '../../components/ui/CategoryFilter'
import ProjectGrid from '../../components/ui/ProjectGrid'
import { projectsData } from '../../data/projectsData'

const Home: React.FC = () => {
  const { t } = useTranslation()
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])

  // Extract category keys for the filter
  const categoryKeys = useMemo(() => {
    if (!projectsData?.length) return []

    const keys = projectsData.map((project) => project.categoryKey)
    return [...new Set(keys)].sort()
  }, [])

  // Filter projects based on selected categories
  const filteredProjects = useMemo(() => {
    if (selectedCategories.length === 0) {
      return projectsData
    }

    return projectsData.filter((project) =>
      selectedCategories.includes(project.categoryKey),
    )
  }, [selectedCategories])

  return (
    <div className="w-full pt-4">
       

        <CategoryFilter
          categories={categoryKeys}
          selectedCategories={selectedCategories}
          onCategoryChange={setSelectedCategories}
        />

        <ProjectGrid projects={filteredProjects} />
      
    </div>
  )
}

export default Home
