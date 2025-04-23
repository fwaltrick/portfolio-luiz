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
  data: { page: PageData | null }
  errors?: { message: string; locations: any[]; path: string[] }[]
  query: string
  variables: { relativePath: string }
}

// --- Componentes Customizados para Markdown - Ajustados ---
const markdownComponents = {
  // Títulos das seções (H2) - Staatliches, tamanho reduzido, alinhado esquerda
  h2: (props: { children: React.ReactNode }) => (
    <h2 className="text-xl md:text-xl font-staatliches mt-6 mb-1 text-gray-800 text-left">
      {' '}
      {/* Reduzido */}
      {props.children}
    </h2>
  ),
  // Parágrafos - text-sm (menor), alinhado esquerda
  p: (props: { children: React.ReactNode }) => (
    <p className="mb-4 text-sm leading-relaxed font-light text-left">
      {' '}
      {/* Reduzido para text-sm */}
      {props.children}
    </p>
  ),
  // Componentes fornecidos - mantendo alinhamento esquerdo
  li: (props: { children: React.ReactNode }) => (
    <li className="mb-1 text-jumbo-800 text-left">{props.children}</li>
  ),
  bold: (props: { children: React.ReactNode }) => (
    <strong className="font-bold text-jumbo-900">{props.children}</strong>
  ),
  italic: (props: { children: React.ReactNode }) => (
    <em className="italic text-jumbo-800">{props.children}</em>
  ),
  code: (props: { children: React.ReactNode }) => (
    <code className="text-xl font-staatliches text-jumbo-500 pr-0.5">
      {props.children}
    </code>
  ),
  ul: (props: { children: React.ReactNode }) => (
    <ul className="list-disc list-outside mb-4 ml-5 text-left">
      {props.children}
    </ul>
  ),
  ol: (props: { children: React.ReactNode }) => (
    <ol className="list-decimal list-outside mb-4 ml-5 text-left">
      {props.children}
    </ol>
  ),
  hr: () => <div className="py-4" />,
  // H6 removido
}

// --- Componente Principal ImpressumPage ---
const ImpressumPage: React.FC = () => {
  const { i18n } = useTranslation()
  const isGerman = i18n.language.startsWith('de')

  const [initialData, setInitialData] = useState<FullPageQueryResponse | null>(
    null,
  )
  const [isLoadingInitial, setIsLoadingInitial] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  const query = ` query ImpressumPageQuery($relativePath: String!) { page(relativePath: $relativePath) { title_en title_de copy_en copy_de } } `
  const variables = { relativePath: 'impressum.mdx' }

  useEffect(() => {
    /* ... lógica fetch ... */
    const fetchInitialData = async () => {
      setIsLoadingInitial(true)
      setError(null)
      try {
        const result = await client.queries.page(variables)
        setInitialData(result as FullPageQueryResponse)
      } catch (err: any) {
        console.error('Error fetching initial Impressum page data:', err)
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
  const pageData = data?.data?.page

  const renderWrapper = (content: React.ReactNode) => (
    <div className="container-custom py-12 md:py-16">{content}</div>
  )

  if (isLoadingInitial) {
    // Passa o JSX do Loader para o wrapper
    return renderWrapper(
      <div className="min-h-[50vh] flex items-center justify-center">
        <Loader size="large" />
      </div>,
    )
  }
  if (error) {
    // Passa o JSX de Erro para o wrapper
    return renderWrapper(
      <div className="text-red-600">
        <h1 className="text-3xl font-staatliches font-bold mb-6">Error</h1>
        <p>Failed to load content: {error}</p>
      </div>,
    )
  }

  const currentCopy = pageData
    ? isGerman
      ? pageData.copy_de
      : pageData.copy_en
    : null
  const pageTitle = pageData
    ? isGerman
      ? pageData.title_de
      : pageData.title_en
    : null

  if (!currentCopy) {
    return renderWrapper(<p>Impressum content currently unavailable.</p>)
  }

  return (
    // Container geral (vem do App.tsx com padding px-*) + padding vertical
    <div className="container-custom py-12 md:py-16">
      {/* Título Principal (H1) - Tamanho Reduzido, alinhado à esquerda */}
      <h1 className="text-3xl md:text-4xl font-staatliches font-bold mb-8 md:mb-12 text-left">
        {pageTitle || (isGerman ? 'Impressum' : 'Imprint')}
      </h1>

      {/* LAYOUT COM GRID para posicionar conteúdo à direita em telas maiores */}
      {/* 5 Colunas no total no 'md' breakpoint */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-8 lg:gap-12">
        {/* Coluna(s) Vazia(s) à Esquerda - Ocupa 2 das 5 colunas no 'md' */}
        {/* Deixamos este espaço em branco para empurrar o conteúdo para a direita */}
        <div className="hidden md:block md:col-span-3"></div>

        {/* Coluna de Conteúdo à Direita - Ocupa 3 das 5 colunas no 'md' */}
        {/* Adicionamos 'prose' para estilos de texto base e 'max-w-none' para que ele ocupe a largura da coluna do grid.
            O tamanho da fonte e alinhamento serão controlados pelos markdownComponents. */}
        <div className="md:col-span-3 prose max-w-none text-gray-700">
          <TinaMarkdown
            content={currentCopy}
            components={markdownComponents as any}
          />
        </div>
      </div>
    </div>
  )
}

export default ImpressumPage
