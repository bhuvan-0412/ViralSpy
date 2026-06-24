'use client'

import React, { useEffect, useState } from 'react'
import { createClient, isDemoModeActive } from '../../../lib/supabase'
import { useRouter } from 'next/navigation'
import { useLocale } from 'next-intl'
import Logo from '../../../components/Logo'
import { ArrowLeft, Bookmark, Trash2, ExternalLink } from 'lucide-react'

interface SavedBrief {
  id: string
  saved_at: string
  trend: {
    id: string
    name: string
    niche: string
    platform: string
    velocity_score: number
    momentum_status: string
  }
  brief: {
    id: string
    hook: string
    angles: Array<{ title: string; description: string }>
    format: string
    hashtags: string[]
    best_post_time: string
    estimated_reach: string
    created_at: string
  } | null
}

export default function BriefsPage() {
  const router = useRouter()
  const locale = useLocale()
  const [savedBriefs, setSavedBriefs] = useState<SavedBrief[]>([])
  const [loading, setLoading] = useState(true)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const getDashboardPath = () => (locale === 'en' ? '/dashboard' : `/${locale}/dashboard`)
  const getBriefPath = (id: string) => (locale === 'en' ? `/brief/${id}` : `/${locale}/brief/${id}`)

  useEffect(() => {
    let mounted = true

    const init = async () => {
      const supabase = createClient()

      // Listen for auth state
      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange(async (event, session) => {
        if (!mounted) return

        if (session?.user) {
          // User is logged in — load briefs
          await loadSavedBriefs(session.user.id)
        } else if (event === 'SIGNED_OUT') {
          router.push('/')
        }
        // If INITIAL_SESSION with no user,
        // wait — don't redirect immediately
      })

      // Also check existing session immediately
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (session?.user && mounted) {
        await loadSavedBriefs(session.user.id)
      } else if (isDemoModeActive() && mounted) {
        await loadSavedBriefs('demo-guest-uuid-1234-5678')
      }

      if (mounted) setLoading(false)

      return () => subscription.unsubscribe()
    }

    init()
    return () => {
      mounted = false
    }
  }, [])

  const loadSavedBriefs = async (userId: string) => {
    try {
      if (isDemoModeActive()) {
        const localSaved = localStorage.getItem('viralspy_demo_trends')
        const savedList = localSaved ? JSON.parse(localSaved) : []
        setSavedBriefs(savedList)
        return
      }

      const supabase = createClient()

      const { data: saved, error } = await supabase
        .from('saved_trends')
        .select(
          `
          id,
          saved_at,
          trend:trends(
            id, name, niche, platform,
            velocity_score, momentum_status
          )
        `
        )
        .eq('user_id', userId)
        .order('saved_at', { ascending: false })

      if (error) throw error

      const enriched = await Promise.all(
        (saved || []).map(async (item: any) => {
          const { data: brief } = await supabase
            .from('briefs')
            .select('*')
            .eq('trend_id', item.trend?.id)
            .order('created_at', { ascending: false })
            .limit(1)
            .single()
          return { ...item, brief: brief || null }
        })
      )

      setSavedBriefs(enriched)
    } catch (e) {
      console.error('Error loading saved briefs:', e)
    } finally {
      setLoading(false)
    }
  }

  const handleUnsave = async (savedId: string) => {
    setDeletingId(savedId)
    try {
      if (isDemoModeActive()) {
        const localSaved = localStorage.getItem('viralspy_demo_trends')
        let savedList = localSaved ? JSON.parse(localSaved) : []
        savedList = savedList.filter((item: any) => item.id !== savedId)
        localStorage.setItem('viralspy_demo_trends', JSON.stringify(savedList))
        setSavedBriefs((prev) => prev.filter((b) => b.id !== savedId))
        return
      }

      const supabase = createClient()
      await supabase.from('saved_trends').delete().eq('id', savedId)
      setSavedBriefs((prev) => prev.filter((b) => b.id !== savedId))
    } catch (e) {
      console.error('Error unsaving:', e)
    } finally {
      setDeletingId(null)
    }
  }

  const getMomentumColor = (status: string) => {
    if (status === 'EXPLODING') return 'text-red-500 bg-red-55/10 border border-red-200'
    if (status === 'RISING') return 'text-amber-600 bg-amber-55/10 border border-amber-200'
    return 'text-gray-500 bg-gray-100'
  }

  return (
    <div className="min-h-screen bg-[#F7F5F2] text-[#1A1A1A] flex flex-col justify-between font-sans">
      <div>
        {/* Header */}
        <header className="sticky top-0 bg-white border-b border-gray-200 z-50 py-3.5 px-4 sm:px-6 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
          <div className="max-w-4xl mx-auto flex items-center justify-between">
            <Logo />
            <button
              onClick={() => router.push(getDashboardPath())}
              className="flex items-center gap-1.5 px-3 py-2 bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-650 hover:text-gray-900 rounded-xl text-xs font-semibold transition-colors"
            >
              <ArrowLeft className="h-3.5 w-3.5 text-[#FF6B4A]" />
              <span>Back to Dashboard</span>
            </button>
          </div>
        </header>

        <main className="max-w-4xl mx-auto py-8 px-4 sm:px-6">
          {/* Page title */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-[#FF6B4A] rounded-xl flex items-center justify-center">
                <Bookmark className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-black text-[#1A1A1A]">My Briefs</h1>
                <p className="text-sm text-gray-500">
                  {savedBriefs.length} saved brief
                  {savedBriefs.length !== 1 ? 's' : ''}
                </p>
              </div>
            </div>
          </div>

          {/* Loading state */}
          {loading && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="bg-white rounded-2xl p-5 border border-gray-200 animate-pulse shadow-card"
                >
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-3" />
                  <div className="h-3 bg-gray-100 rounded w-1/2 mb-4" />
                  <div className="h-12 bg-gray-100 rounded mb-3" />
                  <div className="flex gap-2">
                    {[1, 2, 3].map((j) => (
                      <div key={j} className="h-6 bg-gray-100 rounded-full w-16" />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Empty state */}
          {!loading && savedBriefs.length === 0 && (
            <div className="text-center py-20 bg-white border border-gray-200 rounded-2xl p-8 shadow-card max-w-md mx-auto space-y-4">
              <div className="text-6xl mb-2">📋</div>
              <h2 className="text-xl font-bold text-gray-705">No saved briefs yet</h2>
              <p className="text-gray-500 text-xs leading-relaxed max-w-sm mx-auto">
                Generate a brief and click "Save Brief" to see it here.
              </p>
              <button
                onClick={() => router.push(getDashboardPath())}
                className="px-6 py-2.5 bg-[#FF6B4A] hover:bg-[#ff5a33] text-white rounded-full font-bold text-xs uppercase tracking-wider transition-all shadow-sm hover:scale-[1.01]"
              >
                Browse Trends →
              </button>
            </div>
          )}

          {/* Saved briefs grid */}
          {!loading && savedBriefs.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {savedBriefs.map((item) => (
                <div
                  key={item.id}
                  className="bg-white rounded-2xl border border-gray-200 shadow-card overflow-hidden hover:shadow-md transition-shadow flex flex-col justify-between border-l-4 border-l-[#FF6B4A]"
                >
                  {/* Card header */}
                  <div className="p-5 border-b border-gray-100">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-gray-450">
                            {item.trend?.platform}
                          </span>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${getMomentumColor(item.trend?.momentum_status || '')}`}
                          >
                            {item.trend?.momentum_status}
                          </span>
                        </div>
                        <h3 className="font-bold text-[#1A1A1A] text-base leading-tight truncate">
                          {item.trend?.name}
                        </h3>
                        <p className="text-[10px] text-gray-400 font-semibold mt-1">
                          Saved{' '}
                          {new Date(item.saved_at).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </p>
                      </div>
                      <button
                        onClick={() => handleUnsave(item.id)}
                        disabled={deletingId === item.id}
                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-55/10 rounded-lg transition-colors shrink-0"
                        title="Remove from saved"
                      >
                        {deletingId === item.id ? (
                          <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            />
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                            />
                          </svg>
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Brief preview */}
                  {item.brief ? (
                    <div className="p-5 space-y-3.5 flex-grow flex flex-col justify-between">
                      <div className="space-y-3">
                        {/* Hook */}
                        <div className="bg-orange-50/30 border-l-4 border-[#FF6B4A] rounded-r-xl px-4 py-3">
                          <p className="text-[9px] font-bold uppercase tracking-wider text-[#FF6B4A] mb-1">
                            Hook
                          </p>
                          <p className="text-xs font-semibold text-[#1A1A1A] italic leading-relaxed line-clamp-2">
                            "{item.brief.hook}"
                          </p>
                        </div>

                        {/* Hashtags */}
                        <div className="flex flex-wrap gap-1.5">
                          {(Array.isArray(item.brief.hashtags) ? item.brief.hashtags : [])
                            .slice(0, 4)
                            .map((tag: string, i: number) => (
                              <span
                                key={i}
                                className="text-[10px] font-bold bg-gray-50 border border-gray-150 text-gray-600 px-2.5 py-1 rounded-full"
                              >
                                #{tag.replace(/^#/, '')}
                              </span>
                            ))}
                        </div>
                      </div>

                      <div className="space-y-3 pt-2">
                        {/* Post time + reach */}
                        <div className="flex gap-4 text-[11px] font-semibold text-gray-500">
                          <span>🕐 {item.brief.best_post_time}</span>
                          <span>📈 {item.brief.estimated_reach}</span>
                        </div>

                        {/* View full brief button */}
                        <button
                          onClick={() => router.push(getBriefPath(item.brief!.id))}
                          className="w-full flex items-center justify-center gap-2 py-2.5 bg-[#FF6B4A] hover:bg-[#ff5a33] text-white rounded-xl text-xs font-bold transition-all shadow-sm active:scale-95"
                        >
                          <ExternalLink className="h-3.5 w-3.5" />
                          <span>View Full Brief</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="p-5 text-center text-xs text-gray-400">
                      Brief not available
                      <button
                        onClick={() => router.push(getDashboardPath())}
                        className="block mx-auto mt-2 text-[#FF6B4A] font-bold hover:underline"
                      >
                        Generate again →
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </main>
      </div>

      {/* Footer */}
      <footer className="w-full max-w-4xl mx-auto py-6 border-t border-gray-200 flex items-center justify-between text-xs text-gray-550 px-4 sm:px-6 mt-12">
        <div>© 2026 ViralSpy.</div>
      </footer>
    </div>
  )
}
