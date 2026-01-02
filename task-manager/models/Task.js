const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./User'); // Import User to create a relationship

const Task = sequelize.define('Task', {
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  completed: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  }
});

// Create the Relationship (One User has Many Tasks)
User.hasMany(Task, { onDelete: 'CASCADE' });
Task.belongsTo(User);

module.exports = Task;