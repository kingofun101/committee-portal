import { auth } from "@/auth"
import { db } from "@/lib/db"
import { redirect } from "next/navigation"
import { AdminContactsClient } from "@/components/admin/AdminContactsClient"

export default async function AdminContactsPage() {
  const session = await auth()
  if (!session || session.user.role !== "ADMIN") redirect("/dashboard")

  const [contacts, members] = await Promise.all([
    db.contact.findMany({
      include: {
        campers: true,
        assignedTo: { select: { id: true, name: true } },
      },
      orderBy: { parentName: "asc" },
    }),
    db.user.findMany({
      where: { role: "MEMBER" },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
  ])

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">All Contacts</h1>
        <p className="text-sm text-gray-500 mt-1">{contacts.length} contact{contacts.length !== 1 ? "s" : ""}</p>
      </div>
      <AdminContactsClient initialContacts={contacts} members={members} />
    </div>
  )
}
