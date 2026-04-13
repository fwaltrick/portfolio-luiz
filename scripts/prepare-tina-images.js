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
  // Suporta formato novo (coverImageConfig.image sem aspas) e antigo (coverImage: "path")
  const newCoverMatch = content.match(
    /coverImageConfig:\s*\n\s+image:\s*["']?([^"'\s\n]+)["']?/,
  )
  const oldCoverMatch = content.match(/^coverImage:\s*["']?([^"'\s\n]+)["']?/m)
  const coverImagePath = newCoverMatch?.[1] || oldCoverMatch?.[1]

  // Imagens de galeria: itens de lista com "- image:" (sem quotes ou com quotes)
  const galleryMatches = [
    ...content.matchAll(/^\s+-\s+image:\s*["']?([^"'\s\n]+)["']?/gm),
  ]

  // Processar imagem de capa
  if (coverImagePath) {
    // Pular se a imagem já está no diretório projects/ (já está no lugar certo)
    if (coverImagePath.startsWith('/images/projects/')) {
      console.log(`  ℹ️ Capa já está no diretório correto: ${coverImagePath}`)
    } else {
      const sourcePath = path.join(projectRoot, 'public', coverImagePath)

      if (fs.existsSync(sourcePath)) {
        const ext = path.extname(sourcePath)
        const targetPath = path.join(projectDir, `cover${ext}`)
        fs.copyFileSync(sourcePath, targetPath)
        console.log(
          `  ✓ Copiada imagem de capa: ${path.basename(sourcePath)} -> cover${ext}`,
        )
      } else {
        console.log(`  ⚠️ Imagem de capa não encontrada: ${sourcePath}`)
      }
    }
  }

  // Processar imagens da galeria
  galleryMatches.forEach((match, index) => {
    if (match && match[1]) {
      const imagePath = match[1]

      // Pular se a imagem já está no diretório projects/ (já está no lugar certo)
      if (imagePath.startsWith('/images/projects/')) {
        console.log(`  ℹ️ Galeria #${index + 1} já está no diretório correto: ${imagePath}`)
        return
      }

      const sourcePath = path.join(projectRoot, 'public', imagePath)

      if (fs.existsSync(sourcePath)) {
        const ext = path.extname(sourcePath)
        const targetPath = path.join(
          projectDir,
          `${String(index + 1).padStart(2, '0')}${ext}`,
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
}

// Executar o script
main().catch((error) => {
  console.error('❌ Erro durante a preparação de imagens:', error)
  process.exit(1)
})
