'use client'

import React, { useState } from 'react'
import { useAIProvider } from '../hooks/useAIProvider'
import { Check } from 'lucide-react'
import { useLocale } from 'next-intl'
import ProviderSetupGuide, { GuideProvider } from './ProviderSetupGuide'

export default function AIProviderBadge() {
  const locale = useLocale()
  const { config, saveConfig } = useAIProvider()
  const [isGuideOpen, setIsGuideOpen] = useState(false)
  const [toast, setToast] = useState<string | null>(null)

  const handleModalComplete = (newConfig: any) => {
    saveConfig(newConfig)

    // Dispatch local storage update event for other listeners
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('storage'))
      window.dispatchEvent(new Event('viralspy_ai_config_updated'))
    }

    const labels: Record<string, string> = {
      ollama: 'Local AI',
      byok:
        newConfig.byokProvider === 'gemini'
          ? 'Gemini'
          : newConfig.byokProvider === 'custom'
            ? 'Custom API'
            : newConfig.byokModel === 'llama-3.3-70b-versatile'
              ? 'Groq'
              : 'GPT-4o',
    }

    setToast(`Updated to ${labels[newConfig.provider] || 'Local AI'}`)
    setIsGuideOpen(false)

    // Reload page to re-initialize client clients
    setTimeout(() => {
      setToast(null)
      window.location.reload()
    }, 1200)
  }

  const getPillLabel = () => {
    if (config.provider === 'ollama') {
      return <span className="text-green-655 font-bold flex items-center gap-1">🦙 Local AI</span>
    }

    // BYOK cases
    const modelName = config.byokModel
    if (config.byokProvider === 'gemini') {
      return <span className="text-blue-500 font-bold flex items-center gap-1">🔑 Gemini</span>
    }
    if (config.byokProvider === 'custom') {
      return <span className="text-gray-500 font-bold flex items-center gap-1">🔑 Custom API</span>
    }
    if (modelName === 'llama-3.3-70b-versatile') {
      return <span className="text-purple-650 font-bold flex items-center gap-1">🔑 Groq</span>
    }
    if (modelName === 'gpt-4o') {
      return <span className="text-gray-900 font-bold flex items-center gap-1">🔑 GPT-4o</span>
    }
    return <span className="text-amber-600 font-bold flex items-center gap-1">🔑 My Key</span>
  }

  const getGuideProviderMapping = (): GuideProvider => {
    return config.provider === 'ollama' ? 'ollama' : 'byok'
  }

  const getLocalizedSettingsPath = () => {
    return locale === 'en' ? '/settings#ai-provider' : `/${locale}/settings#ai-provider`
  }

  return (
    <div className="relative inline-block">
      {/* Active provider pill */}
      <a
        href={getLocalizedSettingsPath()}
        className="bg-gray-100 hover:bg-gray-200 rounded-full px-3.5 py-1 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer border border-gray-150 focus:outline-none focus:ring-1 focus:ring-[#FF6B4A]"
      >
        {getPillLabel()}
      </a>

      {/* Provider Setup Guide Modal */}
      <ProviderSetupGuide
        provider={getGuideProviderMapping()}
        isOpen={isGuideOpen}
        onClose={() => setIsGuideOpen(false)}
        onComplete={handleModalComplete}
        initialConfig={{
          byokKey: config.byokKey,
          byokProvider: config.byokProvider,
          byokBaseUrl: config.byokBaseUrl,
          byokModel: config.byokModel,
          ollamaUrl: config.ollamaUrl,
          ollamaModel: config.ollamaModel,
        }}
      />

      {/* Switch Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-[9999] bg-[#1A1A1A] text-white text-xs font-semibold px-4.5 py-3 rounded-2xl shadow-xl flex items-center space-x-2 animate-fade-up">
          <Check className="h-4 w-4 text-green-400" />
          <span>{toast}</span>
        </div>
      )}
    </div>
  )
}
