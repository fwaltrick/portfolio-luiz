import sharp from 'sharp'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const projectRoot = path.join(__dirname, '..')
const projectsDir = path.join(projectRoot, 'public', 'images', 'projects')
const outputDir = path.join(projectRoot, 'public', 'images', 'optimized')

// Configurações de tamanho e qualidade - APENAS md e lg, com qualidade alta mas otimizada
const sizeConfigs = {
  md: { width: 800, quality: 90 }, // Para tablets e dispositivos médios
  lg: { width: 1800, quality: 92 }, // Para desktop - Ajustado para 92% (ainda premium, mas mais eficiente)
}

// Limites de tamanho de arquivo (bytes) - AJUSTADOS para melhor equilíbrio
const MAX_ORIGINAL_SIZE = 1.5 * 1024 * 1024 // 1.5MB máximo para qualquer imagem (reduzido de 2MB)
const TARGET_ORIGINAL_SIZE = 900 * 1024 // 900KB alvo para imagens originais (reduzido de 1.2MB)

// WebP geralmente precisa de menos qualidade para resultados visuais similares
const webpQualityOffset = -5

// Qualidade mínima para garantir boa aparência
const minimumQuality = {
  jpg: 88, // Ainda alto para garantir qualidade premium
  webp: 83, // Ainda alto para garantir qualidade premium
}

// Criar diretório de saída se não existir
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true })
}

// Obter nome de arquivo padronizado
function getOutputFilename(filename, type = 'gallery') {
  if (filename.toLowerCase() === 'cover') {
    return 'hero'
  }

  if (/^\d+$/.test(filename)) {
    return `gallery-${filename.padStart(2, '0')}`
  }

  return filename
}

// Analisar tipo de conteúdo da imagem para otimização inteligente
async function analyzeImageContent(inputPath) {
  // Obter metadados da imagem
  const metadata = await sharp(inputPath).metadata()

  // Obter estatísticas do arquivo
  const stats = fs.statSync(inputPath)
  const fileSize = stats.size

  // Estimar a densidade de pixels (bytes por pixel)
  const pixelCount = metadata.width * metadata.height
  const bytesPerPixel = fileSize / pixelCount

  // Determinar se a imagem já está bem comprimida
  const isWellCompressed = bytesPerPixel < 0.5 // Menos de 0.5 bytes por pixel é geralmente bem comprimido

  // Detectar tipo de conteúdo baseado na extensão e características
  const isPhotographic = /\.(jpg|jpeg)$/i.test(inputPath)
  const isPNG = /\.png$/i.test(inputPath)
  const isLarge = metadata.width > 2000 || metadata.height > 2000

  // Determinar tipo de conteúdo para otimização inteligente
  let contentType = 'standard'

  if (isPNG && !metadata.hasAlpha) {
    contentType = 'graphic' // Imagens gráficas sem transparência
  } else if (isPhotographic && bytesPerPixel > 0.8) {
    contentType = 'photo' // Fotografias detalhadas
  } else if (isWellCompressed) {
    contentType = 'optimized' // Já está bem otimizada
  }

  return {
    contentType,
    width: metadata.width,
    height: metadata.height,
    aspectRatio: metadata.width / metadata.height,
    fileSize,
    bytesPerPixel,
    isWellCompressed,
    hasAlpha: metadata.hasAlpha || false,
  }
}

