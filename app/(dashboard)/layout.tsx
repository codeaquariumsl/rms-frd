"use client"

import type React from "react"
import { Sidebar } from "@/components/navigation/sidebar"
import { TopBar } from "@/components/navigation/top-bar"
import { useAuth } from "@/contexts/auth-context"
import { useRouter, usePathname } from "next/navigation"
import { useEffect } from "react"
import { Loader2 } from "lucide-react"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { isAuthenticated, loading } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push("/login")
    }
  }, [isAuthenticated, loading, router])

  if (loading) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center gap-4 bg-slate-50">
        <Loader2 className="w-10 h-10 animate-spin text-blue-600 opacity-50" />
        <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Verifying Authorization</p>
      </div>
    )
  }

  if (!isAuthenticated) return null

  return (
    <div className="flex h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopBar />
        <main className="flex-1 overflow-auto bg-background">{children}</main>
      </div>
    </div>
  )
}
