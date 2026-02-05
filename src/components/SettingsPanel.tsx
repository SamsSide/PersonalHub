import { useEffect, useState } from 'react'
import { Bell, Save } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { useHubStore, type PomodoroSettings } from '@/store/useHubStore'

export function SettingsPanel() {
  const pomodoroSettings = useHubStore((state) => state.pomodoroSettings)
  const setPomodoroSettings = useHubStore((state) => state.setPomodoroSettings)
  const [localSettings, setLocalSettings] = useState<PomodoroSettings>(pomodoroSettings)
  const [permission, setPermission] = useState(() =>
    typeof window !== 'undefined' && 'Notification' in window ? Notification.permission : 'default'
  )

  useEffect(() => {
    setLocalSettings(pomodoroSettings)
  }, [pomodoroSettings])

  const handleUpdate = (key: keyof PomodoroSettings, value: string) => {
    const parsed = Number(value)
    if (Number.isNaN(parsed)) return
    setLocalSettings((prev) => ({ ...prev, [key]: parsed }))
  }

  const requestPermission = async () => {
    if (typeof window === 'undefined' || !('Notification' in window)) return
    const result = await Notification.requestPermission()
    setPermission(result)
  }

  return (
    <Card>
      <CardHeader>
        <div>
          <CardTitle>Settings</CardTitle>
          <p className="text-xs text-slate-400">Customize focus cycles and notification preferences.</p>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-3 lg:grid-cols-2">
          <div>
            <label className="text-xs uppercase tracking-[0.2em] text-slate-500">Work (min)</label>
            <Input
              type="number"
              min={10}
              value={localSettings.work}
              onChange={(event) => handleUpdate('work', event.target.value)}
            />
          </div>
          <div>
            <label className="text-xs uppercase tracking-[0.2em] text-slate-500">Short Break (min)</label>
            <Input
              type="number"
              min={3}
              value={localSettings.shortBreak}
              onChange={(event) => handleUpdate('shortBreak', event.target.value)}
            />
          </div>
          <div>
            <label className="text-xs uppercase tracking-[0.2em] text-slate-500">Long Break (min)</label>
            <Input
              type="number"
              min={10}
              value={localSettings.longBreak}
              onChange={(event) => handleUpdate('longBreak', event.target.value)}
            />
          </div>
          <div>
            <label className="text-xs uppercase tracking-[0.2em] text-slate-500">Long Break Every</label>
            <Input
              type="number"
              min={2}
              value={localSettings.longBreakEvery}
              onChange={(event) => handleUpdate('longBreakEvery', event.target.value)}
            />
          </div>
        </div>
        <Button onClick={() => setPomodoroSettings(localSettings)} size="sm">
          <Save size={16} />
          Save Settings
        </Button>

        <div className="flex items-center justify-between rounded-xl border border-zincLine bg-slate/60 px-4 py-3">
          <div>
            <p className="text-sm text-slate-200">Browser Notifications</p>
            <p className="text-xs text-slate-400">
              {permission === 'granted'
                ? 'Notifications enabled.'
                : 'Enable alerts for session changes.'}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Switch checked={permission === 'granted'} onClick={requestPermission} />
            <Button onClick={requestPermission} variant="outline" size="sm">
              <Bell size={16} />
              Enable
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
