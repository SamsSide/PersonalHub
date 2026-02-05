import { PomodoroTimer } from './PomodoroTimer'
import { HabitTracker } from './HabitTracker'
import { NotesArea } from './NotesArea'
import { DailyQuote } from './DailyQuote'

export function Dashboard() {
  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <PomodoroTimer />
        <DailyQuote />
      </div>
      <HabitTracker />
      <NotesArea />
    </div>
  )
}
