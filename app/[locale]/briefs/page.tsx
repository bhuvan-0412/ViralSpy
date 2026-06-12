'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import { useAuth } from '../../../components/AuthProvider';
import { supabase, signOutUser, getUserProfile } from '../../../lib/supabase';
import { Brief, UserProfile } from '../../../types';
import Logo from '../../../components/Logo';
import LanguageSwitcher from '../../../components/LanguageSwitcher';
import AIProviderBadge from '../../../components/AIProviderBadge';
import { Settings, LogOut, FileText, ChevronRight, HelpCircle, MessageSquare } from 'lucide-react';
import { useAIProvider } from '../../../hooks/useAIProvider';
import { formatIST } from '../../../lib/format';

interface BriefWithTrend extends Brief {
  trends?: {
    name: string;
    niche: string;
    platform: string;
  } | null;
}

export default function BriefsPage() {
  const router = useRouter();
  const locale = useLocale();
  const tNav = useTranslations('nav');
  const { config } = useAIProvider();
  
  const { user, loading } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [briefs, setBriefs] = useState<BriefWithTrend[]>([]);
  const [loadingBriefs, setLoadingBriefs] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/');
    } else if (user) {
      loadProfileAndBriefs();
    }
  }, [user, loading, router]);

  const loadProfileAndBriefs = async () => {
    try {
      const p = await getUserProfile();
      setProfile(p);

      // Fetch user-specific briefs
      let query = supabase
        .from('briefs')
        .select('*, trends(name, niche, platform)')
        .order('created_at', { ascending: false });

      if (user?.id) {
        query = query.eq('user_id', user.id);
      }

      let { data, error } = await query;

      // Fallback: If no briefs or user_id returns no results (demo user or null), fetch the 10 most recent briefs regardless of user
      if (!data || data.length === 0) {
        const fallbackRes = await supabase
          .from('briefs')
          .select('*, trends(name, niche, platform)')
          .order('created_at', { ascending: false })
          .limit(10);
        
        data = fallbackRes.data || [];
      }

      setBriefs(data as BriefWithTrend[]);
    } catch (err) {
      console.error('Error fetching briefs:', err);
    } finally {
      setLoadingBriefs(false);
    }
  };

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

  if (loading || !user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#F7F5F2] text-[#6B7280] space-y-3">
        <FileText className="h-8 w-8 text-[#FF6B4A] animate-pulse" />
        <div className="text-xs font-mono tracking-widest uppercase animate-pulse">Loading briefs...</div>
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
            <button onClick={() => router.push(getLocalizedPath('/dashboard'))} className="text-gray-500 hover:text-[#FF6B4A] transition-colors">Trend Intelligence</button>
            <button onClick={() => router.push(getLocalizedPath('/briefs'))} className="text-[#FF6B4A] transition-colors">{tNav('briefs')}</button>
            <button onClick={() => router.push(getLocalizedPath('/feedback'))} className="hover:text-[#FF6B4A] transition-colors flex items-center gap-1.5 text-gray-500">
              <MessageSquare className="h-4 w-4" />
              <span>{tNav('feedback')}</span>
            </button>
          </nav>

          {/* Avatar / Switcher / Settings / SignOut Right */}
          <div className="flex items-center space-x-3">
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
      <main className="flex-grow max-w-7xl mx-auto w-full py-8 px-4 sm:px-6 space-y-8 animate-fade-up">
        <div className="space-y-1">
          <h1 className="text-3xl font-black text-[#1A1A1A] tracking-tight">{tNav('briefs')}</h1>
          <p className="text-xs text-gray-500 font-medium">Browse content briefs you have generated.</p>
        </div>

        {loadingBriefs ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white border border-gray-200 rounded-2xl p-5 space-y-4 animate-pulse shadow-card">
                <div className="h-4 bg-gray-150 rounded w-1/4" />
                <div className="h-6 bg-gray-250 rounded w-3/4" />
                <div className="h-12 bg-gray-150 rounded w-full" />
              </div>
            ))}
          </div>
        ) : briefs.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-2xl p-8 text-center max-w-md mx-auto space-y-4 shadow-card">
            <p className="text-sm text-gray-500">No briefs generated yet. Go discover trends →</p>
            <button
              onClick={() => router.push(getLocalizedPath('/dashboard'))}
              className="px-6 py-2.5 bg-[#FF6B4A] hover:bg-[#e55a3a] text-white rounded-full text-xs font-semibold transition-all hover:scale-[1.02]"
            >
              Discover Trends
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {briefs.map((brief) => {
              const trendName = brief.trends?.name || 'Unknown Trend';
              const trendNiche = brief.trends?.niche || 'other';
              const trendPlatform = brief.trends?.platform || 'YOUTUBE';
              const createdAtDate = brief.created_at ? formatIST(brief.created_at) : 'Recent';

              return (
                <div key={brief.id} className="bg-white border border-gray-200 rounded-2xl p-5 hover:border-gray-300 transition-all flex flex-col justify-between h-full shadow-card border-l-4 border-l-[#FF6B4A]">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-[9px] font-bold uppercase tracking-wider text-[#FF6B4A] bg-orange-50 border border-orange-100 px-2 py-0.5 rounded-full">
                        {trendNiche}
                      </span>
                      <span className="text-[10px] font-bold tracking-wider text-gray-500 uppercase">
                        {trendPlatform}
                      </span>
                    </div>

                    <h3 className="text-xl font-bold text-[#1A1A1A] leading-tight tracking-tight">
                      {trendName}
                    </h3>

                    <p className="text-xs text-gray-655 font-medium line-clamp-2 italic bg-gray-50 border border-gray-100 p-2.5 rounded-xl">
                      "{brief.hook}"
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-4 mt-4 border-t border-gray-100">
                    <span className="text-xs font-semibold text-gray-450">
                      {createdAtDate}
                    </span>
                    <button
                      onClick={() => router.push(getLocalizedPath(`/brief/${brief.id}`))}
                      className="flex items-center gap-1.5 px-4 py-2 bg-[#FF6B4A] text-white hover:bg-[#e55a3a] hover:scale-[1.03] active:scale-95 rounded-full text-xs font-bold transition-all shadow-sm"
                    >
                      <span>View Brief</span>
                      <ChevronRight className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="w-full max-w-7xl mx-auto py-6 border-t border-gray-200 flex items-center justify-between text-xs text-gray-550 px-4 sm:px-6 mt-12">
        <div>© 2026 ViralSpy.</div>
        <div className="text-[#FF6B4A] italic">Quietly Rise</div>
      </footer>
    </div>
  );
}
