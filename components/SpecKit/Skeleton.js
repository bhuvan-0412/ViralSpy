import React from 'react';

export function Skeleton({ className = '', ...props }) {
  return (
    <div
      className={`animate-pulse bg-[#F4F2ED]/5 rounded-none ${className}`}
      {...props}
    />
  );
}
