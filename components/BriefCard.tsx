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
      <div className="flex items-center justify-between border-b border-gray-250 pb-4">
        <button
          onClick={onBack}
          className="text-sm font-semibold text-gray-500 hover:text-[#FF6B4A] transition-colors"
        >
          ← Back to trends
        </button>
        <div className="flex items-center space-x-3">
          <button
            onClick={onRegenerate}
            disabled={isRegenerating}
            className="flex items-center space-x-1.5 px-4 py-2 bg-white border border-gray-200 hover:border-[#FF6B4A] text-gray-705 hover:text-[#FF6B4A] rounded-full text-xs font-semibold transition-all hover:scale-[1.02]"
          >
            <RotateCw className={`h-3.5 w-3.5 ${isRegenerating ? 'animate-spin' : ''}`} />
            <span>{isRegenerating ? 'Generating...' : 'Regenerate'}</span>
          </button>
          <button
            onClick={shareSummary}
            className="flex items-center space-x-1.5 px-4 py-2 bg-[#FF6B4A] hover:bg-[#ff5a33] text-white rounded-full text-xs font-semibold transition-all hover:scale-[1.02]"
          >
            {copiedSummary ? <Check className="h-3.5 w-3.5" /> : <Share2 className="h-3.5 w-3.5" />}
            <span>{copiedSummary ? 'Copied Brief!' : 'Share Dossier'}</span>
          </button>
        </div>
      </div>

      {/* Trend Context Bar */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 flex flex-wrap justify-between items-center gap-4 shadow-card">
        <div>
          <span className="text-[10px] font-bold text-[#FF6B4A] uppercase tracking-wider block mb-1">Active Predictor Dossier</span>
          <h2 className="text-2xl font-black text-[#1A1A1A] tracking-tight">{trend.name}</h2>
        </div>
        <div className="flex items-center space-x-4 sm:border-l sm:border-gray-150 sm:pl-4">
          <div className="text-right">
            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Velocity</div>
            <div className="text-lg font-black text-[#1A1A1A]">{trend.velocity_score}%</div>
          </div>
          <MomentumBadge status={trend.momentum_status} />
        </div>
      </div>

      {/* Hook Segment */}
      <div className="bg-white border border-gray-200 border-l-4 border-l-[#FF6B4A] rounded-2xl p-6 relative overflow-hidden shadow-card">
        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-3">[HOOK FORMULA]</span>
        <blockquote className="text-xl sm:text-2xl font-semibold text-[#1A1A1A] italic pr-12 leading-relaxed">
          &ldquo;{brief.hook}&rdquo;
        </blockquote>
        <button
          onClick={() => copyToClipboard(brief.hook, 'hook')}
          className="absolute top-6 right-6 p-2.5 rounded-full bg-gray-50 hover:bg-orange-50 border border-gray-200 text-gray-500 hover:text-[#FF6B4A] transition-all"
          title="Copy Hook"
        >
          {copiedHook ? <Check className="h-4 w-4 text-green-600 animate-pulse" /> : <Copy className="h-4 w-4" />}
        </button>
      </div>

      {/* 3 Video Angles */}
      <div className="space-y-3">
        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">[3 VIDEO ANGLES]</span>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {brief.angles.map((angle, index) => (
            <div key={index} className="bg-white border border-gray-200 rounded-2xl p-5 flex flex-col justify-between shadow-card hover:shadow-md transition-all duration-200">
              <div>
                <div className="h-9 w-9 rounded-full bg-orange-50 border border-orange-100 flex items-center justify-center text-sm font-bold text-[#FF6B4A] mb-3">
                  {index + 1}
                </div>
                <h4 className="text-sm font-bold text-[#1A1A1A] tracking-tight mb-2 uppercase">
                  {angle.title}
                </h4>
                <p className="text-xs text-gray-600 leading-relaxed font-sans">
                  {angle.description}
                </p>
              </div>
              <div className="border-t border-gray-100 mt-4 pt-3 text-[9px] font-bold text-gray-400 tracking-wider uppercase">
                ANGLE STRATEGY 0{index + 1}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recommended Format Card */}
      <div className="bg-white border border-gray-200 rounded-2xl p-5 flex items-center space-x-4 shadow-card">
        <div className="p-3.5 bg-orange-50 border border-orange-100 rounded-2xl text-[#FF6B4A]">
          <Video className="h-6 w-6" />
        </div>
        <div>
          <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Recommended Format</div>
          <div className="text-sm font-bold text-[#1A1A1A] font-mono uppercase mt-0.5">{brief.format}</div>
          <p className="text-xs text-gray-600 leading-relaxed mt-1">{getFormatExplanation(brief.format)}</p>
        </div>
      </div>

      {/* Post Timing & Estimated Reach Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* Post Timing Card */}
        <div className="bg-white border border-gray-200 rounded-2xl p-5 flex items-center space-x-3.5 shadow-card">
          <div className="p-2.5 bg-orange-50 border border-orange-100 rounded-2xl text-[#FF6B4A]">
            <Clock className="h-5 w-5" />
          </div>
          <div>
            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Best Post Time</div>
            <div className="text-sm font-bold text-[#1A1A1A] mt-0.5">{brief.best_post_time}</div>
          </div>
        </div>

        {/* Reach Range Card */}
        <div className="bg-white border border-gray-200 rounded-2xl p-5 flex items-center space-x-3.5 shadow-card">
          <div className="p-2.5 bg-orange-50 border border-orange-100 rounded-2xl text-[#FF6B4A]">
            <Eye className="h-5 w-5" />
          </div>
          <div>
            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Estimated Reach</div>
            <div className="text-sm font-bold text-[#1A1A1A] mt-0.5">{brief.estimated_reach}</div>
          </div>
        </div>

      </div>

      {/* Hashtags section */}
      <div className="bg-white border border-gray-200 rounded-2xl p-5 space-y-3 shadow-card">
        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">[DISTRIBUTION TAGS]</span>
        <div className="flex flex-wrap gap-2">
          {brief.hashtags.map((tag, idx) => {
            const isCopied = copiedTagIdx === idx;
            return (
              <button
                key={idx}
                onClick={() => copyToClipboard(tag, 'tag', idx)}
                className={`flex items-center space-x-1.5 px-3 py-1.5 border rounded-full text-xs font-semibold transition-all ${
                  isCopied
                    ? 'bg-green-50 border-green-200 text-green-600'
                    : 'bg-orange-50 hover:bg-orange-100 border-orange-100 text-[#FF6B4A]'
                }`}
              >
                <Hash className="h-3 w-3 text-[#FF6B4A]" />
                <span>{tag.replace(/^#/, '')}</span>
                {isCopied && <Check className="h-3 w-3 ml-1 text-green-600" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Script outline timeline */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 space-y-6 shadow-card">
        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">[SCRIPT TIMELINE OUTLINE]</span>
        
        <div className="relative pl-6 border-l border-orange-100 space-y-6 py-2">
          
          {/* Act 1 */}
          <div className="relative">
            <span className="absolute -left-[30px] top-1.5 bg-[#FF6B4A] h-3 w-3 rounded-full border-2 border-white ring-2 ring-orange-100" />
            <div className="flex justify-between items-baseline gap-4">
              <h5 className="text-xs font-bold text-[#1A1A1A] uppercase tracking-wider">Act 1: Scroll Stopper</h5>
              <span className="text-[11px] font-mono text-[#FF6B4A] font-bold">0s - 3s</span>
            </div>
            <p className="text-xs text-gray-600 mt-1 leading-relaxed">
              Open directly with the scroll-stopping hook: <span className="italic text-gray-800 font-semibold">&ldquo;{brief.hook}&rdquo;</span>. Maintain eye contact, use bold styling overlay.
            </p>
          </div>

          {/* Act 2 */}
          <div className="relative">
            <span className="absolute -left-[30px] top-1.5 bg-[#FF6B4A] h-3 w-3 rounded-full border-2 border-white ring-2 ring-orange-100" />
            <div className="flex justify-between items-baseline gap-4">
              <h5 className="text-xs font-bold text-[#1A1A1A] uppercase tracking-wider">Act 2: Value Build</h5>
              <span className="text-[11px] font-mono text-[#FF6B4A] font-bold">3s - 20s</span>
            </div>
            <p className="text-xs text-gray-600 mt-1 leading-relaxed">
              Pivot to visual angle structures. Present the core value vector, showing overlays or POV screens while detailing the setup, hack, or comparison.
            </p>
          </div>

          {/* Act 3 */}
          <div className="relative">
            <span className="absolute -left-[30px] top-1.5 bg-[#FF6B4A] h-3 w-3 rounded-full border-2 border-white ring-2 ring-orange-100" />
            <div className="flex justify-between items-baseline gap-4">
              <h5 className="text-xs font-bold text-[#1A1A1A] uppercase tracking-wider">Act 3: Payoff & Call-To-Action</h5>
              <span className="text-[11px] font-mono text-[#FF6B4A] font-bold">20s - 30s</span>
            </div>
            <p className="text-xs text-gray-600 mt-1 leading-relaxed">
              Deliver the ultimate payoff resolution. Conclude with a strong, prompt call to action to save this video and follow for more trend blueprints.
            </p>
          </div>

        </div>
      </div>

    </div>
  );
}
