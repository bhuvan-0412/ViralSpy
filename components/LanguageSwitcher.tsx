'use client'
import { useLocale } from 'next-intl'
import { useRouter, usePathname } from 'next/navigation'

const languages = [
  { code: 'en', label: 'EN', full: 'English' },
  { code: 'hi', label: 'हि', full: 'हिन्दी' },
  { code: 'te', label: 'తె', full: 'తెలుగు' }
]

export default function LanguageSwitcher() {
  const locale = useLocale()
  const router = useRouter()
  const pathname = usePathname()

  const switchLocale = (newLocale: string) => {
    const newPath = pathname.replace(`/${locale}`, '') || '/'
    router.push(`/${newLocale}${newPath}`)
  }

  return (
    <div className="flex items-center gap-1 bg-gray-105 rounded-full p-1">
      {languages.map((lang) => (
        <button
          key={lang.code}
          onClick={() => switchLocale(lang.code)}
          title={lang.full}
          className={`px-3 py-1 rounded-full text-sm font-medium transition-all ${
            locale === lang.code
              ? 'bg-[#FF6B4A] text-white shadow-sm'
              : 'text-gray-650 hover:text-[#FF6B4A]'
          }`}
        >
          {lang.label}
        </button>
      ))}
    </div>
  )
}
