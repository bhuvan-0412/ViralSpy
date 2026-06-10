import React from 'react';

export function Card({ className = '', children, ...props }) {
  return (
    <div
      className={`bg-[#1A1A1A] border border-[#F4F2ED]/10 text-[#F4F2ED] rounded-none transition-all duration-300 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ className = '', children, ...props }) {
  return (
    <div className={`p-6 border-b border-[#F4F2ED]/10 ${className}`} {...props}>
      {children}
    </div>
  );
}

export function CardTitle({ className = '', children, ...props }) {
  return (
    <h3
      className={`text-xl font-bold tracking-tight text-[#F4F2ED] font-serif ${className}`}
      {...props}
    >
      {children}
    </h3>
  );
}

export function CardDescription({ className = '', children, ...props }) {
  return (
    <p className={`text-xs text-[#F4F2ED]/60 font-mono mt-1 ${className}`} {...props}>
      {children}
    </p>
  );
}

export function CardContent({ className = '', children, ...props }) {
  return (
    <div className={`p-6 ${className}`} {...props}>
      {children}
    </div>
  );
}

export function CardFooter({ className = '', children, ...props }) {
  return (
    <div className={`p-6 border-t border-[#F4F2ED]/10 flex items-center ${className}`} {...props}>
      {children}
    </div>
  );
}
