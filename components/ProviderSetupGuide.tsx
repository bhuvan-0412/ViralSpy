'use client';

import React, { useState, useEffect } from 'react';
import { 
  X, 
  Check, 
  Copy, 
  Laptop, 
  Key, 
  Cpu, 
  Info, 
  ExternalLink, 
  RefreshCw, 
  Eye, 
  EyeOff, 
  AlertTriangle 
} from 'lucide-react';

export type GuideProvider = 'gemini' | 'openai' | 'ollama' | 'byok';

interface ProviderSetupGuideProps {
  provider: GuideProvider;
  isOpen: boolean;
  onClose: () => void;
  onComplete: (config: {
    provider: GuideProvider;
    byokKey?: string;
    byokProvider?: 'gemini' | 'openai';
    openaiKey?: string;
    ollamaUrl?: string;
    ollamaModel?: string;
  }) => void;
  initialConfig?: {
    byokKey?: string;
    byokProvider?: 'gemini' | 'openai';
    openaiKey?: string;
    ollamaUrl?: string;
    ollamaModel?: string;
  };
}

const MODELS = [
  {
    id: 'llama3',
    name: 'Llama 3 (8B)',
    recommended: true,
    size: '4.7 GB',
    speed: '⚡ Fast',
    quality: '★★★★☆',
    command: 'ollama pull llama3'
  },
  {
    id: 'mistral',
    name: 'Mistral (7B)',
    size: '4.1 GB',
    speed: '⚡ Fast',
    quality: '★★★★☆',
    command: 'ollama pull mistral'
  },
  {
    id: 'gemma3',
    name: 'Gemma 3 (4B)',
    size: '2.5 GB',
    speed: '⚡⚡ Very Fast',
    quality: '★★★☆☆',
    command: 'ollama pull gemma3'
  },
  {
    id: 'llama3:70b',
    name: 'Llama 3 (70B)',
    bestQuality: true,
    size: '40 GB',
    speed: '🐢 Slow',
    quality: '★★★★★',
    command: 'ollama pull llama3:70b'
  }
];

