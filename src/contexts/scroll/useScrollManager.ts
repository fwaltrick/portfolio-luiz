import { useContext } from 'react'
import ScrollContext from './ScrollContext'

export const useScrollManager = () => useContext(ScrollContext)

export default useScrollManager
