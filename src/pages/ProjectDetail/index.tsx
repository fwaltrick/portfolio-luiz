import React, { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import { Project } from '../../types'
import './ProjectDetail.css'

interface ProjectDetailProps {
  projects: Project[]
}

const ProjectDetailPage: React.FC<ProjectDetailProps> = ({ projects }) => {
  const { slug } = useParams<{ slug: string }>()
  const { t, ready } = useTranslation()
  const navigate = useNavigate()
  const imageRef = useRef(null)
  const [imageVisible, setImageVisible] = useState(false)

  const [loading, setLoading] = useState(true)
  const [project, setProject] = useState<Project | undefined>()
  const [imageError, setImageError] = useState<Record<string, boolean>>({})
  const [transitionComplete, setTransitionComplete] = useState(false)

  // Configurar o Intersection Observer para a imagem
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        // Quando o elemento entrar no viewport
        if (entries[0].isIntersecting) {
          setImageVisible(true)
          // Desconectar o observer após ativar a animação uma vez
          observer.disconnect()
        }
      },
      {
        // Ativar quando 10% da imagem estiver visível
        threshold: 0.1,
        // Começar a observar um pouco antes da imagem aparecer
        rootMargin: '100px 0px',
      },
    )

    // Observar o elemento de referência
    if (imageRef.current) {
      observer.observe(imageRef.current)
    }

    // Limpar o observer quando o componente desmontar
    return () => {
      observer.disconnect()
    }
  }, [imageRef.current, loading]) // Re-executar quando a referência ou o loading mudar

  // Efeito para notificar que estamos em uma página de projeto
  useEffect(() => {
    // Adiciona classe ao body
    document.body.classList.add('project-detail-page')

    // Força a remoção de qualquer margem ou padding indesejado
    document.body.style.margin = '0'
    document.body.style.padding = '0'
    document.body.style.overflowX = 'hidden'

    // Seleciona o elemento root e remove margens
    const rootElement = document.getElementById('root')
    if (rootElement) {
      rootElement.style.margin = '0'
      rootElement.style.padding = '0'
    }

    // Adiciona um pequeno atraso para dar tempo da página renderizar
    const timer = setTimeout(() => {
      setTransitionComplete(true)
    }, 400)

    // Limpeza ao desmontar
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
    if (ready && slug) {
      console.log('Looking for project with slug:', slug)

      const foundProject = projects.find((p) => p.slug === slug)
      console.log('Found project:', foundProject)

      if (foundProject) {
        setProject(foundProject)
      } else {
        // Projeto não encontrado, redirecionar para a página inicial
        navigate('/')
      }

      setLoading(false)
    }
  }, [ready, slug, navigate, projects])

  // Função para gerar caminhos de imagem
  const getProjectImagePath = (imageType: string, index?: number) => {
    if (!project) return ''

    switch (imageType) {
      case 'thumbnail':
        return `/images/projects/${project.slug}/thumbnail.jpg`
      case 'cover':
        return `/images/projects/${project.slug}/cover.jpg`
      case 'img01':
        return `/images/projects/${project.slug}/img01.jpg`
      case 'gallery':
        return `/images/projects/${project.slug}/${index
          ?.toString()
          .padStart(2, '0')}.jpg`
      default:
        return (
          project.imageUrl || `/images/projects/${project.slug}/thumbnail.jpg`
        )
    }
  }

  // Função para lidar com erros de imagem
  const handleImageError = (imageKey: string) => {
    setImageError((prev) => ({ ...prev, [imageKey]: true }))
  }

  if (loading) {
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

      {/* Imagem de capa full width */}
      <div className="hero-image-container">
        {!imageError['cover'] ? (
          <img
            src={getProjectImagePath('cover')}
            alt={t(project.title)}
            className="hero-image"
            onError={() => handleImageError('cover')}
          />
        ) : (
          <img
            src={getProjectImagePath('thumbnail')}
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
          {/* Coluna esquerda - Créditos técnicos (fundo preto) */}
          <div className="bg-black text-white">
            <div className="p-16 md:p-16 sm:p-8">
              {/* Título com animação básica */}
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

          {/* Coluna direita - Descrição do projeto (fundo branco) */}
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

      {/* Imagem img01 abaixo da ficha técnica - com animação ativada pelo Intersection Observer */}
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
          <img
            src={getProjectImagePath('img01')}
            alt={`${t(project.title)} - Detail`}
            className="w-full h-auto"
            onError={() => handleImageError('img01')}
          />
        </motion.div>
      </div>

      {/* Galeria de imagens adicionais */}
      <div className="container py-12">
        <h2 className="text-2xl font-bold mb-6">
          {t('projectDetail.gallery', 'Galeria')}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4, 5].map((index) => {
            const imageKey = `gallery-${index}`

            // Pula renderização se a imagem já deu erro
            if (imageError[imageKey]) return null

            return (
              <img
                key={index}
                src={getProjectImagePath('gallery', index)}
                alt={`${t(project.title)} - ${index}`}
                className="w-full h-auto rounded-lg shadow-md"
                onError={() => handleImageError(imageKey)}
                loading="lazy"
              />
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default ProjectDetailPage
