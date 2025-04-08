import { createContext } from 'react'

export interface ScrollPositionState {
  [key: string]: number
}

export interface ScrollContextType {
  scrollPositions: ScrollPositionState
  saveScrollPosition: (key: string) => void
  restoreScrollPosition: (key: string) => void
}

// Create context with default values
const ScrollContext = createContext<ScrollContextType>({
  scrollPositions: {},
  saveScrollPosition: () => {},
  restoreScrollPosition: () => {},
})

export default ScrollContext
