
const taskRoutes = require('./routes/taskRoutes');
const cors = require('cors');
const express = require('express');
const sequelize = require('./config/database');
const authRoutes = require('./routes/authRoutes');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());
app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);

// Check Database Connection

// Replace sequelize.authenticate() with this:
sequelize.sync({ alter: true })
  .then(() => {
    console.log("Database connected and tables updated!");
    app.listen(5000, () => console.log("Server running on port 5000"));
  })
  .catch(err => {
    console.error("Database connection error:", err);
  });







app.get('/', (req, res) => res.send('Task Manager API is Live!'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));