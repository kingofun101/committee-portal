import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { db } from "@/lib/db"

// CSV format: parentName,email,phone,neighborhood,camperName,camperAge
// One row per camper; rows with same email are grouped into one Contact

export async function POST(req: Request) {
  const session = await auth()
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const formData = await req.formData()
  const file = formData.get("file") as File | null
  if (!file) return NextResponse.json({ error: "No file provided" }, { status: 400 })

  const text = await file.text()
  const lines = text.split("\n").map((l) => l.trim()).filter(Boolean)

  if (lines.length < 2) return NextResponse.json({ error: "CSV too short" }, { status: 400 })

  const rows = lines.slice(1).map((line) => {
    const [parentName, email, phone, neighborhood, camperName, camperAge] = line.split(",").map((v) => v.trim())
    return { parentName, email, phone, neighborhood, camperName, camperAge: camperAge ? parseInt(camperAge) : null }
  })

  // Group by email (or parentName if no email)
  const groups = new Map<string, typeof rows>()
  for (const row of rows) {
    const key = row.email || row.parentName
    if (!groups.has(key)) groups.set(key, [])
    groups.get(key)!.push(row)
  }

  let created = 0
  let skipped = 0

  for (const [, groupRows] of groups) {
    const first = groupRows[0]
    if (!first.parentName) { skipped++; continue }

    // Skip if a contact with same email already exists
    if (first.email) {
      const existing = await db.contact.findFirst({ where: { email: first.email } })
      if (existing) { skipped++; continue }
    }

    await db.contact.create({
      data: {
        parentName: first.parentName,
        email: first.email || null,
        phone: first.phone || null,
        neighborhood: first.neighborhood || null,
        campers: {
          create: groupRows
            .filter((r) => r.camperName)
            .map((r) => ({ name: r.camperName, age: r.camperAge })),
        },
      },
    })
    created++
  }

  return NextResponse.json({ created, skipped })
}
