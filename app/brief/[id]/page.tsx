'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '../../../components/AuthProvider';
import { Brief, Trend } from '../../../types';
import BriefCard from '../../../components/BriefCard';
import Logo from '../../../components/Logo';
import { Eye } from 'lucide-react';

const MESSAGES = [
  "⚡ Detecting trend signals...", 
  "🧠 Analysing velocity patterns...", 
  "✍️ Writing your hook...", 
  "🎯 Building content angles..."
];

export default function BriefPage() {
  const router = useRouter();
  const { id } = useParams();
  const { user, loading } = useAuth();
  
  const [brief, setBrief] = useState<Brief | null>(null);
  const [trend, setTrend] = useState<Trend | null>(null);
  const [fetching, setFetching] = useState(true);
  const [regenerating, setRegenerating] = useState(false);
  const [error, setError] = useState('');

  // Loading Screen States
  const [progress, setProgress] = useState(0);
  const [messageIndex, setMessageIndex] = useState(0);

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
        setError(result.error || 'Content brief not found.');
      }
    } catch (err) {
      console.error('Failed to load content brief:', err);
      setError('Connection failed. Could not load strategist brief.');
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/');
    } else if (user && id) {
      loadBriefData();
    }
  }, [user, loading, id, router]);

  // Progress Bar Animation (0% to 90% over 8 seconds, 100% when loaded)
  useEffect(() => {
    if (!fetching) {
      setProgress(100);
      return;
    }
    
    setProgress(0);
    const intervalTime = 100; // Update every 100ms
    const totalDuration = 8000; // 8 seconds
    const steps = totalDuration / intervalTime;
    const increment = 90 / steps;

    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 90) {
          clearInterval(timer);
          return 90;
        }
        return Math.min(prev + increment, 90);
      });
    }, intervalTime);

    return () => clearInterval(timer);
  }, [fetching]);

  // Cycling Status Messages every 2000ms
  useEffect(() => {
    if (!fetching) return;
    
    setMessageIndex(0);
    const interval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % MESSAGES.length);
    }, 2000);
    
    return () => clearInterval(interval);
  }, [fetching]);

  const handleRegenerate = async () => {
    if (!brief || !trend) return;
    setRegenerating(true);
    setError('');
    
    try {
      const res = await fetch('/api/brief', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
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
        router.replace(`/brief/${data.data.id}`);
      } else {
        alert(data.error || 'Brief regeneration failed.');
      }
    } catch (err) {
      console.error('Regeneration error:', err);
      alert('Could not connect to the brief generation engine.');
    } finally {
      setRegenerating(false);
    }
  };

  const isShowLoadingScreen = fetching || (loading && !user);

  return (
    <div className="min-h-screen bg-[#F7F5F2] text-[#1A1A1A] flex flex-col justify-between font-sans relative overflow-hidden">
      
      {/* Dynamic Centered Full-Page Loading Screen with 300ms Cross-fade */}
      <div 
        className={`fixed inset-0 bg-[#F7F5F2] z-50 flex flex-col items-center justify-center transition-opacity duration-300 ${
          isShowLoadingScreen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      >
        <div className="flex flex-col items-center justify-center space-y-6 max-w-sm w-full px-6">
          <Logo />
          
          {/* Animated Progress Bar */}
          <div className="w-64 h-1.5 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className="bg-[#FF6B4A] h-full animate-pulse transition-all duration-100 ease-out" 
              style={{ width: `${progress}%` }}
            />
          </div>

          <div className="text-center space-y-1">
            {/* Cycling Status Messages */}
            <p className="text-sm font-semibold text-[#1A1A1A] transition-all duration-300">
              {MESSAGES[messageIndex]}
            </p>
            {/* Small Muted Text */}
            <p className="text-xs text-gray-400 font-medium">
              Usually takes 5-8 seconds
            </p>
          </div>
        </div>
      </div>

      {/* Main Content Layout with 300ms cross-fade */}
      <div 
        className={`flex-grow flex flex-col justify-between w-full transition-opacity duration-300 ${
          !isShowLoadingScreen ? 'opacity-100' : 'opacity-0'
        }`}
      >
        {error || !brief || !trend ? (
          <div className="flex-grow flex flex-col justify-between p-4 sm:p-6">
            <header className="max-w-xl mx-auto w-full py-4 border-b border-gray-200 text-xs font-bold text-gray-400">
              VIRALSPY // ERROR
            </header>
            <main className="max-w-md mx-auto text-center space-y-6 py-12">
              <div className="p-4 bg-red-50 border border-red-200 text-red-655 text-xs font-semibold rounded-2xl">
                {error || 'The requested content strategy brief could not be located.'}
              </div>
              <button
                onClick={() => router.push('/dashboard')}
                className="px-5 py-2.5 bg-[#FF6B4A] hover:bg-[#ff5a33] text-white rounded-full text-xs font-semibold uppercase tracking-wider transition-all hover:scale-[1.02]"
              >
                Return to Signal Feed
              </button>
            </main>
            <footer className="max-w-xl mx-auto w-full py-4 border-t border-gray-200 text-center text-[10px] text-gray-500 font-mono uppercase">
              viralspy
            </footer>
          </div>
        ) : (
          <>
            <main className="flex-grow max-w-[720px] mx-auto w-full py-6 px-4 sm:px-0">
              <BriefCard
                brief={brief}
                trend={trend}
                onRegenerate={handleRegenerate}
                onBack={() => router.push('/dashboard')}
                isRegenerating={regenerating}
              />
            </main>
            <footer className="max-w-[720px] mx-auto w-full py-6 px-4 sm:px-0 border-t border-gray-200 flex justify-between items-center text-xs text-gray-500 mt-12">
              <div>© 2026 ViralSpy.</div>
              <div className="text-[#FF6B4A] italic">Quietly Rise</div>
            </footer>
          </>
        )}
      </div>

    </div>
  );
}
