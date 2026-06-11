'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../components/AuthProvider';
import { saveUserProfile } from '../../lib/supabase';
import { NicheType } from '../../types';
import { Check, ArrowRight, ArrowLeft, Eye, Sparkles, AlertCircle } from 'lucide-react';

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

export default function OnboardingPage() {
  const router = useRouter();
  const { user, loading, refreshUser } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  
  // Selection States
  const [selectedNiches, setSelectedNiches] = useState<NicheType[]>([]);
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
  const [selectedFollowers, setSelectedFollowers] = useState<string>('');
  
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

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

  const handleNextStep = () => {
    setError('');
    if (currentStep === 1 && selectedNiches.length === 0) {
      setError('Please select at least one niche.');
      return;
    }
    if (currentStep === 2 && selectedPlatforms.length === 0) {
      setError('Please select at least one platform.');
      return;
    }
    setCurrentStep((s) => s + 1);
  };

  const handlePrevStep = () => {
    setError('');
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

      await saveUserProfile({
        display_name: user?.user_metadata?.full_name || 'Creator',
        avatar_url: user?.user_metadata?.avatar_url || '',
        niches: selectedNiches,
        platforms: cleanPlatforms,
        subscriber_count: followersVal,
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
          STEP 0{currentStep} OF 03
        </div>
      </header>

      {/* Main Form Container */}
      <main className="flex-grow flex items-center justify-center py-12 z-10">
        <div className="w-full max-w-[520px] bg-white border border-gray-200 rounded-2xl p-8 shadow-card space-y-6 overflow-hidden">
          
          {/* Progress dots at top */}
          <div className="flex justify-center space-x-2.5 pb-2">
            {[1, 2, 3].map((s) => (
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
              style={{ transform: `translateX(-${(currentStep - 1) * 100}%)`, width: '300%' }}
            >
              {/* STEP 1: Niches selector (3x5 grid of cards with emoji + label) */}
              <div className="w-1/3 flex-shrink-0 pr-1 space-y-5">
                <div className="space-y-1">
                  <h2 className="text-xl font-bold text-[#1A1A1A] tracking-tight">What do you create?</h2>
                  <p className="text-xs text-gray-500">Select 1 to 3 niches to compile your intelligence feeds.</p>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 max-h-[340px] overflow-y-auto pr-1">
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

                <div className="flex justify-end pt-4 border-t border-gray-100">
                  <button
                    onClick={handleNextStep}
                    disabled={selectedNiches.length === 0}
                    className="flex items-center justify-center space-x-1.5 w-full py-3 bg-[#FF6B4A] hover:bg-[#ff5a33] text-white rounded-xl text-sm font-semibold tracking-wide transition-all disabled:opacity-30 disabled:pointer-events-none hover:scale-[1.02] active:scale-[0.98]"
                  >
                    <span>Continue</span>
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* STEP 2: Platforms selector */}
              <div className="w-1/3 flex-shrink-0 px-2 space-y-5">
                <div className="space-y-1">
                  <h2 className="text-xl font-bold text-[#1A1A1A] tracking-tight">Which platforms do you post on?</h2>
                  <p className="text-xs text-gray-500">Pick all active distribution hubs.</p>
                </div>

                <div className="grid grid-cols-1 gap-2.5 max-h-[340px] overflow-y-auto pr-1">
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
                    <span>Back</span>
                  </button>
                  <button
                    onClick={handleNextStep}
                    disabled={selectedPlatforms.length === 0}
                    className="flex-grow flex items-center justify-center space-x-1.5 py-3 bg-[#FF6B4A] hover:bg-[#ff5a33] text-white rounded-xl text-sm font-semibold tracking-wide transition-all disabled:opacity-30 disabled:pointer-events-none hover:scale-[1.02] active:scale-[0.98]"
                  >
                    <span>Continue</span>
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* STEP 3: Followers count */}
              <div className="w-1/3 flex-shrink-0 pl-1 space-y-5">
                <div className="space-y-1">
                  <h2 className="text-xl font-bold text-[#1A1A1A] tracking-tight">How many followers?</h2>
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
                    <span>Back</span>
                  </button>
                  <button
                    onClick={handleOnboardingComplete}
                    disabled={saving || !selectedFollowers}
                    className="flex-grow flex items-center justify-center space-x-1.5 py-3 bg-[#FF6B4A] hover:bg-[#ff5a33] text-white rounded-xl text-sm font-semibold tracking-wide transition-all disabled:opacity-30 disabled:pointer-events-none hover:scale-[1.02] active:scale-[0.98]"
                  >
                    <Sparkles className="h-4 w-4 text-white animate-pulse" />
                    <span>{saving ? 'Completing...' : 'Access Feed'}</span>
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
    </div>
  );
}
