// src/components/ProjectGallery/types.ts
export interface GalleryItem {
  image: string
  orientation?: 'landscape' | 'portrait' | 'square'
  position?: number
  originalIndex?: number // Adicionado para rastrear o índice original
  caption_de?: string
  caption_en?: string
  featured?: boolean
  mobileOnly?: boolean
  desktopOnly?: boolean
  isCoverImage?: boolean
}

export interface CoverImageConfig {
  image: string
  orientation?: 'landscape' | 'portrait' | 'square'
  includeInGallery?: boolean
  galleryPosition?: number
}

export interface ProjectGalleryProps {
  slug: string
  galleryItems: GalleryItem[]
  coverImageConfig?: CoverImageConfig
  coverImage?: string // Legacy field
  heroImageAlt: string
  isGerman: boolean
  isChangingLanguage: boolean
}
