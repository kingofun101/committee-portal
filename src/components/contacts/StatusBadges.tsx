import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface StatusBadgesProps {
  emailSent: boolean
  voicemailLeft: boolean
  talkedToFamily: boolean
  size?: "sm" | "default"
}

export function StatusBadges({ emailSent, voicemailLeft, talkedToFamily, size = "default" }: StatusBadgesProps) {
  const badges = [
    { label: "Email Sent", done: emailSent, activeClass: "bg-blue-100 text-blue-700 border-blue-200" },
    { label: "Voicemail", done: voicemailLeft, activeClass: "bg-amber-100 text-amber-700 border-amber-200" },
    { label: "Talked to Family", done: talkedToFamily, activeClass: "bg-green-100 text-green-700 border-green-200" },
  ]

  return (
    <div className="flex flex-wrap gap-1.5">
      {badges.map(({ label, done, activeClass }) => (
        <span
          key={label}
          className={cn(
            "inline-flex items-center rounded-full border px-2.5 py-0.5 font-medium",
            size === "sm" ? "text-xs" : "text-xs",
            done ? activeClass : "bg-gray-50 text-gray-400 border-gray-200"
          )}
        >
          {done && <span className="mr-1">✓</span>}
          {label}
        </span>
      ))}
    </div>
  )
}
