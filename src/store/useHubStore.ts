import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type ViewKey = 'dashboard' | 'planner' | 'stats' | 'settings'
export type PomodoroMode = 'work' | 'short' | 'long'

export interface PomodoroSettings {
  work: number
  shortBreak: number
  longBreak: number
  longBreakEvery: number
}

export interface FocusSession {
  id: string
  startedAt: number
  durationMs: number
}

export interface Habit {
  id: string
  name: string
  color: string
  createdAt: number
  completions: Record<string, boolean>
}

export type TaskCategory = 'Coursework' | 'Personal' | 'Coding'

export interface TaskItem {
  id: string
  title: string
  category: TaskCategory
  dayIndex: number | null
  hour: number | null
  duration: number
}

export interface NoteItem {
  id: string
  title: string
  content: string
  updatedAt: number
}

export interface QuoteItem {
  text: string
  author: string
  fetchedAt: number
}

interface HubState {
  view: ViewKey
  pomodoroSettings: PomodoroSettings
  mode: PomodoroMode
  isRunning: boolean
  remainingMs: number
  currentSessionDurationMs: number
  sessionsCompleted: number
  focusMs: number
  totalUptimeMs: number
  lastTick: number
  lastCompletionId: number
  focusSessions: FocusSession[]
  habits: Habit[]
  tasks: TaskItem[]
  notes: NoteItem[]
  quote: QuoteItem | null
  setView: (view: ViewKey) => void
  setQuote: (quote: QuoteItem) => void
  setPomodoroSettings: (settings: PomodoroSettings) => void
  startTimer: () => void
  pauseTimer: () => void
  resetTimer: () => void
  skipSession: () => void
  tick: (now?: number) => void
  addHabit: (name: string, color: string) => void
  updateHabit: (id: string, name: string, color: string) => void
  deleteHabit: (id: string) => void
  toggleHabitCompletion: (id: string, dateKey: string) => void
  addTask: (title: string, category: TaskCategory) => void
  updateTask: (id: string, updates: Partial<Omit<TaskItem, 'id'>>) => void
  deleteTask: (id: string) => void
  assignTask: (id: string, dayIndex: number | null, hour: number | null) => void
  addNote: (title: string, content: string) => void
  updateNote: (id: string, updates: Partial<Omit<NoteItem, 'id'>>) => void
  deleteNote: (id: string) => void
}

const defaultSettings: PomodoroSettings = {
  work: 25,
  shortBreak: 5,
  longBreak: 15,
  longBreakEvery: 4,
}

const getModeDuration = (settings: PomodoroSettings, mode: PomodoroMode) => {
  if (mode === 'work') return settings.work * 60 * 1000
  if (mode === 'short') return settings.shortBreak * 60 * 1000
  return settings.longBreak * 60 * 1000
}

