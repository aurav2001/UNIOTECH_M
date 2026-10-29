require('dotenv').config();
const cloudinary = require('cloudinary').v2;

console.log("Testing Cloudinary Upload...");

const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
const apiKey = process.env.CLOUDINARY_API_KEY;
const apiSecret = process.env.CLOUDINARY_API_SECRET;

if (!cloudName || !apiKey || !apiSecret) {
    console.error("❌ Missing Cloudinary credentials");
    process.exit(1);
}

cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret
});

// Create a simple base64 image (a small red dot)
const base64Image = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKwftQAAAABJRU5ErkJggg==';

cloudinary.uploader.upload(base64Image, {
    folder: 'uniotech_test',
    public_id: 'test_image_' + Date.now()
}, (error, result) => {
    if (error) {
        console.error("❌ Upload Failed:", JSON.stringify(error, null, 2));
    } else {
        console.log("✅ Upload Successful!");
        console.log("URL:", result.secure_url);
        
        // Clean up
        cloudinary.uploader.destroy(result.public_id, (err, res) => {
            if (!err) console.log("✅ Test file deleted.");
        });
    }
});
