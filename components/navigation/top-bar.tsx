"use client"

import { Bell, User, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { usePathname } from "next/navigation"

import { useAuth } from "@/contexts/auth-context"
import { Shield, ChevronRight } from "lucide-react"

export function TopBar() {
  const pathname = usePathname()
  const { user, logout } = useAuth()

  // Format page title from pathname
  const getPageTitle = () => {
    const routes: Record<string, string> = {
      "/": "Operational Overview",
      "/dashboard": "System Analytics",
      "/inventory": "Product Manifest",
      "/bookings": "Rental Transactions",
      "/delivery": "Logistics Dispatch",
      "/returns": "Asset Intake",
      "/reports": "Business Intelligence",
      "/barcode": "Hardware Registry",
      "/customers": "Client Database",
      "/accounting": "Financial Ledger",
      "/issue-items": "Quick Issuance",
    }
    return routes[pathname] || "Authorized Module"
  }

  return (
    <div className="h-16 border-b border-slate-100 bg-white/80 backdrop-blur-md flex items-center justify-between px-8 sticky top-0 z-20">
      <div className="flex items-center gap-3">
        <h2 className="text-sm font-black text-slate-900 uppercase tracking-widest">{getPageTitle()}</h2>
        <ChevronRight className="w-4 h-4 text-slate-300" />
      </div>

      <div className="flex items-center gap-6">
        {/* Connection Status */}
        <div className="hidden md:flex items-center gap-2 px-3 py-1 bg-green-50 rounded-full border border-green-100">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
            <span className="text-[10px] font-black text-green-700 uppercase tracking-tight">System Online</span>
        </div>

        {/* Notifications */}
        <Button variant="ghost" size="icon" className="relative hover:bg-slate-50 rounded-xl">
          <Bell className="w-5 h-5 text-slate-500" />
          <span className="absolute top-2.5 right-2.5 w-1.5 h-1.5 bg-rose-500 rounded-full border-2 border-white" />
        </Button>

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="hover:bg-slate-50 rounded-2xl gap-3 px-2 border border-transparent hover:border-slate-100 transition-all">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-100">
                <User className="w-4 h-4 text-white" />
              </div>
              <div className="text-left hidden lg:block">
                  <p className="text-xs font-black text-slate-700 leading-none capitalize">{user?.name || "Guest"}</p>
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter mt-1">{user?.role || "Operator"}</p>
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-64 p-3 rounded-2xl border-slate-100 shadow-2xl">
            <div className="p-3 mb-2 bg-slate-50 rounded-xl">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Session Identity</p>
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center font-black text-blue-600 shadow-sm">
                        {user?.name?.substring(0, 2).toUpperCase() || "??"}
                    </div>
                    <div className="overflow-hidden">
                        <p className="text-sm font-black text-slate-800 truncate">{user?.name}</p>
                        <p className="text-[11px] font-medium text-slate-500 truncate">{user?.email}</p>
                    </div>
                </div>
            </div>

            <DropdownMenuItem className="rounded-xl h-11 px-3 cursor-pointer text-slate-600 font-bold text-xs uppercase hover:bg-slate-50">
              <Shield className="w-4 h-4 mr-3 text-slate-400" />
              <span>Permission Settings</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator className="my-2 bg-slate-100" />
            <DropdownMenuItem 
                onClick={logout}
                className="rounded-xl h-11 px-3 cursor-pointer text-rose-500 font-black text-xs uppercase hover:bg-rose-50 hover:text-rose-600"
            >
              <LogOut className="w-4 h-4 mr-3" />
              <span>Terminate Session</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}
