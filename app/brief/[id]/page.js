'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { getCurrentUser, isDemoModeActive } from '../../../lib/supabase';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import { ArrowLeft, Copy, Check, Calendar, TrendingUp, Video, Hash } from 'lucide-react';

export default function BriefDetailsPage() {
  const router = useRouter();
  const { id: briefId } = useParams();
  
  const [user, setUser] = useState(null);
  const [brief, setBrief] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    async function loadBriefAndUser() {
      try {
        const currentUser = await getCurrentUser();
        if (!currentUser) {
          router.replace('/');
          return;
        }
        setUser(currentUser);

        if (!briefId) return;

        const res = await fetch(`/api/brief?id=${briefId}`);
        const data = await res.json();
        if (data.success && data.data) {
          setBrief(data.data);
        } else {
          setError(data.error || 'Failed to load content brief.');
        }
      } catch (err) {
        console.error('Error loading brief page:', err);
        setError('Connection error. Could not retrieve content brief.');
      } finally {
        setLoading(false);
      }
    }
    loadBriefAndUser();
  }, [briefId, router]);

  const handleCopyHook = () => {
    if (!brief?.hook) return;
    navigator.clipboard.writeText(brief.hook)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      })
      .catch((err) => {
        console.error('Copy failed:', err);
      });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#1A1A1A] flex flex-col items-center justify-center space-y-3">
        <div className="text-[#F4F2ED]/60 text-[10px] font-mono tracking-widest uppercase animate-pulse">
          DECRYPTING STRATEGY DOSSIER...
        </div>
      </div>
    );
  }

  if (error || !brief) {
    return (
      <div className="min-h-screen bg-[#1A1A1A] text-[#F4F2ED] flex flex-col justify-between px-4 sm:px-6">
        <header className="max-w-7xl mx-auto w-full py-6 border-b border-[#F4F2ED]/10">
          <span className="text-sm font-bold tracking-widest font-mono uppercase">
            VIRALSPY // ERROR
          </span>
        </header>
        <main className="flex-grow flex flex-col items-center justify-center max-w-md mx-auto text-center space-y-6">
          <div className="border border-red-500/30 p-6 bg-red-500/5 text-red-400 font-mono text-xs uppercase tracking-wider">
            {error || 'Requested brief was not found.'}
          </div>
          <Button variant="outline" onClick={() => router.push('/dashboard')}>
            Return to Dashboard
          </Button>
        </main>
        <footer className="max-w-7xl mx-auto w-full py-6 border-t border-[#F4F2ED]/10 text-center">
          <span className="italic text-[#F4F2ED]/60 font-serif">— ViralSpy</span>
        </footer>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#1A1A1A] text-[#F4F2ED] flex flex-col justify-between px-4 sm:px-6 relative overflow-hidden">
      
      {/* Top Header */}
      <header className="max-w-7xl mx-auto w-full py-6 border-b border-[#F4F2ED]/10 flex items-center justify-between z-10">
        <button
          onClick={() => router.push('/dashboard')}
          className="flex items-center space-x-2 text-[10px] font-mono text-[#F4F2ED]/60 hover:text-[#F4F2ED] uppercase tracking-widest transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Dashboard</span>
        </button>
        <span className="text-[10px] font-mono text-[#F4F2ED]/40 uppercase tracking-widest hidden sm:inline">
          DOSSIER ID: {brief.id.substring(0, 12)}
        </span>
      </header>

      {/* Main Content */}
      <main className="flex-grow max-w-4xl mx-auto w-full py-10 z-10 space-y-10">
        
        {/* Title area */}
        <div className="space-y-3 pb-6 border-b border-[#F4F2ED]/10">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-mono text-[9px] text-[#F4F2ED] border border-[#F4F2ED]/20 px-1.5 py-0.5 uppercase tracking-wider font-bold">
              {brief.trend_niche}
            </span>
            <span className="text-[#F4F2ED]/40 text-xs font-mono">{"//"}</span>
            <span className="text-[10px] font-mono text-[#F4F2ED]/60 uppercase tracking-wider">
              AI Generated Strategist Brief
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black italic font-serif text-white leading-tight">
            Brief: &ldquo;{brief.trend_name}&rdquo;
          </h1>
        </div>

        {/* Big Hook Formula Card */}
        <div className="border border-[#F4F2ED]/10 bg-[#F4F2ED]/[0.02] p-8 space-y-6 relative">
          <div className="flex justify-between items-center">
            <span className="text-[10px] font-mono text-[#F4F2ED]/40 uppercase tracking-widest font-bold">
              [THE HOOK FORMULA]
            </span>
            <span className="text-[9px] font-mono text-[#F4F2ED]/30 uppercase tracking-widest">
              IMMEDIATE ATTENTION GRABBER
            </span>
          </div>

          <div className="py-2">
            <blockquote className="text-2xl sm:text-3xl font-serif italic text-white leading-relaxed font-bold">
              &ldquo;{brief.hook}&rdquo;
            </blockquote>
          </div>

          <div className="flex justify-end pt-4 border-t border-[#F4F2ED]/5">
            <button
              onClick={handleCopyHook}
              className={`flex items-center space-x-2 border font-mono text-[10px] uppercase tracking-widest font-bold px-4 py-2.5 transition-all duration-300 ${
                copied
                  ? 'border-green-500 text-green-400 bg-green-500/5'
                  : 'border-[#F4F2ED]/30 hover:border-[#F4F2ED] text-[#F4F2ED] hover:bg-[#F4F2ED]/5'
              }`}
            >
              {copied ? (
                <>
                  <Check className="h-3.5 w-3.5" />
                  <span>Copied to Clipboard</span>
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5" />
                  <span>Copy Hook</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Video Angles Grid */}
        <div className="space-y-6">
          <h2 className="text-lg font-bold font-mono uppercase tracking-widest text-[#F4F2ED]/70 border-b border-[#F4F2ED]/10 pb-2">
            [CONTENT DIRECTION / 3 UNIQUE ANGLES]
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {brief.angles.map((angle, index) => (
              <div key={index} className="border border-[#F4F2ED]/10 p-6 space-y-4 flex flex-col justify-between">
                <div>
                  <span className="block font-serif text-3xl italic font-black text-[#F4F2ED]/40 mb-3">
                    0{index + 1}
                  </span>
                  <p className="text-xs text-[#F4F2ED]/80 leading-relaxed font-mono">
                    {angle}
                  </p>
                </div>
                <div className="pt-4 border-t border-[#F4F2ED]/5 text-[8px] font-mono text-[#F4F2ED]/30 uppercase tracking-widest">
                  ANGLE STRATEGY 0{index + 1}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Execution Metadata & Tags */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6">
          
          {/* Metadata Card */}
          <div className="border border-[#F4F2ED]/10 p-6 space-y-4">
            <h3 className="text-xs font-mono font-bold uppercase tracking-widest text-[#F4F2ED]/60 border-b border-[#F4F2ED]/10 pb-2">
              Production Specs
            </h3>

            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="flex items-center text-[#F4F2ED]/50 uppercase">
                  <Video className="h-3.5 w-3.5 mr-2" />
                  Recommended Format:
                </span>
                <span className="text-white uppercase font-bold">{brief.format}</span>
              </div>

              <div className="flex items-center justify-between text-xs font-mono">
                <span className="flex items-center text-[#F4F2ED]/50 uppercase">
                  <Calendar className="h-3.5 w-3.5 mr-2" />
                  Optimal Post Time:
                </span>
                <span className="text-white font-bold">{brief.optimal_post_time}</span>
              </div>

              <div className="flex items-center justify-between text-xs font-mono">
                <span className="flex items-center text-[#F4F2ED]/50 uppercase">
                  <TrendingUp className="h-3.5 w-3.5 mr-2" />
                  Estimated View Reach:
                </span>
                <span className="text-white font-bold">{brief.estimated_reach}</span>
              </div>
            </div>
          </div>

          {/* Hashtags Card */}
          <div className="border border-[#F4F2ED]/10 p-6 space-y-4">
            <h3 className="text-xs font-mono font-bold uppercase tracking-widest text-[#F4F2ED]/60 border-b border-[#F4F2ED]/10 pb-2">
              Distribution / Tags
            </h3>

            <div className="flex flex-wrap gap-2 pt-1">
              {brief.hashtags.map((tag, idx) => (
                <span
                  key={idx}
                  className="flex items-center bg-[#F4F2ED]/5 text-[#F4F2ED]/90 border border-[#F4F2ED]/10 px-2.5 py-1 text-[9px] font-mono font-semibold uppercase tracking-wider"
                >
                  <Hash className="h-2.5 w-2.5 mr-1 text-[#F4F2ED]/40" />
                  {tag.replace(/^#/, '')}
                </span>
              ))}
            </div>
            
            <p className="text-[10px] text-[#F4F2ED]/40 font-mono uppercase leading-relaxed pt-2">
              Insert these tags in the description and first comment to train the algorithm categorizer.
            </p>
          </div>

        </div>

      </main>

      {/* Footer */}
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
