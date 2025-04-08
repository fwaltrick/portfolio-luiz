// src/hooks/useProjectDetail.ts
import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Project } from '../types'
import { client } from '../../tina/__generated__/client'
import useProjects from './useProjects'

export default function useProjectDetail(slug: string) {
  const [project, setProject] = useState<Project | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const { t, i18n } = useTranslation()
  const { projects: contextProjects } = useProjects() // Usar projetos do contexto como fallback

  useEffect(() => {
    async function fetchProject() {
      if (!slug) {
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        setError(null)
        console.log(`[useProjectDetail] Fetching project with slug: ${slug}`)

        // Tentar buscar do TinaCMS primeiro
        try {
          const result = await client.queries.project({
            relativePath: `${slug}.mdx`,
          })

          if (result.data.project) {
            const tinaProject = result.data.project
            console.log(
              '[useProjectDetail] TinaCMS project found:',
              tinaProject,
            )

            // Determinar idioma atual
            const currentLang = i18n.language || 'en'
            const isGerman = currentLang.startsWith('de')

            // Converter para formato compatível
            const formattedProject: Project = {
              id: tinaProject._sys.filename,
              title: isGerman ? tinaProject.title_de : tinaProject.title_en,
              titleKey: isGerman ? 'title_de' : 'title_en',
              slug: tinaProject.slug,
              category: isGerman
                ? tinaProject.category_de
                : tinaProject.category_en,
              categoryKey: isGerman ? 'category_de' : 'category_en',
              client: tinaProject.client || undefined,
              agency: tinaProject.agency || undefined,
              year: tinaProject.year || undefined,
              creativeDirection: tinaProject.creativeDirection || undefined,
              copyright: tinaProject.copyright || undefined,
              imageUrl: tinaProject.coverImage,
              description: isGerman
                ? tinaProject.description_de
                : tinaProject.description_en,
              img01: tinaProject.img01 || undefined,
              gallery: tinaProject.gallery
                ? tinaProject.gallery
                    .filter((item): item is NonNullable<typeof item> => !!item)
                    .map((item, index) => ({
                      src: `/images/projects/${slug}/${String(
                        index + 1,
                      ).padStart(2, '0')}.jpg`,
                      caption: isGerman
                        ? item.caption_de || undefined
                        : item.caption_en || undefined,
                      featured: item.featured || false,
                    }))
                : undefined,
            }

            setProject(formattedProject)
            setLoading(false)
            return
          }
        } catch (tinaError) {
          console.error(
            '[useProjectDetail] Error fetching from TinaCMS:',
            tinaError,
          )
          // Não definimos o erro aqui, apenas logamos e continuamos com o fallback
        }

        // Fallback: Buscar do contexto
        console.log(
          '[useProjectDetail] Trying to find project in context:',
          slug,
        )
        const contextProject = contextProjects.find((p) => p.slug === slug)

        if (contextProject) {
          console.log(
            '[useProjectDetail] Project found in context:',
            contextProject,
          )
          setProject(contextProject)
        } else {
          console.log('[useProjectDetail] Project not found in context:', slug)
          setProject(null)
        }
      } catch (err) {
        console.error(`[useProjectDetail] Error fetching project ${slug}:`, err)
        setError(err instanceof Error ? err : new Error(String(err)))
      } finally {
        setLoading(false)
      }
    }

    fetchProject()
  }, [slug, i18n.language, contextProjects])

  return { project, loading, error }
}
