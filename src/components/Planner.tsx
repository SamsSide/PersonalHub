import { useMemo, useState, type ReactNode } from 'react'
import { DndContext, DragEndEvent } from '@dnd-kit/core'
import { useDraggable, useDroppable } from '@dnd-kit/core'
import { CSS } from '@dnd-kit/utilities'
import { Plus, Trash2 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useHubStore, type TaskCategory, type TaskItem } from '@/store/useHubStore'
import { addDays, formatDayName, formatShortDate, formatTimeLabel, startOfWeek } from '@/lib/date'

const categories: TaskCategory[] = ['Coursework', 'Personal', 'Coding']

const categoryStyles: Record<TaskCategory, string> = {
  Coursework: 'bg-indigoGlow/20 text-indigoGlow border-indigoGlow/50',
  Personal: 'bg-emeraldGlow/20 text-emeraldGlow border-emeraldGlow/50',
  Coding: 'bg-slate-500/20 text-slate-200 border-slate-500/50',
}

const hours = Array.from({ length: 12 }, (_, idx) => 8 + idx)

function TaskCard({ task }: { task: TaskItem }) {
  const deleteTask = useHubStore((state) => state.deleteTask)
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `task-${task.id}`,
  })
  const style = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.6 : 1,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className="cursor-grab rounded-xl border border-zincLine bg-slate/70 p-3 text-sm text-slate-200 shadow-sm"
    >
      <div className="flex items-center justify-between gap-2">
        <span className="font-medium">{task.title}</span>
        <button onClick={() => deleteTask(task.id)} className="text-slate-400 hover:text-rose-400">
          <Trash2 size={14} />
        </button>
      </div>
      <div className="mt-2 flex items-center gap-2">
        <Badge className={categoryStyles[task.category]}>{task.category}</Badge>
        {task.dayIndex !== null && task.hour !== null && (
          <span className="text-xs text-slate-400">{formatTimeLabel(task.hour)}</span>
        )}
      </div>
    </div>
  )
}

function Slot({ id, children }: { id: string; children?: ReactNode }) {
  const { setNodeRef, isOver } = useDroppable({ id })
  return (
    <div
      ref={setNodeRef}
      className={`min-h-[72px] rounded-xl border border-dashed border-zincLine px-2 py-2 transition ${
        isOver ? 'border-indigoGlow/70 bg-indigoGlow/10' : 'bg-slate/40'
      }`}
    >
      {children}
    </div>
  )
}

export function Planner() {
  const tasks = useHubStore((state) => state.tasks)
  const addTask = useHubStore((state) => state.addTask)
  const assignTask = useHubStore((state) => state.assignTask)

  const [title, setTitle] = useState('')
  const [category, setCategory] = useState<TaskCategory>('Coursework')

  const weekDays = useMemo(() => {
    const start = startOfWeek(new Date())
    return Array.from({ length: 7 }, (_, idx) => addDays(start, idx))
  }, [])

  const backlog = tasks.filter((task) => task.dayIndex === null)

  const tasksBySlot = useMemo(() => {
    const map = new Map<string, TaskItem[]>()
    tasks.forEach((task) => {
      if (task.dayIndex === null || task.hour === null) return
      const key = `slot-${task.dayIndex}-${task.hour}`
      const existing = map.get(key) ?? []
      existing.push(task)
      map.set(key, existing)
    })
    return map
  }, [tasks])

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (!over) return
    if (typeof active.id !== 'string' || typeof over.id !== 'string') return
    if (!active.id.startsWith('task-')) return
    const taskId = active.id.replace('task-', '')
    if (over.id === 'backlog') {
      assignTask(taskId, null, null)
      return
    }
    if (over.id.startsWith('slot-')) {
      const [, dayStr, hourStr] = over.id.split('-')
      const dayIndex = Number(dayStr)
      const hour = Number(hourStr)
      if (!Number.isNaN(dayIndex) && !Number.isNaN(hour)) {
        assignTask(taskId, dayIndex, hour)
      }
    }
  }

  const handleAddTask = () => {
    if (!title.trim()) return
    addTask(title.trim(), category)
    setTitle('')
  }

  return (
    <Card className="min-h-[600px]">
      <CardHeader>
        <div>
          <CardTitle>Weekly Planner</CardTitle>
          <p className="text-xs text-slate-400">Drag tasks into time slots across the week.</p>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <Input
            placeholder="New task"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
          />
          <select
            value={category}
            onChange={(event) => setCategory(event.target.value as TaskCategory)}
            className="h-10 rounded-xl border border-zincLine bg-slate/70 px-3 text-sm text-slate-100"
          >
            {categories.map((item) => (
              <option key={item} value={item} className="bg-slate">
                {item}
              </option>
            ))}
          </select>
          <Button onClick={handleAddTask} size="sm">
            <Plus size={16} />
            Add Task
          </Button>
        </div>

        <DndContext onDragEnd={handleDragEnd}>
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-[240px_1fr]">
            <div>
              <div className="mb-2 text-xs uppercase tracking-[0.3em] text-slate-500">Backlog</div>
              <Slot id="backlog">
                <div className="space-y-2">
                  {backlog.length === 0 && (
                    <div className="rounded-lg border border-dashed border-zincLine px-3 py-4 text-xs text-slate-500">
                      No backlog tasks. Add one to begin.
                    </div>
                  )}
                  {backlog.map((task) => (
                    <TaskCard key={task.id} task={task} />
                  ))}
                </div>
              </Slot>
            </div>
            <div className="overflow-auto rounded-2xl border border-zincLine bg-slate/40 p-3">
              <div className="grid min-w-[900px] grid-cols-8 gap-3">
                <div></div>
                {weekDays.map((day, idx) => (
                  <div key={day.toISOString()} className="text-center text-xs text-slate-400">
                    <div className="text-sm font-semibold text-slate-200">{formatDayName(day)}</div>
                    <div>{formatShortDate(day)}</div>
                    <div className="mt-1 text-[10px] text-slate-500">Day {idx + 1}</div>
                  </div>
                ))}
                {hours.map((hour) => (
                  <div key={hour} className="contents">
                    <div className="text-xs text-slate-500">{formatTimeLabel(hour)}</div>
                    {weekDays.map((_, dayIndex) => {
                      const slotId = `slot-${dayIndex}-${hour}`
                      const slotTasks = tasksBySlot.get(slotId) ?? []
                      return (
                        <Slot key={slotId} id={slotId}>
                          <div className="space-y-2">
                            {slotTasks.map((task) => (
                              <TaskCard key={task.id} task={task} />
                            ))}
                          </div>
                        </Slot>
                      )
                    })}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </DndContext>
      </CardContent>
    </Card>
  )
}
