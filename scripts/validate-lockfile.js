const { execSync } = require('child_process')

console.log('🔍 Checking if lockfile is synchronized with package.json...')

try {
  const stagedFiles = execSync('git diff --cached --name-only', { encoding: 'utf8' })
    .split('\n')
    .map((f) => f.trim())

  const hasPackageJson = stagedFiles.includes('package.json')
  const hasLockfile = stagedFiles.includes('package-lock.json')

  if (hasPackageJson && !hasLockfile) {
    console.error(
      '❌ Error: package.json has been modified and staged, but package-lock.json has not!'
    )
    console.error(
      'Please run "npm install" to update the lockfile, and stage it before committing.'
    )
    process.exit(1)
  }

  console.log('✅ Lockfile synchronization check passed.')
  process.exit(0)
} catch (err) {
  console.warn('⚠️ Warning: Could not run git command. Skipping lockfile check.', err.message)
  process.exit(0)
}
