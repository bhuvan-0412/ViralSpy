'use client'
import { useState, useEffect } from 'react'

export type AIProvider = 'ollama' | 'byok'
export type BYOKProvider = 'gemini' | 'openai' | 'custom'

interface AIConfig {
  provider: AIProvider
  byokProvider: BYOKProvider
  byokKey: string
  byokBaseUrl: string
  byokModel: string
  ollamaUrl: string
  ollamaModel: string
}

const DEFAULT_CONFIG: AIConfig = {
  provider: 'ollama',
  byokProvider: 'openai',
  byokKey: '',
  byokBaseUrl: 'https://api.openai.com/v1',
  byokModel: '',
  ollamaUrl: 'http://localhost:11434',
  ollamaModel: 'llama3'
}

export function useAIProvider() {
  const [config, setConfig] = useState<AIConfig>(DEFAULT_CONFIG)

  useEffect(() => {
    const stored = localStorage.getItem('viralspy_ai_config')
    if (stored) {
      try { setConfig(JSON.parse(stored)) } catch {}
    }
  }, [])

  const saveConfig = (newConfig: AIConfig) => {
    setConfig(newConfig)
    localStorage.setItem('viralspy_ai_config', 
      JSON.stringify(newConfig))
  }

  const getHeaders = (): Record<string, string> => ({
    'x-ai-provider': config.provider,
    'x-byok-provider': config.byokProvider,
    'x-byok-key': config.byokKey,
    'x-byok-base-url': config.byokBaseUrl,
    'x-byok-model': config.byokModel,
    'x-ollama-url': config.ollamaUrl,
    'x-ollama-model': config.ollamaModel,
  })

  return { config, saveConfig, getHeaders }
}

export async function detectOllamaUrl(): Promise<string> {
  const urlsToTry = [
    'http://localhost:11434',
    'http://127.0.0.1:11434',
    'http://172.29.130.173:11434', // WSL common range
    'http://172.17.0.1:11434',
  ]
  
  for (const url of urlsToTry) {
    try {
      const res = await fetch(`/api/ollama-test?url=${url}`, {
        signal: AbortSignal.timeout(2000)
      })
      const data = await res.json()
      if (data.connected) return url
    } catch {}
  }
  return 'http://localhost:11434'
}
