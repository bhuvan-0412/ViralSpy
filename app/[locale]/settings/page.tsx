'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import { useAIProvider } from '../../../hooks/useAIProvider';
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
  Lock 
} from 'lucide-react';

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
  const [provider, setProvider] = useState<'gemini' | 'openai' | 'ollama' | 'byok'>('gemini');
  const [byokKey, setByokKey] = useState('');
  const [byokProvider, setByokProvider] = useState<'gemini' | 'openai'>('gemini');
  const [ollamaUrl, setOllamaUrl] = useState('http://localhost:11434');
  const [ollamaModel, setOllamaModel] = useState('llama3');
  
  // UI States
  const [showApiKey, setShowApiKey] = useState(false);
  const [keySavedToast, setKeySavedToast] = useState(false);
  const [settingsSavedToast, setSettingsSavedToast] = useState(false);
  
  // Setup Guide Modal states
  const [isGuideOpen, setIsGuideOpen] = useState(false);

  const handleModalComplete = (newConfig: any) => {
    setProvider(newConfig.provider);
    if (newConfig.openaiKey !== undefined) setByokKey(newConfig.openaiKey);
    if (newConfig.byokKey !== undefined) setByokKey(newConfig.byokKey);
    if (newConfig.byokProvider !== undefined) setByokProvider(newConfig.byokProvider);
    if (newConfig.ollamaUrl !== undefined) setOllamaUrl(newConfig.ollamaUrl);
    if (newConfig.ollamaModel !== undefined) setOllamaModel(newConfig.ollamaModel);

    // Save immediately to localStorage
    const savedConfig = {
      provider: newConfig.provider,
      byokKey: newConfig.byokKey || newConfig.openaiKey || '',
      byokProvider: newConfig.byokProvider || (newConfig.provider === 'openai' ? 'openai' : 'gemini'),
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

  // Load configuration from custom hook on mount
  useEffect(() => {
    if (storedConfig) {
      setProvider(storedConfig.provider);
      setByokKey(storedConfig.byokKey || '');
      setByokProvider(storedConfig.byokProvider || 'gemini');
      setOllamaUrl(storedConfig.ollamaUrl || 'http://localhost:11434');
      setOllamaModel(storedConfig.ollamaModel || 'llama3');
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

  const handleSaveKey = async () => {
    const newConfig = {
      ...storedConfig,
      provider,
      byokKey,
      byokProvider,
      ollamaUrl,
      ollamaModel
    };
    saveConfig(newConfig);
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
      ollamaUrl,
      ollamaModel
    };
    saveConfig(newConfig);
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

  const getLocalizedDashboardPath = () => {
    return locale === 'en' ? '/dashboard' : `/${locale}/dashboard`;
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

          {/* Provider 2x2 Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* CARD 1: Gemini */}
            <button
              onClick={() => setProvider('gemini')}
              className={`text-left p-5 rounded-xl border flex flex-col justify-between h-36 relative transition-all ${
                provider === 'gemini'
                  ? 'border-[#FF6B4A] bg-orange-50/20 text-[#1A1A1A]'
                  : 'border-gray-200 hover:border-gray-300 bg-white text-gray-600'
              }`}
            >
              <div>
                <div className="flex justify-between items-center mb-2">
                  <div className="flex items-center space-x-1 bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full text-[9px] font-bold">
                    <span>Google</span>
                  </div>
                  <span className="text-[9px] font-semibold text-gray-400">Free Tier</span>
                </div>
                <h3 className="text-sm font-bold text-gray-900 uppercase">Gemini 1.5 Flash</h3>
                <p className="text-[11px] text-gray-400 mt-2 leading-relaxed">Fast, accurate content strategy briefs with generous quota limit.</p>
              </div>
              {provider === 'gemini' && (
                <span className="absolute bottom-4 right-4 bg-[#FF6B4A] text-white p-0.5 rounded-full">
                  <Check className="h-3 w-3" />
                </span>
              )}
            </button>

            {/* CARD 2: OpenAI */}
            <button
              onClick={() => setProvider('openai')}
              className={`text-left p-5 rounded-xl border flex flex-col justify-between h-36 relative transition-all ${
                provider === 'openai'
                  ? 'border-[#FF6B4A] bg-orange-50/20 text-[#1A1A1A]'
                  : 'border-gray-200 hover:border-gray-300 bg-white text-gray-600'
              }`}
            >
              <div>
                <div className="flex justify-between items-center mb-2">
                  <div className="flex items-center space-x-1 bg-green-50 text-green-600 px-2 py-0.5 rounded-full text-[9px] font-bold">
                    <span>OpenAI</span>
                  </div>
                  <span className="text-[9px] font-semibold text-gray-400">Cloud Pay</span>
                </div>
                <h3 className="text-sm font-bold text-gray-900 uppercase">GPT-4o</h3>
                <p className="text-[11px] text-gray-400 mt-2 leading-relaxed">Most capable strategy intelligence model available.</p>
              </div>
              {provider === 'openai' && (
                <span className="absolute bottom-4 right-4 bg-[#FF6B4A] text-white p-0.5 rounded-full">
                  <Check className="h-3 w-3" />
                </span>
              )}
            </button>

            {/* CARD 3: Ollama */}
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

            {/* CARD 4: BYOK */}
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
                  <input
                    type="text"
                    value={ollamaUrl}
                    onChange={(e) => setOllamaUrl(e.target.value)}
                    className="w-full text-xs font-semibold px-3 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[#FF6B4A]"
                    placeholder="http://localhost:11434"
                  />
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
                    <option value="gemma">gemma</option>
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
              <div className="text-[11px] text-gray-500 bg-white border border-gray-200 rounded-xl p-3.5 space-y-1">
                <div className="font-bold text-gray-700">How to use Local Ollama:</div>
                <ol className="list-decimal pl-4 space-y-0.5">
                  <li>Download Ollama from <a href="https://ollama.com" target="_blank" rel="noopener noreferrer" className="text-[#FF6B4A] font-semibold underline">ollama.com</a>.</li>
                  <li>Run the service in your terminal: <code className="bg-gray-100 text-red-500 px-1.5 py-0.5 rounded font-mono text-[10px]">ollama serve</code>.</li>
                  <li>Pull the model to generate briefs: <code className="bg-gray-100 text-red-500 px-1.5 py-0.5 rounded font-mono text-[10px]">ollama pull llama3</code>.</li>
                </ol>
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
                {/* Toggle BYOK Provider */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400">BYOK Model Provider</label>
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

                {/* API Key input */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                    {byokProvider === 'gemini' ? 'Gemini API Key' : 'OpenAI API Key'}
                  </label>
                  <div className="relative">
                    <input
                      type={showApiKey ? 'text' : 'password'}
                      value={byokKey}
                      onChange={(e) => setByokKey(e.target.value)}
                      className="w-full text-xs font-semibold pl-3 pr-10 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[#FF6B4A]"
                      placeholder={t('byokPlaceholder')}
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
              </div>

              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-2">
                <button
                  onClick={handleSaveKey}
                  className="flex items-center space-x-1.5 px-4.5 py-2.5 bg-[#FF6B4A] hover:bg-[#ff5a33] text-white text-xs font-bold rounded-xl transition-all"
                >
                  <Save className="h-3.5 w-3.5" />
                  <span>{t('byokSave')}</span>
                </button>
                
                {keySavedToast && (
                  <div className="text-xs font-semibold text-green-650 flex items-center space-x-1.5">
                    <Check className="h-4 w-4 text-green-500" />
                    <span>{t('byokSaved')}</span>
                  </div>
                )}
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
          openaiKey: provider === 'openai' ? byokKey : '',
          ollamaUrl,
          ollamaModel
        }}
      />
    </div>
  );
}
