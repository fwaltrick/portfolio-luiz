// src/router.tsx (ou onde você define suas rotas)
import { createBrowserRouter, RouteObject } from 'react-router-dom'
import App from './App'
import Home from './pages/Home'
import ProjectDetailPage from './pages/ProjectDetail'
import AboutPage from './pages/About'

// Definindo as rotas
const routes: RouteObject[] = [
  {
    path: '/',
    element: <App />,
    children: [
      {
        index: true,
        element: <Home />,
      },
      {
        path: 'project/:slug',
        element: <ProjectDetailPage />,
      },
      {
        path: 'about',
        element: <AboutPage />,
      },
    ],
  },
]

export const router = createBrowserRouter(routes)
