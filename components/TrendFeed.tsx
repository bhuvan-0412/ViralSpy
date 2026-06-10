'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Trend } from '../types';
import TrendCard from './TrendCard';
import NicheFilter from './NicheFilter';
import LoadingSkeleton from './LoadingSkeleton';
import { supabase, isDemoModeActive, getCurrentUser } from '../lib/supabase';
import { RefreshCw, Play } from 'lucide-react';

interface TrendFeedProps {
  initialTrends: Trend[];
}

export default function TrendFeed({ initialTrends }: TrendFeedProps) {
  const router = useRouter();
  const [trends, setTrends] = useState<Trend[]>(initialTrends);
  const [selectedNiche, setSelectedNiche] = useState<string>('all');
  const [generatingTrendId, setGeneratingTrendId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Sync state if initial trends changes
  useEffect(() => {
    setTrends(initialTrends);
  }, [initialTrends]);

  // Realtime Database Subscriptions
  useEffect(() => {
    if (!supabase || isDemoModeActive()) return;

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
  }, []);

  // Demo Mode Realtime simulation
  useEffect(() => {
    if (!isDemoModeActive()) return;

    // Simulate "5-4-3-2-1 grounding method" ticking up in real-time
    const interval = setInterval(() => {
      setTrends((current) =>
        current.map((t) => {
          if (t.name === '5-4-3-2-1 grounding method') {
            // Tick up score by 0.5 to 2.5
            const tick = parseFloat((Math.random() * 2 + 0.5).toFixed(2));
            const newScore = parseFloat((t.velocity_score + tick).toFixed(2));
            
            // Recalculate status
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
  }, []);

  const handleGenerateBrief = async (trendId: string) => {
    setGeneratingTrendId(trendId);
    const startTime = Date.now();
    let briefId: string | null = null;

    try {
      const user = await getCurrentUser();
      const res = await fetch('/api/brief', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ trendId, userId: user?.id || 'demo-user-1234' })
      });
      const data = await res.json();
      if (data.success && data.data) {
        briefId = data.data.id;
      }
    } catch (err) {
      console.error('Error generating strategist brief:', err);
    }

    // Drama check: enforce 3000ms minimum loader skeleton
    const elapsed = Date.now() - startTime;
    const remaining = Math.max(3000 - elapsed, 0);

    setTimeout(() => {
      setGeneratingTrendId(null);
      if (briefId) {
        router.push(`/brief/${briefId}`);
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

  if (generatingTrendId) {
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
          className="flex items-center space-x-1.5 px-3 py-1.5 bg-gray-900 border border-gray-800 hover:border-gray-700 text-xs font-mono font-bold uppercase tracking-wider text-gray-400 hover:text-white rounded-lg transition-all"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Reseed intel</span>
        </button>
      </div>

      {/* Grid of cards */}
      {filteredTrends.length === 0 ? (
        <div className="border border-gray-800 rounded-xl p-12 text-center bg-gray-900/50 space-y-4">
          <div className="text-gray-500 font-mono text-sm uppercase">No active trends found for this niche</div>
          <button
            onClick={handleReseed}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-xs font-mono font-bold uppercase tracking-wider transition-all"
          >
            Reseed mock data
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredTrends.map((trend) => (
            <TrendCard
              key={trend.id}
              trend={trend}
              onGenerateBrief={handleGenerateBrief}
              isGenerating={generatingTrendId === trend.id}
            />
          ))}
        </div>
      )}
    </div>
  );
}
