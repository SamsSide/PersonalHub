import { useEffect, useMemo } from 'react'
import { AlarmClock, Pause, Play, SkipForward } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useHubStore } from '@/store/useHubStore'

const modeLabels = {
  work: 'Deep Focus',
  short: 'Short Reset',
  long: 'Long Reset',
}

const modeAccent = {
  work: 'from-indigoGlow/50 to-indigoGlow/10',
  short: 'from-emeraldGlow/40 to-emeraldGlow/10',
  long: 'from-slate-400/40 to-slate-500/10',
}

const formatTime = (ms: number) => {
  const totalSeconds = Math.max(0, Math.round(ms / 1000))
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
}

const playChime = () => {
  if (typeof window === 'undefined') return
  const AudioContext = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
  if (!AudioContext) return
  const ctx = new AudioContext()
  const now = ctx.currentTime
  const master = ctx.createGain()
  master.gain.setValueAtTime(0.0001, now)
  master.gain.exponentialRampToValueAtTime(0.3, now + 0.02)
  master.gain.exponentialRampToValueAtTime(0.0001, now + 1.2)
  master.connect(ctx.destination)

  const frequencies = [392, 523.25, 659.25]
  frequencies.forEach((freq, idx) => {
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = 'sine'
    osc.frequency.value = freq
    gain.gain.value = 0.08 / (idx + 1)
    osc.connect(gain)
    gain.connect(master)
    osc.start(now + idx * 0.06)
    osc.stop(now + 1.1)
  })
}

export function PomodoroTimer() {
  const {
    mode,
    isRunning,
    remainingMs,
    currentSessionDurationMs,
    sessionsCompleted,
    lastCompletionId,
    startTimer,
    pauseTimer,
    resetTimer,
    skipSession,
  } = useHubStore((state) => ({
    mode: state.mode,
    isRunning: state.isRunning,
    remainingMs: state.remainingMs,
    currentSessionDurationMs: state.currentSessionDurationMs,
    sessionsCompleted: state.sessionsCompleted,
    lastCompletionId: state.lastCompletionId,
    startTimer: state.startTimer,
    pauseTimer: state.pauseTimer,
    resetTimer: state.resetTimer,
    skipSession: state.skipSession,
  }))

  const progress = useMemo(() => {
    if (currentSessionDurationMs <= 0) return 0
    return 1 - remainingMs / currentSessionDurationMs
  }, [remainingMs, currentSessionDurationMs])

  useEffect(() => {
    if (!lastCompletionId) return
    playChime()
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
      new Notification('Pomodoro Complete', {
        body: mode === 'work' ? 'Time to take a break.' : 'Ready for another focus sprint?',
      })
    }
  }, [lastCompletionId, mode])

  return (
    <Card className="flex flex-col">
      <CardHeader>
        <div>
          <CardTitle>Pomodoro Flow</CardTitle>
          <p className="text-xs text-slate-400">Stay in rhythm with adaptive focus cycles.</p>
        </div>
        <Badge className="uppercase tracking-[0.2em]">{modeLabels[mode]}</Badge>
      </CardHeader>
      <CardContent className="flex flex-col items-center gap-6">
        <div
          className={`relative flex h-48 w-48 items-center justify-center rounded-full bg-gradient-to-br ${modeAccent[mode]} border border-zincLine shadow-glow`}
          style={{
            background: `conic-gradient(rgba(110,107,255,0.9) ${progress * 360}deg, rgba(37,43,58,0.6) 0deg)`,
          }}
        >
          <div className="flex h-36 w-36 flex-col items-center justify-center rounded-full bg-charcoal/90 text-center">
            <span className="text-4xl font-semibold text-glow font-mono">{formatTime(remainingMs)}</span>
            <span className="text-xs uppercase tracking-[0.3em] text-slate-500">{mode}</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button onClick={isRunning ? pauseTimer : startTimer} variant="default" size="lg">
            {isRunning ? <Pause size={18} /> : <Play size={18} />}
            {isRunning ? 'Pause' : 'Start'}
          </Button>
          <Button onClick={resetTimer} variant="secondary" size="lg">
            <AlarmClock size={18} />
            Reset
          </Button>
          <Button onClick={skipSession} variant="ghost" size="lg">
            <SkipForward size={18} />
            Skip
          </Button>
        </div>
        <div className="flex w-full items-center justify-between rounded-xl border border-zincLine bg-slate/60 px-4 py-3 text-sm text-slate-300">
          <span>Focus Sessions</span>
          <span className="font-mono text-base text-slate-100">{sessionsCompleted}</span>
        </div>
      </CardContent>
    </Card>
  )
}
