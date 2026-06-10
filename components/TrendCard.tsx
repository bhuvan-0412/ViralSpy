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

const YouTubeIcon = () => (
  <svg className="w-4 h-4 text-red-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 8a4 4 0 0 1 4 -4h12a4 4 0 0 1 4 4v8a4 4 0 0 1 -4 4h-12a4 4 0 0 1 -4 -4v-8z" />
    <path d="M10 9l5 3l-5 3z" />
  </svg>
);

const InstagramIcon = () => (
  <svg className="w-4 h-4 text-pink-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 4m0 4a4 4 0 0 1 4 -4h8a4 4 0 0 1 4 4v8a4 4 0 0 1 -4 4h-8a4 4 0 0 1 -4 -4z" />
    <path d="M12 12m-3 0a3 3 0 1 0 6 0a3 3 0 1 0 -6 0" />
    <path d="M16.5 7.5l0 .01" />
  </svg>
);

const RedditIcon = () => (
  <svg className="w-4 h-4 text-orange-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 8c2.47 0 4.43 -2.05 4 -4.5c.3 -1.5 1.5 -2.5 3 -2.5c1.66 0 3 1.34 3 3c0 1.5 -1.5 2.5 -3 2.5" />
    <path d="M12 8l0 4" />
    <path d="M12 12c-3.86 0 -7 2.68 -7 6c0 .32 .03 .64 .09 .95c.83 1.25 2.3 2.05 3.91 2.05c1.61 0 3.08 -.8 3.91 -2.05c.06 -.31 .09 -.63 .09 -.95c0 -3.32 -3.14 -6 -7 -6z" />
    <path d="M8 15a1 1 0 1 0 2 0a1 1 0 1 0 -2 0" />
    <path d="M14 15a1 1 0 1 0 2 0a1 1 0 1 0 -2 0" />
    <path d="M9.5 18.5c1.5 1 3.5 1 5 0" />
  </svg>
);

const XIcon = () => (
  <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
