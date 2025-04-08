import React, { useState, useCallback, memo } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { Project } from '../../types'
import CategoryFilter from '../CategoryFilter'
import { useCategories } from '../../hooks/useCategories'

interface ProjectGridProps {
  projects: Project[]
  loading?: boolean
}

const ProjectGrid: React.FC<ProjectGridProps> = memo(
  ({ projects = [], loading = false }) => {
    const { t } = useTranslation()
    const [selectedCategories, setSelectedCategories] = useState<string[]>([])
    const [webpSupported, setWebpSupported] = useState(false)

    // Use the categories hook
    const categories = useCategories(projects)

    // Handler for category changes
    const handleCategoryChange = useCallback((newCategories: string[]) => {
      setSelectedCategories(newCategories)
    }, [])

    // Filter projects based on selected categories
    const filteredProjects = React.useMemo(() => {
      if (selectedCategories.length === 0) {
        return projects
      }
      return projects.filter((project) =>
        selectedCategories.includes(project.category),
      )
    }, [projects, selectedCategories])

    // Check WebP support on component mount
    React.useEffect(() => {
      const checkWebPSupport = () => {
        const elem = document.createElement('canvas')
        if (elem.getContext && elem.getContext('2d')) {
          return elem.toDataURL('image/webp').indexOf('data:image/webp') === 0
        }
        return false
      }

      setWebpSupported(checkWebPSupport())
    }, [])

    // Image path utility functions
    const getOptimizedImagePath = useCallback(
      (project: Project): string => {
        if (!project || !project.slug) return ''
        const format = webpSupported ? 'webp' : 'jpg'
        return `/images/optimized/${project.slug}/cover-medium.${format}`
      },
      [webpSupported],
    )

    const getOriginalImagePath = useCallback((project: Project): string => {
      if (
        project.imageUrl &&
        (project.imageUrl.startsWith('http') ||
          project.imageUrl.startsWith('/'))
      ) {
        if (project.imageUrl.includes('-thumbnail.jpg')) {
          return `/images/projects/${project.slug}/thumbnail.jpg`
        }
        return project.imageUrl
      }
      return `/images/projects/${project.slug}/thumbnail.jpg`
    }, [])

    if (loading) {
      return (
        <div className="w-full">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 md:gap-6 w-full pt-6 pb-12 md:pt-6 md:pb-16 lg:pt-6 lg:pb-20">
            {[...Array(6)].map((_, index) => (
              <div
                key={index}
                className="bg-gray-100 rounded-lg overflow-hidden aspect-[4/3] animate-pulse"
              />
            ))}
          </div>
        </div>
      )
    }

    return (
      <div className="w-full">
        {/* Only show filter if we have categories */}
        {categories.length > 0 && (
          <CategoryFilter
            categories={categories}
            selectedCategories={selectedCategories}
            onCategoryChange={handleCategoryChange}
          />
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 md:gap-6 w-full pt-6 pb-12 md:pt-6 md:pb-16 lg:pt-6 lg:pb-20">
          <AnimatePresence>
            {filteredProjects.map((project, index) => (
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
                    {/* Using picture for better performance */}
                    <picture>
                      {/* WebP for modern browsers */}
                      {webpSupported && (
                        <source
                          srcSet={`/images/optimized/${project.slug}/cover-medium.webp`}
                          type="image/webp"
                        />
                      )}

                      {/* JPG for browsers without WebP support */}
                      <source
                        srcSet={`/images/optimized/${project.slug}/cover-medium.jpg`}
                        type="image/jpeg"
                      />

                      {/* Image with zoom effect */}
                      <motion.img
                        src={getOptimizedImagePath(project)}
                        alt={project.title}
                        className="absolute inset-0 w-full h-full object-cover"
                        loading="lazy"
                        fetchPriority={index < 6 ? 'high' : 'auto'}
                        decoding="async"
                        variants={{
                          initial: { scale: 1 },
                          hover: { scale: 1.03 },
                        }}
                        transition={{
                          duration: 0.5,
                          ease: [0.25, 0.1, 0.25, 1],
                        }}
                        onError={(e) => {
                          console.error(
                            `Failed to load optimized image for ${project.slug}`,
                          )
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
                          className="[text-wrap:balance] font-[Staatliches] text-2xl text-white text-center uppercase tracking-wider"
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
          {filteredProjects.length === 0 && (
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
              {selectedCategories.length > 0 && (
                <button
                  className="mt-4 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-md text-sm transition-colors duration-200"
                  onClick={() => setSelectedCategories([])}
                >
                  {t('filter.clearAll', 'Clear all filters')}
                </button>
              )}
            </motion.div>
          )}
        </div>
      </div>
    )
  },
)

ProjectGrid.displayName = 'ProjectGrid'

export default ProjectGrid
