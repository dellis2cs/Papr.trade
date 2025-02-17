"use client"

import { GalleryVerticalEnd } from "lucide-react"
import { motion } from "framer-motion"
import { LoginForm } from "./Login"
import { Link } from "react-router"
import { useState } from "react"

export default function LoginPage() {
  

  return (
    <div className="min-h-screen bg-[#030307] text-white overflow-hidden">
      {/* Background patterns */}
      <div className="fixed inset-0 z-0">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-gradient-to-b from-transparent via-blue-900/10 to-transparent" />
      </div>

      <div className="relative z-10 grid min-h-screen lg:grid-cols-2 ">
        <div className="flex flex-col gap-4 p-6 md:p-10 w-screen">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex justify-center gap-2 md:justify-center w-screen"
          >
            <div  className="flex items-center gap-2 font-medium w-screen">
              <div className="flex h-6 w-6 items-center justify-center rounded-md bg-[#526fff] text-black">
                <GalleryVerticalEnd className="size-4" />
              </div>
              <Link to="/">
                <span className="text-xl bg-gradient-to-br from-white via-blue-100 to-blue-200 bg-clip-text text-transparent">
                  Papr
                </span>
              </Link>
            </div>
          </motion.div>
          <div className="flex flex-1 items-center justify-center">
            <div className="w-full max-w-md">
              <LoginForm />
            </div>
          </div>
        </div>
        
      </div>
    </div>
  )
}

