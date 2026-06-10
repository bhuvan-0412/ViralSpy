'use client';

import React from 'react';
import { Trend } from '../types';
import MomentumBadge from './MomentumBadge';
import Sparkline from './Sparkline';

interface TrendCardProps {
  trend: Trend;
  onGenerateBrief: (trendId: string) => void;
  isGenerating?: boolean;
}

const TikTokIcon = () => (
  <svg className="w-4 h-4 fill-current text-white" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.02 1.59 4.23.94 1.14 2.29 1.88 3.72 2.13v3.9c-1.39-.08-2.74-.58-3.87-1.42-.5-.38-.94-.84-1.31-1.37v7.55c.02 1.48-.3 2.97-1.02 4.27-.72 1.34-1.88 2.4-3.23 3.01-1.47.69-3.15.91-4.74.61-1.58-.27-3.08-1.09-4.18-2.28C2.28 19.01 1.6 17.38 1.6 15.67c-.02-1.8 1.1-3.46 2.78-4.13 1.34-.56 2.87-.58 4.23-.04v3.9c-1.06-.44-2.27-.23-3.12.5-.78.63-1.2 1.63-1.14 2.64.04 1.13.78 2.14 1.8 2.59 1 .45 2.18.25 3-.47.66-.55.97-1.42.94-2.27V.02h3.425z" />
  </svg>
);

const YouTubeIcon = () => (
  <svg className="w-4 h-4 fill-current text-red-500" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path d="M23.498 6.163a3.003 3.003 0 0 0-2.11-2.107C19.522 3.5 12 3.5 12 3.5s-7.522 0-9.388.556a3.003 3.003 0 0 0-2.11 2.107C0 8.029 0 12 0 12s0 3.971.502 5.837a3.003 3.003 0 0 0 2.11 2.107C4.478 20.5 12 20.5 12 20.5s7.522 0 9.388-.556a3.003 3.003 0 0 0 2.11-2.107C24 15.971 24 12 24 12s0-3.971-.502-5.837zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
  </svg>
);

const InstagramIcon = () => (
  <svg className="w-4 h-4 text-pink-500" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
  </svg>
);

const RedditIcon = () => (
  <svg className="w-4 h-4 fill-current text-orange-500" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path d="M24 11.5c0-1.65-1.35-3-3-3-.96 0-1.86.48-2.42 1.24-1.64-1-3.85-1.64-6.29-1.72l1.37-4.31 3.82.82c.03.95.82 1.71 1.79 1.71 1 0 1.8-0.8 1.8-1.8s-0.8-1.8-1.8-1.8c-0.74 0-1.38.46-1.65 1.11l-4.14-.88c-0.25-.05-.5.09-.58.33l-1.61 5.07c-2.51.04-4.8.69-6.49 1.72-.56-.76-1.46-1.24-2.42-1.24-1.65 0-3 1.35-3 3 0 1.05.54 1.97 1.37 2.51-.08.33-.12.66-.12.99 0 3.86 4.49 7 10 7s10-3.14 10-7c0-.33-.04-.66-.12-.99.83-.54 1.37-1.46 1.37-2.51zm-17.7 1.2c-.77 0-1.4-.63-1.4-1.4s.63-1.4 1.4-1.4 1.4.63 1.4 1.4-.63 1.4-1.4 1.4zm11.4 6c-1.68 1.68-4.88 1.68-6.56 0-.2-.2-.2-.51 0-.71.2-.2.51-.2.71 0 1.29 1.29 3.86 1.29 5.14 0 .2-.2.51-.2.71 0 .2.2.2.51 0 .71zm-1.1-4.6c-.77 0-1.4-.63-1.4-1.4s.63-1.4 1.4-1.4 1.4.63 1.4 1.4-.63 1.4-1.4 1.4z" />
  </svg>
);

