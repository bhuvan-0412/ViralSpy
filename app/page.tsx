'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../components/AuthProvider';
import { signInWithGoogle, signInAsGuest, getUserProfile } from '../lib/supabase';
import { Sparkles, Eye, ArrowRight, Shield } from 'lucide-react';

export default function EntryPage() {
  const router = useRouter();
  const { user, loading, refreshUser } = useAuth();

  useEffect(() => {
    if (!loading && user) {
      checkProfileStatus();
    }
  }, [user, loading]);

  const checkProfileStatus = async () => {
    const profile = await getUserProfile();
    if (profile?.onboarded) {
      router.replace('/dashboard');
    } else {
      router.replace('/onboarding');
    }
  };

  const handleGoogleLogin = async () => {
    try {
      await signInWithGoogle();
      await refreshUser();
    } catch (err) {
      console.error('Google login error:', err);
    }
  };

  const handleGuestLogin = async () => {
    try {
      await signInAsGuest();
      
      // Initialize local storage trends by seeding them
      try {
        const res = await fetch('/api/seed');
        const seedRes = await res.json();
        if (seedRes.success && seedRes.data) {
          localStorage.setItem('viralspy_demo_trends', JSON.stringify(seedRes.data));
        }
      } catch (seedErr) {
        console.warn('Seeding failed:', seedErr);
      }

      await refreshUser();
      // Skip onboarding for guest demo terminal, go directly to dashboard
      router.push('/dashboard');
    } catch (err) {
      console.error('Guest login error:', err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-950 text-gray-500 space-y-3">
        <Eye className="h-8 w-8 text-[#7F77DD] animate-pulse" />
        <div className="text-xs font-mono tracking-widest uppercase animate-pulse">Loading Terminal...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col justify-between bg-gray-950 text-gray-100 px-4 sm:px-6 relative overflow-hidden">
      {/* Background radial highlight */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-purple-900/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="flex-grow flex flex-col lg:flex-row items-center justify-center max-w-7xl mx-auto w-full gap-12 py-12 lg:py-24 z-10">
        
        {/* Left column info */}
        <div className="flex-1 text-center lg:text-left space-y-6 max-w-xl">
          <div className="inline-flex items-center space-x-2 bg-purple-950/30 border border-purple-900/50 rounded-full px-4 py-1.5 text-xs font-mono font-bold tracking-wider uppercase text-purple-400">
            <Sparkles className="h-4 w-4 text-amber-400" />
            <span>48-Hour Trend Prediction</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white leading-tight tracking-tight">
            Predict the Future of Virality
          </h1>

          <p className="text-gray-400 text-sm leading-relaxed max-w-lg">
            Stop guessing what to film. ViralSpy detects TikTok, YouTube, and Instagram trends 48 hours before they peak, generating strategist-grade content briefs automatically.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 text-left border-t border-gray-800">
            <div className="space-y-1">
              <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-purple-450">Velocity Engine</h4>
              <p className="text-[11px] text-gray-500 leading-normal">Detect growth acceleration relative to baseline 24h average rates.</p>
            </div>

            <div className="space-y-1">
              <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-purple-450">Strategist Briefs</h4>
              <p className="text-[11px] text-gray-500 leading-normal">Get killer scroll-stopping hooks, video angles, and optimized scheduling.</p>
            </div>
          </div>
        </div>

        {/* Right column auth box */}
        <div className="w-full max-w-md">
          <div className="border border-gray-800 rounded-2xl p-8 bg-gray-900 shadow-2xl relative">
            <div className="flex flex-col items-center text-center mb-8">
              <div className="p-3 bg-purple-950/40 border border-purple-900/40 rounded-xl flex items-center justify-center mb-4 text-[#7F77DD]">
                <Eye className="h-7 w-7" />
              </div>
              <h2 className="text-xl font-bold tracking-tight text-white uppercase font-mono">Access Trend Signals</h2>
              <p className="text-[10px] font-mono text-gray-500 mt-1 uppercase tracking-widest">Identify rising breakouts</p>
            </div>

            <div className="space-y-4">
              {/* Google login */}
              <button
                onClick={handleGoogleLogin}
                className="w-full flex items-center justify-center space-x-3 bg-white hover:bg-gray-100 text-gray-900 font-semibold rounded-xl py-3.5 px-4 transition-all duration-300 shadow-md"
              >
                <span>Continue with Google</span>
              </button>

              {/* Guest login */}
              <button
                onClick={handleGuestLogin}
                className="w-full flex items-center justify-center space-x-2 bg-gray-850 hover:bg-gray-800 text-white border border-gray-800 hover:border-gray-750 font-mono text-xs uppercase tracking-widest font-bold py-3.5 px-4 rounded-xl transition-all duration-300"
              >
                <Sparkles className="h-4 w-4 text-amber-400 animate-pulse" />
                <span>Explore Guest Terminal</span>
                <ArrowRight className="h-4 w-4 ml-1" />
              </button>
            </div>

            <div className="mt-8 pt-6 border-t border-gray-800 text-center">
              <div className="flex items-center justify-center space-x-1.5 text-[10px] font-mono text-gray-500 uppercase tracking-widest">
                <Shield className="h-3.5 w-3.5 text-purple-400" />
                <span>Supabase Secure Ingestion</span>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Footer */}
      <footer className="w-full max-w-7xl mx-auto py-6 border-t border-gray-900 flex flex-col sm:flex-row items-center justify-between text-[10px] font-mono text-gray-500 uppercase tracking-widest">
        <div>© 2026 ViralSpy. All rights reserved.</div>
        <div className="flex space-x-6 mt-3 sm:mt-0">
          <a href="#" className="hover:text-white transition-colors">Privacy</a>
          <a href="#" className="hover:text-white transition-colors">Terms</a>
        </div>
      </footer>
    </div>
  );
}
