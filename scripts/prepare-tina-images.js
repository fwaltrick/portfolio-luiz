// scripts/prepare-tina-images.js
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const projectRoot = path.join(__dirname, '..')

// Diretórios
const contentDir = path.join(projectRoot, 'content', 'projects')
const projectsImageDir = path.join(projectRoot, 'public', 'images', 'projects')

// Função para preparar as imagens de um projeto
async function prepareProjectImages(projectFile) {
  console.log(`\n📂 Preparando imagens para: ${path.basename(projectFile)}`)

  // Ler o conteúdo do arquivo MDX
  const content = fs.readFileSync(projectFile, 'utf8')

  // Extrair o slug do nome do arquivo
  const slug = path.basename(projectFile, '.mdx')

  // Criar diretório para o projeto se não existir
  const projectDir = path.join(projectsImageDir, slug)
  if (!fs.existsSync(projectDir)) {
    fs.mkdirSync(projectDir, { recursive: true })
  }

  // Extrair caminhos de imagem
  const coverMatch = content.match(/coverImage: "([^"]+)"/)
  const img01Match = content.match(/img01: "([^"]+)"/)
  const galleryMatches = [...content.matchAll(/image: "([^"]+)"/g)]

  // Processar imagem de capa
  if (coverMatch && coverMatch[1]) {
    const imagePath = coverMatch[1]
    const sourcePath = path.join(projectRoot, 'public', imagePath)

    if (fs.existsSync(sourcePath)) {
      const targetPath = path.join(projectDir, 'hero.jpg')
      fs.copyFileSync(sourcePath, targetPath)
      console.log(
        `  ✓ Copiada imagem de capa: ${path.basename(sourcePath)} -> hero.jpg`,
      )
    } else {
      console.log(`  ⚠️ Imagem de capa não encontrada: ${sourcePath}`)
    }
  }

  // Processar imagem destacada
  if (img01Match && img01Match[1]) {
    const imagePath = img01Match[1]
    const sourcePath = path.join(projectRoot, 'public', imagePath)

    if (fs.existsSync(sourcePath)) {
      const targetPath = path.join(projectDir, 'img01.jpg')
      fs.copyFileSync(sourcePath, targetPath)
      console.log(
        `  ✓ Copiada imagem destacada: ${path.basename(
          sourcePath,
        )} -> img01.jpg`,
      )
    } else {
      console.log(`  ⚠️ Imagem destacada não encontrada: ${sourcePath}`)
    }
  }

  // Processar imagens da galeria
  galleryMatches.forEach((match, index) => {
    if (match && match[1]) {
      const imagePath = match[1]
      const sourcePath = path.join(projectRoot, 'public', imagePath)

      if (fs.existsSync(sourcePath)) {
        // Formatar o índice com zero à esquerda (01.jpg, 02.jpg, etc.)
        const targetPath = path.join(
          projectDir,
          `${String(index + 1).padStart(2, '0')}.jpg`,
        )
        fs.copyFileSync(sourcePath, targetPath)
        console.log(
          `  ✓ Copiada imagem de galeria #${index + 1}: ${path.basename(
            sourcePath,
          )} -> ${path.basename(targetPath)}`,
        )
      } else {
        console.log(
          `  ⚠️ Imagem de galeria #${index + 1} não encontrada: ${sourcePath}`,
        )
      }
    }
  })

  return slug
}

// Função principal
async function main() {
  console.log('🖼️  Preparando imagens do TinaCMS para otimização...')

  // Verificar se o diretório de conteúdo existe
  if (!fs.existsSync(contentDir)) {
    console.error(`❌ Diretório de conteúdo não encontrado: ${contentDir}`)
    process.exit(1)
  }

  // Listar todos os arquivos MDX
  const projectFiles = fs
    .readdirSync(contentDir)
    .filter((file) => file.endsWith('.mdx'))
    .map((file) => path.join(contentDir, file))

  console.log(`📚 Encontrados ${projectFiles.length} projetos para processar`)

  // Processar cada projeto
  const processedSlugs = []
  for (const projectFile of projectFiles) {
    const slug = await prepareProjectImages(projectFile)
    processedSlugs.push(slug)
  }

  console.log('\n✅ Preparação de imagens concluída!')
  console.log('🚀 Execute o script de otimização para cada projeto:')

  // Mostrar comandos para executar o script de otimização
  processedSlugs.forEach((slug) => {
    console.log(`   node optimize-images.js ${slug}`)
  })
}

// Executar o script
main().catch((error) => {
  console.error('❌ Erro durante a preparação de imagens:', error)
  process.exit(1)
})
