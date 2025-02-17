"use client"

import React, { useState } from "react"
import { cn } from "../../../lib/utils"
import { Button } from "../../ui/button"
import { Input } from "../../ui/input"
import { Label } from "../../ui/label"
import { motion } from "framer-motion"
import { Link } from "react-router"
import { useNavigate } from "react-router"

export function SignUpForm({ className, ...props }: React.ComponentPropsWithoutRef<"form">) {
  // Email and Password state
  const [email, setEmail] = useState<string>("")
  const [password, setPassword] = useState<string>("")
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [loading, setLoading] = useState<boolean>(false)

  const navigate = useNavigate()
  // Handle input changes
  const handleEmailChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(event.target.value)
  }
  
  const handlePasswordChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(event.target.value)
  }

  // Handle form submission
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError(null)
    setSuccess(null)
    setLoading(true)

    try {
      const res = await fetch("http://localhost:8000/users/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || "An error occurred during sign-up")
      } else {
        localStorage.setItem("user_id", data.user_id)
        navigate("/username")

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
          Create an account now
        </h1>
        <p className="text-balance text-sm text-white/60">
          Enter your email and password to create an account
        </p>
      </div>
      <div className="grid gap-6">
        <div className="grid gap-2">
          <Label htmlFor="email" className="text-white/80">
            Email
          </Label>
          <Input
            id="email"
            type="email"
            placeholder="m@example.com"
            required
            className="bg-white/5 border-white/10 text-white placeholder-white/40 focus:border-[#526fff] focus:ring-[#526fff] py-5"
            onChange={handleEmailChange}
            value={email}
          />
        </div>
        <div className="grid gap-2">
          <div className="flex items-center">
            <Label htmlFor="password" className="text-white/80">
              Password
            </Label>
          </div>
          <Input
            id="password"
            type="password"
            required
            className="bg-white/5 border-white/10 text-white placeholder-white/40 focus:border-[#526fff] focus:ring-[#526fff] py-5"
            onChange={handlePasswordChange}
            value={password}
          />
        </div>
        {error && <p className="text-red-500 text-sm">{error}</p>}
        {success && <p className="text-green-500 text-sm">{success}</p>}
        <Button
          type="submit"
          disabled={loading}
          className="w-full bg-[#526fff] text-black hover:bg-[#526fff]/90 border border-neutral-700 text-lg px-7 py-6 rounded-xl h-12 hover:scale-105 transition-all duration-200"
        >
          {loading ? "Signing Up..." : "Sign Up"}
        </Button>
        <Link to="/Login">
          <Button
            type="button"
            className="w-full bg-transparent text-white border border-neutral-700 text-lg px-7 py-6 rounded-xl h-12 hover:scale-105 transition-all duration-200"
          >
            Login
          </Button>
        </Link>
      </div>
    </motion.form>
  )
}
