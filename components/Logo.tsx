import React from 'react';

export default function Logo() {
  return (
    <div className="flex items-center gap-2">
      {/* Icon container */}
      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#FF6B4A] to-[#FF9A3C] flex items-center justify-center shadow-sm">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path
            d="M9.5 1L3 9h5l-1.5 6L14 7H9L9.5 1z"
            fill="white"
            strokeLinejoin="round"
          />
        </svg>
      </div>
      {/* Wordmark */}
      <span className="text-[#1A1A1A] font-bold text-lg tracking-tight hidden md:inline">
        Viral<span className="text-[#FF6B4A]">Spy</span>
      </span>
    </div>
  );
}
