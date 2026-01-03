const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const User = sequelize.define('User', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    username: {
        type: DataTypes.STRING,
        allowNull: false
        // This allows your Register function to save the username correctly
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: { 
            isEmail: true // Ensures only valid email formats are saved
        } 
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false
    }
}, {
    // This automatically adds createdAt and updatedAt timestamps
    timestamps: true 
});

module.exports = User;