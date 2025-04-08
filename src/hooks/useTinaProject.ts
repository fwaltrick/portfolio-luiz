// src/hooks/useTinaProject.ts
import { useEffect, useState } from 'react'
import { Project } from '../types'
import { client } from '../../tina/__generated__/client'
import { useTranslation } from 'react-i18next'

export default function useTinaProject(slug: string) {
  const [project, setProject] = useState<Project | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const { i18n } = useTranslation()

  useEffect(() => {
    async function fetchProject() {
      try {
        setLoading(true)
        const result = await client.queries.project({
          relativePath: `${slug}.mdx`,
        })

        if (!result.data.project) {
          throw new Error('Project not found')
        }

        const tinaProject = result.data.project

        // Determinar idioma atual
        const currentLang = i18n.language || 'en'
        const isGerman = currentLang.startsWith('de')

        // Converter o formato TinaCMS para o formato do seu app
        // Garantindo que todas as propriedades da interface Project estejam presentes
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
                .filter((item): item is NonNullable<typeof item> => !!item) // Filtrar itens nulos
                .map((item, index) => ({
                  src: `/images/projects/${slug}/${String(index + 1).padStart(
                    2,
                    '0',
                  )}.jpg`,
                  caption: isGerman
                    ? item.caption_de || undefined
                    : item.caption_en || undefined,
                  featured: item.featured || false,
                }))
            : undefined,
        }

        setProject(formattedProject)
      } catch (err) {
        console.error(`Error fetching project ${slug}:`, err)
        setError(err instanceof Error ? err : new Error(String(err)))
      } finally {
        setLoading(false)
      }
    }

    if (slug) {
      fetchProject()
    }
  }, [slug, i18n.language])

  return { project, loading, error }
}
