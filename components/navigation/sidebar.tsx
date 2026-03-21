"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Package, Truck, RotateCcw, QrCode, BarChart3, Settings, Menu, X, Users, DollarSign, Send } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useState } from "react"

const navigationItems = [
  {
    icon: BarChart3,
    title: "Dashboard",
    href: "/",
  },
  {
    icon: Package,
    title: "Inventory",
    href: "/inventory",
  },
  {
    icon: Users,
    title: "Customers",
    href: "/customers",
  },
  {
    icon: QrCode,
    title: "Bookings",
    href: "/bookings",
  },
  {
    icon: Send,
    title: "Issue Items",
    href: "/issue-items",
  },
  {
    icon: Truck,
    title: "Deliveries",
    href: "/delivery",
  },
  {
    icon: RotateCcw,
    title: "Returns",
    href: "/returns",
  },
  {
    icon: BarChart3,
    title: "Reports",
    href: "/reports",
  },
  {
    icon: Settings,
    title: "Barcodes",
    href: "/barcode",
  },
  {
    icon: DollarSign,
    title: "Accounting",
    href: "/accounting",
  },
]

import { useAuth } from "@/contexts/auth-context"
import { LogOut } from "lucide-react"

export function Sidebar() {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)
  const { logout } = useAuth()

  return (
    <>
      {/* Mobile Menu Button */}
      <div className="md:hidden fixed top-4 left-4 z-40">
        <Button variant="outline" size="icon" onClick={() => setIsOpen(!isOpen)} className="bg-background">
          {isOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
        </Button>
      </div>

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 h-full w-64 bg-card border-r border-border transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        } md:relative md:translate-x-0 z-30 flex flex-col`}
      >
        <div className="p-6 flex-1 overflow-y-auto">
          {/* Logo/Brand */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-primary tracking-tight">RMS</h1>
            <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Portal Access v1.4</p>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1">
            {navigationItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href

              return (
                <Link key={item.href} href={item.href}>
                  <Button
                    variant={isActive ? "default" : "ghost"}
                    className={`w-full justify-start gap-3 rounded-xl h-11 transition-all ${isActive ? "shadow-lg shadow-blue-100 font-bold" : "text-slate-500 font-medium hover:text-blue-600 hover:bg-blue-50"}`}
                    onClick={() => setIsOpen(false)}
                  >
                    <Icon className={`w-4 h-4 ${isActive ? "text-white" : "text-slate-400"}`} />
                    <span>{item.title}</span>
                  </Button>
                </Link>
              )
            })}
          </nav>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-border space-y-4">
          <Button 
            variant="ghost" 
            className="w-full justify-start gap-3 text-rose-500 hover:text-rose-600 hover:bg-rose-50 rounded-xl h-11 font-bold"
            onClick={logout}
          >
            <LogOut className="w-4 h-4" />
            <span>Terminal Logout</span>
          </Button>

          <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
            <p className="mb-1 italic">CoreAqua Dynamics</p>
            <p>© 2026 Registry</p>
          </div>
        </div>
      </aside>

      {/* Mobile Overlay */}
      {isOpen && <div className="fixed inset-0 bg-black/50 md:hidden z-20" onClick={() => setIsOpen(false)} />}
    </>
  )
}
