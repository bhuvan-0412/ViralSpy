'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, Shield, Sparkles, Zap, ArrowRight } from 'lucide-react';
import { signInWithGoogle, signInAsGuest, getCurrentUser, getUserNiches } from '../lib/supabase';

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [authLoading, setAuthLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    async function checkSession() {
      try {
        const user = await getCurrentUser();
        if (user) {
          const niches = await getUserNiches();
          if (niches && niches.length > 0) {
            router.replace('/dashboard');
          } else {
            router.replace('/onboarding');
          }
        }
      } catch (err) {
        console.error('Session check failed:', err);
      } finally {
        setLoading(false);
      }
    }
    checkSession();
  }, [router]);

  const handleGoogleSignIn = async () => {
    setAuthLoading(true);
    setErrorMessage('');
    try {
      await signInWithGoogle();
    } catch (err) {
      console.error('Google Sign In Error:', err);
      setErrorMessage(err.message || 'Authentication failed. Please try again.');
      setAuthLoading(false);
    }
  };

  const handleGuestSignIn = async () => {
    setAuthLoading(true);
    setErrorMessage('');
    try {
      const user = await signInAsGuest();
      if (user) {
        const niches = await getUserNiches();
        if (niches && niches.length > 0) {
          router.push('/dashboard');
        } else {
          router.push('/onboarding');
        }
      }
    } catch (err) {
      console.error('Guest Sign In Error:', err);
      setErrorMessage('Could not sign in as guest.');
      setAuthLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#1A1A1A] flex flex-col items-center justify-center space-y-3">
        <div className="border border-[#F4F2ED]/25 p-3 flex items-center justify-center animate-pulse">
          <Eye className="h-6 w-6 text-[#F4F2ED]" />
        </div>
        <div className="text-[#F4F2ED]/60 text-[10px] font-mono tracking-widest uppercase animate-pulse">
          LOADING VIRALSPY...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col justify-between bg-[#1A1A1A] text-[#F4F2ED] px-4 sm:px-6 relative overflow-hidden">
      
      {/* Editorial Content */}
      <div className="flex-grow flex flex-col lg:flex-row items-center justify-center max-w-7xl mx-auto w-full gap-12 py-12 lg:py-24 z-10">
        
        {/* Left Side: Editorial Manifesto */}
        <div className="flex-1 text-center lg:text-left space-y-6 max-w-xl">
          <div className="inline-flex items-center space-x-2 border border-[#F4F2ED]/30 px-3.5 py-1.5 text-[10px] font-mono tracking-wider uppercase">
            <Zap className="h-3.5 w-3.5" />
            <span>48-Hour Inversion</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white leading-tight tracking-tight font-serif italic">
            Predict the Future of Virality
          </h1>

          <p className="text-[#F4F2ED]/70 text-sm leading-relaxed max-w-lg">
            Stop guessing what to film. ViralSpy detects TikTok, YouTube, and Instagram trends 48 hours before they hit peak algorithmic saturation, providing instant, ready-to-shoot strategist briefs.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 text-left border-t border-[#F4F2ED]/10">
            <div className="space-y-1">
              <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-[#F4F2ED]">Velocity Algorithm</h4>
              <p className="text-[11px] text-[#F4F2ED]/50 leading-normal">Detect growth relative to baseline averages, not vanity view metrics.</p>
            </div>

            <div className="space-y-1">
              <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-[#F4F2ED]">Strategist Briefs</h4>
              <p className="text-[11px] text-[#F4F2ED]/50 leading-normal">Get hooks, unique video angles, formats, and optimized posting times.</p>
            </div>
          </div>
        </div>

        {/* Right Side: Editorial Login Box */}
        <div className="w-full max-w-md">
          <div className="border border-[#F4F2ED]/10 p-8 bg-[#1A1A1A] relative">
            <div className="flex flex-col items-center text-center mb-8">
              <div className="border border-[#F4F2ED]/20 p-3.5 flex items-center justify-center mb-4">
                <Eye className="h-6 w-6 text-[#F4F2ED]" />
              </div>
              <h2 className="text-xl font-bold tracking-tight font-serif uppercase">Access Trend Signals</h2>
              <p className="text-[10px] font-mono text-[#F4F2ED]/40 mt-1 uppercase tracking-widest">Identify rising breakouts</p>
            </div>

            {errorMessage && (
              <div className="mb-6 p-4 border border-red-500/30 text-red-400 text-xs font-mono font-semibold">
                {errorMessage}
              </div>
            )}

            <div className="space-y-4">
              {/* Google login */}
              <button
                onClick={handleGoogleSignIn}
                disabled={authLoading}
                className="w-full flex items-center justify-center space-x-3 bg-[#F4F2ED] hover:bg-transparent text-[#1A1A1A] hover:text-[#F4F2ED] border border-[#F4F2ED] font-mono text-xs uppercase tracking-widest font-bold py-3.5 px-4 transition-all duration-300"
              >
                <span>Continue with Google</span>
              </button>

              {/* Demo login */}
              <button
                onClick={handleGuestSignIn}
                disabled={authLoading}
                className="w-full flex items-center justify-center space-x-2 bg-transparent hover:bg-[#F4F2ED]/5 text-[#F4F2ED] border border-[#F4F2ED]/20 hover:border-[#F4F2ED] font-mono text-xs uppercase tracking-widest font-bold py-3.5 px-4 transition-all duration-300"
              >
                <Sparkles className="h-4 w-4 text-purple-400" />
                <span>Explore in Demo Mode (Guest)</span>
                <ArrowRight className="h-4 w-4 ml-1" />
              </button>
            </div>

            <div className="mt-8 pt-6 border-t border-[#F4F2ED]/10 text-center">
              <div className="flex items-center justify-center space-x-1.5 text-[10px] font-mono text-[#F4F2ED]/40 uppercase tracking-widest">
                <Shield className="h-3.5 w-3.5" />
                <span>Secured by Supabase Auth</span>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Footer */}
      <footer className="w-full max-w-7xl mx-auto py-6 border-t border-[#F4F2ED]/10 flex flex-col sm:flex-row items-center justify-between text-[10px] font-mono text-[#F4F2ED]/30 uppercase tracking-widest">
        <div>
          © 2026 ViralSpy. All rights reserved.
        </div>
        <div className="flex space-x-6 mt-3 sm:mt-0">
          <a href="#" className="hover:text-[#F4F2ED] transition-colors">Privacy</a>
          <a href="#" className="hover:text-[#F4F2ED] transition-colors">Terms</a>
        </div>
      </footer>

    </div>
  );
}
