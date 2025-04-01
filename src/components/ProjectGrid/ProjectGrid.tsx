// src/components/ui/ProjectGrid.tsx
import React, { memo, useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { Project } from '../../types'

interface ProjectGridProps {
  projects: Project[]
}

const ProjectGrid: React.FC<ProjectGridProps> = memo(({ projects = [] }) => {
  console.log('ProjectGrid received projects:', projects)
  const { t } = useTranslation()
  const [webpSupported, setWebpSupported] = useState(false)

  // Verificar suporte a WebP quando o componente montar
  useEffect(() => {
    const checkWebPSupport = () => {
      const elem = document.createElement('canvas')
      if (elem.getContext && elem.getContext('2d')) {
        return elem.toDataURL('image/webp').indexOf('data:image/webp') === 0
      }
      return false
    }

    setWebpSupported(checkWebPSupport())
  }, [])

  // Função para obter o caminho da imagem otimizada para o grid
  const getOptimizedImagePath = (project: Project): string => {
    if (!project || !project.slug) return ''

    // Caminho para a imagem otimizada
    const format = webpSupported ? 'webp' : 'jpg'

    // Para o grid, usamos a versão medium para balancear qualidade e performance
    return `/images/optimized/${project.slug}/cover-medium.${format}`
  }

  // Função para obter o caminho da imagem original (fallback)
  const getOriginalImagePath = (project: Project): string => {
    // Verifica se o projeto já tem um URL completo
    if (
      project.imageUrl &&
      (project.imageUrl.startsWith('http') || project.imageUrl.startsWith('/'))
    ) {
      // Se for um caminho na estrutura antiga, converte para a nova estrutura
      if (project.imageUrl.includes('-thumbnail.jpg')) {
        return `/images/projects/${project.slug}/thumbnail.jpg`
      }
      return project.imageUrl
    }

    // Caso contrário, usa a nova estrutura de pastas
    return `/images/projects/${project.slug}/thumbnail.jpg`
  }

  return (
    <div className="w-full">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 md:gap-6 w-full pt-6 pb-12 md:pt-6 md:pb-16 lg:pt-6 lg:pb-20">
        <AnimatePresence>
          {projects.map((project, index) => (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.3 }}
              layout
            >
              <Link
                to={`/project/${project.slug}`}
                className="block rounded-lg overflow-hidden focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                aria-label={`${project.title} - ${project.category}`}
              >
                <motion.div
                  className="relative w-full aspect-[4/3] overflow-hidden"
                  whileHover="hover"
                  whileFocus="hover"
                  initial="initial"
                >
                  {/* Usando picture para melhor performance */}
                  <picture>
                    {/* WebP para navegadores modernos */}
                    {webpSupported && (
                      <source
                        srcSet={`/images/optimized/${project.slug}/cover-medium.webp`}
                        type="image/webp"
                      />
                    )}

                    {/* JPG para navegadores sem suporte a WebP */}
                    <source
                      srcSet={`/images/optimized/${project.slug}/cover-medium.jpg`}
                      type="image/jpeg"
                    />

                    {/* Imagem com efeito de zoom */}
                    <motion.img
                      src={getOptimizedImagePath(project)}
                      alt={project.title}
                      className="absolute inset-0 w-full h-full object-cover"
                      loading="lazy" // Adiciona carregamento lazy para imagens abaixo da dobra
                      fetchPriority={index < 6 ? 'high' : 'auto'} // Prioridade alta para as primeiras 6 imagens
                      decoding="async" // Decodificação assíncrona
                      variants={{
                        initial: { scale: 1 },
                        hover: { scale: 1.03 },
                      }}
                      transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
                      onError={(e) => {
                        console.error(
                          `Failed to load optimized image for ${project.slug}`,
                        )
                        // Fallback para a imagem original
                        e.currentTarget.src = getOriginalImagePath(project)
                      }}
                    />
                  </picture>

                  {/* Dark overlay with optimized animation timing */}
                  <motion.div
                    className="absolute inset-0 bg-black"
                    variants={{
                      initial: { opacity: 0 },
                      hover: {
                        opacity: 0.9,
                        transition: {
                          duration: 0.25,
                          ease: 'easeOut',
                        },
                      },
                    }}
                    aria-hidden="true"
                  />

                  {/* Content container */}
                  <div className="absolute inset-0 pointer-events-none">
                    {/* Title positioned in the center */}
                    <div className="absolute inset-0 flex items-center justify-center p-5">
                      <motion.h3
                        className="font-[Staatliches] text-2xl text-white text-center uppercase tracking-wider"
                        style={{
                          fontFamily: "'Staatliches', Impact, sans-serif",
                          textShadow: '0 2px 4px rgba(0,0,0,0.7)',
                        }}
                        variants={{
                          initial: { opacity: 0, y: 20 },
                          hover: {
                            opacity: 1,
                            y: 0,
                            transition: {
                              duration: 0.4,
                              ease: [0.25, 0.1, 0.25, 1],
                              delay: 0.15,
                            },
                          },
                        }}
                      >
                        {project.title}
                      </motion.h3>
                    </div>

                    {/* Category tag positioned at the bottom */}
                    <div className="absolute inset-x-0 bottom-0 p-4 flex justify-center">
                      <motion.span
                        className="inline-block px-2.5 py-1 rounded bg-white/15 text-white/90 text-xs uppercase tracking-wider font-['Inter']"
                        style={{
                          fontFamily:
                            "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
                          fontWeight: 300,
                          letterSpacing: '0.03em',
                          backdropFilter: 'blur(8px)',
                          WebkitBackdropFilter: 'blur(8px)',
                        }}
                        variants={{
                          initial: { opacity: 0, y: 5 },
                          hover: {
                            opacity: 1,
                            y: 0,
                            transition: {
                              duration: 0.2,
                              ease: 'easeOut',
                            },
                          },
                        }}
                      >
                        {project.category}
                      </motion.span>
                    </div>
                  </div>
                </motion.div>
              </Link>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Empty state when no projects match the filter */}
        {projects.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="col-span-full py-16 text-center"
          >
            <p className="text-gray-500 font-['Inter']">
              {t(
                'projects.noMatches',
                'No projects match the selected categories.',
              )}
            </p>
            <p className="mt-2 text-gray-400 font-['Inter'] text-sm">
              {t(
                'projects.tryDifferent',
                'Try selecting different categories or clear the filter.',
              )}
            </p>
          </motion.div>
        )}
      </div>
    </div>
  )
})

// Adicionar displayName para melhorar depuração
ProjectGrid.displayName = 'ProjectGrid'

export default ProjectGrid
