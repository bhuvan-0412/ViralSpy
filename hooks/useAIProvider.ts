'use client'
import { useState, useEffect } from 'react'

export type AIProvider = 'gemini' | 'openai' | 'ollama' | 'byok'

interface AIConfig {
  provider: AIProvider
  byokKey: string
  byokProvider: 'gemini' | 'openai'
  ollamaUrl: string
  ollamaModel: string
}

const DEFAULT_CONFIG: AIConfig = {
  provider: 'gemini',
  byokKey: '',
  byokProvider: 'gemini',
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
    'x-byok-key': config.byokKey,
    'x-byok-provider': config.byokProvider,
    'x-ollama-url': config.ollamaUrl,
    'x-ollama-model': config.ollamaModel
  })

  return { config, saveConfig, getHeaders }
}
