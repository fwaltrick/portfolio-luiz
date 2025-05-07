import React, { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Project } from '../../types'

interface RelatedProjectsProps {
  currentProject: Project
  allProjects: Project[]
}

const getTrimmedTitle = (title: string | undefined | null): string => {
  if (!title) return ''
  const parts = title.split('–')
  if (parts.length > 1) {
    return parts[0].trim()
  }
  return title
}

const RelatedProjects: React.FC<RelatedProjectsProps> = ({
  currentProject,
  allProjects,
}) => {
  const { i18n } = useTranslation()
  const isGerman = i18n.language.startsWith('de')

  const navigationLabels = {
    previous: isGerman ? 'Zurück' : 'Previous',
    next: isGerman ? 'Weiter' : 'Next',
  }

  const relatedProjects = useMemo(() => {
    if (!allProjects || !currentProject) return []
    const currentCategory = isGerman
      ? currentProject.category_de || currentProject.category
      : currentProject.category_en || currentProject.category
    let related = allProjects.filter((project) => {
      const projectCategory = isGerman
        ? project.category_de || project.category
        : project.category_en || project.category
      return (
        projectCategory === currentCategory &&
        project.slug !== currentProject.slug
      )
    })
    if (related.length < 3) {
      const otherProjects = allProjects.filter(
        (project) =>
          project.slug !== currentProject.slug && !related.includes(project),
      )
      const shuffled = [...otherProjects].sort(() => 0.5 - Math.random())
      related = [...related, ...shuffled.slice(0, 3 - related.length)]
    }
    return related.slice(0, 3).sort(() => 0.5 - Math.random())
  }, [currentProject, allProjects, isGerman])

  const { nextProject, previousProject } = useMemo(() => {
    if (!allProjects || !currentProject || allProjects.length < 2) {
      return { nextProject: null, previousProject: null }
    }
    const sortedProjects = [...allProjects].sort((a, b) => {
      if ((a.order || 9999) !== (b.order || 9999)) {
        return (a.order || 9999) - (b.order || 9999)
      }
      const yearA = parseInt(a.year || '0', 10)
      const yearB = parseInt(b.year || '0', 10)
      if (yearA !== yearB) {
        return yearB - yearA
      }
      const titleA =
        (isGerman ? a.title_de || a.title : a.title_en || a.title) || ''
      const titleB =
        (isGerman ? b.title_de || b.title : b.title_en || b.title) || ''
      return titleA.localeCompare(titleB)
    })
    const currentIndex = sortedProjects.findIndex(
      (p) => p.slug === currentProject.slug,
    )
    if (currentIndex === -1) {
      return { nextProject: null, previousProject: null }
    }
    const prevIndex = currentIndex > 0 ? currentIndex - 1 : null
    const nextIndex =
      currentIndex < sortedProjects.length - 1 ? currentIndex + 1 : null
    return {
      previousProject: prevIndex !== null ? sortedProjects[prevIndex] : null,
      nextProject: nextIndex !== null ? sortedProjects[nextIndex] : null,
    }
  }, [currentProject, allProjects, isGerman])

  const seeAlsoTitle = isGerman ? 'SIEHE AUCH' : 'SEE ALSO'

  return (
    <div className="w-full py-20 pb-4 bg-jumbo-50">
      <div className="container-custom">
        {' '}
        {/* Verifique o max-width deste container */}
        <div className="mb-12">
          <h2 className="text-4xl font-staatliches uppercase mb-6 text-jumbo-950">
            {seeAlsoTitle}
          </h2>
          <div className="flex flex-nowrap gap-6 overflow-x-auto pb-4 md:flex-wrap md:justify-between md:overflow-visible scrollbar-thin scrollbar-thumb-jumbo-300 scrollbar-track-jumbo-100 -mx-4 px-4 md:mx-0 md:px-0">
            {relatedProjects.map((project) => {
              const projectTitle = isGerman
                ? project.title_de || project.title
                : project.title_en || project.title
              const displayTitle = getTrimmedTitle(projectTitle)

              return (
                <Link
                  to={`/project/${project.slug}`}
                  key={project.slug}
                  className="flex-none w-[280px] md:w-auto md:flex-1 md:basis-[calc(33.333%-1rem)] md:min-w-[280px]  xl:max-w-[520px] group transition-colors duration-300"
                >
                  {/* MUDANÇA: Usando aspect-video para proporção 16:9 */}
                  <div className="w-full aspect-video overflow-hidden mb-3 rounded-lg">
                    <picture>
                      <source
                        srcSet={`/images/optimized/${project.slug}/hero-md.webp`}
                        type="image/webp"
                      />
                      <source
                        srcSet={`/images/optimized/${project.slug}/hero-md.jpg`}
                        type="image/jpeg"
                      />
                      <img
                        src={`/images/optimized/${project.slug}/hero-md.jpg`}
                        alt={displayTitle}
                        className="w-full h-full object-cover transition-transform duration-500
                                  group-hover:scale-105"
                        onError={(e) => {
                          e.currentTarget.src =
                            project.imageUrl ||
                            `/images/projects/${project.slug}/hero.jpg`
                        }}
                      />
                    </picture>
                  </div>
                  <h3
                    className="text-xl font-staatliches uppercase mt-1 text-jumbo-950
                                transition-colors duration-300 group-hover:text-jumbo-600
                                line-clamp-2 md:line-clamp-none"
                    title={projectTitle}
                  >
                    {displayTitle}
                  </h3>
                </Link>
              )
            })}
          </div>
        </div>
        <div className="flex justify-between pb-4 flex-row gap-4 md:gap-0">
          <div className="flex-1">
            {previousProject && (
              <Link
                to={`/project/${previousProject.slug}`}
                className="flex items-center gap-2 text-xl text-jumbo-800 hover:text-jumbo-600
                          transition-colors duration-300 group"
              >
                <span className="text-2xl transition-transform duration-300 group-hover:-translate-x-1">
                  &#8592;
                </span>
                <span className="font-staatliches hidden md:inline">
                  {getTrimmedTitle(
                    isGerman
                      ? previousProject.title_de || previousProject.title
                      : previousProject.title_en || previousProject.title,
                  )}
                </span>
                <span className="font-staatliches md:hidden">
                  {navigationLabels.previous}
                </span>
              </Link>
            )}
          </div>

          <div className="flex-1 text-right">
            {nextProject && (
              <Link
                to={`/project/${nextProject.slug}`}
                className="inline-flex items-center gap-2 text-xl text-jumbo-800 hover:text-jumbo-600
                          transition-colors duration-300 group justify-end"
              >
                <span className="font-staatliches hidden md:inline">
                  {getTrimmedTitle(
                    isGerman
                      ? nextProject.title_de || nextProject.title
                      : nextProject.title_en || nextProject.title,
                  )}
                </span>
                <span className="font-staatliches md:hidden">
                  {navigationLabels.next}
                </span>
                <span className="text-2xl transition-transform duration-300 group-hover:translate-x-1">
                  &#8594;
                </span>
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default RelatedProjects
