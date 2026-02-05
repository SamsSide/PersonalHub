import * as React from 'react'
import { cn } from '@/lib/utils'

interface SwitchProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  checked: boolean
}

const Switch = React.forwardRef<HTMLButtonElement, SwitchProps>(
  ({ checked, className, ...props }, ref) => (
    <button
      ref={ref}
      type="button"
      role="switch"
      aria-checked={checked}
      className={cn(
        'relative h-6 w-11 rounded-full border border-zincLine bg-slate/70 transition-colors',
        checked && 'bg-emeraldGlow/60',
        className
      )}
      {...props}
    >
      <span
        className={cn(
          'absolute left-1 top-1 h-4 w-4 rounded-full bg-white/80 transition-transform',
          checked && 'translate-x-5 bg-emeraldGlow'
        )}
      />
    </button>
  )
)
Switch.displayName = 'Switch'

export { Switch }
