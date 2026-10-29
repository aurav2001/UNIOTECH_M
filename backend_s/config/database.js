const { Sequelize } = require('sequelize');
const path = require('path');
require('dotenv').config();

let sequelize;

if (process.env.NODE_ENV === 'production') {
    // Production: Use remote MySQL
    sequelize = new Sequelize(
        process.env.DB_NAME,
        process.env.DB_USER,
        process.env.DB_PASS,
        {
            host: process.env.DB_HOST,
            dialect: 'mysql',
            logging: false,
            pool: {
                max: 5,
                min: 0,
                acquire: 30000,
                idle: 10000
            }
        }
    );
} else {
    // Development: Use local SQLite (no external DB needed)
    sequelize = new Sequelize({
        dialect: 'sqlite',
        storage: path.join(__dirname, '..', 'dev_database.sqlite'),
        logging: false
    });
    console.log('📦 Using local SQLite database for development');
}

module.exports = sequelize;
