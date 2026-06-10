import React from 'react';

interface NicheFilterProps {
  selectedNiche: string;
  onChange: (niche: string) => void;
}

const NICHES = [
  { value: 'all', label: 'All' },
  { value: 'fitness', label: 'Fitness' },
  { value: 'food', label: 'Food' },
  { value: 'finance', label: 'Finance' },
  { value: 'fashion', label: 'Fashion' },
  { value: 'beauty', label: 'Beauty' },
  { value: 'tech', label: 'Tech' },
  { value: 'gaming', label: 'Gaming' },
  { value: 'travel', label: 'Travel' },
  { value: 'education', label: 'Education' }
];

export default function NicheFilter({ selectedNiche, onChange }: NicheFilterProps) {
  return (
    <div className="flex space-x-2 overflow-x-auto pb-3 scrollbar-thin scrollbar-thumb-gray-800 scrollbar-track-transparent">
      {NICHES.map((niche) => {
        const isActive = selectedNiche === niche.value;
        return (
          <button
            key={niche.value}
            onClick={() => onChange(niche.value)}
            className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap ${
              isActive
                ? 'bg-[#7F77DD] text-white shadow-[0_0_15px_rgba(127,119,221,0.3)]'
                : 'bg-gray-900 text-gray-400 border border-gray-850 hover:text-white hover:border-gray-700'
            }`}
          >
            {niche.label}
          </button>
        );
      })}
    </div>
  );
}
