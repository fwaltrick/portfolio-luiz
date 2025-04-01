import { createContext } from 'react'
import { Project } from '../types'

interface ProjectsContextType {
  projects: Project[]
  loading: boolean
}

const ProjectsContext = createContext<ProjectsContextType>({
  projects: [],
  loading: false,
})

export default ProjectsContext
