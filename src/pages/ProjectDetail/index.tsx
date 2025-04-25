/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import { Project } from '../../types'
import useProjects from '../../hooks/useProjects'
import { client } from '../../../tina/__generated__/client'
import { TinaMarkdown } from 'tinacms/dist/rich-text'
import type { TinaMarkdownContent } from 'tinacms/dist/rich-text'
import ProjectGallery from '../../components/ProjectGallery'
import RelatedProjects from '../../components/RelatedProjects'
import NotFoundPage from '../NotFound/index'
import Loader from '../../components/Loader'

// --- Error Boundary ---
class ErrorBoundary extends React.Component<
  {
    children: React.ReactNode
    fallback: React.ReactNode
    isGerman?: boolean
  },
  { hasError: boolean }
> {
  constructor(props: {
    children: React.ReactNode
    fallback: React.ReactNode
    isGerman?: boolean
  }) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('Error in component:', error, info)
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback
    }
    return this.props.children
  }
}

// --- Interfaces ---
interface GalleryItem {
  desktopOnly: boolean
  mobileOnly: boolean
  position: number
  orientation: string
  image: any
  caption_de?: string
  caption_en?: string
  featured?: boolean
}

interface RichTextContent {
  type: string
  children: any[]
}

interface TinaProject {
  coverImageConfig: any
  _sys: {
    filename: string
  }
  title_de: string
  title_en: string
  title_bra?: string
  slug: string
  category_de: string
  category_en: string
  client?: string
  agency?: string
  year?: string
  creativeDirection?: string
  copyright?: string
  coverImage?: string
  description_de: RichTextContent
  description_en: RichTextContent
  img01?: string
  gallery?: GalleryItem[]
}

interface HeroImageProps {
  src: string
  fallbackSrc: string
  alt: string
}

interface CategoryChipProps {
  category: string
}

interface TranslatedTextProps {
  german: React.ReactNode
  english: React.ReactNode
  isChanging: boolean
}

// --- Componentes Memoizados ---
const HeroImage = React.memo(
  ({ src, fallbackSrc, alt }: HeroImageProps) => (
    <div className="relative w-full h-[100vh] overflow-hidden bg-black">
      <picture>
        <source srcSet={src.replace('.jpg', '.webp')} type="image/webp" />
        <img
          src={src}
          alt={alt}
          className="w-full h-full object-cover block will-change-transform transform-gpu backface-hidden"
          onError={(e) => {
            e.currentTarget.src = fallbackSrc
          }}
        />
      </picture>
      <div className="absolute top-0 left-0 right-0 h-[180px] bg-gradient-to-b from-black/40 via-black/20 to-transparent pointer-events-none z-10"></div>
    </div>
  ),
  (prev, next) =>
    prev.src === next.src &&
    prev.fallbackSrc === next.fallbackSrc &&
    prev.alt === next.alt,
)

const CategoryChip = React.memo(({ category }: CategoryChipProps) => (
  <div className="inline-block px-2.5 py-1 rounded bg-jumbo-800 text-white/90 text-xs uppercase tracking-wider font-['Inter'] mb-4">
    {category}
  </div>
))

const TranslatedText = React.memo(
  ({ german, english, isChanging }: TranslatedTextProps) => {
    const { i18n } = useTranslation()
    const isGerman = i18n.language.startsWith('de')

    return (
      <span
        className={`transition-opacity duration-200 ease-out ${
          isChanging ? 'opacity-50' : 'opacity-100'
        }`}
      >
        {isGerman ? german : english}
      </span>
    )
  },
)

