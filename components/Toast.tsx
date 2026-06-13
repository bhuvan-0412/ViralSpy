'use client';
import { useEffect } from 'react';

interface ToastProps {
  message: string;
  link?: { label: string; href: string };
  onClose: () => void;
  duration?: number;
}

export default function Toast({ 
  message, link, onClose, duration = 3000 
}: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 
      z-[9999] flex items-center gap-3 bg-[#1A1A1A] text-white 
      px-5 py-3 rounded-full shadow-xl text-sm font-medium
      animate-fade-up">
      <span>{message}</span>
      {link && (
        <a 
          href={link.href}
          className="text-[#FF6B4A] hover:underline 
            font-bold shrink-0"
        >
          {link.label} →
        </a>
      )}
      <button 
        onClick={onClose}
        className="text-gray-400 hover:text-white ml-1"
      >
        ✕
      </button>
    </div>
  );
}
