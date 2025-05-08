// Copiado EXATAMENTE do seu último fornecimento, com adições/modificações marcadas

import React, { useState, useEffect, useMemo, useCallback } from 'react'
import { motion } from 'framer-motion'
import { useMediaQuery } from 'react-responsive'
import { ProjectGalleryProps, GalleryItem } from './types'
import { getImagePath, supportsWebP } from './utils'
import Lightbox from 'yet-another-react-lightbox'
import 'yet-another-react-lightbox/styles.css'
// import Thumbnails from "yet-another-react-lightbox/plugins/thumbnails";
// import "yet-another-react-lightbox/plugins/thumbnails.css";
import './ProjectGallery.css'

const ProjectGallery: React.FC<ProjectGalleryProps> = ({
  slug,
  galleryItems = [],
  coverImageConfig,
  coverImage,
  heroImageAlt,
  isGerman,
}) => {
  // State (Mantido como no seu código)
  const [loadErrors, setLoadErrors] = useState<Record<number, boolean>>({})
  const [loadedImages, setLoadedImages] = useState<Record<number, boolean>>({})
  const [debugMode, setDebugMode] = useState<boolean>(
    process.env.NODE_ENV === 'development' && false,
  )
  const [isLightboxOpen, setIsLightboxOpen] = useState(false)
  const [lightboxIndex, setLightboxIndex] = useState(0)

  // Media Queries & Calculated Values (Mantido como no seu código)
  const isMobile = useMediaQuery({ maxWidth: 767 })
  const isTablet = useMediaQuery({ minWidth: 768, maxWidth: 1023 })
  const optimalSize = useMemo(() => {
    if (isMobile) return 'md'
    if (isTablet) return 'md'
    return 'lg'
  }, [isMobile, isTablet])
  const webpSupported = useMemo(() => supportsWebP(), [])
  const imageFormat = useMemo(
    () => (webpSupported ? 'webp' : 'jpg'),
    [webpSupported],
  )

  // Debug Effect (Mantido como no seu código)
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
  ])

  // Helper Functions (Mantido como no seu código)
  const assignPositions = (items: GalleryItem[]): GalleryItem[] => {
    if (!items || !Array.isArray(items)) return []
    const positionMap = new Map<number, boolean>()
    items.forEach((item) => {
      if (item.position) {
        positionMap.set(item.position, true)
      }
    })
    const getNextPosition = (): number => {
      let position = 1
      while (positionMap.has(position)) {
        position++
      }
      return position
    }
    return items.map((item) => {
      if (!item.position) {
        const nextPos = getNextPosition()
        positionMap.set(nextPos, true)
        return { ...item, position: nextPos }
      }
      return item
    })
  }

  const processedGalleryItems = useMemo(() => {
    if (
      !galleryItems ||
      !Array.isArray(galleryItems) ||
      galleryItems.length === 0
    ) {
      return []
    }
    const items: GalleryItem[] = JSON.parse(JSON.stringify(galleryItems)).map(
      (item: GalleryItem, index: number) => {
        let extractedIndex = index + 1
        if (item.image && typeof item.image === 'string') {
          const match = item.image.match(/(\d+)\.[a-zA-Z]+$/)
          if (match && match[1]) {
            extractedIndex = parseInt(match[1], 10)
          }
        }
        return { ...item, originalIndex: extractedIndex }
      },
    )
    if (
      coverImageConfig?.includeInGallery &&
      (coverImageConfig?.image || coverImage)
    ) {
      items.push({
        image: coverImageConfig.image || coverImage || '',
        orientation: coverImageConfig.orientation || 'landscape',
        position: coverImageConfig.galleryPosition || 999,
        desktopOnly: false,
        mobileOnly: false,
        featured: false,
        isCoverImage: true,
      })
    }
    const itemsWithPositions = assignPositions(items)
    const filteredItems = itemsWithPositions.filter((item) => {
      if (isMobile && item.desktopOnly) return false
      if (!isMobile && item.mobileOnly) return false
      return true
    })
    const sortedItems = filteredItems.sort(
      (a, b) => (a.position || 999) - (b.position || 999),
    )
    return sortedItems
  }, [galleryItems, coverImageConfig, coverImage, isMobile]) // Dependência debugMode removida se não afeta o filtro/sort

  const handleImageLoaded = useCallback((index: number) => {
    setLoadedImages((prev) => ({ ...prev, [index]: true }))
  }, [])
  const retryLoadImage = useCallback((index: number) => {
    setLoadErrors((prev) => {
      const ne = { ...prev }
      delete ne[index]
      return ne
    })
  }, [])
  const generateSrcSet = (
    slug: string,
    imageName: string = 'hero',
    format: 'jpg' | 'webp' = 'jpg',
  ): string => {
    if (imageName === 'hero') {
      return `${getImagePath(
        slug,
        imageName,
        undefined,
        format,
      )} 1800w, ${getImagePath(slug, imageName, 'md', format)} 800w`
    }
    return `${getImagePath(slug, imageName, 'md', format)} 800w, ${getImagePath(
      slug,
      imageName,
      'lg',
      format,
    )} 1400w`
  }

  // lightboxSlides (Mantido como no seu código, com a correção para hero)
  const lightboxSlides = useMemo(() => {
    return processedGalleryItems.map((item, index) => {
      let imageNameForPath = 'default-name-error'
      let sizeSuffix: 'lg' | 'md' | undefined = 'lg'
      let finalLargePath = ''
      try {
        if (item.isCoverImage) {
          imageNameForPath = 'hero'
          sizeSuffix = undefined // Pede a versão base/maior do hero
          finalLargePath = getImagePath(
            slug,
            imageNameForPath,
            sizeSuffix,
            imageFormat,
          )
        } else {
          sizeSuffix = 'lg' // Pede lg para galeria normal
          if (item.originalIndex !== undefined) {
            imageNameForPath = `gallery-${String(item.originalIndex).padStart(
              2,
              '0',
            )}`
          } else {
            imageNameForPath = `gallery-${String(
              item.position || index + 1,
            ).padStart(2, '0')}`
          }
          finalLargePath = getImagePath(
            slug,
            imageNameForPath,
            sizeSuffix,
            imageFormat,
          )
        }
        if (!finalLargePath || typeof finalLargePath !== 'string') {
          console.error(`Invalid path for lightbox item ${index}`)
          return { src: '/images/placeholder-error.jpg' }
        }
        return { src: finalLargePath }
      } catch (mapError) {
        console.error(
          `Error processing lightbox item ${index}:`,
          mapError,
          item,
        )
        return { src: '/images/placeholder-error.jpg' }
      }
    })
  }, [processedGalleryItems, slug, imageFormat]) // Adicionado getImagePath

  // Mensagem se não houver itens (Mantido)
  if (!processedGalleryItems || processedGalleryItems.length === 0) {
    return (
      <div className="project-gallery empty-gallery px-4 sm:px-6 lg:px-8 py-10">
        <p className="text-gray-500 italic text-center">
          {isGerman
            ? 'Keine Galerie-Bilder für diese Ansicht verfügbar.'
            : 'No gallery images available for this view.'}
        </p>
      </div>
    )
  }

  // ---- JSX de Retorno ----
  return (
    <div className="project-gallery w-full">
      {debugMode && (
        <div className="debug-panel bg-yellow-100 border border-yellow-300 p-4 my-4 rounded">
          <h3 className="font-bold text-lg mb-2">Gallery Debug Info</h3>
          <p>Slug: {slug}</p>
          <p>Original Items: {galleryItems?.length || 0}</p>
          <p>Processed Items: {processedGalleryItems.length}</p>
          <p>isMobile: {isMobile ? 'Yes' : 'No'}</p>
          <p>Optimal Size: {optimalSize}</p>
          <p>Format: {imageFormat}</p>
          <p>WebP Supported: {webpSupported ? 'Yes' : 'No'}</p>
          <p>Load Errors: {Object.keys(loadErrors).length}</p>
          <p>
            Loaded Images: {Object.keys(loadedImages).length}/
            {processedGalleryItems.length}
          </p>
          <details className="mt-2">
            <summary className="cursor-pointer">
              Items Details (Processed & Filtered)
            </summary>
            <pre className="text-xs bg-gray-100 p-2 rounded overflow-auto max-h-60">
              {JSON.stringify(
                processedGalleryItems.map((i) => ({
                  pos: i.position,
                  img: i.image,
                  mobile: i.mobileOnly,
                  desktop: i.desktopOnly,
                })),
                null,
                2,
              )}
            </pre>
          </details>
          <button
            onClick={() => setDebugMode(false)}
            className="mt-2 text-sm text-blue-600 underline"
          >
            Close Debug
          </button>
        </div>
      )}

      <div className="gallery-container mb-0">
        {processedGalleryItems.map((item: GalleryItem, index: number) => {
          // Lógica interna do map mantida como no seu código
          const isCoverImage = Boolean(item.isCoverImage)
          let imageName = 'default-map'
          if (isCoverImage) {
            imageName = 'hero'
          } else if (item.originalIndex !== undefined) {
            imageName = `gallery-${String(item.originalIndex).padStart(2, '0')}`
          } else if (item.image && typeof item.image === 'string') {
            const m = item.image.match(/\/(\d+)\.[a-zA-Z]+$/)
            if (m && m[1]) {
              imageName = `gallery-${String(m[1]).padStart(2, '0')}`
            } else {
              imageName = `gallery-${String(
                item.position || index + 1,
              ).padStart(2, '0')}`
            }
          } else {
            imageName = `gallery-${String(item.position || index + 1).padStart(
              2,
              '0',
            )}`
          }
          const caption = isGerman ? item.caption_de : item.caption_en
          const imageLoaded = loadedImages[index]
          let aspectRatioClass = 'aspect-video'
          if (item.orientation === 'portrait') {
            aspectRatioClass = 'aspect-[3/4]'
          } else if (item.orientation === 'square') {
            aspectRatioClass = 'aspect-square'
          }

          // Função helper para abrir o lightbox
          const openLightbox = (idx: number) => {
            console.log(`Opening lightbox for index: ${idx}`) // Log para depuração
            setLightboxIndex(idx)
            setIsLightboxOpen(true)
          }

          return (
            <motion.div
              key={`gallery-item-${slug}-${item.position || index}`}
              className={`gallery-item ${
                item.featured ? 'featured-item' : ''
              } mb-0 cursor-pointer`}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-100px 0px' }}
              transition={{
                duration: 0.8,
                ease: [0.22, 1, 0.36, 1],
                delay: Math.min(index * 0.1, 0.5),
              }}
              // >>> MUDANÇA: Adicionado onTouchEnd <<<
              onClick={() => {
                console.log(`Click event on index ${index}`)
                openLightbox(index)
              }}
              onTouchEnd={() => {
                // Para evitar possível disparo duplo com onClick em alguns mobiles
                // e.preventDefault(); // Descomente CUIDADOSAMENTE se necessário
                console.log(`TouchEnd event on index ${index}`)
                openLightbox(index)
              }}
            >
              <div
                className={`relative overflow-hidden shadow-md ${aspectRatioClass} ${
                  imageLoaded ? 'image-loaded' : ''
                }`}
              >
                {!loadErrors[index] ? (
                  <>
                    {!imageLoaded && (
                      <div
                        className={`image-placeholder bg-gray-200 ${aspectRatioClass}`}
                      ></div>
                    )}
                    <picture>
                      <source
                        srcSet={generateSrcSet(slug, imageName, 'webp')}
                        type="image/webp"
                      />
                      <source
                        srcSet={generateSrcSet(slug, imageName, 'jpg')}
                        type="image/jpeg"
                      />
                      <img
                        src={getImagePath(slug, imageName, optimalSize, 'jpg')}
                        alt={caption || `${heroImageAlt} - Image ${index + 1}`}
                        className={`gallery-image w-full h-full object-cover block absolute top-0 left-0 transition-opacity duration-500 ${
                          imageLoaded ? 'opacity-100' : 'opacity-0'
                        }`}
                        loading="lazy"
                        sizes={`(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw`}
                        onLoad={() => handleImageLoaded(index)}
                        onError={(e) => {
                          let fName = imageName
                          if (imageName.startsWith('gallery-')) {
                            const n = imageName
                              .replace('gallery-', '')
                              .replace(/^0+/, '')
                            fName = n || '1'
                          } else if (imageName === 'hero') {
                            fName = 'cover'
                          }
                          const fSrc = `/images/projects/${slug}/${fName}.jpg`
                          console.log(`Trying fallback: ${fSrc}`)
                          e.currentTarget.src = fSrc
                          e.currentTarget.onerror = () => {
                            console.error(`Fallback failed: ${fSrc}`)
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
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-200 text-xs p-2 text-center">
                    <p className="text-red-600 font-semibold">
                      {isGerman ? 'Bild fehlgeschlagen' : 'Image failed'}
                    </p>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        retryLoadImage(index)
                      }}
                      className="retry-button mt-1 text-blue-600 underline text-xs"
                    >
                      {isGerman ? 'Erneut' : 'Retry'}
                    </button>
                  </div>
                )}
              </div>
              {caption && (
                <p className="gallery-caption text-xs text-center text-gray-600 mt-1 mb-4 px-1">
                  {caption}
                </p>
              )}
            </motion.div>
          )
        })}
      </div>

      {/* Renderização Lightbox (mantida) */}
      <Lightbox
        open={isLightboxOpen}
        close={() => setIsLightboxOpen(false)}
        index={lightboxIndex}
        slides={lightboxSlides}
        // plugins={[Thumbnails]}
      />

      {/* Debug toggle button (mantido) */}
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
