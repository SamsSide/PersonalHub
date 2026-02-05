import { useEffect, useMemo } from 'react'
import { Sidebar } from '@/components/Sidebar'
import { Topbar } from '@/components/Topbar'
import { Dashboard } from '@/components/Dashboard'
import { Planner } from '@/components/Planner'
import { StatsPage } from '@/components/StatsPage'
import { SettingsPage } from '@/components/SettingsPage'
import { useHubStore } from '@/store/useHubStore'

export default function App() {
  const view = useHubStore((state) => state.view)
  const tick = useHubStore((state) => state.tick)
  const viewLabel = useMemo(() => {
    if (view === 'planner') return 'Planner'
    if (view === 'stats') return 'Stats'
    if (view === 'settings') return 'Settings'
    return 'Dashboard'
  }, [view])

  useEffect(() => {
    const interval = setInterval(() => tick(), 1000)
    return () => clearInterval(interval)
  }, [tick])

  const content = useMemo(() => {
    if (view === 'planner') return <Planner />
    if (view === 'stats') return <StatsPage />
    if (view === 'settings') return <SettingsPage />
    return <Dashboard />
  }, [view])

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1">
        <Topbar />
        <main className="mx-auto max-w-6xl space-y-6 px-4 py-6 lg:px-10">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Workspace</p>
              <h2 className="text-2xl font-semibold text-slate-100">{viewLabel}</h2>
            </div>
            <div className="rounded-full border border-zincLine bg-slate/70 px-4 py-2 text-xs text-slate-300">
              Zero layout shift · Local-first · Cyber-minimal
            </div>
          </div>
          <div className="animate-rise">{content}</div>
        </main>
      </div>
    </div>
  )
}
