export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  let url = searchParams.get('url') || 'http://localhost:11434'
  const model = searchParams.get('model') || 'llama3'
  
  // Remove trailing slash
  url = url.replace(/\/$/, '')
  
  try {
    const res = await fetch(`${url}/api/tags`, {
      signal: AbortSignal.timeout(5000),
      headers: { 'Content-Type': 'application/json' }
    })
    
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    
    const data = await res.json()
    const models = data.models?.map((m: any) => m.name) || []
    const hasModel = models.some((m: string) => 
      m.startsWith(model.split(':')[0]))
    
    return Response.json({
      connected: true,
      models,
      hasModel,
      message: hasModel 
        ? `Connected — ${model} ready` 
        : `Connected but ${model} not found. Run: ollama pull ${model}`
    })
  } catch (e: any) {
    return Response.json({
      connected: false,
      message: `Ollama not running. Start with: ollama serve`,
      error: e.message
    })
  }
}
