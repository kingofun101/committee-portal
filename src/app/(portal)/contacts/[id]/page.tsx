import { auth } from "@/auth"
import { db } from "@/lib/db"
import { notFound, redirect } from "next/navigation"
import { ContactStatusForm } from "@/components/contacts/ContactStatusForm"
import { NotesSection } from "@/components/contacts/NotesSection"
import { ScriptPanel } from "@/components/contacts/ScriptPanel"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import Link from "next/link"
import { ArrowLeft, Mail, Phone, MapPin } from "lucide-react"

export default async function ContactPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const session = await auth()
  if (!session) redirect("/login")

  const contact = await db.contact.findUnique({
    where: { id },
    include: {
      campers: { orderBy: { name: "asc" } },
      notes: {
        include: { author: { select: { name: true, email: true } } },
        orderBy: { createdAt: "desc" },
      },
    },
  })

  if (!contact) notFound()

  // Members can only view their own assigned contacts
  if (session.user.role !== "ADMIN" && contact.assignedToId !== session.user.id) {
    redirect("/dashboard")
  }

  const script = await db.script.findFirst()

  const serializedNotes = contact.notes.map((n) => ({
    id: n.id,
    content: n.content,
    createdAt: n.createdAt.toISOString(),
    author: { name: n.author.name, email: n.author.email },
  }))

  return (
    <div className="max-w-2xl">
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-900 mb-6"
      >
        <ArrowLeft className="h-3 w-3" /> Back to My Contacts
      </Link>

      <h1 className="text-2xl font-bold text-gray-900 mb-1">{contact.parentName}</h1>

      <div className="flex flex-wrap gap-4 text-sm text-gray-500 mb-6">
        {contact.email && (
          <a href={`mailto:${contact.email}`} className="flex items-center gap-1 hover:text-gray-900">
            <Mail className="h-3 w-3" /> {contact.email}
          </a>
        )}
        {contact.phone && (
          <a href={`tel:${contact.phone}`} className="flex items-center gap-1 hover:text-gray-900">
            <Phone className="h-3 w-3" /> {contact.phone}
          </a>
        )}
        {contact.neighborhood && (
          <span className="flex items-center gap-1">
            <MapPin className="h-3 w-3" /> {contact.neighborhood}
          </span>
        )}
      </div>

      {contact.campers.length > 0 && (
        <Card className="mb-6">
          <CardContent className="p-4">
            <h3 className="font-semibold text-gray-900 mb-3">Campers</h3>
            <div className="space-y-2">
              {contact.campers.map((camper) => (
                <div key={camper.id} className="flex items-center gap-3">
                  <span className="font-medium text-sm">{camper.name}</span>
                  {camper.age && (
                    <span className="text-xs text-gray-400 bg-gray-100 rounded-full px-2 py-0.5">
                      Age {camper.age}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="mb-6">
        <CardContent className="p-4">
          <ContactStatusForm
            contactId={contact.id}
            emailSent={contact.emailSent}
            voicemailLeft={contact.voicemailLeft}
            talkedToFamily={contact.talkedToFamily}
          />
        </CardContent>
      </Card>

      <ScriptPanel script={script} />

      <Separator className="my-6" />

      <NotesSection contactId={contact.id} initialNotes={serializedNotes} />
    </div>
  )
}
