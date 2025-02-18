// src/components/ChartScreen.tsx
import  { useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "../ui/button";
import TradeModal from "./TradeModal";

export default function ChartScreen() {
  const { coinCA } = useParams<{ coinCA: string }>();
  const navigate = useNavigate();
  const [showTradeModal, setShowTradeModal] = useState<boolean>(true);
  const [coinBalance, setCoinBalance] = useState<number>(0);

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
      <div className="absolute top-4 left-4">
        <Button
          onClick={() => navigate(-1)}
          className="bg-blue-500 text-black px-4 py-2 rounded"
        >
          Back
        </Button>
      </div>
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
    </div>
  );
}
