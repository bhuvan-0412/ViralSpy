export async function POST(request: Request) {
  const { key, provider, baseUrl, model } = 
    await request.json()
  
  try {
    if (provider === 'gemini') {
      const testModel = model || 'gemini-2.0-flash'
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${testModel}:generateContent?key=${key}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: 'hi' }] }]
          })
        }
      )
      if (res.status === 429) return Response.json({ 
        valid: true, 
        message: 'Key valid (rate limited — will work in app)' 
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error?.message || `${res.status}`)
      }
      return Response.json({ valid: true, 
        message: 'Gemini key valid ✓' })
    }
    
    // OpenAI-compatible test
    const url = `${baseUrl || 'https://api.openai.com/v1'}/models`
    const res = await fetch(url, {
      headers: { 'Authorization': `Bearer ${key}` },
      signal: AbortSignal.timeout(5000)
    })
    if (!res.ok) throw new Error(`${res.status} Unauthorized`)
    return Response.json({ valid: true, 
      message: 'API key valid ✓' })
      
  } catch (e: any) {
    return Response.json({ valid: false, 
      message: e.message })
  }
}
