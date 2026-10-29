const express = require('express');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const router = express.Router();

// Cloudinary Configuration
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// Configure Multer Storage for Cloudinary
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: async (req, file) => {
        const ext = file.originalname.split('.').pop().toLowerCase();
        const allowedFormats = ['jpg', 'png', 'jpeg', 'webp', 'svg'];
        const format = allowedFormats.includes(ext) ? ext : 'jpg';
        return {
            folder: 'uniotech_uploads',
            format: format === 'jpeg' ? 'jpg' : format,
            resource_type: 'image',
            public_id: `payment_${Date.now()}`
        };
    }
});

const upload = multer({ storage: storage });

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


// Upload single image (protected)
router.post('/image', authMiddleware, upload.single('image'), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        // Multer-storage-cloudinary gives the URL in req.file.path
        const imageUrl = req.file.path;
        
        res.json({ 
            success: true, 
            url: imageUrl,
            filename: req.file.filename, // Public ID in Cloudinary
            originalName: req.file.originalname
        });
    } catch (error) {
        // Return more specific error message if available
        res.status(500).json({ 
            error: 'Failed to upload file', 
            details: error.message || error 
        });
    }
});

// Upload payment proof screenshot (Public)
router.post('/payment-proof', upload.single('screenshot'), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }
        res.json({
            success: true,
            url: req.file.path
        });
    } catch (error) {
        res.status(500).json({
            error: 'Failed to upload payment proof',
            details: error.message || error
        });
    }
});

// Upload ticket attachment (Public or Authenticated)
const { clientUpload, uploadToCloudinaryOrLocal } = require('../utils/fileUploader');
router.post('/ticket-attachment', clientUpload.array('files', 5), async (req, res) => {
    try {
        const files = req.files || (req.file ? [req.file] : []);
        if (!files || files.length === 0) {
            return res.status(400).json({ success: false, error: 'No files provided' });
        }

        const uploadedResults = [];
        for (const file of files) {
            const uploadRes = await uploadToCloudinaryOrLocal(file, 'uniotech_ticket_attachments');
            uploadedResults.push(uploadRes);
        }

        res.json({
            success: true,
            files: uploadedResults,
            file: uploadedResults[0]
        });
    } catch (error) {
        console.error('Ticket attachment upload error:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to upload ticket attachment'
        });
    }
});

// List all uploads (protected)
router.get('/list', authMiddleware, async (req, res) => {
    try {
        // Fetch valid resources from Cloudinary
        const result = await cloudinary.api.resources({
            type: 'upload',
            prefix: 'uniotech_uploads/', // Only get images from our folder
            max_results: 50
        });

        const images = result.resources.map(resource => ({
            filename: resource.public_id,
            url: resource.secure_url,
            path: resource.secure_url
        }));

        res.json(images);
    } catch (error) {
        // Fallback to empty list if credentials aren't set or API fails
        res.json([]);
    }
});

// Delete upload (protected)
router.delete('/:publicId(*)', authMiddleware, async (req, res) => {
    try {
        const { publicId } = req.params;
        
        if (!publicId) {
            return res.status(400).json({ error: 'No file ID provided' });
        }

        await cloudinary.uploader.destroy(publicId);
        res.json({ success: true, message: 'File deleted' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete file' });
    }
});

module.exports = router;
