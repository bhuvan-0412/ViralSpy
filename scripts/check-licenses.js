const fs = require('fs')
const path = require('path')

const WHITELIST = new Set([
  'MIT',
  'ISC',
  'Apache-2.0',
  'BSD-3-Clause',
  'BSD-2-Clause',
  'CC0-1.0',
  'Unlicense',
  '0BSD',
  'WTFPL',
  'Public Domain',
])

console.log('🔍 Checking production dependency licenses for compliance...')

const rootPackageJson = require('../package.json')
const prodDeps = Object.keys(rootPackageJson.dependencies || {})

let failed = false

for (const dep of prodDeps) {
  try {
    const depDir = path.join(__dirname, '..', 'node_modules', dep)
    const depPackageJsonPath = path.join(depDir, 'package.json')

    if (!fs.existsSync(depPackageJsonPath)) {
      console.warn(`⚠️  Could not find package.json for "${dep}".`)
      continue
    }

    const depJson = JSON.parse(fs.readFileSync(depPackageJsonPath, 'utf8'))

    let license = depJson.license
    if (!license && depJson.licenses) {
      if (Array.isArray(depJson.licenses)) {
        license = depJson.licenses.map((l) => (typeof l === 'string' ? l : l.type)).join(', ')
      } else if (typeof depJson.licenses === 'object') {
        license = depJson.licenses.type
      }
    }

    if (typeof license === 'object') {
      license = license.type
    }

    if (!license) {
      console.warn(`⚠️  Warning: Dependency "${dep}" does not specify a license.`)
      continue
    }

    // Check if the license matches any allowed license in whitelist
    const isWhitelisted = Array.from(WHITELIST).some((allowed) =>
      license.toLowerCase().includes(allowed.toLowerCase())
    )

    if (!isWhitelisted) {
      console.error(`❌ Non-compliant license found for "${dep}": ${license}`)
      failed = true
    } else {
      console.log(`   - ${dep}: ${license} (Compliant)`)
    }
  } catch (err) {
    console.warn(`⚠️  Could not resolve license for "${dep}". Error: ${err.message}`)
  }
}

if (failed) {
  console.error(
    '\n❌ License compliance check failed. Unapproved copyleft/non-compliant license detected in production dependencies!'
  )
  process.exit(1)
}

console.log('✅ License compliance checks passed.')
process.exit(0)
