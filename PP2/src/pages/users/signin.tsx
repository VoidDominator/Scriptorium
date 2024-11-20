"use client"

import React, { useState } from "react"
import { Card, 
         CardContent, 
         CardFooter, 
         CardHeader, 
         CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { useRouter } from "next/router"

export default function SignInPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const router = useRouter()

  const handleSignIn = async (event: React.FormEvent) => {
    event.preventDefault()
    setError("")

    try {
      const response = await fetch("/api/users/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      })

      if (!response.ok) {
        const data = await response.json()
        setError(data.error || "Failed to log in. Please try again.")
        return
      }

      const { token } = await response.json()
      localStorage.setItem("accessToken", token)
      router.push("/")
    } catch (err) {
      setError("An unexpected error occurred. Please try again.")
    }
  }

  return (
    <div className="flex h-full w-full items-center justify-center bg-muted">
      <Card className="w-[400px] shadow-lg ">
        <CardHeader>
          <CardTitle className="text-center flex text-2xl">Sign In</CardTitle>
        </CardHeader>
        <form onSubmit={handleSignIn}>
          <CardContent className="space-y-4">
            {error && <p className="text-sm text-red-500">{error}</p>}
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col items-center space-y-3">
            <Button type="submit" className="w-full">
              Sign In
            </Button>
            <Button variant="ghost" type="button" className="w-full" onClick={() => router.push("/users/signup")}>
              Create an Account
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}