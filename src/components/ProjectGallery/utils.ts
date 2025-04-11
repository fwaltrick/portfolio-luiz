// src/components/ProjectGallery/utils.ts
import { GalleryItem } from './types'

/**
 * Gets the optimal image size based on screen width
 */
export const getOptimalImageSize = (): string => {
  if (typeof window === 'undefined') return 'md'

  const width = window.innerWidth
  if (width >= 1440) return 'lg'
  return 'md'
}

let webpSupportCache: boolean | null = null

/**
 * Detecta suporte a WebP
 */
export const supportsWebP = (): boolean => {
  if (typeof window === 'undefined') return false

  // Se já temos o resultado em cache
  if (webpSupportCache !== null) {
    return webpSupportCache
  }

  // Tenta detectar suporte
  const elem = document.createElement('canvas')
  if (elem.getContext && elem.getContext('2d')) {
    webpSupportCache =
      elem.toDataURL('image/webp').indexOf('data:image/webp') === 0
    return webpSupportCache
  }

  webpSupportCache = false
  return false
}

/**
 * Gera o caminho da imagem otimizada com base no slug, tipo e tamanho
 */
export const getImagePath = (
  slug: string,
  imageName: string = 'hero',
  size?: string,
  format?: 'jpg' | 'webp',
): string => {
  // Determina o formato com base no suporte do navegador
  const imageFormat = format || (supportsWebP() ? 'webp' : 'jpg')

  // Tratamento especial para 'hero' - não usar sufixo para a imagem principal
  if (imageName === 'hero' && !size) {
    return `/images/optimized/${slug}/hero.${imageFormat}`
  }

  // Se tamanho não for especificado, use a versão original otimizada
  const sizeSuffix = size ? `-${size}` : ''

  return `/images/optimized/${slug}/${imageName}${sizeSuffix}.${imageFormat}`
}

/**
 * Gera um caminho de fallback para a imagem original
 */
export const getFallbackPath = (
  slug: string,
  imageName: string = 'cover',
): string => {
  // Se for 'hero', usar 'cover' no caminho original
  if (imageName === 'hero') {
    return `/images/projects/${slug}/cover.jpg`
  }

  // Se for 'gallery-XX', extrair apenas o número
  if (imageName.startsWith('gallery-')) {
    // Remover 'gallery-' e zero à esquerda
    const number = imageName.replace('gallery-', '').replace(/^0+/, '')
    // Se ficar vazio, usar '1'
    return `/images/projects/${slug}/${number || '1'}.jpg`
  }

  // Caso padrão
  return `/images/projects/${slug}/${imageName}.jpg`
}

/**
 * Gera um srcSet para imagens responsivas
 */
export const generateSrcSet = (
  slug: string,
  imageName: string = 'hero',
  format: 'jpg' | 'webp' = 'jpg',
): string => {
  // Tratamento especial para 'hero'
  if (imageName === 'hero') {
    return `
      ${getImagePath(slug, imageName, undefined, format)} 1800w,
      ${getImagePath(slug, imageName, 'md', format)} 800w
    `
  }

  // Para outras imagens, usar apenas md e lg conforme script de otimização
  return `
    ${getImagePath(slug, imageName, 'md', format)} 800w,
    ${getImagePath(slug, imageName, 'lg', format)} 1400w
  `
}

/**
 * Mapeia o índice da imagem para o nome do arquivo
 */
export const getImageNameFromIndex = (
  index: number,
  isCoverImage: boolean = false,
): string => {
  if (isCoverImage) return 'hero'
  return `gallery-${String(index).padStart(2, '0')}`
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

/**
 * Função auxiliar para debug - registra tentativas de carregamento de imagem
 */
export const logImageLoadAttempt = (
  slug: string,
  imageName: string,
  size?: string,
  format?: string,
): void => {
  if (process.env.NODE_ENV === 'development') {
    console.log(`Tentando carregar imagem:`, {
      optimizedPath: getImagePath(
        slug,
        imageName,
        size,
        format as 'jpg' | 'webp',
      ),
      fallbackPath: getFallbackPath(slug, imageName),
      slug,
      imageName,
      size,
      format,
    })
  }
}
