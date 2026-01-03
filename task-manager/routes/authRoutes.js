

const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// REGISTER Logic
router.post('/register', async (req, res) => {
    try {
        // 1. ADD 'username' HERE (it comes from your React form)
        const { username, email, password } = req.body; 

        const hashedPassword = await bcrypt.hash(password, 10);

        // 2. ADD 'username' TO THE DATABASE CREATE FUNCTION
        const newUser = await User.create({ 
            username, 
            email, 
            password: hashedPassword 
        });

        res.status(201).json({ message: "User registered successfully!" });
    } catch (err) {
        console.error("Register Error:", err); // This helps you see the real error in the terminal
        res.status(400).json({ error: err.message || "Registration failed" });
    }
});

// LOGIN Logic
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ where: { email } });
        
        if (!user) return res.status(404).json({ error: "User not found" });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(401).json({ error: "Invalid credentials" });

        // IMPORTANT: Use the secret from your .env file
        const secret = process.env.JWT_SECRET || 'MY_SUPER_SECRET_KEY';
        
        const token = jwt.sign({ id: user.id }, secret, { expiresIn: '1h' });
        
        // Return the username too so the frontend can display it if needed
        res.json({ token, user: { id: user.id, email: user.email, username: user.username } });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;