const generateId = () => {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID()
  }
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`
}

export const useHubStore = create<HubState>()(
  persist(
    (set, get) => ({
      view: 'dashboard',
      pomodoroSettings: defaultSettings,
      mode: 'work',
      isRunning: false,
      remainingMs: getModeDuration(defaultSettings, 'work'),
      currentSessionDurationMs: getModeDuration(defaultSettings, 'work'),
      sessionsCompleted: 0,
      focusMs: 0,
      totalUptimeMs: 0,
      lastTick: Date.now(),
      lastCompletionId: 0,
      focusSessions: [],
      habits: [],
      tasks: [],
      notes: [],
      quote: null,
      setView: (view) => set({ view }),
      setQuote: (quote) => set({ quote }),
      setPomodoroSettings: (settings) =>
        set((state) => {
          const duration = getModeDuration(settings, state.mode)
          return {
            pomodoroSettings: settings,
            remainingMs: state.isRunning ? state.remainingMs : duration,
            currentSessionDurationMs: state.isRunning ? state.currentSessionDurationMs : duration,
          }
        }),
      startTimer: () =>
        set((state) => {
          if (state.remainingMs <= 0) {
            const duration = getModeDuration(state.pomodoroSettings, state.mode)
            return {
              isRunning: true,
              remainingMs: duration,
              currentSessionDurationMs: duration,
            }
          }
          return { isRunning: true }
        }),
      pauseTimer: () => set({ isRunning: false }),
      resetTimer: () =>
        set((state) => {
          const duration = getModeDuration(state.pomodoroSettings, state.mode)
          return {
            isRunning: false,
            remainingMs: duration,
            currentSessionDurationMs: duration,
          }
        }),
      skipSession: () =>
        set((state) => {
          const nextMode: PomodoroMode = state.mode === 'work' ? 'short' : 'work'
          const duration = getModeDuration(state.pomodoroSettings, nextMode)
          return {
            mode: nextMode,
            isRunning: false,
            remainingMs: duration,
            currentSessionDurationMs: duration,
          }
        }),
      tick: (now = Date.now()) =>
        set((state) => {
          const lastTick = state.lastTick || now
          const delta = Math.max(0, now - lastTick)
          let remainingMs = state.remainingMs
          let isRunning = state.isRunning
          let mode = state.mode
          let currentSessionDurationMs = state.currentSessionDurationMs
          let sessionsCompleted = state.sessionsCompleted
          let focusSessions = state.focusSessions
          let lastCompletionId = state.lastCompletionId
          let focusMs = state.focusMs

          if (isRunning) {
            remainingMs = Math.max(0, remainingMs - delta)
            if (mode === 'work') {
              focusMs += delta
            }
            if (remainingMs === 0) {
              isRunning = false
              if (mode === 'work') {
                const completedSessions = sessionsCompleted + 1
                sessionsCompleted = completedSessions
                focusSessions = [
                  {
                    id: generateId(),
                    startedAt: now - currentSessionDurationMs,
                    durationMs: currentSessionDurationMs,
                  },
                  ...focusSessions,
                ].slice(0, 120)
                mode =
                  completedSessions % state.pomodoroSettings.longBreakEvery === 0
                    ? 'long'
                    : 'short'
              } else {
                mode = 'work'
              }
              const nextDuration = getModeDuration(state.pomodoroSettings, mode)
              remainingMs = nextDuration
              currentSessionDurationMs = nextDuration
              lastCompletionId = now
            }
          }

          return {
            remainingMs,
            isRunning,
            mode,
            currentSessionDurationMs,
            sessionsCompleted,
            focusSessions,
            lastCompletionId,
            focusMs,
            totalUptimeMs: state.totalUptimeMs + delta,
            lastTick: now,
          }
        }),
      addHabit: (name, color) =>
        set((state) => ({
          habits: [
            {
              id: generateId(),
              name,
              color,
              createdAt: Date.now(),
              completions: {},
            },
            ...state.habits,
          ],
        })),
      updateHabit: (id, name, color) =>
        set((state) => ({
          habits: state.habits.map((habit) =>
            habit.id === id ? { ...habit, name, color } : habit
          ),
        })),
      deleteHabit: (id) =>
        set((state) => ({
          habits: state.habits.filter((habit) => habit.id !== id),
        })),
      toggleHabitCompletion: (id, dateKey) =>
        set((state) => ({
          habits: state.habits.map((habit) => {
            if (habit.id !== id) return habit
            const next = { ...habit.completions }
            next[dateKey] = !next[dateKey]
            return { ...habit, completions: next }
          }),
        })),
      addTask: (title, category) =>
        set((state) => ({
          tasks: [
            {
              id: generateId(),
              title,
              category,
              dayIndex: null,
              hour: null,
              duration: 60,
            },
            ...state.tasks,
          ],
        })),
      updateTask: (id, updates) =>
        set((state) => ({
          tasks: state.tasks.map((task) => (task.id === id ? { ...task, ...updates } : task)),
        })),
      deleteTask: (id) =>
        set((state) => ({
          tasks: state.tasks.filter((task) => task.id !== id),
        })),
      assignTask: (id, dayIndex, hour) =>
        set((state) => ({
          tasks: state.tasks.map((task) =>
            task.id === id ? { ...task, dayIndex, hour } : task
          ),
        })),
      addNote: (title, content) =>
        set((state) => ({
          notes: [
            {
              id: generateId(),
              title,
              content,
              updatedAt: Date.now(),
            },
            ...state.notes,
          ],
        })),
      updateNote: (id, updates) =>
        set((state) => ({
          notes: state.notes.map((note) =>
            note.id === id ? { ...note, ...updates, updatedAt: Date.now() } : note
          ),
        })),
      deleteNote: (id) =>
        set((state) => ({
          notes: state.notes.filter((note) => note.id !== id),
        })),
    }),
    {
      name: 'hub-storage',
      partialize: (state) => ({
        view: state.view,
        pomodoroSettings: state.pomodoroSettings,
        mode: state.mode,
        isRunning: state.isRunning,
        remainingMs: state.remainingMs,
        currentSessionDurationMs: state.currentSessionDurationMs,
        sessionsCompleted: state.sessionsCompleted,
        focusMs: state.focusMs,
        totalUptimeMs: state.totalUptimeMs,
        focusSessions: state.focusSessions,
        habits: state.habits,
        tasks: state.tasks,
        notes: state.notes,
        quote: state.quote,
        lastCompletionId: state.lastCompletionId,
        lastTick: Date.now(),
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.lastTick = Date.now()
        }
      },
    }
  )
)
