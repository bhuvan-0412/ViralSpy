'use client';

import React, { useEffect, useState } from 'react';
import { Trend } from '../types';
import MomentumBadge from './MomentumBadge';
import Sparkline from './Sparkline';
import { useTranslations } from 'next-intl';
import { formatIndianNumber, formatIST } from '../lib/format';
import { useRouter } from 'next/navigation';
import { useLocale } from 'next-intl';
import { useAIProvider } from '../hooks/useAIProvider';
import { generateBriefWithOllama } from '../lib/ollama-client';

interface TrendCardProps {
  trend: Trend;
  onGenerateBrief?: (trendId: string, trendName: string, niche: string, platform: string, velocityScore: number, momentumStatus: string) => void;
  isGenerating?: boolean;
}

const YouTubeIcon = () => (
  <svg className="w-4 h-4 text-red-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 8a4 4 0 0 1 4 -4h12a4 4 0 0 1 4 4v8a4 4 0 0 1 -4 4h-12a4 4 0 0 1 -4 -4v-8z" />
    <path d="M10 9l5 3l-5 3z" />
  </svg>
);

const InstagramIcon = () => (
  <svg className="w-4 h-4 text-pink-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 4m0 4a4 4 0 0 1 4 -4h8a4 4 0 0 1 4 4v8a4 4 0 0 1 -4 4h-8a4 4 0 0 1 -4 -4z" />
    <path d="M12 12m-3 0a3 3 0 1 0 6 0a3 3 0 1 0 -6 0" />
    <path d="M16.5 7.5l0 .01" />
  </svg>
);

const RedditIcon = () => (
  <svg className="w-4 h-4 text-orange-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 8c2.47 0 4.43 -2.05 4 -4.5c.3 -1.5 1.5 -2.5 3 -2.5c1.66 0 3 1.34 3 3c0 1.5 -1.5 2.5 -3 2.5" />
    <path d="M12 8l0 4" />
    <path d="M12 12c-3.86 0 -7 2.68 -7 6c0 .32 .03 .64 .09 .95c.83 1.25 2.3 2.05 3.91 2.05c1.61 0 3.08 -.8 3.91 -2.05c.06 -.31 .09 -.63 .09 -.95c0 -3.32 -3.14 -6 -7 -6z" />
    <path d="M8 15a1 1 0 1 0 2 0a1 1 0 1 0 -2 0" />
    <path d="M14 15a1 1 0 1 0 2 0a1 1 0 1 0 -2 0" />
    <path d="M9.5 18.5c1.5 1 3.5 1 5 0" />
  </svg>
);

const XIcon = () => (
  <svg className="w-4 h-4 text-gray-800" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 4l11.733 16h4.267l-11.733 -16z" />
    <path d="M4 20l6.768 -6.768m2.46 -2.46l6.772 -6.772" />
  </svg>
);

const PlatformIcon = ({ platform }: { platform: string }) => {
  switch (platform.toUpperCase()) {
    case 'YOUTUBE':
      return <YouTubeIcon />;
    case 'INSTAGRAM':
      return <InstagramIcon />;
    case 'REDDIT':
      return <RedditIcon />;
    case 'X':
      return <XIcon />;
    default:
      return null;
  }
};

