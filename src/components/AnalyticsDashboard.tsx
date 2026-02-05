import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useHubStore } from '@/store/useHubStore'
import { formatDateKey, getLastNDates } from '@/lib/date'
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  LineChart,
  Line,
  CartesianGrid,
} from 'recharts'

export function AnalyticsDashboard() {
  const { focusMs, totalUptimeMs, focusSessions, habits } = useHubStore((state) => ({
    focusMs: state.focusMs,
    totalUptimeMs: state.totalUptimeMs,
    focusSessions: state.focusSessions,
    habits: state.habits,
  }))

  const focusHours = Number((focusMs / 36e5).toFixed(2))
  const uptimeHours = Number((totalUptimeMs / 36e5).toFixed(2))
  const focusShare = uptimeHours > 0 ? Math.round((focusHours / uptimeHours) * 100) : 0

  const focusData = [
    { label: 'Focus Hours', value: focusHours },
    { label: 'Total Uptime', value: uptimeHours },
  ]

  const habitDates = getLastNDates(30)
  const habitData = habitDates.map((date) => {
    const key = formatDateKey(date)
    const count = habits.reduce((acc, habit) => acc + (habit.completions[key] ? 1 : 0), 0)
    return {
      date: date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
      count,
    }
  })

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <div>
            <CardTitle>Focus Hours</CardTitle>
            <p className="text-xs text-slate-400">Pomodoro active time vs total uptime.</p>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between rounded-xl border border-zincLine bg-slate/60 px-4 py-3">
            <div>
              <p className="text-sm text-slate-300">Focus Share</p>
              <p className="text-2xl font-semibold text-slate-100">{focusShare}%</p>
            </div>
            <div className="text-right text-xs text-slate-400">
              <p>{focusSessions.length} sessions logged</p>
              <p>{uptimeHours.toFixed(2)} hrs uptime</p>
            </div>
          </div>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={focusData} barSize={36}>
                <XAxis dataKey="label" tick={{ fill: '#9ca3af', fontSize: 11 }} />
                <YAxis tick={{ fill: '#9ca3af', fontSize: 11 }} />
                <Tooltip
                  contentStyle={{
                    background: '#10131b',
                    border: '1px solid #2d3445',
                    borderRadius: '12px',
                    color: '#e5e7eb',
                  }}
                />
                <Bar dataKey="value" fill="#6e6bff" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div>
            <CardTitle>Habit Consistency</CardTitle>
            <p className="text-xs text-slate-400">Completions over the last 30 days.</p>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={habitData}>
                <CartesianGrid stroke="#1f2432" strokeDasharray="3 3" />
                <XAxis dataKey="date" tick={{ fill: '#9ca3af', fontSize: 10 }} interval={4} />
                <YAxis tick={{ fill: '#9ca3af', fontSize: 10 }} allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    background: '#10131b',
                    border: '1px solid #2d3445',
                    borderRadius: '12px',
                    color: '#e5e7eb',
                  }}
                />
                <Line type="monotone" dataKey="count" stroke="#3af7a6" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
