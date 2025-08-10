import fs from 'fs'
import path from 'path'

const projectDir = path.resolve('./src')

const baseOutputName = 'full_project'

const allExtensions = ['.vue', '.js', '.ts', '.json', '.css', '.scss']
const vueExtensions = ['.vue']
const tsExtensions = ['.ts']
const cssExtensions = ['.css', '.scss']

function cleanContent(content) {
  // Découper en lignes
  const lines = content.split('\n')

  // Filtrer : supprimer lignes vides ou lignes commentaires simples
  const filteredLines = lines.filter(line => {
    const trimmed = line.trim()
    // Supprime ligne vide
    if (trimmed === '') return false
    // Supprime ligne commentaire // ou /* ... */ (sur une seule ligne)
    if (trimmed.startsWith('//')) return false
    if (/^\/\*.*\*\/$/.test(trimmed)) return false
    return true
  })

  // Rejoindre avec un saut de ligne simple
  return filteredLines.join('\n')
}

const args = process.argv.slice(2)

let extensionsToInclude = allExtensions
let outputFile = path.resolve(`${baseOutputName}_source.txt`)

if (args.includes('vue')) {
  extensionsToInclude = vueExtensions
  outputFile = path.resolve(`${baseOutputName}_vue.txt`)
} else if (args.includes('ts')) {
  extensionsToInclude = tsExtensions
  outputFile = path.resolve(`${baseOutputName}_ts.txt`)
} else if (args.includes('css')) {
  extensionsToInclude = cssExtensions
  outputFile = path.resolve(`${baseOutputName}_css.txt`)
}

function readFilesRecursively(dir) {
  let content = ''

  content += `\n// === Dossier: ${path.relative(projectDir, dir)} ===\n`

  const files = fs.readdirSync(dir)

  for (const file of files) {
    const fullPath = path.join(dir, file)
    const stat = fs.statSync(fullPath)

    if (stat.isDirectory()) {
      content += readFilesRecursively(fullPath)
    } else {
      const ext = path.extname(file)
      if (extensionsToInclude.includes(ext)) {
        let fileContent = fs.readFileSync(fullPath, 'utf-8')
        fileContent = cleanContent(fileContent)
        const relativePath = path.relative(projectDir, fullPath)
        content += `\n// --- ${relativePath} ---\n`
        content += fileContent + '\n'
      }
    }
  }

  return content
}

const allContent = readFilesRecursively(projectDir)
fs.writeFileSync(outputFile, allContent, 'utf-8')
console.log(`All source code saved to ${outputFile}`)
