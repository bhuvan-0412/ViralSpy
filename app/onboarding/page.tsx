'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../components/AuthProvider';
import { saveUserProfile } from '../../lib/supabase';
import { NicheType } from '../../types';
import { Check, ArrowRight, ArrowLeft, Eye, Sparkles } from 'lucide-react';

const NICHES: { id: NicheType; label: string; desc: string }[] = [
  { id: 'fitness', label: 'Fitness & Health', desc: 'Workouts, nutrition, physical metrics' },
  { id: 'food', label: 'Food & Cooking', desc: 'Recipes, meal preps, viral taste tests' },
  { id: 'finance', label: 'Finance & Money', desc: 'Investing, saving hacks, money ideas' },
  { id: 'fashion', label: 'Fashion & Style', desc: 'Outfits, hauls, quiet luxury' },
  { id: 'beauty', label: 'Beauty & Skincare', desc: 'GRWM, skincare reviews, transitions' },
  { id: 'tech', label: 'Tech & AI', desc: 'SaaS code, LLMs, automation side hustles' },
  { id: 'gaming', label: 'Gaming', desc: 'Setup tours, walkthroughs, clip edits' },
  { id: 'travel', label: 'Travel', desc: 'Points hacking, itineraries,POV tours' },
  { id: 'education', label: 'Education', desc: 'Productivity tips, visual explanations' },
  { id: 'comedy', label: 'Comedy', desc: 'Skits, reaction commentary, humor' }
];

const PLATFORMS = [
  { id: 'YOUTUBE', label: 'YouTube' },
  { id: 'INSTAGRAM', label: 'Instagram' },
  { id: 'REDDIT', label: 'Reddit' },
  { id: 'X', label: 'X' },
  { id: 'ALL', label: 'All Platforms' }
];

