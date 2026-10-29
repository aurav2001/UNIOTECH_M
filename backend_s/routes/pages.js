const express = require('express');
const jwt = require('jsonwebtoken');
const Page = require('../models/Page');
const router = express.Router();

// Middleware to verify JWT token
const authMiddleware = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
        return res.status(401).json({ error: 'No token provided' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch {
        return res.status(401).json({ error: 'Invalid token' });
    }
};

// Get all pages (public - only published)
router.get('/', async (req, res) => {
    try {
        const where = req.query.all === 'true' ? {} : { isPublished: true };
        const pages = await Page.findAll({
             where,
             order: [['order', 'ASC']]
        });
        res.json(pages);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch pages' });
    }
});

// Get page by slug
router.get('/:slug', async (req, res) => {
    try {
        const page = await Page.findOne({ where: { slug: req.params.slug } });
        
        if (!page) {
            return res.status(404).json({ error: 'Page not found' });
        }
        
        if (!page.isPublished) {
            return res.status(404).json({ error: 'Page not found' });
        }
        
        res.json(page);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch page' });
    }
});

// Create new page (protected)
router.post('/', authMiddleware, async (req, res) => {
    try {
        const { title, slug, content, isPublished, seo, order, type, subtitle, heroImage, features, layout, sections, stats } = req.body;
        
        const pageSlug = slug || title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
        
        const existingPage = await Page.findOne({ where: { slug: pageSlug } });
        if (existingPage) {
            return res.status(400).json({ error: 'Page with this slug already exists' });
        }

        const page = await Page.create({
            title,
            slug: pageSlug,
            content: content || '',
            isPublished: isPublished || false,
            seo: seo || {},
            order: order || 0,
            type: type || 'other',
            subtitle: subtitle || '',
            heroImage: heroImage || '',
            features: features || [],
            layout: layout || 'default',
            sections: sections || [],
            stats: stats || []
        });

        res.status(201).json({ success: true, page });
    } catch (error) {
        res.status(500).json({ error: 'Failed to create page' });
    }
});

// Update page (protected)
router.put('/:id', authMiddleware, async (req, res) => {
    try {
        const { title, slug, content, isPublished, seo, order, type, subtitle, heroImage, features, layout, sections, stats } = req.body;
        const updateData = { title, slug, content, isPublished, seo, order, type, subtitle, heroImage, features, layout, sections, stats };
        
        let page;
        const identifier = req.params.id;
        
        // Try to find by numeric id first
        if (!isNaN(identifier)) {
            await Page.update(updateData, { where: { id: identifier } });
            page = await Page.findByPk(identifier);
        }
        
        // Fallback: Try finding by slug
        if (!page) {
            await Page.update(updateData, { where: { slug: identifier } });
            page = await Page.findOne({ where: { slug: identifier } });
        }

        if (!page) {
            return res.status(404).json({ error: 'Page not found' });
        }

        res.json({ success: true, page });
    } catch (error) {
        res.status(500).json({ error: 'Failed to update page' });
    }
});

// Delete page (protected)
router.delete('/:id', authMiddleware, async (req, res) => {
    try {
        const deleted = await Page.destroy({ where: { id: req.params.id } });
        
        if (!deleted) {
            return res.status(404).json({ error: 'Page not found' });
        }

        res.json({ success: true, message: 'Page deleted' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete page' });
    }
});

module.exports = router;
