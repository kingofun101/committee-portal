"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useRouter } from "next/navigation"
import { Plus, Upload, Trash2, Pencil } from "lucide-react"
import { StatusBadges } from "@/components/contacts/StatusBadges"

type Camper = { id?: string; name: string; age: string }
type Contact = {
  id: string
  parentName: string
  email: string | null
  phone: string | null
  neighborhood: string | null
  emailSent: boolean
  voicemailLeft: boolean
  talkedToFamily: boolean
  campers: { id: string; name: string; age: number | null }[]
  assignedTo: { id: string; name: string } | null
}
type Member = { id: string; name: string }

export function AdminContactsClient({
  initialContacts,
  members,
}: {
  initialContacts: Contact[]
  members: Member[]
}) {
  const router = useRouter()
  const [contacts, setContacts] = useState(initialContacts)
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<Contact | null>(null)
  const [saving, setSaving] = useState(false)
  const [importMsg, setImportMsg] = useState("")

  // Form state
  const [parentName, setParentName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [neighborhood, setNeighborhood] = useState("")
  const [assignedToId, setAssignedToId] = useState("")
  const [campers, setCampers] = useState<Camper[]>([{ name: "", age: "" }])

  function openCreate() {
    setEditing(null)
    setParentName(""); setEmail(""); setPhone(""); setNeighborhood(""); setAssignedToId("")
    setCampers([{ name: "", age: "" }])
    setOpen(true)
  }

  function openEdit(c: Contact) {
    setEditing(c)
    setParentName(c.parentName); setEmail(c.email ?? ""); setPhone(c.phone ?? "")
    setNeighborhood(c.neighborhood ?? ""); setAssignedToId(c.assignedTo?.id ?? "")
    setCampers(c.campers.length > 0 ? c.campers.map((k) => ({ name: k.name, age: k.age?.toString() ?? "" })) : [{ name: "", age: "" }])
    setOpen(true)
  }

  async function saveContact(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    const body = {
      parentName,
      email: email || null,
      phone: phone || null,
      neighborhood: neighborhood || null,
      assignedToId: assignedToId || null,
      campers: campers.filter((c) => c.name.trim()).map((c) => ({ name: c.name, age: c.age ? parseInt(c.age) : undefined })),
    }
    const url = editing ? `/api/contacts/${editing.id}` : "/api/contacts"
    const method = editing ? "PATCH" : "POST"
    await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) })
    setSaving(false)
    setOpen(false)
    router.refresh()
    const data = await fetch("/api/contacts").then((r) => r.json())
    setContacts(data)
  }

  async function deleteContact(id: string) {
    if (!confirm("Delete this contact?")) return
    await fetch(`/api/contacts/${id}`, { method: "DELETE" })
    setContacts((prev) => prev.filter((c) => c.id !== id))
  }

  async function handleAssign(contactId: string, memberId: string) {
    await fetch(`/api/contacts/${contactId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ assignedToId: memberId || null }),
    })
    router.refresh()
    const data = await fetch("/api/contacts").then((r) => r.json())
    setContacts(data)
  }

  async function handleImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const fd = new FormData()
    fd.append("file", file)
    const res = await fetch("/api/import", { method: "POST", body: fd })
    const data = await res.json()
    setImportMsg(`Imported ${data.created} contacts (${data.skipped} skipped).`)
    router.refresh()
    const updated = await fetch("/api/contacts").then((r) => r.json())
    setContacts(updated)
    e.target.value = ""
  }

  return (
    <>
      <div className="flex items-center justify-between mb-4 gap-2 flex-wrap">
        <div className="flex items-center gap-2">
          <label className="cursor-pointer">
            <Button variant="outline" className="pointer-events-none">
              <Upload className="h-4 w-4 mr-1" /> Import CSV
            </Button>
            <input type="file" accept=".csv" className="hidden" onChange={handleImport} />
          </label>
          {importMsg && <span className="text-sm text-gray-500">{importMsg}</span>}
        </div>
        <Button onClick={openCreate}>
          <Plus className="h-4 w-4 mr-1" /> Add Contact
        </Button>
      </div>

      <div className="bg-white rounded-lg border overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Parent</TableHead>
              <TableHead>Neighborhood</TableHead>
              <TableHead>Campers</TableHead>
              <TableHead>Assigned To</TableHead>
              <TableHead>Status</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {contacts.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-gray-400 py-8">No contacts yet.</TableCell>
              </TableRow>
            )}
            {contacts.map((c) => (
              <TableRow key={c.id}>
                <TableCell>
                  <div className="font-medium">{c.parentName}</div>
                  {c.email && <div className="text-xs text-gray-400">{c.email}</div>}
                </TableCell>
                <TableCell className="text-sm text-gray-500">{c.neighborhood ?? "—"}</TableCell>
                <TableCell className="text-sm">
                  {c.campers.map((k) => k.name).join(", ") || "—"}
                </TableCell>
                <TableCell>
                  <select
                    className="text-sm border border-input rounded px-2 py-1 min-w-[120px]"
                    value={c.assignedTo?.id ?? ""}
                    onChange={(e) => handleAssign(c.id, e.target.value)}
                  >
                    <option value="">Unassigned</option>
                    {members.map((m) => (
                      <option key={m.id} value={m.id}>{m.name}</option>
                    ))}
                  </select>
                </TableCell>
                <TableCell>
                  <StatusBadges
                    emailSent={c.emailSent}
                    voicemailLeft={c.voicemailLeft}
                    talkedToFamily={c.talkedToFamily}
                    size="sm"
                  />
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="sm" onClick={() => openEdit(c)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" className="text-red-500" onClick={() => deleteContact(c.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Contact" : "Add Contact"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={saveContact} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2 space-y-1">
                <Label>Parent / Guardian Name *</Label>
                <Input value={parentName} onChange={(e) => setParentName(e.target.value)} required />
              </div>
              <div className="space-y-1">
                <Label>Email</Label>
                <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
              <div className="space-y-1">
                <Label>Phone</Label>
                <Input value={phone} onChange={(e) => setPhone(e.target.value)} />
              </div>
              <div className="space-y-1">
                <Label>Neighborhood</Label>
                <Input value={neighborhood} onChange={(e) => setNeighborhood(e.target.value)} />
              </div>
              <div className="space-y-1">
                <Label>Assign to Member</Label>
                <select
                  className="w-full border border-input rounded-md px-3 py-2 text-sm"
                  value={assignedToId}
                  onChange={(e) => setAssignedToId(e.target.value)}
                >
                  <option value="">Unassigned</option>
                  {members.map((m) => (
                    <option key={m.id} value={m.id}>{m.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <Label className="mb-2 block">Campers</Label>
              <div className="space-y-2">
                {campers.map((camper, i) => (
                  <div key={i} className="flex gap-2 items-center">
                    <Input
                      placeholder="Camper name"
                      value={camper.name}
                      onChange={(e) => {
                        const next = [...campers]
                        next[i] = { ...next[i], name: e.target.value }
                        setCampers(next)
                      }}
                    />
                    <Input
                      placeholder="Age"
                      type="number"
                      className="w-20"
                      value={camper.age}
                      onChange={(e) => {
                        const next = [...campers]
                        next[i] = { ...next[i], age: e.target.value }
                        setCampers(next)
                      }}
                    />
                    {campers.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setCampers(campers.filter((_, j) => j !== i))}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="mt-2"
                onClick={() => setCampers([...campers, { name: "", age: "" }])}
              >
                <Plus className="h-3 w-3 mr-1" /> Add camper
              </Button>
            </div>

            <div className="flex justify-end gap-2">
              <Button type="button" variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={saving}>{saving ? "Saving…" : "Save"}</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}
