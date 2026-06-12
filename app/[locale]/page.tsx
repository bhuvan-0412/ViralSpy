'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../components/AuthProvider';
import { supabase } from '@/lib/supabase';
import { Sparkles, Eye, ArrowRight, Shield } from 'lucide-react';

export default function EntryPage() {
  const router = useRouter();
  const { loading, refreshUser } = useAuth();

  useEffect(() => {
    if (supabase) {
      // Check if already logged in
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session) {
          router.replace('/dashboard');
        }
      });

      // Listen for auth changes
      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        (event, session) => {
          if (event === 'SIGNED_IN' && session) {
            router.replace('/dashboard');
          }
        }
      );

      return () => subscription.unsubscribe();
    }
  }, [router]);

  const handleGoogleLogin = async () => {
    console.log('Google login clicked')
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          }
        }
      })
      if (error) {
        console.error('OAuth error:', error.message)
        alert(`Login error: ${error.message}`)
      }
    } catch (err) {
      console.error('Unexpected error:', err)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#F7F5F2] text-[#6B7280] space-y-3">
        <Eye className="h-8 w-8 text-[#FF6B4A] animate-pulse" />
        <div className="text-xs font-mono tracking-widest uppercase animate-pulse">Loading Terminal...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col justify-between bg-[#F7F5F2] text-[#1A1A1A] px-4 sm:px-6 relative overflow-hidden font-sans">
      {/* Background radial highlight */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-orange-400/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="flex-grow flex flex-col lg:flex-row items-center justify-center max-w-7xl mx-auto w-full gap-12 py-12 lg:py-24 z-10">
        
        {/* Left column info */}
        <div className="flex-1 text-center lg:text-left space-y-6 max-w-xl animate-fade-up delay-0">
          <div className="inline-flex items-center space-x-2 bg-orange-50 border border-orange-200 rounded-full px-4 py-1.5 text-xs font-semibold tracking-wide uppercase text-[#FF6B4A]">
            <Sparkles className="h-4 w-4 text-[#FF6B4A]" />
            <span>48-Hour Trend Prediction</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-[#1A1A1A] leading-tight tracking-tight">
            Predict the Future of Virality
          </h1>

          <p className="text-gray-600 text-sm leading-relaxed max-w-lg">
            Stop guessing what to film. ViralSpy detects YouTube Shorts, Instagram Reels, and Reddit trends 48 hours before they peak, generating strategist-grade content briefs automatically.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-6 text-left border-t border-gray-200">
            <div className="space-y-1">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#FF6B4A]">Velocity Engine</h4>
              <p className="text-[12px] text-gray-500 leading-normal">Detect growth acceleration relative to baseline 24h average rates.</p>
            </div>

            <div className="space-y-1">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#FF6B4A]">Strategist Briefs</h4>
              <p className="text-[12px] text-gray-500 leading-normal">Get killer scroll-stopping hooks, video angles, and optimized scheduling.</p>
            </div>
          </div>
        </div>

        {/* Right column auth box */}
        <div className="w-full max-w-md animate-fade-up delay-75">
          <div className="border border-gray-200 rounded-2xl p-8 bg-white shadow-card relative">
            <div className="flex flex-col items-center text-center mb-8">
              <div className="p-3 bg-orange-50 border border-orange-100 rounded-2xl flex items-center justify-center mb-4 text-[#FF6B4A]">
                <Eye className="h-7 w-7" />
              </div>
              <h2 className="text-xl font-bold tracking-tight text-[#1A1A1A] uppercase font-sans">Access Trend Signals</h2>
              <p className="text-xs text-gray-500 mt-1 uppercase tracking-wider">Identify rising breakouts</p>
            </div>

            <div className="space-y-4">
              {/* Google login */}
              <button
                onClick={handleGoogleLogin}
                className="w-full flex items-center justify-center space-x-3 bg-[#1A1A1A] hover:bg-[#2C2C2C] text-white font-semibold rounded-2xl py-3.5 px-4 shadow-sm transition-transform duration-200 hover:scale-[1.02]"
              >
                <span>Continue with Google</span>
              </button>
            </div>

            <div className="mt-8 pt-6 border-t border-gray-200 text-center">
              <div className="flex items-center justify-center space-x-1.5 text-xs text-gray-550">
                <Shield className="h-4 w-4 text-green-600" />
                <span>Supabase Secure Ingestion</span>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Footer */}
      <footer className="w-full max-w-7xl mx-auto py-6 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between text-xs text-gray-500">
        <div>© 2026 ViralSpy. All rights reserved.</div>
        <div className="flex space-x-6 mt-3 sm:mt-0">
          <a href="#" className="hover:text-[#FF6B4A] transition-colors">Privacy</a>
          <a href="#" className="hover:text-[#FF6B4A] transition-colors">Terms</a>
        </div>
      </footer>
    </div>
  );
}
