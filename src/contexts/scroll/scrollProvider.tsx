import React, { useState, useCallback, ReactNode } from 'react'
import ScrollContext, { ScrollPositionState } from './ScrollContext'

interface ScrollProviderProps {
  children: ReactNode
}

export const ScrollProvider: React.FC<ScrollProviderProps> = ({ children }) => {
  const [scrollPositions, setScrollPositions] = useState<ScrollPositionState>(
    {},
  )

  // Save the current scroll position with a unique key
  const saveScrollPosition = useCallback((key: string) => {
    if (typeof window !== 'undefined') {
      console.log(`Saving scroll position for ${key}: ${window.scrollY}px`)
      setScrollPositions((prev) => ({
        ...prev,
        [key]: window.scrollY,
      }))
    }
  }, [])

  // Restore scroll position for a given key
  const restoreScrollPosition = useCallback(
    (key: string) => {
      if (typeof window !== 'undefined' && scrollPositions[key] !== undefined) {
        console.log(
          `Restoring scroll position for ${key}: ${scrollPositions[key]}px`,
        )

        // Use requestAnimationFrame to ensure DOM is ready
        window.requestAnimationFrame(() => {
          window.scrollTo(0, scrollPositions[key])

          // Double-check after a short delay that scroll was applied
          setTimeout(() => {
            if (window.scrollY !== scrollPositions[key]) {
              console.log(`Scroll position verification failed. Retrying...`)
              window.scrollTo(0, scrollPositions[key])
            }
          }, 100)
        })
      } else {
        console.log(`No saved position found for ${key}`)
      }
    },
    [scrollPositions],
  )

  const contextValue = {
    scrollPositions,
    saveScrollPosition,
    restoreScrollPosition,
  }

  return (
    <ScrollContext.Provider value={contextValue}>
      {children}
    </ScrollContext.Provider>
  )
}

export default ScrollProvider
