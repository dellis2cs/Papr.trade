"use client"

import React, { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Button } from "../ui/button"
import { Card, CardContent } from "../ui/card"

// --- Checkmark reused from your previous code ---
interface CheckmarkProps {
  size?: number
  strokeWidth?: number
  color?: string
  className?: string
}

const draw = {
  hidden: { pathLength: 0, opacity: 0 },
  visible: (i: number) => ({
    pathLength: 1,
    opacity: 1,
    transition: {
      pathLength: {
        delay: i * 0.2,
        type: "spring",
        duration: 1.5,
        bounce: 0.2,
        ease: "easeInOut",
      },
      opacity: { delay: i * 0.2, duration: 0.2 },
    },
  }),
}

function Checkmark({
  size = 100,
  strokeWidth = 2,
  color = "currentColor",
  className = "",
}: CheckmarkProps) {
  return (
    <motion.svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      initial="hidden"
      animate="visible"
      className={className}
    >
      <title>Animated Checkmark</title>
      <motion.circle
        cx="50"
        cy="50"
        r="40"
        stroke={color}
        variants={draw}
        custom={0}
        style={{
          strokeWidth,
          strokeLinecap: "round",
          fill: "transparent",
        }}
      />
      <motion.path
        d="M30 50L45 65L70 35"
        stroke={color}
        variants={draw}
        custom={1}
        style={{
          strokeWidth,
          strokeLinecap: "round",
          strokeLinejoin: "round",
          fill: "transparent",
        }}
      />
    </motion.svg>
  )
}

// --- The actual DepositModal ---
interface DepositModalProps {
  onClose: () => void
  onSuccess: () => void
}

/**
 * DepositModal fetches the current SOL price from CoinGecko and uses it to convert USD to SOL.
 * The UI layout is shared between the initial deposit state and the success state.
 */
