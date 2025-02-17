const { createClient } = require("@supabase/supabase-js");
const bcrypt = require("bcrypt");

const supabase = createClient(
  process.env.DATABASE_URL,
  process.env.DATABASE_KEY
);

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Retrieve the user by username
    const { data: user, error } = await supabase
      .from("users")
      .select("*")
      .eq("email", email)
      .single();

    if (error || !user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // Compare the provided password with the hashed password in the database
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // Generate a token here (e.g., JWT) if needed
    // const token = generateToken(user);

    res.status(200).json({
      message: "Login successful",
      user_id: user.user_id,
      username: user.username,
      // token: token
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "An error occurred during login." });
  }
};
// Sign-up Route
const signup = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if a user with the same username already exists.
    // Using maybeSingle() returns null if no row is found.
    const { data: existingUser } = await supabase
      .from("users")
      .select("*")
      .eq("email", email)
      .maybeSingle();

    if (existingUser) {
      return res.status(409).json({ error: "Username already exists" });
    }

    // Hash the password before storing it
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Insert the new user into the database
    const { data: newUser, error: insertError } = await supabase
      .from("users")
      .insert({ email, password: hashedPassword })
      .select("*")
      .single();

    if (insertError) {
      return res.status(500).json({ error: "Error creating user" });
    }

    // Initialize a row in the port table for the new user
    // Here we're setting the initial balance to 0 (or any default value you prefer)
    const { data: newPort, error: portError } = await supabase
      .from("port")
      .insert({ user_id: newUser.user_id, balance: 0 })
      .select("*")
      .single();

    if (portError) {
      console.log(portError);
      return res
        .status(500)
        .json({ error: "Error initializing port for user" });
    }

    res.status(201).json({
      message: "Sign-up successful",
      user_id: newUser.user_id,
      username: newUser.username,
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "An error occurred during sign-up" });
  }
};

// Update Username Route
const updateUsername = async (req, res) => {
  try {
    const { user_id, username } = req.body;

    // Optionally: Add additional checks to validate the username (e.g., uniqueness)

    const { data: updatedUser, error } = await supabase
      .from("users")
      .update({ username })
      .eq("user_id", user_id)
      .select("*")
      .single();

    if (error) {
      return res.status(500).json({ error: "Error updating username" });
    }

    res.status(200).json({
      message: "Username updated successfully",
      user: updatedUser,
    });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ error: "An error occurred while updating username." });
  }
};

module.exports = { login, signup, updateUsername };
