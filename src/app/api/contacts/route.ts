import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { db } from "@/lib/db"

export async function GET() {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const where = session.user.role === "ADMIN" ? {} : { assignedToId: session.user.id }

  const contacts = await db.contact.findMany({
    where,
    include: {
      campers: true,
      assignedTo: { select: { id: true, name: true, email: true } },
    },
    orderBy: { parentName: "asc" },
  })

  return NextResponse.json(contacts)
}

export async function POST(req: Request) {
  const session = await auth()
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const body = await req.json()
  const { parentName, email, phone, neighborhood, assignedToId, campers } = body

  if (!parentName) return NextResponse.json({ error: "parentName required" }, { status: 400 })

  const contact = await db.contact.create({
    data: {
      parentName,
      email: email || null,
      phone: phone || null,
      neighborhood: neighborhood || null,
      assignedToId: assignedToId || null,
      campers: {
        create: (campers ?? []).map((c: { name: string; age?: number }) => ({
          name: c.name,
          age: c.age ?? null,
        })),
      },
    },
    include: { campers: true },
  })

  return NextResponse.json(contact, { status: 201 })
}
