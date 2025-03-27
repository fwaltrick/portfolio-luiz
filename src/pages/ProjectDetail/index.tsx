// src/pages/ProjectDetail/index.tsx
import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Project } from '../../types'
import { projects } from '../../data/projectsData'

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

      const foundProject = projects.find((p) => p.slug === slug)
      console.log('Found project:', foundProject)

      if (foundProject) {
        setProject(foundProject)
      } else {
        // Projeto não encontrado, redirecionar para a página inicial
        navigate('/')
      }

      setLoading(false)
    }
  }, [ready, slug, navigate])

  if (loading) {
    return <div className="container-custom py-12">Loading...</div>
  }

  if (!project) {
    return <div className="container-custom py-12">Project not found</div>
  }

  return (
    <div className="container-custom py-12">
      <h1 className="text-4xl font-bold mb-6">{t(project.title)}</h1>

      <div className="mb-8">
        <img
          src={project.imageUrl}
          alt={t(project.title)}
          className="w-full h-auto rounded-lg shadow-lg"
        />
      </div>

      <div className="bg-gray-100 p-6 rounded-lg mb-8">
        <div>
          <h3 className="text-sm font-semibold text-gray-500">Category</h3>
          <p>{t(project.category)}</p>
        </div>
      </div>

      {/* Conteúdo detalhado do projeto */}
      <div className="prose max-w-none">
        <div
          dangerouslySetInnerHTML={{
            __html: t(`projects.${project.slug}.description`, ''),
          }}
        />

        {/* Galeria de imagens adicionais */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold mb-6">
            {t('projectDetail.gallery', 'Galeria')}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2, 3].map((index) => {
              const imagePath = `/images/projects/${project.slug}-${index
                .toString()
                .padStart(2, '0')}.jpg`

              return (
                <img
                  key={index}
                  src={imagePath}
                  alt={`${t(project.title)} - ${index}`}
                  className="w-full h-auto rounded-lg shadow-md"
                  onError={(e) => {
                    // Remove a imagem se ela não existir
                    const target = e.target as HTMLImageElement
                    target.style.display = 'none'
                  }}
                />
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProjectDetailPage
