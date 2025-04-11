// scripts/rename-project-images.js
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Configurações
const projectRoot = path.join(__dirname, '..')
const projectsDir = path.join(projectRoot, 'public', 'images', 'projects')

// Mapeamento de nomes antigos para novos
const fileNameMap = {
  'thumbnail.jpg': 'hero.jpg', // O atual thumbnail na verdade é a capa
  'img01.jpg': 'featured.jpg', // A imagem destacada
  '01.jpg': '01.jpg', // Manter galeria como está
  '02.jpg': '02.jpg',
  // Adicione outros mapeamentos conforme necessário
}

// Função para renomear arquivos em um projeto
async function renameProjectFiles(projectSlug) {
  const projectDir = path.join(projectsDir, projectSlug)

  console.log(`\n📂 Processando projeto: ${projectSlug}`)

  // Verificar se o diretório do projeto existe
  if (!fs.existsSync(projectDir)) {
    console.error(`❌ Diretório do projeto não encontrado: ${projectDir}`)
    return
  }

  // Listar todos os arquivos no diretório do projeto
  const files = fs.readdirSync(projectDir)

  // Filtrar apenas imagens
  const imageFiles = files.filter((file) => /\.(jpg|jpeg|png)$/i.test(file))

  console.log(`🖼️  Encontradas ${imageFiles.length} imagens para renomear`)

  // Criar um diretório de backup
  const backupDir = path.join(projectDir, '_backup')
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir)
  }

  // Processar cada imagem
  for (const file of imageFiles) {
    // Verificar se temos um mapeamento para este arquivo
    let newName = null

    // Verificar correspondência exata
    if (fileNameMap[file]) {
      newName = fileNameMap[file]
    }
    // Verificar padrões (por exemplo, números)
    else if (file.match(/^\d+\.jpg$/)) {
      // Manter o mesmo nome para arquivos numerados
      newName = file
    }
    // Qualquer outro arquivo desconhecido
    else {
      console.log(`  ⚠️ Arquivo não mapeado: ${file} - mantendo original`)
      continue
    }

    if (newName) {
      const oldPath = path.join(projectDir, file)
      const newPath = path.join(projectDir, newName)
      const backupPath = path.join(backupDir, file)

      // Fazer backup do arquivo original
      fs.copyFileSync(oldPath, backupPath)

      // Verificar se o arquivo de destino já existe
      if (fs.existsSync(newPath) && file !== newName) {
        console.log(`  ⚠️ O arquivo de destino ${newName} já existe - pulando`)
        continue
      }

      // Renomear o arquivo
      if (file !== newName) {
        fs.renameSync(oldPath, newPath)
        console.log(`  ✓ Renomeado: ${file} → ${newName}`)
      } else {
        console.log(`  ✓ Mantido: ${file} (já está no formato correto)`)
      }
    }
  }

  console.log(`✅ Projeto ${projectSlug} processado com sucesso`)
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
    await renameProjectFiles(project)
  }
}

// Processar um projeto específico
async function processSingleProject(projectSlug) {
  await renameProjectFiles(projectSlug)
}

// Função principal
async function main() {
  console.log('🔄 Iniciando reorganização de imagens de projetos...')

  // Verificar argumentos de linha de comando
  const args = process.argv.slice(2)
  if (args.length > 0) {
    // Se um projeto específico foi especificado
    const projectSlug = args[0]
    console.log(`🎯 Processando apenas o projeto: ${projectSlug}`)
    await processSingleProject(projectSlug)
  } else {
    // Processar todos os projetos
    await processAllProjects()
  }

  console.log('\n🎉 Reorganização de imagens concluída!')
  console.log('⚠️ Backups foram criados nas pastas _backup de cada projeto')
  console.log(
    '⚠️ Lembre-se de atualizar seu código para usar os novos nomes de arquivos',
  )
}

// Executar o script
main().catch((error) => {
  console.error('❌ Erro durante a reorganização:', error)
  process.exit(1)
})
