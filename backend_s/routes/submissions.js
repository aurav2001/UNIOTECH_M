const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const Submission = require('../models/Submission');
const { sendTicketResponseEmail } = require('../services/emailService');

// Middleware to verify JWT token (supports Bearer header and cookie)
const authMiddleware = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1] || req.cookies?.admin_token;
    
    if (!token) {
        return res.status(401).json({ success: false, error: 'Unauthorized: No token provided' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        return res.status(401).json({ success: false, error: 'Unauthorized: Invalid token' });
    }
};

// GET /api/submissions - Get all submissions (admin only)
router.get('/', authMiddleware, async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 200;
        const type = req.query.type;
        
        const where = {};
        if (type && type !== 'all') {
            where.type = type;
        }
        
        const submissions = await Submission.findAll({
            where,
            order: [['createdAt', 'DESC']],
            limit
        });
        
        res.json({ success: true, data: submissions });
    } catch (error) {
        console.error('Fetch submissions error:', error.message);
        res.status(500).json({ success: false, message: 'Failed to fetch submissions', error: error.message });
    }
});

// GET /api/submissions/stats - Get submission stats
router.get('/stats', authMiddleware, async (req, res) => {
    try {
        const { fn, col } = require('sequelize');
        
        const stats = await Submission.findAll({
            attributes: [
                'type',
                [fn('COUNT', col('id')), 'count']
            ],
            group: ['type']
        });
        
        const total = await Submission.count();
        const newCount = await Submission.count({ where: { status: 'new' } });
        
        res.json({ 
            success: true, 
            data: {
                byType: stats,
                total,
                new: newCount
            }
        });
    } catch (error) {
        console.error('Fetch stats error:', error.message);
        res.status(500).json({ success: false, message: 'Failed to fetch stats', error: error.message });
    }
});

// GET /api/submissions/:id - Get single submission
router.get('/:id', authMiddleware, async (req, res) => {
    try {
        const submission = await Submission.findByPk(req.params.id);
        
        if (!submission) {
            return res.status(404).json({ success: false, message: 'Submission not found' });
        }
        
        res.json({ success: true, data: submission });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to fetch submission' });
    }
});

// Helper function to update submission status and/or admin response
const handleSubmissionUpdate = async (req, res) => {
    try {
        const { status, adminResponse } = req.body;
        
        const submission = await Submission.findByPk(req.params.id);
        
        if (!submission) {
            return res.status(404).json({ success: false, message: 'Submission not found' });
        }
        
        let statusChanged = false;
        let responseAdded = false;

        const { calculateSLADeadline } = require('../utils/slaHelper');

        if (status) {
            submission.status = status;
            statusChanged = true;

            if ((status === 'resolved' || status === 'closed') && !submission.resolvedAt) {
                submission.resolvedAt = new Date();
                if (submission.slaDeadline) {
                    submission.slaBreached = submission.resolvedAt > new Date(submission.slaDeadline);
                }
            } else if (status !== 'resolved' && status !== 'closed') {
                submission.resolvedAt = null;
                if (submission.slaDeadline) {
                    submission.slaBreached = new Date() > new Date(submission.slaDeadline);
                }
            }
        }

        if (req.body.priority && req.body.priority !== submission.priority) {
            submission.priority = req.body.priority;
            if (!submission.resolvedAt) {
                submission.slaDeadline = calculateSLADeadline(submission.priority, submission.createdAt);
                submission.slaBreached = new Date() > new Date(submission.slaDeadline);
            }
        }

        if (typeof adminResponse === 'string' && adminResponse.trim()) {
            submission.adminResponse = adminResponse.trim();
            submission.respondedAt = new Date();
            responseAdded = true;
        }

        await submission.save();

        // If it's a ticket and an admin response was added or status updated to resolved/approved, send email update to client asynchronously
        if (submission.type === 'ticket' && submission.email && (responseAdded || (statusChanged && (status === 'resolved' || status === 'approved' || status === 'in_progress')))) {
            const responseText = submission.adminResponse || `Your ticket status has been updated to ${submission.status.toUpperCase()}.`;
            // Trigger email in background without blocking API response
            sendTicketResponseEmail(submission, responseText, submission.status).catch((mailErr) => {
                console.warn('Background ticket response email notice:', mailErr.message);
            });
        }
        
        res.json({ 
            success: true, 
            data: submission,
            message: 'Submission updated successfully' 
        });
    } catch (error) {
        console.error('Update submission error:', error);
        res.status(500).json({ success: false, message: 'Failed to update submission', error: error.message });
    }
};

// PUT /api/submissions/:id/status - Update submission status
router.put('/:id/status', authMiddleware, handleSubmissionUpdate);

// POST /api/submissions/:id/response - Add admin response to ticket
router.post('/:id/response', authMiddleware, handleSubmissionUpdate);

// PUT /api/submissions/:id - General update submission
router.put('/:id', authMiddleware, handleSubmissionUpdate);

// DELETE /api/submissions/:id - Delete submission
router.delete('/:id', authMiddleware, async (req, res) => {
    try {
        const submission = await Submission.findByPk(req.params.id);
        
        if (!submission) {
            return res.status(404).json({ success: false, message: 'Submission not found' });
        }
        
        await submission.destroy();
        
        res.json({ success: true, message: 'Submission deleted' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to delete submission' });
    }
});

module.exports = router;
