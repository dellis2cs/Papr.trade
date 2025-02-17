"use client"

import React, { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "../ui/button"
import { Link } from "react-router"
import DepositModal from "../currency/Deposit"

// ------------------------------
// TradeModal Component
// ------------------------------
// This modal uses a card-like style similar to the Deposit modal.
// It is draggable and has two tabs (Buy and Sell) with preset amounts.
function TradeModal({
  coinCA,
  coinBalance,
  onTrade,
  onClose,
}: {
  coinCA: string
  coinBalance: number
  onTrade: (tradeType: "buy" | "sell", value: number) => void
  onClose: () => void
}) {
  const [tradeType, setTradeType] = useState<"buy" | "sell">("buy")

  const handleTrade = (value: number) => {
    onTrade(tradeType, value)
  }

  return (
    <motion.div
      className="w-full max-w-xs bg-zinc-900 dark:bg-white border border-zinc-800 dark:border-zinc-200 backdrop-blur-sm shadow-lg rounded-lg p-6"
      drag
      dragMomentum={false}
      initial={{ opacity: 0, scale: 0.8, y: -20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.8, y: -20 }}
    >
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Trade</h3>
        <button onClick={onClose} className="text-zinc-100 dark:text-zinc-900 text-xl">
          &times;
        </button>
      </div>
      <div className="flex mb-4">
        <button
          onClick={() => setTradeType("buy")}
          className={`flex-1 px-4 py-2 rounded-l ${
            tradeType === "buy" ? "bg-blue-600" : "bg-gray-600"
          }`}
        >
          Buy
        </button>
        <button
          onClick={() => setTradeType("sell")}
          className={`flex-1 px-4 py-2 rounded-r ${
            tradeType === "sell" ? "bg-blue-600" : "bg-gray-600"
          }`}
        >
          Sell
        </button>
      </div>
      {tradeType === "buy" ? (
        <div className="grid grid-cols-4 gap-2">
          <Button onClick={() => handleTrade(0.1)} className="bg-green-500 text-black">
            0.1
          </Button>
          <Button onClick={() => handleTrade(0.2)} className="bg-green-500 text-black">
            0.2
          </Button>
          <Button onClick={() => handleTrade(0.5)} className="bg-green-500 text-black">
            0.5
          </Button>
          <Button onClick={() => handleTrade(1)} className="bg-green-500 text-black">
            1
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-4 gap-2">
          <Button
            onClick={() => handleTrade(0.1)}
            disabled={coinBalance <= 0}
            className="bg-red-500 text-black"
          >
            10%
          </Button>
          <Button
            onClick={() => handleTrade(0.25)}
            disabled={coinBalance <= 0}
            className="bg-red-500 text-black"
          >
            25%
          </Button>
          <Button
            onClick={() => handleTrade(0.5)}
            disabled={coinBalance <= 0}
            className="bg-red-500 text-black"
          >
            50%
          </Button>
          <Button
            onClick={() => handleTrade(1)}
            disabled={coinBalance <= 0}
            className="bg-red-500 text-black"
          >
            100%
          </Button>
        </div>
      )}
    </motion.div>
  )
}

// ------------------------------
// Dashboard Component
// ------------------------------
export default function Dashboard() {
  // Coin search and chart state
  const [coinCA, setCoinCA] = useState("")
  const defaultEmbedUrl =
    "https://www.geckoterminal.com/solana/pools/BzzMNvfm7T6zSGFeLXzERmRxfKaNLdo4fSzvsisxcSzz?embed=1&info=1&swaps=1&grayscale=0&light_chart=0&chart_type=price&resolution=15m"
  const [chartUrl, setChartUrl] = useState(defaultEmbedUrl)

  // Fake SOL wallet balance (from deposit simulation)
  const [balance, setBalance] = useState(0)
  // Fake coin balance for the searched coin (for paper trading)
  const [coinBalance, setCoinBalance] = useState(0)

  // Modal visibility flags
  const [showDepositModal, setShowDepositModal] = useState(false)
  const [showTradeModal, setShowTradeModal] = useState(false)

  // ------------------------------
  // Fetch current SOL balance from backend
  // ------------------------------
  const fetchBalance = async () => {
    const userId = localStorage.getItem("user_id")
    const res = await fetch(`http://localhost:8000/port/balance?user_id=${userId}`, {
      headers: { "Content-Type": "application/json" },
    })
    const data = await res.json()
    setBalance(data.balance)
  }

  useEffect(() => {
    fetchBalance()
  }, [])

  // ------------------------------
  // Handle Coin Search (update chart)
  // ------------------------------
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (coinCA.trim() !== "") {
      setChartUrl(
        `https://www.geckoterminal.com/solana/pools/${coinCA}?embed=1&info=1&swaps=1&grayscale=0&light_chart=0&chart_type=price&resolution=15m`
      )
      // Reset the fake coin balance when searching a new coin
      setCoinBalance(0)
    }
  }

  // ------------------------------
  // Handle Trade Simulation
  // ------------------------------
  // For Buy, the value is the fixed amount to add.
  // For Sell, the value is a fraction (e.g. 0.1 for 10%), so we sell that fraction of coinBalance.
  const handleTrade = (tradeType: "buy" | "sell", value: number) => {
    if (tradeType === "buy") {
      setCoinBalance((prev) => prev + value)
      alert(`Bought ${value} ${coinCA}`)
    } else {
      const sellAmount = coinBalance * value
      if (sellAmount > coinBalance) return
      setCoinBalance((prev) => prev - sellAmount)
      alert(`Sold ${sellAmount.toFixed(4)} ${coinCA}`)
    }
    // Optionally keep the modal open so the user can do multiple trades.
  }

  // ------------------------------
  // Deposit Modal Handlers
  // ------------------------------
  const handleOpenDepositModal = () => setShowDepositModal(true)
  const handleCloseDepositModal = () => setShowDepositModal(false)
  const handleDepositSuccess = () => {
    fetchBalance()
    handleCloseDepositModal()
  }

  return (
    <div className="min-h-screen bg-[#030307] text-white">
      {/* Header */}
      <header className="sticky top-0 bg-[#030307] bg-opacity-90 backdrop-blur-sm border-b border-white/10 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Left: Brand & Navigation */}
          <div className="flex items-center gap-12">
            <Link to="/">
              <div className="text-xl font-medium">Papr</div>
            </Link>
            <nav className="flex gap-10">
              <p>Trade</p>
              <p>Portfolio</p>
            </nav>
          </div>
          {/* Right: SOL Balance & Deposit */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <img src="/sol.png" alt="SOL" className="w-3 h-3" />
              <span className="text-sm">{balance.toFixed(4)} SOL</span>
            </div>
            <Button onClick={handleOpenDepositModal} className="bg-[#526fff] text-black rounded-2xl h-7 w-17">
              Deposit
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-6 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Coin Search Section */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div>
              <h1 className="text-2xl font-semibold mb-4">Search Coin</h1>
              <form onSubmit={handleSearchSubmit} className="space-y-4">
                <div>
                  <label htmlFor="coinCA" className="block text-sm font-medium mb-1">
                    Enter CA of Coin
                  </label>
                  <input
                    id="coinCA"
                    type="text"
                    placeholder="e.g. BzzMNvfm7T6zSGFeLXzERmRxfKaNLdo4fSzvsisxcSzz"
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
                  Search
                </Button>
              </form>
            </div>
          </motion.div>

          {/* Chart Section */}
          <div className="mt-8">
            <h2 className="text-xl font-semibold mb-4">Chart</h2>
            <div className="overflow-hidden rounded-lg shadow-lg">
              <iframe
                className="w-full h-[600px]"
                id="geckoterminal-embed"
                title="GeckoTerminal Embed"
                src={chartUrl}
                frameBorder="0"
                allow="clipboard-write"
                allowFullScreen
              ></iframe>
            </div>
          </div>

          {/* Display coin balance and persistent Trade button in the main content if desired */}
          {coinCA && (
            <div className="mt-8">
              <p className="text-sm">
                Your {coinCA} balance: {coinBalance.toFixed(4)}
              </p>
            </div>
          )}
        </div>
      </main>

      {/* Persistent Trade Modal or Trade Button (fixed at bottom-right) */}
      <AnimatePresence>
        {showTradeModal && coinCA && (
          <motion.div
            className="fixed bottom-4 right-4 z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <TradeModal
              coinCA={coinCA}
              coinBalance={coinBalance}
              onTrade={handleTrade}
              onClose={() => setShowTradeModal(false)}
            />
          </motion.div>
        )}
      </AnimatePresence>
      {!showTradeModal && (
        <div className="fixed bottom-4 right-4 z-40">
          <Button
            onClick={() => setShowTradeModal(true)}
            className="bg-blue-500 text-black px-4 py-2 rounded shadow-lg"
          >
            Trade
          </Button>
        </div>
      )}

      {/* Deposit Modal */}
      <AnimatePresence>
        {showDepositModal && (
          <DepositModal onClose={() => setShowDepositModal(false)} onSuccess={handleDepositSuccess} />
        )}
      </AnimatePresence>
    </div>
  )
}
