'use client';

import React, { useState } from 'react';
import { useAIProvider } from '../hooks/useAIProvider';
import { Check } from 'lucide-react';
import ProviderSetupGuide, { GuideProvider } from './ProviderSetupGuide';

export default function AIProviderBadge() {
  const { config, saveConfig } = useAIProvider();
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const handleModalComplete = (newConfig: any) => {
    saveConfig(newConfig);

    // Dispatch local storage update event for other listeners
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('storage'));
      window.dispatchEvent(new Event('viralspy_ai_config_updated'));
    }

    const labels: Record<string, string> = {
      gemini: 'Gemini',
      openai: 'GPT-4o',
      ollama: 'Local AI',
      byok: 'BYOK Key'
    };

    setToast(`Updated ${labels[newConfig.provider]}`);
    setIsGuideOpen(false);

    // Reload page to re-initialize client clients
    setTimeout(() => {
      setToast(null);
      window.location.reload();
    }, 1200);
  };

  const getPillLabel = () => {
    switch (config.provider) {
      case 'openai':
        return <span className="text-gray-900 font-bold flex items-center gap-1">🤖 GPT-4o</span>;
      case 'ollama':
        return <span className="text-green-655 font-bold flex items-center gap-1">🦙 Local</span>;
      case 'byok':
        return <span className="text-amber-600 font-bold flex items-center gap-1">🔑 My Key</span>;
      case 'gemini':
      default:
        return (
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-emerald-500 font-bold flex items-center gap-1">
            🤖 Gemini
          </span>
        );
    }
  };

  const getGuideProviderMapping = (): GuideProvider => {
    if (config.provider === 'openai') return 'openai';
    if (config.provider === 'ollama') return 'ollama';
    if (config.provider === 'byok') return 'byok';
    return 'gemini';
  };

  return (
    <div className="relative inline-block">
      {/* Active provider pill */}
      <button
        onClick={() => setIsGuideOpen(true)}
        className="bg-gray-100 hover:bg-gray-200 rounded-full px-3.5 py-1 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer border border-gray-150 focus:outline-none focus:ring-1 focus:ring-[#FF6B4A]"
      >
        {getPillLabel()}
      </button>

      {/* Provider Setup Guide Modal */}
      <ProviderSetupGuide
        provider={getGuideProviderMapping()}
        isOpen={isGuideOpen}
        onClose={() => setIsGuideOpen(false)}
        onComplete={handleModalComplete}
        initialConfig={{
          byokKey: config.byokKey,
          byokProvider: config.byokProvider,
          openaiKey: config.provider === 'openai' ? config.byokKey : undefined, // OpenAI falls back to byokKey in hooks
          ollamaUrl: config.ollamaUrl,
          ollamaModel: config.ollamaModel
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
  );
}
