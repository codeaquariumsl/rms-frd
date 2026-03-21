"use client"

import type React from "react"
import { useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card } from "@/components/ui/card"
import { Loader2, Lock, Mail, ShieldCheck, Zap } from "lucide-react"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      await login({ email, password })
    } catch (error) {
      // Error handled by context toast
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-slate-50 relative overflow-hidden">
      {/* Decorative Elements */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600" />
      <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-blue-100 rounded-full blur-[120px] opacity-50" />
      <div className="absolute -bottom-[10%] -right-[10%] w-[40%] h-[40%] bg-indigo-100 rounded-full blur-[120px] opacity-50" />

      <Card className="w-full max-w-md p-8 border-none shadow-2xl rounded-[32px] bg-white/80 backdrop-blur-xl relative z-10">
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-blue-200 rotate-3">
            <Zap className="w-8 h-8 text-white fill-white" />
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">System Access</h1>
          <p className="text-slate-500 font-medium mt-2">Rental Management & Logistics Portal</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-[10px] font-black uppercase text-slate-400 ml-1 tracking-widest">
              Authorized Email
            </Label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                id="email"
                type="email"
                placeholder="name@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-14 pl-12 bg-slate-50 border-slate-100 rounded-2xl focus:ring-blue-500 font-bold transition-all"
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center px-1">
              <Label htmlFor="password" className="text-[10px] font-black uppercase text-slate-400 tracking-widest">
                Passphrase
              </Label>
              <button type="button" className="text-[10px] font-black uppercase text-blue-600 hover:text-blue-700">
                Forgot?
              </button>
            </div>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="h-14 pl-12 bg-slate-50 border-slate-100 rounded-2xl focus:ring-blue-500 font-bold transition-all"
              />
            </div>
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full h-14 bg-blue-600 hover:bg-blue-700 text-white font-black uppercase tracking-widest rounded-2xl shadow-xl shadow-blue-100 transition-all hover:-translate-y-1 active:scale-[0.98]"
          >
            {loading ? (
              <Loader2 className="w-6 h-6 animate-spin" />
            ) : (
              <>
                <ShieldCheck className="w-5 h-5 mr-3" />
                Initialize Session
              </>
            )}
          </Button>
        </form>

        <div className="mt-10 pt-8 border-t border-slate-50 text-center">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
            Secured Enterprise Infrastructure
          </p>
          <div className="flex justify-center gap-4 mt-4 opacity-30 grayscale grayscale-0 transition-all hover:grayscale-0">
             {/* Logo placeholders or security badges */}
             <div className="w-8 h-8 rounded-lg bg-slate-200" />
             <div className="w-8 h-8 rounded-lg bg-slate-200" />
             <div className="w-8 h-8 rounded-lg bg-slate-200" />
          </div>
        </div>
      </Card>

      <p className="absolute bottom-8 text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em]">
        © 2026 CoreAqua Dynamics • v1.4.2
      </p>
    </div>
  )
}
