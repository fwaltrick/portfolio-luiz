// src/data/projectsData.ts
export interface ProjectData {
  id: string
  titleKey: string
  categoryKey: string
  imageUrl: string
  slug: string
}

export const projectsData: ProjectData[] = [
  {
    id: '1',
    titleKey: 'projects.mova.title',
    categoryKey: 'projects.mova.category',
    imageUrl: '/images/projects/mova-00-thumbnail.jpg',
    slug: 'mova',
  },
  {
    id: '2',
    titleKey: 'projects.kimi.title',
    categoryKey: 'projects.kimi.category',
    imageUrl: '/images/projects/kimi-00-thumbnail.jpg',
    slug: 'kimi',
  },
  {
    id: '3',
    titleKey: 'projects.palatnik.title',
    categoryKey: 'projects.palatnik.category',
    imageUrl: '/images/projects/palatnik-00-thumbnail.jpg',
    slug: 'palatnik',
  },
  {
    id: '4',
    titleKey: 'projects.blumen.title',
    categoryKey: 'projects.blumen.category',
    imageUrl: '/images/projects/blumen-00-thumbnail.jpg',
    slug: 'blumen',
  },
]
