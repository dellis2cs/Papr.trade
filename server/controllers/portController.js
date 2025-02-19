const { createClient } = require("@supabase/supabase-js");
const supabase = createClient(
  process.env.DATABASE_URL,
  process.env.DATABASE_KEY
);

const getBalance = async (req, res) => {
  try {
    // Extract the user_id from the query parameters (or req.body if you prefer)
    const { user_id } = req.query;
    if (!user_id) {
      return res.status(400).json({ error: "User ID is required" });
    }

    // Query the "port" table for the user's balance
    const { data, error } = await supabase
      .from("port")
      .select("balance")
      .eq("user_id", user_id)
      .single();

    if (error) {
      return res.status(500).json({ error: "Error retrieving balance" });
    }

    // Return the balance
    res.status(200).json({ balance: data.balance });
  } catch (err) {
    console.error(err.message);
    res
      .status(500)
      .json({ error: "An error occurred while retrieving balance." });
  }
};

/**
 * New deposit endpoint
 *
 * This endpoint will:
 * 1. Retrieve the current balance for the user.
 * 2. Add the deposit amount.
 * 3. Update the balance with the new total.
 */
const depositFunds = async (req, res) => {
  try {
    // Get user_id and deposit_amount from the request body
    const { user_id, deposit_sol } = req.body;

    // Validate inputs
    if (!user_id) {
      return res.status(400).json({ error: "User ID is required" });
    }
    if (typeof deposit_sol !== "number") {
      return res.status(400).json({ error: "deposit_amount must be a number" });
    }

    // Retrieve the current balance
    const { data: userData, error: fetchError } = await supabase
      .from("port")
      .select("balance")
      .eq("user_id", user_id)
      .single();

    if (fetchError) {
      return res
        .status(500)
        .json({ error: "Error retrieving current balance" });
    }

    // Calculate the new balance
    const new_balance = userData.balance + deposit_sol;

    // Update the balance using the updateBalance logic
    const { data, error: updateError } = await supabase
      .from("port")
      .update({ balance: new_balance })
      .select("*") // <-- This returns the updated row
      .eq("user_id", user_id)
      .single();

    if (updateError) {
      return res.status(500).json({ error: "Error updating balance" });
    }

    // Return the updated record and success message
    res.status(200).json({
      message: "Deposit successful",
      updatedRecord: data,
    });
  } catch (err) {
    console.error(err.message);
    res
      .status(500)
      .json({ error: "An error occurred while depositing funds." });
  }
};

/**
 * Execute a trade by updating both the user's Solana balance (port table)
 * and their coin position (positions table).
 */
