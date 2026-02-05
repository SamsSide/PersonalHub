import { Menu, X } from 'lucide-react'
import { useState } from 'react'
import { Sidebar } from './Sidebar'

export function Topbar() {
  const [open, setOpen] = useState(false)

  return (
    <>
      <header className="glass-panel sticky top-0 z-30 flex items-center justify-between px-4 py-3 lg:hidden">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Hub</p>
          <h1 className="text-lg font-semibold text-slate-100">Tokyo Night</h1>
        </div>
        <button
          className="rounded-full border border-zincLine bg-slate/60 p-2 text-slate-200"
          onClick={() => setOpen((prev) => !prev)}
        >
          {open ? <X size={18} /> : <Menu size={18} />}
        </button>
      </header>
      {open && (
        <div className="fixed inset-0 z-20 bg-black/60 lg:hidden" onClick={() => setOpen(false)} />
      )}
      <div
        className={`fixed left-0 top-0 z-30 h-full w-72 transform transition-transform lg:hidden ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <Sidebar variant="mobile" className="h-full w-full" />
      </div>
    </>
  )
}
