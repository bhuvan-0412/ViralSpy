const fs = require('fs')
const path = require('path')

console.log('🔍 Validating environment variables against .env.example...')

const examplePath = path.join(__dirname, '../.env.example')
const localPath = path.join(__dirname, '../.env.local')

if (!fs.existsSync(examplePath)) {
  console.warn('⚠️  No .env.example file found. Skipping environment validation.')
  process.exit(0)
}

function parseEnvKeys(filePath) {
  if (!fs.existsSync(filePath)) return new Set()
  const content = fs.readFileSync(filePath, 'utf-8')
  const keys = new Set()
  const lines = content.split('\n')
  for (let line of lines) {
    line = line.trim()
    if (line.startsWith('#') || !line) continue
    const match = line.match(/^([^=]+)=/)
    if (match) {
      keys.add(match[1].trim())
    }
  }
  return keys
}

const exampleKeys = parseEnvKeys(examplePath)
const localKeys = parseEnvKeys(localPath)

// Also check process.env in case they are injected via shell/ci
const missingKeys = []
for (const key of exampleKeys) {
  if (!localKeys.has(key) && !process.env[key]) {
    missingKeys.push(key)
  }
}

if (missingKeys.length > 0) {
  console.error('❌ Missing environment variables in .env.local:')
  missingKeys.forEach((key) => console.error(`   - ${key}`))
  console.error('\nPlease update your local environment file before committing.')
  process.exit(1)
}

console.log('✅ Environment template validation passed.')
process.exit(0)