export default function TrendCard({ trend, onGenerateBrief, isGenerating: propIsGenerating = false }: TrendCardProps) {
  const router = useRouter();
  const locale = useLocale();
  const { config, getHeaders } = useAIProvider();
  
  const [localIsGenerating, setLocalIsGenerating] = useState(false);
  const isGenerating = propIsGenerating || localIsGenerating;

  const [loadingStep, setLoadingStep] = useState(0);

  const loadingMessages = [
    "⚡ Analyzing trend signals...",
    "🧠 Building content strategy...",
    "✍️ Writing your hook...",
    "🎯 Crafting video angles...",
    "🏷️ Selecting hashtags...",
    "✅ Almost done..."
  ];

  useEffect(() => {
    if (!isGenerating) {
      setLoadingStep(0);
      return;
    }
    const interval = setInterval(() => {
      setLoadingStep(prev => 
        prev < loadingMessages.length - 1 ? prev + 1 : prev
      );
    }, 3000);
    return () => clearInterval(interval);
  }, [isGenerating]);
  
  const handleGenerateBrief = async () => {
    setLocalIsGenerating(true);
    try {
      const { provider, ollamaUrl, ollamaModel } = config;

      if (provider === 'ollama') {
        const briefData = await generateBriefWithOllama(
          {
            trendId: trend.id,
            trendName: trend.name,
            niche: trend.niche,
            platform: trend.platform,
            velocityScore: trend.velocity_score,
            momentumStatus: trend.momentum_status,
            locale
          },
          ollamaUrl,
          ollamaModel
        );

        const saveRes = await fetch('/api/brief', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            trendId: trend.id,
            trendName: trend.name,
            niche: trend.niche,
            platform: trend.platform,
            velocityScore: trend.velocity_score,
            momentumStatus: trend.momentum_status,
            preGenerated: true,
            briefData: briefData
          })
        })
        const result = await saveRes.json()
        if (result.data?.id) {
          router.push(`/${locale}/brief/${result.data.id}`)
        }
      } else {
        // --- Non-Ollama providers: server-side generation (BYOK / Gemini) ---
        const response = await fetch('/api/brief', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...getHeaders(),
            'x-locale': locale
          },
          body: JSON.stringify({
            trendId: trend.id,
            trendName: trend.name,
            niche: trend.niche,
            platform: trend.platform,
            velocityScore: trend.velocity_score,
            momentumStatus: trend.momentum_status
          })
        });
        const result = await response.json();
        if (result.data?.id) {
          const localizedPath = locale === 'en' ? `/brief/${result.data.id}` : `/${locale}/brief/${result.data.id}`;
          router.push(localizedPath);
        } else {
          throw new Error(result.error || 'No brief ID returned');
        }
      }
    } catch (error) {
      console.error('Brief generation error:', error);
      alert('Could not generate brief. Please try again.');
    } finally {
      setLocalIsGenerating(false);
    }
  };
  const t = useTranslations('trendCard');
  const isExploding = trend.momentum_status === 'EXPLODING';
  
  // Count-up hook
  const [displayScore, setDisplayScore] = useState(0);

  useEffect(() => {
    const target = Math.round(trend.velocity_score);
    let startTimestamp: number | null = null;
    const duration = 800; // Count-up over 800ms

    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      setDisplayScore(Math.floor(progress * target));
      if (progress < 1) {
        window.requestAnimationFrame(step);
      }
    };

    window.requestAnimationFrame(step);
  }, [trend.velocity_score]);
  
  // Historical line points
  const sparklineData = Array.isArray(trend.raw_data?.sparkline) 
    ? trend.raw_data.sparkline 
    : [trend.velocity_score * 0.4, trend.velocity_score * 0.6, trend.velocity_score * 0.8, trend.velocity_score];

  const containerClasses = `bg-white border rounded-2xl p-5 hover:border-gray-300 transition-all flex flex-col justify-between h-full shadow-card ${
    isExploding 
      ? 'border-l-4 border-l-[#FF6B4A] border-gray-250' 
      : 'border-gray-200'
  }`;

  return (
    <div className={containerClasses}>
      {/* Header */}
      <div className="space-y-3">
        <div className="flex justify-between items-start">
          <div className="flex items-center space-x-2">
            <span className="p-1.5 bg-gray-50 rounded-xl border border-gray-100 flex items-center justify-center">
              <PlatformIcon platform={trend.platform} />
            </span>
            <span className="text-[10px] font-bold tracking-wider text-gray-500 uppercase">
              {trend.platform}
            </span>
          </div>
          <MomentumBadge status={trend.momentum_status} />
        </div>

        <div>
          <h3 className="text-xl font-bold text-[#1A1A1A] leading-tight tracking-tight hover:text-[#FF6B4A] transition-colors cursor-default">
            {trend.name}
          </h3>
          <div className="flex items-center space-x-2 mt-2">
            <span className="text-[9px] font-bold uppercase tracking-wider text-[#FF6B4A] bg-orange-50 border border-orange-100 px-2 py-0.5 rounded-full">
              {trend.niche}
            </span>
            <span className="text-[10px] font-semibold text-gray-400">
              {Math.round(trend.confidence_score * 100)}% {t('confidence')}
            </span>
          </div>
        </div>
      </div>

      {/* Sparkline & Stats */}
      <div className="my-5 grid grid-cols-2 gap-4 items-center border-t border-b border-gray-100 py-4">
        <div>
          <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
            {t('velocityScore')}
          </div>
          <div className="text-3xl font-black text-[#1A1A1A] mt-0.5">
            {formatIndianNumber(displayScore)}%
          </div>
          <div className="text-[11px] text-gray-550 mt-0.5 font-medium">
            {formatIndianNumber(trend.post_count)} posts total
          </div>
        </div>

        <div className="h-10 w-full pr-1">
          <Sparkline data={sparklineData.slice(-4)} stroke={isExploding ? '#ef4444' : '#FF6B4A'} />
        </div>
      </div>

      {/* Footer Actions */}
      <div className="flex items-center justify-between pt-2">
        {!isGenerating && (
          <span className="text-xs font-semibold text-gray-450 shrink-0">
            {t('detectedAt')} {formatIST(trend.detected_at)}
          </span>
        )}
        {isGenerating ? (
          <div className="space-y-2 w-full">
            {/* Animated button */}
            <div className="w-full flex items-center justify-center 
              gap-2 px-4 py-2.5 bg-gray-100 text-gray-500 
              rounded-full text-sm font-semibold cursor-not-allowed">
              <svg className="animate-spin h-3.5 w-3.5 shrink-0" 
                viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" 
                  r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
              </svg>
              <span>Generating...</span>
            </div>
            
            {/* Progress bar */}
            <div className="w-full bg-gray-100 rounded-full h-1">
              <div 
                className="bg-[#FF6B4A] h-1 rounded-full transition-all 
                  duration-[3000ms] ease-linear"
                style={{ 
                  width: `${((loadingStep + 1) / loadingMessages.length) * 90}%` 
                }}
              />
            </div>
            
            {/* Cycling message */}
            <p className="text-[10px] text-gray-400 text-center 
              font-medium animate-fade-in">
              {loadingMessages[loadingStep]}
            </p>
          </div>
        ) : (
          <button
            onClick={handleGenerateBrief}
            title="Takes 5-30 seconds with local AI. Use Groq in Settings for 3-second briefs."
            className="flex-grow sm:flex-grow-0 w-full sm:w-auto flex items-center justify-center 
              gap-2 px-4 py-2.5 bg-[#FF6B4A] text-white 
              rounded-full text-sm font-semibold transition-all 
              hover:bg-[#e55a3a] hover:scale-[1.02] 
              active:scale-95 shadow-sm"
          >
            <span>Generate Brief</span>
            <span className="text-xs opacity-80">→</span>
          </button>
        )}
      </div>

    </div>
  );
}
