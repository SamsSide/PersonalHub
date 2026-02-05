import { useEffect, useState } from 'react'
import { Sparkles } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useHubStore } from '@/store/useHubStore'

const ONE_DAY = 24 * 60 * 60 * 1000

export function DailyQuote() {
  const quote = useHubStore((state) => state.quote)
  const setQuote = useHubStore((state) => state.setQuote)
  const [status, setStatus] = useState<'idle' | 'loading' | 'error'>('idle')

  useEffect(() => {
    const shouldFetch = !quote || Date.now() - quote.fetchedAt > ONE_DAY
    if (!shouldFetch) return

    const controller = new AbortController()
    setStatus('loading')

    fetch('https://zenquotes.io/api/today', { signal: controller.signal })
      .then((res) => res.json())
      .then((data) => {
        const item = Array.isArray(data) ? data[0] : null
        if (!item) throw new Error('Invalid response')
        setQuote({ text: item.q, author: item.a, fetchedAt: Date.now() })
        setStatus('idle')
      })
      .catch(() => {
        setStatus('error')
      })

    return () => controller.abort()
  }, [quote, setQuote])

  return (
    <Card className="relative overflow-hidden">
      <div className="absolute right-0 top-0 h-40 w-40 animate-pulseGlow rounded-full bg-indigoGlow/20 blur-3xl" />
      <CardHeader>
        <div>
          <CardTitle>Daily Motivation</CardTitle>
          <p className="text-xs text-slate-400">Fresh inspiration every 24 hours.</p>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {status === 'loading' && (
          <p className="text-sm text-slate-400">Fetching today's quote...</p>
        )}
        {quote && (
          <div className="space-y-2">
            <p className="text-lg text-slate-100">“{quote.text}”</p>
            <p className="text-xs uppercase tracking-[0.3em] text-slate-500">{quote.author}</p>
          </div>
        )}
        {status === 'error' && !quote && (
          <div className="flex items-center gap-2 text-sm text-slate-400">
            <Sparkles size={16} />
            Offline mode: add your own momentum.
          </div>
        )}
      </CardContent>
    </Card>
  )
}
