import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { key, provider } = await request.json();

    if (!key) {
      return NextResponse.json({ valid: false, message: 'API key is required' }, { status: 400 });
    }
    
    if (provider === 'gemini') {
      try {
        const { GoogleGenerativeAI } = await import('@google/generative-ai');
        const genAI = new GoogleGenerativeAI(key);
        const model = genAI.getGenerativeModel({ 
          model: 'gemini-1.5-flash' 
        });
        await model.generateContent('test');
        return NextResponse.json({ valid: true, message: 'Gemini key valid' });
      } catch (e: any) {
        return NextResponse.json({ valid: false, message: e.message || 'Invalid Gemini key' });
      }
    }
    
    if (provider === 'openai') {
      try {
        const res = await fetch('https://api.openai.com/v1/models', {
          headers: { 'Authorization': `Bearer ${key}` },
          signal: AbortSignal.timeout(6000)
        });
        if (res.ok) {
          return NextResponse.json({ valid: true, message: 'OpenAI key valid' });
        }
        return NextResponse.json({ valid: false, message: 'Invalid OpenAI key' });
      } catch (e: any) {
        return NextResponse.json({ valid: false, message: e.message || 'Failed to connect to OpenAI' });
      }
    }
    
    return NextResponse.json({ valid: false, message: 'Unknown provider' }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ valid: false, message: err.message || 'Internal server error' }, { status: 500 });
  }
}
