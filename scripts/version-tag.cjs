const fs = require('fs')
const { execSync } = require('child_process')

const pkgPath = './package.json'
const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'))

// 🧠 Incrémentation (patch level)
const [major, minor, patch] = pkg.version.split('.').map(Number)
const newVersion = `${major}.${minor}.${patch + 1}`

pkg.version = newVersion
fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2))

console.log(`📦 New version: v${newVersion}`)

// // 🏷️ Git tag
// try {
//   execSync(`git add package.json`)
//   execSync(`git commit -m "build: v${newVersion}"`)
//   execSync(`git tag v${newVersion}`)
//   console.log(`✅ Git tagged: v${newVersion}`)
// } catch (err) {
//   console.error('❌ Git tagging failed:', err.message)
// }
