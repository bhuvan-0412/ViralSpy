'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../components/AuthProvider';
import { saveUserProfile } from '../../../lib/supabase';
import { NicheType } from '../../../types';
import { Check, ArrowRight, ArrowLeft, Eye, EyeOff, Sparkles, AlertCircle, Cpu, Key, Database, Globe } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
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

type AIProvider = 'ollama' | 'byok';

export default function OnboardingPage() {
  const router = useRouter();
  const { user, loading, refreshUser } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const t = useTranslations('onboarding');
  const locale = useLocale();
  
  // Skip logic states
  const [skippedStep1, setSkippedStep1] = useState(false);
  const [configuredProviderLabel, setConfiguredProviderLabel] = useState('');

  // Step 1 Selection States (AI Provider)
  const [provider, setProvider] = useState<AIProvider>('ollama');
  const [selectedCard, setSelectedCard] = useState<'ollama' | 'groq' | 'gemini' | 'openai' | 'custom'>('ollama');
  const [byokKey, setByokKey] = useState('');
  const [byokProvider, setByokProvider] = useState<'gemini' | 'openai' | 'custom'>('openai');
  const [byokBaseUrl, setByokBaseUrl] = useState('https://api.openai.com/v1');
  const [byokModel, setByokModel] = useState('gpt-4o');
  const [ollamaUrl, setOllamaUrl] = useState('http://localhost:11434');
  const [ollamaModel, setOllamaModel] = useState('llama3');

  // UI States for inline key testing
  const [showKey, setShowKey] = useState(false);
  const [testingKey, setTestingKey] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  // Guide Modal States
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const [guideProvider, setGuideProvider] = useState<GuideProvider>('ollama');

  const handleOpenGuide = (prov: GuideProvider) => {
    setGuideProvider(prov);
    setIsGuideOpen(true);
  };

  const handleTestAPI = async () => {
    setTestingKey(true);
    setTestResult(null);
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
      setTestResult({
        success: data.valid,
        message: data.message
      });
    } catch (e: any) {
      setTestResult({
        success: false,
        message: e.message || 'Verification failed.'
      });
    } finally {
      setTestingKey(false);
    }
  };

  const handleSelectCard = (card: 'ollama' | 'groq' | 'gemini' | 'openai' | 'custom') => {
    setSelectedCard(card);
    setTestResult(null);
    if (card === 'ollama') {
      setProvider('ollama');
    } else {
      setProvider('byok');
      if (card === 'groq') {
        setByokProvider('openai');
        setByokBaseUrl('https://api.groq.com/openai/v1');
        setByokModel('llama-3.3-70b-versatile');
      } else if (card === 'gemini') {
        setByokProvider('gemini');
        setByokBaseUrl('');
        setByokModel('gemini-2.0-flash');
      } else if (card === 'openai') {
        setByokProvider('openai');
        setByokBaseUrl('https://api.openai.com/v1');
        setByokModel('gpt-4o');
      } else if (card === 'custom') {
        setByokProvider('custom');
        setByokBaseUrl('');
        setByokModel('');
      }
    }
  };

  const handleModalComplete = (newConfig: any) => {
    const aiConfig = {
      provider: newConfig.provider,
      byokProvider: newConfig.byokProvider || 'openai',
      byokKey: newConfig.byokKey || '',
      byokBaseUrl: newConfig.byokBaseUrl || '',
      byokModel: newConfig.byokModel || '',
      ollamaUrl: newConfig.ollamaUrl || 'http://localhost:11434',
      ollamaModel: newConfig.ollamaModel || 'llama3'
    };
    localStorage.setItem('viralspy_ai_config', JSON.stringify(aiConfig));

    setProvider(newConfig.provider);
    if (newConfig.byokKey !== undefined) setByokKey(newConfig.byokKey);
    if (newConfig.byokProvider !== undefined) setByokProvider(newConfig.byokProvider);
    if (newConfig.byokBaseUrl !== undefined) setByokBaseUrl(newConfig.byokBaseUrl);
    if (newConfig.byokModel !== undefined) setByokModel(newConfig.byokModel);
    if (newConfig.ollamaUrl !== undefined) setOllamaUrl(newConfig.ollamaUrl);
    if (newConfig.ollamaModel !== undefined) setOllamaModel(newConfig.ollamaModel);

    if (newConfig.provider === 'ollama') {
      setSelectedCard('ollama');
    } else {
      if (newConfig.byokProvider === 'gemini') {
        setSelectedCard('gemini');
      } else if (newConfig.byokProvider === 'custom') {
        setSelectedCard('custom');
      } else {
        if (newConfig.byokBaseUrl === 'https://api.groq.com/openai/v1') {
          setSelectedCard('groq');
        } else if (newConfig.byokBaseUrl === 'https://api.openai.com/v1') {
          setSelectedCard('openai');
        } else {
          setSelectedCard('custom');
        }
      }
    }

    const labels: Record<string, string> = {
      ollama: 'Local AI',
      byok: newConfig.byokProvider === 'gemini' ? 'Gemini' : newConfig.byokProvider === 'custom' ? 'Custom API' : newConfig.byokModel === 'llama-3.3-70b-versatile' ? 'Groq' : 'GPT-4o'
    };
    setConfiguredProviderLabel(labels[newConfig.provider] || 'Local AI');
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
              ollama: 'Local AI',
              byok: parsed.byokProvider === 'gemini' ? 'Gemini' : parsed.byokProvider === 'custom' ? 'Custom API' : parsed.byokModel === 'llama-3.3-70b-versatile' ? 'Groq' : 'GPT-4o'
            };
            setConfiguredProviderLabel(labels[parsed.provider] || 'Local AI');
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
    if (provider === 'byok') {
      if (!byokKey) {
        setError('Please provide your API key.');
        return;
      }
      if (byokProvider === 'custom' && !byokBaseUrl) {
        setError('Please provide a Base URL for your custom API.');
        return;
      }
    }

    const aiConfig = {
      provider,
      byokProvider,
      byokKey: provider === 'byok' ? byokKey : '',
      byokBaseUrl: provider === 'byok' ? byokBaseUrl : '',
      byokModel: provider === 'byok' ? byokModel : '',
      ollamaUrl: provider === 'ollama' ? ollamaUrl : 'http://localhost:11434',
      ollamaModel: provider === 'ollama' ? ollamaModel : 'llama3'
    };

    localStorage.setItem('viralspy_ai_config', JSON.stringify(aiConfig));
    
    const labels: Record<string, string> = {
      ollama: 'Local AI',
      byok: byokProvider === 'gemini' ? 'Gemini' : byokProvider === 'custom' ? 'Custom API' : selectedCard === 'groq' ? 'Groq' : 'GPT-4o'
    };
    setConfiguredProviderLabel(labels[provider] || 'Local AI');
    setCurrentStep(2);
  };

  const handleSkipAIConfig = () => {
    const aiConfig = {
      provider: 'ollama',
      byokProvider: 'openai',
      byokKey: '',
      byokBaseUrl: 'https://api.openai.com/v1',
      byokModel: '',
      ollamaUrl: 'http://localhost:11434',
      ollamaModel: 'llama3'
    };
    localStorage.setItem('viralspy_ai_config', JSON.stringify(aiConfig));
    setConfiguredProviderLabel('Local AI');
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
      let localProvider = 'ollama';
      try {
        const stored = localStorage.getItem('viralspy_ai_config');
        if (stored) {
          const parsed = JSON.parse(stored);
          localProvider = parsed.provider || 'ollama';
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

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[300px] overflow-y-auto pr-1">
                  {/* Card 1 — Ollama */}
                  <button
                    type="button"
                    onClick={() => handleSelectCard('ollama')}
                    className={`text-left p-4 rounded-xl border flex flex-col justify-between h-36 relative transition-all ${
                      selectedCard === 'ollama'
                        ? 'border-[#FF6B4A] ring-2 ring-[#FF6B4A] bg-[#FF6B4A]/5 text-[#1A1A1A]'
                        : 'border-gray-200 hover:border-gray-300 bg-white text-gray-700'
                    }`}
                  >
                    <div>
                      <div className="flex justify-between items-center mb-1.5">
                        <span className="h-6 w-6 rounded-full bg-green-550 flex items-center justify-center text-xs">🦙</span>
                        <span className="text-[8px] bg-green-50 text-green-700 px-1.5 py-0.5 rounded-full font-bold uppercase">100% Free & Private</span>
                      </div>
                      <h3 className="text-xs font-bold uppercase text-gray-900">Local AI</h3>
                      <p className="text-[10px] text-gray-400 mt-1 leading-normal">Runs on your machine. No API costs.</p>
                    </div>
                    <div className="text-[9px] text-[#FF6B4A] font-bold mt-1">Pre-selected default</div>
                  </button>

                  {/* Card 2 — Groq */}
                  <button
                    type="button"
                    onClick={() => handleSelectCard('groq')}
                    className={`text-left p-4 rounded-xl border flex flex-col justify-between h-36 relative transition-all ${
                      selectedCard === 'groq'
                        ? 'border-[#FF6B4A] ring-2 ring-[#FF6B4A] bg-[#FF6B4A]/5 text-[#1A1A1A]'
                        : 'border-gray-200 hover:border-gray-300 bg-white text-gray-700'
                    }`}
                  >
                    <div>
                      <div className="flex justify-between items-center mb-1.5">
                        <span className="h-6 w-6 rounded-full bg-purple-500 flex items-center justify-center text-xs text-white">⚡</span>
                        <span className="text-[8px] bg-purple-50 text-purple-700 px-1.5 py-0.5 rounded-full font-bold uppercase">Free Tier</span>
                      </div>
                      <h3 className="text-xs font-bold uppercase text-gray-900">Groq (Fast & Free)</h3>
                      <p className="text-[10px] text-gray-400 mt-1 leading-normal">Fastest AI inference. Free API key.</p>
                    </div>
                    <div className="text-[9px] text-gray-500 italic mt-1 leading-none">Free key required</div>
                  </button>

                  {/* Card 3 — Gemini */}
                  <button
                    type="button"
                    onClick={() => handleSelectCard('gemini')}
                    className={`text-left p-4 rounded-xl border flex flex-col justify-between h-36 relative transition-all ${
                      selectedCard === 'gemini'
                        ? 'border-[#FF6B4A] ring-2 ring-[#FF6B4A] bg-[#FF6B4A]/5 text-[#1A1A1A]'
                        : 'border-gray-200 hover:border-gray-300 bg-white text-gray-700'
                    }`}
                  >
                    <div>
                      <div className="flex justify-between items-center mb-1.5">
                        <span className="h-6 w-6 rounded-full bg-blue-500 flex items-center justify-center text-[10px] font-bold text-white">G</span>
                        <span className="text-[8px] bg-blue-50 text-blue-655 px-1.5 py-0.5 rounded-full font-bold uppercase">Free Tier</span>
                      </div>
                      <h3 className="text-xs font-bold uppercase text-gray-900">Gemini</h3>
                      <p className="text-[10px] text-gray-400 mt-1 leading-normal">Google's AI. Free quota available.</p>
                    </div>
                    <div className="text-[9px] text-gray-500 italic mt-1 leading-none">Free key available</div>
                  </button>

                  {/* Card 4 — OpenAI */}
                  <button
                    type="button"
                    onClick={() => handleSelectCard('openai')}
                    className={`text-left p-4 rounded-xl border flex flex-col justify-between h-36 relative transition-all ${
                      selectedCard === 'openai'
                        ? 'border-[#FF6B4A] ring-2 ring-[#FF6B4A] bg-[#FF6B4A]/5 text-[#1A1A1A]'
                        : 'border-gray-200 hover:border-gray-300 bg-white text-gray-700'
                    }`}
                  >
                    <div>
                      <div className="flex justify-between items-center mb-1.5">
                        <span className="h-6 w-6 rounded-full bg-gray-900 flex items-center justify-center text-[10px] font-bold text-white">O</span>
                        <span className="text-[8px] bg-orange-50 text-[#FF6B4A] px-1.5 py-0.5 rounded-full font-bold uppercase">Pay per use</span>
                      </div>
                      <h3 className="text-xs font-bold uppercase text-gray-900">GPT-4o</h3>
                      <p className="text-[10px] text-gray-400 mt-1 leading-normal">Most capable. ~₹0.80 per brief.</p>
                    </div>
                    <div className="text-[9px] text-gray-500 italic mt-1 leading-none">Requires OpenAI key</div>
                  </button>

                  {/* Card 5 — Custom API */}
                  <button
                    type="button"
                    onClick={() => handleSelectCard('custom')}
                    className={`text-left p-4 rounded-xl border flex flex-col justify-between h-36 relative transition-all ${
                      selectedCard === 'custom'
                        ? 'border-[#FF6B4A] ring-2 ring-[#FF6B4A] bg-[#FF6B4A]/5 text-[#1A1A1A]'
                        : 'border-gray-200 hover:border-gray-300 bg-white text-gray-700'
                    }`}
                  >
                    <div>
                      <div className="flex justify-between items-center mb-1.5">
                        <span className="h-6 w-6 rounded-full bg-gray-500 flex items-center justify-center text-xs text-white">🔧</span>
                        <span className="text-[8px] bg-gray-50 text-gray-650 px-1.5 py-0.5 rounded-full font-bold uppercase">Any provider</span>
                      </div>
                      <h3 className="text-xs font-bold uppercase text-gray-900">Custom API</h3>
                      <p className="text-[10px] text-gray-400 mt-1 leading-normal">Any OpenAI-compatible API endpoint.</p>
                    </div>
                    <div className="text-[9px] text-gray-500 italic mt-1 leading-none">Enter custom URL & model</div>
                  </button>
                </div>

                {/* Conditional fields based on provider */}
                <div className="animate-fade-in space-y-3">
                  {provider === 'ollama' && (
                    <div className="space-y-3 bg-gray-50 p-4 rounded-xl border border-gray-150">
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold uppercase tracking-wider text-gray-555">Ollama URL</label>
                          <input
                            type="text"
                            value={ollamaUrl}
                            onChange={(e) => setOllamaUrl(e.target.value)}
                            className="w-full text-xs font-semibold px-3 py-2 bg-white rounded-lg border border-gray-200 focus:outline-none focus:border-[#FF6B4A]"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold uppercase tracking-wider text-gray-555">Model</label>
                          <input
                            type="text"
                            value={ollamaModel}
                            onChange={(e) => setOllamaModel(e.target.value)}
                            className="w-full text-xs font-semibold px-3 py-2 bg-white rounded-lg border border-gray-200 focus:outline-none focus:border-[#FF6B4A]"
                          />
                        </div>
                      </div>
                      
                      <a 
                        href={locale === 'en' ? '/setup' : `/${locale}/setup`}
                        target="_blank"
                        className="flex items-center gap-2 text-[#FF6B4A] hover:underline text-sm mt-3"
                      >
                        🆕 First time? Follow our easy setup guide →
                      </a>

                      <div className="flex justify-between items-center mt-1 pt-2 border-t border-gray-150/50">
                        <a
                          href="https://ollama.com"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[10px] text-[#FF6B4A] hover:underline font-bold block"
                        >
                          Don't have Ollama? Install it at ollama.ai
                        </a>
                        <button
                          type="button"
                          onClick={() => handleOpenGuide('ollama')}
                          className="text-[9px] text-[#FF6B4A] hover:underline font-extrabold uppercase"
                        >
                          Setup Guide
                        </button>
                      </div>
                    </div>
                  )}

                  {provider === 'byok' && (
                    <div className="space-y-3 bg-gray-50 p-4 rounded-xl border border-gray-150">
                      
                      {selectedCard === 'custom' && (
                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold uppercase tracking-wider text-gray-555">Base URL</label>
                            <input
                              type="text"
                              value={byokBaseUrl}
                              onChange={(e) => setByokBaseUrl(e.target.value)}
                              className="w-full text-xs font-semibold px-3 py-2 bg-white rounded-lg border border-gray-200 focus:outline-none focus:border-[#FF6B4A]"
                              placeholder="https://api.yourprovider.com/v1"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold uppercase tracking-wider text-gray-555">Model Name</label>
                            <input
                              type="text"
                              value={byokModel}
                              onChange={(e) => setByokModel(e.target.value)}
                              className="w-full text-xs font-semibold px-3 py-2 bg-white rounded-lg border border-gray-200 focus:outline-none focus:border-[#FF6B4A]"
                              placeholder="e.g. gpt-4o"
                            />
                          </div>
                        </div>
                      )}

                      <div className="space-y-1">
                        <label className="text-[10px] font-bold uppercase tracking-wider text-gray-550">API Key</label>
                        <div className="relative">
                          <input
                            type={showKey ? 'text' : 'password'}
                            value={byokKey}
                            onChange={(e) => setByokKey(e.target.value)}
                            className="w-full text-xs font-semibold pl-3 pr-10 py-2 bg-white rounded-lg border border-gray-200 focus:outline-none focus:border-[#FF6B4A]"
                            placeholder="Paste your API key here"
                          />
                          <button
                            type="button"
                            onClick={() => setShowKey(!showKey)}
                            className="absolute right-3.5 top-2.5 text-gray-400 hover:text-gray-700"
                          >
                            {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>
                      </div>

                      {/* API Key Links */}
                      <div className="flex justify-between items-center mt-1">
                        <div>
                          {selectedCard === 'groq' && (
                            <a
                              href="https://console.groq.com/keys"
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[10px] text-[#FF6B4A] hover:underline font-bold block"
                            >
                              Get Groq API key (FREE) →
                            </a>
                          )}
                          {selectedCard === 'gemini' && (
                            <a
                              href="https://aistudio.google.com/app/apikey"
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[10px] text-[#FF6B4A] hover:underline font-bold block"
                            >
                              Get Gemini API key →
                            </a>
                          )}
                          {selectedCard === 'openai' && (
                            <a
                              href="https://platform.openai.com/api-keys"
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[10px] text-[#FF6B4A] hover:underline font-bold block"
                            >
                              Get OpenAI API key →
                            </a>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() => handleOpenGuide('byok')}
                          className="text-[9px] text-[#FF6B4A] hover:underline font-extrabold uppercase ml-auto"
                        >
                          Setup Guide
                        </button>
                      </div>

                      {/* Test Connection Button */}
                      <div className="flex items-center space-x-2 pt-1 border-t border-gray-150/50">
                        <button
                          type="button"
                          onClick={handleTestAPI}
                          disabled={testingKey || !byokKey}
                          className="px-3 py-1.5 bg-gray-900 hover:bg-gray-800 text-white text-[10px] font-bold rounded-lg transition-all disabled:opacity-60"
                        >
                          {testingKey ? 'Testing...' : 'Test API'}
                        </button>
                        {testResult && (
                          <span className={`text-[10px] font-semibold ${testResult.success ? 'text-green-650' : 'text-red-500'}`}>
                            {testResult.success ? '✓' : '✗'} {testResult.message}
                          </span>
                        )}
                      </div>

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
                    Skip — use Local AI (default)
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
      </footer>

      {/* Setup Guide Modal */}
      <ProviderSetupGuide
        provider={guideProvider as 'ollama' | 'byok'}
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
