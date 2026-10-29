const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Blog = sequelize.define('Blog', {
    title: {
        type: DataTypes.STRING,
        allowNull: false
    },
    slug: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    subtitle: {
        type: DataTypes.STRING,
        defaultValue: ''
    },
    content: {
        type: DataTypes.TEXT('long'), // For rich text content
        allowNull: false
    },
    coverImage: {
        type: DataTypes.STRING,
        defaultValue: ''
    },
    author: {
        type: DataTypes.JSON, // Store author object {name, image, role}
        allowNull: true
    },
    tags: {
        type: DataTypes.JSON, // Store tags array
        allowNull: true
    },
    isPublished: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    readTime: {
        type: DataTypes.STRING,
        defaultValue: '5 min read'
    }
}, {
    timestamps: true,
    hooks: {
        beforeValidate: (blog) => {
            if (!blog.slug && blog.title) {
                blog.slug = blog.title
                    .toLowerCase()
                    .replace(/[^\w ]+/g, '')
                    .replace(/ +/g, '-');
            }
        }
    }
});

module.exports = Blog;
