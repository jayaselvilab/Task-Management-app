
require('dotenv').config({ path: './.env' }); // Force load the .env from the root
const { Sequelize } = require('sequelize');

// This will help us see exactly what is happening
if (!process.env.DATABASE_URL) {
  console.log("Error: .env file found, but DATABASE_URL is missing inside it!");
} else {
  console.log("DATABASE_URL found in .env!");
}

const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: 'postgres',
  logging: false,
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false
    }
  }
});

module.exports = sequelize;


