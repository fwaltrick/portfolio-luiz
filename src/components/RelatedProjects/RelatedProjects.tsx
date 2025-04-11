import React, { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Project } from '../../types'

interface RelatedProjectsProps {
  currentProject: Project
  allProjects: Project[]
}

// Função auxiliar para truncar texto já não é mais necessária
// Removida para evitar código não utilizado

const RelatedProjects: React.FC<RelatedProjectsProps> = ({
  currentProject,
  allProjects,
}) => {
  const { i18n } = useTranslation()
  const isGerman = i18n.language.startsWith('de')

  // Tradução dos rótulos de navegação
  const navigationLabels = {
    previous: isGerman ? 'Zurück' : 'Previous',
    next: isGerman ? 'Weiter' : 'Next',
  }

  // Encontrar projetos relacionados da mesma categoria
  const relatedProjects = useMemo(() => {
    if (!allProjects || !currentProject) return []

    // Determinar a categoria atual com base no idioma
    const currentCategory = isGerman
      ? currentProject.category_de || currentProject.category
      : currentProject.category_en || currentProject.category

    // Filtrar projetos da mesma categoria, excluindo o projeto atual
    let related = allProjects.filter((project) => {
      const projectCategory = isGerman
        ? project.category_de || project.category
        : project.category_en || project.category

      return (
        projectCategory === currentCategory &&
        project.slug !== currentProject.slug
      )
    })

    // Se não houver projetos suficientes da mesma categoria, adicionar outros projetos
    if (related.length < 3) {
      const otherProjects = allProjects.filter(
        (project) =>
          project.slug !== currentProject.slug && !related.includes(project),
      )

      // Embaralhar os outros projetos para variação
      const shuffled = [...otherProjects].sort(() => 0.5 - Math.random())

      // Adicionar projetos adicionais até chegar a 3 ou até acabarem os projetos
      related = [...related, ...shuffled.slice(0, 3 - related.length)]
    }

    // Limitar a 3 projetos e embaralhar para garantir variação
    return related.slice(0, 3).sort(() => 0.5 - Math.random())
  }, [currentProject, allProjects, isGerman])

  // Encontrar o próximo e o projeto anterior usando a mesma lógica de ordenação do ProjectsProvider
  const { nextProject, previousProject } = useMemo(() => {
    if (!allProjects || !currentProject || allProjects.length < 2) {
      return { nextProject: null, previousProject: null }
    }

    // Usar EXATAMENTE a mesma lógica de ordenação do ProjectsProvider
    const sortedProjects = [...allProjects].sort((a, b) => {
      // Primary sort by order field
      if ((a.order || 9999) !== (b.order || 9999)) {
        return (a.order || 9999) - (b.order || 9999)
      }

      // Secondary sort by year (most recent first) if orders are equal
      const yearA = parseInt(a.year || '0', 10)
      const yearB = parseInt(b.year || '0', 10)
      if (yearA !== yearB) {
        return yearB - yearA
      }

      // Tertiary sort by title alphabetically if years are also equal
      const titleA =
        (isGerman ? a.title_de || a.title : a.title_en || a.title) || ''
      const titleB =
        (isGerman ? b.title_de || b.title : b.title_en || b.title) || ''
      return titleA.localeCompare(titleB)
    })

    // Encontrar o índice do projeto atual na lista ordenada
    const currentIndex = sortedProjects.findIndex(
      (p) => p.slug === currentProject.slug,
    )

    if (currentIndex === -1) {
      return { nextProject: null, previousProject: null }
    }

    // Determinar o projeto anterior (se existir)
    const prevIndex = currentIndex > 0 ? currentIndex - 1 : null

    // Determinar o próximo projeto (se existir)
    const nextIndex =
      currentIndex < sortedProjects.length - 1 ? currentIndex + 1 : null

    return {
      previousProject: prevIndex !== null ? sortedProjects[prevIndex] : null,
      nextProject: nextIndex !== null ? sortedProjects[nextIndex] : null,
    }
  }, [currentProject, allProjects, isGerman])

  // Título da seção baseado no idioma
  const seeAlsoTitle = isGerman ? 'SIEHE AUCH' : 'SEE ALSO'

  return (
    <div className="w-full py-14 pb-4 bg-jumbo-50">
      {' '}
      <div className="container-custom">
        {/* Seção See Also */}
        <div className="mb-8">
          <h2 className="text-4xl font-staatliches uppercase mb-6 text-jumbo-950">
            {seeAlsoTitle}
          </h2>

          {/* Container para scroll horizontal em mobile */}
          <div
            className="flex flex-nowrap gap-6 overflow-x-auto pb-4 md:flex-wrap md:overflow-visible
                          scrollbar-thin scrollbar-thumb-jumbo-300 scrollbar-track-jumbo-100
                          -mx-4 px-4 md:mx-0 md:px-0"
          >
            {' '}
            {/* Negative margin para o scroll ir até a borda */}
            {relatedProjects.map((project) => {
              // Obter o título do projeto com base no idioma
              const projectTitle = isGerman
                ? project.title_de || project.title
                : project.title_en || project.title

              return (
                <Link
                  to={`/project/${project.slug}`}
                  key={project.slug}
                  className="flex-none w-[280px] min-w-[280px] max-w-[280px] 
                 md:w-auto md:min-w-[280px] md:max-w-[360px] 
                 md:flex-1 md:basis-[calc(33.333%-1rem)] group 
                 transition-colors duration-300"
                >
                  <div className="w-full h-[180px] md:h-[200px] overflow-hidden mb-3 rounded-lg">
                    <picture>
                      {/* WebP para navegadores modernos */}
                      <source
                        srcSet={`/images/optimized/${project.slug}/hero-md.webp`}
                        type="image/webp"
                      />
                      {/* JPG para navegadores sem suporte a WebP */}
                      <source
                        srcSet={`/images/optimized/${project.slug}/hero-md.jpg`}
                        type="image/jpeg"
                      />
                      <img
                        src={`/images/optimized/${project.slug}/hero-md.jpg`}
                        alt=""
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
                    title={projectTitle} // Tooltip com o título completo
                  >
                    {projectTitle}
                  </h3>
                </Link>
              )
            })}
          </div>
        </div>

        {/* Navegação para próximo/anterior projeto - Sem borda superior */}
        <div className="flex justify-between pb-8 md:flex-row flex-col gap-4 md:gap-0">
          {' '}
          {/* Removida a borda e ajustado padding */}
          {/* Lado esquerdo - sempre para o projeto anterior */}
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
                  {isGerman
                    ? previousProject.title_de || previousProject.title
                    : previousProject.title_en || previousProject.title}
                </span>
                <span className="font-staatliches md:hidden">
                  {navigationLabels.previous}
                </span>
              </Link>
            )}
          </div>
          {/* Lado direito - sempre para o próximo projeto */}
          <div className="flex-1 text-right">
            {nextProject && (
              <Link
                to={`/project/${nextProject.slug}`}
                className="inline-flex items-center gap-2 text-xl text-jumbo-800 hover:text-jumbo-600 
                          transition-colors duration-300 group justify-end"
              >
                <span className="font-staatliches hidden md:inline">
                  {isGerman
                    ? nextProject.title_de || nextProject.title
                    : nextProject.title_en || nextProject.title}
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
