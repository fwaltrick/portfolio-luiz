import React from 'react'

interface HeroImageProps {
  src: string
  alt: string
  fallbackSrc?: string
}

const HeroImage = React.memo(({ src, alt, fallbackSrc }: HeroImageProps) => {
  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    if (fallbackSrc) {
      e.currentTarget.src = fallbackSrc
    }
  }

  return (
    <div className="hero-image-container">
      <img
        src={src}
        alt={alt}
        className="hero-image"
        onError={handleImageError}
      />
      <div className="hero-top-overlay"></div>
    </div>
  )
})

HeroImage.displayName = 'HeroImage'
