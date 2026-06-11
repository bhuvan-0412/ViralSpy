'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../components/AuthProvider';
import { saveUserProfile } from '../../../lib/supabase';
import { NicheType } from '../../../types';
import { Check, ArrowRight, ArrowLeft, Eye, Sparkles, AlertCircle, Cpu, Key, Database, Globe } from 'lucide-react';
import { useTranslations } from 'next-intl';
import ProviderSetupGuide, { GuideProvider } from '../../../components/ProviderSetupGuide';

const NICHES: { id: NicheType; label: string; desc: string; emoji: string }[] = [
  { id: 'fitness', label: 'Fitness', desc: 'Workouts, nutrition, gym', emoji: '🏋️' },
  { id: 'food', label: 'Food', desc: 'Recipes, viral taste tests', emoji: '🍳' },
  { id: 'finance', label: 'Finance', desc: 'Investing, saving, money hacks', emoji: '💵' },
  { id: 'fashion', label: 'Fashion', desc: 'Style, outfits, luxury', emoji: '🧥' },
  { id: 'beauty', label: 'Beauty', desc: 'GRWM, skincare reviews', emoji: '💅' },
  { id: 'tech', label: 'Tech & AI', desc: 'SaaS, LLMs, tech updates', emoji: '💻' },
  { id: 'gaming', label: 'Gaming', desc: 'Walkthroughs, clip edits', emoji: '🎮' },
  { id: 'travel', label: 'Travel', desc: 'Points,POV tours, itineraries', emoji: '✈️' },
  { id: 'education', label: 'Education', desc: 'Productivity, explanations', emoji: '📚' },
  { id: 'comedy', label: 'Comedy', desc: 'Skits, reactions, humor', emoji: '🎭' }
];

const PLATFORMS = [
  { id: 'YOUTUBE', label: 'YouTube Shorts', color: 'text-red-500 bg-red-50 border-red-100 hover:border-red-300' },
  { id: 'INSTAGRAM', label: 'Instagram Reels', color: 'text-pink-500 bg-pink-50 border-pink-100 hover:border-pink-300' },
  { id: 'REDDIT', label: 'Reddit Boards', color: 'text-orange-500 bg-orange-50 border-orange-100 hover:border-orange-300' },
  { id: 'X', label: 'X (Twitter)', color: 'text-gray-800 bg-gray-50 border-gray-200 hover:border-gray-300' },
  { id: 'ALL', label: 'All Platforms', color: 'text-[#FF6B4A] bg-orange-50 border-orange-150 hover:border-[#FF6B4A]' }
];

const FOLLOWER_TIERS = [
  { id: 'tier_1', label: '< 1K', value: 500, desc: 'Starting your creator journey' },
  { id: 'tier_2', label: '1K – 10K', value: 5000, desc: 'Micro community presence' },
  { id: 'tier_3', label: '10K – 100K', value: 50000, desc: 'Rapidly growing audience' },
  { id: 'tier_4', label: '100K +', value: 250000, desc: 'Established authority brand' }
];

type AIProvider = 'gemini' | 'openai' | 'ollama' | 'byok';

