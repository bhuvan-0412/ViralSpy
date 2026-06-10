import React from 'react';

export function Button({
  className = '',
  variant = 'primary', // 'primary' | 'outline' | 'ghost'
  size = 'default', // 'sm' | 'default' | 'lg'
  children,
  ...props
}) {
  const baseClasses = 'inline-flex items-center justify-center font-mono text-xs uppercase tracking-widest transition-all duration-300 font-bold focus:outline-none';

  const variants = {
    primary: 'bg-[#F4F2ED] text-[#1A1A1A] hover:bg-transparent hover:text-[#F4F2ED] border border-[#F4F2ED]',
    outline: 'bg-transparent text-[#F4F2ED] border border-[#F4F2ED]/30 hover:border-[#F4F2ED] hover:bg-[#F4F2ED]/5',
    ghost: 'bg-transparent text-[#F4F2ED] hover:bg-[#F4F2ED]/5 border border-transparent',
  };

  const sizes = {
    sm: 'py-2 px-3 text-[10px]',
    default: 'py-3 px-5',
    lg: 'py-4 px-7 text-sm',
  };

  const variantClass = variants[variant] || variants.primary;
  const sizeClass = sizes[size] || sizes.default;

  return (
    <button
      className={`${baseClasses} ${variantClass} ${sizeClass} ${className} disabled:opacity-30 disabled:pointer-events-none`}
      {...props}
    >
      {children}
    </button>
  );
}
