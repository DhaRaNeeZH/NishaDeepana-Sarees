// ================================================================
// NishaDeepana Sarees — Express + MongoDB Backend
// ================================================================
// This server connects to MongoDB Atlas and exposes REST API
// endpoints for the React frontend.
//
// Current routes:
//   GET  /api/health    → Server health check
//   GET  /api/products  → All products
//   POST /api/products  → Create product (admin)
//   GET  /api/orders    → All orders (admin)
//   POST /api/orders    → Create order (checkout)
//
// TODO: Add Razorpay endpoints:
//   POST /api/payments/create-order
//   POST /api/payments/verify
// ================================================================

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// ── Middleware ────────────────────────────────────────────────
app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (mobile apps, curl, etc.)
        if (!origin) return callback(null, true);

        const allowed = [
            'http://localhost:5173',
            'http://localhost:3000',
            'http://127.0.0.1:5173',
        ];

        // Allow any Vercel deployment URL or custom domain for NishaDeepana
        if (origin.includes('.vercel.app') || origin.includes('nishadeepanasarees.in') || allowed.includes(origin)) {
            return callback(null, true);
        }

        console.warn(`[CORS] Blocked origin: ${origin}`);
        callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
}));
app.use(express.json());

// ── MongoDB Connection ────────────────────────────────────────
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('✅ MongoDB Connected — NishaDeepana DB is live!'))
    .catch((err) => {
        console.error('❌ MongoDB Connection Failed:', err.message);
        process.exit(1);
    });

// ── Routes ────────────────────────────────────────────────────

// Health check — test at http://localhost:5000/api/health
app.get('/api/health', (req, res) => {
    res.json({
        status: 'ok',
        message: 'NishaDeepana backend is running 🎉',
        database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
        timestamp: new Date().toISOString(),
    });
});


app.use('/api/products', require('./routes/products'));

// Orders
app.use('/api/orders', require('./routes/orders'));

// Auth
app.use('/api/auth', require('./routes/auth'));

// User Data (cart + wishlist per email)
app.use('/api/userdata', require('./routes/userdata'));

// Image Upload (Cloudinary)
app.use('/api/upload', require('./routes/upload'));

// Payments (Razorpay)
app.use('/api/payments', require('./routes/payments'));

// Settings (delivery charges etc.)
app.use('/api/settings', require('./routes/settings'));

// Categories (admin-managed, drives home page + collection filter)
app.use('/api/categories', require('./routes/categories'));

// ── Dynamic Sitemap ───────────────────────────────────────────
app.get('/sitemap.xml', async (req, res) => {
    try {
        const Product = require('./models/Product');
        const products = await Product.find({}, '_id updatedAt').lean();

        const staticPages = [
            { url: '/', priority: '1.0', changefreq: 'daily' },
            { url: '/collections', priority: '0.9', changefreq: 'daily' },
            { url: '/wholesale', priority: '0.8', changefreq: 'weekly' },
            { url: '/about', priority: '0.7', changefreq: 'monthly' },
            { url: '/contact', priority: '0.7', changefreq: 'monthly' },
            { url: '/track-order', priority: '0.6', changefreq: 'monthly' },
        ];

        const productUrls = products.map(p => ({
            url: `/product/${p._id}`,
            priority: '0.8',
            changefreq: 'weekly',
            lastmod: p.updatedAt ? new Date(p.updatedAt).toISOString().slice(0, 10) : new Date().toISOString().slice(0, 10),
        }));

        const today = new Date().toISOString().slice(0, 10);
        const allUrls = [
            ...staticPages.map(p => ({ ...p, lastmod: today })),
            ...productUrls,
        ];

        const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allUrls.map(p => `  <url>
    <loc>https://nishadeepanasarees.in${p.url}</loc>
    <lastmod>${p.lastmod}</lastmod>
    <changefreq>${p.changefreq}</changefreq>
    <priority>${p.priority}</priority>
  </url>`).join('\n')}
</urlset>`;

        res.header('Content-Type', 'application/xml');
        res.send(xml);
    } catch (err) {
        res.status(500).send('Error generating sitemap');
    }
});


// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({ error: `Route ${req.originalUrl} not found` });
});

// ── Start Server ──────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server running at http://0.0.0.0:${PORT}`);
    console.log(`📦 Health check: http://0.0.0.0:${PORT}/api/health`);
});
