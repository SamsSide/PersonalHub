import { useState } from 'react'
import ReactMarkdown from 'react-markdown'
import { Plus, Save, Trash2 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { useHubStore, type NoteItem } from '@/store/useHubStore'

function NoteCard({ note }: { note: NoteItem }) {
  const updateNote = useHubStore((state) => state.updateNote)
  const deleteNote = useHubStore((state) => state.deleteNote)
  const [isEditing, setIsEditing] = useState(false)
  const [title, setTitle] = useState(note.title)
  const [content, setContent] = useState(note.content)

  const handleSave = () => {
    updateNote(note.id, { title, content })
    setIsEditing(false)
  }

  return (
    <div className="rounded-2xl border border-zincLine bg-slate/60 p-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-slate-400">Updated {new Date(note.updatedAt).toLocaleDateString()}</p>
          <h4 className="text-base font-semibold text-slate-100">{note.title}</h4>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={() => setIsEditing((prev) => !prev)} variant="ghost" size="sm">
            {isEditing ? 'View' : 'Edit'}
          </Button>
          <Button onClick={() => deleteNote(note.id)} variant="ghost" size="sm">
            <Trash2 size={14} />
          </Button>
        </div>
      </div>
      <div className="mt-3">
        {isEditing ? (
          <div className="space-y-3">
            <Input value={title} onChange={(event) => setTitle(event.target.value)} />
            <Textarea value={content} onChange={(event) => setContent(event.target.value)} />
            <Button onClick={handleSave} size="sm">
              <Save size={14} />
              Save
            </Button>
          </div>
        ) : (
          <div className="prose prose-invert max-w-none text-sm text-slate-200">
            <ReactMarkdown>{note.content || 'No content yet.'}</ReactMarkdown>
          </div>
        )}
      </div>
    </div>
  )
}

export function NotesArea() {
  const notes = useHubStore((state) => state.notes)
  const addNote = useHubStore((state) => state.addNote)
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')

  const handleAdd = () => {
    if (!title.trim() && !content.trim()) return
    addNote(title.trim() || 'Untitled', content.trim())
    setTitle('')
    setContent('')
  }

  return (
    <Card>
      <CardHeader>
        <div>
          <CardTitle>Notes & Ideas</CardTitle>
          <p className="text-xs text-slate-400">Markdown-ready sticky notes for quick capture.</p>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-3 lg:grid-cols-[1.2fr_1fr]">
          <Input
            placeholder="Note title"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
          />
          <Button onClick={handleAdd} size="sm">
            <Plus size={16} />
            Add Note
          </Button>
        </div>
        <Textarea
          placeholder="Write in Markdown..."
          value={content}
          onChange={(event) => setContent(event.target.value)}
        />
        <div className="grid gap-4 lg:grid-cols-2">
          {notes.length === 0 && (
            <div className="rounded-xl border border-dashed border-zincLine px-4 py-6 text-sm text-slate-500">
              Your notes will appear here. Create your first idea.
            </div>
          )}
          {notes.map((note) => (
            <NoteCard key={note.id} note={note} />
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
