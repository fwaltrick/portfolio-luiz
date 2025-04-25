// src/hooks/useTinaProjects.ts
import { useEffect, useState } from 'react'
import { Project } from '../types'
import { client } from '../../tina/__generated__/client'
import { useTranslation } from 'react-i18next'

export default function useTinaProjects() {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const { i18n } = useTranslation()

  useEffect(() => {
    async function fetchProjects() {
      try {
        setLoading(true)
        const result = await client.queries.projectConnection()

        // Determinar idioma atual
        const currentLang = i18n.language || 'en'
        const isGerman = currentLang.startsWith('de')

        // Verificar se temos edges disponíveis
        const edges = result.data.projectConnection?.edges || []

        // Converter o formato TinaCMS para o formato do seu app
        const formattedProjects = edges
          .filter(
            (edge): edge is NonNullable<typeof edge> => !!edge && !!edge.node,
          ) // Filtrar valores nulos
          .map((edge) => {
            const node = edge.node! // Aqui já sabemos que node não é nulo devido ao filtro acima

            // Crie um objeto que corresponda exatamente à sua interface Project
            const project: Project = {
              id: node._sys.filename,
              title: isGerman ? node.title_de : node.title_en,
              titleKey: isGerman ? 'title_de' : 'title_en',
              slug: node.slug,
              category: isGerman ? node.category_de : node.category_en,
              categoryKey: isGerman ? 'category_de' : 'category_en',
              client: node.client || undefined,
              agency: node.agency || undefined,
              year: node.year || undefined,
              creativeDirection: node.creativeDirection || undefined,
              copyright: node.copyright || undefined,
              imageUrl: node.coverImage ?? undefined,
              coverImage: undefined,
              coverImageConfig: undefined,
              order: 0,
            }

            return project
          })

        setProjects(formattedProjects)
      } catch (err) {
        console.error('Error fetching projects:', err)
        setError(err instanceof Error ? err : new Error(String(err)))
      } finally {
        setLoading(false)
      }
    }

    fetchProjects()
  }, [i18n.language])

  return { projects, loading, error }
}
