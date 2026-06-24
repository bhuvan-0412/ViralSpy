import React from 'react'
import { MomentumStatusType } from '../types'

interface MomentumBadgeProps {
  status: MomentumStatusType
}

export default function MomentumBadge({ status }: MomentumBadgeProps) {
  const styles = {
    EXPLODING: 'bg-red-50 text-red-500 border border-red-200',
    RISING: 'bg-amber-50 text-amber-600 border border-amber-200',
    PEAKED: 'bg-gray-100 text-gray-500 border border-gray-200',
    DEAD: 'bg-gray-100 text-gray-400 border border-gray-200',
  }

  const styleClass = styles[status] || styles.PEAKED

  return (
    <span
      className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider border animate-badge-pop ${styleClass}`}
    >
      {status === 'EXPLODING' && (
        <span className="w-2 h-2 rounded-full bg-red-500 inline-block mr-1" />
      )}
      {status}
    </span>
  )
}
