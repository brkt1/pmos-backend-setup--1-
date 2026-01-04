"use client"

import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { BarChart3, Bell, Calendar, CheckSquare, FileText, LayoutDashboard, Menu, Repeat, Settings, Target, TrendingUp, Users } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"

const navItems = [
  { href: "/dashboard", label: "Daily Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/vision", label: "Vision Layer", icon: Target },
  { href: "/dashboard/strategy", label: "Strategy Layer", icon: TrendingUp },
  { href: "/dashboard/execution", label: "Execution Layer", icon: CheckSquare },
  { href: "/dashboard/reviews", label: "Reviews", icon: Calendar },
  { href: "/dashboard/team", label: "Team Management", icon: Users },
  { href: "/dashboard/calendar", label: "Calendar", icon: Calendar },
  { href: "/dashboard/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/dashboard/recurring-tasks", label: "Recurring Tasks", icon: Repeat },
  { href: "/dashboard/templates", label: "Templates", icon: FileText },
  { href: "/dashboard/notifications", label: "Notifications", icon: Bell },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
]

export function MobileNav() {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-64 p-0">
        <nav className="p-4 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href
            return (
              <Button
                key={item.href}
                variant={isActive ? "secondary" : "ghost"}
                className="w-full justify-start"
                asChild
                onClick={() => setOpen(false)}
              >
                <Link href={item.href}>
                  <Icon className="h-4 w-4 mr-2" />
                  {item.label}
                </Link>
              </Button>
            )
          })}
        </nav>
      </SheetContent>
    </Sheet>
  )
}