// Otimizar uma única imagem com alta qualidade
async function optimizeImage(inputPath, outputDir, filename, type = 'gallery') {
  try {
    // Analisar características da imagem
    const imageInfo = await analyzeImageContent(inputPath)

    console.log(
      `  📊 Processando imagem: ${imageInfo.width}x${
        imageInfo.height
      }, tamanho original: ${(imageInfo.fileSize / 1024).toFixed(1)}KB, tipo: ${
        imageInfo.contentType
      }`,
    )

    // Determinar nome do arquivo de saída
    const outputFilename = getOutputFilename(filename, type)
    const isCoverImage = type === 'hero'

    // Para imagens de capa, gerar apenas versão completa e média
    if (isCoverImage) {
      console.log(`  ℹ️ Processando imagem de capa`)

      // Determinar qualidade adaptativa para a versão original
      let originalQuality = 92 // Qualidade premium para capa, mas mais razoável (reduzido de 97%)

      // Forçar otimização para imagens muito grandes, mesmo que estejam abaixo do limite máximo
      if (
        imageInfo.fileSize > TARGET_ORIGINAL_SIZE ||
        imageInfo.fileSize > 900 * 1024
      ) {
        // Ajuste de qualidade baseado em quanto estamos acima do limite
        const ratio = imageInfo.fileSize / TARGET_ORIGINAL_SIZE

        if (ratio > 3 || imageInfo.fileSize > 1.5 * 1024 * 1024)
          originalQuality = Math.max(originalQuality - 7, minimumQuality.jpg)
        else if (ratio > 2 || imageInfo.fileSize > 1.2 * 1024 * 1024)
          originalQuality = Math.max(originalQuality - 5, minimumQuality.jpg)
        else if (ratio > 1.5 || imageInfo.fileSize > 1 * 1024 * 1024)
          originalQuality = Math.max(originalQuality - 3, minimumQuality.jpg)
        else originalQuality = Math.max(originalQuality - 2, minimumQuality.jpg)

        console.log(
          `  ⚠️ Imagem de capa grande (${(
            imageInfo.fileSize /
            1024 /
            1024
          ).toFixed(2)}MB)`,
        )
        console.log(
          `  🔧 Ajustando qualidade para ${originalQuality}% para melhor equilíbrio tamanho/qualidade`,
        )
      }

      // Processar JPEG em tamanho completo para a capa
      await sharp(inputPath)
        .jpeg({
          quality: originalQuality,
          mozjpeg: true,
          trellisQuantisation: true,
          overshootDeringing: true,
          optimizeScans: true,
          // Usar subamostragem de croma para melhor compressão em fotos
          chromaSubsampling:
            imageInfo.contentType === 'graphic' ? '4:4:4' : '4:2:0',
        })
        .toFile(path.join(outputDir, `${outputFilename}.jpg`))

      // Processar WebP em tamanho completo para a capa
      await sharp(inputPath)
        .webp({
          quality: originalQuality + webpQualityOffset,
          effort: 6,
          alphaQuality: 90,
          smartSubsample: true,
        })
        .toFile(path.join(outputDir, `${outputFilename}.webp`))

      // Verificar tamanhos
      const jpgOriginalStats = fs.statSync(
        path.join(outputDir, `${outputFilename}.jpg`),
      )
      const webpOriginalStats = fs.statSync(
        path.join(outputDir, `${outputFilename}.webp`),
      )

      console.log(
        `  ✓ Versões em tamanho completo criadas: JPG (${(
          jpgOriginalStats.size / 1024
        ).toFixed(1)}KB), WebP (${(webpOriginalStats.size / 1024).toFixed(
          1,
        )}KB)`,
      )

      // Gerar apenas versão média para capa (pular lg)
      const mdConfig = sizeConfigs.md

      // Pular se o original for menor que o tamanho médio
      if (imageInfo.width > mdConfig.width) {
        // Processar JPEG médio
        await sharp(inputPath)
          .resize({
            width: mdConfig.width,
            height: null,
            fit: sharp.fit.inside,
            withoutEnlargement: true,
          })
          .jpeg({
            quality: mdConfig.quality,
            mozjpeg: true,
            trellisQuantisation: true,
            overshootDeringing: true,
            optimizeScans: true,
            chromaSubsampling:
              imageInfo.contentType === 'graphic' ? '4:4:4' : '4:2:0',
          })
          .toFile(path.join(outputDir, `${outputFilename}-md.jpg`))

        // Processar WebP médio
        await sharp(inputPath)
          .resize({
            width: mdConfig.width,
            height: null,
            fit: sharp.fit.inside,
            withoutEnlargement: true,
          })
          .webp({
            quality: mdConfig.quality + webpQualityOffset,
            effort: 6,
            alphaQuality: 90,
            smartSubsample: true,
          })
          .toFile(path.join(outputDir, `${outputFilename}-md.webp`))

        // Verificar tamanhos
        const jpgMdStats = fs.statSync(
          path.join(outputDir, `${outputFilename}-md.jpg`),
        )
        const webpMdStats = fs.statSync(
          path.join(outputDir, `${outputFilename}-md.webp`),
        )

        console.log(
          `  ✓ Versões médias criadas: JPG (${(jpgMdStats.size / 1024).toFixed(
            1,
          )}KB), WebP (${(webpMdStats.size / 1024).toFixed(1)}KB)`,
        )
      } else {
        console.log(
          `  ⚠️ Tamanho original (${imageInfo.width}px) é menor que médio (${mdConfig.width}px), pulando versão média`,
        )
      }

      // Não gerar hero-lg para imagens de capa, pois já temos a versão completa
      return true
    }

    // Para imagens de galeria, processar normalmente os tamanhos configurados
    for (const [sizeName, config] of Object.entries(sizeConfigs)) {
      // Pular se o original for menor que o tamanho alvo
      if (imageInfo.width <= config.width) {
        console.log(
          `  ⚠️ Tamanho original (${imageInfo.width}px) é menor que ${sizeName} (${config.width}px), usando original sem redimensionamento`,
        )

        // Usar o original diretamente, mas com compressão otimizada
        let jpgQuality = config.quality
        let webpQuality = config.quality + webpQualityOffset

        // Se o arquivo original for muito grande, reduzir qualidade progressivamente
        if (imageInfo.fileSize > MAX_ORIGINAL_SIZE) {
          // Ajuste de qualidade baseado em quanto estamos acima do limite
          const ratio = imageInfo.fileSize / TARGET_ORIGINAL_SIZE

          if (ratio > 3)
            jpgQuality = Math.max(jpgQuality - 7, minimumQuality.jpg)
          else if (ratio > 2)
            jpgQuality = Math.max(jpgQuality - 5, minimumQuality.jpg)
          else if (ratio > 1.5)
            jpgQuality = Math.max(jpgQuality - 3, minimumQuality.jpg)
          else jpgQuality = Math.max(jpgQuality - 2, minimumQuality.jpg)

          webpQuality = Math.max(
            jpgQuality + webpQualityOffset,
            minimumQuality.webp,
          )

          console.log(
            `  ⚠️ Imagem original muito grande (${(
              imageInfo.fileSize /
              1024 /
              1024
            ).toFixed(2)}MB)`,
          )
          console.log(
            `  🔧 Ajustando qualidade para ${jpgQuality}% para reduzir tamanho`,
          )
        }

        // Processar JPEG com qualidade ajustada
        await sharp(inputPath)
          .jpeg({
            quality: jpgQuality,
            mozjpeg: true,
            trellisQuantisation: true,
            overshootDeringing: true,
            optimizeScans: true,
            chromaSubsampling:
              imageInfo.contentType === 'graphic' ? '4:4:4' : '4:2:0',
          })
          .toFile(path.join(outputDir, `${outputFilename}-${sizeName}.jpg`))

        // Processar WebP com qualidade ajustada
        await sharp(inputPath)
          .webp({
            quality: webpQuality,
            effort: 6,
            alphaQuality: 90,
            smartSubsample: true,
          })
          .toFile(path.join(outputDir, `${outputFilename}-${sizeName}.webp`))

        // Verificar tamanhos
        const jpgResizedStats = fs.statSync(
          path.join(outputDir, `${outputFilename}-${sizeName}.jpg`),
        )
        const webpResizedStats = fs.statSync(
          path.join(outputDir, `${outputFilename}-${sizeName}.webp`),
        )

        console.log(
          `  ✓ ${sizeName} (original sem redimensionamento) versões criadas: JPG (${(
            jpgResizedStats.size / 1024
          ).toFixed(1)}KB), WebP (${(webpResizedStats.size / 1024).toFixed(
            1,
          )}KB)`,
        )
        continue
      }

      // Estimar o tamanho após redimensionamento (proporção de pixels)
      const scaleFactor = config.width / imageInfo.width
      const estimatedSize = imageInfo.fileSize * (scaleFactor * scaleFactor)

      // Ajustar qualidade baseado no tamanho estimado
      let jpgQuality = config.quality
      let webpQuality = config.quality + webpQualityOffset

      // Para imagens lg, garantir qualidade premium
      if (sizeName === 'lg') {
        // Não reduzir qualidade abaixo de 90% para lg, mesmo se estimado for pequeno
        jpgQuality = Math.max(jpgQuality, 90)
        webpQuality = Math.max(webpQuality, 85)
      }

      // Processar JPEG com alta qualidade
      await sharp(inputPath)
        .resize({
          width: config.width,
          height: null,
          fit: sharp.fit.inside,
          withoutEnlargement: true,
        })
        .jpeg({
          quality: jpgQuality,
          mozjpeg: true,
          trellisQuantisation: true,
          overshootDeringing: true,
          optimizeScans: true,
          // Manter alta qualidade de croma para gráficos e interfaces
          chromaSubsampling:
            imageInfo.contentType === 'graphic' ? '4:4:4' : '4:2:0',
        })
        .toFile(path.join(outputDir, `${outputFilename}-${sizeName}.jpg`))

      // Processar WebP com alta qualidade
      await sharp(inputPath)
        .resize({
          width: config.width,
          height: null,
          fit: sharp.fit.inside,
          withoutEnlargement: true,
        })
        .webp({
          quality: webpQuality,
          effort: 6,
          alphaQuality: 90,
          smartSubsample: true,
        })
        .toFile(path.join(outputDir, `${outputFilename}-${sizeName}.webp`))

      // Verificar tamanhos
      const jpgResizedStats = fs.statSync(
        path.join(outputDir, `${outputFilename}-${sizeName}.jpg`),
      )
      const webpResizedStats = fs.statSync(
        path.join(outputDir, `${outputFilename}-${sizeName}.webp`),
      )

      console.log(
        `  ✓ ${sizeName} (${config.width}px) versões criadas: JPG (${(
          jpgResizedStats.size / 1024
        ).toFixed(1)}KB), WebP (${(webpResizedStats.size / 1024).toFixed(
          1,
        )}KB)`,
      )
    }

    console.log(`✅ ${path.basename(inputPath)} processada com sucesso`)
    return true
  } catch (error) {
    console.error(
      `❌ Erro ao processar ${path.basename(inputPath)}:`,
      error.message,
    )
    return false
  }
}

