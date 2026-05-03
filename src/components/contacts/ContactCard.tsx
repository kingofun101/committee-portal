import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { StatusBadges } from "./StatusBadges"
import { MapPin, Users } from "lucide-react"

interface ContactCardProps {
  contact: {
    id: string
    parentName: string
    email: string | null
    phone: string | null
    neighborhood: string | null
    emailSent: boolean
    voicemailLeft: boolean
    talkedToFamily: boolean
    campers: { id: string; name: string; age: number | null }[]
  }
}

export function ContactCard({ contact }: ContactCardProps) {
  const allDone = contact.emailSent && contact.voicemailLeft && contact.talkedToFamily

  return (
    <Link href={`/contacts/${contact.id}`}>
      <Card className={`hover:shadow-md transition-shadow cursor-pointer ${allDone ? "border-green-200" : ""}`}>
        <CardContent className="p-4">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <h3 className="font-semibold text-gray-900 truncate">{contact.parentName}</h3>
              <div className="flex items-center gap-3 mt-1 text-sm text-gray-500">
                {contact.neighborhood && (
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {contact.neighborhood}
                  </span>
                )}
                {contact.campers.length > 0 && (
                  <span className="flex items-center gap-1">
                    <Users className="h-3 w-3" />
                    {contact.campers.map((c) => `${c.name}${c.age ? ` (${c.age})` : ""}`).join(", ")}
                  </span>
                )}
              </div>
            </div>
            <div className="shrink-0">
              <StatusBadges
                emailSent={contact.emailSent}
                voicemailLeft={contact.voicemailLeft}
                talkedToFamily={contact.talkedToFamily}
                size="sm"
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
