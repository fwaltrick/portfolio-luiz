// scripts/optimize-about-image.js (MODIFICADO PARA ESM)

// Use import em vez de require
import sharp from 'sharp'
import fs from 'fs'
import path from 'path'
import { glob } from 'glob' // Importa a função glob (geralmente assíncrona)
import { fileURLToPath } from 'url' // Para obter __dirname em ESM

// --- Recriando __dirname em ESM ---
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
// ----------------------------------

// --- Configuração ---
const ABOUT_IMAGE_SOURCE_DIR = path.join(
  __dirname,
  '../public/images/projects/about',
)
const OPTIMIZED_OUTPUT_DIR = path.join(
  __dirname,
  '../public/images/optimized/about',
)
const WEBP_QUALITY = 85
const MAX_WIDTH = 1000

console.log('--- Starting Specific About Image Optimization (ESM) ---')
console.log(`Source Directory: ${ABOUT_IMAGE_SOURCE_DIR}`)
console.log(`Output Directory: ${OPTIMIZED_OUTPUT_DIR}`)

// Função principal agora é async para usar await com glob e sharp
async function optimizeAboutImage() {
  // 1. Verifica se o diretório de origem existe
  if (!fs.existsSync(ABOUT_IMAGE_SOURCE_DIR)) {
    console.error(
      `Error: Source directory not found - ${ABOUT_IMAGE_SOURCE_DIR}`,
    )
    process.exit(1)
  }

  // 2. Garante que o diretório de SAÍDA exista
  if (!fs.existsSync(OPTIMIZED_OUTPUT_DIR)) {
    try {
      fs.mkdirSync(OPTIMIZED_OUTPUT_DIR, { recursive: true })
      console.log(`Created output directory: ${OPTIMIZED_OUTPUT_DIR}`)
    } catch (err) {
      console.error(
        `Error creating output directory ${OPTIMIZED_OUTPUT_DIR}:`,
        err,
      )
      process.exit(1)
    }
  }

  // 3. Encontra imagens usando glob (versão assíncrona)
  // Adiciona `posix: true` para garantir barras '/' consistentes nos paths retornados pelo glob
  const files = await glob(
    `${ABOUT_IMAGE_SOURCE_DIR}/*.@(jpg|jpeg|png|JPG|JPEG|PNG)`,
    { posix: true },
  )

  if (files.length === 0) {
    console.log('No compatible images found in the source directory.')
    return // Sai da função se não houver imagens
  }

  console.log(`Found ${files.length} image(s) to process...`)

  // 4. Processa cada imagem (usando Promise.all para paralelizar um pouco)
  const processingPromises = files.map(async (filePath) => {
    const fileName = path.basename(filePath)
    const fileNameWithoutExt = path.parse(fileName).name
    const outputWebpPath = path.join(
      OPTIMIZED_OUTPUT_DIR,
      `${fileNameWithoutExt}.webp`,
    )

    console.log(` Processing: ${fileName}`)

    try {
      const image = sharp(filePath)
      await image
        .resize({
          width: MAX_WIDTH,
          fit: 'inside',
          withoutEnlargement: true,
        })
        .webp({ quality: WEBP_QUALITY })
        .toFile(outputWebpPath)

      console.log(
        `  -> Saved optimized WebP to: ${path.relative(
          path.join(__dirname, '..'),
          outputWebpPath,
        )}`,
      )
    } catch (error) {
      console.error(`  Error processing ${fileName}:`, error)
    }
  })

  // Espera todas as operações de processamento terminarem
  await Promise.all(processingPromises)
}

// Executa a função principal e trata o resultado/erros
optimizeAboutImage()
  .then(() => {
    console.log('--- Specific About Image Optimization Finished ---')
  })
  .catch((err) => {
    console.error('--- Specific About Image Optimization Failed ---', err)
  })