// Criar links simbólicos ou cópias nos caminhos originais para compatibilidade
async function createCompatibilityLinks(projectSlug, projectDir, outputDir) {
  console.log(`\n🔄 Criando links de compatibilidade para ${projectSlug}...`)

  // Verificar se existe cover.jpg no diretório original
  const originalCoverPath = path.join(projectDir, 'cover.jpg')
  const originalCoverExists = fs.existsSync(originalCoverPath)

  // Verificar se existe hero.jpg no diretório otimizado
  const optimizedHeroPath = path.join(outputDir, 'hero.jpg')
  const optimizedHeroExists = fs.existsSync(optimizedHeroPath)

  if (optimizedHeroExists) {
    // Criar cópia no diretório original para compatibilidade
    if (originalCoverExists) {
      console.log(
        `  ℹ️ cover.jpg já existe no diretório original, não sobrescrevendo`,
      )
    } else {
      fs.copyFileSync(optimizedHeroPath, originalCoverPath)
      console.log(
        `  ✓ Criada cópia de hero.jpg como cover.jpg no diretório original`,
      )
    }

    // Verificar se existe hero.webp
    const optimizedHeroWebpPath = path.join(outputDir, 'hero.webp')
    if (fs.existsSync(optimizedHeroWebpPath)) {
      // Criar cover.webp no diretório original
      fs.copyFileSync(
        optimizedHeroWebpPath,
        path.join(projectDir, 'cover.webp'),
      )
      console.log(
        `  ✓ Criada cópia de hero.webp como cover.webp no diretório original`,
      )
    }
  } else {
    console.log(
      `  ⚠️ Não foi possível encontrar hero.jpg no diretório otimizado`,
    )
  }
}

