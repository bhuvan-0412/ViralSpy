'use client'
import { useRouter } from 'next/navigation'
import { useLocale } from 'next-intl'

export type GuideProvider = 'ollama' | 'byok';

interface Props {
  provider: 'ollama' | 'byok'
  isOpen: boolean
  onClose: () => void
  onComplete: (config: object) => void
  initialConfig?: object
}

export default function ProviderSetupGuide({ 
  isOpen, 
  onClose,
  provider
}: Props) {
  const router = useRouter()
  const locale = useLocale()
  
  if (!isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 z-[9990]"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="fixed inset-0 z-[9991] flex items-center 
        justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl 
          max-w-md w-full p-6 space-y-4">
          
          {/* Header */}
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-[#1A1A1A]">
              {provider === 'ollama' 
                ? '🦙 Set up Local AI' 
                : '🔑 Set up API Key'}
            </h2>
            <button
              type="button"
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 
                text-xl font-bold w-8 h-8 flex items-center 
                justify-center rounded-lg hover:bg-gray-100"
            >
              ✕
            </button>
          </div>

          {provider === 'ollama' ? (
            <div className="space-y-3 text-sm text-gray-600">
              <p>Follow these steps to set up Ollama:</p>
              <ol className="list-decimal pl-4 space-y-2">
                <li>Download Ollama from{' '}
                  <a href="https://ollama.com" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-[#FF6B4A] underline">
                    ollama.com
                  </a>
                </li>
                <li>Run in terminal:
                  <code className="block bg-gray-900 text-green-400 
                    px-3 py-2 rounded-lg font-mono text-xs mt-1">
                    ollama serve
                  </code>
                </li>
                <li>Pull a model:
                  <code className="block bg-gray-900 text-green-400 
                    px-3 py-2 rounded-lg font-mono text-xs mt-1">
                    ollama pull llama3
                  </code>
                </li>
                <li>For Windows WSL users, run:
                  <code className="block bg-gray-900 text-green-400 
                    px-3 py-2 rounded-lg font-mono text-xs mt-1">
                    OLLAMA_HOST=0.0.0.0:11434 ollama serve
                  </code>
                  Then get your IP:
                  <code className="block bg-gray-900 text-green-400 
                    px-3 py-2 rounded-lg font-mono text-xs mt-1">
                    hostname -I
                  </code>
                </li>
              </ol>
            </div>
          ) : (
            <div className="space-y-3 text-sm text-gray-600">
              <p>Get a free API key from one of these providers:</p>
              <div className="space-y-2">
                <a href="https://console.groq.com/keys"
                  target="_blank"
                  rel="noopener noreferrer" 
                  className="flex items-center justify-between 
                    p-3 border border-gray-200 rounded-xl 
                    hover:border-[#FF6B4A] transition-colors">
                  <span className="font-semibold">⚡ Groq</span>
                  <span className="text-xs bg-green-100 
                    text-green-700 px-2 py-0.5 rounded-full 
                    font-bold">FREE</span>
                </a>
                <a href="https://aistudio.google.com/app/apikey"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between 
                    p-3 border border-gray-200 rounded-xl 
                    hover:border-[#FF6B4A] transition-colors">
                  <span className="font-semibold">G Gemini</span>
                  <span className="text-xs bg-green-100 
                    text-green-700 px-2 py-0.5 rounded-full 
                    font-bold">FREE</span>
                </a>
                <a href="https://platform.openai.com/api-keys"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between 
                    p-3 border border-gray-200 rounded-xl 
                    hover:border-[#FF6B4A] transition-colors">
                  <span className="font-semibold">OpenAI</span>
                  <span className="text-xs bg-blue-100 
                    text-blue-700 px-2 py-0.5 rounded-full 
                    font-bold">PAID</span>
                </a>
              </div>
            </div>
          )}

          {/* Footer buttons */}
          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 border border-gray-200 
                rounded-xl text-sm font-semibold text-gray-600
                hover:bg-gray-50 transition-colors"
            >
              Close
            </button>
            <button
              type="button"
              onClick={() => {
                onClose()
                router.push(locale === 'en' ? '/setup' : `/${locale}/setup`)
              }}
              className="flex-1 px-4 py-2.5 bg-[#FF6B4A] 
                text-white rounded-xl text-sm font-semibold
                hover:bg-[#e55a3a] transition-colors"
            >
              Full Guide →
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
