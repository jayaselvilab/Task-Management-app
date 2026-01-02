const User = require('../models/User');

// This function handles creating a new user
exports.register = async (req, res) => {
  try {
    const { username, email, password } = req.body;
    
    // Create the user in the database
    const newUser = await User.create({
      username,
      email,
      password
    });

    res.status(201).json({
      message: "User created successfully!",
      user: newUser
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};


// --- KEEP YOUR REGISTER CODE ABOVE THIS ---

// ADD THIS NEW LOGIN CODE AT THE BOTTOM
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ where: { email } });
    
    if (!user || user.password !== password) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    res.status(200).json({
      message: "Login successful!",
      username: user.username
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};