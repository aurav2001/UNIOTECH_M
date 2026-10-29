const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Content = sequelize.define('Content', {
    section: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    data: {
        type: DataTypes.JSON,
        allowNull: false
    }
}, {
    timestamps: true,
    tableName: 'Contents'
});

module.exports = Content;
