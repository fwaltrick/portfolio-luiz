import React from 'react'

// Componente de Skeleton para um único projeto
export const ProjectSkeleton: React.FC = () => (
  <div className="bg-gray-100 rounded-lg overflow-hidden shadow-sm animate-pulse">
    <div className="h-48 bg-gray-200"></div>
    <div className="p-4">
      <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
      <div className="h-3 bg-gray-200 rounded w-1/4"></div>
    </div>
  </div>
)

// Componente de Grid de Skeletons para múltiplos projetos
interface ProjectGridSkeletonProps {
  count?: number
}

export const ProjectGridSkeleton: React.FC<ProjectGridSkeletonProps> = ({
  count = 6,
}) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
    {[...Array(count)].map((_, index) => (
      <ProjectSkeleton key={index} />
    ))}
  </div>
)

export default ProjectGridSkeleton
