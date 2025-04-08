// src/contexts/ProjectsContext.ts
import { createContext } from 'react'
import { Project } from '../types'

interface ProjectsContextType {
  projects: Project[]
  loading: boolean
  error: Error | null // Adicionado para lidar com erros do TinaCMS
}

const ProjectsContext = createContext<ProjectsContextType>({
  projects: [],
  loading: false,
  error: null, // Valor padrão para erro
})

export default ProjectsContext
