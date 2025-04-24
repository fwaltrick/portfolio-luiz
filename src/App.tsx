// src/App.tsx
import React, { Suspense } from 'react' // <--- Importe Suspense
import { Outlet } from 'react-router-dom'
import Header from './components/Header'
import Footer from './components/Footer'
import ProjectsProvider from './contexts/ProjectsProvider'
import ScrollToTop from './components/ScrollToTop'
import Loader from './components/Loader' // <-- Importe seu componente Loader

const App: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col relative">
      <ProjectsProvider>
        <Header />
        <ScrollToTop />
        <main className="flex flex-col flex-grow ">
          <Suspense
            fallback={
              <div className="container-custom py-16 flex justify-center items-center min-h-[300px]">
                <Loader size="medium" />
              </div>
            }
          >
            <Outlet />{' '}
          </Suspense>
        </main>
        <Footer />
      </ProjectsProvider>
    </div>
  )
}

export default App
