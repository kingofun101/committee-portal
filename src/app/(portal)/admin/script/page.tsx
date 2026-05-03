import { auth } from "@/auth"
import { db } from "@/lib/db"
import { redirect } from "next/navigation"
import { ScriptEditor } from "@/components/admin/ScriptEditor"

export default async function AdminScriptPage() {
  const session = await auth()
  if (!session || session.user.role !== "ADMIN") redirect("/dashboard")

  const script = await db.script.findFirst()

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Talking Points Script</h1>
        <p className="text-sm text-gray-500 mt-1">
          This script is shown to all committee members on each contact page.
        </p>
      </div>
      <ScriptEditor initial={script} />
    </div>
  )
}
