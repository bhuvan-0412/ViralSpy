'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '../../../components/AuthProvider';
import { Brief, Trend } from '../../../types';
import BriefCard from '../../../components/BriefCard';
import { Eye } from 'lucide-react';

export default function BriefPage() {
  const router = useRouter();
  const { id } = useParams();
  const { user, loading } = useAuth();
  
  const [brief, setBrief] = useState<Brief | null>(null);
  const [trend, setTrend] = useState<Trend | null>(null);
  const [fetching, setFetching] = useState(true);
  const [regenerating, setRegenerating] = useState(false);
  const [error, setError] = useState('');

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
        // Refresh router/view
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

  if (loading || fetching) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-950 text-gray-500 space-y-3">
        <Eye className="h-8 w-8 text-[#7F77DD] animate-pulse" />
        <div className="text-xs font-mono tracking-widest uppercase animate-pulse">Decrypting Brief...</div>
      </div>
    );
  }

  if (error || !brief || !trend) {
    return (
      <div className="min-h-screen bg-gray-950 text-gray-100 flex flex-col justify-between p-6">
        <header className="max-w-xl mx-auto w-full py-4 border-b border-gray-900 text-xs font-mono font-bold text-gray-400">
          VIRALSPY // ERROR
        </header>
        <main className="max-w-md mx-auto text-center space-y-6 py-12">
          <div className="p-4 bg-red-950/20 border border-red-500/30 text-red-400 text-xs font-mono rounded-xl uppercase">
            {error || 'The requested content strategy brief could not be located.'}
          </div>
          <button
            onClick={() => router.push('/dashboard')}
            className="px-4 py-2 bg-gray-900 border border-gray-800 text-gray-300 hover:text-white rounded-lg text-xs font-mono font-bold uppercase tracking-wider transition-all"
          >
            Return to Signal Feed
          </button>
        </main>
        <footer className="max-w-xl mx-auto w-full py-4 border-t border-gray-900 text-center text-[10px] text-gray-600 font-mono uppercase">
          viralspy
        </footer>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 flex flex-col justify-between p-4 sm:p-6">
      <main className="flex-grow max-w-[680px] mx-auto w-full py-6">
        <BriefCard
          brief={brief}
          trend={trend}
          onRegenerate={handleRegenerate}
          onBack={() => router.push('/dashboard')}
          isRegenerating={regenerating}
        />
      </main>
      <footer className="max-w-[680px] mx-auto w-full py-6 border-t border-gray-900 flex justify-between items-center text-[10px] font-mono text-gray-500 uppercase tracking-widest mt-12">
        <div>© 2026 ViralSpy.</div>
        <div className="text-purple-500 italic">Quietly Rise</div>
      </footer>
    </div>
  );
}
