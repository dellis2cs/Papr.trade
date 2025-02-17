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
 * New updateBalance function
 */
const updateBalance = async (req, res) => {
  try {
    // Get user_id and new_balance from the request body
    const { user_id, new_balance } = req.body;

    // Validate inputs
    if (!user_id) {
      return res.status(400).json({ error: "User ID is required" });
    }
    if (typeof new_balance !== "number") {
      return res.status(400).json({ error: "new_balance must be a number" });
    }

    // Update the balance for the specified user
    const { data, error } = await supabase
      .from("port")
      .update({ balance: new_balance })
      .eq("user_id", user_id)
      .single();

    if (error) {
      return res.status(500).json({ error: "Error updating balance" });
    }

    // If update is successful, return the updated row (including the new balance)
    return res.status(200).json({
      message: "Balance updated successfully",
      updatedRecord: data,
    });
  } catch (err) {
    console.error(err.message);
    res
      .status(500)
      .json({ error: "An error occurred while updating balance." });
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

module.exports = { getBalance, updateBalance, depositFunds };
