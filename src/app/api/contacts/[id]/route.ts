import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { db } from "@/lib/db"

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const contact = await db.contact.findUnique({
    where: { id },
    include: { campers: true, notes: { include: { author: { select: { name: true, email: true } } }, orderBy: { createdAt: "desc" } } },
  })

  if (!contact) return NextResponse.json({ error: "Not found" }, { status: 404 })
  if (session.user.role !== "ADMIN" && contact.assignedToId !== session.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  return NextResponse.json(contact)
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const contact = await db.contact.findUnique({ where: { id } })
  if (!contact) return NextResponse.json({ error: "Not found" }, { status: 404 })
  if (session.user.role !== "ADMIN" && contact.assignedToId !== session.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const body = await req.json()

  // Members can only update status fields; admins can update anything
  const allowedFields =
    session.user.role === "ADMIN"
      ? ["parentName", "email", "phone", "neighborhood", "assignedToId", "emailSent", "voicemailLeft", "talkedToFamily"]
      : ["emailSent", "voicemailLeft", "talkedToFamily"]

  const data: Record<string, unknown> = {}
  for (const field of allowedFields) {
    if (field in body) data[field] = body[field]
  }

  // Handle camper updates (admin only)
  if (session.user.role === "ADMIN" && body.campers) {
    await db.camper.deleteMany({ where: { contactId: id } })
    data.campers = {
      create: body.campers.map((c: { name: string; age?: number }) => ({
        name: c.name,
        age: c.age ?? null,
      })),
    }
  }

  const updated = await db.contact.update({
    where: { id },
    data,
    include: { campers: true },
  })

  return NextResponse.json(updated)
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const session = await auth()
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  await db.contact.delete({ where: { id } })
  return NextResponse.json({ success: true })
}
