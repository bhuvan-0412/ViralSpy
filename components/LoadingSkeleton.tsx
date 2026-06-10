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
    <div className="w-full max-w-2xl mx-auto border border-gray-800 bg-gray-900 rounded-xl p-8 space-y-8 animate-pulse shadow-2xl">
      <div className="space-y-3">
        <div className="h-3 bg-gray-800 rounded w-1/4" />
        <div className="h-6 bg-gray-700 rounded w-3/4" />
      </div>

      <div className="border-t border-gray-800 pt-6 space-y-4">
        <div className="flex items-center space-x-3">
          <div className={`h-2 w-2 rounded-full ${step >= 0 ? 'bg-[#7F77DD]' : 'bg-gray-800'}`} />
          <span className={`text-[10px] font-mono tracking-widest ${step >= 0 ? 'text-[#7F77DD] font-bold' : 'text-gray-600'}`}>
            INITIALIZING GPT-4O STRATEGIST CLIENT...
          </span>
        </div>

        <div className="flex items-center space-x-3">
          <div className={`h-2 w-2 rounded-full ${step >= 1 ? 'bg-[#7F77DD]' : 'bg-gray-800'}`} />
          <span className={`text-[10px] font-mono tracking-widest ${step >= 1 ? 'text-[#7F77DD] font-bold' : 'text-gray-600'}`}>
            ANALYZING VELOCITY METRICS & TIMESTAMPS...
          </span>
        </div>

        <div className="flex items-center space-x-3">
          <div className={`h-2 w-2 rounded-full ${step >= 2 ? 'bg-[#7F77DD]' : 'bg-gray-800'}`} />
          <span className={`text-[10px] font-mono tracking-widest ${step >= 2 ? 'text-[#7F77DD] font-bold' : 'text-gray-600'}`}>
            COMPILING SCROLL-STOPPING HOOK OPTIONS...
          </span>
        </div>

        <div className="flex items-center space-x-3">
          <div className={`h-2 w-2 rounded-full ${step >= 3 ? 'bg-[#7F77DD]' : 'bg-gray-800'}`} />
          <span className={`text-[10px] font-mono tracking-widest ${step >= 3 ? 'text-[#7F77DD] font-bold' : 'text-gray-600'}`}>
            PREPARING READY-TO-FILM CAMPAIGN DOSSIER...
          </span>
        </div>
      </div>

      <div className="space-y-2 pt-4 border-t border-gray-800">
        <div className="h-3.5 bg-gray-800 rounded w-full" />
        <div className="h-3.5 bg-gray-800 rounded w-5/6" />
        <div className="h-3.5 bg-gray-800 rounded w-4/6" />
      </div>
    </div>
  );
}
