import React, { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import { Project } from '../../types'
import './ProjectDetail.css'
import useProjects from '../../hooks/useProjects'

const ProjectDetailPage: React.FC = () => {
  const { projects, loading: projectsLoading } = useProjects()
  const { slug } = useParams<{ slug: string }>()
  const { t, ready } = useTranslation()
  const navigate = useNavigate()
  const imageRef = useRef(null)
  const [imageVisible, setImageVisible] = useState(false)

  const [loading, setLoading] = useState(true)
  const [project, setProject] = useState<Project | undefined>()
  const [imageError, setImageError] = useState<Record<string, boolean>>({})
  const [transitionComplete, setTransitionComplete] = useState(false)
  const [webpSupported, setWebpSupported] = useState(false)

  // Verificar suporte a WebP quando o componente montar
  useEffect(() => {
    const checkWebPSupport = () => {
      const elem = document.createElement('canvas')
      if (elem.getContext && elem.getContext('2d')) {
        return elem.toDataURL('image/webp').indexOf('data:image/webp') === 0
      }
      return false
    }

    setWebpSupported(checkWebPSupport())
  }, [])

  // Configurar o Intersection Observer para a imagem
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setImageVisible(true)
          observer.disconnect()
        }
      },
      {
        threshold: 0.1,
        rootMargin: '100px 0px',
      },
    )

    if (imageRef.current) {
      observer.observe(imageRef.current)
    }

    return () => {
      observer.disconnect()
    }
  }, [loading])

  // Efeitos do ciclo de vida e outros useEffects permanecem os mesmos...
  useEffect(() => {
    document.body.classList.add('project-detail-page')
    document.body.style.margin = '0'
    document.body.style.padding = '0'
    document.body.style.overflowX = 'hidden'

    const rootElement = document.getElementById('root')
    if (rootElement) {
      rootElement.style.margin = '0'
      rootElement.style.padding = '0'
    }

    const timer = setTimeout(() => {
      setTransitionComplete(true)
    }, 400)

    return () => {
      document.body.classList.remove('project-detail-page')
      document.body.style.margin = ''
      document.body.style.padding = ''
      document.body.style.overflowX = ''

      if (rootElement) {
        rootElement.style.margin = ''
        rootElement.style.padding = ''
      }

      clearTimeout(timer)
    }
  }, [])

  // Find project by slug
  useEffect(() => {
    if (ready && slug && projects) {
      console.log('Looking for project with slug:', slug)

      const foundProject = projects.find((p) => p.slug === slug)
      console.log('Found project:', foundProject)

      if (foundProject) {
        setProject(foundProject)

        // Pré-carregar a imagem de capa para melhorar o LCP
        const preloadImage = new Image()
        preloadImage.src = getOriginalImagePath('cover')
      } else {
        navigate('/')
      }

      setLoading(false)
    }
  }, [ready, slug, navigate, projects])

  // Função para obter o caminho da imagem original (sem otimização)
  const getOriginalImagePath = (imageType: string, index?: number): string => {
    if (!project) return ''

    switch (imageType) {
      case 'cover':
      case 'thumbnail':
        return `/images/projects/${project.slug}/cover.jpg`
      case 'img01':
        return `/images/projects/${project.slug}/img01.jpg`
      case 'gallery':
        if (index) {
          return `/images/projects/${project.slug}/${String(index).padStart(
            2,
            '0',
          )}.jpg`
        }
        return ''
      default:
        return project.imageUrl || `/images/projects/${project.slug}/cover.jpg`
    }
  }

  // Função otimizada para obter imagens em alta qualidade
  const getHighQualityImagePath = (
    imageType: string,
    format: 'webp' | 'jpg' = 'webp',
  ): string => {
    if (!project) return ''

    // Se WebP não for suportado, usar JPG
    if (!webpSupported) {
      format = 'jpg'
    }

    // Para imagens principais, usar a versão original (sem redimensionamento)
    // para garantir máxima qualidade
    let baseName = ''
    switch (imageType) {
      case 'cover':
      case 'thumbnail':
        baseName = 'cover'
        break
      case 'img01':
        baseName = 'img-01'
        break
      default:
        baseName = 'cover'
    }

    // Usar a versão original (não redimensionada) para máxima qualidade
    return `/images/optimized/${project.slug}/${baseName}.${format}`
  }

  // Função específica para imagens da galeria - alta qualidade
  const getGalleryImagePath = (
    index: number,
    format: 'webp' | 'jpg' = 'webp',
  ): string => {
    if (!project) return ''

    // Se WebP não for suportado, usar JPG
    const actualFormat = webpSupported ? format : 'jpg'

    // Formatar o índice com zero à esquerda
    const formattedIndex = String(index).padStart(2, '0')

    // Usar a versão original para máxima qualidade
    return `/images/optimized/${project.slug}/${formattedIndex}.${actualFormat}`
  }

  // Função para lidar com erros de imagem
  const handleImageError = (
    imageKey: string,
    element?: HTMLImageElement,
    fallbackSrc?: string,
  ) => {
    console.log(`Erro ao carregar imagem: ${imageKey}`)
    setImageError((prev) => ({ ...prev, [imageKey]: true }))

    // Se um elemento e fallback foram fornecidos, tente o fallback
    if (element && fallbackSrc) {
      console.log(`Tentando fallback: ${fallbackSrc}`)
      element.src = fallbackSrc
    }
  }

  if (loading || projectsLoading) {
    return <div className="container py-12">Loading...</div>
  }

  if (!project) {
    return <div className="container py-12">Project not found</div>
  }

  return (
    <div className="project-detail-page-container">
      {/* Overlay de transição */}
      <div
        className={`page-transition-overlay ${
          transitionComplete ? 'fade-out' : ''
        }`}
      ></div>

      {/* Imagem de capa em alta qualidade */}
      <div className="hero-image-container">
        {!imageError['cover'] ? (
          <picture>
            {/* Versão WebP em alta qualidade */}
            <source
              srcSet={getHighQualityImagePath('cover', 'webp')}
              type="image/webp"
            />
            {/* Versão JPG em alta qualidade */}
            <source
              srcSet={getHighQualityImagePath('cover', 'jpg')}
              type="image/jpeg"
            />

            {/* Fallback */}
            <img
              src={getHighQualityImagePath('cover', 'jpg')}
              alt={t(project.title)}
              className="hero-image"
              onError={(e) => {
                console.log(
                  'Erro ao carregar imagem de capa otimizada, tentando original',
                )
                handleImageError(
                  'cover',
                  e.currentTarget,
                  getOriginalImagePath('cover'),
                )
              }}
            />
          </picture>
        ) : (
          <img
            src={getOriginalImagePath('cover')}
            alt={t(project.title)}
            className="hero-image"
            onError={() => {
              if (project.imageUrl) {
                const img = new Image()
                img.src = project.imageUrl
                img.onload = () => {
                  const coverImg = document.getElementById(
                    'project-cover-img',
                  ) as HTMLImageElement
                  if (coverImg) {
                    coverImg.src = project.imageUrl || ''
                  }
                }
              }
            }}
            id="project-cover-img"
          />
        )}

        {/* Overlay discreto no topo */}
        <div className="hero-top-overlay"></div>
      </div>

      {/* Ficha Técnica - Estilo Bipartido com Tailwind */}
      <div className="w-full">
        <div className="grid grid-cols-1 md:grid-cols-2">
          {/* Conteúdo da ficha técnica permanece o mesmo... */}
          <div className="bg-black text-white">
            <div className="p-16 md:p-16 sm:p-8">
              <motion.div
                className="mb-16"
                initial={{ opacity: 0, x: -40 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.9, ease: 'easeOut' }}
              >
                <h2 className="text-6xl font-bold leading-tight uppercase font-staatliches tracking-wide">
                  DIE BLUMEN VON
                  <br />
                  GESTERN
                </h2>
              </motion.div>

              <div className="mb-8">
                <div className="flex mb-4 items-start">
                  <div className="w-12 font-staatliches uppercase tracking-wider">
                    FÜR
                  </div>
                  <div className="font-inter font-light">
                    {project.client || 'Piffl Medien GmbH'}
                  </div>
                </div>

                <div className="flex mb-4 items-start">
                  <div className="w-12 font-staatliches uppercase tracking-wider">
                    BEI
                  </div>
                  <div className="font-inter font-light">
                    {project.agency || 'Propaganda B GmbH'}
                  </div>
                </div>

                <div className="flex mb-4 items-start">
                  <div className="w-12 font-staatliches uppercase tracking-wider">
                    MIT
                  </div>
                  <div className="font-inter font-light whitespace-nowrap">
                    {project.creativeDirection ||
                      'Helga Rechenbach und Ulrike Robben (Creative Direction)'}
                  </div>
                </div>

                <div className="flex mb-4 items-start">
                  <div className="w-12 font-staatliches uppercase tracking-wider">
                    WANN
                  </div>
                  <div className="font-inter font-light">
                    {project.year || '2016'}
                  </div>
                </div>
              </div>

              <div className="font-inter font-light text-sm">
                © {project.copyright || 'Propaganda B GmbH'}
              </div>
            </div>
          </div>

          <div className="bg-white text-black">
            <div className="p-16 md:p-16 sm:p-8 pr-24 md:pr-24 sm:pr-8">
              <div className="max-w-lg">
                <p className="mb-6 text-base leading-relaxed font-light">
                  <span className="font-staatliches font-normal text-lg">
                    EIN DEUTSCHES FILMDRAMA,
                  </span>{' '}
                  insziniert von Regisseur Chris Krauss, steht im Mittelpunkt
                  dieses Projekts. Der Film erzählt die Geschichte von Totila
                  Blumen, einem Holocaust-Forscher, der sich mit den Schrecken
                  der Vergangenheit seiner Familie auseinandersetzen muss. Sein
                  Leben verändert sich, als er die französische Studentin Zazie
                  trifft. Die Geschichte erkundet Themen wie Trauma und
                  menschliche Verbindung auf einfühlsame Weise.
                </p>

                <p className="mb-6 text-base leading-relaxed font-light">
                  Für „Die Blumen von gestern" wurden verschiedene
                  Werbematerialien entwickelt, darunter{' '}
                  <span className="font-bold">
                    Plakate, Flyer, Banner, DVDs
                  </span>{' '}
                  und <span className="font-bold">weitere Elemente</span>. Diese
                  wurden sorgfältig gestaltet, um die emotionale Tiefe des Films
                  sowie seine zentralen Themen visuell zu reflektieren und eine
                  Brücke zwischen Geschichte und Gegenwart zu schlagen.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Imagem img01 em alta qualidade */}
      <div className="w-full image-container" ref={imageRef}>
        <motion.div
          initial={{ opacity: 0, y: 60 }}
          animate={imageVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 60 }}
          transition={{
            duration: 1.2,
            ease: [0.22, 1, 0.36, 1],
          }}
          className="w-full"
        >
          {!imageError['img01'] ? (
            <picture>
              {/* Versão WebP em alta qualidade */}
              <source
                srcSet={getHighQualityImagePath('img01', 'webp')}
                type="image/webp"
              />
              {/* Versão JPG em alta qualidade */}
              <source
                srcSet={getHighQualityImagePath('img01', 'jpg')}
                type="image/jpeg"
              />
              {/* Fallback */}
              <img
                src={getHighQualityImagePath('img01', 'jpg')}
                alt={`${t(project.title)} - Detail`}
                className="w-full h-auto"
                onError={(e) => {
                  console.log(
                    'Erro ao carregar imagem otimizada img-01, tentando original',
                  )
                  handleImageError(
                    'img01',
                    e.currentTarget,
                    getOriginalImagePath('img01'),
                  )
                }}
              />
            </picture>
          ) : (
            <img
              src={getOriginalImagePath('img01')}
              alt={`${t(project.title)} - Detail`}
              className="w-full h-auto"
            />
          )}
        </motion.div>
      </div>

      {/* Galeria de imagens adicionais em alta qualidade */}
      <div className="container-custom py-12">
        <h2 className="text-2xl font-bold mb-6">
          {t('projectDetail.gallery', 'Galeria')}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4, 5].map((index) => {
            const imageKey = `gallery-${index}`

            // Pula renderização se a imagem já deu erro
            if (imageError[imageKey]) return null

            return (
              <picture key={index}>
                {/* Versão WebP em alta qualidade */}
                <source
                  srcSet={getGalleryImagePath(index, 'webp')}
                  type="image/webp"
                />
                {/* Versão JPG em alta qualidade */}
                <source
                  srcSet={getGalleryImagePath(index, 'jpg')}
                  type="image/jpeg"
                />
                {/* Fallback */}
                <img
                  src={getGalleryImagePath(index, 'jpg')}
                  alt={`${t(project.title)} - ${index}`}
                  className="w-full h-auto rounded-lg shadow-md"
                  onError={(e) => {
                    console.log(
                      `Erro ao carregar imagem otimizada da galeria ${index}, tentando original`,
                    )
                    handleImageError(
                      imageKey,
                      e.currentTarget,
                      getOriginalImagePath('gallery', index),
                    )
                  }}
                  loading="lazy"
                />
              </picture>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default ProjectDetailPage
