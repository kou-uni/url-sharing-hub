"use client"

import { Home, PlusSquare, Bell, User } from "lucide-react"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

const navItems = [
  { icon: Home, label: "Home", href: "/" },
  { icon: PlusSquare, label: "Post", href: "/post" },
  { icon: Bell, label: "Notifications", href: "/notifications" },
  { icon: User, label: "Profile", href: "/profile" },
]

export function BottomNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-lg border-t border-border safe-area-inset-bottom">
      <div className="mx-auto max-w-screen-sm">
        <div className="grid grid-cols-4 h-16">
          {navItems.map((item) => {
            const isActive = pathname === item.href
            const Icon = item.icon
            return (
              <button
                key={item.href}
                className={cn(
                  "flex flex-col items-center justify-center gap-1 transition-colors min-h-[44px]",
                  isActive ? "text-foreground" : "text-muted-foreground hover:text-foreground",
                )}
                aria-label={item.label}
              >
                <Icon className={cn("h-6 w-6", isActive && "fill-current")} />
                <span className="text-xs font-medium">{item.label}</span>
              </button>
            )
          })}
        </div>
      </div>
    </nav>
  )
}
