import React from 'react';

interface NicheFilterProps {
  selectedNiche: string;
  onChange: (niche: string) => void;
}

const NICHES = [
  { value: 'all', label: 'All Niches' },
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
    <div className="flex space-x-2 overflow-x-auto pb-3 scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent">
      {NICHES.map((niche) => {
        const isActive = selectedNiche === niche.value;
        return (
          <button
            key={niche.value}
            onClick={() => onChange(niche.value)}
            className={`px-4 py-2 rounded-full text-xs font-semibold tracking-wide transition-all duration-200 ease-in-out whitespace-nowrap ${
              isActive
                ? 'bg-[#FF6B4A] text-white'
                : 'bg-white text-gray-600 border border-gray-200 hover:border-[#FF6B4A] hover:text-[#FF6B4A]'
            }`}
          >
            {niche.label}
          </button>
        );
      })}
    </div>
  );
}
