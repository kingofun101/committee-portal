import { auth } from "@/auth"
import { db } from "@/lib/db"
import { ContactCard } from "@/components/contacts/ContactCard"
import { redirect } from "next/navigation"

export default async function DashboardPage() {
  const session = await auth()
  if (!session) redirect("/login")

  const contacts = await db.contact.findMany({
    where: { assignedToId: session.user.id },
    include: { campers: true },
    orderBy: { parentName: "asc" },
  })

  const done = contacts.filter((c) => c.emailSent && c.voicemailLeft && c.talkedToFamily).length
  const total = contacts.length

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">My Contacts</h1>
        <p className="text-sm text-gray-500 mt-1">
          {total === 0
            ? "No contacts assigned yet."
            : `${done} of ${total} fully reached · ${total - done} remaining`}
        </p>
      </div>

      {contacts.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <p className="text-lg">No contacts assigned to you yet.</p>
          <p className="text-sm mt-1">Check back soon or contact your admin.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {contacts.map((contact) => (
            <ContactCard key={contact.id} contact={contact} />
          ))}
        </div>
      )}
    </div>
  )
}
