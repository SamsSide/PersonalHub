import { LayoutDashboard, CalendarDays, LineChart, Settings } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useHubStore, type ViewKey } from '@/store/useHubStore'

const navItems: { key: ViewKey; label: string; icon: typeof LayoutDashboard }[] = [
  { key: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { key: 'planner', label: 'Planner', icon: CalendarDays },
  { key: 'stats', label: 'Stats', icon: LineChart },
  { key: 'settings', label: 'Settings', icon: Settings },
]

interface SidebarProps {
  variant?: 'desktop' | 'mobile'
  className?: string
}

export function Sidebar({ variant = 'desktop', className }: SidebarProps) {
  const view = useHubStore((state) => state.view)
  const setView = useHubStore((state) => state.setView)

  return (
    <aside
      className={cn(
        'glass-panel grid-dots relative min-h-screen w-64 flex-col gap-6 p-6',
        variant === 'desktop' ? 'hidden lg:flex' : 'flex',
        className
      )}
    >
      <div>
        <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Hub</p>
        <h1 className="mt-2 text-2xl font-semibold text-slate-100">Tokyo Night</h1>
        <p className="mt-1 text-sm text-slate-400">Personal Productivity</p>
      </div>
      <nav className="flex flex-1 flex-col gap-2">
        {navItems.map((item) => {
          const Icon = item.icon
          const active = view === item.key
          return (
            <button
              key={item.key}
              onClick={() => setView(item.key)}
              className={cn(
                'flex items-center gap-3 rounded-xl border border-transparent px-4 py-3 text-left text-sm font-medium text-slate-300 transition',
                active
                  ? 'border-indigoGlow/70 bg-indigoGlow/10 text-white shadow-glow'
                  : 'hover:border-zincLine hover:bg-slate/60'
              )}
            >
              <Icon size={18} />
              {item.label}
            </button>
          )
        })}
      </nav>
      <div className="rounded-2xl border border-zincLine bg-slate/70 p-4 text-sm text-slate-300">
        <p className="font-medium text-slate-100">Status</p>
        <p className="mt-2 text-xs leading-relaxed text-slate-400">
          All data is stored locally. Keep building, stay consistent.
        </p>
      </div>
    </aside>
  )
}