export default function OnboardingPage() {
  const router = useRouter();
  const { user, loading, refreshUser } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const t = useTranslations('onboarding');
  
  // Skip logic states
  const [skippedStep1, setSkippedStep1] = useState(false);
  const [configuredProviderLabel, setConfiguredProviderLabel] = useState('');

  // Step 1 Selection States (AI Provider)
  const [selProvider, setSelProvider] = useState<AIProvider>('gemini');
  const [openaiKey, setOpenaiKey] = useState('');
  const [byokKey, setByokKey] = useState('');
  const [byokProvider, setByokProvider] = useState<'gemini' | 'openai'>('gemini');
  const [ollamaUrl, setOllamaUrl] = useState('http://localhost:11434');
  const [ollamaModel, setOllamaModel] = useState('llama3');

  // Guide Modal States
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const [guideProvider, setGuideProvider] = useState<GuideProvider>('gemini');

  const handleOpenGuide = (prov: GuideProvider) => {
    setGuideProvider(prov);
    setIsGuideOpen(true);
  };

  const handleModalComplete = (newConfig: any) => {
    const aiConfig = {
      provider: newConfig.provider,
      byokKey: newConfig.byokKey || '',
      byokProvider: newConfig.byokProvider || 'gemini',
      openaiKey: newConfig.openaiKey || '',
      ollamaUrl: newConfig.ollamaUrl || 'http://localhost:11434',
      ollamaModel: newConfig.ollamaModel || 'llama3'
    };
    localStorage.setItem('viralspy_ai_config', JSON.stringify(aiConfig));

    setSelProvider(newConfig.provider);
    if (newConfig.openaiKey !== undefined) setOpenaiKey(newConfig.openaiKey);
    if (newConfig.byokKey !== undefined) setByokKey(newConfig.byokKey);
    if (newConfig.byokProvider !== undefined) setByokProvider(newConfig.byokProvider);
    if (newConfig.ollamaUrl !== undefined) setOllamaUrl(newConfig.ollamaUrl);
    if (newConfig.ollamaModel !== undefined) setOllamaModel(newConfig.ollamaModel);

    const labels: Record<string, string> = {
      gemini: 'Gemini',
      openai: 'GPT-4o',
      ollama: 'Ollama',
      byok: 'BYOK'
    };
    setConfiguredProviderLabel(labels[newConfig.provider] || 'Gemini');
    setIsGuideOpen(false);

    // Automatically transition to step 2 after modal is successfully configured
    setCurrentStep(2);
  };

  // Step 2, 3, 4 Selection States
  const [selectedNiches, setSelectedNiches] = useState<NicheType[]>([]);
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
  const [selectedFollowers, setSelectedFollowers] = useState<string>('');
  
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // Check on mount if AI Config already exists
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('viralspy_ai_config');
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          if (parsed && parsed.provider) {
            const labels: Record<string, string> = {
              gemini: 'Gemini',
              openai: 'GPT-4o',
              ollama: 'Ollama',
              byok: 'BYOK'
            };
            setConfiguredProviderLabel(labels[parsed.provider] || 'Gemini');
            setSkippedStep1(true);
            setCurrentStep(2); // Start directly at Niches selection (Step 2)
          }
        } catch (e) {}
      }
    }
  }, []);

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/');
    }
  }, [user, loading, router]);

  const handleToggleNiche = (nicheId: NicheType) => {
    setError('');
    if (selectedNiches.includes(nicheId)) {
      setSelectedNiches(selectedNiches.filter((n) => n !== nicheId));
    } else {
      if (selectedNiches.length >= 3) {
        setError('Maximum of 3 niches allowed.');
        return;
      }
      setSelectedNiches([...selectedNiches, nicheId]);
    }
  };

  const handleTogglePlatform = (platformId: string) => {
    setError('');
    if (platformId === 'ALL') {
      if (selectedPlatforms.includes('ALL')) {
        setSelectedPlatforms([]);
      } else {
        setSelectedPlatforms(['YOUTUBE', 'INSTAGRAM', 'REDDIT', 'X', 'ALL']);
      }
      return;
    }

    let updated = [...selectedPlatforms].filter(p => p !== 'ALL');
    if (updated.includes(platformId)) {
      updated = updated.filter(p => p !== platformId);
    } else {
      updated.push(platformId);
    }

    if (updated.includes('YOUTUBE') && updated.includes('INSTAGRAM') && updated.includes('REDDIT') && updated.includes('X')) {
      updated.push('ALL');
    }
    
    setSelectedPlatforms(updated);
  };

  const handleSaveAIConfig = () => {
    setError('');
    if (selProvider === 'openai' && !openaiKey) {
      setError('Please provide your OpenAI API Key.');
      return;
    }
    if (selProvider === 'byok' && !byokKey) {
      setError('Please provide your API key for the selected BYOK provider.');
      return;
    }

    const aiConfig = {
      provider: selProvider,
      byokKey: selProvider === 'byok' ? byokKey : '',
      byokProvider: selProvider === 'byok' ? byokProvider : 'gemini',
      openaiKey: selProvider === 'openai' ? openaiKey : '',
      ollamaUrl: selProvider === 'ollama' ? ollamaUrl : 'http://localhost:11434',
      ollamaModel: selProvider === 'ollama' ? ollamaModel : 'llama3'
    };

    localStorage.setItem('viralspy_ai_config', JSON.stringify(aiConfig));
    
    const labels: Record<string, string> = {
      gemini: 'Gemini',
      openai: 'GPT-4o',
      ollama: 'Ollama',
      byok: 'BYOK'
    };
    setConfiguredProviderLabel(labels[selProvider] || 'Gemini');
    setCurrentStep(2);
  };

  const handleSkipAIConfig = () => {
    const aiConfig = {
      provider: 'gemini',
      byokKey: '',
      byokProvider: 'gemini',
      openaiKey: '',
      ollamaUrl: 'http://localhost:11434',
      ollamaModel: 'llama3'
    };
    localStorage.setItem('viralspy_ai_config', JSON.stringify(aiConfig));
    setConfiguredProviderLabel('Gemini');
    setCurrentStep(2);
  };

  const handleNextStep = () => {
    setError('');
    if (currentStep === 2 && selectedNiches.length === 0) {
      setError('Please select at least one niche.');
      return;
    }
    if (currentStep === 3 && selectedPlatforms.length === 0) {
      setError('Please select at least one platform.');
      return;
    }
    setCurrentStep((s) => s + 1);
  };

  const handlePrevStep = () => {
    setError('');
    // If skipped step 1 initially, and going back from step 2, don't go to step 1
    if (currentStep === 2 && skippedStep1) {
      return;
    }
    setCurrentStep((s) => s - 1);
  };

  const handleOnboardingComplete = async () => {
    if (!selectedFollowers) {
      setError('Please select your subscriber count range.');
      return;
    }

    setSaving(true);
    setError('');

    try {
      const followersVal = FOLLOWER_TIERS.find(f => f.id === selectedFollowers)?.value || 1000;
      const cleanPlatforms = selectedPlatforms.filter(p => p !== 'ALL');

      // Get current provider choice from localStorage to sync to Supabase
      let localProvider = 'gemini';
      try {
        const stored = localStorage.getItem('viralspy_ai_config');
        if (stored) {
          const parsed = JSON.parse(stored);
          localProvider = parsed.provider || 'gemini';
        }
      } catch (e) {}

      await saveUserProfile({
        display_name: user?.user_metadata?.full_name || 'Creator',
        avatar_url: user?.user_metadata?.avatar_url || '',
        niches: selectedNiches,
        platforms: cleanPlatforms,
        subscriber_count: followersVal,
        ai_provider: localProvider,
        onboarded: true
      });

      await refreshUser();
      router.push('/dashboard');
    } catch (err) {
      console.error('Onboarding save error:', err);
      setError('Failed to save preferences. Please try again.');
      setSaving(false);
    }
  };

  const getStepName = (step: number) => {
    if (step === 1) return 'AI Provider';
    if (step === 2) return t('step1');
    if (step === 3) return t('step2');
    return t('step3');
  };

  if (loading || !user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#F7F5F2] text-[#6B7280] space-y-3">
        <Eye className="h-8 w-8 text-[#FF6B4A] animate-pulse" />
        <div className="text-xs font-mono tracking-widest uppercase animate-pulse">Loading Profile...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F7F5F2] text-[#1A1A1A] flex flex-col justify-between px-4 sm:px-6 relative overflow-hidden font-sans">
      {/* Background radial highlight */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-orange-400/5 rounded-full blur-[100px] pointer-events-none" />

      {/* Header */}
      <header className="max-w-4xl mx-auto w-full py-6 border-b border-gray-200 flex justify-between items-center z-10">
        <div className="text-sm font-bold tracking-widest font-mono uppercase text-[#1A1A1A]">
          VIRALSPY // ONBOARDING
        </div>
        <div className="text-[10px] font-mono text-gray-500 uppercase tracking-widest">
          {getStepName(currentStep)} // STEP 0{currentStep} OF 04
        </div>
      </header>

      {/* Main Form Container */}
      <main className="flex-grow flex items-center justify-center py-12 z-10">
        <div className="w-full max-w-[540px] bg-white border border-gray-200 rounded-2xl p-8 shadow-card space-y-6 overflow-hidden">
          
          {/* Progress dots at top */}
          <div className="flex justify-center space-x-2.5 pb-2">
            {[1, 2, 3, 4].map((s) => (
              <div
                key={s}
                className={`h-2.5 rounded-full transition-all duration-300 ${
                  currentStep === s 
                    ? 'w-8 bg-[#FF6B4A]' 
                    : s < currentStep 
                      ? 'w-2.5 bg-orange-200' 
                      : 'w-2.5 bg-gray-200'
                }`}
              />
            ))}
          </div>

          {error && (
            <div className="p-3.5 bg-red-50 border border-red-200 text-red-650 text-xs font-semibold rounded-xl flex items-center space-x-2 animate-shake">
              <AlertCircle className="h-4 w-4 text-red-500 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Sliding container */}
          <div className="overflow-hidden relative w-full">
            <div 
              className="flex transition-transform duration-500 cubic-bezier(0.16, 1, 0.3, 1)" 
              style={{ transform: `translateX(-${(currentStep - 1) * 100}%)`, width: '400%' }}
            >
              
              {/* STEP 1: AI Provider selection */}
              <div className="w-1/4 flex-shrink-0 pr-2 pl-1 space-y-5">
                <div className="space-y-1">
                  <h2 className="text-xl font-bold text-[#1A1A1A] tracking-tight">How should ViralSpy generate your briefs?</h2>
                  <p className="text-xs text-gray-500">You can change this anytime in Settings</p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {/* Card 1 — Gemini */}
                  <button
                    onClick={() => setSelProvider('gemini')}
                    className={`text-left p-4 rounded-xl border flex flex-col justify-between h-36 relative transition-all ${
                      selProvider === 'gemini'
                        ? 'border-[#FF6B4A] ring-2 ring-[#FF6B4A] bg-[#FF6B4A]/5 text-[#1A1A1A]'
                        : 'border-gray-200 hover:border-gray-300 bg-white text-gray-700'
                    }`}
                  >
                    <div>
                      <div className="flex justify-between items-center mb-1.5">
                        <span className="h-5 w-5 rounded-full bg-gradient-to-br from-blue-400 to-green-400 flex items-center justify-center text-[10px] font-bold text-white">G</span>
                        <span className="text-[8px] bg-orange-100 border border-orange-200 text-[#FF6B4A] px-1.5 py-0.5 rounded-full font-bold uppercase">Recommended</span>
                      </div>
                      <h3 className="text-xs font-bold uppercase text-gray-900">Gemini Flash</h3>
                      <p className="text-[10px] text-gray-400 mt-1 leading-normal">Free tier available. Fast and accurate.</p>
                    </div>
                    <div className="text-[9px] text-gray-500 italic mt-1 leading-none">Uses ViralSpy's API key — no setup needed</div>
                  </button>

                  {/* Card 2 — OpenAI */}
                  <button
                    onClick={() => {
                      setSelProvider('openai');
                      handleOpenGuide('openai');
                    }}
                    className={`text-left p-4 rounded-xl border flex flex-col justify-between h-36 relative transition-all ${
                      selProvider === 'openai'
                        ? 'border-[#FF6B4A] ring-2 ring-[#FF6B4A] bg-[#FF6B4A]/5 text-[#1A1A1A]'
                        : 'border-gray-200 hover:border-gray-300 bg-white text-gray-700'
                    }`}
                  >
                    <div>
                      <div className="flex justify-between items-center mb-1.5">
                        <span className="h-5 w-5 rounded-full bg-gray-955 flex items-center justify-center text-[9px] font-bold text-white">O</span>
                        <span className="text-[8px] bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded-full font-bold uppercase">Most Powerful</span>
                      </div>
                      <h3 className="text-xs font-bold uppercase text-gray-900">GPT-4o</h3>
                      <p className="text-[10px] text-gray-400 mt-1 leading-normal">Best brief quality. Requires your own key.</p>
                    </div>
                    <div className="text-[9px] text-gray-500 italic mt-1 leading-none">You'll need an OpenAI API key</div>
                  </button>

                  {/* Card 3 — Ollama */}
                  <button
                    onClick={() => {
                      setSelProvider('ollama');
                      handleOpenGuide('ollama');
                    }}
                    className={`text-left p-4 rounded-xl border flex flex-col justify-between h-36 relative transition-all ${
                      selProvider === 'ollama'
                        ? 'border-[#FF6B4A] ring-2 ring-[#FF6B4A] bg-[#FF6B4A]/5 text-[#1A1A1A]'
                        : 'border-gray-205 hover:border-gray-300 bg-white text-gray-700'
                    }`}
                  >
                    <div>
                      <div className="flex justify-between items-center mb-1.5">
                        <span className="h-5 w-5 rounded-full bg-green-500 flex items-center justify-center text-xs text-white">🦙</span>
                        <span className="text-[8px] bg-green-50 text-green-600 px-1.5 py-0.5 rounded-full font-bold uppercase">100% Private</span>
                      </div>
                      <h3 className="text-xs font-bold uppercase text-gray-900">Local AI</h3>
                      <p className="text-[10px] text-gray-400 mt-1 leading-normal">Runs on your machine. No API costs.</p>
                    </div>
                    <div className="text-[9px] text-gray-500 italic mt-1 leading-none">Requires Ollama installed locally</div>
                  </button>

                  {/* Card 4 — BYOK */}
                  <button
                    onClick={() => {
                      setSelProvider('byok');
                      handleOpenGuide('byok');
                    }}
                    className={`text-left p-4 rounded-xl border flex flex-col justify-between h-36 relative transition-all ${
                      selProvider === 'byok'
                        ? 'border-[#FF6B4A] ring-2 ring-[#FF6B4A] bg-[#FF6B4A]/5 text-[#1A1A1A]'
                        : 'border-gray-200 hover:border-gray-300 bg-white text-gray-700'
                    }`}
                  >
                    <div>
                      <div className="flex justify-between items-center mb-1.5">
                        <span className="h-5 w-5 rounded-full bg-amber-500 flex items-center justify-center text-[10px] text-white">🔑</span>
                        <span className="text-[8px] bg-amber-50 text-amber-600 px-1.5 py-0.5 rounded-full font-bold uppercase">Full Control</span>
                      </div>
                      <h3 className="text-xs font-bold uppercase text-gray-900">My Own Key</h3>
                      <p className="text-[10px] text-gray-400 mt-1 leading-normal">Use your own Gemini or OpenAI key.</p>
                    </div>
                    <div className="text-[9px] text-gray-500 italic mt-1 leading-none">Your key, your usage, your billing</div>
                  </button>

                </div>

                {/* Conditional fields based on provider */}
                <div className="animate-fade-in">
                  {selProvider === 'openai' && (
                    <div className="space-y-1 bg-gray-50 p-4 rounded-xl border border-gray-150">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-gray-550">Your OpenAI API Key</label>
                      <input
                        type="password"
                        value={openaiKey}
                        onChange={(e) => setOpenaiKey(e.target.value)}
                        className="w-full text-xs font-semibold px-3 py-2 bg-white rounded-lg border border-gray-200 focus:outline-none focus:border-[#FF6B4A]"
                        placeholder="sk-..."
                      />
                    </div>
                  )}

                  {selProvider === 'byok' && (
                    <div className="space-y-3 bg-gray-50 p-4 rounded-xl border border-gray-150">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold uppercase tracking-wider text-gray-550">Provider</label>
                        <div className="flex gap-2">
                          <button
                            onClick={() => setByokProvider('gemini')}
                            className={`flex-grow py-1.5 text-xs font-bold rounded-lg border text-center transition-all ${
                              byokProvider === 'gemini'
                                ? 'border-[#FF6B4A] bg-[#FF6B4A] text-white'
                                : 'border-gray-200 bg-white text-gray-600'
                            }`}
                          >
                            Gemini
                          </button>
                          <button
                            onClick={() => setByokProvider('openai')}
                            className={`flex-grow py-1.5 text-xs font-bold rounded-lg border text-center transition-all ${
                              byokProvider === 'openai'
                                ? 'border-[#FF6B4A] bg-[#FF6B4A] text-white'
                                : 'border-gray-200 bg-white text-gray-600'
                            }`}
                          >
                            OpenAI
                          </button>
                        </div>
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold uppercase tracking-wider text-gray-550">
                          {byokProvider === 'gemini' ? 'Gemini API Key' : 'OpenAI API Key'}
                        </label>
                        <input
                          type="password"
                          value={byokKey}
                          onChange={(e) => setByokKey(e.target.value)}
                          className="w-full text-xs font-semibold px-3 py-2 bg-white rounded-lg border border-gray-200 focus:outline-none focus:border-[#FF6B4A]"
                          placeholder="Paste API key here"
                        />
                      </div>
                    </div>
                  )}

                  {selProvider === 'ollama' && (
                    <div className="space-y-3 bg-gray-50 p-4 rounded-xl border border-gray-150">
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold uppercase tracking-wider text-gray-550">Ollama URL</label>
                          <input
                            type="text"
                            value={ollamaUrl}
                            onChange={(e) => setOllamaUrl(e.target.value)}
                            className="w-full text-xs font-semibold px-3 py-2 bg-white rounded-lg border border-gray-200 focus:outline-none focus:border-[#FF6B4A]"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold uppercase tracking-wider text-gray-550">Model</label>
                          <input
                            type="text"
                            value={ollamaModel}
                            onChange={(e) => setOllamaModel(e.target.value)}
                            className="w-full text-xs font-semibold px-3 py-2 bg-white rounded-lg border border-gray-200 focus:outline-none focus:border-[#FF6B4A]"
                          />
                        </div>
                      </div>
                      <a
                        href="https://ollama.com"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[10px] text-[#FF6B4A] hover:underline font-bold block mt-1"
                      >
                        Don't have Ollama? Install it at ollama.ai
                      </a>
                    </div>
                  )}
                </div>

                {/* Bottom Navigation */}
                <div className="flex flex-col items-center justify-center space-y-3.5 pt-2 border-t border-gray-100">
                  <button
                    onClick={handleSaveAIConfig}
                    className="flex items-center justify-center space-x-1.5 w-full py-3 bg-[#FF6B4A] hover:bg-[#ff5a33] text-white rounded-xl text-sm font-semibold tracking-wide transition-all hover:scale-[1.02] active:scale-[0.98]"
                  >
                    <span>Continue →</span>
                  </button>
                  <button
                    onClick={handleSkipAIConfig}
                    className="text-xs text-gray-400 hover:text-gray-600 transition-colors font-medium border-b border-dashed border-gray-300 hover:border-gray-500 pb-0.5"
                  >
                    Skip — use Gemini (default)
                  </button>
                </div>
              </div>

              {/* STEP 2: Niches selector (was step 1) */}
              <div className="w-1/4 flex-shrink-0 pr-2 pl-2 space-y-5">
                <div className="space-y-1">
                  <h2 className="text-xl font-bold text-[#1A1A1A] tracking-tight">{t('title')}</h2>
                  <p className="text-xs text-gray-505">{t('subtitle')}</p>
                </div>

                {/* note about configured provider */}
                {configuredProviderLabel && (
                  <div className="bg-orange-50/20 border border-orange-100 rounded-xl px-3.5 py-2.5 text-xs text-gray-650 flex items-center justify-between animate-fade-in shadow-[0_1px_2px_rgba(0,0,0,0.01)]">
                    <span className="flex items-center gap-1.5 font-medium">
                      <Cpu className="h-3.5 w-3.5 text-[#FF6B4A] shrink-0" />
                      <span>Using <strong className="text-gray-900 font-bold">{configuredProviderLabel}</strong> for briefs</span>
                    </span>
                    <button
                      onClick={() => {
                        setSkippedStep1(false);
                        setCurrentStep(1);
                      }}
                      className="text-[9px] text-[#FF6B4A] font-extrabold uppercase hover:underline"
                    >
                      Change
                    </button>
                  </div>
                )}

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 max-h-[290px] overflow-y-auto pr-1">
                  {NICHES.map((niche) => {
                    const isSelected = selectedNiches.includes(niche.id);
                    return (
                      <button
                        key={niche.id}
                        onClick={() => handleToggleNiche(niche.id)}
                        className={`text-center p-3.5 rounded-2xl border transition-all duration-200 flex flex-col items-center justify-center space-y-2 h-28 ${
                          isSelected
                            ? 'border-[#FF6B4A] bg-orange-50/50 text-[#1A1A1A]'
                            : 'border-gray-250 hover:border-gray-300 bg-white text-gray-750'
                        }`}
                      >
                        <span className="text-2xl">{niche.emoji}</span>
                        <div className="text-xs font-bold leading-tight">{niche.label}</div>
                        {isSelected && (
                          <div className="bg-[#FF6B4A] p-0.5 rounded-full text-white absolute top-2 right-2">
                            <Check className="h-3 w-3" />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>

                <div className="flex justify-between pt-4 border-t border-gray-100 space-x-3">
                  {!skippedStep1 && (
                    <button
                      onClick={handlePrevStep}
                      className="flex items-center space-x-1 px-4 py-3 bg-white border border-gray-200 hover:border-[#FF6B4A] hover:text-[#FF6B4A] text-gray-500 rounded-xl text-sm font-semibold transition-all"
                    >
                      <ArrowLeft className="h-4 w-4" />
                      <span>{t('back')}</span>
                    </button>
                  )}
                  <button
                    onClick={handleNextStep}
                    disabled={selectedNiches.length === 0}
                    className="flex-grow flex items-center justify-center space-x-1.5 py-3 bg-[#FF6B4A] hover:bg-[#ff5a33] text-white rounded-xl text-sm font-semibold tracking-wide transition-all disabled:opacity-30 disabled:pointer-events-none hover:scale-[1.02] active:scale-[0.98]"
                  >
                    <span>{t('next')}</span>
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* STEP 3: Platforms selector (was step 2) */}
              <div className="w-1/4 flex-shrink-0 pr-2 pl-2 space-y-5">
                <div className="space-y-1">
                  <h2 className="text-xl font-bold text-[#1A1A1A] tracking-tight">{t('step2')}</h2>
                  <p className="text-xs text-gray-500">Pick all active distribution hubs.</p>
                </div>

                <div className="grid grid-cols-1 gap-2.5 max-h-[290px] overflow-y-auto pr-1">
                  {PLATFORMS.map((platform) => {
                    const isSelected = selectedPlatforms.includes(platform.id);
                    return (
                      <button
                        key={platform.id}
                        onClick={() => handleTogglePlatform(platform.id)}
                        className={`text-left p-4 rounded-2xl border transition-all duration-200 flex justify-between items-center ${
                          isSelected
                            ? 'border-[#FF6B4A] bg-orange-50/50 text-[#1A1A1A]'
                            : 'border-gray-250 hover:border-gray-350 bg-white text-gray-750'
                        }`}
                      >
                        <span className="text-sm font-bold tracking-wide">{platform.label}</span>
                        <div className="flex items-center space-x-2">
                          {isSelected && (
                            <span className="bg-[#FF6B4A] text-white p-0.5 rounded-full">
                              <Check className="h-3.5 w-3.5" />
                            </span>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>

                <div className="flex justify-between pt-4 border-t border-gray-100 space-x-3">
                  <button
                    onClick={handlePrevStep}
                    className="flex items-center space-x-1 px-4 py-3 bg-white border border-gray-200 hover:border-[#FF6B4A] hover:text-[#FF6B4A] text-gray-500 rounded-xl text-sm font-semibold transition-all"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    <span>{t('back')}</span>
                  </button>
                  <button
                    onClick={handleNextStep}
                    disabled={selectedPlatforms.length === 0}
                    className="flex-grow flex items-center justify-center space-x-1.5 py-3 bg-[#FF6B4A] hover:bg-[#ff5a33] text-white rounded-xl text-sm font-semibold tracking-wide transition-all disabled:opacity-30 disabled:pointer-events-none hover:scale-[1.02] active:scale-[0.98]"
                  >
                    <span>{t('next')}</span>
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* STEP 4: Followers count (was step 3) */}
              <div className="w-1/4 flex-shrink-0 pr-1 pl-2 space-y-5">
                <div className="space-y-1">
                  <h2 className="text-xl font-bold text-[#1A1A1A] tracking-tight">{t('step3')}</h2>
                  <p className="text-xs text-gray-500">Helps calibrate reach calculations and strategist hooks.</p>
                </div>

                <div className="grid grid-cols-1 gap-2.5">
                  {FOLLOWER_TIERS.map((tier) => {
                    const isSelected = selectedFollowers === tier.id;
                    return (
                      <button
                        key={tier.id}
                        onClick={() => setSelectedFollowers(tier.id)}
                        className={`text-left p-4 rounded-2xl border transition-all duration-200 flex justify-between items-center ${
                          isSelected
                            ? 'border-[#FF6B4A] bg-orange-50/50 text-[#1A1A1A]'
                            : 'border-gray-250 hover:border-gray-350 bg-white text-gray-750'
                        }`}
                      >
                        <div className="space-y-0.5">
                          <div className="text-sm font-bold">{tier.label}</div>
                          <div className="text-xs text-gray-500">{tier.desc}</div>
                        </div>
                        {isSelected && (
                          <div className="bg-[#FF6B4A] p-0.5 rounded-full text-white">
                            <Check className="h-3.5 w-3.5" />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>

                <div className="flex justify-between pt-4 border-t border-gray-100 space-x-3">
                  <button
                    onClick={handlePrevStep}
                    className="flex items-center space-x-1 px-4 py-3 bg-white border border-gray-200 hover:border-[#FF6B4A] hover:text-[#FF6B4A] text-gray-500 rounded-xl text-sm font-semibold transition-all"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    <span>{t('back')}</span>
                  </button>
                  <button
                    onClick={handleOnboardingComplete}
                    disabled={saving || !selectedFollowers}
                    className="flex-grow flex items-center justify-center space-x-1.5 py-3 bg-[#FF6B4A] hover:bg-[#ff5a33] text-white rounded-xl text-sm font-semibold tracking-wide transition-all disabled:opacity-30 disabled:pointer-events-none hover:scale-[1.02] active:scale-[0.98]"
                  >
                    <Sparkles className="h-4 w-4 text-white animate-pulse" />
                    <span>{saving ? 'Completing...' : t('finish')}</span>
                  </button>
                </div>
              </div>

            </div>
          </div>

        </div>
      </main>

      {/* Footer */}
      <footer className="w-full max-w-7xl mx-auto py-6 border-t border-gray-200 flex items-center justify-between text-xs text-gray-550 z-10">
        <div>© 2026 ViralSpy.</div>
        <div className="text-[#FF6B4A] italic">Quietly Rise</div>
      </footer>

      {/* Setup Guide Modal */}
      <ProviderSetupGuide
        provider={guideProvider}
        isOpen={isGuideOpen}
        onClose={() => setIsGuideOpen(false)}
        onComplete={handleModalComplete}
        initialConfig={{
          byokKey,
          byokProvider,
          openaiKey,
          ollamaUrl,
          ollamaModel
        }}
      />
    </div>
  );
}
