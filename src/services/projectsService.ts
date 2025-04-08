// src/services/projectsService.ts
import { Project } from '../types'
import { projects as projectsFromFile } from '../data/projectsData'
import { client } from '../../tina/__generated__/client'

// Interface for consistent data fetching
export interface ProjectsDataSource {
  fetchProjects(): Promise<Project[]>
}

// Tina CMS data source
export class TinaProjectsDataSource implements ProjectsDataSource {
  constructor(private isGerman: boolean) {}

  async fetchProjects(): Promise<Project[]> {
    try {
      const result = await client.queries.projectConnection()
      const edges = result.data.projectConnection?.edges || []

      return edges
        .filter(
          (edge): edge is NonNullable<typeof edge> => !!edge && !!edge.node,
        )
        .map((edge) => {
          const node = edge.node!

          // Create a Project object with all required properties
          const project: Project = {
            id: node._sys.filename,
            title: this.isGerman ? node.title_de : node.title_en,
            slug: node.slug,
            category: this.isGerman ? node.category_de : node.category_en,
            // Include these properties now that they're in the interface
            titleKey: this.isGerman ? 'title_de' : 'title_en',
            categoryKey: this.isGerman ? 'category_de' : 'category_en',
            // Include other properties from the node
            client: node.client || undefined,
            agency: node.agency || undefined,
            year: node.year || undefined,
            creativeDirection: node.creativeDirection || undefined,
            copyright: node.copyright || undefined,
            imageUrl: node.coverImage,
            // Store both language versions for future use
            title_de: node.title_de,
            title_en: node.title_en,
            description_de: node.description_de,
            description_en: node.description_en,
            order: 0,
          }

          return project
        })
    } catch (error) {
      console.error('Error fetching projects from Tina CMS:', error)
      throw new Error('Failed to fetch projects from Tina CMS')
    }
  }
}

// Local file data source
export class LocalProjectsDataSource implements ProjectsDataSource {
  constructor(private translate: (key: string) => string) {}

  async fetchProjects(): Promise<Project[]> {
    // Simulate async behavior for consistency
    return Promise.resolve(
      projectsFromFile.map((project) => ({
        ...project,
        title: project.titleKey
          ? this.translate(project.titleKey)
          : project.title,
        category: project.categoryKey
          ? this.translate(project.categoryKey)
          : project.category,
      })),
    )
  }
}

// Factory function to get the appropriate data source
export function getProjectsDataSource(
  useTina: boolean,
  isGerman: boolean,
  translate: (key: string) => string,
): ProjectsDataSource {
  return useTina
    ? new TinaProjectsDataSource(isGerman)
    : new LocalProjectsDataSource(translate)
}
