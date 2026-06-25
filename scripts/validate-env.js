const fs = require('fs')
const path = require('path')

console.log('🔍 Validating environment variables...')

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

const isCI = process.env.CI === 'true' || process.env.CI === '1'

// Define categories
const REQUIRED_FOR_BUILD = ['NEXT_PUBLIC_SUPABASE_URL', 'NEXT_PUBLIC_SUPABASE_ANON_KEY']

const REQUIRED_FOR_TESTS = []

const OPTIONAL_RUNTIME = [
  'SUPABASE_SERVICE_ROLE_KEY',
  'GEMINI_API_KEY',
  'GROQ_API_KEY',
  'YOUTUBE_API_KEY',
  'RAPIDAPI_INSTAGRAM_KEY',
  'VERCEL_OIDC_TOKEN',
]

if (isCI) {
  console.log('Detected running in GitLab CI/CD environment.')

  // Check required for build variables in process.env
  const missingBuild = REQUIRED_FOR_BUILD.filter((key) => !process.env[key])
  // Check required for test variables in process.env
  const missingTests = REQUIRED_FOR_TESTS.filter((key) => !process.env[key])

  const missingOptional = OPTIONAL_RUNTIME.filter((key) => !process.env[key])

  if (missingOptional.length > 0) {
    console.log('⚠️  Optional runtime variables missing from GitLab CI Variables:')
    missingOptional.forEach((key) => console.log(`   - ${key} (Optional runtime variable)`))
    console.log(
      'These are not required for builds or tests, but must be configured on deployment targets (e.g. Vercel).'
    )
  }

  let failed = false

  if (missingBuild.length > 0) {
    console.error('❌ Error: Missing environment variables required for Build:')
    missingBuild.forEach((key) => console.error(`   - ${key}`))
    failed = true
  }

  if (missingTests.length > 0) {
    console.error('❌ Error: Missing environment variables required for Tests:')
    missingTests.forEach((key) => console.error(`   - ${key}`))
    failed = true
  }

  if (failed) {
    console.error(
      '\nPlease configure the missing required variables in GitLab CI/CD Settings > CI/CD Variables.'
    )
    process.exit(1)
  }

  console.log('✅ GitLab CI environment variable validation passed.')
  process.exit(0)
} else {
  // Local Development
  console.log('Validating local development environment...')
  const localKeys = parseEnvKeys(localPath)

  const missingKeys = []
  for (const key of exampleKeys) {
    if (!localKeys.has(key) && !process.env[key]) {
      missingKeys.push(key)
    }
  }

  if (missingKeys.length > 0) {
    console.error('❌ Missing environment variables in your local environment:')
    missingKeys.forEach((key) => console.error(`   - ${key}`))
    console.error(
      '\nPlease update your local .env.local file with these keys before running the application.'
    )
    process.exit(1)
  }

  console.log('✅ Local environment variable validation passed.')
  process.exit(0)
}
