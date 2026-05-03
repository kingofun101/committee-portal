"use client"

import { useState } from "react"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { useRouter } from "next/navigation"

interface ContactStatusFormProps {
  contactId: string
  emailSent: boolean
  voicemailLeft: boolean
  talkedToFamily: boolean
}

export function ContactStatusForm({
  contactId,
  emailSent: initialEmailSent,
  voicemailLeft: initialVoicemailLeft,
  talkedToFamily: initialTalkedToFamily,
}: ContactStatusFormProps) {
  const router = useRouter()
  const [emailSent, setEmailSent] = useState(initialEmailSent)
  const [voicemailLeft, setVoicemailLeft] = useState(initialVoicemailLeft)
  const [talkedToFamily, setTalkedToFamily] = useState(initialTalkedToFamily)

  async function updateStatus(field: string, value: boolean) {
    await fetch(`/api/contacts/${contactId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ [field]: value }),
    })
    router.refresh()
  }

  return (
    <div>
      <h3 className="font-semibold text-gray-900 mb-3">Communication Status</h3>
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <Checkbox
            id="emailSent"
            checked={emailSent}
            onCheckedChange={(v) => {
              setEmailSent(!!v)
              updateStatus("emailSent", !!v)
            }}
          />
          <Label htmlFor="emailSent" className="cursor-pointer">Email Sent</Label>
        </div>
        <div className="flex items-center gap-3">
          <Checkbox
            id="voicemailLeft"
            checked={voicemailLeft}
            onCheckedChange={(v) => {
              setVoicemailLeft(!!v)
              updateStatus("voicemailLeft", !!v)
            }}
          />
          <Label htmlFor="voicemailLeft" className="cursor-pointer">Voicemail Left</Label>
        </div>
        <div className="flex items-center gap-3">
          <Checkbox
            id="talkedToFamily"
            checked={talkedToFamily}
            onCheckedChange={(v) => {
              setTalkedToFamily(!!v)
              updateStatus("talkedToFamily", !!v)
            }}
          />
          <Label htmlFor="talkedToFamily" className="cursor-pointer">Talked to Family</Label>
        </div>
      </div>
    </div>
  )
}
