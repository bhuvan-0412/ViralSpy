import React from 'react';
import { useTranslations } from 'next-intl';

interface NicheFilterProps {
  selectedNiche: string;
  onChange: (niche: string) => void;
}

export default function NicheFilter({ selectedNiche, onChange }: NicheFilterProps) {
  const t = useTranslations('dashboard');

  const NICHES = [
    { value: 'all', label: t('filterAll') },
    { value: 'fitness', label: t('filterFitness') },
    { value: 'food', label: t('filterFood') },
    { value: 'finance', label: t('filterFinance') },
    { value: 'fashion', label: t('filterFashion') },
    { value: 'beauty', label: t('filterBeauty') },
    { value: 'tech', label: t('filterTech') },
    { value: 'gaming', label: t('filterGaming') },
    { value: 'travel', label: t('filterTravel') },
    { value: 'education', label: t('filterEducation') }
  ];

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
                : 'bg-white text-gray-655 border border-gray-200 hover:border-[#FF6B4A] hover:text-[#FF6B4A]'
            }`}
          >
            {niche.label}
          </button>
        );
      })}
    </div>
  );
}
