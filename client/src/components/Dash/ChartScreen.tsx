// src/components/ChartScreen.tsx
import { useState, useCallback, useEffect } from "react";
import { useParams, useNavigate } from "react-router";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "../ui/button";
import TradeModal from "./TradeModal";

export default function ChartScreen() {
  const { coinCA } = useParams<{ coinCA: string }>();
  const navigate = useNavigate();
  const [showTradeModal, setShowTradeModal] = useState<boolean>(true);
  // This represents the user's Solana balance (from the port table)
  const [coinBalance, setCoinBalance] = useState<number>(0);
  const [marketCap, setMarketCap] = useState(null);


  const user_id = localStorage.getItem("user_id");

  // Fetch the market cap every 5 seconds (you can change the interval if needed)
  useEffect(() => {
    if (!coinCA) return;
    const fetchMarketCap = async () => {
      try {
        const response = await fetch(`https://api.dexscreener.com/tokens/v1/solana/${coinCA}`, {
          method: "GET",
        });
        const data = await response.json();
        const mk = data[0].marketCap;
        console.log("Market Cap:", mk);
        setMarketCap(mk);
      } catch (err: any) {
        console.error(err.message);
      }
    };
    fetchMarketCap();
    const interval = setInterval(fetchMarketCap, 5000);
    return () => clearInterval(interval);
  }, [coinCA]);

  // Embed URL for the chart remains unchanged
  const embedUrl = coinCA
    ? `https://www.geckoterminal.com/solana/pools/${coinCA}?embed=1&info=1&swaps=1&grayscale=0&light_chart=0&chart_type=market_cap&resolution=1s`
    : "";

  // New handleTrade function which calls your backend trade endpoint
  const handleTrade = useCallback(
    async (tradeType: "buy" | "sell", value: number) => {
      // In a real app, you'd compute the actual price—here we use a fixed price for demo purposes.
      const price = 1; // Replace with your actual price logic

      try {
        const response = await fetch("http://localhost:8000/port/trade", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            user_id,
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
          // Update the Solana balance from the updated port data
          setCoinBalance(result.updatedPort.balance);
          alert(`${tradeType === "buy" ? "Bought" : "Sold"} ${value} ${coinCA} successfully!`);
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
        <Button onClick={() => navigate(-1)} className="bg-blue-500 text-black px-4 py-2 rounded">
          Back
        </Button>
      </div>

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