export default function DepositModal({ onClose, onSuccess }: DepositModalProps) {
  const [usdAmount, setUsdAmount] = useState<number>(0)
  const [isDepositing, setIsDepositing] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [solPriceUsd, setSolPriceUsd] = useState<number | null>(null)

  // Fetch the current SOL price (USD) from CoinGecko
  useEffect(() => {
    async function fetchSolPrice() {
      try {
        const response = await fetch(
          "https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd"
        )
        const data = await response.json()
        // Expected response: { solana: { usd: 30.45 } } (for example)
        if (data?.solana?.usd) {
          setSolPriceUsd(data.solana.usd)
        }
      } catch (error) {
        console.error("Error fetching Solana price:", error)
      }
    }

    fetchSolPrice()
  }, [])

  // Compute SOL amount only if we have a valid solPriceUsd
  const solAmount = solPriceUsd ? usdAmount / solPriceUsd : 0

  const handleDeposit = async () => {
    if (!solPriceUsd) {
      alert("Exchange rate not available yet. Please try again shortly.")
      return
    }
    try {
      setIsDepositing(true)
      const userId = localStorage.getItem("user_id")
      if (!userId) {
        alert("No user_id found in localStorage!")
        return
      }

      const response = await fetch("http://localhost:8000/port/deposit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: userId,
          deposit_sol: solAmount,
        }),
      })

      if (!response.ok) {
        throw new Error("Deposit request failed")
      }

      // On success, show the success layout
      setIsSuccess(true)

      // Wait a bit to let animation play, then trigger onSuccess
      setTimeout(() => {
        onSuccess()
      }, 2000)
    } catch (error) {
      console.error(error)
      alert("Error depositing funds")
    } finally {
      setIsDepositing(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <motion.div
        className="w-full max-w-sm mx-auto p-6"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 30 }}
        transition={{ duration: 0.3 }}
      >
        <Card className="bg-zinc-900 dark:bg-white border-zinc-800 dark:border-zinc-200 backdrop-blur-sm shadow-lg">
          <CardContent className="p-6 flex flex-col items-center justify-center min-h-[360px]">
            {isSuccess ? (
              // SUCCESS STATE
              <motion.div
                className="flex flex-col items-center justify-center w-full"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
              >
                {/* Papr text */}
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1, duration: 0.3 }}
                  className="text-sm text-zinc-400 dark:text-zinc-600 mb-2"
                >
                  papr
                </motion.div>

                {/* Checkmark */}
                <div className="relative mb-2">
                  <Checkmark size={80} strokeWidth={4} color="rgb(16 185 129)" />
                </div>

                {/* TRANSFER SUCCESSFUL */}
                <motion.h2
                  className="text-lg text-zinc-100 dark:text-zinc-900 font-semibold uppercase tracking-tight mb-4"
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2, duration: 0.4 }}
                >
                  TRANSFER SUCCESSFUL
                </motion.h2>

                {/* Shared FROM/TO Card Layout */}
                <motion.div
                  className="w-full max-w-xs bg-zinc-800/50 dark:bg-zinc-50/50 rounded-xl p-4 border border-zinc-700/50 dark:border-zinc-200/50 backdrop-blur-md space-y-4"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3, duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
                >
                  {/* From */}
                  <div className="space-y-1.5">
                    <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400 flex items-center gap-1.5">
                      <svg
                        className="w-3 h-3"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <title>From</title>
                        <path d="M12 19V5M5 12l7-7 7 7" />
                      </svg>
                      From
                    </span>
                    <div className="flex items-center gap-2.5">
                      <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-zinc-900 dark:bg-white shadow-lg border border-zinc-700 dark:border-zinc-300 text-sm font-medium text-zinc-100 dark:text-zinc-900">
                        $
                      </span>
                      <span className="font-medium text-zinc-100 dark:text-zinc-900 tracking-tight">
                        {usdAmount.toFixed(2)} USD
                      </span>
                    </div>
                  </div>

                  {/* Divider */}
                  <div className="w-full h-px bg-gradient-to-r from-transparent via-zinc-700 dark:via-zinc-300 to-transparent" />

                  {/* To */}
                  <div className="space-y-1.5">
                    <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400 flex items-center gap-1.5">
                      <svg
                        className="w-3 h-3"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <title>To</title>
                        <path d="M12 5v14M5 12l7 7 7-7" />
                      </svg>
                      To
                    </span>
                    <div className="flex items-center gap-2.5">
                      <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-zinc-900 dark:bg-white shadow-lg border border-zinc-700 dark:border-zinc-300 text-sm font-medium text-zinc-100 dark:text-zinc-900">
                      <img src="solWhite.png" className="w-3 h-3" alt="" />
                      </span>
                      <span className="font-medium text-zinc-100 dark:text-zinc-900 tracking-tight">
                        {solAmount.toFixed(4)} SOL
                      </span>
                    </div>
                  </div>
                </motion.div>

                {/* Exchange Rate */}
                <motion.div
                  className="w-full text-xs text-zinc-500 dark:text-zinc-400 mt-2 text-center"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5, duration: 0.4 }}
                >
                  Exchange Rate:{" "}
                  {solPriceUsd ? `1 SOL = $${solPriceUsd.toFixed(2)} USD` : "Loading..."}
                </motion.div>
              </motion.div>
            ) : (
              // INITIAL DEPOSIT STATE
              <motion.div
                className="flex flex-col items-center justify-center w-full space-y-6"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
              >
                {/* Shared Card Layout */}
                <div className="w-full max-w-xs bg-zinc-800/50 dark:bg-zinc-50/50 rounded-xl p-4 border border-zinc-700/50 dark:border-zinc-200/50 backdrop-blur-md space-y-4">
                  {/* From */}
                  <div className="space-y-1.5">
                    <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400 flex items-center gap-1.5">
                      <svg
                        className="w-3 h-3"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <title>From</title>
                        <path d="M12 19V5M5 12l7-7 7 7" />
                      </svg>
                      From
                    </span>
                    <div className="flex items-center gap-2.5">
                      <span className="inline-flex items-center justify-center w-10 h-7 rounded-lg bg-zinc-900 dark:bg-white shadow-lg border border-zinc-700 dark:border-zinc-300 text-sm font-medium text-zinc-100 dark:text-zinc-900">
                        $
                      </span>
                      <input
                        type="number"
                        value={usdAmount}
                        onChange={(e) => setUsdAmount(parseFloat(e.target.value) || 0)}
                        placeholder="0.00"
                        className="w-full px-3 py-2 bg-gray-900 dark:bg-gray-100 text-white dark:text-black
                                   border border-gray-700 dark:border-gray-300 rounded focus:outline-none
                                   focus:border-blue-500"
                      />
                      <span className="font-medium text-zinc-100 dark:text-zinc-900">USD</span>
                    </div>
                  </div>

                  {/* Divider */}
                  <div className="w-full h-px bg-gradient-to-r from-transparent via-zinc-700 dark:via-zinc-300 to-transparent" />

                  {/* To */}
                  <div className="space-y-1.5">
                    <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400 flex items-center gap-1.5">
                      <svg
                        className="w-3 h-3"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <title>To</title>
                        <path d="M12 5v14M5 12l7 7 7-7" />
                      </svg>
                      To
                    </span>
                    <div className="flex items-center gap-2.5">
                      <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-zinc-900 dark:bg-white shadow-lg border border-zinc-700 dark:border-zinc-300 text-sm font-medium text-zinc-100 dark:text-zinc-900">
                        <img src="solWhite.png" className="w-3 h-3" alt="" />
                      </span>
                      <span className="font-medium text-zinc-100 dark:text-zinc-900 tracking-tight">
                        {solAmount.toFixed(4)} SOL
                      </span>
                    </div>
                  </div>
                </div>

                {/* Exchange Rate */}
                <div className="w-full text-xs text-zinc-500 dark:text-zinc-400 text-center">
                  Exchange Rate:{" "}
                  {solPriceUsd ? `1 SOL = $${solPriceUsd.toFixed(2)} USD` : "Loading..."}
                </div>

                {/* Buttons */}
                <div className="flex justify-end gap-2 w-full max-w-xs">
                  <Button
                    variant="ghost"
                    onClick={onClose}
                    className="border border-zinc-600 text-zinc-300 dark:text-zinc-700 flex-1"
                    disabled={isDepositing}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleDeposit}
                    className="bg-[#526fff] text-black px-4 py-2 rounded hover:bg-blue-700 transition-all duration-300 flex-1"
                    disabled={isDepositing || usdAmount <= 0}
                  >
                    {isDepositing ? "Depositing..." : "Deposit"}
                  </Button>
                </div>
              </motion.div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
