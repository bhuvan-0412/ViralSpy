import React from 'react';
import { MomentumStatusType } from '../types';

interface MomentumBadgeProps {
  status: MomentumStatusType;
}

export default function MomentumBadge({ status }: MomentumBadgeProps) {
  const styles = {
    EXPLODING: 'bg-red-500/20 text-red-400 border border-red-500/30',
    RISING: 'bg-amber-500/20 text-amber-400 border border-amber-500/30',
    PEAKED: 'bg-gray-500/20 text-gray-400 border border-gray-500/30',
    DEAD: 'bg-gray-900 text-gray-600 border border-gray-800'
  };

  const styleClass = styles[status] || styles.PEAKED;

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider ${styleClass}`}>
      {status}
    </span>
  );
}
