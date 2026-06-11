'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useLocale } from 'next-intl';
import { Trend } from '../types';
import TrendCard from './TrendCard';
import NicheFilter from './NicheFilter';
import LoadingSkeleton from './LoadingSkeleton';
import { supabase, isDemoModeActive, getCurrentUser } from '../lib/supabase';
import { useAIProvider } from '../hooks/useAIProvider';
import { RefreshCw } from 'lucide-react';

interface TrendFeedProps {
  trends: Trend[];
  setTrends: React.Dispatch<React.SetStateAction<Trend[]>>;
  onBriefGenerated?: () => void;
  onPollLiveData?: () => Promise<void>;
  isPollLoading?: boolean;
}

export default function TrendFeed({ trends, setTrends, onBriefGenerated, onPollLiveData, isPollLoading = false }: TrendFeedProps) {
  const router = useRouter();
  const locale = useLocale();
  const { getHeaders } = useAIProvider();
  
  const [selectedNiche, setSelectedNiche] = useState<string>('all');
  const [generatingTrendId, setGeneratingTrendId] = useState<string | null>(null);
  const [showSkeleton, setShowSkeleton] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleGenerateBrief = async (
    trendId: string,
    trendName: string,
    niche: string,
    platform: string,
    velocityScore: number,
    momentumStatus: string
  ) => {
    setGeneratingTrendId(trendId);
    
    // Trigger the skeleton loader to render after a 1-second delay so that the card's button shimmer is visible first
    const skeletonTimeout = setTimeout(() => {
      setShowSkeleton(true);
    }, 1200);

    const startTime = Date.now();
    let briefId: string | null = null;

    try {
      const user = await getCurrentUser();
      const res = await fetch('/api/brief', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getHeaders(),
          'x-locale': locale
        },
        body: JSON.stringify({
          trendId,
          userId: user?.id || 'demo-user-1234',
          trendName,
          niche,
          platform,
          velocityScore,
          momentumStatus
        })
      });
      const data = await res.json();
      if (data.success && data.data) {
        briefId = data.data.id;
        onBriefGenerated?.();

        // Track locally to increment dashboard brief count immediately
        try {
          const localBriefsStr = localStorage.getItem('viralspy_generated_briefs');
          const localBriefs = localBriefsStr ? JSON.parse(localBriefsStr) : [];
          if (Array.isArray(localBriefs)) {
            if (!localBriefs.includes(briefId)) {
              localBriefs.push(briefId);
              localStorage.setItem('viralspy_generated_briefs', JSON.stringify(localBriefs));
            }
          }
        } catch (e) {
          console.error('Local briefs tracking failed:', e);
        }
      }
    } catch (err) {
      console.error('Error generating strategist brief:', err);
    }

    // Drama check: enforce 3000ms minimum loader skeleton
    const elapsed = Date.now() - startTime;
    const remaining = Math.max(3000 - elapsed, 0);

    setTimeout(() => {
      clearTimeout(skeletonTimeout);
      setGeneratingTrendId(null);
      setShowSkeleton(false);
      if (briefId) {
        const localizedPath = locale === 'en' ? `/brief/${briefId}` : `/${locale}/brief/${briefId}`;
        router.push(localizedPath);
      } else {
        alert('Could not generate AI strategy brief. Ensure database and API connections are valid.');
      }
    }, remaining);
  };

  const handleReseed = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/seed');
      const data = await res.json();
      if (data.success) {
        setTrends(data.data);
      }
    } catch (err) {
      console.error('Failed to reseed:', err);
    } finally {
      setLoading(false);
    }
  };

  // Niche filter & top 10 sort
  const filteredTrends = trends
    .filter((t) => {
      if (t.momentum_status === 'DEAD') return false;
      if (selectedNiche === 'all') return true;
      return t.niche.toLowerCase() === selectedNiche.toLowerCase();
    })
    .sort((a, b) => b.velocity_score - a.velocity_score)
    .slice(0, 10);

  if (showSkeleton) {
    return (
      <div className="py-12 flex flex-col justify-center items-center">
        <LoadingSkeleton />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* Niche scroll row and stats info */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="w-full md:w-auto overflow-hidden">
          <NicheFilter selectedNiche={selectedNiche} onChange={setSelectedNiche} />
        </div>
        <button
          onClick={handleReseed}
          disabled={loading}
          className="flex items-center space-x-1.5 px-3 py-2 bg-white border border-gray-200 hover:border-[#FF6B4A] text-gray-655 hover:text-[#FF6B4A] rounded-xl transition-all"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Reseed intel</span>
        </button>
      </div>

      {/* Grid of cards */}
      {filteredTrends.length === 0 ? (
        <div className="border border-gray-200 rounded-2xl p-12 text-center bg-white space-y-4 shadow-card">
          <div className="text-gray-500 font-semibold text-sm uppercase">No active trends found for this niche</div>
          <button
            onClick={handleReseed}
            className="px-4 py-2 bg-[#FF6B4A] hover:bg-[#ff5a33] text-white rounded-full text-xs font-semibold transition-all hover:scale-[1.02]"
          >
            Reseed mock data
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredTrends.map((trend, idx) => {
            const delayClass = `delay-${Math.min(idx * 75, 600)}`;
            return (
              <div key={trend.id} className={`animate-fade-up ${delayClass}`}>
                <TrendCard
                  trend={trend}
                  onGenerateBrief={handleGenerateBrief}
                  isGenerating={generatingTrendId === trend.id}
                />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
