const express = require('express');
const router = express.Router();
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const Submission = require('../models/Submission');
const { sendCareerEmail, sendOTPEmail } = require('../services/emailService');
const jwt = require('jsonwebtoken');
const Content = require('../models/Content');

// In-memory store for OTPs (Email -> { otp, expires })
const otpStore = new Map();

// Helper to generate 6-digit OTP
const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

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
    } catch (err) {
        return res.status(401).json({ error: 'Invalid token' });
    }
};

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// Configure multer for CV uploads to Cloudinary
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: async (req, file) => {
        // Get original filename without extension
        const originalName = file.originalname.split('.').slice(0, -1).join('.');
        const ext = file.originalname.split('.').pop().toLowerCase();

        // For raw files, we MUST include the extension in the public_id manually
        // otherwise Cloudinary saves it without one and browsers can't open it
        return {
            folder: 'uniotech_cvs',
            resource_type: 'raw',
            public_id: `${originalName}_${Date.now()}.${ext}`, // Explicitly add extension
            format: ext,
        };
    },
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: (req, file, cb) => {
        const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Only PDF, DOC, and DOCX files are allowed'), false);
        }
    }
});

// GET /api/careers/openings - Get active job openings
router.get('/openings', async (req, res) => {
    try {
        const careerContent = await Content.findOne({ where: { section: 'careers' } });

        if (careerContent && careerContent.data && careerContent.data.openings) {
            const activeOpenings = careerContent.data.openings.filter(o => o.isActive !== false);
            return res.json({ success: true, data: activeOpenings });
        }

        res.json({ success: true, data: [] });
    } catch (error) {
        res.json({ success: true, data: [] });
    }
});

// POST /api/careers/openings - Add a new job opening (admin only)
router.post('/openings', authMiddleware, async (req, res) => {
    try {
        const { title, department, location, type, vacancies } = req.body;

        if (!title) {
            return res.status(400).json({ success: false, message: 'Title is required' });
        }

        let careerContent = await Content.findOne({ where: { section: 'careers' } });

        if (!careerContent) {
            careerContent = await Content.create({
                section: 'careers',
                data: { openings: [] }
            });
        }

        const openings = careerContent.data.openings || [];
        const newOpening = {
            id: Date.now(),
            title,
            department: department || '',
            location: location || 'Remote',
            type: type || 'Full-time',
            vacancies: parseInt(vacancies) || 1,
            isActive: true,
            createdAt: new Date().toISOString()
        };

        openings.push(newOpening);

        await Content.update(
            { data: { ...careerContent.data, openings } },
            { where: { section: 'careers' } }
        );

        res.json({ success: true, data: newOpening });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to create opening' });
    }
});

// DELETE /api/careers/openings/:id - Delete a job opening (admin only)
router.delete('/openings/:id', authMiddleware, async (req, res) => {
    try {
        const { id } = req.params;

        const careerContent = await Content.findOne({ where: { section: 'careers' } });

        if (!careerContent || !careerContent.data || !careerContent.data.openings) {
            return res.status(404).json({ success: false, message: 'Opening not found' });
        }

        const openings = careerContent.data.openings.filter(o => o.id !== parseInt(id));

        await Content.update(
            { data: { ...careerContent.data, openings } },
            { where: { section: 'careers' } }
        );

        res.json({ success: true, message: 'Opening deleted' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to delete opening' });
    }
});

// POST /api/careers/send-otp - Generate and send OTP
router.post('/send-otp', async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) {
            return res.status(400).json({ success: false, message: 'Email is required' });
        }

        const otp = generateOTP();
        const expires = Date.now() + 5 * 60 * 1000; // 5 minutes

        otpStore.set(email, { otp, expires });

        await sendOTPEmail(email, otp);

        res.json({ success: true, message: 'OTP sent successfully' });
    } catch (error) {
        console.error('Send OTP error:', error);
        res.status(500).json({ success: false, message: 'Failed to send OTP' });
    }
});

// POST /api/careers/verify-otp - Verify OTP
router.post('/verify-otp', async (req, res) => {
    try {
        const { email, otp } = req.body;
        if (!email || !otp) {
            return res.status(400).json({ success: false, message: 'Email and OTP are required' });
        }

        const storedData = otpStore.get(email);

        if (!storedData) {
            return res.status(400).json({ success: false, message: 'OTP not requested or expired' });
        }

        if (Date.now() > storedData.expires) {
            otpStore.delete(email);
            return res.status(400).json({ success: false, message: 'OTP expired' });
        }

        if (storedData.otp !== otp) {
            return res.status(400).json({ success: false, message: 'Invalid OTP' });
        }

        // Successfully verified
        otpStore.delete(email);
        res.json({ success: true, message: 'Email verified successfully' });
    } catch (error) {
        console.error('Verify OTP error:', error);
        res.status(500).json({ success: false, message: 'Failed to verify OTP' });
    }
});

// POST /api/careers/apply - Submit a job application
router.post('/apply', upload.single('cv'), async (req, res) => {
    try {
        const { name, email, phone, position } = req.body;

        if (!name || !email || !phone) {
            return res.status(400).json({ success: false, message: 'Name, email, and phone are required' });
        }

        const cvUrl = req.file ? req.file.path : null;
        const jobTitle = position || 'General Application';

        // Create submission using only standard fields
        // cvUrl goes in message field as a workaround if column doesn't exist
        const submission = await Submission.create({
            type: 'career',
            name,
            email,
            phone,
            subject: jobTitle,
            message: cvUrl ? `Position: ${jobTitle}\nCV: ${cvUrl}` : `Position: ${jobTitle}`,
            source: 'Quick Apply Form',
            status: 'new',
            ipAddress: req.ip || (req.connection && req.connection.remoteAddress) || null,
            userAgent: req.get('User-Agent') || null
        });

        // Send email notification
        try {
            await sendCareerEmail({
                name,
                email,
                phone,
                jobTitle: jobTitle,
                cvUrl: cvUrl
            });
        } catch (emailError) {
            // Email failed but don't fail the request
            console.error('Career email error:', emailError.message);
        }

        res.json({
            success: true,
            message: 'Application submitted successfully',
            data: { id: submission.id }
        });

    } catch (error) {
        console.error('Career apply error:', error.message);
        res.status(500).json({ success: false, message: 'Failed to submit application', error: error.message });
    }
});

module.exports = router;