const XIcon = () => (
  <svg className="w-4 h-4 fill-current text-white" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

const PlatformIcon = ({ platform }: { platform: string }) => {
  switch (platform.toUpperCase()) {
    case 'TIKTOK':
      return <TikTokIcon />;
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

function formatTimeAgo(dateStr: string) {
  if (!dateStr) return 'Detected recently';
  const diff = Date.now() - new Date(dateStr).getTime();
  const hours = Math.floor(diff / 3600000);
  if (hours <= 0) {
    const mins = Math.floor(diff / 60000);
    if (mins <= 0) return 'Detected just now';
    return `Detected ${mins}m ago`;
  }
  if (hours === 1) return 'Detected 1 hour ago';
  return `Detected ${hours} hours ago`;
}

export default function TrendCard({ trend, onGenerateBrief, isGenerating = false }: TrendCardProps) {
  const isExploding = trend.momentum_status === 'EXPLODING';
  
  // Historical line points
  const sparklineData = Array.isArray(trend.raw_data?.sparkline) 
    ? trend.raw_data.sparkline 
    : [trend.velocity_score * 0.4, trend.velocity_score * 0.6, trend.velocity_score * 0.8, trend.velocity_score];

  return (
    <div
      className={`bg-gray-900 border rounded-xl p-5 hover:border-gray-700 transition-colors flex flex-col justify-between h-full ${
        isExploding ? 'border-red-500/40 shadow-[0_0_20px_rgba(239,68,68,0.08)] animate-pulse-border' : 'border-gray-800'
      }`}
    >
      <style jsx global>{`
        @keyframes borderPulse {
          0% { border-color: rgba(239, 68, 68, 0.25); box-shadow: 0 0 5px rgba(239, 68, 68, 0.05); }
          100% { border-color: rgba(239, 68, 68, 0.75); box-shadow: 0 0 15px rgba(239, 68, 68, 0.2); }
        }
        .animate-pulse-border {
          animation: borderPulse 2s infinite alternate ease-in-out;
        }
      `}</style>

      {/* Header */}
      <div className="space-y-3">
        <div className="flex justify-between items-start">
          <div className="flex items-center space-x-2">
            <span className="p-1.5 bg-gray-800/80 rounded border border-gray-750 flex items-center justify-center">
              <PlatformIcon platform={trend.platform} />
            </span>
            <span className="text-[10px] font-mono font-bold tracking-wider text-gray-400 uppercase">
              {trend.platform}
            </span>
          </div>
          <MomentumBadge status={trend.momentum_status} />
        </div>

        <div>
          <h3 className="text-lg font-bold text-white leading-tight tracking-tight hover:text-purple-400 transition-colors cursor-default">
            {trend.name}
          </h3>
          <div className="flex items-center space-x-2 mt-1.5">
            <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-purple-400 bg-purple-950/30 border border-purple-900/40 px-2 py-0.5 rounded-full">
              {trend.niche}
            </span>
            <span className="text-[10px] font-mono text-gray-500">
              {Math.round(trend.confidence_score * 100)}% confidence
            </span>
          </div>
        </div>
      </div>

      {/* Sparkline & Stats */}
      <div className="my-5 grid grid-cols-2 gap-4 items-center border-t border-b border-gray-800/50 py-4">
        <div>
          <div className="text-[9px] font-mono font-semibold text-gray-500 uppercase tracking-widest">
            Velocity Score
          </div>
          <div className="text-2xl font-black text-white mt-1 flex items-baseline space-x-1">
            <span>{trend.velocity_score}%</span>
          </div>
          <div className="text-[10px] font-mono text-gray-400 mt-0.5">
            {(trend.post_count / 1000).toFixed(1)}K posts total
          </div>
        </div>

        <div className="h-12 w-full">
          <Sparkline data={sparklineData.slice(-4)} />
        </div>
      </div>

      {/* Footer Actions */}
      <div className="flex items-center justify-between pt-2">
        <span className="text-[10px] font-mono text-gray-500">
          {formatTimeAgo(trend.detected_at)}
        </span>
        <button
          onClick={() => onGenerateBrief(trend.id)}
          disabled={isGenerating}
          className="bg-purple-600 hover:bg-purple-500 text-white font-mono text-xs uppercase tracking-wider font-bold rounded-lg px-4 py-2 transition-all disabled:opacity-30 disabled:pointer-events-none"
        >
          {isGenerating ? 'Strategizing...' : 'Generate Brief'}
        </button>
      </div>

    </div>
  );
}
