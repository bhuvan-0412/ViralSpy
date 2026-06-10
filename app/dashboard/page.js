'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getCurrentUser, getUserNiches, signOutUser, isDemoModeActive } from '../../lib/supabase';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Skeleton } from '../../components/ui/Skeleton';
import Sparkline from '../../components/Sparkline';
import { LogOut, Sliders, RefreshCw, Sparkles } from 'lucide-react';

// Platform icons as lightweight inline SVGs to avoid compilation errors
const TikTokIcon = () => (
  <svg className="w-3.5 h-3.5 fill-current text-[#F4F2ED]/70" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.02 1.59 4.23.94 1.14 2.29 1.88 3.72 2.13v3.9c-1.39-.08-2.74-.58-3.87-1.42-.5-.38-.94-.84-1.31-1.37v7.55c.02 1.48-.3 2.97-1.02 4.27-.72 1.34-1.88 2.4-3.23 3.01-1.47.69-3.15.91-4.74.61-1.58-.27-3.08-1.09-4.18-2.28C2.28 19.01 1.6 17.38 1.6 15.67c-.02-1.8 1.1-3.46 2.78-4.13 1.34-.56 2.87-.58 4.23-.04v3.9c-1.06-.44-2.27-.23-3.12.5-.78.63-1.2 1.63-1.14 2.64.04 1.13.78 2.14 1.8 2.59 1 .45 2.18.25 3-.47.66-.55.97-1.42.94-2.27V.02h3.425z" />
  </svg>
);

const YouTubeIcon = () => (
  <svg className="w-3.5 h-3.5 fill-current text-[#F4F2ED]/70" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path d="M23.498 6.163a3.003 3.003 0 0 0-2.11-2.107C19.522 3.5 12 3.5 12 3.5s-7.522 0-9.388.556a3.003 3.003 0 0 0-2.11 2.107C0 8.029 0 12 0 12s0 3.971.502 5.837a3.003 3.003 0 0 0 2.11 2.107C4.478 20.5 12 20.5 12 20.5s7.522 0 9.388-.556a3.003 3.003 0 0 0 2.11-2.107C24 15.971 24 12 24 12s0-3.971-.502-5.837zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
  </svg>
);

const InstagramIcon = () => (
  <svg className="w-3.5 h-3.5 text-[#F4F2ED]/70" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
  </svg>
);