const executeTrade = async (req, res) => {
  try {
    const { user_id, mk, coin, tradeType, quantity, price } = req.body;
    console.log("user_id", user_id);
    console.log("mk", mk);
    console.log("coin", coin);
    console.log("tradeType", tradeType);
    console.log("quantity", quantity);
    console.log("price", price);
    // Validate required parameters
    if (
      !user_id ||
      !coin ||
      !mk ||
      !tradeType ||
      typeof quantity !== "number" ||
      typeof price !== "number"
    ) {
      return res.status(400).json({ error: "Missing or invalid parameters" });
    }

    // Calculate the total value (cost for buy, proceeds for sell)
    const totalValue = quantity * price;

    // Retrieve current port (Solana balance) for the user
    const { data: portData, error: portError } = await supabase
      .from("port")
      .select("balance")
      .eq("user_id", user_id)
      .single();
    if (portError || !portData) {
      return res.status(500).json({ error: "Error retrieving port balance" });
    }

    if (tradeType === "buy") {
      // Check if the user has enough Solana for the purchase
      if (portData.balance < totalValue) {
        return res
          .status(400)
          .json({ error: "Insufficient funds to execute buy trade" });
      }
      // Deduct the cost from the port balance
      const newPortBalance = portData.balance - totalValue;
      const { data: updatedPort, error: portUpdateError } = await supabase
        .from("port")
        .update({ balance: newPortBalance })
        .select("*")
        .eq("user_id", user_id)
        .single();

      if (portUpdateError) {
        return res.status(500).json({ error: "Error updating port balance" });
      }

      // Update (or insert) the position for the coin
      const { data: positionData, error: positionError } = await supabase
        .from("positions")
        .select("quantity, entry")
        .eq("user_id", user_id)
        .eq("coin", coin)
        .single();

      if (positionError || !positionData) {
        // No existing position – insert a new one.
        const { data: newPosition, error: insertError } = await supabase
          .from("positions")
          .insert({ user_id, coin, quantity, entry: mk })
          .single();
        if (insertError) {
          return res.status(500).json({
            error: insertError.message || "Error inserting new position",
          });
        }
      } else {
        // Existing position: Calculate weighted average entry.
        // Use the current market cap as default if the stored entry is null.
        const oldQuantity = Number(positionData.quantity);
        const oldEntry =
          positionData.entry !== null ? Number(positionData.entry) : mk;
        const newQuantity = oldQuantity + quantity;
        const newAverageEntry =
          (oldEntry * oldQuantity + mk * quantity) / newQuantity;

        const { data: updatedPosition, error: updateError } = await supabase
          .from("positions")
          .update({ quantity: newQuantity, entry: newAverageEntry })
          .eq("user_id", user_id)
          .eq("coin", coin)
          .single();
        if (updateError) {
          return res.status(500).json({ error: "Error updating position" });
        }
      }

      return res.status(200).json({
        message: "Buy trade executed successfully",
        updatedPort,
      });
    } else if (tradeType === "sell") {
      // Retrieve the user's current position for the coin
      const { data: positionData, error: positionError } = await supabase
        .from("positions")
        .select("quantity, entry")
        .eq("user_id", user_id)
        .eq("coin", coin)
        .single();
      if (positionError || !positionData) {
        return res
          .status(400)
          .json({ error: "No position found for this coin" });
      }

      // Determine sell quantity.
      // If the provided quantity is ≤1, treat it as a percentage of the current quantity.
      let sellQuantity;
      if (quantity <= 1) {
        sellQuantity = Number(positionData.quantity) * quantity;
      } else {
        sellQuantity = quantity;
      }

      if (Number(positionData.quantity) < sellQuantity) {
        return res
          .status(400)
          .json({ error: "Insufficient coin quantity to execute sell trade" });
      }

      // Calculate trade profit/loss for this sell trade.
      // (Current market cap - entry price) * sellQuantity.
      const entryPrice = Number(positionData.entry);
      const tradeProfit = (mk - entryPrice) * sellQuantity;

      // Update the coin position.
      const newQuantity = Number(positionData.quantity) - sellQuantity;
      if (newQuantity <= 0.000001) {
        // If nearly zero, delete the position.
        const { error: deleteError } = await supabase
          .from("positions")
          .delete()
          .eq("user_id", user_id)
          .eq("coin", coin);
        if (deleteError) {
          return res.status(500).json({ error: "Error deleting position" });
        }
      } else {
        const { data: updatedPosition, error: updateError } = await supabase
          .from("positions")
          .update({ quantity: newQuantity })
          .eq("user_id", user_id)
          .eq("coin", coin)
          .single();
        if (updateError) {
          return res.status(500).json({ error: "Error updating position" });
        }
      }

      // Calculate sale proceeds (using the price and the actual quantity sold).
      const saleProceeds = sellQuantity * price;
      const newPortBalance = portData.balance + saleProceeds;

      // Update the port's PL (Profit/Loss). Assume portData.pl is null or a number.
      const currentPL = portData.pl ? Number(portData.pl) : 0;
      const newPL = currentPL + tradeProfit;

      const { data: updatedPort, error: portUpdateError } = await supabase
        .from("port")
        .update({ balance: newPortBalance, PL: newPL })
        .select("*")
        .eq("user_id", user_id)
        .single();
      if (portUpdateError) {
        console.log(portUpdateError);
        return res.status(500).json({ error: "Error updating port balance" });
      }

      return res.status(200).json({
        message: "Sell trade executed successfully",
        updatedPort,
        tradeProfit, // Optionally, include the profit/loss for this trade
      });
    } else {
      return res.status(400).json({ error: "Invalid trade type" });
    }
  } catch (err) {
    console.error(err.message);
    return res.status(500).json({ error: "Trade execution failed" });
  }
};

module.exports = { getBalance, depositFunds, tradeFunds: executeTrade };
