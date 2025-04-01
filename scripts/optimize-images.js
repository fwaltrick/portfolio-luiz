import sharp from 'sharp'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Configurações específicas para seu projeto
const projectRoot = path.join(__dirname, '..')
const projectsDir = path.join(projectRoot, 'public', 'images', 'projects')
const outputDir = path.join(projectRoot, 'public', 'images', 'optimized')

// Tamanhos para otimização
const sizes = {
  thumbnail: 400,
  medium: 800,
  large: 1200,
}

// Qualidade das imagens (80% oferece bom equilíbrio entre qualidade e tamanho)
const quality = 80

// Criar diretório de saída se não existir
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true })
}

// Processar um projeto específico
async function processProject(projectSlug) {
  const projectDir = path.join(projectsDir, projectSlug)
  const projectOutputDir = path.join(outputDir, projectSlug)

  console.log(`\n📂 Processando projeto: ${projectSlug}`)

  // Verificar se o diretório do projeto existe
  if (!fs.existsSync(projectDir)) {
    console.error(`❌ Diretório do projeto não encontrado: ${projectDir}`)
    return
  }

  // Criar diretório de saída para o projeto
  if (!fs.existsSync(projectOutputDir)) {
    fs.mkdirSync(projectOutputDir, { recursive: true })
  }

  // Listar todos os arquivos no diretório do projeto
  const files = fs.readdirSync(projectDir)

  // Filtrar apenas imagens
  const imageFiles = files.filter((file) => /\.(jpg|jpeg|png)$/i.test(file))

  console.log(`🖼️  Encontradas ${imageFiles.length} imagens para otimizar`)

  // Processar cada imagem
  for (const file of imageFiles) {
    const inputPath = path.join(projectDir, file)
    const filename = path.basename(file, path.extname(file))

    console.log(`\n⚙️  Processando: ${file}`)

    try {
      // 1. Criar versão WebP original (mesma resolução)
      await sharp(inputPath)
        .webp({ quality })
        .toFile(path.join(projectOutputDir, `${filename}.webp`))
      console.log(`  ✓ Versão WebP original criada`)

      // 2. Criar versão JPG otimizada (mesma resolução)
      await sharp(inputPath)
        .jpeg({ quality, mozjpeg: true })
        .toFile(path.join(projectOutputDir, `${filename}.jpg`))
      console.log(`  ✓ Versão JPG otimizada criada`)

      // 3. Criar diferentes tamanhos
      for (const [size, width] of Object.entries(sizes)) {
        // WebP versão redimensionada
        await sharp(inputPath)
          .resize(width)
          .webp({ quality })
          .toFile(path.join(projectOutputDir, `${filename}-${size}.webp`))

        // JPG versão redimensionada
        await sharp(inputPath)
          .resize(width)
          .jpeg({ quality, mozjpeg: true })
          .toFile(path.join(projectOutputDir, `${filename}-${size}.jpg`))

        console.log(`  ✓ Versões ${size} (${width}px) criadas`)
      }

      console.log(`✅ ${file} otimizado com sucesso`)
    } catch (error) {
      console.error(`❌ Erro ao otimizar ${file}:`, error.message)
    }
  }
}

// Processar todos os projetos
async function processAllProjects() {
  // Listar todos os diretórios de projetos
  const projects = fs.readdirSync(projectsDir).filter((item) => {
    const itemPath = path.join(projectsDir, item)
    return fs.statSync(itemPath).isDirectory()
  })

  console.log(
    `🚀 Encontrados ${projects.length} projetos: ${projects.join(', ')}`,
  )

  // Processar cada projeto
  for (const project of projects) {
    await processProject(project)
  }
}

// Processar um projeto específico
async function processSingleProject(projectSlug) {
  await processProject(projectSlug)
}

// Função principal
async function main() {
  console.log('🖼️  Iniciando otimização de imagens...')

  // Verificar argumentos de linha de comando
  const args = process.argv.slice(2)
  if (args.length > 0) {
    // Se um projeto específico foi especificado
    const projectSlug = args[0]
    console.log(`🎯 Otimizando apenas o projeto: ${projectSlug}`)
    await processSingleProject(projectSlug)
  } else {
    // Processar todos os projetos
    await processAllProjects()
  }

  console.log('\n🎉 Otimização de imagens concluída!')
  console.log(`📁 Imagens otimizadas salvas em: ${outputDir}`)
}

// Executar o script
main().catch((error) => {
  console.error('❌ Erro durante a otimização:', error)
  process.exit(1)
})
