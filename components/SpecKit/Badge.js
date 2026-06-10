import React from 'react';

export function Badge({
  className = '',
  variant = 'default', // 'default' | 'exploding' | 'rising' | 'peaked'
  children,
  ...props
}) {
  const baseClasses = 'inline-flex items-center px-2.5 py-0.5 text-[9px] font-mono font-bold uppercase tracking-wider border rounded-none';

  const variants = {
    default: 'bg-transparent text-[#F4F2ED]/80 border-[#F4F2ED]/20',
    exploding: 'bg-transparent text-red-500 border-red-500 shadow-[0_0_10px_rgba(239,68,68,0.15)] animate-pulse',
    rising: 'bg-transparent text-amber-500 border-amber-500/80',
    peaked: 'bg-transparent text-[#F4F2ED]/40 border-[#F4F2ED]/10',
  };

  const variantClass = variants[variant] || variants.default;

  return (
    <span className={`${baseClasses} ${variantClass} ${className}`} {...props}>
      {children}
    </span>
  );
}
