"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { signOut } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface NavbarProps {
  user: { name?: string | null; email?: string | null; role: "ADMIN" | "MEMBER" }
}

export function Navbar({ user }: NavbarProps) {
  const pathname = usePathname()

  const links = [
    { href: "/dashboard", label: "My Contacts" },
    ...(user.role === "ADMIN"
      ? [
          { href: "/admin/contacts", label: "All Contacts" },
          { href: "/admin/members", label: "Members" },
          { href: "/admin/script", label: "Script" },
        ]
      : []),
  ]

  return (
    <header className="bg-white border-b border-gray-200">
      <div className="max-w-5xl mx-auto px-4 flex items-center justify-between h-14">
        <div className="flex items-center gap-6">
          <span className="font-semibold text-gray-900 text-sm">JCC Camps at Medford</span>
          <nav className="flex items-center gap-1">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "text-sm px-3 py-1.5 rounded-md transition-colors",
                  pathname.startsWith(link.href)
                    ? "bg-gray-100 text-gray-900 font-medium"
                    : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-500">{user.name ?? user.email}</span>
          <Button variant="ghost" size="sm" onClick={() => signOut({ callbackUrl: "/login" })}>
            Sign out
          </Button>
        </div>
      </div>
    </header>
  )
}
