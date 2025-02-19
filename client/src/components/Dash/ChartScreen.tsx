// src/components/ChartScreen.tsx
import { useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router";
import { motion, AnimatePresence } from "framer-motion";
import { GalleryVerticalEnd } from "lucide-react";
import { Link } from "react-router";
import { Button } from "../ui/button";
import TradeModal from "./TradeModal";

export default function ChartScreen() {
  const { coinCA } = useParams<{ coinCA: string }>();
  const navigate = useNavigate();
  const [showTradeModal, setShowTradeModal] = useState<boolean>(true);
  // This represents the user's Solana balance (from the port table)
  const [coinBalance, setCoinBalance] = useState<number>(0);

  const user_id = localStorage.getItem("user_id");

  // Embed URL for the chart remains unchanged
  const embedUrl = coinCA
    ? `https://www.geckoterminal.com/solana/pools/${coinCA}?embed=1&info=1&swaps=1&grayscale=0&light_chart=0&chart_type=market_cap&resolution=1s`
    : "";

  // Updated handleTrade function:
  // 1. Fetch the current market cap when a trade is initiated.
  // 2. Then, call your backend with the current market cap.
  const handleTrade = useCallback(
    async (tradeType: "buy" | "sell", value: number) => {
      if (!coinCA || !user_id) return;

      // In a real app, you'd compute the actual price—here we use a fixed price for demo purposes.
      const price = 1; // Replace with your actual price logic

      try {
        // 1. Fetch the current market cap when a trade is made.
        const mcResponse = await fetch(
          `https://api.dexscreener.com/tokens/v1/solana/${coinCA}`,
          { method: "GET" }
        );
        const mcData = await mcResponse.json();
        const mk = mcData[0]?.marketCap ?? 0;
        console.log("Fetched Market Cap at trade time:", mk);

        // 2. Send the trade request with the current market cap.
        const response = await fetch("http://localhost:8000/port/trade", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            user_id,
            mk, // Pass the fetched market cap to the backend.
            coin: coinCA,
            tradeType,
            quantity: value,
            price,
          }),
        });
        const result = await response.json();
        if (result.error) {
          alert(`Trade error: ${result.error}`);
        } else {
          // Update the Solana balance from the updated port data.
          setCoinBalance(result.updatedPort.balance);
          alert(
            `${tradeType === "buy" ? "Bought" : "Sold"} ${value} ${coinCA} successfully!`
          );
        }
      } catch (err: any) {
        console.error(err.message);
        alert("Trade failed. Please try again.");
      }
    },
    [coinCA, user_id]
  );

  return (
    <div className="min-h-screen bg-black relative">
      <div className="flex items-center gap-12 text-white px-6 py-4">
            <Link to="/dashboard" className="flex gap-2 items-center">
              <div className="flex h-6 w-6 items-center justify-center rounded-md bg-[#526fff] text-black">
                <GalleryVerticalEnd className="size-4" />
              </div>
              <div className="text-xl bg-gradient-to-br from-white via-blue-100 to-blue-200 bg-clip-text text-transparent">Papr</div>
            </Link>
          </div>
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

      

      <AnimatePresence>
        {showTradeModal && coinCA && (
          <motion.div className="fixed bottom-4 right-4 z-50" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
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
          <Button onClick={() => setShowTradeModal(true)} className="bg-blue-500 text-black px-4 py-2 rounded shadow-lg">
            Trade
          </Button>
        </div>
      )}
    </div>
  );
}
