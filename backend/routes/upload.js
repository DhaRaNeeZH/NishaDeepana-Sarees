// ================================================================
// Upload Route — Image + Video upload to Cloudinary (admin only)
// POST /api/upload        → image upload, returns { url }
// POST /api/upload/video  → video upload, returns { url }
// ================================================================

const express = require('express');
const router = express.Router();
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const adminOnly = require('../middleware/adminOnly');

// Configure Cloudinary using env vars
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Image upload multer (5MB, images only)
const imageUpload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) cb(null, true);
        else cb(new Error('Only image files are allowed'));
    },
});

// Video upload multer (100MB, videos only)
const videoUpload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 100 * 1024 * 1024 }, // 100MB max
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('video/')) cb(null, true);
        else cb(new Error('Only video files are allowed'));
    },
});


// Helper to stream a buffer to Cloudinary (for images)
function uploadToCloudinary(buffer, options) {
    return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(options, (error, result) => {
            if (error) reject(error);
            else resolve(result);
        });
        stream.end(buffer);
    });
}

// POST /api/upload — image upload (admin only)
router.post('/', adminOnly, imageUpload.single('image'), async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ error: 'No image file provided' });
        const result = await uploadToCloudinary(req.file.buffer, {
            folder: 'nishadeepana-sarees',
        });
        res.json({ url: result.secure_url });
    } catch (err) {
        res.status(500).json({ error: err.message || 'Image upload failed' });
    }
});

// POST /api/upload/video — video upload (admin only)
router.post('/video', adminOnly, videoUpload.single('video'), async (req, res) => {
    console.log('Video upload started, size:', req.file ? req.file.size : 0);
    try {
        if (!req.file) return res.status(400).json({ error: 'No video file provided' });
        
        const options = {
            folder: 'nishadeepana-sarees-videos',
            resource_type: 'video',
        };
        
        if (req.query.mute === 'true') {
            options.eager = [{ audio_codec: "none" }];
            options.eager_async = true;
        }
        
        console.log('Streaming to Cloudinary...');
        const result = await uploadToCloudinary(req.file.buffer, options);
        
        console.log('Cloudinary upload success');
        
        let finalUrl = result.secure_url;
        // If eager transformation was requested, use its URL instead of the original
        if (req.query.mute === 'true') {
            if (result.eager && result.eager.length > 0) {
                finalUrl = result.eager[0].secure_url;
            } else {
                finalUrl = finalUrl.replace('/upload/', '/upload/ac_none/');
            }
        }
        
        res.json({ url: finalUrl });
    } catch (err) {
        console.error('Cloudinary upload error:', err);
        res.status(500).json({ error: err.message || 'Video upload failed' });
    }
});

module.exports = router;
