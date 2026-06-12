'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import { useAIProvider, detectOllamaUrl } from '../../../hooks/useAIProvider';
import { saveUserProfile } from '../../../lib/supabase';
import Logo from '../../../components/Logo';
import ProviderSetupGuide from '../../../components/ProviderSetupGuide';
import { 
  Globe, 
  Cpu, 
  Key, 
  Check, 
  AlertTriangle, 
  ArrowLeft, 
  Save, 
  Terminal, 
  Wifi, 
  WifiOff, 
  Eye, 
  EyeOff, 
  Lock,
  RefreshCw
} from 'lucide-react';

const presets = [
  {
    id: 'openai',
    name: 'OpenAI',
    baseUrl: 'https://api.openai.com/v1',
    model: 'gpt-4o',
    badge: 'Pay per use',
    link: 'https://platform.openai.com/api-keys',
    color: 'bg-green-500'
  },
  {
    id: 'gemini',
    name: 'Gemini',
    baseUrl: '',
    model: 'gemini-2.0-flash',
    badge: 'Free Tier',
    link: 'https://aistudio.google.com/app/apikey',
    color: 'bg-blue-500'
  },
  {
    id: 'groq',
    name: 'Groq',
    baseUrl: 'https://api.groq.com/openai/v1',
    model: 'llama-3.3-70b-versatile',
    badge: 'Free Tier',
    link: 'https://console.groq.com/keys',
    color: 'bg-orange-500'
  },
  {
    id: 'together',
    name: 'Together AI',
    baseUrl: 'https://api.together.xyz/v1',
    model: 'meta-llama/Llama-3-70b-chat-hf',
    badge: 'Pay per use',
    link: 'https://api.together.xyz/settings/api-keys',
    color: 'bg-cyan-500'
  },
  {
    id: 'mistral',
    name: 'Mistral',
    baseUrl: 'https://api.mistral.ai/v1',
    model: 'mistral-large-latest',
    badge: 'Pay per use',
    link: 'https://console.mistral.ai/api-keys',
    color: 'bg-red-500'
  },
  {
    id: 'custom',
    name: 'Custom',
    baseUrl: '',
    model: '',
    badge: 'Any provider',
    link: '',
    color: 'bg-gray-500'
  }
];

const languages = [
  { code: 'en', flag: '🇬🇧', label: 'English', native: 'English' },
  { code: 'hi', flag: '🇮🇳', label: 'Hindi', native: 'हिन्दी' },
  { code: 'te', flag: '🇮🇳', label: 'Telugu', native: 'తెలుగు' }
];

