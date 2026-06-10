'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getCurrentUser, saveUserNiches, getUserNiches } from '../../lib/supabase';
import { Button } from '@/components/SpecKit/Button';

const NICHES = [
  { id: 'fitness', name: 'Fitness & Health', desc: 'Workouts, nutrition, physical challenges' },
  { id: 'food', name: 'Food & Cooking', desc: 'Recipes, meal prep, viral food hacks' },
  { id: 'finance', name: 'Finance & Money', desc: 'Saving hacks, tax loopholes, investing' },
  { id: 'tech', name: 'Tech & AI', desc: 'AI agent setups, coding, hardware reviews' },
  { id: 'fashion', name: 'Fashion & Style', desc: 'Capsule wardrobes, styling rules, thrift flips' },
  { id: 'beauty', name: 'Beauty & Makeup', desc: 'Makeup tutorials, skincare routines, beauty hacks' }
];

export default function OnboardingPage() {
  const router = useRouter();
  const [selectedNiches, setSelectedNiches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    async function checkAuthAndExistingNiches() {
      try {
        const user = await getCurrentUser();
        if (!user) {
          router.replace('/');
          return;
        }

        const existing = await getUserNiches();
        if (existing && existing.length > 0) {
          // User already has niches, pre-select them or redirect to dashboard
          setSelectedNiches(existing);
        }
      } catch (err) {
        console.error('Failed to load user state:', err);
      } finally {
        setLoading(false);
      }
    }

    checkAuthAndExistingNiches();
  }, [router]);

  const handleToggleNiche = (nicheId) => {
    setError('');
    if (selectedNiches.includes(nicheId)) {
      setSelectedNiches(selectedNiches.filter(id => id !== nicheId));
    } else {
      if (selectedNiches.length >= 3) {
        setError('Maximum 3 niches allowed.');
        return;
      }
      setSelectedNiches([...selectedNiches, nicheId]);
    }
  };

  const handleSave = async () => {
    if (selectedNiches.length < 1) {
      setError('Please select at least 1 niche.');
      return;
    }
    if (selectedNiches.length > 3) {
      setError('Please select no more than 3 niches.');
      return;
    }

    setSaving(true);
    setError('');
    try {
      await saveUserNiches(selectedNiches);
      router.push('/dashboard');
    } catch (err) {
      console.error('Error saving niches:', err);
      setError('Failed to save preferences. Please try again.');
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#1A1A1A] flex flex-col items-center justify-center space-y-3">
        <div className="text-[#F4F2ED]/60 text-[10px] font-mono tracking-widest uppercase animate-pulse">
          CONFIGURING WORKSPACE...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#1A1A1A] text-[#F4F2ED] flex flex-col justify-between px-4 sm:px-6 relative overflow-hidden">
      {/* Top Header */}
      <header className="max-w-7xl mx-auto w-full py-8 border-b border-[#F4F2ED]/10 flex items-center justify-between">
        <div className="text-sm font-bold tracking-widest font-mono uppercase">
          VIRALSPY // ONBOARDING
        </div>
        <div className="text-[10px] font-mono text-[#F4F2ED]/50 uppercase tracking-widest">
          STEP 01 OF 02
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-grow flex flex-col items-center justify-center max-w-3xl mx-auto w-full py-12">
        <div className="w-full text-center space-y-4 mb-10">
          <h1 className="text-3xl sm:text-4xl font-black italic font-serif text-white">
            Select Your Niches
          </h1>
          <p className="text-xs text-[#F4F2ED]/60 font-mono uppercase tracking-wider max-w-md mx-auto">
            Choose 1 to 3 categories to curate your trend intelligence feed.
          </p>
        </div>

        {error && (
          <div className="w-full mb-6 p-4 border border-red-500/30 text-red-400 text-xs font-mono font-semibold text-center uppercase tracking-wider">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full mb-10">
          {NICHES.map((niche) => {
            const isSelected = selectedNiches.includes(niche.id);
            return (
              <button
                key={niche.id}
                onClick={() => handleToggleNiche(niche.id)}
                className={`text-left p-6 transition-all duration-300 relative rounded-none border ${
                  isSelected
                    ? 'border-[#F4F2ED] bg-[#F4F2ED]/5 shadow-[inset_0_0_20px_rgba(244,242,237,0.03)]'
                    : 'border-[#F4F2ED]/10 hover:border-[#F4F2ED]/30 bg-[#1A1A1A]'
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <span className="font-mono text-xs font-bold uppercase tracking-wider">
                    {niche.name}
                  </span>
                  {isSelected && (
                    <span className="text-[10px] font-mono text-[#F4F2ED] border border-[#F4F2ED] px-1.5 py-0.2 uppercase font-bold">
                      ACTIVE
                    </span>
                  )}
                </div>
                <p className="text-xs text-[#F4F2ED]/50 leading-relaxed font-sans">
                  {niche.desc}
                </p>
              </button>
            );
          })}
        </div>

        <div className="w-full flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-[#F4F2ED]/10">
          <div className="text-[10px] font-mono text-[#F4F2ED]/40 uppercase tracking-widest text-center sm:text-left">
            {selectedNiches.length} OF 3 CHOSEN
          </div>
          <Button
            onClick={handleSave}
            disabled={saving || selectedNiches.length === 0}
            className="w-full sm:w-auto"
          >
            {saving ? 'SAVING PREFERENCES...' : 'INITIALIZE DASHBOARD'}
          </Button>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full max-w-7xl mx-auto py-6 border-t border-[#F4F2ED]/10 flex flex-col sm:flex-row items-center justify-between text-[10px] font-mono text-[#F4F2ED]/30 uppercase tracking-widest">
        <div>
          © 2026 ViralSpy.
        </div>
        <div className="italic text-[#F4F2ED]/50 font-serif">
          — ViralSpy
        </div>
      </footer>
    </div>
  );
}
