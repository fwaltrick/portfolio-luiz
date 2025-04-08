import sharp from 'sharp'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const projectRoot = path.join(__dirname, '..')
const projectsDir = path.join(projectRoot, 'public', 'images', 'projects')
const outputDir = path.join(projectRoot, 'public', 'images', 'optimized')

// Size targets in bytes
const sizeTargets = {
  thumbnail: 50 * 1024, // 50KB
  medium: 200 * 1024, // 200KB
  large: 400 * 1024, // 400KB
  desktop: 600 * 1024, // 600KB
}

// Size configurations
const sizeConfigs = {
  thumbnail: { width: 400, quality: 80 },
  medium: { width: 800, quality: 85 },
  large: { width: 1200, quality: 88 },
  desktop: { width: 1800, quality: 90 },
}

// WebP typically needs less quality for similar visual results
const webpQualityOffset = -5

// Create output directory if it doesn't exist
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true })
}

// Analyze image content type
async function analyzeImageContent(inputPath) {
  // Get image metadata
  const metadata = await sharp(inputPath).metadata()

  // Simple analysis based on file extension and size
  const isPhotographic = /\.(jpg|jpeg)$/i.test(inputPath)
  const isLarge = metadata.width > 2000 || metadata.height > 2000

  // Determine complexity category
  let contentType = 'standard'

  // For more accurate analysis, you could implement entropy calculation here

  return {
    contentType,
    width: metadata.width,
    height: metadata.height,
    aspectRatio: metadata.width / metadata.height,
  }
}

// Get standardized output filename
function getOutputFilename(filename) {
  if (filename === 'cover') {
    return 'cover'
  }

  if (/^\d+$/.test(filename)) {
    return `img-${filename.padStart(2, '0')}`
  }

  return `img-${filename}`
}

// Optimize a single image with size constraints
async function optimizeImage(inputPath, outputDir, filename) {
  try {
    // Analyze content type for smarter compression
    const imageInfo = await analyzeImageContent(inputPath)
    console.log(
      `  📊 Image analysis: ${imageInfo.width}x${imageInfo.height}, type: ${imageInfo.contentType}`,
    )

    // Determine output filename
    const outputFilename = getOutputFilename(filename)

    // Generate tiny placeholder for blur-up loading
    await sharp(inputPath)
      .resize({ width: 20, height: null, fit: sharp.fit.inside })
      .blur(10)
      .toBuffer()
      .then((buffer) => {
        const base64 = `data:image/jpeg;base64,${buffer.toString('base64')}`
        const slug = path.basename(outputDir)
        // Store this placeholder data - implementation depends on your setup
      })

    // Process each size with size constraints
    const results = {}

    // Process original size first (high quality)
    await sharp(inputPath)
      .jpeg({
        quality: 92,
        mozjpeg: true,
        trellisQuantisation: false,
        overshootDeringing: true,
        optimizeScans: false,
      })
      .toFile(path.join(outputDir, `${outputFilename}.jpg`))

    await sharp(inputPath)
      .webp({
        quality: 90,
        effort: 6,
      })
      .toFile(path.join(outputDir, `${outputFilename}.webp`))

    console.log(`  ✓ Original versions created`)

    // Process each size with size constraints
    for (const [sizeName, config] of Object.entries(sizeConfigs)) {
      const targetSize = sizeTargets[sizeName]

      // Skip if original is smaller than target size
      if (imageInfo.width <= config.width) {
        console.log(
          `  ⚠️ Original size (${imageInfo.width}px) is smaller than ${sizeName} (${config.width}px), skipping resize`,
        )

        // Copy the original files instead
        fs.copyFileSync(
          path.join(outputDir, `${outputFilename}.jpg`),
          path.join(outputDir, `${outputFilename}-${sizeName}.jpg`),
        )
        fs.copyFileSync(
          path.join(outputDir, `${outputFilename}.webp`),
          path.join(outputDir, `${outputFilename}-${sizeName}.webp`),
        )
        continue
      }

      // Process JPEG with size constraint
      const jpgResult = await optimizeImageForSize(
        inputPath,
        path.join(outputDir, `${outputFilename}-${sizeName}.jpg`),
        config.width,
        targetSize,
        imageInfo.contentType,
        'jpeg',
      )

      // Process WebP (typically can use lower quality for same visual result)
      const webpResult = await optimizeImageForSize(
        inputPath,
        path.join(outputDir, `${outputFilename}-${sizeName}.webp`),
        config.width,
        targetSize * 0.8, // WebP can target 20% smaller size
        imageInfo.contentType,
        'webp',
        jpgResult.quality + webpQualityOffset, // Start with slightly lower quality
      )

      results[sizeName] = {
        jpg: jpgResult,
        webp: webpResult,
      }

      console.log(`  ✓ ${sizeName} (${config.width}px) versions created`)
    }

    console.log(`✅ ${path.basename(inputPath)} optimized successfully`)
    return true
  } catch (error) {
    console.error(
      `❌ Error processing ${path.basename(inputPath)}:`,
      error.message,
    )
    return false
  }
}