export default function SettingsPage() {
  const router = useRouter();
  const pathname = usePathname();
  const locale = useLocale();
  
  const t = useTranslations('settings');
  const tErrors = useTranslations('errors');
  const { config: storedConfig, saveConfig } = useAIProvider();

  // Local config states
  const [provider, setProvider] = useState<'ollama' | 'byok'>('ollama');
  const [byokKey, setByokKey] = useState('');
  const [byokProvider, setByokProvider] = useState<'gemini' | 'openai' | 'custom'>('openai');
  const [byokBaseUrl, setByokBaseUrl] = useState('https://api.openai.com/v1');
  const [byokModel, setByokModel] = useState('gpt-4o');
  const [ollamaUrl, setOllamaUrl] = useState('http://localhost:11434');
  const [ollamaModel, setOllamaModel] = useState('llama3');
  const [selectedPreset, setSelectedPreset] = useState<string>('openai');
  
  // UI States
  const [showApiKey, setShowApiKey] = useState(false);
  const [detecting, setDetecting] = useState(false);
  const [keySavedToast, setKeySavedToast] = useState(false);
  const [settingsSavedToast, setSettingsSavedToast] = useState(false);
  
  // Setup Guide Modal states
  const [isGuideOpen, setIsGuideOpen] = useState(false);

  const handleModalComplete = (newConfig: any) => {
    setProvider(newConfig.provider);
    if (newConfig.byokKey !== undefined) setByokKey(newConfig.byokKey);
    if (newConfig.byokProvider !== undefined) setByokProvider(newConfig.byokProvider);
    if (newConfig.byokBaseUrl !== undefined) setByokBaseUrl(newConfig.byokBaseUrl);
    if (newConfig.byokModel !== undefined) setByokModel(newConfig.byokModel);
    if (newConfig.ollamaUrl !== undefined) setOllamaUrl(newConfig.ollamaUrl);
    if (newConfig.ollamaModel !== undefined) setOllamaModel(newConfig.ollamaModel);

    // Save immediately to localStorage
    const savedConfig = {
      provider: newConfig.provider,
      byokProvider: newConfig.byokProvider || 'openai',
      byokKey: newConfig.byokKey || '',
      byokBaseUrl: newConfig.byokBaseUrl || 'https://api.openai.com/v1',
      byokModel: newConfig.byokModel || 'gpt-4o',
      ollamaUrl: newConfig.ollamaUrl || 'http://localhost:11434',
      ollamaModel: newConfig.ollamaModel || 'llama3'
    };
    saveConfig(savedConfig as any);

    // Sync to Supabase user profiles table
    saveUserProfile({
      ai_provider: newConfig.provider
    }).catch((e) => console.error('Database sync failed:', e));

    setSettingsSavedToast(true);
    setTimeout(() => setSettingsSavedToast(false), 3000);
    setIsGuideOpen(false);
  };
  
  // Ollama connection states
  const [testingOllama, setTestingOllama] = useState(false);
  const [ollamaStatus, setOllamaStatus] = useState<{
    tested: boolean;
    connected: boolean;
    message: string;
  } | null>(null);

  // BYOK connection states
  const [testingByok, setTestingByok] = useState(false);
  const [byokStatus, setByokStatus] = useState<{
    tested: boolean;
    success: boolean;
    message: string;
  } | null>(null);

  // Load configuration from custom hook on mount
  useEffect(() => {
    if (storedConfig) {
      setProvider(storedConfig.provider || 'ollama');
      setByokProvider(storedConfig.byokProvider || 'openai');
      setByokKey(storedConfig.byokKey || '');
      const baseUrl = storedConfig.byokBaseUrl || 'https://api.openai.com/v1';
      const model = storedConfig.byokModel || 'gpt-4o';
      setByokBaseUrl(baseUrl);
      setByokModel(model);
      setOllamaUrl(storedConfig.ollamaUrl || 'http://localhost:11434');
      setOllamaModel(storedConfig.ollamaModel || 'llama3');

      // Auto-select active preset based on current stored credentials
      const matched = presets.find(p => p.baseUrl === baseUrl && p.model === model && (p.id === 'gemini' ? storedConfig.byokProvider === 'gemini' : storedConfig.byokProvider === 'openai'));
      if (matched) {
        setSelectedPreset(matched.id);
      } else if (storedConfig.byokProvider === 'gemini') {
        setSelectedPreset('gemini');
      } else {
        setSelectedPreset('custom');
      }
    }
  }, [storedConfig]);

  const switchLocale = (newLocale: string) => {
    const newPath = pathname.replace(`/${locale}`, '') || '/';
    router.push(`/${newLocale}${newPath}`);
  };

  const handleTestOllama = async () => {
    setTestingOllama(true);
    setOllamaStatus(null);
    try {
      const res = await fetch(
        `/api/ollama-test?url=${encodeURIComponent(ollamaUrl)}&model=${ollamaModel}`
      );
      const data = await res.json();
      setOllamaStatus({
        tested: true,
        connected: data.connected,
        message: data.message
      });
    } catch (e) {
      setOllamaStatus({
        tested: true,
        connected: false,
        message: tErrors('ollamaNotRunning')
      });
    } finally {
      setTestingOllama(false);
    }
  };

  const handleTestByok = async () => {
    setTestingByok(true);
    setByokStatus(null);
    try {
      const res = await fetch('/api/test-key', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          key: byokKey,
          provider: byokProvider,
          baseUrl: byokBaseUrl,
          model: byokModel
        })
      });
      const data = await res.json();
      setByokStatus({
        tested: true,
        success: data.valid,
        message: data.message
      });
    } catch (e: any) {
      setByokStatus({
        tested: true,
        success: false,
        message: e.message || 'Verification failed.'
      });
    } finally {
      setTestingByok(false);
    }
  };

  const handleSaveKey = async () => {
    const newConfig = {
      ...storedConfig,
      provider,
      byokKey,
      byokProvider,
      byokBaseUrl,
      byokModel,
      ollamaUrl,
      ollamaModel
    };
    saveConfig(newConfig as any);
    try {
      await saveUserProfile({
        ai_provider: provider
      });
    } catch (e) {
      console.error('Database sync failed:', e);
    }
    setKeySavedToast(true);
    setTimeout(() => setKeySavedToast(false), 3000);
  };

  const handleSaveSettings = async () => {
    const newConfig = {
      provider,
      byokKey,
      byokProvider,
      byokBaseUrl,
      byokModel,
      ollamaUrl,
      ollamaModel
    };
    saveConfig(newConfig as any);
    try {
      await saveUserProfile({
        ai_provider: provider
      });
    } catch (e) {
      console.error('Database sync failed:', e);
    }
    setSettingsSavedToast(true);
    setTimeout(() => setSettingsSavedToast(false), 3000);
  };

  const handleSelectPreset = (preset: typeof presets[number]) => {
    if (preset.id === 'gemini') {
      setByokProvider('gemini');
    } else if (preset.id === 'custom') {
      setByokProvider('custom');
    } else {
      setByokProvider('openai');
    }
    setByokBaseUrl(preset.baseUrl);
    setByokModel(preset.model);
  };

  const getLocalizedDashboardPath = () => {
    return locale === 'en' ? '/dashboard' : `/${locale}/dashboard`;
  };

  const getLocalizedSetupPath = () => {
    return locale === 'en' ? '/setup' : `/${locale}/setup`;
  };

  return (
    <div className="min-h-screen bg-[#F7F5F2] text-[#1A1A1A] flex flex-col justify-between font-sans relative">
      <header className="sticky top-0 bg-white border-b border-gray-200 z-50 py-3.5 px-4 sm:px-6 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <Logo />
          </div>
          <button
            onClick={() => router.push(getLocalizedDashboardPath())}
            className="flex items-center space-x-1.5 px-3 py-2 bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-600 hover:text-gray-900 rounded-xl text-xs font-semibold transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Back</span>
          </button>
        </div>
      </header>

      <main className="flex-grow max-w-3xl mx-auto w-full py-8 px-4 sm:px-6 space-y-8">
        {/* Top Header */}
        <div className="space-y-1">
          <h1 className="text-3xl font-black text-[#1A1A1A] tracking-tight">{t('title')}</h1>
          <p className="text-xs text-gray-500 font-medium">Configure translation preferences and model generation providers.</p>
        </div>

        {/* SECTION 1: Language */}
        <section className="bg-white border border-gray-200 rounded-2xl p-6 shadow-card space-y-4">
          <div className="flex items-center space-x-2 border-b border-gray-100 pb-3">
            <Globe className="h-4 w-4 text-[#FF6B4A]" />
            <h2 className="text-sm font-bold uppercase tracking-wider text-gray-800">{t('language')}</h2>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {languages.map((lang) => {
              const isSelected = locale === lang.code;
              return (
                <button
                  key={lang.code}
                  onClick={() => switchLocale(lang.code)}
                  className={`flex flex-col items-center justify-center p-4 rounded-xl border text-center transition-all ${
                    isSelected
                      ? 'border-[#FF6B4A] bg-orange-50/20 text-[#1A1A1A]'
                      : 'border-gray-200 hover:border-gray-300 bg-white text-gray-600'
                  }`}
                >
                  <span className="text-3xl mb-2">{lang.flag}</span>
                  <span className="text-xs font-bold leading-tight uppercase tracking-wider">{lang.native}</span>
                  <span className="text-[10px] text-gray-400 mt-1 uppercase font-semibold">{lang.label}</span>
                  {isSelected && (
                    <div className="absolute top-2 right-2 bg-[#FF6B4A] p-0.5 rounded-full text-white">
                      <Check className="h-3 w-3" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </section>

        {/* SECTION 2: AI Provider */}
        <section className="bg-white border border-gray-200 rounded-2xl p-6 shadow-card space-y-6">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <div className="flex items-center space-x-2">
              <Cpu className="h-4 w-4 text-[#FF6B4A]" />
              <div className="space-y-0.5">
                <h2 className="text-sm font-bold uppercase tracking-wider text-gray-800">{t('aiProvider')}</h2>
                <p className="text-[11px] text-gray-400 font-medium">{t('aiProviderDesc')}</p>
              </div>
            </div>
            <button
              onClick={() => setIsGuideOpen(true)}
              className="text-xs font-bold text-[#FF6B4A] hover:underline flex items-center gap-1 bg-orange-50 border border-orange-100 rounded-xl px-3.5 py-1.5 transition-colors hover:border-[#FF6B4A]"
            >
              <span>Setup Guide</span>
            </button>
          </div>

          {/* Provider 2-Card Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* CARD 1: Ollama */}
            <button
              onClick={() => setProvider('ollama')}
              className={`text-left p-5 rounded-xl border flex flex-col justify-between h-36 relative transition-all ${
                provider === 'ollama'
                  ? 'border-[#FF6B4A] bg-orange-50/20 text-[#1A1A1A]'
                  : 'border-gray-200 hover:border-gray-300 bg-white text-gray-600'
              }`}
            >
              <div>
                <div className="flex justify-between items-center mb-2">
                  <div className="flex items-center space-x-1 bg-purple-50 text-purple-600 px-2 py-0.5 rounded-full text-[9px] font-bold">
                    <span>🦙 Local AI</span>
                  </div>
                  <span className="text-[9px] font-semibold text-purple-550">100% Private</span>
                </div>
                <h3 className="text-sm font-bold text-gray-900 uppercase">{t('ollamaTitle')}</h3>
                <p className="text-[11px] text-gray-400 mt-2 leading-relaxed">No API costs. Briefs are generated completely on your machine.</p>
              </div>
              {provider === 'ollama' && (
                <span className="absolute bottom-4 right-4 bg-[#FF6B4A] text-white p-0.5 rounded-full">
                  <Check className="h-3 w-3" />
                </span>
              )}
            </button>

            {/* CARD 2: BYOK */}
            <button
              onClick={() => setProvider('byok')}
              className={`text-left p-5 rounded-xl border flex flex-col justify-between h-36 relative transition-all ${
                provider === 'byok'
                  ? 'border-[#FF6B4A] bg-orange-50/20 text-[#1A1A1A]'
                  : 'border-gray-200 hover:border-gray-300 bg-white text-gray-600'
              }`}
            >
              <div>
                <div className="flex justify-between items-center mb-2">
                  <div className="flex items-center space-x-1 bg-orange-50 text-[#FF6B4A] px-2 py-0.5 rounded-full text-[9px] font-bold">
                    <span>🔑 Credentials</span>
                  </div>
                  <span className="text-[9px] font-semibold text-gray-400">Custom Key</span>
                </div>
                <h3 className="text-sm font-bold text-gray-900 uppercase">{t('byokTitle')}</h3>
                <p className="text-[11px] text-gray-400 mt-2 leading-relaxed">Provide your own API keys. Keys are stored locally on your device.</p>
              </div>
              {provider === 'byok' && (
                <span className="absolute bottom-4 right-4 bg-[#FF6B4A] text-white p-0.5 rounded-full">
                  <Check className="h-3 w-3" />
                </span>
              )}
            </button>

          </div>

          {/* OLLAMA LOCAL CONFIGURATION PANEL */}
          {provider === 'ollama' && (
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-5 space-y-4 animate-fade-in">
              <h3 className="text-xs font-bold text-gray-750 uppercase tracking-wider">{t('ollamaTitle')} Configuration</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400">{t('ollamaUrl')}</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={ollamaUrl}
                      onChange={(e) => setOllamaUrl(e.target.value)}
                      className="flex-grow text-xs font-semibold px-3 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[#FF6B4A]"
                      placeholder="http://localhost:11434"
                    />
                    <button
                      type="button"
                      onClick={async () => {
                        setDetecting(true)
                        const url = await detectOllamaUrl()
                        setOllamaUrl(url)
                        setDetecting(false)
                      }}
                      className="px-3.5 py-2.5 text-xs font-bold border border-gray-200 rounded-xl hover:border-[#FF6B4A] hover:text-[#FF6B4A] bg-white transition-colors flex items-center justify-center shrink-0 shadow-sm"
                    >
                      {detecting ? 'Detecting...' : '🔍 Auto-detect'}
                    </button>
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400">{t('ollamaModel')}</label>
                  <select
                    value={ollamaModel}
                    onChange={(e) => setOllamaModel(e.target.value)}
                    className="w-full text-xs font-semibold px-3 py-2.5 bg-white rounded-xl border border-gray-200 focus:outline-none focus:border-[#FF6B4A]"
                  >
                    <option value="llama3">llama3 (Default)</option>
                    <option value="mistral">mistral</option>
                    <option value="gemma font-semibold">gemma</option>
                    <option value="phi3">phi3</option>
                    <option value="llama3:8b">llama3:8b</option>
                  </select>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-2">
                <button
                  onClick={handleTestOllama}
                  disabled={testingOllama}
                  className="flex items-center space-x-1.5 px-4 py-2.5 bg-[#FF6B4A] hover:bg-[#ff5a33] text-white text-xs font-bold rounded-xl transition-all disabled:opacity-60 shrink-0"
                >
                  <Terminal className="h-3.5 w-3.5" />
                  <span>{testingOllama ? 'Testing...' : t('ollamaTest')}</span>
                </button>

                {ollamaStatus && (
                  <div className={`flex items-center space-x-2 text-xs font-semibold ${
                    ollamaStatus.connected ? 'text-green-650' : 'text-red-500'
                  }`}>
                    {ollamaStatus.connected ? (
                      <>
                        <Wifi className="h-4 w-4" />
                        <span>● {t('ollamaConnected')} — {ollamaStatus.message}</span>
                      </>
                    ) : (
                      <>
                        <WifiOff className="h-4 w-4" />
                        <span>✗ {ollamaStatus.message}</span>
                      </>
                    )}
                  </div>
                )}
              </div>

              {/* Install guide */}
              <div className="text-[11px] text-gray-550 bg-white border border-gray-200 rounded-xl p-3.5 space-y-1">
                <div className="font-bold text-gray-700">How to use Local Ollama:</div>
                <ol className="list-decimal pl-4 space-y-0.5">
                  <li>Download Ollama from <a href="https://ollama.com" target="_blank" rel="noopener noreferrer" className="text-[#FF6B4A] font-semibold underline">ollama.com</a>.</li>
                  <li>Run the service in your terminal: <code className="bg-gray-100 text-red-500 px-1.5 py-0.5 rounded font-mono text-[10px]">ollama serve</code>.</li>
                  <li>Pull the model to generate briefs: <code className="bg-gray-100 text-red-500 px-1.5 py-0.5 rounded font-mono text-[10px]">ollama pull llama3</code>.</li>
                </ol>
                <a 
                  href={getLocalizedSetupPath()}
                  className="flex items-center gap-2 text-[#FF6B4A] hover:underline text-sm font-medium mt-2 pt-1 border-t border-gray-100"
                >
                  📖 Step-by-step setup guide for beginners →
                </a>
              </div>
            </div>
          )}

          {/* BYOK CONFIGURATION PANEL */}
          {provider === 'byok' && (
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-5 space-y-4 animate-fade-in">
              <div className="flex justify-between items-center">
                <h3 className="text-xs font-bold text-gray-750 uppercase tracking-wider">{t('byokTitle')} Credentials</h3>
                <span className="text-[10px] text-gray-400 flex items-center space-x-1">
                  <Lock className="h-3 w-3" />
                  <span>Stored locally</span>
                </span>
              </div>

              <div className="space-y-4">
                
                {/* Presets Horizontal Scroll */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Select Provider</label>
                  <div className="flex space-x-2.5 overflow-x-auto pb-2 pt-1 scrollbar-thin">
                    {presets.map((p) => {
                      const isSelected = selectedPreset === p.id;
                      return (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => {
                            setSelectedPreset(p.id);
                            handleSelectPreset(p);
                          }}
                          className={`min-w-[130px] p-3 rounded-xl border text-left flex flex-col justify-between h-24 relative transition-all shrink-0 ${
                            isSelected
                              ? 'border-[#FF6B4A] bg-orange-50/15 ring-1 ring-[#FF6B4A]'
                              : 'border-gray-200 hover:border-gray-300 bg-white'
                          }`}
                        >
                          <div className="flex items-center space-x-1.5">
                            <span className={`h-2.5 w-2.5 rounded-full ${p.color}`} />
                            <span className="font-bold text-gray-800 text-[11px] leading-tight block">{p.name}</span>
                          </div>
                          <div>
                            <span className={`text-[8px] px-1.5 py-0.5 rounded-full font-extrabold uppercase ${
                              p.badge === 'Free Tier' 
                                ? 'bg-green-100 text-green-700' 
                                : p.badge === 'Pay per use'
                                  ? 'bg-blue-50 text-blue-600'
                                  : 'bg-gray-100 text-gray-600'
                            }`}>
                              {p.badge}
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* API Link if present */}
                {presets.find(p => p.id === selectedPreset)?.link && (
                  <a
                    href={presets.find(p => p.id === selectedPreset)?.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-[#FF6B4A] hover:underline font-bold inline-flex items-center gap-1"
                  >
                    <span>Get free API key →</span>
                  </a>
                )}

                {/* API Key input */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400">API Key</label>
                  <div className="relative">
                    <input
                      type={showApiKey ? 'text' : 'password'}
                      value={byokKey}
                      onChange={(e) => setByokKey(e.target.value)}
                      className="w-full text-xs font-semibold pl-3 pr-10 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[#FF6B4A]"
                      placeholder="Paste your API key here"
                    />
                    <button
                      type="button"
                      onClick={() => setShowApiKey(!showApiKey)}
                      className="absolute right-3.5 top-3 text-gray-400 hover:text-gray-700"
                    >
                      {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                {/* Base URL input (shown only for Custom) */}
                {selectedPreset === 'custom' && (
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Base URL</label>
                    <input
                      type="text"
                      value={byokBaseUrl}
                      onChange={(e) => setByokBaseUrl(e.target.value)}
                      className="w-full text-xs font-semibold px-3 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[#FF6B4A]"
                      placeholder="https://api.yourprovider.com/v1"
                    />
                  </div>
                )}

                {/* Model input */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Model Name</label>
                  <input
                    type="text"
                    value={byokModel}
                    onChange={(e) => setByokModel(e.target.value)}
                    disabled={selectedPreset !== 'custom'}
                    className={`w-full text-xs font-semibold px-3 py-2.5 rounded-xl border focus:outline-none focus:border-[#FF6B4A] ${
                      selectedPreset !== 'custom' 
                        ? 'bg-gray-50 text-gray-500 cursor-not-allowed border-gray-200' 
                        : 'bg-white border-gray-200'
                    }`}
                    placeholder={selectedPreset === 'custom' ? 'e.g., meta-llama/Llama-3' : ''}
                  />
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-2">
                <div className="flex items-center space-x-2">
                  <button
                    onClick={handleSaveKey}
                    className="flex items-center space-x-1.5 px-4.5 py-2.5 bg-[#FF6B4A] hover:bg-[#ff5a33] text-white text-xs font-bold rounded-xl transition-all"
                  >
                    <Save className="h-3.5 w-3.5" />
                    <span>{t('byokSave')}</span>
                  </button>
                  
                  <button
                    onClick={handleTestByok}
                    disabled={testingByok || !byokKey}
                    className="flex items-center space-x-1.5 px-4 py-2.5 bg-gray-900 hover:bg-gray-800 text-white text-xs font-bold rounded-xl transition-all disabled:opacity-60"
                  >
                    {testingByok && <RefreshCw className="h-3.5 w-3.5 animate-spin" />}
                    <span>{testingByok ? 'Testing...' : 'Test API'}</span>
                  </button>
                </div>
                
                <div className="flex flex-col">
                  {keySavedToast && (
                    <div className="text-xs font-semibold text-green-650 flex items-center space-x-1.5">
                      <Check className="h-4 w-4 text-green-500" />
                      <span>{t('byokSaved')}</span>
                    </div>
                  )}
                  {byokStatus && (
                    <div className={`text-xs font-semibold flex items-center space-x-1.5 ${
                      byokStatus.success ? 'text-green-650' : 'text-red-500'
                    }`}>
                      {byokStatus.success ? <Check className="h-4 w-4 text-green-500" /> : <AlertTriangle className="h-4 w-4 text-red-500" />}
                      <span>{byokStatus.message}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="text-[10px] text-gray-450 italic">
                🔒 Key saved locally — never sent to our servers
              </div>
            </div>
          )}

        </section>

        {/* SECTION 3: Save button */}
        <section className="flex items-center justify-between gap-4 bg-white border border-gray-200 rounded-2xl p-6 shadow-card">
          <div className="text-xs text-gray-500 font-semibold">
            Make sure to save after selecting your AI provider.
          </div>
          <div className="flex items-center space-x-4">
            {settingsSavedToast && (
              <span className="text-xs font-bold text-green-600 animate-pulse">
                ✓ Settings saved
              </span>
            )}
            <button
              onClick={handleSaveSettings}
              className="flex items-center space-x-1.5 px-6 py-3 bg-[#FF6B4A] hover:bg-[#ff5a33] text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <Save className="h-4 w-4" />
              <span>Save Settings</span>
            </button>
          </div>
        </section>

      </main>

      <footer className="max-w-3xl mx-auto w-full py-6 border-t border-gray-200 flex justify-between items-center text-xs text-gray-550 mt-12 px-4">
        <div>© 2026 ViralSpy.</div>
        <div className="text-[#FF6B4A] italic">Quietly Rise</div>
      </footer>

      {/* Setup Guide Modal */}
      <ProviderSetupGuide
        provider={provider}
        isOpen={isGuideOpen}
        onClose={() => setIsGuideOpen(false)}
        onComplete={handleModalComplete}
        initialConfig={{
          byokKey,
          byokProvider,
          byokBaseUrl,
          byokModel,
          ollamaUrl,
          ollamaModel
        }}
      />
    </div>
  );
}
