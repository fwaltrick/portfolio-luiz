import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { projectsData } from '../../data/projectsData'

// Define the Project interface based on your actual data structure
interface Project {
  id: string
  slug: string
  titleKey: string
  categoryKey: string
  imageUrl: string
  // Add other properties as needed
}

const ProjectDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>()
  const { t, ready } = useTranslation()
  const navigate = useNavigate()

  const [loading, setLoading] = useState(true)
  const [project, setProject] = useState<Project | undefined>()

  // Find project by slug
  useEffect(() => {
    if (ready && slug) {
      console.log('Looking for project with slug:', slug)
      console.log('Available projects:', projectsData)

      const foundProject = projectsData.find((p) => p.slug === slug)
      console.log('Found project:', foundProject)

      setProject(foundProject)
      setLoading(false)
    }
  }, [slug, ready])

  // Handle loading state
  if (loading || !ready) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    )
  }

  // Handle project not found
  if (!project) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">
          <h1 className="text-2xl font-mono mb-4">Project Not Found</h1>
          <p className="mb-6">
            Sorry, the project you're looking for doesn't exist.
          </p>
          <button
            onClick={() => navigate('/')}
            className="px-4 py-2 bg-black text-white rounded"
          >
            Return to Projects
          </button>
        </div>
      </div>
    )
  }

  // Render project details
  return (
    <div className="container mx-auto px-4 py-16">
      <button
        onClick={() => navigate(-1)}
        className="mb-8 flex items-center text-sm"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="mr-1"
        >
          <path d="M19 12H5M12 19l-7-7 7-7" />
        </svg>
        Back
      </button>

      <h1 className="text-4xl font-mono mb-4">{t(project.titleKey)}</h1>
      <p className="text-xl mb-6">{t(project.categoryKey)}</p>

      <div className="aspect-[16/9] overflow-hidden rounded-lg mb-8">
        <img
          src={project.imageUrl.replace('-00-thumbnail', '-01-detail')}
          alt={t(project.titleKey)}
          className="w-full h-full object-cover"
          onError={(e) => {
            console.error(
              'Failed to load detail image, falling back to thumbnail',
            )
            e.currentTarget.src = project.imageUrl
          }}
        />
      </div>

      {/* Project content placeholder */}
      <div className="prose max-w-none">
        <p>
          {t(
            `projects.${project.slug}.description`,
            'Project description would go here.',
          )}
        </p>
      </div>

      {/* Other projects section */}
      <div className="mt-16">
        <h2 className="text-2xl font-mono mb-6">
          {t('project.otherProjects', 'Other Projects')}
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {projectsData
            .filter((p) => p.id !== project.id)
            .slice(0, 3)
            .map((otherProject) => (
              <a
                key={otherProject.id}
                href={`/project/${otherProject.slug}`}
                className="block aspect-[4/3] relative overflow-hidden rounded-lg"
              >
                <img
                  src={otherProject.imageUrl}
                  alt={t(otherProject.titleKey)}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black bg-opacity-30 flex items-end p-4">
                  <div className="text-white">
                    <h3 className="font-mono text-lg">
                      {t(otherProject.titleKey)}
                    </h3>
                    <p className="text-sm">{t(otherProject.categoryKey)}</p>
                  </div>
                </div>
              </a>
            ))}
        </div>
      </div>
    </div>
  )
}

export default ProjectDetailPage
