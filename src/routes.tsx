// src/router.tsx

import { lazy } from 'react'
import { createBrowserRouter, RouteObject } from 'react-router-dom'
import App from './App'
import Home from './pages/Home'
import ProjectDetailPage from './pages/ProjectDetail'
import AboutPage from './pages/About'
import ImpressumPage from './pages/Impressum'

const NotFoundPage = lazy(() => import('./pages/NotFound/index'))

const routes: RouteObject[] = [
  {
    path: '/',
    element: <App />,
    children: [
      { index: true, element: <Home /> },
      { path: 'project/:slug', element: <ProjectDetailPage /> },
      { path: 'about', element: <AboutPage /> },
      { path: 'impressum', element: <ImpressumPage /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
]

export const router = createBrowserRouter(routes)