const PlatformIcon = ({ platform }) => {
  switch (platform?.toLowerCase()) {
    case 'tiktok':
      return <TikTokIcon />;
    case 'youtube':
      return <YouTubeIcon />;
    case 'instagram':
      return <InstagramIcon />;
    default:
      return null;
  }
};

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [niches, setNiches] = useState([]);
  const [trends, setTrends] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingTrends, setLoadingTrends] = useState(true);
  const [activeFilter, setActiveFilter] = useState('ALL'); // 'ALL' | 'MY_FEED' | specific niche
  const [generatingBriefId, setGeneratingBriefId] = useState(null);
  const [isDemo, setIsDemo] = useState(false);
  const [seeding, setSeeding] = useState(false);

  useEffect(() => {
    async function initDashboard() {
      try {
        const currentUser = await getCurrentUser();
        if (!currentUser) {
          router.replace('/');
          return;
        }
        setUser(currentUser);
        setIsDemo(isDemoModeActive());

        const userNiches = await getUserNiches();
        setNiches(userNiches);
        
        // If user has niches, default to MY_FEED, else ALL
        if (userNiches && userNiches.length > 0) {
          setActiveFilter('MY_FEED');
        } else {
          setActiveFilter('ALL');
        }

        await fetchTrends();
      } catch (err) {
        console.error('Initialization error:', err);
      } finally {
        setLoading(false);
      }
    }
    initDashboard();
  }, [router]);

  const fetchTrends = async () => {
    setLoadingTrends(true);
    try {
      const res = await fetch('/api/trends');
      const data = await res.json();
      if (data.success) {
        setTrends(data.data);
      }
    } catch (err) {
      console.error('Error fetching trends:', err);
    } finally {
      setLoadingTrends(false);
    }
  };

  const handleSignOut = async () => {
    await signOutUser();
    router.push('/');
  };

  const handleSeedData = async () => {
    setSeeding(true);
    try {
      const res = await fetch('/api/seed');
      const data = await res.json();
      if (data.success) {
        setTrends(data.data);
      } else {
        alert('Seeding failed: ' + data.message);
      }
    } catch (err) {
      console.error('Error seeding data:', err);
    } finally {
      setSeeding(false);
    }
  };

  const handleGenerateBrief = async (trendId) => {
    setGeneratingBriefId(trendId);
    try {
      const res = await fetch('/api/generate-brief', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ trendId }),
      });
      const data = await res.json();
      if (data.success && data.data?.id) {
        router.push(`/brief/${data.data.id}`);
      } else {
        alert(data.error || 'AI Brief generation failed. Local simulation returned an error.');
        setGeneratingBriefId(null);
      }
    } catch (err) {
      console.error('Error generating brief:', err);
      alert('Failed to connect to the brief generation engine.');
      setGeneratingBriefId(null);
    }
  };

  // Filter trends based on active filter state
  const getFilteredTrends = () => {
    let list = [...trends];
    if (activeFilter === 'MY_FEED') {
      if (niches && niches.length > 0) {
        list = list.filter(t => niches.includes(t.niche));
      }
    } else if (activeFilter !== 'ALL') {
      list = list.filter(t => t.niche === activeFilter.toLowerCase());
    }
    // SpecKit Rule: Always show exactly top 10 trends sorted by velocity
    return list.sort((a, b) => b.velocity_score - a.velocity_score).slice(0, 10);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#1A1A1A] flex flex-col items-center justify-center space-y-3">
        <div className="text-[#F4F2ED]/60 text-[10px] font-mono tracking-widest uppercase animate-pulse">
          SYNCHRONIZING TREND DATA...
        </div>
      </div>
    );
  }

  const filteredTrends = getFilteredTrends();

  return (
    <div className="min-h-screen bg-[#1A1A1A] text-[#F4F2ED] flex flex-col justify-between px-4 sm:px-6 relative overflow-hidden">
      
      {/* Top Header */}
      <header className="max-w-7xl mx-auto w-full py-6 border-b border-[#F4F2ED]/10 flex items-center justify-between z-10">
        <div className="flex items-center space-x-3">
          <span className="text-sm font-bold tracking-widest font-mono uppercase">
            VIRALSPY // FEED
          </span>
          {isDemo && (
            <span className="bg-amber-500/10 text-amber-500 border border-amber-500/30 px-1.5 py-0.5 text-[8px] font-mono font-bold uppercase tracking-wider">
              DEMO MODE
            </span>
          )}
        </div>
        <div className="flex items-center space-x-4">
          <span className="hidden sm:inline text-[10px] font-mono text-[#F4F2ED]/50 uppercase tracking-widest">
            {user?.email}
          </span>
          <button
            onClick={handleSignOut}
            className="flex items-center space-x-1.5 text-[10px] font-mono text-[#F4F2ED]/60 hover:text-[#F4F2ED] uppercase tracking-widest transition-colors"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Sign Out</span>
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-grow max-w-7xl mx-auto w-full py-10 z-10">
        
        {/* Dashboard Title & Quick Stats */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-10 pb-6 border-b border-[#F4F2ED]/10">
          <div className="space-y-2">
            <h1 className="text-4xl sm:text-5xl font-black italic font-serif text-white">
              Signal Intel
            </h1>
            <p className="text-xs text-[#F4F2ED]/50 font-mono uppercase tracking-wider">
              Trends breaking within the last 48 hours relative to baseline average.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleSeedData}
              disabled={seeding || loadingTrends}
              className="font-mono text-[9px]"
            >
              <RefreshCw className={`h-3 w-3 mr-1.5 ${seeding ? 'animate-spin' : ''}`} />
              {seeding ? 'SEEDING...' : 'RE-SEED DEMO'}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push('/onboarding')}
              className="font-mono text-[9px]"
            >
              <Sliders className="h-3 w-3 mr-1.5" />
              Preferences
            </Button>
          </div>
        </div>

        {/* Filter Controls (Magazine Layout) */}
        <div className="flex flex-wrap gap-2 mb-8 border-b border-[#F4F2ED]/10 pb-4">
          <button
            onClick={() => setActiveFilter('ALL')}
            className={`px-4 py-2 font-mono text-[10px] uppercase tracking-wider font-bold transition-all ${
              activeFilter === 'ALL'
                ? 'bg-[#F4F2ED] text-[#1A1A1A]'
                : 'bg-transparent text-[#F4F2ED]/60 border border-[#F4F2ED]/10 hover:border-[#F4F2ED]/30'
            }`}
          >
            All Breakouts
          </button>

          {niches && niches.length > 0 && (
            <button
              onClick={() => setActiveFilter('MY_FEED')}
              className={`px-4 py-2 font-mono text-[10px] uppercase tracking-wider font-bold transition-all ${
                activeFilter === 'MY_FEED'
                  ? 'bg-[#F4F2ED] text-[#1A1A1A]'
                  : 'bg-transparent text-[#F4F2ED]/60 border border-[#F4F2ED]/10 hover:border-[#F4F2ED]/30'
              }`}
            >
              My Feed ({niches.length})
            </button>
          )}

          {niches.map(niche => (
            <button
              key={niche}
              onClick={() => setActiveFilter(niche.toUpperCase())}
              className={`px-4 py-2 font-mono text-[10px] uppercase tracking-wider font-bold transition-all ${
                activeFilter === niche.toUpperCase()
                  ? 'bg-[#F4F2ED] text-[#1A1A1A]'
                  : 'bg-transparent text-[#F4F2ED]/60 border border-[#F4F2ED]/10 hover:border-[#F4F2ED]/30'
              }`}
            >
              {niche}
            </button>
          ))}
        </div>

        {/* Main Feed Grid */}
        {loadingTrends ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="border border-[#F4F2ED]/10 p-6 space-y-4">
                <div className="flex justify-between">
                  <Skeleton className="h-4 w-12" />
                  <Skeleton className="h-4 w-16" />
                </div>
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-10 w-full" />
                <div className="flex justify-between pt-4 border-t border-[#F4F2ED]/10">
                  <Skeleton className="h-6 w-20" />
                  <Skeleton className="h-8 w-24" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredTrends.length === 0 ? (
          <div className="border border-[#F4F2ED]/10 p-12 text-center space-y-4">
            <p className="text-sm font-mono text-[#F4F2ED]/60 uppercase tracking-widest">
              No trends detected for this filter.
            </p>
            <Button onClick={handleSeedData}>
              Seed Demo Database
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTrends.map((trend, index) => {
              const isExploding = trend.momentum_status === 'EXPLODING' || trend.velocity_score > 300 || index === 0;
              const isGenerating = generatingBriefId === trend.id;

              if (isGenerating) {
                // Return SpecKit-compliant flat skeleton card overlay
                return (
                  <div key={trend.id} className="bg-[#1A1A1A] border border-[#F4F2ED]/25 p-6 h-[320px] flex flex-col justify-between">
                    <div className="space-y-4 animate-pulse">
                      <div className="flex justify-between items-center">
                        <Skeleton className="h-3 w-16 bg-[#F4F2ED]/10" />
                        <Skeleton className="h-4 w-20 bg-[#F4F2ED]/10" />
                      </div>
                      <div className="space-y-2">
                        <Skeleton className="h-5 w-full bg-[#F4F2ED]/10" />
                        <Skeleton className="h-5 w-5/6 bg-[#F4F2ED]/10" />
                      </div>
                      <div className="h-20 bg-[#F4F2ED]/5 flex items-center justify-center">
                        <span className="text-[9px] font-mono text-[#F4F2ED]/40 tracking-widest uppercase">
                          AI WRITING CONTENT BRIEF...
                        </span>
                      </div>
                    </div>
                    <Skeleton className="h-10 w-full bg-[#F4F2ED]/15" />
                  </div>
                );
              }

              return (
                <Card
                  key={trend.id}
                  className={`flex flex-col justify-between transition-all duration-300 group hover:border-[#F4F2ED]/25 hover:-translate-y-0.5 ${
                    isExploding ? 'exploding-card-pulse' : 'border-[#F4F2ED]/10'
                  }`}
                >
                  <CardHeader className="p-6 border-b border-[#F4F2ED]/10 flex flex-row items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <PlatformIcon platform={trend.platform} />
                      <span className="text-[10px] font-mono text-[#F4F2ED]/50 uppercase">
                        {trend.platform}
                      </span>
                    </div>
                    <Badge variant={isExploding ? 'exploding' : trend.momentum_status?.toLowerCase()}>
                      {isExploding ? 'EXPLODING' : trend.momentum_status}
                    </Badge>
                  </CardHeader>

                  <CardContent className="p-6 space-y-4 flex-grow">
                    <div className="min-h-[50px]">
                      <h3 className="text-lg font-bold font-serif text-white tracking-tight group-hover:text-[#F4F2ED] transition-colors leading-tight">
                        {trend.name}
                      </h3>
                    </div>

                    <div className="flex items-center justify-between border-t border-b border-[#F4F2ED]/5 py-3">
                      <div className="space-y-0.5">
                        <span className="block text-[8px] font-mono text-[#F4F2ED]/40 uppercase tracking-wider">
                          VELOCITY
                        </span>
                        <span className="font-mono text-base font-bold text-white">
                          {trend.velocity_score}%
                        </span>
                      </div>

                      <div className="space-y-0.5 text-right">
                        <span className="block text-[8px] font-mono text-[#F4F2ED]/40 uppercase tracking-wider">
                          VOLUME
                        </span>
                        <span className="font-mono text-xs text-[#F4F2ED]/80 font-bold">
                          {(trend.post_count / 1000).toFixed(1)}K posts
                        </span>
                      </div>

                      <div className="space-y-0.5 text-right">
                        <span className="block text-[8px] font-mono text-[#F4F2ED]/40 uppercase tracking-wider">
                          NICHE
                        </span>
                        <span className="font-mono text-[9px] text-[#F4F2ED] border border-[#F4F2ED]/20 px-1.5 py-0.5 uppercase tracking-wider font-bold">
                          {trend.niche}
                        </span>
                      </div>
                    </div>

                    {/* Sparkline curve */}
                    <div className="h-10 w-full pt-1">
                      <Sparkline
                        data={trend.raw_data?.sparkline || [10, 15, 20, 25]}
                        status={trend.momentum_status}
                      />
                    </div>
                  </CardContent>

                  <CardFooter className="p-6 border-t border-[#F4F2ED]/10 flex items-center justify-between">
                    <div className="text-[8px] font-mono text-[#F4F2ED]/40 uppercase tracking-wider">
                      ID: {trend.id.substring(0, 8)}
                    </div>
                    <Button
                      variant={isExploding ? 'primary' : 'outline'}
                      size="sm"
                      onClick={() => handleGenerateBrief(trend.id)}
                    >
                      Generate Brief
                    </Button>
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        )}
      </main>

      {/* Footer containing the brand signature watermark */}
      <footer className="w-full max-w-7xl mx-auto py-8 border-t border-[#F4F2ED]/10 flex flex-col sm:flex-row items-center justify-between text-[10px] font-mono text-[#F4F2ED]/30 uppercase tracking-widest z-10">
        <div>
          © 2026 ViralSpy.
        </div>
        <div className="italic text-[#F4F2ED]/60 font-serif lowercase tracking-normal text-xs font-semibold">
          — ViralSpy
        </div>
      </footer>
    </div>
  );
}
