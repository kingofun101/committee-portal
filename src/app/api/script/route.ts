import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { db } from "@/lib/db"

export async function GET() {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const script = await db.script.findFirst()
  return NextResponse.json(script)
}

export async function PUT(req: Request) {
  const session = await auth()
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const { title, content } = await req.json()
  if (!title || !content) {
    return NextResponse.json({ error: "title and content required" }, { status: 400 })
  }

  const existing = await db.script.findFirst()
  const script = existing
    ? await db.script.update({ where: { id: existing.id }, data: { title, content } })
    : await db.script.create({ data: { title, content } })

  return NextResponse.json(script)
}
