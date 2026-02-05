import * as React from 'react'
import { cn } from '@/lib/utils'

const Badge = React.forwardRef<HTMLSpanElement, React.HTMLAttributes<HTMLSpanElement>>(
  ({ className, ...props }, ref) => (
    <span
      ref={ref}
      className={cn(
        'inline-flex items-center rounded-full border border-zincLine bg-slate/60 px-2.5 py-1 text-xs font-medium text-slate-100',
        className
      )}
      {...props}
    />
  )
)
Badge.displayName = 'Badge'

export { Badge }
