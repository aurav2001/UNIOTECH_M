const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

/**
 * ClientDocument Model - Stores documents/files uploaded by clients (AMC agreements, invoices, error logs, etc.)
 */
const ClientDocument = sequelize.define('ClientDocument', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    clientId: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    companyId: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    clientName: {
        type: DataTypes.STRING(255),
        allowNull: true
    },
    fileName: {
        type: DataTypes.STRING(500),
        allowNull: false
    },
    fileUrl: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    fileType: {
        type: DataTypes.STRING(100),
        allowNull: true
    },
    fileSize: {
        type: DataTypes.BIGINT,
        allowNull: true
    },
    publicId: {
        type: DataTypes.STRING(255),
        allowNull: true
    },
    category: {
        type: DataTypes.STRING(100),
        defaultValue: 'general' // 'general', 'contract', 'invoice', 'report', 'ticket_attachment'
    },
    description: {
        type: DataTypes.STRING(500),
        allowNull: true
    }
}, {
    timestamps: true,
    tableName: 'client_documents'
});

module.exports = ClientDocument;
