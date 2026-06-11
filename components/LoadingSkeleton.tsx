'use client';

import React, { useEffect, useState } from 'react';

export default function LoadingSkeleton() {
  const [step, setStep] = useState(0);

  useEffect(() => {
    const t1 = setTimeout(() => setStep(1), 800);
    const t2 = setTimeout(() => setStep(2), 1600);
    const t3 = setTimeout(() => setStep(3), 2400);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, []);

  return (
    <div className="w-full max-w-2xl mx-auto border border-gray-200 bg-white rounded-2xl p-8 space-y-8 animate-pulse shadow-card">
      <div className="space-y-3">
        <div className="h-3 bg-gray-100 rounded w-1/4" />
        <div className="h-6 bg-gray-200 rounded w-3/4" />
      </div>

      <div className="border-t border-gray-100 pt-6 space-y-4">
        <div className="flex items-center space-x-3">
          <div className={`h-2.5 w-2.5 rounded-full transition-all duration-300 ${step >= 0 ? 'bg-[#FF6B4A] shadow-[0_0_8px_rgba(255,107,74,0.4)]' : 'bg-gray-200'}`} />
          <span className={`text-[10px] font-mono tracking-widest uppercase transition-all duration-300 ${step >= 0 ? 'text-[#FF6B4A] font-bold' : 'text-gray-400'}`}>
            INITIALIZING GPT-4O STRATEGIST CLIENT...
          </span>
        </div>

        <div className="flex items-center space-x-3">
          <div className={`h-2.5 w-2.5 rounded-full transition-all duration-300 ${step >= 1 ? 'bg-[#FF6B4A] shadow-[0_0_8px_rgba(255,107,74,0.4)]' : 'bg-gray-200'}`} />
          <span className={`text-[10px] font-mono tracking-widest uppercase transition-all duration-300 ${step >= 1 ? 'text-[#FF6B4A] font-bold' : 'text-gray-400'}`}>
            ANALYZING VELOCITY METRICS & TIMESTAMPS...
          </span>
        </div>

        <div className="flex items-center space-x-3">
          <div className={`h-2.5 w-2.5 rounded-full transition-all duration-300 ${step >= 2 ? 'bg-[#FF6B4A] shadow-[0_0_8px_rgba(255,107,74,0.4)]' : 'bg-gray-200'}`} />
          <span className={`text-[10px] font-mono tracking-widest uppercase transition-all duration-300 ${step >= 2 ? 'text-[#FF6B4A] font-bold' : 'text-gray-400'}`}>
            COMPILING SCROLL-STOPPING HOOK OPTIONS...
          </span>
        </div>

        <div className="flex items-center space-x-3">
          <div className={`h-2.5 w-2.5 rounded-full transition-all duration-300 ${step >= 3 ? 'bg-[#FF6B4A] shadow-[0_0_8px_rgba(255,107,74,0.4)]' : 'bg-gray-200'}`} />
          <span className={`text-[10px] font-mono tracking-widest uppercase transition-all duration-300 ${step >= 3 ? 'text-[#FF6B4A] font-bold' : 'text-gray-400'}`}>
            PREPARING READY-TO-FILM CAMPAIGN DOSSIER...
          </span>
        </div>
      </div>

      <div className="space-y-2 pt-4 border-t border-gray-100">
        <div className="h-3.5 bg-gray-100 rounded w-full" />
        <div className="h-3.5 bg-gray-100 rounded w-5/6" />
        <div className="h-3.5 bg-gray-100 rounded w-4/6" />
      </div>
    </div>
  );
}
