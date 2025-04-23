// src/pages/Home/index.tsx
import React from 'react'
import ProjectGrid from '../../components/ProjectGrid'
import useProjects from '../../hooks/useProjects'

const HomePage: React.FC = () => {
  const { projects, loading } = useProjects()

  // // Logs for debugging
  // console.log('Home render - loading:', loading)
  // console.log('Home render - projects length:', projects?.length || 0)

  // Pass the projects and loading state directly to ProjectGrid
  return (
    <div className="w-full pt-4 container-custom">
      <ProjectGrid projects={projects} loading={loading} />
    </div>
  )
}

export default HomePage
