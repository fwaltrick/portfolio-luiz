// src/components/ProjectGallery/utils.ts

import { GalleryItem } from './types'

/**
 * Gets the optimal image size based on screen width
 */
export const getOptimalImageSize = (): string => {
  if (typeof window === 'undefined') return 'large'

  const width = window.innerWidth
  if (width >= 1440) return 'desktop'
  if (width >= 1024) return 'large'
  if (width >= 768) return 'medium'
  return 'thumbnail'
}

/**
 * Generates the appropriate image path based on the slug, image index, and device
 */
export const getImagePath = (
  slug: string,
  index: number,
  isCoverImage: boolean,
  size: string = 'large',
  format: 'jpg' | 'webp' = 'jpg',
): string => {
  const baseFilename = isCoverImage
    ? 'cover'
    : `img-${String(index).padStart(2, '0')}`

  // For original size (no suffix)
  if (size === 'original') {
    return `/images/optimized/${slug}/${baseFilename}.${format}`
  }

  // For responsive sizes
  return `/images/optimized/${slug}/${baseFilename}-${size}.${format}`
}

/**
 * Generates a fallback image path
 */
export const getFallbackPath = (
  slug: string,
  index: number,
  isCoverImage: boolean,
): string => {
  if (isCoverImage) {
    return `/images/projects/${slug}/cover.jpg`
  }

  const formattedIndex = String(index).padStart(2, '0')
  return `/images/projects/${slug}/${formattedIndex}.jpg`
}

/**
 * Generates a srcSet for responsive images
 */
export const generateSrcSet = (
  slug: string,
  index: number,
  isCoverImage: boolean,
  format: 'jpg' | 'webp' = 'jpg',
): string => {
  const baseFilename = isCoverImage
    ? 'cover'
    : `img-${String(index).padStart(2, '0')}`

  return `
    /images/optimized/${slug}/${baseFilename}-thumbnail.${format} 400w,
    /images/optimized/${slug}/${baseFilename}-medium.${format} 800w,
    /images/optimized/${slug}/${baseFilename}-large.${format} 1200w,
    /images/optimized/${slug}/${baseFilename}-desktop.${format} 1800w
  `
}

/**
 * Assigns positions to gallery items if not already set
 */
export const assignPositions = (items: GalleryItem[]): GalleryItem[] => {
  if (!items || !Array.isArray(items)) return []

  const positionMap = new Map<number, boolean>()

  // First pass: gather existing positions
  items.forEach((item) => {
    if (item.position) {
      positionMap.set(item.position, true)
    }
  })

  // Find the next available position
  const getNextPosition = (): number => {
    let position = 1
    while (positionMap.has(position)) {
      position++
    }
    return position
  }

  // Second pass: assign positions to items without them
  return items.map((item) => {
    if (!item.position) {
      const nextPos = getNextPosition()
      positionMap.set(nextPos, true)
      return { ...item, position: nextPos }
    }
    return item
  })
}
