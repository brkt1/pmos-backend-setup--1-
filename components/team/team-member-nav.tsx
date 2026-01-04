"use client"

import { Button } from "@/components/ui/button"
import { Home } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"

const navItems = [
  { href: "/dashboard/team-member", label: "My Tasks", icon: Home },
]

export function TeamMemberNav() {
  const pathname = usePathname()

  return (
    <nav className="p-4 space-y-2 flex-1">
      {navItems.map((item) => {
        const Icon = item.icon
        const isActive = pathname === item.href
        return (
          <Button
            key={item.href}
            variant={isActive ? "secondary" : "ghost"}
            className="w-full justify-start"
            asChild
          >
            <Link href={item.href}>
              <Icon className="h-4 w-4 mr-2 shrink-0" />
              <span className="truncate">{item.label}</span>
            </Link>
          </Button>
        )
      })}
    </nav>
  )
}

