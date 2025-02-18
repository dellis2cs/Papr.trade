"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "../ui/button";
import { Link, useNavigate } from "react-router";
import DepositModal from "../currency/Deposit";

export default function Dashboard() {
  const [coinCA, setCoinCA] = useState("");
  const [balance, setBalance] = useState(0);
  const [showDepositModal, setShowDepositModal] = useState(false);

  const navigate = useNavigate();

  // Fetch current SOL balance from backend (fake balance)
  const fetchBalance = async () => {
    const userId = localStorage.getItem("user_id");
    const res = await fetch(`http://localhost:8000/port/balance?user_id=${userId}`, {
      headers: { "Content-Type": "application/json" },
    });
    const data = await res.json();
    setBalance(data.balance);
  };

  useEffect(() => {
    fetchBalance();
  }, []);

  // When searching for a coin, navigate to the chart screen
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (coinCA.trim() !== "") {
      // Navigate to /chart/:coinCA so that the ChartScreen takes over the full screen
      navigate(`/chart/${coinCA}`);
      // (Optionally, reset any paper-trading coin balance here if maintained separately)
    }
  };

  const handleOpenDepositModal = () => setShowDepositModal(true);
  const handleCloseDepositModal = () => setShowDepositModal(false);
  const handleDepositSuccess = () => {
    fetchBalance();
    handleCloseDepositModal();
  };

  return (
    <div className="min-h-screen bg-[#030307] text-white">
      {/* Header */}
      <header className="sticky top-0 bg-[#030307] bg-opacity-90 backdrop-blur-sm border-b border-white/10 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-12">
            <Link to="/">
              <div className="text-xl font-medium">Papr</div>
            </Link>
            <nav className="flex gap-10">
              <p>Trade</p>
              <p>Portfolio</p>
            </nav>
          </div>
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
                  Search &amp; View Chart
                </Button>
              </form>
            </div>
          </motion.div>
        </div>
      </main>

      {/* Deposit Modal */}
      <AnimatePresence>
        {showDepositModal && (
          <DepositModal onClose={handleCloseDepositModal} onSuccess={handleDepositSuccess} />
        )}
      </AnimatePresence>
    </div>
  );
}
