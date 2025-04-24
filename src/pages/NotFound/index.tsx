import React from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

const NotFoundPage: React.FC = () => {
  const { t } = useTranslation() // Hook para buscar traduções

  // Chaves que você usará nos seus arquivos JSON de tradução
  // Os textos aqui são apenas fallbacks caso a chave não seja encontrada
  const titleKey = 'notFound.title'
  const defaultTitle = 'Off the Grid'
  const messageKey = 'notFound.message'
  const defaultMessage = "Looks like this page wasn't part of the final design." // Mensagem encurtada
  const buttonKey = 'notFound.button'
  const defaultButtonText = 'Back to Portfolio'

  return (
    // Container Principal da Página 404:
    // - flex, flex-col: Container flex vertical.
    // - items-center: Centraliza conteúdo horizontalmente.
    // - justify-center: Centraliza conteúdo verticalmente.
    // - text-center: Centraliza o texto dentro dos elementos.
    // - flex-grow: Faz o div tentar ocupar o espaço vertical do <main>.
    // - px-* py-*: Paddings para espaçamento interno.
    <div className="flex flex-col flex-grow items-center justify-center text-center px-4 sm:px-6 lg:px-8 py-12 md:py-16">
      {/* Código 404 */}
      <h1 className="text-4xl md:text-8xl font-staatliches font-bold text-jumbo-400 mb-4">
        404
      </h1>

      {/* Título da Página (Traduzido) */}
      <h2 className="text-4xl md:text-4xl font-staatliches font-semibold text-jumbo-800 mb-6">
        {t(titleKey, defaultTitle)}
      </h2>

      {/* Mensagem Principal (Traduzida e Encurtada) */}
      <p className="text-balance text-lg text-jumbo-600 mb-8 max-w-md">
        {t(messageKey, defaultMessage)}
      </p>

      {/* Botão/Link para Home (Traduzido) */}
      <Link
        to="/"
        className="inline-block bg-jumbo-950 text-white px-6 py-3 rounded-md hover:bg-jumbo-700 transition-colors duration-300 text-lg font-medium"
      >
        {t(buttonKey, defaultButtonText)}
      </Link>
    </div>
  )
}

export default NotFoundPage
