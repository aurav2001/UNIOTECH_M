const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

/**
 * Submission Model - Stores all form submissions (Contact, Callback, Enquiry, Career, Hiring)
 */
const Submission = sequelize.define('Submission', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    type: {
        type: DataTypes.STRING(20),
        allowNull: false
    },
    name: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    email: {
        type: DataTypes.STRING(255),
        allowNull: true
    },
    phone: {
        type: DataTypes.STRING(50),
        allowNull: true
    },
    subject: {
        type: DataTypes.STRING(500),
        allowNull: true
    },
    message: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    source: {
        type: DataTypes.STRING(255),
        allowNull: true
    },
    preferredTime: {
        type: DataTypes.STRING(100),
        allowNull: true
    },
    status: {
        type: DataTypes.STRING(20),
        defaultValue: 'new'
    },
    ipAddress: {
        type: DataTypes.STRING(100),
        allowNull: true
    },
    userAgent: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    companyId: {
        type: DataTypes.STRING(255),
        allowNull: true
    },
    clientId: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    priority: {
        type: DataTypes.STRING(20),
        defaultValue: 'medium' // 'low', 'medium', 'high', 'urgent'
    },
    remindersCount: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    lastRemindedAt: {
        type: DataTypes.DATE,
        allowNull: true
    },
    adminResponse: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    respondedAt: {
        type: DataTypes.DATE,
        allowNull: true
    },
    attachments: {
        type: DataTypes.TEXT, // JSON stringified array of { name, url, size, type }
        allowNull: true
    },
    slaDeadline: {
        type: DataTypes.DATE,
        allowNull: true
    },
    resolvedAt: {
        type: DataTypes.DATE,
        allowNull: true
    },
    slaBreached: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    }
}, {
    timestamps: true,
    tableName: 'submissions'
});

module.exports = Submission;