// Processar um diretório de projeto
async function processProject(projectSlug) {
  const projectDir = path.join(projectsDir, projectSlug)
  const projectOutputDir = path.join(outputDir, projectSlug)

  console.log(`\n📂 Processando projeto: ${projectSlug}`)

  if (!fs.existsSync(projectDir)) {
    console.error(`❌ Diretório de projeto não encontrado: ${projectDir}`)
    return
  }

  if (!fs.existsSync(projectOutputDir)) {
    fs.mkdirSync(projectOutputDir, { recursive: true })
  }

  const files = fs.readdirSync(projectDir)
  const imageFiles = files.filter((file) => /\.(jpg|jpeg|png)$/i.test(file))

  console.log(`🖼️ Encontradas ${imageFiles.length} imagens para processar`)

  // Processar imagem de capa primeiro
  const coverFile = imageFiles.find(
    (file) =>
      file.toLowerCase() === 'cover.jpg' ||
      file.toLowerCase() === 'cover.jpeg' ||
      file.toLowerCase() === 'cover.png',
  )

  if (coverFile) {
    console.log(`\n⚙️ Processando imagem de capa: ${coverFile}`)
    await optimizeImage(
      path.join(projectDir, coverFile),
      projectOutputDir,
      'cover',
      'hero',
    )
  }

  // Processar arquivos numerados em ordem
  const numberedFiles = imageFiles
    .filter(
      (file) => /^(\d+)\.(jpg|jpeg|png)$/i.test(file) && file !== coverFile,
    )
    .sort((a, b) => {
      const numA = parseInt(a.match(/^(\d+)/)[1], 10)
      const numB = parseInt(b.match(/^(\d+)/)[1], 10)
      return numA - numB
    })

  for (const file of numberedFiles) {
    const filename = path.basename(file, path.extname(file))
    console.log(`\n⚙️ Processando: ${file}`)
    await optimizeImage(path.join(projectDir, file), projectOutputDir, filename)
  }

  // Processar arquivos restantes
  const remainingFiles = imageFiles.filter(
    (file) => !numberedFiles.includes(file) && file !== coverFile,
  )

  for (const file of remainingFiles) {
    const filename = path.basename(file, path.extname(file))
    console.log(`\n⚙️ Processando: ${file}`)
    await optimizeImage(path.join(projectDir, file), projectOutputDir, filename)
  }

  // Criar links de compatibilidade
  await createCompatibilityLinks(projectSlug, projectDir, projectOutputDir)

  console.log(`\n✅ Projeto ${projectSlug} processado com sucesso`)
}

// Função principal
async function main() {
  console.log(
    '🖼️ Iniciando processamento de imagens para portfólio de design...',
  )
  console.log(
    '✨ Modo de alta qualidade com otimização inteligente - equilibrado para web profissional',
  )

  console.time('Tempo total de processamento')

  try {
    const args = process.argv.slice(2)
    if (args.length > 0) {
      await processProject(args[0])
    } else {
      const projects = fs.readdirSync(projectsDir).filter((item) => {
        const itemPath = path.join(projectsDir, item)
        return fs.statSync(itemPath).isDirectory()
      })

      for (const project of projects) {
        await processProject(project)
      }
    }

    console.log('\n🎉 Processamento de imagens concluído!')
  } catch (error) {
    console.error('\n❌ Erro fatal:', error)
    process.exit(1)
  } finally {
    console.timeEnd('Tempo total de processamento')
  }
}

main()
