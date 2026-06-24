const { execSync } = require('child_process')
const fs = require('fs')

const MAX_SIZE_MB = 10
const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024

console.log(`🔍 Checking staged files for size (limit: ${MAX_SIZE_MB}MB)...`)

try {
  const stagedFiles = execSync('git diff --cached --name-only --diff-filter=d', {
    encoding: 'utf8',
  })
    .split('\n')
    .map((f) => f.trim())
    .filter(Boolean)

  let tooLarge = false
  for (const file of stagedFiles) {
    if (!fs.existsSync(file)) continue
    const stats = fs.statSync(file)
    if (stats.size > MAX_SIZE_BYTES) {
      console.error(
        `❌ Error: File "${file}" exceeds the ${MAX_SIZE_MB}MB limit (${(
          stats.size /
          1024 /
          1024
        ).toFixed(2)}MB).`
      )
      tooLarge = true
    }
  }

  if (tooLarge) {
    console.error(
      '\nCommits with large files are blocked to maintain repository hygiene. Please use Git LFS or remove the large file.'
    )
    process.exit(1)
  }

  console.log('✅ Large file checks passed.')
  process.exit(0)
} catch (err) {
  console.warn('⚠️ Warning: Could not run git command. Skipping large file check.', err.message)
  process.exit(0)
}
