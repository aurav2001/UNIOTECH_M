const multer = require('multer');
const path = require('path');
const fs = require('fs');
const cloudinary = require('cloudinary').v2;

// Cloudinary Configuration
if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY) {
    cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET
    });
}

// Local storage directory
const uploadDir = path.join(__dirname, '..', 'uploads', 'client_files');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Disk storage configuration
const diskStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        const ext = path.extname(file.originalname).toLowerCase();
        const baseName = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9_-]/g, '_');
        cb(null, `${baseName}-${uniqueSuffix}${ext}`);
    }
});

// Allowed file types: Images, Documents, PDFs, Archives, Logs
const allowedExtensions = [
    '.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg',
    '.pdf', '.doc', '.docx', '.xls', '.xlsx', '.csv', '.ppt', '.pptx',
    '.txt', '.log', '.json', '.xml',
    '.zip', '.rar', '.7z', '.tar', '.gz'
];

const fileFilter = (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowedExtensions.includes(ext)) {
        cb(null, true);
    } else {
        cb(new Error(`File type ${ext} is not allowed. Supported formats: images, PDFs, Word/Excel documents, text/logs, zip archives.`));
    }
};

const clientUpload = multer({
    storage: diskStorage,
    limits: {
        fileSize: 25 * 1024 * 1024 // 25 MB max per file
    },
    fileFilter
});

/**
 * Uploads a local file to Cloudinary if configured; otherwise returns local static URL
 */
const uploadToCloudinaryOrLocal = async (file, folder = 'uniotech_client_files') => {
    const hasCloudinary = process.env.CLOUDINARY_CLOUD_NAME && 
                          process.env.CLOUDINARY_API_KEY && 
                          process.env.CLOUDINARY_API_SECRET;

    const fileExt = path.extname(file.originalname).toLowerCase();
    const isImage = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'].includes(fileExt);

    if (hasCloudinary) {
        try {
            const result = await cloudinary.uploader.upload(file.path, {
                folder: folder,
                resource_type: 'auto',
                use_filename: true,
                unique_filename: true
            });

            // Cleanup local file after successful cloudinary upload
            try {
                if (fs.existsSync(file.path)) {
                    fs.unlinkSync(file.path);
                }
            } catch (err) {
                // Ignore unlink errors
            }

            return {
                name: file.originalname,
                url: result.secure_url,
                publicId: result.public_id,
                size: file.size,
                type: file.mimetype || fileExt.replace('.', '')
            };
        } catch (cloudErr) {
            console.warn('Cloudinary upload warning, falling back to local storage:', cloudErr.message);
        }
    }

    // Fallback: Use local file URL
    const relativePath = `/uploads/client_files/${path.basename(file.path)}`;
    return {
        name: file.originalname,
        url: relativePath,
        publicId: path.basename(file.path),
        size: file.size,
        type: file.mimetype || fileExt.replace('.', '')
    };
};

module.exports = {
    clientUpload,
    uploadToCloudinaryOrLocal
};