// Optimize image with specific size target
async function optimizeImageForSize(
  inputPath,
  outputPath,
  width,
  targetSize,
  contentType,
  format = 'jpeg',
  startQuality = null,
) {
  // Base quality depends on content type and format
  let quality =
    startQuality ||
    (contentType === 'complex' ? 90 : contentType === 'simple' ? 80 : 85)

  // Adjust for format
  if (format === 'webp' && !startQuality) {
    quality += webpQualityOffset
  }

  let currentSize = Infinity
  let attempts = 0
  let imageBuffer

  // Try progressive quality reduction
  while (currentSize > targetSize && attempts < 5) {
    // Create sharp processor
    const processor = sharp(inputPath).resize({
      width,
      height: null,
      fit: sharp.fit.inside,
      withoutEnlargement: true,
      kernel: sharp.kernel.lanczos3,
    })

    // Apply format-specific settings
    if (format === 'webp') {
      processor.webp({
        quality,
        effort: 6,
        alphaQuality: 90,
        smartSubsample: true,
      })
    } else {
      processor.jpeg({
        quality,
        mozjpeg: true,
        trellisQuantisation: true,
        overshootDeringing: true,
        optimizeScans: true,
        // Use chroma subsampling for larger sizes
        chromaSubsampling: width > 1000 ? '4:2:0' : '4:4:4',
      })
    }

    // Process image
    imageBuffer = await processor.toBuffer()
    currentSize = imageBuffer.length

    console.log(
      `  ${width}px ${format}: Quality ${quality}% -> Size: ${(
        currentSize / 1024
      ).toFixed(1)}KB (target: ${(targetSize / 1024).toFixed(1)}KB)`,
    )

    // If we're still over target, reduce quality
    if (currentSize > targetSize) {
      // Calculate how much to reduce based on how far we are from target
      const ratio = currentSize / targetSize
      const reduction = ratio > 1.5 ? 8 : ratio > 1.2 ? 5 : 3
      quality = Math.max(quality - reduction, format === 'webp' ? 65 : 70) // Lower floor for WebP
    }

    attempts++
  }

  // Write final buffer to file
  fs.writeFileSync(outputPath, imageBuffer)

  return {
    quality,
    size: currentSize,
    width,
  }
}

// Process a project directory
async function processProject(projectSlug) {
  const projectDir = path.join(projectsDir, projectSlug)
  const projectOutputDir = path.join(outputDir, projectSlug)

  console.log(`\n📂 Processing project: ${projectSlug}`)

  if (!fs.existsSync(projectDir)) {
    console.error(`❌ Project directory not found: ${projectDir}`)
    return
  }

  if (!fs.existsSync(projectOutputDir)) {
    fs.mkdirSync(projectOutputDir, { recursive: true })
  }

  const files = fs.readdirSync(projectDir)
  const imageFiles = files.filter((file) => /\.(jpg|jpeg|png)$/i.test(file))

  console.log(`🖼️ Found ${imageFiles.length} images to optimize`)

  // Process cover image first
  const coverFile = imageFiles.find(
    (file) =>
      file.toLowerCase() === 'cover.jpg' ||
      file.toLowerCase() === 'cover.jpeg' ||
      file.toLowerCase() === 'cover.png',
  )

  if (coverFile) {
    console.log(`\n⚙️ Processing cover image: ${coverFile}`)
    await optimizeImage(
      path.join(projectDir, coverFile),
      projectOutputDir,
      'cover',
    )
  }

  // Process numbered files in order
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
    console.log(`\n⚙️ Processing: ${file}`)
    await optimizeImage(path.join(projectDir, file), projectOutputDir, filename)
  }

  // Process remaining files
  const remainingFiles = imageFiles.filter(
    (file) => !numberedFiles.includes(file) && file !== coverFile,
  )

  for (const file of remainingFiles) {
    const filename = path.basename(file, path.extname(file))
    console.log(`\n⚙️ Processing: ${file}`)
    await optimizeImage(path.join(projectDir, file), projectOutputDir, filename)
  }
}

// Main function
async function main() {
  console.log('🖼️ Starting optimized image processing for design portfolio...')
  console.time('Total processing time')

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

    console.log('\n🎉 Image optimization complete!')
  } catch (error) {
    console.error('\n❌ Fatal error:', error)
    process.exit(1)
  } finally {
    console.timeEnd('Total processing time')
  }
}

main()
