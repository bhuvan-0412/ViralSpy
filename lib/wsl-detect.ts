import fs from 'fs'

function getWslHostIp(): string | null {
  try {
    // Check if we are actually running inside WSL
    if (fs.existsSync('/proc/version')) {
      const version = fs.readFileSync('/proc/version', 'utf8')
      if (version.toLowerCase().includes('microsoft') || version.toLowerCase().includes('wsl')) {
        if (fs.existsSync('/etc/resolv.conf')) {
          const resolv = fs.readFileSync('/etc/resolv.conf', 'utf8')
          const match = resolv.match(/nameserver\s+([^\s#]+)/)
          if (match && match[1]) {
            return match[1]
          }
        }
      }
    }
  } catch {}
  return null
}

export function getOllamaUrl(requestedUrl: string): string {
  // If user specified a non-localhost URL, use it directly
  if (requestedUrl && !requestedUrl.includes('localhost') && !requestedUrl.includes('127.0.0.1')) {
    return requestedUrl
  }

  const wslIp = getWslHostIp()
  if (wslIp) {
    return `http://${wslIp}:11434`
  }

  return requestedUrl || 'http://localhost:11434'
}
