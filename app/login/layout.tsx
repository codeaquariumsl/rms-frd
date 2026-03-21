"use client"

import type React from "react"
import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { Loader2 } from "lucide-react"

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { isAuthenticated, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && isAuthenticated) {
      router.push("/dashboard")
    }
  }, [isAuthenticated, loading, router])

  if (loading) {
     return (
       <div className="h-screen w-screen flex flex-col items-center justify-center gap-4 bg-slate-50">
         <Loader2 className="w-10 h-10 animate-spin text-blue-600 opacity-50" />
         <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Initalizing Portal</p>
       </div>
     )
  }

  // If already authenticated, don't show login while redirecting
  if (isAuthenticated) return null

  return <>{children}</>
}
