import { useMemo, useState } from 'react'
import { CheckCircle2, Pencil, Plus, Trash2 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useHubStore } from '@/store/useHubStore'
import { addDays, formatDateKey, formatDayName, formatShortDate, startOfWeek } from '@/lib/date'

const defaultColor = '#6e6bff'

export function HabitTracker() {
  const habits = useHubStore((state) => state.habits)
  const addHabit = useHubStore((state) => state.addHabit)
  const updateHabit = useHubStore((state) => state.updateHabit)
  const deleteHabit = useHubStore((state) => state.deleteHabit)
  const toggleHabitCompletion = useHubStore((state) => state.toggleHabitCompletion)

  const [name, setName] = useState('')
  const [color, setColor] = useState(defaultColor)
  const [editingId, setEditingId] = useState<string | null>(null)

  const weekDays = useMemo(() => {
    const start = startOfWeek(new Date())
    return Array.from({ length: 7 }, (_, idx) => addDays(start, idx))
  }, [])

  const resetForm = () => {
    setName('')
    setColor(defaultColor)
    setEditingId(null)
  }

  const handleSubmit = () => {
    if (!name.trim()) return
    if (editingId) {
      updateHabit(editingId, name.trim(), color)
    } else {
      addHabit(name.trim(), color)
    }
    resetForm()
  }

  const handleEdit = (id: string) => {
    const habit = habits.find((item) => item.id === id)
    if (!habit) return
    setName(habit.name)
    setColor(habit.color)
    setEditingId(id)
  }

  return (
    <Card>
      <CardHeader>
        <div>
          <CardTitle>Habit Tracker</CardTitle>
          <p className="text-xs text-slate-400">Weekly streaks with GitHub-style clarity.</p>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <Input
            placeholder="Add a habit"
            value={name}
            onChange={(event) => setName(event.target.value)}
          />
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={color}
              onChange={(event) => setColor(event.target.value)}
              className="h-10 w-12 cursor-pointer rounded-lg border border-zincLine bg-slate/70"
            />
            <Button onClick={handleSubmit} size="sm">
              <Plus size={16} />
              {editingId ? 'Update' : 'Add'}
            </Button>
            {editingId && (
              <Button onClick={resetForm} variant="ghost" size="sm">
                Cancel
              </Button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-8 gap-2 text-xs text-slate-400">
          <div></div>
          {weekDays.map((day) => (
            <div key={day.toISOString()} className="text-center">
              <div className="text-slate-200">{formatDayName(day)}</div>
              <div>{formatShortDate(day)}</div>
            </div>
          ))}
        </div>

        <div className="space-y-3">
          {habits.length === 0 && (
            <div className="rounded-xl border border-dashed border-zincLine px-4 py-6 text-sm text-slate-500">
              Start by adding a habit to track.
            </div>
          )}
          {habits.map((habit) => (
            <div key={habit.id} className="grid grid-cols-8 items-center gap-2">
              <div className="flex items-center gap-2 text-sm text-slate-200">
                <span className="h-2 w-2 rounded-full" style={{ backgroundColor: habit.color }} />
                <span className="flex-1 truncate">{habit.name}</span>
                <button onClick={() => handleEdit(habit.id)} className="text-slate-400 hover:text-white">
                  <Pencil size={14} />
                </button>
                <button
                  onClick={() => deleteHabit(habit.id)}
                  className="text-slate-400 hover:text-rose-400"
                >
                  <Trash2 size={14} />
                </button>
              </div>
              {weekDays.map((day) => {
                const key = formatDateKey(day)
                const complete = habit.completions[key]
                return (
                  <button
                    key={`${habit.id}-${key}`}
                    onClick={() => toggleHabitCompletion(habit.id, key)}
                    className="flex h-10 items-center justify-center rounded-xl border border-zincLine bg-slate/60 transition hover:border-indigoGlow/60"
                    style={{
                      backgroundColor: complete ? habit.color : undefined,
                      color: complete ? '#0a0a0a' : undefined,
                    }}
                  >
                    {complete ? <CheckCircle2 size={16} /> : <span className="text-xs">•</span>}
                  </button>
                )
              })}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
