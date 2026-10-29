const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

/**
 * Client Model - Represents clients/companies registered in the system
 */
const Client = sequelize.define('Client', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    name: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    email: {
        type: DataTypes.STRING(255),
        allowNull: false,
        unique: true
    },
    password: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    companyId: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    phone: {
        type: DataTypes.STRING(50),
        allowNull: true
    },
    status: {
        type: DataTypes.STRING(20),
        defaultValue: 'pending' // 'pending', 'approved', 'rejected'
    }
}, {
    timestamps: true,
    tableName: 'clients'
});

module.exports = Client;
