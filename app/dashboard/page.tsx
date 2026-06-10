'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../components/AuthProvider';
import { signOutUser, getUserProfile, isDemoModeActive } from '../../lib/supabase';
import { UserProfile, Trend } from '../../types';
import TrendFeed from '../../components/TrendFeed';
import { Zap, LogOut, Eye, ShieldAlert } from 'lucide-react';

export default function DashboardPage() {
  const router = useRouter();
  const { user, loading, refreshUser } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [trends, setTrends] = useState<Trend[]>([]);
  const [loadingTrends, setLoadingTrends] = useState(true);
  const [isDemo, setIsDemo] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/');
    } else if (user) {
      loadProfileAndTrends();
    }
  }, [user, loading, router]);

  const loadProfileAndTrends = async () => {
    setIsDemo(isDemoModeActive());
    try {
      const p = await getUserProfile();
      setProfile(p);
      
      const res = await fetch('/api/trends');
      const data = await res.json();
      if (data.success && data.data) {
        setTrends(data.data);
      }
    } catch (err) {
      console.error('Error loading dashboard data:', err);
    } finally {
      setLoadingTrends(false);
    }
  };

  const handleSignOut = async () => {
    await signOutUser();
    await refreshUser();
    router.push('/');
  };

  if (loading || !user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-950 text-gray-500 space-y-3">
        <Eye className="h-8 w-8 text-[#7F77DD] animate-pulse" />
        <div className="text-xs font-mono tracking-widest uppercase animate-pulse">Synchronizing feed...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 flex flex-col justify-between">
      
      {/* Sticky Header */}
      <header className="sticky top-0 bg-gray-950/80 backdrop-blur-md border-b border-gray-900 z-50 py-4 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          
          {/* Logo & Subtitle */}
          <div className="flex items-center space-x-3">
            <div className="bg-[#7F77DD]/10 border border-[#7F77DD]/35 p-2 rounded-xl text-[#7F77DD]">
              <Zap className="h-5 w-5 fill-[#7F77DD]" />
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <h1 className="text-lg font-bold text-white tracking-tight">ViralSpy</h1>
                {isDemo && (
                  <span className="text-[8px] font-mono font-bold bg-amber-500/10 text-amber-500 border border-amber-500/30 px-1.5 py-0.5 rounded uppercase tracking-wider">
                    GUEST ACCESSIBLE
                  </span>
                )}
              </div>
              <p className="text-[10px] font-mono text-gray-500 uppercase tracking-wider hidden sm:block">
                Catch trends 48 hours before they peak
              </p>
            </div>
          </div>

          {/* User profile & Actions */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2.5">
              <img
                src={profile?.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=80&q=80'}
                alt={profile?.display_name || 'Creator'}
                className="h-8 w-8 rounded-full border border-gray-800 object-cover"
              />
              <span className="text-xs text-gray-400 font-mono hidden md:inline">
                {profile?.display_name || 'Demo Creator'}
              </span>
            </div>
            <button
              onClick={handleSignOut}
              className="p-2 rounded-lg bg-gray-900 hover:bg-gray-850 border border-gray-800 text-gray-400 hover:text-white transition-colors"
              title="Sign Out"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>

        </div>
      </header>

      {/* Main Body */}
      <main className="flex-grow max-w-7xl mx-auto w-full py-8 px-4 sm:px-6">
        
        {/* Banner if Demo */}
        {isDemo && (
          <div className="mb-6 p-4 bg-amber-950/10 border border-amber-500/25 rounded-xl flex items-center space-x-3 text-amber-400">
            <ShieldAlert className="h-5 w-5 flex-shrink-0" />
            <p className="text-xs font-sans leading-relaxed">
              <strong>Simulated Environment Active:</strong> Supabase database keys are unconfigured. The terminal is running on LocalStorage fail-safes and simulated real-time updates.
            </p>
          </div>
        )}

        <div className="space-y-6">
          <div className="space-y-1">
            <h2 className="text-2xl font-bold text-white tracking-tight">Signal Feed</h2>
            <p className="text-xs text-gray-500">Breakout vectors calculated in real-time from ingest nodes.</p>
          </div>

          {loadingTrends ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-gray-900 border border-gray-800 rounded-xl p-5 space-y-4 animate-pulse">
                  <div className="flex justify-between">
                    <div className="h-4 bg-gray-850 rounded w-16" />
                    <div className="h-4 bg-gray-850 rounded w-20" />
                  </div>
                  <div className="h-6 bg-gray-800 rounded w-3/4" />
                  <div className="h-10 bg-gray-850 rounded w-full" />
                  <div className="flex justify-between pt-2">
                    <div className="h-4 bg-gray-850 rounded w-24" />
                    <div className="h-8 bg-gray-800 rounded w-28" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <TrendFeed initialTrends={trends} />
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full max-w-7xl mx-auto py-6 border-t border-gray-900 flex items-center justify-between text-[10px] font-mono text-gray-500 uppercase tracking-widest px-4 sm:px-6">
        <div>© 2026 ViralSpy.</div>
        <div className="text-purple-500 italic">Quietly Rise</div>
      </footer>
    </div>
  );
}
