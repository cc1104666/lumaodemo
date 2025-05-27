"use client"

import { useState, useEffect } from "react"

interface User {
  id: number
  username: string
  isAdmin: boolean
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // 检查本地存储的登录状态
    const isLoggedIn = localStorage.getItem("isLoggedIn")
    const userData = localStorage.getItem("userData")

    if (isLoggedIn === "true" && userData) {
      try {
        setUser(JSON.parse(userData))
      } catch (error) {
        console.error("Failed to parse user data:", error)
        localStorage.removeItem("isLoggedIn")
        localStorage.removeItem("userData")
      }
    }
    setIsLoading(false)
  }, [])

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      })

      if (response.ok) {
        const data = await response.json()
        const userData = {
          id: 1,
          username: data.user.username,
          isAdmin: true,
        }
        setUser(userData)
        localStorage.setItem("isLoggedIn", "true")
        localStorage.setItem("userData", JSON.stringify(userData))
        return true
      } else {
        return false
      }
    } catch (error) {
      console.error("Login error:", error)
      return false
    }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem("isLoggedIn")
    localStorage.removeItem("userData")
  }

  return {
    user,
    isLoading,
    login,
    logout,
  }
}
