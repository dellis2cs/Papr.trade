"use client"

import React, { useState } from "react"
import { cn } from "../../../lib/utils"
import { Button } from "../../ui/button"
import { Input } from "../../ui/input"
import { Label } from "../../ui/label"
import { motion } from "framer-motion"
import { Check, X } from "lucide-react"

export function PickUsernameForm({ className, ...props }: React.ComponentPropsWithoutRef<"form">) {
  const [username, setUsername] = useState("")
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUsername(e.target.value)
    // Simulate a check for username availability:
    setIsAvailable(e.target.value.length > 3 ? Math.random() > 0.5 : null)
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError(null)
    setLoading(true)

    // Retrieve the user_id from local storage
    const user_id = localStorage.getItem("user_id")
    if (!user_id) {
      setError("No user information found. Please sign up first.")
      setLoading(false)
      return
    }

    try {
      // Make a request to update the username for the user
      const res = await fetch(`http://localhost:8000/users/username`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ user_id, username }),
      })

      const data = await res.json()
      if (!res.ok) {
        setError(data.error || "An error occurred while setting your username")
      } else {
        // Username updated successfully; you might redirect the user now.
        // For example:
        window.location.href = "/dashboard"
      }
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred")
    } finally {
      setLoading(false)
    }
  }

  return (
    <motion.form
      onSubmit={handleSubmit}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className={cn("flex flex-col gap-6", className)}
      {...props}
    >
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-3xl font-bold bg-gradient-to-br from-white via-blue-100 to-blue-200 bg-clip-text text-transparent">
          Pick your username
        </h1>
        <p className="text-balance text-sm text-white/60">
          Choose a unique username for your Papr account
        </p>
      </div>
      <div className="grid gap-6">
        <div className="grid gap-2">
          <Label htmlFor="username" className="text-white/80">
            Username
          </Label>
          <div className="relative">
            <Input
              id="username"
              type="text"
              placeholder="cooltrader123"
              required
              className="bg-white/5 border-white/10 text-white placeholder-white/40 focus:border-[#526fff] focus:ring-[#526fff] pr-10 p-5"
              value={username}
              onChange={handleUsernameChange}
            />
            {isAvailable !== null && (
              <div className="absolute inset-y-0 right-0 flex items-center pr-3">
              </div>
            )}
          </div>
          
        </div>
        {error && <p className="text-red-500 text-sm">{error}</p>}
        <Button
          type="submit"
          
          className="w-full bg-[#526fff] text-black hover:bg-[#526fff]/90 border border-neutral-700 text-lg px-7 py-6 rounded-xl h-12 hover:scale-105 transition-all duration-200"
        >
          {loading ? "Updating..." : "Continue"}
        </Button>
      </div>
      <div className="text-center text-sm text-white/60">
        By continuing, you agree to our{" "}
        <a href="#" className="text-[#526fff] hover:underline">
          Terms of Service
        </a>{" "}
        and{" "}
        <a href="#" className="text-[#526fff] hover:underline">
          Privacy Policy
        </a>
      </div>
    </motion.form>
  )
}
