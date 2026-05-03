import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { db } from "@/lib/db"

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const contact = await db.contact.findUnique({ where: { id } })
  if (!contact) return NextResponse.json({ error: "Not found" }, { status: 404 })
  if (session.user.role !== "ADMIN" && contact.assignedToId !== session.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const { content } = await req.json()
  if (!content?.trim()) return NextResponse.json({ error: "content required" }, { status: 400 })

  const note = await db.note.create({
    data: { contactId: id, authorId: session.user.id, content: content.trim() },
    include: { author: { select: { name: true, email: true } } },
  })

  return NextResponse.json({
    id: note.id,
    content: note.content,
    createdAt: note.createdAt.toISOString(),
    author: note.author,
  }, { status: 201 })
}
