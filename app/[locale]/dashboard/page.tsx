'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import { useAuth } from '../../../components/AuthProvider';
import { supabase, signOutUser, getUserProfile, isDemoModeActive } from '../../../lib/supabase';
import { UserProfile, Trend } from '../../../types';
import TrendFeed from '../../../components/TrendFeed';
import Sparkline from '../../../components/Sparkline';
import Logo from '../../../components/Logo';
import LanguageSwitcher from '../../../components/LanguageSwitcher';
import AIProviderBadge from '../../../components/AIProviderBadge';
import { formatIndianNumber, formatIST } from '../../../lib/format';
import { LogOut, Eye, TrendingUp, Flame, Activity, FileText, RefreshCw, CheckCircle, Settings, HelpCircle, MessageSquare } from 'lucide-react';
import { useAIProvider } from '../../../hooks/useAIProvider';

export default function DashboardPage() {
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations('dashboard');
  const tNav = useTranslations('nav');
  const { config } = useAIProvider();

  const { user, loading, refreshUser } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [trends, setTrends] = useState<Trend[]>([]);
  const [loadingTrends, setLoadingTrends] = useState(true);
  const [isDemo, setIsDemo] = useState(false);
  const [briefsCount, setBriefsCount] = useState(0);
  const [isPollLoading, setIsPollLoading] = useState(false);
  const [pollToast, setPollToast] = useState<{ count: number } | null>(null);
  const [lastPolledAt, setLastPolledAt] = useState<Date | null>(null);
  const [lastPolledLabel, setLastPolledLabel] = useState<string>('');
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/');
    } else if (user) {
      loadProfileAndTrends();
    }
  }, [user, loading, router]);

  const loadProfileAndTrends = async () => {
    const activeDemo = isDemoModeActive();
    setIsDemo(activeDemo);
    try {
      const p = await getUserProfile();
      setProfile(p);

      // Override localStorage configuration if profile has a synced ai_provider
      if (p && p.ai_provider) {
        try {
          const stored = localStorage.getItem('viralspy_ai_config');
          const currentConfig = stored ? JSON.parse(stored) : {};
          if (currentConfig.provider !== p.ai_provider) {
            currentConfig.provider = p.ai_provider;
            localStorage.setItem('viralspy_ai_config', JSON.stringify(currentConfig));
          }
        } catch (e) {
          console.error('LocalStorage sync failed:', e);
        }
      }

      const res = await fetch('/api/trends');
      const data = await res.json();
      if (data.success && data.data) {
        setTrends(data.data);
      }

      const statsRes = await fetch('/api/stats');
      const statsData = await statsRes.json();
      if (statsData.success && statsData.data) {
        setBriefsCount(statsData.data.briefsGenerated || 0);
      }
    } catch (err) {
      console.error('Error loading dashboard data:', err);
    } finally {
      setLoadingTrends(false);
    }
  };

  // Compute human-readable "X minutes ago" label from a Date
  const computeLastPolledLabel = useCallback((date: Date | null) => {
    if (!date) return '';
    const diffMs = Date.now() - date.getTime();
    const mins = Math.floor(diffMs / 60000);
    if (mins <= 0) return 'just now';
    if (mins === 1) return '1 minute ago';
    return `${mins} minutes ago`;
  }, []);

  // Update label every 60s
  useEffect(() => {
    if (!lastPolledAt) return;
    setLastPolledLabel(computeLastPolledLabel(lastPolledAt));
    const id = setInterval(() => {
      setLastPolledLabel(computeLastPolledLabel(lastPolledAt));
    }, 60000);
    return () => clearInterval(id);
  }, [lastPolledAt, computeLastPolledLabel]);

  const handlePollLiveData = async () => {
    if (isPollLoading) return;
    setIsPollLoading(true);
    const prevCount = trends.length;
    try {
      const pollRes = await fetch('/api/poll');
      const pollData = await pollRes.json();

      if (!pollData.success || (pollData.inserted === 0 && pollData.updated === 0)) {
        // Fallback to seed if no live data
        await fetch('/api/seed');
      }
    } catch {
      await fetch('/api/seed');
    } finally {
      try {
        const res = await fetch('/api/trends');
        const data = await res.json();
        if (data.success && data.data) {
          setTrends(data.data);
          const newCount = Math.max(0, data.data.length - prevCount);
          const now = new Date();
          setLastPolledAt(now);
          setLastPolledLabel(computeLastPolledLabel(now));
          // Show toast
          if (toastTimer.current) clearTimeout(toastTimer.current);
          setPollToast({ count: newCount });
          toastTimer.current = setTimeout(() => setPollToast(null), 4000);
        }
      } catch (err) {
        console.error('Failed to load updated trends:', err);
      } finally {
        setIsPollLoading(false);
      }
    }
  };

  // Realtime Database Subscriptions
  useEffect(() => {
    if (!user || isDemoModeActive() || !supabase) return;

    const channel = supabase
      .channel('public:trends')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'trends'
        },
        (payload) => {
          if (payload.eventType === 'UPDATE') {
            setTrends((current) =>
              current.map((t) => (t.id === payload.new.id ? { ...t, ...payload.new } : t))
            );
          } else if (payload.eventType === 'INSERT') {
            setTrends((current) => [...current, payload.new as Trend]);
          } else if (payload.eventType === 'DELETE') {
            setTrends((current) => current.filter((t) => t.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  // Demo Mode Realtime simulation
  useEffect(() => {
    if (!user || !isDemo) return;

    const interval = setInterval(() => {
      setTrends((current) =>
        current.map((t) => {
          if (t.name === '5-4-3-2-1 grounding method') {
            const tick = parseFloat((Math.random() * 2 + 0.5).toFixed(2));
            const newScore = parseFloat((t.velocity_score + tick).toFixed(2));

            let newStatus = t.momentum_status;
            if (newScore >= 300) newStatus = 'EXPLODING';
            else if (newScore >= 150) newStatus = 'RISING';
            else if (newScore >= 50) newStatus = 'PEAKED';
            else newStatus = 'DEAD';

            return {
              ...t,
              velocity_score: newScore,
              momentum_status: newStatus
            };
          }
          return t;
        })
      );
    }, 4000);

    return () => clearInterval(interval);
  }, [user, isDemo]);


  const handleSignOut = async () => {
    if (supabase) {
      await supabase.auth.signOut();
    }
    await signOutUser();
    router.replace(getLocalizedPath('/'));
  };

  const getLocalizedPath = (path: string) => {
    return locale === 'en' ? path : `/${locale}${path}`;
  };

  const getBriefsPath = () => 
    locale === 'en' ? '/briefs' : `/${locale}/briefs`;

  if (loading || !user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#F7F5F2] text-[#6B7280] space-y-3">
        <Eye className="h-8 w-8 text-[#FF6B4A] animate-pulse" />
        <div className="text-xs font-mono tracking-widest uppercase animate-pulse">Synchronizing feed...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F7F5F2] text-[#1A1A1A] flex flex-col justify-between font-sans">

      {/* Redesigned White Sticky Navbar */}
      <header className="sticky top-0 bg-white border-b border-gray-200 z-50 py-3.5 px-4 sm:px-6 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
        <div className="max-w-7xl mx-auto flex items-center justify-between">

          {/* Logo Left */}
          <div className="flex items-center space-x-2.5">
            <a href={getLocalizedPath('/dashboard')}>
              <Logo />
            </a>
          </div>

          {/* Nav Links Center */}
          <nav className="hidden md:flex items-center space-x-8 text-sm font-semibold text-gray-655">
            <button onClick={() => router.push(getLocalizedPath('/dashboard'))} className="text-gray-500 hover:text-[#FF6B4A] transition-colors">{t('title')}</button>
            <button onClick={() => router.push(getBriefsPath())} className="hover:text-[#FF6B4A] transition-colors">{tNav('briefs')}</button>
            <button onClick={() => router.push(getLocalizedPath('/feedback'))} className="hover:text-[#FF6B4A] transition-colors flex items-center gap-1.5">
              <MessageSquare className="h-4 w-4" />
              <span>{tNav('feedback')}</span>
            </button>
          </nav>

          {/* Avatar / Switcher / Settings / SignOut Right */}
          <div className="flex items-center space-x-3">
            {/* Last updated timestamp */}
            {lastPolledLabel && (
              <span className="hidden lg:flex items-center space-x-1.5 text-[10px] font-semibold text-gray-400 bg-gray-50 border border-gray-200 px-2.5 py-1.5 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse inline-block" />
                <span>{t('lastUpdated')}: {lastPolledLabel}</span>
              </span>
            )}

            {/* Language Switcher component */}
            <LanguageSwitcher />

            {/* AI Provider Badge component */}
            <AIProviderBadge />


            <div className="flex items-center space-x-2.5">
              <span className="text-xs text-gray-500 font-semibold hidden md:inline">
                {profile?.display_name || 'Demo Creator'}
              </span>
              <div className="h-8 w-8 rounded-full bg-orange-100 border border-orange-200 flex items-center justify-center text-xs font-bold text-[#FF6B4A]">
                {(profile?.display_name || 'Demo Creator').split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
              </div>
            </div>

            {/* Help button if Ollama */}
            {((profile?.ai_provider || config.provider) === 'ollama') && (
              <button
                onClick={() => router.push(getLocalizedPath('/setup'))}
                className="p-2 rounded-xl bg-orange-50 hover:bg-orange-100 border border-orange-100 text-[#FF6B4A] hover:text-[#ff5a33] transition-colors"
                title="Local AI Setup Guide"
              >
                <HelpCircle className="h-4 w-4" />
              </button>
            )}

            {/* Settings button */}
            <button
              onClick={() => router.push(getLocalizedPath('/settings'))}
              className="p-2 rounded-xl bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-500 hover:text-gray-900 transition-colors"
              title={tNav('settings')}
            >
              <Settings className="h-4 w-4" />
            </button>

            {/* Sign out button */}
            <button
              onClick={handleSignOut}
              className="p-2 rounded-xl bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-500 hover:text-gray-900 transition-colors"
              title={tNav('logout')}
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>

        </div>
      </header>

      {/* Main Body */}
      <main className="flex-grow max-w-7xl mx-auto w-full py-8 px-4 sm:px-6 space-y-8">

        {/* Poll Success Toast */}
        {pollToast && (
          <div className="fixed bottom-6 right-6 z-50 flex items-center space-x-2.5 bg-[#1A1A1A] text-white text-xs font-semibold px-4 py-3 rounded-2xl shadow-xl animate-fade-up">
            <CheckCircle className="h-4 w-4 text-green-400 shrink-0" />
            <span>
              {pollToast.count > 0
                ? `✓ Live data updated — ${pollToast.count} new trend${pollToast.count === 1 ? '' : 's'} detected`
                : '✓ Live data updated — feed refreshed'}
            </span>
          </div>
        )}

        {/* Hero Stat Bar (4 metric cards in a row) */}
        {(() => {
          const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
          const trendsDetectedToday = trends.filter(t => new Date(t.detected_at) > oneDayAgo).length;
          const explodingRightNow = trends.filter(t => t.momentum_status === 'EXPLODING').length;
          const risingAndExploding = trends.filter(t => t.momentum_status === 'RISING' || t.momentum_status === 'EXPLODING');
          const avgVelocity = risingAndExploding.length
            ? Math.round(risingAndExploding.reduce((acc, t) => acc + t.velocity_score, 0) / risingAndExploding.length)
            : 0;

          return (
            <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-fade-up delay-75">

              {/* Card 1: Trends Detected */}
              <div className="bg-white p-5 border border-gray-200 rounded-2xl shadow-card flex flex-col justify-between h-32 relative overflow-hidden transition-all duration-200 hover:shadow-md">
                <div className="flex justify-between items-start">
                  <span className="text-xs font-semibold text-gray-500">{t('trendsToday')}</span>
                  <TrendingUp className="h-5 w-5 text-[#FF6B4A]" />
                </div>
                <div className="mt-2">
                  <span className="text-3xl font-black text-[#1A1A1A] tracking-tight">{formatIndianNumber(trendsDetectedToday)}</span>
                </div>
                <div className="h-8 w-full mt-2">
                  <Sparkline data={[12, 14, 16, trendsDetectedToday]} stroke="#FF6B4A" />
                </div>
              </div>

              {/* Card 2: EXPLODING Right Now */}
              <div className="bg-white p-5 border border-gray-200 rounded-2xl shadow-card flex flex-col justify-between h-32 relative overflow-hidden transition-all duration-200 hover:shadow-md">
                <div className="flex justify-between items-start">
                  <span className="text-xs font-semibold text-gray-500">{t('explodingNow')}</span>
                  <Flame className="h-5 w-5 text-red-500 animate-pulse" />
                </div>
                <div className="mt-2">
                  <span className="text-3xl font-black text-red-500 tracking-tight">{formatIndianNumber(explodingRightNow)}</span>
                </div>
                <div className="h-8 w-full mt-2">
                  <Sparkline data={[1, 2, 2, explodingRightNow]} stroke="#ef4444" />
                </div>
              </div>

              {/* Card 3: Avg Velocity Score */}
              <div className="bg-white p-5 border border-gray-200 rounded-2xl shadow-card flex flex-col justify-between h-32 relative overflow-hidden transition-all duration-200 hover:shadow-md">
                <div className="flex justify-between items-start">
                  <span className="text-xs font-semibold text-gray-500">{t('avgVelocity')}</span>
                  <Activity className="h-5 w-5 text-[#7F77DD]" />
                </div>
                <div className="mt-2">
                  <span className="text-3xl font-black text-[#7F77DD] tracking-tight">{formatIndianNumber(avgVelocity)}%</span>
                </div>
                <div className="h-8 w-full mt-2">
                  <Sparkline data={[180, 210, 230, avgVelocity]} stroke="#7F77DD" />
                </div>
              </div>

              {/* Card 4: Briefs Generated */}
              <div className="bg-white p-5 border border-gray-200 rounded-2xl shadow-card flex flex-col justify-between h-32 relative overflow-hidden transition-all duration-200 hover:shadow-md">
                <div className="flex justify-between items-start">
                  <span className="text-xs font-semibold text-gray-500">{t('briefsGenerated')}</span>
                  <FileText className="h-5 w-5 text-[#1D9E75]" />
                </div>
                <div className="mt-2">
                  <span className="text-3xl font-black text-[#1D9E75] tracking-tight">{formatIndianNumber(briefsCount)}</span>
                </div>
                <div className="h-8 w-full mt-2">
                  <Sparkline data={[8, 10, 11, briefsCount]} stroke="#1D9E75" />
                </div>
              </div>

            </section>
          );
        })()}

        {/* Signals Section */}
        <div className="space-y-4 animate-fade-up delay-150">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-0.5">
              <h2 className="text-xl font-bold text-[#1A1A1A] tracking-tight">Signal Feed</h2>
              <p className="text-xs text-gray-500 font-medium">{t('subtitle')}</p>
            </div>
            {/* Refresh Live Data button */}
            <button
              id="refresh-live-data-btn"
              onClick={handlePollLiveData}
              disabled={isPollLoading}
              className="flex items-center space-x-1.5 px-3 py-2 bg-[#FF6B4A] hover:bg-[#ff5a33] text-white text-xs font-semibold rounded-xl transition-all disabled:opacity-60 disabled:pointer-events-none shrink-0"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isPollLoading ? 'animate-spin' : ''}`} />
              <span>{isPollLoading ? 'Polling...' : `${t('refreshData')}`}</span>
            </button>
          </div>

          {loadingTrends ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-white border border-gray-200 rounded-2xl p-5 space-y-4 animate-pulse shadow-card">
                  <div className="flex justify-between">
                    <div className="h-4 bg-gray-150 rounded w-16" />
                    <div className="h-4 bg-gray-150 rounded w-20" />
                  </div>
                  <div className="h-6 bg-gray-250 rounded w-3/4" />
                  <div className="h-10 bg-gray-150 rounded w-full" />
                  <div className="flex justify-between pt-2">
                    <div className="h-4 bg-gray-150 rounded w-24" />
                    <div className="h-8 bg-gray-250 rounded w-28" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <TrendFeed
              trends={trends}
              setTrends={setTrends}
              onBriefGenerated={() => setBriefsCount((prev) => prev + 1)}
              onPollLiveData={handlePollLiveData}
              isPollLoading={isPollLoading}
            />
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full max-w-7xl mx-auto py-6 border-t border-gray-200 flex items-center justify-between text-xs text-gray-550 px-4 sm:px-6 mt-12">
        <div>© 2026 ViralSpy.</div>
      </footer>
    </div>
  );
}
