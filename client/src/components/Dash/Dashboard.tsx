"use client"

import React, { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "../ui/button"
import { Link } from "react-router"
import DepositModal from "../currency/Deposit"

export default function Dashboard() {
  const [coinCA, setCoinCA] = useState("")
  const [balance, setBalance] = useState(0)
  const [showDepositModal, setShowDepositModal] = useState(false)

  // Fetch current SOL balance
  const fetchBalance = async () => {
    const userId = localStorage.getItem("user_id")
    const res = await fetch(`http://localhost:8000/port/balance?user_id=${userId}`, {
      headers: {
        "Content-Type": "application/json",
      },
    })
    const data = await res.json()
    setBalance(data.balance)
  }

  useEffect(() => {
    fetchBalance()
  }, [])

  const handleTradeSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log("Trading coin:", coinCA)
    // Insert your trade logic here...
  }

  const handleOpenDepositModal = () => {
    setShowDepositModal(true)
  }

  const handleCloseDepositModal = () => {
    setShowDepositModal(false)
  }

  // When the deposit is successful, refetch the balance
  const handleDepositSuccess = () => {
    fetchBalance()
    handleCloseDepositModal()
  }

  return (
    <div className="min-h-screen bg-[#030307] text-white">
      {/* Header */}
      <header className="sticky top-0 bg-[#030307] bg-opacity-90 backdrop-blur-sm border-b border-white/10 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Left Side: Brand and Tabs */}
          <div className="flex items-center gap-8">
            <Link to="/">
              <div className="text-xl font-medium">Papr</div>
            </Link>
            <nav className="flex gap-4">
              <p>Trade</p>
              <p>Portfolio</p>
            </nav>
          </div>

          {/* Right Side: Wallet & Deposit */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              {/* Replace with your Solana icon */}
              <img src="/sol.png" alt="SOL" className="w-3 h-3" />
              <span className="text-sm font-semibold">{balance.toFixed(2)} SOL</span>
            </div>
            <Button onClick={handleOpenDepositModal} className="bg-[#526fff] text-black rounded-2xl">
              Deposit
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-6 py-8">
        <div className="max-w-7xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
            <div>
              <h1 className="text-2xl font-semibold mb-4">Trade</h1>
              <form onSubmit={handleTradeSubmit} className="space-y-4">
                <div>
                  <label htmlFor="coinCA" className="block text-sm font-medium mb-1">
                    Enter CA of Coin
                  </label>
                  <input
                    id="coinCA"
                    type="text"
                    placeholder="e.g. BTC, ETH"
                    value={coinCA}
                    onChange={(e) => setCoinCA(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded focus:outline-none focus:border-blue-500"
                    required
                  />
                </div>
                <Button
                  type="submit"
                  className="bg-[#526fff] text-black px-4 py-2 rounded hover:bg-blue-700 transition-all duration-300"
                >
                  Submit Trade
                </Button>
              </form>
            </div>
          </motion.div>
        </div>
      </main>

      {/* Deposit Modal (conditionally rendered) */}
      <AnimatePresence>
        {showDepositModal && (
          <DepositModal
            onClose={handleCloseDepositModal}
            onSuccess={handleDepositSuccess}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
