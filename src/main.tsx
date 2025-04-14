import React from 'react'
import ReactDOM from 'react-dom/client'
import { RouterProvider } from 'react-router-dom'
import { router } from './routes'
import './index.css'
import './i18n/config'

// Importing font weights
import '@fontsource/inter/300.css'
import '@fontsource/inter/400.css'
import '@fontsource/inter/500.css'
import '@fontsource/inter/600.css'
import '@fontsource/inter/700.css'
import '@fontsource/staatliches/400.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <React.StrictMode>
      <RouterProvider router={router} />
    </React.StrictMode>
  </React.StrictMode>,
)
