// src/components/common/Loader.tsx
import React from 'react'

interface LoaderProps {
  size?: 'small' | 'medium' | 'large'
  fullScreen?: boolean
  className?: string
}

const Loader: React.FC<LoaderProps> = ({
  size = 'medium',
  fullScreen = false,
  className = '',
}) => {
  // Determinar classes com base no tamanho
  const sizeClasses = {
    small: 'w-5 h-5 border-2',
    medium: 'w-8 h-8 border-2',
    large: 'w-16 h-16 border-4',
  }

  // Container classes
  const containerClasses = fullScreen
    ? 'fixed inset-0 z-50 flex items-center justify-center bg-jumbo-900/80'
    : 'flex items-center justify-center'

  return (
    <div className={`${containerClasses} ${className}`}>
      <div
        className={`${sizeClasses[size]} rounded-full border-jumbo-400 border-t-jumbo-200 animate-spin`}
        role="status"
        aria-label="Loading"
      />
    </div>
  )
}

export default Loader
