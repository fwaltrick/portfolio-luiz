import React, { useState, useEffect, useMemo, useCallback } from 'react'
import { motion } from 'framer-motion'
import { useMediaQuery } from 'react-responsive'
import { ProjectGalleryProps, GalleryItem } from './types' // Certifique-se que os tipos estão corretos
import { getImagePath, supportsWebP } from './utils' // Certifique-se que as utils estão corretas
import './ProjectGallery.css' // ATENÇÃO a este arquivo CSS!

const ProjectGallery: React.FC<ProjectGalleryProps> = ({
  slug,
  galleryItems = [],
  coverImageConfig,
  coverImage,
  heroImageAlt, // Passado de ProjectDetailPage
  isGerman, // Passado de ProjectDetailPage
}) => {
  // State
  const [loadErrors, setLoadErrors] = useState<Record<number, boolean>>({})
  const [loadedImages, setLoadedImages] = useState<Record<number, boolean>>({})
  const [debugMode, setDebugMode] = useState<boolean>(
    process.env.NODE_ENV === 'development' && false, // Desativado por padrão
  )

  // Media Queries
  const isMobile = useMediaQuery({ maxWidth: 767 })
  const isTablet = useMediaQuery({ minWidth: 768, maxWidth: 1023 })
  // Removidos isDesktop e isLargeDesktop pois não estavam sendo usados no cálculo de optimalSize

  // Optimal Size
  const optimalSize = useMemo(() => {
    if (isMobile) return 'md' // Usar 'md' para mobile como fallback maior
    if (isTablet) return 'md'
    return 'lg' // 'lg' para desktop
  }, [isMobile, isTablet])

  // WebP Support
  const webpSupported = useMemo(() => supportsWebP(), [])
  const imageFormat = useMemo(
    () => (webpSupported ? 'webp' : 'jpg'),
    [webpSupported],
  )

  // useEffect para Debug
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
        // isDesktop, // Removido se não usado
        // isLargeDesktop, // Removido se não usado
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
    // isDesktop,
    // isLargeDesktop,
  ])

  // Função assignPositions (mantida como estava)
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

  // processedGalleryItems (mantida a lógica de processamento e filtro)
  const processedGalleryItems = useMemo(() => {
    if (
      !galleryItems ||
      !Array.isArray(galleryItems) ||
      galleryItems.length === 0
    ) {
      if (debugMode) console.log('No gallery items to process')
      return []
    }
    // Deep copy para evitar mutação
    const items: GalleryItem[] = JSON.parse(JSON.stringify(galleryItems)).map(
      (item: GalleryItem, index: number) => {
        let extractedIndex = index + 1
        if (item.image && typeof item.image === 'string') {
          const match = item.image.match(/(\d+)\.[a-zA-Z]+$/)
          if (match && match[1]) {
            extractedIndex = parseInt(match[1], 10)
            // if (debugMode) console.log(`Extracted index ${extractedIndex} from image path: ${item.image}`)
          }
        }
        return { ...item, originalIndex: extractedIndex }
      },
    )

    // Adiciona imagem de capa se configurado
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
        // Flags padrão para item adicionado manualmente
        desktopOnly: false,
        mobileOnly: false,
        featured: false,
        // Adiciona flag para identificar que é a imagem de capa
        isCoverImage: true,
      })
    }

    const itemsWithPositions = assignPositions(items)

    // Filtra baseado no dispositivo
    const filteredItems = itemsWithPositions.filter((item) => {
      if (isMobile && item.desktopOnly) {
        if (debugMode)
          console.log(`Filtering out desktopOnly item on mobile:`, item)
        return false
      }
      if (!isMobile && item.mobileOnly) {
        if (debugMode)
          console.log(`Filtering out mobileOnly item on desktop:`, item)
        return false
      }
      return true
    })

    // Ordena por posição
    const sortedItems = filteredItems.sort(
      (a, b) => (a.position || 999) - (b.position || 999),
    )

    if (debugMode) {
      console.log(
        'Sorted & Filtered gallery items:',
        sortedItems.map((item) => ({
          position: item.position,
          img: item.image,
          mobileOnly: item.mobileOnly,
          desktopOnly: item.desktopOnly,
        })),
      )
    }
    return sortedItems
  }, [galleryItems, coverImageConfig, coverImage, isMobile, debugMode])

  // handleImageLoaded (mantido como estava)
  const handleImageLoaded = useCallback((index: number) => {
    setLoadedImages((prev) => ({ ...prev, [index]: true }))
  }, [])
  // retryLoadImage (mantido como estava)
  const retryLoadImage = useCallback((index: number) => {
    setLoadErrors((prev) => {
      const newErrors = { ...prev }
      delete newErrors[index]
      return newErrors
    })
  }, [])
  // generateSrcSet (mantido como estava)
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

  // Mensagem se não houver itens (mantido como antes)
  if (!processedGalleryItems || processedGalleryItems.length === 0) {
    return (
      <div className="project-gallery empty-gallery px-4 sm:px-6 lg:px-8 py-10">
        {' '}
        {/* Adicionado padding aqui */}
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
      {' '}
      {/* Garante que ocupe a largura do pai (que tem max-w-[1920px] e px-0) */}
      {/* Debug panel (mantido) */}
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
      {/* Gallery container - Removido grid/flex daqui para os itens fluírem naturalmente,
          ou adicione grid/flex com gap-0 se quiser controle de colunas sem espaçamento.
          Adicionado mb-0 se o pai for flex/grid para evitar margem extra. */}
      <div className="gallery-container mb-0">
        {processedGalleryItems.map((item: GalleryItem, index: number) => {
          // Lógica para imageName, caption (mantida)
          const isCoverImage = Boolean(item.isCoverImage)
          let imageName = 'default-imagename' // Fallback
          if (isCoverImage) {
            imageName = 'hero'
          } else if (item.originalIndex !== undefined) {
            imageName = `gallery-${String(item.originalIndex).padStart(2, '0')}`
          } else if (item.image && typeof item.image === 'string') {
            const match = item.image.match(/\/(\d+)\.[a-zA-Z]+$/)
            if (match && match[1]) {
              imageName = `gallery-${String(match[1]).padStart(2, '0')}`
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

          // ** MUDANÇA PRINCIPAL: Determinar aspect ratio **
          let aspectRatioClass = 'aspect-video' // Padrão 16:9 landscape
          if (item.orientation === 'portrait') {
            aspectRatioClass = 'aspect-[3/4]' // Exemplo para portrait 3:4
          } else if (item.orientation === 'square') {
            aspectRatioClass = 'aspect-square' // Para square 1:1
          }
          // Você pode adicionar mais 'else if' para outras proporções se necessário

          if (debugMode) {
            /* ... log de debug ... */
          }

          return (
            // ** MUDANÇA: Removido classes de container de orientação daqui. **
            // ** Adicionado mb-0 para garantir que não haja margem entre os itens do map **
            <motion.div
              key={`gallery-item-${slug}-${item.position || index}`} // Chave mais robusta
              className={`gallery-item ${
                item.featured ? 'featured-item' : ''
              } mb-0`}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-100px 0px' }} // Ajuste a margem se necessário
              transition={{
                duration: 0.8,
                ease: [0.22, 1, 0.36, 1],
                delay: Math.min(index * 0.1, 0.5),
              }}
            >
              {/* ** MUDANÇA: Aplicado aspectRatioClass a este wrapper da imagem ** */}
              <div
                className={`relative overflow-hidden shadow-md ${aspectRatioClass} ${
                  imageLoaded ? 'image-loaded' : '' // Classe para possível estilo após carregar
                }`}
              >
                {!loadErrors[index] ? (
                  <>
                    {/* Placeholder opcional - pode ser estilizado para ter a mesma proporção */}
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
                      {/* ** MUDANÇA: Imagem agora usa h-full e object-cover para preencher o aspect-ratio do pai ** */}
                      <img
                        src={getImagePath(slug, imageName, optimalSize, 'jpg')}
                        alt={caption || `${heroImageAlt} - Image ${index + 1}`} // Alt text mais descritivo
                        className={`gallery-image w-full h-full object-cover block absolute top-0 left-0 transition-opacity duration-500 ${
                          imageLoaded ? 'opacity-100' : 'opacity-0'
                        }`} // Posicionado absoluto para sobrepor placeholder e fade-in
                        loading="lazy"
                        sizes={`(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw`} // Ajuste sizes conforme layout
                        onLoad={() => handleImageLoaded(index)}
                        onError={(e) => {
                          let fallbackImageName = imageName
                          if (imageName.startsWith('gallery-')) {
                            const num = imageName
                              .replace('gallery-', '')
                              .replace(/^0+/, '')
                            fallbackImageName = num || '1'
                          } else if (imageName === 'hero') {
                            fallbackImageName = 'cover'
                          }
                          const fallbackSrc = `/images/projects/${slug}/${fallbackImageName}.jpg`
                          console.log(`Trying fallback: ${fallbackSrc}`)
                          e.currentTarget.src = fallbackSrc
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
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-200 text-xs p-2 text-center">
                    <p className="text-red-600 font-semibold">
                      {isGerman ? 'Bild fehlgeschlagen' : 'Image failed'}
                    </p>
                    <button
                      onClick={() => retryLoadImage(index)}
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
              )}{' '}
              {/* Estilo exemplo para caption */}
            </motion.div>
          )
        })}
      </div>
      {/* Debug toggle button */}
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
