const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Page = sequelize.define('Page', {
    title: {
        type: DataTypes.STRING,
        allowNull: false
    },
    slug: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    type: {
        type: DataTypes.STRING,
        defaultValue: 'other'
    },
    subtitle: {
        type: DataTypes.STRING,
        defaultValue: ''
    },
    heroImage: {
        type: DataTypes.STRING,
        defaultValue: ''
    },
    layout: {
        type: DataTypes.STRING,
        defaultValue: 'default'
    },
    // Storing complex nested arrays as JSON to maintain exact structure
    sections: {
        type: DataTypes.JSON,
        allowNull: true
    },
    stats: {
        type: DataTypes.JSON,
        allowNull: true
    },
    features: {
        type: DataTypes.JSON,
        allowNull: true
    },
    content: {
        type: DataTypes.TEXT('long'), // For long HTML content
        allowNull: true
    },
    isPublished: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    seo: {
        type: DataTypes.JSON,
        allowNull: true
    },
    order: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    }
}, {
    timestamps: true,
    hooks: {
        beforeSave: (page) => {
            if (!page.slug && page.title) {
                page.slug = page.title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
            }
        }
    }
});

module.exports = Page;
