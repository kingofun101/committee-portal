import { auth } from "@/auth"
import { db } from "@/lib/db"
import { redirect } from "next/navigation"
import { MembersClient } from "@/components/admin/MembersClient"

export default async function AdminMembersPage() {
  const session = await auth()
  if (!session || session.user.role !== "ADMIN") redirect("/dashboard")

  const members = await db.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
      _count: { select: { assignedContacts: true } },
    },
    orderBy: { name: "asc" },
  })

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Committee Members</h1>
        <p className="text-sm text-gray-500 mt-1">{members.length} member{members.length !== 1 ? "s" : ""}</p>
      </div>
      <MembersClient initialMembers={members} />
    </div>
  )
}
