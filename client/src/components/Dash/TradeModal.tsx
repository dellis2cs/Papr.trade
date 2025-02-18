// src/components/TradeModal.tsx
"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "../ui/button";
import { X } from "lucide-react";

interface TradeModalProps {
  coinCA: string;
  coinBalance: number;
  onTrade: (tradeType: "buy" | "sell", value: number) => void;
  onClose: () => void;
}

const TradeModal: React.FC<TradeModalProps> = React.memo(
  ({ coinCA, coinBalance, onTrade, onClose }) => {
    const [tradeType, setTradeType] = useState<"buy" | "sell">("buy");

    const handleTrade = (value: number) => {
      onTrade(tradeType, value);
    };

    // For buying, these are the coin amounts.
    const buyAmounts = [0.1, 0.2, 0.5, 1];
    // For selling, these are percentages (as fractions).
    const sellPercents = [0.1, 0.25, 0.5, 1];

    return (
        <motion.div
        className="w-full max-w-xs bg-zinc-900 dark:bg-white border border-zinc-800 dark:border-zinc-200 backdrop-blur-sm shadow-lg rounded-lg p-6"
        drag
        // Enable momentum for smoother follow-up
        dragMomentum={false}
        // Adjust elasticity to reduce jumpiness
        dragElastic={0.2}
        initial={{ opacity: 0, scale: 0.8, y: -20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.8, y: -20 }}
      >
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-white dark:text-zinc-900">
            Trade
          </h3>
          <button
            onClick={onClose}
            aria-label="Close Trade Modal"
            className="text-zinc-100 dark:text-zinc-900 hover:text-red-500 transition-colors"
          >
            <X size={20} />
          </button>
        </div>
        <div className="flex mb-4">
          <button
            onClick={() => setTradeType("buy")}
            className={`flex-1 px-4 py-2 rounded-l transition-colors ${
              tradeType === "buy"
                ? "bg-blue-600 text-white"
                : "bg-gray-600 text-gray-200"
            }`}
          >
            Buy
          </button>
          <button
            onClick={() => setTradeType("sell")}
            className={`flex-1 px-4 py-2 rounded-r transition-colors ${
              tradeType === "sell"
                ? "bg-blue-600 text-white"
                : "bg-gray-600 text-gray-200"
            }`}
          >
            Sell
          </button>
        </div>
        <div className="grid grid-cols-4 gap-2">
          {tradeType === "buy"
            ? buyAmounts.map((amount) => (
                <Button
                  key={amount}
                  onClick={() => handleTrade(amount)}
                  className="bg-green-500 text-black hover:bg-green-600 transition-colors"
                >
                  {amount}
                </Button>
              ))
            : sellPercents.map((percent) => (
                <Button
                  key={percent}
                  onClick={() => handleTrade(percent)}
                  disabled={coinBalance <= 0}
                  className="bg-red-500 text-black hover:bg-red-600 transition-colors disabled:opacity-50"
                >
                  {percent * 100}%
                </Button>
              ))}
        </div>
      </motion.div>
    );
  }
);

export default TradeModal;