// --- Componente Principal ProjectDetailPage ---
const ProjectDetailPage: React.FC = () => {
  // Hooks
  const { projects } = useProjects()
  const { slug } = useParams<{ slug: string }>()
  const { i18n } = useTranslation()
  const navigate = useNavigate()
  const isGerman = i18n.language.startsWith('de')

  // State
  const [project, setProject] = useState<Project | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [projectNotFound, setProjectNotFound] = useState<boolean>(false)
  const [, setImageVisible] = useState<boolean>(false)
  const [transitionComplete, setTransitionComplete] = useState<boolean>(false)
  const [isChangingLanguage, setIsChangingLanguage] = useState<boolean>(false)
  const [isTitleVisible, setIsTitleVisible] = useState<boolean>(false)

  // Refs
  const imageRef = useRef<HTMLDivElement | null>(null)
  const tinaProjectRef = useRef<TinaProject | null>(null)
  const scrollPositionRef = useRef<number>(0)
  const prevLanguageRef = useRef<string>(i18n.language)
  const titleObserverRef = useRef<HTMLDivElement | null>(null)

  // URLs de Imagem Memoizadas
  const heroImageSrc = useMemo(
    () => (slug ? `/images/optimized/${slug}/hero.jpg` : ''),
    [slug],
  )
  const heroImageFallback = useMemo(
    () =>
      project?.imageUrl || (slug ? `/images/projects/${slug}/hero.jpg` : ''),
    [project?.imageUrl, slug],
  )

  // --- Efeitos ---

  // Resetar visibilidade do título ao mudar de projeto (slug)
  useEffect(() => {
    setIsTitleVisible(false)
  }, [slug])

  // Efeito de Body Styling
  useEffect(() => {
    document.body.classList.add('overflow-x-hidden')
    document.body.style.margin = '0'
    document.body.style.padding = '0'
    const timer = setTimeout(() => setTransitionComplete(true), 300)
    return () => {
      document.body.classList.remove('overflow-x-hidden')
      document.body.style.margin = ''
      document.body.style.padding = ''
      clearTimeout(timer)
    }
  }, [])

  // Intersection Observer para a imagem de capa
  useEffect(() => {
    if (!imageRef.current) return
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setImageVisible(true)
          observer.disconnect()
        }
      },
      { threshold: 0.1, rootMargin: '100px 0px' },
    )
    observer.observe(imageRef.current)
    return () => observer.disconnect() // Usa disconnect pois só precisa uma vez
  }, [])

  // Intersection Observer para o Título
  useEffect(() => {
    const titleElement = titleObserverRef.current
    // Não faz nada se o elemento não existir ou se já estiver visível (otimização)
    if (!titleElement || isTitleVisible) return

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0]
        if (entry.isIntersecting) {
          // console.log(`[Observer - ${slug}] Title is intersecting!`);
          setIsTitleVisible(true)
          // Para de observar este elemento específico após se tornar visível
          // Não usamos disconnect() aqui para caso o observer seja reutilizado internamente pelo React
          observer.unobserve(titleElement)
        }
      },
      {
        root: null,
        rootMargin: '0px 0px -50px 0px', // Trigger um pouco antes de entrar totalmente
      },
    )

    observer.observe(titleElement)

    // Função de limpeza para este efeito específico
    return () => {
      // Para de observar o elemento atual quando o efeito for limpo
      // (seja por unmount ou por mudança nas dependências que causa re-execução)
      if (titleElement) {
        observer.unobserve(titleElement)
      }
    }
    // Depende de 'project' para re-rodar quando os dados do projeto mudam
    // E de 'isTitleVisible' para não recriar o observer se já estiver visível
  }, [project, isTitleVisible])

  // Fetch TinaCMS
  const fetchTinaProject =
    useCallback(async (): Promise<TinaProject | null> => {
      if (!slug) return null
      try {
        const result = await client.queries.project({
          relativePath: `${slug}.mdx`,
        })
        if (result.data.project) {
          return result.data.project as unknown as TinaProject
        }
        return null
      } catch (error) {
        console.error('Error fetching from TinaCMS:', error)
        return null
      }
    }, [slug])

  // Efeito de Carregamento de Dados
  useEffect(() => {
    const loadProject = async () => {
      if (!slug) {
        console.warn('ProjectDetailPage: No slug provided.')
        setProjectNotFound(true)
        setLoading(false)
        return
      }

      setLoading(true)
      setError(null)
      setProject(null)
      setProjectNotFound(false)

      try {
        const tinaData = await fetchTinaProject()
        let finalProjectData: Project | null = null

        if (tinaData) {
          tinaProjectRef.current = tinaData
          const formattedProject = {
            id: tinaData._sys.filename,
            slug: tinaData.slug,
            title: tinaData.title_en || tinaData.title_de,
            title_de: tinaData.title_de,
            title_en: tinaData.title_en,
            title_bra: tinaData.title_bra,
            category: tinaData.category_en || tinaData.category_de,
            category_de: tinaData.category_de,
            category_en: tinaData.category_en,
            client: tinaData.client,
            agency: tinaData.agency,
            year: tinaData.year,
            creativeDirection: tinaData.creativeDirection,
            copyright: tinaData.copyright,
            description: tinaData.description_en || tinaData.description_de,
            description_de: tinaData.description_de,
            description_en: tinaData.description_en,
            coverImageConfig: tinaData.coverImageConfig
              ? {
                  image: tinaData.coverImageConfig.image,
                  orientation:
                    tinaData.coverImageConfig.orientation || 'landscape',
                  includeInGallery:
                    tinaData.coverImageConfig.includeInGallery || false,
                  galleryPosition:
                    tinaData.coverImageConfig.galleryPosition || 999,
                }
              : undefined,
            coverImage: tinaData.coverImage || tinaData.coverImageConfig?.image,
            gallery: tinaData.gallery
              ?.filter((item) => item.image)
              .map((item, index) => ({
                image: item.image,
                orientation: item.orientation || 'landscape',
                position: item.position || index + 1,
                caption_de: item.caption_de,
                caption_en: item.caption_en,
                featured: item.featured || false,
                mobileOnly: item.mobileOnly || false,
                desktopOnly: item.desktopOnly || false,
              })),
          }
          finalProjectData = formattedProject as unknown as Project
        } else {
          console.log(
            `ProjectDetailPage: Tina data not found for slug "${slug}", checking context...`,
          )
          const contextProject = projects?.find((p) => p.slug === slug)
          if (contextProject) {
            console.log(
              `ProjectDetailPage: Found project in context for slug "${slug}".`,
            )
            finalProjectData = contextProject
          } else {
            console.warn(
              `ProjectDetailPage: Project with slug "${slug}" not found in Tina or context.`,
            )
            setProjectNotFound(true)
          }
        }

        setProject(finalProjectData)
      } catch (err) {
        console.error('Error loading project:', err)
        setError(err instanceof Error ? err.message : String(err))
        setProject(null)
        setProjectNotFound(false)
      } finally {
        setLoading(false)
      }
    }

    loadProject()
  }, [slug, fetchTinaProject, projects])

  // Efeito de Mudança de Idioma
  useEffect(() => {
    if (prevLanguageRef.current === i18n.language) {
      return
    }

    setIsChangingLanguage(true)
    scrollPositionRef.current = window.scrollY
    prevLanguageRef.current = i18n.language

    const restoreScrollTimer = setTimeout(() => {
      window.scrollTo(0, scrollPositionRef.current)
      const transitionEndTimer = setTimeout(() => {
        setIsChangingLanguage(false)
      }, 50)

      return () => clearTimeout(transitionEndTimer)
    }, 150)

    return () => clearTimeout(restoreScrollTimer)
  }, [i18n.language])

  // ---- Lógica de Renderização ----

  const currentDescription = useMemo(() => {
    if (!project) return null
    return isGerman ? project.description_de : project.description_en
  }, [project, isGerman])

  const markdownComponents = {
    h1: (props: { children: React.ReactNode }) => (
      <h1 className="text-2xl font-staatliches mb-4 text-jumbo-900">
        {props.children}
      </h1>
    ),
    h2: (props: { children: React.ReactNode }) => (
      <h2 className="text-xl font-staatliches mt-6 mb-3 text-jumbo-800">
        {props.children}
      </h2>
    ),
    p: (props: { children: React.ReactNode }) => (
      <p className="mb-4 text-base leading-relaxed font-light text-jumbo-950">
        {props.children}
      </p>
    ),
    a: (props: { children: React.ReactNode; url: string }) => (
      <a
        href={props.url}
        className="text-jumbo-600 hover:text-jumbo-800 hover:underline transition-colors duration-300"
        target="_blank"
        rel="noopener noreferrer"
      >
        {props.children}
      </a>
    ),
    ul: (props: { children: React.ReactNode }) => (
      <ul className="mb-4 ml-5 list-disc text-jumbo-800">{props.children}</ul>
    ),
    ol: (props: { children: React.ReactNode }) => (
      <ol className="mb-4 ml-5 list-decimal text-jumbo-800">
        {props.children}
      </ol>
    ),
    li: (props: { children: React.ReactNode }) => (
      <li className="mb-1 text-jumbo-800">{props.children}</li>
    ),
    bold: (props: { children: React.ReactNode }) => (
      <strong className="font-sans font-bold mb-4 text-jumbo-900">
        {props.children}
      </strong>
    ),
    italic: (props: { children: React.ReactNode }) => (
      <em className="italic text-jumbo-800">{props.children}</em>
    ),
    code: (props: { children: React.ReactNode }) => (
      <code className="text-xl font-staatliches text-jumbo-600 pr-0.5">
        {props.children}
      </code>
    ),
    blockquote: (props: { children: React.ReactNode }) => (
      <blockquote className="border-l-4 border-jumbo-300 pl-4 italic my-4 text-jumbo-600">
        {props.children}
      </blockquote>
    ),
    hr: () => <hr className="my-6 border-t border-jumbo-200" />,
    img: (props: { url: string; alt?: string }) => (
      <img
        src={props.url}
        alt={props.alt || ''}
        className="my-4 rounded-lg max-w-full h-auto"
      />
    ),
  }

  // Render Loading
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader size="large" />
      </div>
    )
  }

  if (projectNotFound) {
    return <NotFoundPage />
  }

  // Render Error
  if (error) {
    return (
      <div className="container mx-auto max-w-7xl px-16 sm:px-8 py-12">
        <h2 className="text-xl font-bold text-red-500 mb-4">
          {isGerman ? 'Fehler' : 'Error'}
        </h2>
        <p className="text-jumbo-800">{error}</p>
        <button
          onClick={() => navigate('/')}
          className="mt-4 px-4 py-2 bg-jumbo-700 text-white rounded hover:bg-jumbo-600 transition-colors duration-300"
        >
          {isGerman ? 'Zurück zur Startseite' : 'Return to Home'}
        </button>
      </div>
    )
  }

  // Render Not Found
  if (!project) {
    console.warn(
      'ProjectDetailPage: Rendering NotFoundPage as fallback because project is null after loading without specific errors.',
    )
    return <NotFoundPage />
  }

  // Prepare labels
  const labels = {
    for: isGerman ? 'FÜR' : 'FOR',
    at: isGerman ? 'BEI' : 'AT',
    with: isGerman ? 'MIT' : 'WITH',
    when: isGerman ? 'WANN' : 'WHEN',
  }
  const heroImageAlt = isGerman
    ? project.title_de || project.title
    : project.title_en || project.title
  const errorMessages = {
    title: isGerman
      ? 'Fehler beim Rendern des Inhalts'
      : 'Error Rendering Content',
    message: isGerman
      ? 'Es gab ein Problem bei der Anzeige dieses Inhalts.'
      : 'There was a problem displaying this content.',
    reloadButton: isGerman ? 'Seite neu laden' : 'Reload Page',
  }

  // ---- JSX de Retorno Principal ----
  return (
    <div className="w-full mx-auto p-0 relative max-w-[1440px]">
      {/* Overlay de Transição */}
      <div
        className={`fixed top-0 left-0 right-0 bottom-0 bg-black z-[100] pointer-events-none transition-opacity duration-500 ease-out ${
          transitionComplete ? 'opacity-0' : 'opacity-100'
        }`}
      ></div>

      {/* Hero Image */}
      <div aria-label={heroImageAlt}>
        <HeroImage
          src={heroImageSrc}
          fallbackSrc={heroImageFallback}
          alt={heroImageAlt}
        />
      </div>

      {/* Detalhes do Projeto */}
      <div className="w-full">
        <div className="grid grid-cols-1 md:grid-cols-2">
          {/* Coluna Esquerda */}
          <div className="bg-jumbo-950 text-white">
            <div className="p-16 md:p-16 sm:p-8">
              <CategoryChip
                category={
                  isGerman
                    ? project.category_de || project.category
                    : project.category_en || project.category
                }
              />
              {/* Título com Animação */}
              <div className="mb-16">
                <motion.div
                  ref={titleObserverRef}
                  initial={{ opacity: 0, x: -40 }}
                  animate={
                    isTitleVisible
                      ? { opacity: 1, x: 0 }
                      : { opacity: 0, x: -40 }
                  }
                  transition={{ duration: 0.9, ease: 'easeOut' }}
                >
                  <h2 className="[text-wrap:balance] text-6xl font-bold leading-tight uppercase font-staatliches tracking-wide">
                    <TranslatedText
                      german={project.title_de || project.title}
                      english={project.title_en || project.title}
                      isChanging={isChangingLanguage}
                    />
                  </h2>
                </motion.div>
                {project.title_bra && (
                  <h3 className="text-3xl font-staatliches uppercase mt-2 text-jumbo-300">
                    {project.title_bra}
                  </h3>
                )}
              </div>
              {/* Metadata */}
              <div className="mb-8 grid grid-cols-[3rem_1fr] gap-y-4">
                {project.client && (
                  <>
                    <div className="font-staatliches uppercase tracking-wider text-jumbo-300">
                      {labels.for}
                    </div>
                    <div className="font-inter font-light">
                      {project.client}
                    </div>
                  </>
                )}
                {project.agency && (
                  <>
                    <div className="font-staatliches uppercase tracking-wider text-jumbo-300">
                      {labels.at}
                    </div>
                    <div className="font-inter font-light">
                      {project.agency}
                    </div>
                  </>
                )}
                {project.creativeDirection && (
                  <>
                    <div className="font-staatliches uppercase tracking-wider text-jumbo-300">
                      {labels.with}
                    </div>
                    <div className="font-inter font-light">
                      {project.creativeDirection}
                    </div>
                  </>
                )}
                {project.year && (
                  <>
                    <div className="font-staatliches uppercase tracking-wider text-jumbo-300">
                      {labels.when}
                    </div>
                    <div className="font-inter font-light">{project.year}</div>
                  </>
                )}
              </div>
              {project.copyright && (
                <div className="font-inter font-light text-sm text-jumbo-300">
                  {project.copyright}
                </div>
              )}
            </div>
          </div>
          {/* Coluna Direita */}
          <div className="bg-jumbo-100 text-jumbo-950">
            <div className="p-16 md:p-24 sm:p-16 pr-24 md:pr-24 sm:pr-16">
              <div className="max-w-xl">
                <div className="prose prose-sm max-w-none">
                  <ErrorBoundary
                    isGerman={isGerman}
                    fallback={
                      <div className="p-4 bg-jumbo-100 border border-jumbo-200 rounded">
                        <h3 className="text-jumbo-600 font-bold">
                          {errorMessages.title}
                        </h3>
                        <p className="text-jumbo-700">
                          {errorMessages.message}
                        </p>
                      </div>
                    }
                  >
                    {typeof currentDescription === 'string' ? (
                      <p className="[text-wrap:balance] mb-6 text-base leading-relaxed font-light text-jumbo-950">
                        {currentDescription}
                      </p>
                    ) : currentDescription ? (
                      <div className="[text-wrap:balance] min-h-[100px]">
                        <TinaMarkdown
                          content={currentDescription as TinaMarkdownContent}
                          components={markdownComponents as any}
                        />
                      </div>
                    ) : (
                      <p className="text-jumbo-500 italic">
                        {isGerman
                          ? 'Keine Beschreibung für dieses Projekt verfügbar.'
                          : 'No description available for this project.'}
                      </p>
                    )}
                  </ErrorBoundary>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Galeria e Projetos Relacionados */}
      {/* Renderiza somente se 'project' e 'projects' existirem */}
      {project && projects && projects.length > 0 && (
        <div className="w-full">
          <ErrorBoundary
            isGerman={isGerman}
            fallback={
              <div className="p-8 text-center">
                <p className="text-red-500">
                  {isGerman
                    ? 'Fehler beim Laden der Galerie-Bilder.'
                    : 'Failed to load gallery images.'}
                </p>
                <button
                  onClick={() => window.location.reload()}
                  className="mt-4 px-4 py-2 bg-jumbo-800 text-white rounded hover:bg-jumbo-700 transition-colors duration-300"
                >
                  {errorMessages.reloadButton}
                </button>
              </div>
            }
          >
            {/* Renderiza a Galeria apenas se houver itens */}
            {project.gallery && project.gallery.length > 0 && (
              <ProjectGallery
                slug={slug || ''}
                galleryItems={(project.gallery || []).map((item: any) => ({
                  ...item,
                  image: item.image || item.src || '',
                }))}
                coverImageConfig={project.coverImageConfig}
                coverImage={project.coverImage}
                heroImageAlt={heroImageAlt}
                isGerman={isGerman}
                isChangingLanguage={isChangingLanguage}
              />
            )}
            {/* Renderiza Projetos Relacionados */}
            <RelatedProjects currentProject={project} allProjects={projects} />
          </ErrorBoundary>
        </div>
      )}
    </div>
  )
}

export default ProjectDetailPage
