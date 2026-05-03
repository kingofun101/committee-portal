"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ChevronDown, ChevronUp, FileText } from "lucide-react"

interface ScriptPanelProps {
  script: { title: string; content: string } | null
}

export function ScriptPanel({ script }: ScriptPanelProps) {
  const [open, setOpen] = useState(false)

  if (!script) return null

  return (
    <Card className="border-blue-100 bg-blue-50/50">
      <CardHeader
        className="cursor-pointer select-none py-3 px-4"
        onClick={() => setOpen((o) => !o)}
      >
        <CardTitle className="flex items-center justify-between text-base text-blue-800">
          <span className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            {script.title}
          </span>
          {open ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </CardTitle>
      </CardHeader>
      {open && (
        <CardContent className="px-4 pb-4 pt-0">
          <pre className="text-sm text-blue-900 whitespace-pre-wrap font-sans leading-relaxed">
            {script.content}
          </pre>
        </CardContent>
      )}
    </Card>
  )
}
