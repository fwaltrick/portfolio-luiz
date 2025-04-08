/* eslint-disable @typescript-eslint/no-explicit-any */
// src/components/ProjectGallery/ProjectGallery.tsx
import React, { useState, useEffect, useMemo, useCallback } from 'react'
import { motion } from 'framer-motion'
import { useMediaQuery } from 'react-responsive'
import { ProjectGalleryProps, GalleryItem } from './types'
import {
  getOptimalImageSize,
  getImagePath,
  getFallbackPath,
  generateSrcSet,
  assignPositions,
} from './utils'
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
  const isDesktop = useMediaQuery({ minWidth: 1024 })
  const isLargeDesktop = useMediaQuery({ minWidth: 1440 })

  // Determine the optimal image size for the device
  const optimalSize = useMemo(() => getOptimalImageSize(), [])

  // Use WebP for mobile, JPEG for desktop (for quality)
  const imageFormat = useMemo(() => (isMobile ? 'webp' : 'jpg'), [isMobile])

  // Log component props for debugging
  useEffect(() => {
    if (debugMode) {
      console.log('ProjectGallery rendered with:', {
        slug,
        galleryItemsCount: galleryItems?.length || 0,
        hasCoverConfig: !!coverImageConfig,
        optimalSize,
        imageFormat,
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
    isDesktop,
    isLargeDesktop,
  ])

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
    const items: GalleryItem[] = JSON.parse(JSON.stringify(galleryItems))

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

    // Sort items by position
    return filteredItems.sort((a, b) => {
      const posA = a.position || 999
      const posB = b.position || 999
      return posA - posB
    })
  }, [galleryItems, coverImageConfig, coverImage, isMobile, debugMode])

  // Handle image load success
  const handleImageLoaded = useCallback((index: number) => {
    setLoadedImages((prev) => ({ ...prev, [index]: true }))
  }, [])

  // Handle image load error
  const handleImageError = useCallback(
    (index: number, primarySrc: string, fallbackSrc: string) => {
      console.error(
        `Failed to load image: ${primarySrc}, trying fallback: ${fallbackSrc}`,
      )

      // We'll try the fallback automatically in the img onError handler
      // If that fails too, we'll set an error state
      return () => {
        console.error(`Fallback also failed: ${fallbackSrc}`)
        setLoadErrors((prev) => ({ ...prev, [index]: true }))
      }
    },
    [],
  )

  // Retry loading a failed image
  const retryLoadImage = useCallback((index: number) => {
    setLoadErrors((prev) => {
      const newErrors = { ...prev }
      delete newErrors[index]
      return newErrors
    })
  }, [])

  // If no gallery items after processing, show a message
  if (!processedGalleryItems || processedGalleryItems.length === 0) {
    return (
      <div className="project-gallery empty-gallery">
        <p className="text-gray-500 italic">No gallery images available.</p>
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
        {processedGalleryItems.map((item, index) => {
          // Determine if this is a cover image
          const isCoverImage = Boolean(item.isCoverImage)

          // Get image paths
          const imageIndex = index + 1 // Start from 1
          const primarySrc = getImagePath(
            slug,
            imageIndex,
            isCoverImage,
            optimalSize,
            imageFormat as any,
          )
          const fallbackSrc = getFallbackPath(slug, imageIndex, isCoverImage)

          // Generate srcSet for responsive loading
          const srcSet = generateSrcSet(
            slug,
            imageIndex,
            isCoverImage,
            imageFormat as any,
          )

          // Get caption based on language
          const caption = isGerman ? item.caption_de : item.caption_en

          // Determine if this image is loaded
          const isLoaded = loadedImages[index]

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
                  isLoaded ? 'image-loaded' : ''
                }`}
              >
                {!loadErrors[index] ? (
                  <>
                    {/* Image placeholder */}
                    <div className="image-placeholder"></div>

                    {/* High-quality image */}
                    <img
                      src={primarySrc}
                      srcSet={srcSet}
                      sizes={`(max-width: 640px) 100vw, (max-width: 1024px) 800px, 1200px`}
                      alt={caption || `${heroImageAlt} - ${index + 1}`}
                      className={`gallery-image w-full h-auto ${
                        item.orientation === 'portrait'
                          ? 'max-h-[90vh] md:max-h-[80vh] object-contain'
                          : 'object-cover'
                      }`}
                      loading="lazy"
                      onLoad={() => handleImageLoaded(index)}
                      onError={(e) => {
                        // Try fallback
                        e.currentTarget.src = fallbackSrc

                        // If fallback also fails, track the error
                        e.currentTarget.onerror = handleImageError(
                          index,
                          primarySrc,
                          fallbackSrc,
                        )
                      }}
                    />
                  </>
                ) : (
                  <div className="image-error-placeholder">
                    <p>Image failed to load</p>
                    <button
                      onClick={() => retryLoadImage(index)}
                      className="retry-button"
                    >
                      Retry
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
      {/* {process.env.NODE_ENV === 'development' && (
        <div className="debug-toggle">
          <button onClick={() => setDebugMode(!debugMode)}>
            {debugMode ? 'Hide Debug' : 'Show Debug'}
          </button>
        </div>
      )} */}
    </div>
  )
}

export default React.memo(ProjectGallery)
