export function validateEnv() {
  const required = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'SUPABASE_SERVICE_ROLE_KEY',
  ]
  
  const missing = required.filter(key => !process.env[key])
  
  if (missing.length > 0) {
    console.error(
      `Missing environment variables: ${missing.join(', ')}\n` +
      'Add them to .env.local for local development\n' +
      'or to Vercel Environment Variables for production.'
    )
  }
  
  return missing.length === 0
}