export default function ProviderSetupGuide({
  provider,
  isOpen,
  onClose,
  onComplete,
  initialConfig
}: ProviderSetupGuideProps) {
  // Tabs
  const [activeTab, setActiveTab] = useState<'guide' | 'test' | 'requirements'>('guide');

  // Input States
  const [ollamaUrl, setOllamaUrl] = useState(initialConfig?.ollamaUrl || 'http://localhost:11434');
  const [selectedModel, setSelectedModel] = useState('llama3');
  const [openaiKey, setOpenaiKey] = useState(initialConfig?.openaiKey || '');
  const [byokProvider, setByokProvider] = useState<'gemini' | 'openai'>(initialConfig?.byokProvider || 'gemini');
  const [byokKey, setByokKey] = useState(initialConfig?.byokKey || '');

  // UI States
  const [showKey, setShowKey] = useState(false);
  const [copiedText, setCopiedText] = useState<string | null>(null);
  
  // Test states
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{
    success: boolean;
    message: string;
    troubleshoot?: string[];
  } | null>(null);

  // Set default tab when provider changes
  useEffect(() => {
    setActiveTab('guide');
    setTestResult(null);
    if (provider === 'openai') {
      setByokProvider('openai');
    } else if (provider === 'byok') {
      setByokProvider(initialConfig?.byokProvider || 'gemini');
    }
  }, [provider, initialConfig]);

  if (!isOpen) return null;

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(id);
    setTimeout(() => setCopiedText(null), 2000);
  };

  // Run Test Connection
  const handleTestConnection = async () => {
    setTesting(true);
    setTestResult(null);

    if (provider === 'ollama') {
      try {
        const res = await fetch(`/api/ollama-test?url=${encodeURIComponent(ollamaUrl)}&model=${selectedModel}`);
        const data = await res.json();
        if (data.connected) {
          setTestResult({
            success: true,
            message: `✓ Connected — ${selectedModel} is ready`
          });
        } else {
          setTestResult({
            success: false,
            message: `✗ ${data.message || 'Failed to connect to Ollama'}`,
            troubleshoot: [
              'Make sure "ollama serve" is running in your terminal.',
              'Check if your local firewall is blocking port 11434.',
              'Verify in terminal: run "curl http://localhost:11434/api/tags" to see if the server responds.'
            ]
          });
        }
      } catch (err: any) {
        setTestResult({
          success: false,
          message: '✗ Network error connecting to Ollama',
          troubleshoot: [
            'Make sure Ollama is installed and running locally.',
            'Confirm the URL is set to http://localhost:11434.'
          ]
        });
      } finally {
        setTesting(false);
      }
    } else {
      // BYOK / OpenAI key testing
      const testKey = provider === 'openai' ? openaiKey : byokKey;
      const testProv = provider === 'openai' ? 'openai' : byokProvider;

      if (!testKey) {
        setTestResult({
          success: false,
          message: '✗ Please enter an API key to test.'
        });
        setTesting(false);
        return;
      }

      try {
        const res = await fetch('/api/test-key', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ key: testKey, provider: testProv })
        });
        const data = await res.json();
        if (data.valid) {
          setTestResult({
            success: true,
            message: `✓ Valid key — ${testProv === 'gemini' ? 'Gemini Flash' : 'GPT-4o'} ready`
          });
        } else {
          setTestResult({
            success: false,
            message: `✗ Invalid key — check your credentials and try again. (${data.message || 'verification failed'})`
          });
        }
      } catch (err: any) {
        setTestResult({
          success: false,
          message: '✗ Failed to verify key. Please check your internet connection.'
        });
      } finally {
        setTesting(false);
      }
    }
  };

  const handleDone = () => {
    if (provider === 'gemini') {
      onComplete({ provider: 'gemini' });
    } else if (provider === 'openai') {
      onComplete({
        provider: 'openai',
        openaiKey
      });
    } else if (provider === 'ollama') {
      onComplete({
        provider: 'ollama',
        ollamaUrl,
        ollamaModel: selectedModel
      });
    } else if (provider === 'byok') {
      onComplete({
        provider: 'byok',
        byokProvider,
        byokKey
      });
    }
    onClose();
  };

  const renderIcon = () => {
    switch (provider) {
      case 'openai':
        return <span className="h-6 w-6 rounded-full bg-gray-900 flex items-center justify-center text-xs text-white font-bold">O</span>;
      case 'ollama':
        return <span className="text-xl">🦙</span>;
      case 'byok':
        return <Key className="h-5 w-5 text-amber-500" />;
      case 'gemini':
      default:
        return <span className="h-6 w-6 rounded-full bg-gradient-to-br from-blue-400 to-green-400 flex items-center justify-center text-xs text-white font-bold">G</span>;
    }
  };

  const getTitle = () => {
    switch (provider) {
      case 'openai':
        return 'Set up OpenAI GPT-4o';
      case 'ollama':
        return 'Set up Local AI with Ollama';
      case 'byok':
        return 'Use Your Own API Key';
      case 'gemini':
      default:
        return 'Using Gemini (Default)';
    }
  };

  const getSubtitle = () => {
    switch (provider) {
      case 'openai':
        return 'Premium strategic content briefs with GPT-4o';
      case 'ollama':
        return 'Free, private, runs on your machine';
      case 'byok':
        return 'Full control. Your billing. Your usage.';
      case 'gemini':
      default:
        return 'Uses ViralSpy\'s API key — no setup needed';
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-fade-in">
      <div className="bg-white max-w-lg w-full rounded-2xl shadow-xl flex flex-col max-h-[90vh] overflow-hidden border border-gray-100 animate-scale-up">
        {/* Header */}
        <div className="p-5 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gray-50 rounded-xl">
              {renderIcon()}
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-900 leading-tight">{getTitle()}</h2>
              <p className="text-xs text-gray-500 leading-normal">{getSubtitle()}</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 hover:bg-gray-100 text-gray-400 hover:text-gray-650 rounded-lg transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Tab Headers */}
        {provider !== 'gemini' && (
          <div className="flex bg-gray-50/50 border-b border-gray-100 px-5">
            <button
              onClick={() => setActiveTab('guide')}
              className={`py-3 px-4 text-xs font-bold transition-all border-b-2 -mb-[1px] ${
                activeTab === 'guide'
                  ? 'border-[#FF6B4A] text-[#FF6B4A]'
                  : 'border-transparent text-gray-500 hover:text-gray-800'
              }`}
            >
              Setup Guide
            </button>
            <button
              onClick={() => setActiveTab('test')}
              className={`py-3 px-4 text-xs font-bold transition-all border-b-2 -mb-[1px] ${
                activeTab === 'test'
                  ? 'border-[#FF6B4A] text-[#FF6B4A]'
                  : 'border-transparent text-gray-500 hover:text-gray-800'
              }`}
            >
              Test Connection
            </button>
            {provider === 'ollama' && (
              <button
                onClick={() => setActiveTab('requirements')}
                className={`py-3 px-4 text-xs font-bold transition-all border-b-2 -mb-[1px] ${
                  activeTab === 'requirements'
                    ? 'border-[#FF6B4A] text-[#FF6B4A]'
                    : 'border-transparent text-gray-500 hover:text-gray-800'
                }`}
              >
                System Requirements
              </button>
            )}
          </div>
        )}

        {/* Modal Scrollable Body */}
        <div className="flex-grow p-5 overflow-y-auto max-h-[50vh] text-xs text-gray-700 space-y-4">
          
          {/* 1. GEMINI DEFAULT SCREEN */}
          {provider === 'gemini' && (
            <div className="space-y-4">
              <div className="p-4 bg-green-50 border border-green-150 rounded-2xl flex items-start space-x-3">
                <div className="bg-green-500 text-white rounded-full p-1 mt-0.5">
                  <Check className="h-3.5 w-3.5" />
                </div>
                <div>
                  <h4 className="font-bold text-green-800 text-sm">No setup required</h4>
                  <p className="text-green-700 mt-1 leading-relaxed">
                    ViralSpy handles brief generation out of the box using our integrated Gemini API key. There is no config or API cost for standard usage.
                  </p>
                </div>
              </div>

              <div className="bg-orange-50/20 border border-orange-100 rounded-2xl p-4 space-y-3">
                <div className="flex items-center space-x-2">
                  <Info className="h-4 w-4 text-[#FF6B4A]" />
                  <span className="font-bold text-gray-800">Usage Note</span>
                </div>
                <p className="leading-relaxed text-gray-600">
                  If you plan to generate large volumes of briefs daily, we highly recommend switching to **BYOK (Bring Your Own Key)** with a free developer key from Google for higher limits.
                </p>
                <a
                  href="https://aistudio.google.com/app/apikey"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center space-x-1 text-xs font-bold text-[#FF6B4A] hover:underline"
                >
                  <span>Get a free Gemini developer key</span>
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            </div>
          )}

          {/* 2. OLLAMA SCREEN */}
          {provider === 'ollama' && activeTab === 'guide' && (
            <div className="space-y-5">
              
              {/* Step 1 */}
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <span className="h-5 w-5 bg-orange-150 text-[#FF6B4A] rounded-full flex items-center justify-center font-bold text-[10px]">1</span>
                  <span className="font-bold text-gray-800 text-sm">Download Ollama</span>
                </div>
                <p className="text-gray-500 text-[11px] leading-relaxed">Download and install the desktop service for your operating system.</p>
                <div className="flex flex-wrap gap-2 pt-1">
                  <a
                    href="https://ollama.ai/download/windows"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="border border-gray-200 hover:border-[#FF6B4A] hover:text-[#FF6B4A] rounded-xl px-3 py-2 flex items-center gap-1.5 font-bold transition-all text-[11px]"
                  >
                    <span>⊞ Windows</span>
                  </a>
                  <a
                    href="https://ollama.ai/download/mac"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="border border-gray-200 hover:border-[#FF6B4A] hover:text-[#FF6B4A] rounded-xl px-3 py-2 flex items-center gap-1.5 font-bold transition-all text-[11px]"
                  >
                    <span>🍎 macOS</span>
                  </a>
                  <a
                    href="https://ollama.ai/download/linux"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="border border-gray-200 hover:border-[#FF6B4A] hover:text-[#FF6B4A] rounded-xl px-3 py-2 flex items-center gap-1.5 font-bold transition-all text-[11px]"
                  >
                    <span>🐧 Linux</span>
                  </a>
                </div>
              </div>

              {/* Step 2 */}
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <span className="h-5 w-5 bg-orange-150 text-[#FF6B4A] rounded-full flex items-center justify-center font-bold text-[10px]">2</span>
                  <span className="font-bold text-gray-800 text-sm">Start Ollama Service</span>
                </div>
                <p className="text-gray-500 text-[11px] leading-relaxed">Launch the Ollama application or spin up the host agent in your terminal:</p>
                <div className="bg-gray-50 border border-gray-200 rounded-xl p-3 flex justify-between items-center font-mono text-red-500 text-[11px]">
                  <span>ollama serve</span>
                  <button
                    onClick={() => handleCopy('ollama serve', 'serve')}
                    className="text-gray-400 hover:text-gray-600 transition-colors p-1 bg-white border border-gray-150 rounded-lg"
                  >
                    {copiedText === 'serve' ? <Check className="h-3 w-3 text-green-500" /> : <Copy className="h-3 w-3" />}
                  </button>
                </div>
              </div>

              {/* Step 3 */}
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <span className="h-5 w-5 bg-orange-150 text-[#FF6B4A] rounded-full flex items-center justify-center font-bold text-[10px]">3</span>
                  <span className="font-bold text-gray-800 text-sm">Pull a Model</span>
                </div>
                <p className="text-gray-500 text-[11px] leading-relaxed">Download a model tailored to your computer's resources (click to select):</p>
                
                {/* Horizontal scroll cards */}
                <div className="flex space-x-2.5 overflow-x-auto pb-2.5 pt-1 scrollbar-thin">
                  {MODELS.map((model) => (
                    <button
                      key={model.id}
                      onClick={() => setSelectedModel(model.id)}
                      className={`min-w-[130px] p-3 rounded-xl border text-left flex flex-col justify-between h-28 relative transition-all ${
                        selectedModel === model.id
                          ? 'border-[#FF6B4A] bg-orange-50/10 ring-1 ring-[#FF6B4A]'
                          : 'border-gray-200 hover:border-gray-300 bg-white'
                      }`}
                    >
                      <div>
                        <div className="flex justify-between items-start">
                          <span className="font-bold text-gray-800 text-[11px] leading-tight block">{model.name}</span>
                          {model.recommended && (
                            <span className="bg-orange-100 text-[#FF6B4A] text-[8px] font-extrabold px-1 py-0.25 rounded-md uppercase">Rec</span>
                          )}
                          {model.bestQuality && (
                            <span className="bg-blue-50 text-blue-600 text-[8px] font-extrabold px-1 py-0.25 rounded-md uppercase">Best</span>
                          )}
                        </div>
                        <p className="text-[10px] text-gray-400 mt-1 leading-none">Size: {model.size}</p>
                      </div>
                      <div className="space-y-0.5 text-[9px] text-gray-500 mt-2">
                        <div>Speed: {model.speed}</div>
                        <div>Quality: {model.quality}</div>
                      </div>
                    </button>
                  ))}
                </div>

                {/* Display pull command for chosen model */}
                <div className="bg-gray-50 border border-gray-200 rounded-xl p-3 flex justify-between items-center font-mono text-red-500 text-[11px]">
                  <span>ollama pull {selectedModel}</span>
                  <button
                    onClick={() => handleCopy(`ollama pull ${selectedModel}`, 'pull')}
                    className="text-gray-400 hover:text-gray-600 transition-colors p-1 bg-white border border-gray-150 rounded-lg"
                  >
                    {copiedText === 'pull' ? <Check className="h-3 w-3 text-green-500" /> : <Copy className="h-3 w-3" />}
                  </button>
                </div>
              </div>

              {/* Step 4 */}
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <span className="h-5 w-5 bg-orange-150 text-[#FF6B4A] rounded-full flex items-center justify-center font-bold text-[10px]">4</span>
                  <span className="font-bold text-gray-800 text-sm">Configure ViralSpy</span>
                </div>
                <p className="text-gray-500 text-[11px] leading-relaxed">Provide the local address and verify model name details:</p>
                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Ollama URL</label>
                    <input
                      type="text"
                      value={ollamaUrl}
                      onChange={(e) => setOllamaUrl(e.target.value)}
                      className="w-full text-xs font-semibold px-3 py-2 bg-white rounded-xl border border-gray-200 focus:outline-none focus:border-[#FF6B4A]"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Model</label>
                    <input
                      type="text"
                      value={selectedModel}
                      readOnly
                      className="w-full text-xs font-semibold px-3 py-2 bg-gray-50 rounded-xl border border-gray-200 focus:outline-none text-gray-500 cursor-not-allowed"
                    />
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* OLLAMA REQUIREMENTS TAB */}
          {provider === 'ollama' && activeTab === 'requirements' && (
            <div className="space-y-4">
              <div className="border border-gray-200 rounded-2xl overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.01)] bg-white">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-gray-50 text-gray-550 border-b border-gray-200 font-bold uppercase tracking-wider text-[10px]">
                      <th className="py-2.5 px-4">Model</th>
                      <th className="py-2.5 px-4">RAM Required</th>
                      <th className="py-2.5 px-4">Disk Space</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-150">
                    <tr>
                      <td className="py-2.5 px-4 font-bold text-gray-800">Llama 3 8B</td>
                      <td className="py-2.5 px-4">8 GB</td>
                      <td className="py-2.5 px-4">4.7 GB</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-4 font-bold text-gray-800">Mistral 7B</td>
                      <td className="py-2.5 px-4">8 GB</td>
                      <td className="py-2.5 px-4">4.1 GB</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-4 font-bold text-gray-800">Gemma 3 4B</td>
                      <td className="py-2.5 px-4">4 GB</td>
                      <td className="py-2.5 px-4">2.5 GB</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-4 font-bold text-gray-800">Llama 3 70B</td>
                      <td className="py-2.5 px-4">48 GB</td>
                      <td className="py-2.5 px-4">40 GB</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="bg-orange-50/20 border border-orange-100 rounded-2xl p-4 flex items-start space-x-2.5 text-gray-650 leading-relaxed">
                <Info className="h-4 w-4 text-[#FF6B4A] shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-gray-850">💡 Setup Tip: </span>
                  Llama 3 8B works great for content strategist briefs and runs smoothly on most modern laptops with 8GB of RAM.
                </div>
              </div>
            </div>
          )}

          {/* 3. BYOK / OPENAI SCREEN */}
          {(provider === 'byok' || provider === 'openai') && activeTab === 'guide' && (
            <div className="space-y-5">
              
              {/* If it's BYOK, show provider selector toggle */}
              {provider === 'byok' && (
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">BYOK API Credentials</label>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setByokProvider('gemini')}
                      className={`flex-grow py-2 text-xs font-bold rounded-xl border text-center transition-all ${
                        byokProvider === 'gemini'
                          ? 'border-[#FF6B4A] bg-[#FF6B4A] text-white'
                          : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                      }`}
                    >
                      Gemini Key
                    </button>
                    <button
                      onClick={() => setByokProvider('openai')}
                      className={`flex-grow py-2 text-xs font-bold rounded-xl border text-center transition-all ${
                        byokProvider === 'openai'
                          ? 'border-[#FF6B4A] bg-[#FF6B4A] text-white'
                          : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                      }`}
                    >
                      OpenAI Key
                    </button>
                  </div>
                </div>
              )}

              {/* Render Steps based on chosen provider */}
              {((provider === 'byok' && byokProvider === 'gemini')) && (
                <div className="space-y-4">
                  {/* Step 1 */}
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <span className="h-5 w-5 bg-orange-150 text-[#FF6B4A] rounded-full flex items-center justify-center font-bold text-[10px]">1</span>
                      <span className="font-bold text-gray-800 text-sm">Get a free Gemini API key</span>
                    </div>
                    <p className="text-gray-500 text-[11px] leading-relaxed">Head to Google AI Studio to generate your API key credentials:</p>
                    <a
                      href="https://aistudio.google.com/app/apikey"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center space-x-1.5 px-4 py-2.5 bg-gray-50 hover:bg-gray-100 border border-gray-250 text-gray-700 rounded-xl font-bold transition-all text-xs"
                    >
                      <span>Open Google AI Studio</span>
                      <ExternalLink className="h-3.5 w-3.5 text-gray-500" />
                    </a>
                    <div className="text-[10px] text-gray-450 italic mt-1.5 block">
                      ℹ️ Free tier limit: 15 requests/minute, 1,500 requests/day — plenty for daily briefs.
                    </div>
                  </div>

                  {/* Step 2 */}
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <span className="h-5 w-5 bg-orange-150 text-[#FF6B4A] rounded-full flex items-center justify-center font-bold text-[10px]">2</span>
                      <span className="font-bold text-gray-800 text-sm">Paste your key below</span>
                    </div>
                    <div className="relative pt-1">
                      <input
                        type={showKey ? 'text' : 'password'}
                        value={byokKey}
                        onChange={(e) => setByokKey(e.target.value)}
                        className="w-full text-xs font-semibold pl-3 pr-10 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[#FF6B4A]"
                        placeholder="AIzaSy..."
                      />
                      <button
                        type="button"
                        onClick={() => setShowKey(!showKey)}
                        className="absolute right-3.5 top-3.5 text-gray-400 hover:text-gray-700"
                      >
                        {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {((provider === 'byok' && byokProvider === 'openai') || provider === 'openai') && (
                <div className="space-y-4">
                  {/* Step 1 */}
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <span className="h-5 w-5 bg-orange-150 text-[#FF6B4A] rounded-full flex items-center justify-center font-bold text-[10px]">1</span>
                      <span className="font-bold text-gray-800 text-sm">Get an OpenAI API key</span>
                    </div>
                    <p className="text-gray-500 text-[11px] leading-relaxed">Go to the OpenAI Platform key manager to generate a key:</p>
                    <a
                      href="https://platform.openai.com/api-keys"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center space-x-1.5 px-4 py-2.5 bg-gray-50 hover:bg-gray-100 border border-gray-250 text-gray-700 rounded-xl font-bold transition-all text-xs"
                    >
                      <span>Open OpenAI Platform</span>
                      <ExternalLink className="h-3.5 w-3.5 text-gray-500" />
                    </a>
                    <div className="text-[10px] text-gray-450 italic mt-1.5 block">
                      ℹ️ GPT-4o cost is roughly $0.01 per brief generation. A $5 credit allows ~500 briefs.
                    </div>
                  </div>

                  {/* Step 2 */}
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <span className="h-5 w-5 bg-orange-150 text-[#FF6B4A] rounded-full flex items-center justify-center font-bold text-[10px]">2</span>
                      <span className="font-bold text-gray-800 text-sm">Paste your key below</span>
                    </div>
                    <div className="relative pt-1">
                      <input
                        type={showKey ? 'text' : 'password'}
                        value={provider === 'openai' ? openaiKey : byokKey}
                        onChange={(e) => {
                          if (provider === 'openai') {
                            setOpenaiKey(e.target.value);
                          } else {
                            setByokKey(e.target.value);
                          }
                        }}
                        className="w-full text-xs font-semibold pl-3 pr-10 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[#FF6B4A]"
                        placeholder="sk-proj-..."
                      />
                      <button
                        type="button"
                        onClick={() => setShowKey(!showKey)}
                        className="absolute right-3.5 top-3.5 text-gray-400 hover:text-gray-700"
                      >
                        {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Security note */}
              <div className="bg-amber-50/30 border border-amber-100 text-amber-800 p-4 rounded-2xl flex items-start space-x-2.5 leading-relaxed">
                <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold">🔒 Security Info: </span>
                  Your API keys are stored only in your browser's local cache. They are dispatched straight to the official model provider gateways and never saved on ViralSpy servers.
                </div>
              </div>

            </div>
          )}

          {/* TEST CONNECTION TAB FOR ALL APIS */}
          {provider !== 'gemini' && activeTab === 'test' && (
            <div className="space-y-4">
              <p className="text-gray-500 text-[11px] leading-relaxed">
                Validate that your setup credentials can talk to the model server successfully:
              </p>

              <button
                onClick={handleTestConnection}
                disabled={testing}
                className="flex items-center space-x-2 px-5 py-2.5 bg-gray-900 text-white rounded-xl font-bold transition-all disabled:opacity-60 text-xs shrink-0"
              >
                {testing ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : null}
                <span>{testing ? 'Testing connection...' : 'Test Connection'}</span>
              </button>

              {testResult && (
                <div className={`p-4 rounded-2xl border text-xs leading-relaxed space-y-2 ${
                  testResult.success 
                    ? 'bg-green-50 border-green-200 text-green-800' 
                    : 'bg-red-50/50 border-red-200 text-red-650'
                }`}>
                  <div className="font-bold flex items-center gap-1.5">
                    <span>{testResult.message}</span>
                  </div>
                  {!testResult.success && testResult.troubleshoot && (
                    <div className="pt-2 space-y-1 border-t border-red-100">
                      <div className="font-bold text-gray-800 uppercase tracking-wider text-[9px]">Troubleshooting tips:</div>
                      <ul className="list-disc pl-4 space-y-0.5 text-gray-600 text-[11px]">
                        {testResult.troubleshoot.map((item, idx) => (
                          <li key={idx}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-5 border-t border-gray-100 flex items-center justify-end bg-gray-50/35">
          <button
            onClick={handleDone}
            className="w-full sm:w-auto px-6 py-3 bg-[#FF6B4A] hover:bg-[#ff5a33] text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
          >
            Done — use this provider
          </button>
        </div>
      </div>
    </div>
  );
}
