import { getOllamaUrl } from '../../../lib/wsl-detect';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const requestedUrl = searchParams.get('url') || 'http://localhost:11434'
  const url = getOllamaUrl(requestedUrl)
  const model = searchParams.get('model') || 'llama3'
  
  try {
    const res = await fetch(`${url}/api/tags`, {
      signal: AbortSignal.timeout(3000)
    })
    if (!res.ok) throw new Error('Not running')
    const data = await res.json()
    const models = data.models?.map((m: any) => m.name) || []
    const hasModel = models.some((m: string) => 
      m.startsWith(model))
    
    return Response.json({
      connected: true,
      models,
      hasModel,
      message: hasModel 
        ? `${model} ready` 
        : `Connected but ${model} not pulled. Run: ollama pull ${model}`
    })
  } catch (e: any) {
    return Response.json({
      connected: false,
      message: 'Ollama not running. Start with: ollama serve'
    })
  }
}
