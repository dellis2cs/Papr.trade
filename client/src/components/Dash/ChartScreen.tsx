// src/components/ChartScreen.tsx
"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "../ui/button";

// ------------------------------
// TradeModal Component
// ------------------------------
const TradeModal = React.memo(function TradeModal({
  coinCA,
  coinBalance,
  onTrade,
  onClose,
}: {
  coinCA: string;
  coinBalance: number;
  onTrade: (tradeType: "buy" | "sell", value: number) => void;
  onClose: () => void;
}) {
  const [tradeType, setTradeType] = useState<"buy" | "sell">("buy");

  const handleTrade = (value: number) => {
    onTrade(tradeType, value);
  };

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
        <h3 className="text-lg text-white font-semibold">Trade</h3>
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
  );
});

// ------------------------------
// ChartScreen Component
// ------------------------------
export default function ChartScreen() {
  const { coinCA } = useParams<{ coinCA: string }>();
  const navigate = useNavigate();
  const [showTradeModal, setShowTradeModal] = useState<boolean>(true);
  const [coinBalance, setCoinBalance] = useState<number>(0);

  // Build the embed URL for the chart using the coinCA
  // We're using market_cap and a 1-second resolution as requested
  const embedUrl = coinCA
    ? `https://www.geckoterminal.com/solana/pools/${coinCA}?embed=1&info=1&swaps=1&grayscale=0&light_chart=0&chart_type=market_cap&resolution=1s`
    : "";

  const handleTrade = useCallback(
    (tradeType: "buy" | "sell", value: number) => {
      if (tradeType === "buy") {
        setCoinBalance((prev) => prev + value);
        alert(`Bought ${value} ${coinCA}`);
      } else {
        const sellAmount = coinBalance * value;
        if (sellAmount > coinBalance) return;
        setCoinBalance((prev) => prev - sellAmount);
        alert(`Sold ${sellAmount.toFixed(4)} ${coinCA}`);
      }
    },
    [coinBalance, coinCA]
  );

  return (
    <div className="min-h-screen bg-black relative">
      {/* Full-Screen Chart Iframe */}
      {coinCA && (
        <iframe
          className="w-full h-screen"
          title="Chart"
          src={embedUrl}
          frameBorder="0"
          allow="clipboard-write"
          allowFullScreen
        ></iframe>
      )}
      {/* Persistent Back Button */}
      <div className="absolute top-4 left-4">
        <Button onClick={() => navigate(-1)} className="bg-blue-500 text-black px-4 py-2 rounded">
          Back
        </Button>
      </div>
      {/* Persistent Trade Modal */}
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
      {/* Persistent Trade Button if modal closed */}
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
    </div>
  );
}
