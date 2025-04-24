import React, { useState, useEffect, useMemo, useCallback } from 'react'
import { motion } from 'framer-motion'
import { useMediaQuery } from 'react-responsive'
import { ProjectGalleryProps, GalleryItem } from './types'
import { getImagePath, supportsWebP } from './utils'
import './ProjectGallery.css'

const ProjectGallery: React.FC<ProjectGalleryProps> = ({
  slug,
  galleryItems = [],
  coverImageConfig,
  coverImage,
  heroImageAlt,
  isGerman,
}) => {
  // State for tracking image load errors and loaded status
  const [loadErrors, setLoadErrors] = useState<Record<number, boolean>>({})
  const [loadedImages, setLoadedImages] = useState<Record<number, boolean>>({})
  const [debugMode, setDebugMode] = useState<boolean>(
    process.env.NODE_ENV === 'development' && false,
  )

  // Media query hook for responsive design
  const isMobile = useMediaQuery({ maxWidth: 767 })
  const isTablet = useMediaQuery({ minWidth: 768, maxWidth: 1023 })
  const isDesktop = useMediaQuery({ minWidth: 1024 })
  const isLargeDesktop = useMediaQuery({ minWidth: 1440 })

  // Determine the optimal image size for the device
  const optimalSize = useMemo(() => {
    if (isMobile) return 'md' // Alterado de 'sm' para 'md' já que não temos mais 'sm'
    if (isTablet) return 'md'
    return 'lg'
  }, [isMobile, isTablet])

  // Check for WebP support
  const webpSupported = useMemo(() => supportsWebP(), [])

  // Use WebP if supported, fallback to JPEG
  const imageFormat = useMemo(
    () => (webpSupported ? 'webp' : 'jpg'),
    [webpSupported],
  )

  // Log component props for debugging
  useEffect(() => {
    if (debugMode) {
      console.log('ProjectGallery rendered with:', {
        slug,
        galleryItemsCount: galleryItems?.length || 0,
        hasCoverConfig: !!coverImageConfig,
        optimalSize,
        imageFormat,
        webpSupported,
        isMobile,
        isTablet,
        isDesktop,
        isLargeDesktop,
      })
    }
  }, [
    slug,
    galleryItems,
    coverImageConfig,
    debugMode,
    optimalSize,
    imageFormat,
    webpSupported,
    isMobile,
    isTablet,
    isDesktop,
    isLargeDesktop,
  ])

  // Função para atribuir posições aos itens da galeria
  const assignPositions = (items: GalleryItem[]): GalleryItem[] => {
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

  // Process gallery items - handle sorting, filtering, and cover image inclusion
  const processedGalleryItems = useMemo(() => {
    // Ensure we have an array to work with
    if (
      !galleryItems ||
      !Array.isArray(galleryItems) ||
      galleryItems.length === 0
    ) {
      if (debugMode) console.log('No gallery items to process')
      return []
    }

    // Deep copy to avoid mutating props
    const items: GalleryItem[] = JSON.parse(JSON.stringify(galleryItems)).map(
      (item: GalleryItem, index: number) => {
        // Tentar extrair o número do arquivo da imagem para usar como originalIndex
        let extractedIndex = index + 1

        if (item.image && typeof item.image === 'string') {
          // Extrair número do nome do arquivo (ex: "9.jpg" ou "/9.jpg" ou "image-9.jpg")
          const match = item.image.match(/(\d+)\.[a-zA-Z]+$/)
          if (match && match[1]) {
            extractedIndex = parseInt(match[1], 10)
            if (debugMode) {
              console.log(
                `Extracted index ${extractedIndex} from image path: ${item.image}`,
              )
            }
          }
        }

        return {
          ...item,
          originalIndex: extractedIndex,
        }
      },
    )

    // Add cover image to gallery if configured
    if (
      coverImageConfig?.includeInGallery &&
      (coverImageConfig?.image || coverImage)
    ) {
      if (debugMode)
        console.log(
          'Adding cover image to gallery at position:',
          coverImageConfig.galleryPosition,
        )

      items.push({
        image: coverImageConfig.image || coverImage || '',
        orientation: coverImageConfig.orientation || 'landscape',
        position: coverImageConfig.galleryPosition || 999,
        isCoverImage: true,
      })
    }

    // Assign positions to items without them
    const itemsWithPositions = assignPositions(items)

    // Filter items based on device type
    const filteredItems = itemsWithPositions.filter((item) => {
      if (isMobile && item.desktopOnly) return false
      if (!isMobile && item.mobileOnly) return false
      return true
    })

    // Sort items by position (para exibição)
    const sortedItems = filteredItems.sort((a, b) => {
      const posA = a.position || 999
      const posB = b.position || 999
      return posA - posB // Ordem crescente por posição
    })

    if (debugMode) {
      console.log(
        'Sorted gallery items:',
        sortedItems.map((item) => ({
          position: item.position,
          originalIndex: item.originalIndex,
          isCoverImage: item.isCoverImage,
        })),
      )
    }

    return sortedItems
  }, [galleryItems, coverImageConfig, coverImage, isMobile, debugMode])

  // Handle image load success
  const handleImageLoaded = useCallback((index: number) => {
    setLoadedImages((prev) => ({ ...prev, [index]: true }))
  }, [])

  // Retry loading a failed image
  const retryLoadImage = useCallback((index: number) => {
    setLoadErrors((prev) => {
      const newErrors = { ...prev }
      delete newErrors[index]
      return newErrors
    })
  }, [])

  // Gera um srcSet para imagens responsivas
  const generateSrcSet = (
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

  // If no gallery items after processing, show a message
  if (!processedGalleryItems || processedGalleryItems.length === 0) {
    return (
      <div className="project-gallery empty-gallery">
        <p className="text-gray-500 italic">
          {isGerman
            ? 'Keine Galerie-Bilder verfügbar.'
            : 'No gallery images available.'}
        </p>
      </div>
    )
  }

  return (
    <div className="project-gallery">
      {/* Debug panel for development */}
      {debugMode && (
        <div className="debug-panel">
          <h3>Gallery Debug Info</h3>
          <p>Slug: {slug}</p>
          <p>Original Items: {galleryItems?.length || 0}</p>
          <p>Processed Items: {processedGalleryItems.length}</p>
          <p>Optimal Size: {optimalSize}</p>
          <p>Format: {imageFormat}</p>
          <p>WebP Supported: {webpSupported ? 'Yes' : 'No'}</p>
          <p>Load Errors: {Object.keys(loadErrors).length}</p>
          <p>
            Loaded Images: {Object.keys(loadedImages).length}/
            {processedGalleryItems.length}
          </p>
          <details>
            <summary>Gallery Items Details</summary>
            <pre>{JSON.stringify(processedGalleryItems, null, 2)}</pre>
          </details>
          <button onClick={() => setDebugMode(false)}>Close Debug</button>
        </div>
      )}

      {/* Gallery container */}
      <div className="gallery-container">
        {processedGalleryItems.map((item: GalleryItem, index: number) => {
          // Determine if this is a cover image
          const isCoverImage = Boolean(item.isCoverImage)

          // Get image name based on source
          let imageName

          if (isCoverImage) {
            // Se é a imagem de capa, use 'hero'
            imageName = 'hero'
          } else if (item.originalIndex !== undefined) {
            // Se temos o índice original da imagem, use-o para o nome do arquivo
            imageName = `gallery-${String(item.originalIndex).padStart(2, '0')}`

            if (debugMode) {
              console.log(
                `Using originalIndex ${
                  item.originalIndex
                } for image at position ${item.position || index + 1}`,
              )
            }
          } else if (item.image && typeof item.image === 'string') {
            // Tente extrair o número do nome do arquivo (para compatibilidade)
            const match = item.image.match(/\/(\d+)\.[a-zA-Z]+$/)
            if (match && match[1]) {
              imageName = `gallery-${String(match[1]).padStart(2, '0')}`
            } else {
              // Fallback para position ou index
              imageName = `gallery-${String(
                item.position || index + 1,
              ).padStart(2, '0')}`
            }
          } else {
            // Fallback para position ou index
            imageName = `gallery-${String(item.position || index + 1).padStart(
              2,
              '0',
            )}`
          }

          // Get caption based on language
          const caption = isGerman ? item.caption_de : item.caption_en

          // Determine if this image is loaded
          const imageLoaded = loadedImages[index] // CORREÇÃO: Renomeado para imageLoaded

          // Para depuração
          if (debugMode) {
            console.log(`Item ${index}:`, {
              isCoverImage,
              imageName,
              position: item.position,
              originalIndex: item.originalIndex,
              image: item.image,
            })
          }

          return (
            <motion.div
              key={`gallery-item-${index}`}
              className={`gallery-item ${
                item.orientation === 'portrait'
                  ? 'portrait-container'
                  : item.orientation === 'square'
                  ? 'square-container'
                  : 'landscape-container'
              } ${item.featured ? 'featured-item' : ''}`}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-100px 0px' }}
              transition={{
                duration: 0.8,
                ease: [0.22, 1, 0.36, 1],
                delay: Math.min(index * 0.1, 0.5),
              }}
            >
              <div
                className={`relative overflow-hidden shadow-md ${
                  imageLoaded ? 'image-loaded' : '' // CORREÇÃO: Usar imageLoaded
                }`}
              >
                {!loadErrors[index] ? (
                  <>
                    {/* Image placeholder */}
                    <div className="image-placeholder"></div>

                    {/* Image with picture element for modern browsers */}
                    <picture>
                      {/* WebP source for browsers with support */}
                      <source
                        srcSet={generateSrcSet(slug, imageName, 'webp')}
                        type="image/webp"
                      />

                      {/* JPEG source for browsers without WebP support */}
                      <source
                        srcSet={generateSrcSet(slug, imageName, 'jpg')}
                        type="image/jpeg"
                      />

                      {/* Fallback img element */}
                      <img
                        src={getImagePath(slug, imageName, optimalSize, 'jpg')}
                        alt={caption || `${heroImageAlt} - ${index + 1}`}
                        className={`gallery-image w-full h-auto ${
                          item.orientation === 'portrait'
                            ? 'max-h-[90vh] md:max-h-[80vh] object-contain'
                            : 'object-cover'
                        }`}
                        loading="lazy"
                        sizes={`(max-width: 640px) 100vw, (max-width: 1024px) 800px, 1200px`}
                        onLoad={() => handleImageLoaded(index)}
                        onError={(e) => {
                          // Determinar o nome de arquivo correto para o fallback
                          let fallbackImageName = imageName

                          if (imageName.startsWith('gallery-')) {
                            // Extrair o número do nome gallery-XX
                            const num = imageName
                              .replace('gallery-', '')
                              .replace(/^0+/, '')
                            fallbackImageName = num || '1'
                          } else if (imageName === 'hero') {
                            fallbackImageName = 'cover'
                          }

                          // Construir o caminho de fallback
                          const fallbackSrc = `/images/projects/${slug}/${fallbackImageName}.jpg`

                          console.log(`Trying fallback: ${fallbackSrc}`)
                          e.currentTarget.src = fallbackSrc

                          // Se fallback também falhar, rastrear o erro
                          e.currentTarget.onerror = () => {
                            console.error(
                              `Fallback also failed: ${fallbackSrc}`,
                            )
                            setLoadErrors((prev) => ({
                              ...prev,
                              [index]: true,
                            }))
                          }
                        }}
                      />
                    </picture>
                  </>
                ) : (
                  <div className="image-error-placeholder">
                    <p>
                      {isGerman
                        ? 'Bild konnte nicht geladen werden'
                        : 'Image failed to load'}
                    </p>
                    <button
                      onClick={() => retryLoadImage(index)}
                      className="retry-button"
                    >
                      {isGerman ? 'Erneut versuchen' : 'Retry'}
                    </button>
                  </div>
                )}
              </div>
              {caption && <p className="gallery-caption">{caption}</p>}
            </motion.div>
          )
        })}
      </div>

      {/* Debug toggle button - only in development */}
      {process.env.NODE_ENV === 'development' && (
        <div className="debug-toggle">
          <button
            onClick={() => setDebugMode(!debugMode)}
            className="fixed bottom-4 left-4 z-50 bg-jumbo-800 text-white px-3 py-1 rounded text-sm"
          >
            {debugMode ? 'Hide Debug' : 'Show Debug'}
          </button>
        </div>
      )}
    </div>
  )
}

export default React.memo(ProjectGallery)
