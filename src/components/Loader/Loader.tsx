import React from 'react'

interface LoaderProps {
  size?: 'small' | 'medium' | 'large'
  fullScreen?: boolean
}

const Loader: React.FC<LoaderProps> = ({
  size = 'medium',
  fullScreen = false,
}) => {
  const sizeClasses = {
    small: 'w-8',
    medium: 'w-16',
    large: 'w-24',
  }

  const containerClasses = fullScreen
    ? 'fixed inset-0 z-50 flex items-center justify-center bg-jumbo-900/80'
    : 'flex items-center justify-center'

  return (
    <div className={containerClasses}>
      <div className={`${sizeClasses[size]} relative`}>
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className="absolute w-full h-0.5 bg-jumbo-300 animate-line-flow"
            style={{
              top: `${33.3 * i}%`,
              animationDelay: `${i * 0.15}s`,
              transform: 'scaleX(0)',
              transformOrigin: i % 2 === 0 ? 'left' : 'right',
            }}
          ></div>
        ))}
        {size !== 'small' && (
          <div className="absolute bottom-0 left-0 right-0 text-center text-xs font-staatliches text-jumbo-300 mt-2">
            LOADING
          </div>
        )}
      </div>
    </div>
  )
}

export default Loader
