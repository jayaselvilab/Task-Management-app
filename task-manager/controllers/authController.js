const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// --- REGISTER FUNCTION ---
exports.register = async (req, res) => {
  try {
    const { username, password, email } = req.body;

    // 1. Check if any fields are missing (Prevents 400 Bad Request)
    if (!username || !email || !password) {
      return res.status(400).json({ 
        error: "All fields are required. Please provide username, email, and password." 
      });
    }

    const cleanEmail = email.toLowerCase().trim();

    // 2. Check if user already exists
    const existingUser = await User.findOne({ where: { email: cleanEmail } });
    if (existingUser) {
      return res.status(400).json({ 
        error: "That email is already in our system. Try logging in!" 
      });
    }

    // 3. Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 4. Create the User in the database
    await User.create({ 
      username, 
      email: cleanEmail, 
      password: hashedPassword 
    });

    res.status(201).json({ message: "User created! Now please Login." });

  } catch (err) {
    console.error("Register Error:", err);
    res.status(500).json({ error: err.message });
  }
};

// --- LOGIN FUNCTION ---
exports.login = async (req, res) => {
  try {
    const { password, email } = req.body;

    // 1. Basic Validation
    if (!email || !password) {
      return res.status(400).json({ error: "Please provide both email and password." });
    }

    const cleanEmail = email.toLowerCase().trim();
    console.log("Attempting login for:", cleanEmail);

    // 2. Find user by email
    const user = await User.findOne({ where: { email: cleanEmail } });

    if (!user) {
      console.log("Login failed: Email not found");
      return res.status(401).json({ message: "User not found. Please register first!" });
    }

    // 3. Compare passwords
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid password" });
    }

    // 4. Generate Token (FIXED: Uses process.env.JWT_SECRET)
    // This ensures your Tasks route (401 error) will now recognize your login
    const token = jwt.sign(
      { id: user.id }, 
      process.env.JWT_SECRET, 
      { expiresIn: '1h' }
    );

    console.log("Login successful, token generated.");

    res.status(200).json({
      token,
      username: user.username
    });

  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ error: error.message });
  }
};