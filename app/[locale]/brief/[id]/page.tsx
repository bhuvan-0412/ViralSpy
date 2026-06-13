'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import { useAuth } from '../../../../components/AuthProvider';
import { Brief, Trend } from '../../../../types';
import BriefCard from '../../../../components/BriefCard';
import Logo from '../../../../components/Logo';
import { Eye } from 'lucide-react';
import { useAIProvider } from '../../../../hooks/useAIProvider';
import { createClient } from '../../../../lib/supabase';
import Toast from '../../../../components/Toast';

export default function BriefPage() {
  const router = useRouter();
  const locale = useLocale();
  const { id } = useParams();
  const { user, loading } = useAuth();
  const { getHeaders } = useAIProvider();
  
  const t = useTranslations('brief');
  const tErrors = useTranslations('errors');

  const [brief, setBrief] = useState<Brief | null>(null);
  const [trend, setTrend] = useState<Trend | null>(null);
  const [fetching, setFetching] = useState(true);
  const [regenerating, setRegenerating] = useState(false);
  const [error, setError] = useState('');

  const [isSaved, setIsSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showToast, setShowToast] = useState(false);

  // Loading Screen States
  const isLoading = fetching || (loading && !user);
  const [briefMessageIndex, setBriefMessageIndex] = useState(0);
  const [briefProgress, setBriefProgress] = useState(0);

  const briefMessages = [
    "⚡ Detecting trend signals...",
    "🧠 Analysing velocity patterns...",
    "✍️ Writing your hook...",
    "🎯 Building content angles...",
    "🏷️ Selecting top hashtags...",
    "📝 Writing script outline...",
    "✅ Finalising your brief..."
  ];

  const loadBriefData = async (forceLoad = false) => {
    if (!id) return;
    if (forceLoad) setFetching(true);
    
    setError('');
    try {
      const res = await fetch(`/api/brief?id=${id}`);
      const result = await res.json();
      
      if (result.success && result.data) {
        setBrief(result.data);
        
        // Load trend information associated with the brief
        const trendId = result.data.trend_id;
        const trendRes = await fetch(`/api/trends?id=${trendId}`);
        const trendResult = await trendRes.json();
        if (trendResult.success && trendResult.data) {
          setTrend(trendResult.data);
        }
      } else {
        setError(result.error || tErrors('trendNotFound'));
      }
    } catch (err) {
      console.error('Failed to load content brief:', err);
      setError('Connection failed. Could not load strategist brief.');
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    if (id) {
      loadBriefData();
    }
  }, [id]);

  // Check if already saved on mount:
  useEffect(() => {
    const checkSaved = async () => {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        
        const { data } = await supabase
          .from('saved_trends')
          .select('id')
          .eq('user_id', user.id)
          .eq('trend_id', brief?.trend_id)
          .single();
        
        if (data) setIsSaved(true);
      } catch (err) {
        console.error('Check saved error:', err);
      }
    };
    if (brief?.trend_id) checkSaved();
  }, [brief]);

  // Save handler:
  const handleSave = async () => {
    setIsSaving(true);
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        alert('Please sign in to save briefs');
        return;
      }
      
      if (isSaved) {
        // Unsave
        await supabase
          .from('saved_trends')
          .delete()
          .eq('user_id', user.id)
          .eq('trend_id', brief?.trend_id);
        setIsSaved(false);
      } else {
        // Save
        await supabase
          .from('saved_trends')
          .insert({
            user_id: user.id,
            trend_id: brief?.trend_id,
            saved_at: new Date().toISOString()
          });
        setIsSaved(true);
        setShowToast(true);
      }
    } catch (e) {
      console.error('Save error:', e);
    } finally {
      setIsSaving(false);
    }
  };

  useEffect(() => {
    if (!isLoading) return;
    
    // Cycle messages every 4 seconds
    const msgInterval = setInterval(() => {
      setBriefMessageIndex((prev) => 
        prev < briefMessages.length - 1 ? prev + 1 : prev
      );
    }, 4000);
    
    // Progress bar fills to 90% over 28 seconds
    // then waits for actual completion
    const progressInterval = setInterval(() => {
      setBriefProgress((prev) => 
        prev < 90 ? prev + (90 / 28) : prev
      );
    }, 1000);
    
    return () => {
      clearInterval(msgInterval);
      clearInterval(progressInterval);
    };
  }, [isLoading]);

  // When loading completes, fill to 100%
  useEffect(() => {
    if (!isLoading && briefProgress > 0) {
      setBriefProgress(100);
    }
  }, [isLoading, briefProgress]);

  const handleRegenerate = async () => {
    if (!brief || !trend) return;
    setRegenerating(true);
    setError('');
    
    try {
      const res = await fetch('/api/brief', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getHeaders(),
          'x-locale': locale
        },
        body: JSON.stringify({
          trendId: trend.id,
          userId: user?.id || 'demo-user',
          forceRegenerate: true
        })
      });
      const data = await res.json();
      if (data.success && data.data) {
        setBrief(data.data);
        const localizedPath = locale === 'en' ? `/brief/${data.data.id}` : `/${locale}/brief/${data.data.id}`;
        router.replace(localizedPath);
      } else {
        alert(data.error || tErrors('briefFailed'));
      }
    } catch (err) {
      console.error('Regeneration error:', err);
      alert('Could not connect to the brief generation engine.');
    } finally {
      setRegenerating(false);
    }
  };

  const localizedDashboardPath = locale === 'en' ? '/dashboard' : `/${locale}/dashboard`;
  const getLocalizedPath = (path: string) => locale === 'en' ? path : `/${locale}${path}`;

  return (
    <div className="min-h-screen bg-[#F7F5F2] text-[#1A1A1A] flex flex-col justify-between font-sans relative overflow-hidden">
      
      {isLoading ? (
        <div className="min-h-screen bg-[#F7F5F2] flex flex-col items-center justify-center px-4 w-full z-50">
          {/* Logo */}
          <div className="mb-8">
            <Logo />
          </div>
          
          {/* Animated orb */}
          <div className="relative w-24 h-24 mb-8">
            <div className="absolute inset-0 rounded-full bg-[#FF6B4A]/20 animate-ping"/>
            <div className="absolute inset-2 rounded-full bg-[#FF6B4A]/30 animate-ping animation-delay-150"/>
            <div className="absolute inset-4 rounded-full bg-[#FF6B4A] flex items-center justify-center">
              <svg className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
          </div>
          
          {/* Progress bar */}
          <div className="w-64 bg-gray-200 rounded-full h-1.5 mb-4">
            <div 
              className="bg-[#FF6B4A] h-1.5 rounded-full transition-all duration-[1000ms] ease-linear"
              style={{ width: `${briefProgress}%` }}
            />
          </div>
          
          {/* Cycling message */}
          <p className="text-sm font-semibold text-[#1A1A1A] mb-2 text-center animate-fade-in">
            {briefMessages[briefMessageIndex]}
          </p>
          
          {/* Time estimate */}
          <p className="text-xs text-gray-400 text-center">
            Usually 5–30 seconds with local AI
          </p>
          
          {/* Tip card */}
          <div className="mt-8 bg-white rounded-2xl border border-gray-100 shadow-sm p-4 max-w-xs text-center">
            <p className="text-xs text-gray-500 mb-2">
              💡 Pro tip
            </p>
            <p className="text-xs text-gray-600">
              Switch to <strong>Groq</strong> in Settings for 3-second briefs — it's free!
            </p>
            <a 
              href={getLocalizedPath('/settings')}
              className="text-[#FF6B4A] text-xs font-bold hover:underline mt-1 block"
            >
              Go to Settings →
            </a>
          </div>
        </div>
      ) : (
        <div className="flex-grow flex flex-col justify-between w-full animate-fade-up">
          {error || !brief || !trend ? (
            <div className="flex-grow flex flex-col justify-between p-4 sm:p-6">
              <header className="max-w-xl mx-auto w-full py-4 border-b border-gray-200 text-xs font-bold text-gray-400">
                VIRALSPY // ERROR
              </header>
              <main className="max-w-md mx-auto text-center space-y-6 py-12">
                <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-card max-w-sm mx-auto space-y-4">
                  <h3 className="text-lg font-bold text-[#1A1A1A]">Brief not found</h3>
                  <p className="text-xs text-gray-555">
                    {error || 'The requested content strategy brief could not be located.'}
                  </p>
                  <button
                    onClick={() => router.push(localizedDashboardPath)}
                    className="px-4 py-2 bg-[#FF6B4A] hover:bg-[#e55a3a] text-white rounded-full text-xs font-semibold transition-all"
                  >
                    Back
                  </button>
                </div>
              </main>
              <footer className="max-w-xl mx-auto w-full py-4 border-t border-gray-200 text-center text-[10px] text-gray-550 font-mono uppercase">
                viralspy
              </footer>
            </div>
          ) : (
            <>
              <main className="flex-grow max-w-[720px] mx-auto w-full py-6 px-4 sm:px-0">
                {/* Brief Freshness Banner */}
                {(() => {
                  const briefAge = brief.created_at
                    ? Math.floor((Date.now() - new Date(brief.created_at).getTime()) / (1000 * 60 * 60))
                    : 0;
                  const isOutdated = briefAge >= 6;
                  return (
                    <div className={`flex items-center justify-between px-4 py-2 rounded-xl text-sm mb-4 ${
                      isOutdated
                        ? 'bg-amber-50 border border-amber-200 text-amber-700'
                        : 'bg-green-50 border border-green-200 text-green-700'
                    }`}>
                      <span>
                        {isOutdated ? '⚠️' : '✅'}
                        {briefAge === 0
                          ? ' Generated just now'
                          : ` Generated ${briefAge} hour${briefAge === 1 ? '' : 's'} ago`}
                        {isOutdated && ' · This brief may be outdated'}
                      </span>
                      <button
                        onClick={handleRegenerate}
                        disabled={regenerating}
                        className="flex items-center gap-1 px-3 py-1 bg-[#FF6B4A] text-white rounded-lg text-xs font-semibold hover:bg-[#e55a3a] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {regenerating ? '...' : '↻ Refresh Brief'}
                      </button>
                    </div>
                  );
                })()}
                <BriefCard
                  brief={brief}
                  trend={trend}
                  onRegenerate={handleRegenerate}
                  onBack={() => router.push(localizedDashboardPath)}
                  isRegenerating={regenerating}
                  isSaved={isSaved}
                  isSaving={isSaving}
                  onSave={handleSave}
                />
              </main>
              {showToast && (
                <Toast 
                  message="✅ Brief saved to My Briefs"
                  link={{ label: "View My Briefs", href: getLocalizedPath('/briefs') }}
                  onClose={() => setShowToast(false)}
                />
              )}
              <footer className="max-w-[720px] mx-auto w-full py-6 px-4 sm:px-0 border-t border-gray-200 flex justify-between items-center text-xs text-gray-550 mt-12">
                <div>© 2026 ViralSpy.</div>
                <div className="text-[#FF6B4A] italic">Quietly Rise</div>
              </footer>
            </>
          )}
        </div>
      )}
    </div>
  );
}
