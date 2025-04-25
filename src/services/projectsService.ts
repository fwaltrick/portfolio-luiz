import { Project } from '../types' // Use the user's Project type
import { client } from '../../tina/__generated__/client' // Keep Tina client

// Interface DataSource (Mantida)
export interface ProjectsDataSource {
  fetchProjects(): Promise<Project[]>
}

// Tina CMS data source - FILTROS E MAPEAMENTO SIMPLIFICADOS
export class TinaProjectsDataSource implements ProjectsDataSource {
  constructor(private isGerman: boolean) {}

  async fetchProjects(): Promise<Project[]> {
    try {
      const result = await client.queries.projectConnection()
      // Use 'any' temporarily for edges/nodes if generated types cause issues
      const edges = result.data.projectConnection?.edges || []

      const mappedProjects = edges
        // Filtro 1: Simples, apenas checa se edge e node existem (runtime check)
        .filter((edge) => !!edge?.node)
        // Map: Assume que 'edge' e 'node' existem após o filtro. Usa '?' ou '!' se TS reclamar.
        .map((edge) => {
          // Use non-null assertion '!' com cuidado se TS reclamar, ou use optional chaining '?.'
          const node = edge!.node!

          // Mapeamento cuidadoso para o tipo 'Project' de src/types.ts
          // Usando optional chaining e nullish coalescing
          const project: Project = {
            id: node.id || node._sys?.filename || 'no-id', // Fallback extra
            slug: node.slug ?? '',
            title: (this.isGerman ? node.title_de : node.title_en) ?? '',
            category:
              (this.isGerman ? node.category_de : node.category_en) ?? '',
            order: node.order ?? 999,
            coverImage: node.coverImage || node.coverImageConfig?.image || null,
            coverImageConfig: node.coverImageConfig ?? null,
            title_de: node.title_de ?? undefined,
            title_en: node.title_en ?? undefined,
            category_de: node.category_de ?? undefined,
            category_en: node.category_en ?? undefined,
            description_de: node.description_de ?? null,
            description_en: node.description_en ?? null,
            client: node.client ?? undefined,
            agency: node.agency ?? undefined,
            year: node.year ?? undefined,
            creativeDirection: node.creativeDirection ?? undefined,
            copyright: node.copyright ?? undefined,
            title_bra: node.title_bra ?? undefined,

            gallery:
              node.gallery
                // Filtro simples para item e item.image
                ?.filter((item) => !!item?.image)
                // Mapeamento para o tipo Project['gallery']
                .map((item) => ({
                  // Assume 'item' não é nulo aqui após o filtro
                  src: item!.image!, // Usa '!' se TS reclamar, ou confie no filtro
                  caption_de: item!.caption_de ?? undefined,
                  caption_en: item!.caption_en ?? undefined,
                  featured: item!.featured ?? false,
                  caption: undefined,
                })) ?? [], // Default para array vazio
          }
          // Campos legados opcionais não são mapeados
          return project
        })

      return mappedProjects
    } catch (error) {
      console.error('Error fetching or mapping projects from Tina CMS:', error)
      return []
    }
  }
}

// Factory function (sem alterações)
export function getProjectsDataSource(isGerman: boolean): ProjectsDataSource {
  return new TinaProjectsDataSource(isGerman)
}
