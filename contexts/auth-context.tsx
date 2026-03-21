"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { authApi } from "@/lib/api"
import { toast } from "sonner"

interface AuthContextType {
  user: any | null
  loading: boolean
  login: (credentials: any) => Promise<void>
  logout: () => void
  refreshUser: () => Promise<void>
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    checkAuth()
  }, [])

  async function checkAuth() {
    try {
      const token = localStorage.getItem("rms_token")
      if (!token) {
        setLoading(false)
        return
      }

      const response = await authApi.me()
      if (response.data.success) {
        setUser(response.data.data)
      } else {
        localStorage.removeItem("rms_token")
      }
    } catch (error) {
      console.error("Auth check failed:", error)
      localStorage.removeItem("rms_token")
    } finally {
      setLoading(false)
    }
  }

  async function login(credentials: any) {
    try {
      setLoading(true)
      const response = await authApi.login(credentials)
      if (response.data.success) {
        const { token, user } = response.data
        localStorage.setItem("rms_token", token)
        setUser(user)
        toast.success(`Welcome back, ${user.name}!`)
        router.push("/dashboard")
      }
    } catch (error: any) {
      console.error("Login failed:", error)
      toast.error(error.response?.data?.message || "Invalid credentials")
      throw error
    } finally {
      setLoading(false)
    }
  }

  const logout = () => {
    localStorage.removeItem("rms_token")
    setUser(null)
    toast.info("You have been logged out.")
    router.push("/login")
  }

  const refreshUser = async () => {
    try {
      const response = await authApi.me()
      if (response.data.success) {
        setUser(response.data.data)
      }
    } catch (error) {
      console.error("Failed to refresh user:", error)
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
        refreshUser,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
