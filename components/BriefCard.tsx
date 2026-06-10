'use client';

import React, { useState } from 'react';
import { Brief, Trend } from '../types';
import MomentumBadge from './MomentumBadge';
import { Copy, Check, Clock, Eye, Video, Hash, ArrowLeft, RotateCw, Share2 } from 'lucide-react';

interface BriefCardProps {
  brief: Brief;
  trend: Trend;
  onRegenerate: () => void;
  onBack: () => void;
  isRegenerating?: boolean;
}

export default function BriefCard({ brief, trend, onRegenerate, onBack, isRegenerating = false }: BriefCardProps) {
  const [copiedHook, setCopiedHook] = useState(false);
  const [copiedTagIdx, setCopiedTagIdx] = useState<number | null>(null);
  const [copiedSummary, setCopiedSummary] = useState(false);

  const copyToClipboard = (text: string, type: 'hook' | 'tag' | 'summary', tagIdx?: number) => {
    navigator.clipboard.writeText(text).then(() => {
      if (type === 'hook') {
        setCopiedHook(true);
        setTimeout(() => setCopiedHook(false), 2000);
      } else if (type === 'tag' && typeof tagIdx === 'number') {
        setCopiedTagIdx(tagIdx);
        setTimeout(() => setCopiedTagIdx(null), 2000);
      } else if (type === 'summary') {
        setCopiedSummary(true);
        setTimeout(() => setCopiedSummary(false), 2000);
      }
    }).catch(err => {
      console.error('Failed to copy: ', err);
    });
  };

  const getFormatExplanation = (format: string) => {
    switch (format) {
      case 'TALKING_HEAD':
        return 'Engage directly with the camera to build trust and authority.';
      case 'POV':
        return 'Place the viewer in your shoes for instant emotional immersion.';
      case 'DUET':
        return 'React or overlay your commentary to ride on established momentum.';
      case 'TUTORIAL':
        return 'Provide step-by-step instructions that drive high saves and bookmarks.';
      case 'STORYTIME':
        return 'Narrate a personal hook-driven experience to maximize watch time.';
      case 'TRANSITION':
        return 'Leverage visual changes or audio sync edits for high loop replays.';
      default:
        return 'Optimize content delivery specifically matching this breakout topic.';
    }
  };

  const shareSummary = () => {
    const text = `ViralSpy Content Brief: ${trend.name}
Niche: ${trend.niche} | Platform: ${trend.platform}
Velocity Score: ${trend.velocity_score}%

[HOOK]
"${brief.hook}"

[ANGLES]
${brief.angles.map((a, i) => `${i + 1}. ${a.title}: ${a.description}`).join('\n')}

[METRICS]
Format: ${brief.format}
Optimal Post Time: ${brief.best_post_time}
Estimated Reach: ${brief.estimated_reach}
Hashtags: ${brief.hashtags.join(', ')}

Generated via ViralSpy`;
    
    copyToClipboard(text, 'summary');
  };

  return (
    <div className="space-y-6">
      
      {/* Top Navigation Bar */}
      <div className="flex items-center justify-between border-b border-gray-800 pb-4">
        <button
          onClick={onBack}
          className="flex items-center space-x-2 text-xs font-mono font-bold uppercase tracking-wider text-gray-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to trends</span>
        </button>
        <div className="flex items-center space-x-2">
          <button
            onClick={onRegenerate}
            disabled={isRegenerating}
            className="flex items-center space-x-1 px-3 py-1.5 bg-gray-900 border border-gray-800 hover:border-gray-750 text-gray-300 hover:text-white rounded-lg text-xs font-mono font-bold uppercase tracking-wider transition-all disabled:opacity-30 disabled:pointer-events-none"
          >
            <RotateCw className={`h-3.5 w-3.5 ${isRegenerating ? 'animate-spin' : ''}`} />
            <span>{isRegenerating ? 'Generating...' : 'Regenerate'}</span>
          </button>
          <button
            onClick={shareSummary}
            className="flex items-center space-x-1 px-3 py-1.5 bg-purple-650 hover:bg-purple-600 text-white rounded-lg text-xs font-mono font-bold uppercase tracking-wider transition-all"
          >
            {copiedSummary ? <Check className="h-3.5 w-3.5" /> : <Share2 className="h-3.5 w-3.5" />}
            <span>{copiedSummary ? 'Copied Brief!' : 'Share'}</span>
          </button>
        </div>
      </div>

      {/* Trend Context Bar */}
      <div className="bg-gray-900 border border-gray-850 rounded-xl p-4 flex flex-wrap justify-between items-center gap-4">
        <div>
          <span className="text-[9px] font-mono font-bold text-gray-500 uppercase tracking-widest">Active Predictor Dossier</span>
          <h2 className="text-xl font-bold text-white tracking-tight">{trend.name}</h2>
        </div>
        <div className="flex items-center space-x-4 border-l border-gray-800 pl-4">
          <div className="text-right">
            <div className="text-[9px] font-mono text-gray-500 uppercase tracking-widest">Velocity</div>
            <div className="text-base font-black text-white font-mono">{trend.velocity_score}%</div>
          </div>
          <MomentumBadge status={trend.momentum_status} />
        </div>
      </div>

      {/* Hook Segment */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 bg-purple-600/10 text-purple-400 border-b border-l border-purple-900/30 px-3 py-1 rounded-bl-lg text-[9px] font-mono font-black uppercase tracking-wider">
          Your Opening Line
        </div>
        <span className="text-[9px] font-mono font-bold text-gray-500 uppercase tracking-widest block mb-2">[HOOK FORMULA]</span>
        <blockquote className="text-xl sm:text-2xl font-semibold text-white italic pr-12 leading-relaxed">
          &ldquo;{brief.hook}&rdquo;
        </blockquote>
        <button
          onClick={() => copyToClipboard(brief.hook, 'hook')}
          className="absolute bottom-6 right-6 p-2 rounded-lg bg-gray-850 hover:bg-gray-800 border border-gray-800 hover:border-purple-900/40 text-gray-400 hover:text-purple-400 transition-all"
          title="Copy Hook"
        >
          {copiedHook ? <Check className="h-4 w-4 text-green-500 animate-pulse" /> : <Copy className="h-4 w-4" />}
        </button>
      </div>

      {/* 3 Video Angles */}
      <div className="space-y-3">
        <span className="text-[9px] font-mono font-bold text-gray-500 uppercase tracking-widest block">[3 VIDEO ANGLES]</span>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {brief.angles.map((angle, index) => (
            <div key={index} className="bg-gray-900 border border-gray-800 rounded-xl p-5 flex flex-col justify-between">
              <div>
                <span className="text-[28px] font-black text-[#7F77DD]/20 font-mono block mb-1">
                  0{index + 1}
                </span>
                <h4 className="text-sm font-bold text-white tracking-tight mb-2 uppercase">
                  {angle.title}
                </h4>
                <p className="text-xs text-gray-400 leading-relaxed font-sans">
                  {angle.description}
                </p>
              </div>
              <div className="border-t border-gray-850 mt-4 pt-3 text-[8px] font-mono text-gray-500 tracking-wider uppercase">
                ANGLE STRATEGY 0{index + 1}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Grid Specs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* Format Card */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 space-y-3">
          <div className="flex items-center space-x-2 text-purple-450 border-b border-gray-850 pb-2">
            <Video className="h-4 w-4 text-purple-400" />
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-gray-300">Format Guide</span>
          </div>
          <div className="text-sm font-bold text-white font-mono uppercase">
            {brief.format}
          </div>
          <p className="text-[11px] text-gray-400 leading-relaxed font-sans">
            {getFormatExplanation(brief.format)}
          </p>
        </div>

        {/* Post Timing Card */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 space-y-3">
          <div className="flex items-center space-x-2 text-purple-450 border-b border-gray-850 pb-2">
            <Clock className="h-4 w-4 text-purple-400" />
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-gray-300">Best Post Time</span>
          </div>
          <div className="text-sm font-bold text-white font-mono">
            {brief.best_post_time}
          </div>
          <p className="text-[11px] text-gray-400 leading-relaxed font-sans">
            Post during these high-volume windows to maximize index categorization.
          </p>
        </div>

        {/* Reach Range Card */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 space-y-3">
          <div className="flex items-center space-x-2 text-purple-450 border-b border-gray-850 pb-2">
            <Eye className="h-4 w-4 text-purple-400" />
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-gray-300">Estimated Reach</span>
          </div>
          <div className="text-sm font-bold text-white font-mono">
            {brief.estimated_reach}
          </div>
          <p className="text-[11px] text-gray-400 leading-relaxed font-sans">
            Estimated organic views based on current niche breakout velocity.
          </p>
        </div>

      </div>

      {/* Hashtags section */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 space-y-3">
        <span className="text-[9px] font-mono font-bold text-gray-500 uppercase tracking-widest block">[DISTRIBUTION TAGS]</span>
        <div className="flex flex-wrap gap-2">
          {brief.hashtags.map((tag, idx) => {
            const isCopied = copiedTagIdx === idx;
            return (
              <button
                key={idx}
                onClick={() => copyToClipboard(tag, 'tag', idx)}
                className={`flex items-center space-x-1.5 px-3 py-1.5 border rounded-lg text-xs font-mono font-semibold transition-all ${
                  isCopied
                    ? 'bg-green-950/20 border-green-500/50 text-green-400'
                    : 'bg-gray-850 hover:bg-gray-800 border-gray-800 text-gray-300 hover:text-white'
                }`}
              >
                <Hash className="h-3 w-3 text-purple-400" />
                <span>{tag.replace(/^#/, '')}</span>
                {isCopied && <Check className="h-3 w-3 ml-1 text-green-400" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Script outline timeline */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 space-y-6">
        <span className="text-[9px] font-mono font-bold text-gray-500 uppercase tracking-widest block">[SCRIPT TIMELINE OUTLINE]</span>
        
        <div className="relative pl-6 border-l border-gray-800 space-y-6 py-2">
          
          {/* Act 1 */}
          <div className="relative">
            <span className="absolute -left-[30px] top-1.5 bg-[#7F77DD] h-2 w-2 rounded-full border border-gray-950" />
            <div className="flex justify-between items-baseline gap-4">
              <h5 className="text-xs font-bold text-white font-mono uppercase tracking-wider">Act 1: Scroll Stopper</h5>
              <span className="text-[10px] font-mono text-purple-400">0s - 3s</span>
            </div>
            <p className="text-xs text-gray-400 mt-1 leading-relaxed">
              Open directly with the scroll-stopping hook: <span className="italic text-gray-300 font-medium">&ldquo;{brief.hook}&rdquo;</span>. Maintain eye contact, use bold styling overlay.
            </p>
          </div>

          {/* Act 2 */}
          <div className="relative">
            <span className="absolute -left-[30px] top-1.5 bg-[#7F77DD] h-2 w-2 rounded-full border border-gray-950" />
            <div className="flex justify-between items-baseline gap-4">
              <h5 className="text-xs font-bold text-white font-mono uppercase tracking-wider">Act 2: Value Build</h5>
              <span className="text-[10px] font-mono text-purple-400">3s - 20s</span>
            </div>
            <p className="text-xs text-gray-400 mt-1 leading-relaxed">
              Pivot to visual angle structures. Present the core value vector, showing overlays or POV screens while detailing the setup, hack, or comparison.
            </p>
          </div>

          {/* Act 3 */}
          <div className="relative">
            <span className="absolute -left-[30px] top-1.5 bg-[#7F77DD] h-2 w-2 rounded-full border border-gray-950" />
            <div className="flex justify-between items-baseline gap-4">
              <h5 className="text-xs font-bold text-white font-mono uppercase tracking-wider">Act 3: Payoff & Call-To-Action</h5>
              <span className="text-[10px] font-mono text-purple-400">20s - 30s</span>
            </div>
            <p className="text-xs text-gray-400 mt-1 leading-relaxed">
              Deliver the ultimate payoff resolution. Conclude with a strong, prompt call to action to save this video and follow for more trend blueprints.
            </p>
          </div>

        </div>
      </div>

    </div>
  );
}
