"use client"

import { useState } from "react"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"

interface Note {
  id: string
  content: string
  createdAt: string
  author: { name: string | null; email: string | null }
}

interface NotesSectionProps {
  contactId: string
  initialNotes: Note[]
}

export function NotesSection({ contactId, initialNotes }: NotesSectionProps) {
  const router = useRouter()
  const [notes, setNotes] = useState(initialNotes)
  const [text, setText] = useState("")
  const [saving, setSaving] = useState(false)

  async function addNote() {
    if (!text.trim()) return
    setSaving(true)
    const res = await fetch(`/api/contacts/${contactId}/notes`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: text.trim() }),
    })
    if (res.ok) {
      const note = await res.json()
      setNotes([note, ...notes])
      setText("")
      router.refresh()
    }
    setSaving(false)
  }

  return (
    <div>
      <h3 className="font-semibold text-gray-900 mb-3">Notes</h3>
      <div className="space-y-2 mb-4">
        <Textarea
          placeholder="Add a note…"
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={3}
        />
        <Button size="sm" onClick={addNote} disabled={saving || !text.trim()}>
          {saving ? "Saving…" : "Add Note"}
        </Button>
      </div>
      {notes.length === 0 ? (
        <p className="text-sm text-gray-400">No notes yet.</p>
      ) : (
        <div className="space-y-3">
          {notes.map((note) => (
            <div key={note.id} className="bg-white border border-gray-100 rounded-lg p-3">
              <p className="text-sm text-gray-800 whitespace-pre-wrap">{note.content}</p>
              <p className="text-xs text-gray-400 mt-2">
                {note.author.name ?? note.author.email} ·{" "}
                {new Date(note.createdAt).toLocaleString()}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
