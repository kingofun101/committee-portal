import { PrismaClient } from "../src/generated/prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"
import bcrypt from "bcryptjs"

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const db = new PrismaClient({ adapter })

async function main() {
  const existing = await db.user.findUnique({ where: { email: "admin@jcccamps.org" } })
  if (existing) {
    console.log("Admin already exists, skipping seed.")
    return
  }

  const passwordHash = await bcrypt.hash("ChangeMe123!", 12)

  const admin = await db.user.create({
    data: {
      name: "Camp Admin",
      email: "admin@jcccamps.org",
      passwordHash,
      role: "ADMIN",
    },
  })

  const scriptExists = await db.script.findFirst()
  if (!scriptExists) {
    await db.script.create({
      data: {
        title: "JCC Camps at Medford — Talking Points",
        content: `Hi, this is [Your Name] calling from JCC Camps at Medford on behalf of the Parent Committee.

I'm reaching out to welcome your family to camp and see if you have any questions as we get closer to the summer.

Key talking points:
• Session dates and drop-off/pick-up times
• What to pack — we'll send a full packing list by email
• Health forms are due [DATE] — please log in to your CampBrain account
• Fee assistance is available — contact the office if needed
• Our Parent Committee is always available for questions

Is there anything I can help with today?

Thank you for being part of the JCC Camps family — we can't wait for a great summer!`,
      },
    })
  }

  console.log(`Admin created: ${admin.email} / ChangeMe123!`)
  console.log("Script created.")
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => db.$disconnect())