const FOLLOWER_TIERS = [
  { id: 'tier_1', label: '< 1K', value: 500, desc: 'Starting out' },
  { id: 'tier_2', label: '1K – 10K', value: 5000, desc: 'Micro creator' },
  { id: 'tier_3', label: '10K – 100K', value: 50000, desc: 'Growing community' },
  { id: 'tier_4', label: '100K +', value: 250000, desc: 'Established brand' }
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
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-950 text-gray-500 space-y-3">
        <Eye className="h-8 w-8 text-[#7F77DD] animate-pulse" />
        <div className="text-xs font-mono tracking-widest uppercase animate-pulse">Loading Profile...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 flex flex-col justify-between px-4 sm:px-6 relative overflow-hidden">
      {/* Background radial highlight */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-purple-900/5 rounded-full blur-[100px] pointer-events-none" />

      {/* Header */}
      <header className="max-w-4xl mx-auto w-full py-6 border-b border-gray-900 flex justify-between items-center z-10">
        <div className="text-sm font-bold tracking-widest font-mono uppercase text-white">
          VIRALSPY // ONBOARDING
        </div>
        <div className="text-[10px] font-mono text-gray-500 uppercase tracking-widest">
          STEP 0{currentStep} OF 03
        </div>
      </header>

      {/* Main Form */}
      <main className="flex-grow flex items-center justify-center py-12 z-10">
        <div className="w-full max-w-[485px] bg-gray-900 border border-gray-800 rounded-2xl p-8 shadow-2xl space-y-6">
          
          {error && (
            <div className="p-4 bg-red-950/20 border border-red-500/30 text-red-400 text-xs font-mono rounded-xl text-center uppercase tracking-wide">
              {error}
            </div>
          )}

          {/* STEP 1: Niches selector */}
          {currentStep === 1 && (
            <div className="space-y-5">
              <div className="space-y-1">
                <h2 className="text-xl font-bold text-white tracking-tight">What do you create?</h2>
                <p className="text-xs text-gray-500">Select 1 to 3 niches to compile your intelligence feeds.</p>
              </div>

              <div className="grid grid-cols-1 gap-2 max-h-[300px] overflow-y-auto pr-1">
                {NICHES.map((niche) => {
                  const isSelected = selectedNiches.includes(niche.id);
                  return (
                    <button
                      key={niche.id}
                      onClick={() => handleToggleNiche(niche.id)}
                      className={`text-left p-3.5 rounded-xl border transition-all duration-200 flex justify-between items-center ${
                        isSelected
                          ? 'border-[#7F77DD] bg-[#7F77DD]/10 text-white'
                          : 'border-gray-800 hover:border-gray-700 bg-gray-900/50 text-gray-300'
                      }`}
                    >
                      <div className="space-y-0.5">
                        <div className="text-xs font-bold font-mono uppercase tracking-wider">{niche.label}</div>
                        <div className="text-[10px] text-gray-500">{niche.desc}</div>
                      </div>
                      {isSelected && (
                        <div className="bg-[#7F77DD] p-1 rounded-full text-white">
                          <Check className="h-3 w-3" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>

              <div className="flex justify-end pt-4 border-t border-gray-800">
                <button
                  onClick={handleNextStep}
                  disabled={selectedNiches.length === 0}
                  className="flex items-center space-x-1 px-4 py-2.5 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-xs font-mono font-bold uppercase tracking-wider transition-all disabled:opacity-30 disabled:pointer-events-none"
                >
                  <span>Continue</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: Platforms selector */}
          {currentStep === 2 && (
            <div className="space-y-5">
              <div className="space-y-1">
                <h2 className="text-xl font-bold text-white tracking-tight">Which platforms do you post on?</h2>
                <p className="text-xs text-gray-500">Pick all active distribution hubs.</p>
              </div>

              <div className="grid grid-cols-1 gap-2.5">
                {PLATFORMS.map((platform) => {
                  const isSelected = selectedPlatforms.includes(platform.id);
                  return (
                    <button
                      key={platform.id}
                      onClick={() => handleTogglePlatform(platform.id)}
                      className={`text-left p-4 rounded-xl border transition-all duration-200 flex justify-between items-center ${
                        isSelected
                          ? 'border-[#7F77DD] bg-[#7F77DD]/10 text-white'
                          : 'border-gray-800 hover:border-gray-700 bg-gray-900/50 text-gray-300'
                      }`}
                    >
                      <span className="text-xs font-bold font-mono uppercase tracking-wider">{platform.label}</span>
                      {isSelected && (
                        <div className="bg-[#7F77DD] p-1 rounded-full text-white">
                          <Check className="h-3 w-3" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>

              <div className="flex justify-between pt-4 border-t border-gray-800">
                <button
                  onClick={handlePrevStep}
                  className="flex items-center space-x-1 px-3 py-2 bg-gray-900 border border-gray-800 hover:border-gray-700 text-gray-400 hover:text-white rounded-lg text-xs font-mono font-bold uppercase tracking-wider transition-all"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  <span>Back</span>
                </button>
                <button
                  onClick={handleNextStep}
                  disabled={selectedPlatforms.length === 0}
                  className="flex items-center space-x-1 px-4 py-2.5 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-xs font-mono font-bold uppercase tracking-wider transition-all disabled:opacity-30 disabled:pointer-events-none"
                >
                  <span>Continue</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: Followers count */}
          {currentStep === 3 && (
            <div className="space-y-5">
              <div className="space-y-1">
                <h2 className="text-xl font-bold text-white tracking-tight">How many followers?</h2>
                <p className="text-xs text-gray-500">Helps calibrate reach calculations and strategist hooks.</p>
              </div>

              <div className="grid grid-cols-1 gap-2.5">
                {FOLLOWER_TIERS.map((tier) => {
                  const isSelected = selectedFollowers === tier.id;
                  return (
                    <button
                      key={tier.id}
                      onClick={() => setSelectedFollowers(tier.id)}
                      className={`text-left p-4 rounded-xl border transition-all duration-200 flex justify-between items-center ${
                        isSelected
                          ? 'border-[#7F77DD] bg-[#7F77DD]/10 text-white'
                          : 'border-gray-800 hover:border-gray-700 bg-gray-900/50 text-gray-300'
                      }`}
                    >
                      <div className="space-y-0.5">
                        <div className="text-xs font-bold font-mono">{tier.label}</div>
                        <div className="text-[10px] text-gray-500">{tier.desc}</div>
                      </div>
                      {isSelected && (
                        <div className="bg-[#7F77DD] p-1 rounded-full text-white">
                          <Check className="h-3 w-3" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>

              <div className="flex justify-between pt-4 border-t border-gray-800">
                <button
                  onClick={handlePrevStep}
                  className="flex items-center space-x-1 px-3 py-2 bg-gray-900 border border-gray-800 hover:border-gray-700 text-gray-400 hover:text-white rounded-lg text-xs font-mono font-bold uppercase tracking-wider transition-all"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  <span>Back</span>
                </button>
                <button
                  onClick={handleOnboardingComplete}
                  disabled={saving || !selectedFollowers}
                  className="flex items-center space-x-1.5 px-5 py-2.5 bg-purple-650 hover:bg-purple-600 text-white rounded-lg text-xs font-mono font-bold uppercase tracking-wider transition-all"
                >
                  <Sparkles className="h-3.5 w-3.5 text-amber-400" />
                  <span>{saving ? 'Completing...' : 'Access Feed'}</span>
                </button>
              </div>
            </div>
          )}

        </div>
      </main>

      {/* Footer */}
      <footer className="w-full max-w-7xl mx-auto py-6 border-t border-gray-900 flex items-center justify-between text-[10px] font-mono text-gray-500 uppercase tracking-widest z-10">
        <div>© 2026 ViralSpy.</div>
        <div className="text-purple-500 italic">Quietly Rise</div>
      </footer>
    </div>
  );
}
