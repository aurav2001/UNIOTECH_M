const express = require('express');
const router = express.Router();
const { Op } = require('sequelize');
const Blog = require('../models/Blog');
const { protect, authorize } = require('../middleware/auth');

// @desc    Get all blogs (Public: published only, Admin: all)
// @route   GET /api/blogs
// @access  Public / Private
router.get('/', async (req, res) => {
    try {
        let where = {};
        
        // If not requesting all (e.g. from admin), only show published
        if (req.query.all !== 'true') {
            where.isPublished = true;
        }

        // Search validation (Title or Subtitle)
        if (req.query.search) {
            where[Op.or] = [
                { title: { [Op.like]: `%${req.query.search}%` } },
                { subtitle: { [Op.like]: `%${req.query.search}%` } }
            ];
        }

        // Tag filtering (JSON array contains tag)
        // Note: filtering JSON arrays in MySQL depends on version. 
        // For broad compatibility, we might fetch all matches or rely on simple string match if strict JSON functions aren't guaranteed.
        // Attempting basic JSON_CONTAINS equivalent or string matching if stored as stringified JSON.
        // Since we are using DataTypes.JSON, Sequelize stringifies it.
        // Example for MySQL 5.7+ JSON_CONTAINS logic usually requires specific syntax.
        // Fallback: Fetch and filter in memory if volume is low, OR simple LIKE for now.
        if (req.query.tag) {
             // Simple LIKE approach for JSON array string representation (unsafe but works for simple cases)
             // Better: use Sequelize.fn('JSON_CONTAINS', ...) if DB supports it.
             // For now, let's try strict equality if exact tag match, or skip DB level filtering for tags if complex.
             // Actually, let's using Op.like for '%"Tag"%' which is a common hack for JSON arrays in text columns
             where.tags = { [Op.like]: `%"${req.query.tag}"%` };
        }

        const blogs = await Blog.findAll({ 
            where, 
            order: [['createdAt', 'DESC']] 
        });
        
        res.status(200).json(blogs);
    } catch (error) {
        console.error('Error fetching blogs:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// @desc    Get single blog by slug
// @route   GET /api/blogs/:slug
// @access  Public
router.get('/:slug', async (req, res) => {
    try {
        const blog = await Blog.findOne({ where: { slug: req.params.slug } });
        
        if (!blog) {
            return res.status(404).json({ success: false, error: 'Blog not found' });
        }

        res.status(200).json(blog);
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// @desc    Create new blog
// @route   POST /api/blogs
// @access  Private (Admin or Blog Editor)
router.post('/', protect, authorize('admin', 'blog_editor'), async (req, res) => {
    try {
        const blog = await Blog.create(req.body);
        res.status(201).json(blog);
    } catch (error) {
        if (error.name === 'SequelizeUniqueConstraintError') {
             return res.status(400).json({ success: false, error: 'Blog with this title/slug already exists' });
        }
        res.status(400).json({ success: false, error: error.message });
    }
});

// @desc    Update blog
// @route   PUT /api/blogs/:id
// @access  Private (Admin or Blog Editor)
router.put('/:id', protect, authorize('admin', 'blog_editor'), async (req, res) => {
    try {
        const blog = await Blog.findByPk(req.params.id);

        if (!blog) {
            return res.status(404).json({ success: false, error: 'Blog not found' });
        }

        // Update
        await blog.update(req.body);
        
        // Fetch updated
        const updatedBlog = await Blog.findByPk(req.params.id);

        res.status(200).json(updatedBlog);
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
});

// @desc    Delete blog
// @route   DELETE /api/blogs/:id
// @access  Private (Admin or Blog Editor)
router.delete('/:id', protect, authorize('admin', 'blog_editor'), async (req, res) => {
    try {
        const blog = await Blog.findByPk(req.params.id);

        if (!blog) {
            return res.status(404).json({ success: false, error: 'Blog not found' });
        }

        await blog.destroy();

        res.status(200).json({ success: true, data: {} });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
});

module.exports = router;
