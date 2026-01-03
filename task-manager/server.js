require('dotenv').config(); 
const express = require('express');
const cors = require('cors');
const sequelize = require('./config/database');
const User = require('./models/User'); 
const authRoutes = require('./routes/authRoutes');
const taskRoutes = require('./routes/taskRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// 1. Middleware
app.use(cors()); 
app.use(express.json()); 

// 2. Routes
app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);

// 3. Environment Variable Safety Check
if (!process.env.JWT_SECRET) {
    console.error("CRITICAL ERROR: JWT_SECRET is missing from .env file!");
}

// 4. Database Connection & Startup
console.log("Attempting to connect to the database...");

sequelize.authenticate() 
  .then(() => {
    console.log("-----------------------------------------");
    console.log("DATABASE CONNECTION: SUCCESS");
    
    // CRITICAL UPDATE: Using { alter: true } to add new columns (status/priority)
    // without deleting your current data.
    return sequelize.sync({ alter: true }); 
  })
  .then(async () => {
    console.log("DATABASE SYNC: Tables updated with new fields.");
    console.log("-----------------------------------------");

    // Helpful Debug: See who is registered
    try {
        const users = await User.findAll();
        console.log("--- CURRENT REGISTERED USERS ---");
        if (users.length === 0) {
            console.log("No users found. Database is empty.");
        } else {
            users.forEach(u => console.log(`- ${u.email}`));
        }
    } catch (dbErr) {
        console.log("Could not fetch users for log.");
    }
    
    // 5. Start the Express Server
    app.listen(PORT, () => {
        console.log("-----------------------------------------");
        console.log(`SERVER LIVE: http://localhost:${PORT}`);
        console.log("Waiting for requests from Frontend...");
        console.log("-----------------------------------------");
    });
  })
  .catch(err => {
    console.error("-----------------------------------------");
    console.error("DATABASE ERROR!");
    console.error("Reason:", err.message);
    console.log("Check if PostgreSQL is running.");
    console.log("-----------------------------------------");
  });