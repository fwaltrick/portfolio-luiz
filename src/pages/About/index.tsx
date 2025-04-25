/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { client } from '../../../tina/__generated__/client'
import { useTina } from 'tinacms/dist/react'
import { TinaMarkdown } from 'tinacms/dist/rich-text'
import type { TinaMarkdownContent } from 'tinacms/dist/rich-text'
import Loader from '../../components/Loader'

// --- Interfaces ---
interface PageData {
  title_en?: string | null
  title_de?: string | null
  copy_en?: TinaMarkdownContent | null
  copy_de?: TinaMarkdownContent | null
  profileImage?: string | null
}

interface FullPageQueryResponse {
  data: { page: PageData | null } // Permite page ser null
  errors?: { message: string; locations: any[]; path: string[] }[]
  query: string
  variables: { relativePath: string }
}

// --- Componentes Customizados para Markdown ---
const markdownComponents = {
  code: (props: { children: React.ReactNode }) => (
    <code className="text-xl font-staatliches text-jumbo-500 pr-0.5">
      {props.children}
    </code>
  ),
  p: (props: { children: React.ReactNode }) => (
    <p className="mb-4 text-lg leading-relaxed font-light">{props.children}</p>
  ),
  bold: (props: { children: React.ReactNode }) => (
    <strong className="font-bold">{props.children}</strong>
  ),
  h6: (props: { children: React.ReactNode }) => (
    <h6 className="mb-4 text-2xl leading-snug font-light">{props.children}</h6>
  ),
}

// --- Componente Principal AboutPage ---
const AboutPage: React.FC = () => {
  const { i18n } = useTranslation()
  const isGerman = i18n.language.startsWith('de')

  const [initialData, setInitialData] = useState<FullPageQueryResponse | null>(
    null,
  )
  const [isLoadingInitial, setIsLoadingInitial] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  const query = `
    query AboutPageQuery($relativePath: String!) {
      page(relativePath: $relativePath) {
        title_en
        title_de
        copy_en
        copy_de
        profileImage
      }
    }
  `
  const variables = {
    relativePath: 'about.mdx',
  }

  useEffect(() => {
    const fetchInitialData = async () => {
      setIsLoadingInitial(true)
      setError(null)
      try {
        const result = await client.queries.page(variables)
        setInitialData(result as FullPageQueryResponse)
      } catch (err: any) {
        // Log de erro ainda é útil
        console.error('Error fetching initial About page data:', err)
        const errorMessage =
          err.originalError?.message || err.message || 'Failed to load content'
        setError(errorMessage)
        setInitialData(null)
      } finally {
        setIsLoadingInitial(false)
      }
    }
    fetchInitialData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const { data } = useTina(
    initialData
      ? {
          query: initialData.query,
          variables: initialData.variables,
          data: initialData,
        }
      : { query, variables, data: null as any },
  )

  // Acessa 'page' dentro do objeto 'data' aninhado retornado por useTina
  const pageData = data?.data?.page
  // ***********************************

  const renderWrapper = (content: React.ReactNode) => (
    <div className="py-12 md:py-16">{content}</div>
  )

  if (isLoadingInitial) {
    return renderWrapper(
      <div className="min-h-[50vh] flex items-center justify-center">
        <Loader size="large" />
      </div>,
    )
  }
  if (error) {
    return renderWrapper(
      <div className="text-red-600">
        <h1 className="text-3xl font-staatliches font-bold mb-6">Error</h1>
        <p>Failed to load content: {error}</p>
      </div>,
    )
  }

  // Seleciona o conteúdo correto APÓS verificar se pageData existe
  const currentCopy = pageData
    ? isGerman
      ? pageData.copy_de
      : pageData.copy_en
    : null

  // Condição de conteúdo indisponível - verifica currentCopy
  if (!currentCopy) {
    return renderWrapper(<p>About content currently unavailable.</p>)
  }

  // Lógica da Imagem
  const originalImagePath: string | null =
    pageData?.profileImage && typeof pageData.profileImage === 'string'
      ? pageData.profileImage
      : null
  let optimizedWebpPath: string | null = null
  let optimizedJpegPath: string | null = null

  if (originalImagePath) {
    const baseFilename = originalImagePath.substring(
      originalImagePath.lastIndexOf('/') + 1,
    )
    optimizedJpegPath = `/images/about/${baseFilename.replace(
      /\.(jpg|jpeg|png)$/i,
      '.jpeg',
    )}`
    optimizedWebpPath = `/images/about/${baseFilename.replace(
      /\.(jpg|jpeg|png)$/i,
      '.webp',
    )}`
  }

  // --- JSX Final ---
  return (
    <div className="container-custom py-12 md:py-16">
      <div className="grid grid-cols-1 md:grid-cols-5 gap-8 lg:gap-12">
        <div className="md:col-span-3 prose max-w-2xl text-jumbo-950">
          <TinaMarkdown
            content={currentCopy} // Passa o conteúdo validado
            components={markdownComponents as any}
          />
        </div>
        <div className="md:col-span-2 md:flex md:items-start md:justify-end">
          {optimizedJpegPath && optimizedWebpPath ? (
            <picture>
              <source srcSet={optimizedWebpPath} type="image/webp" />
              <img
                src={optimizedJpegPath}
                alt={
                  isGerman
                    ? `Porträt von Luiz Dominguez`
                    : `Portrait of Luiz Dominguez`
                }
                loading="lazy"
                className="rounded-lg max-w-full w-full h-auto block"
                onError={(e) => {
                  if (
                    originalImagePath &&
                    e.currentTarget.src !== originalImagePath
                  ) {
                    console.warn(
                      `Optimized image failed (${e.currentTarget.src}), falling back to original: ${originalImagePath}`,
                    )
                    e.currentTarget.src = originalImagePath
                  } else if (!originalImagePath) {
                    console.error(
                      'Both optimized and original image paths are unavailable.',
                    )
                    e.currentTarget.style.display = 'none'
                  }
                }}
              />
            </picture>
          ) : (
            <div className="bg-jumbo-100 aspect-square w-full max-w-md rounded-lg flex items-center justify-center text-jumbo-500 mx-auto md:mx-0">
              (Image Area)
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default AboutPage
