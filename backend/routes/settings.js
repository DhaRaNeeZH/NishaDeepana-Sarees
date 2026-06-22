// ================================================================
// Settings Routes — Delivery charge zones
// GET  /api/settings/delivery  → public (used by checkout)
// PUT  /api/settings/delivery  → admin only
// ================================================================

const express = require('express');
const router = express.Router();
const Settings = require('../models/Settings');
const jwt = require('jsonwebtoken');

// Default delivery charges
const DEFAULT_DELIVERY = {
    tamilnadu: 50,
    nearby: 80,
    others: 50,
    freeShipping: false,  // festival free delivery toggle
};

// Helper: ensure settings doc exists
async function getDeliveryDoc() {
    let doc = await Settings.findOne({ key: 'deliveryCharge' });
    if (!doc) {
        doc = await Settings.create({ key: 'deliveryCharge', value: DEFAULT_DELIVERY });
    }
    return doc;
}

// Admin middleware — verify JWT + role
function adminOnly(req, res, next) {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) return res.status(401).json({ error: 'No token provided' });
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if (decoded.role !== 'admin') return res.status(403).json({ error: 'Admin access required' });
        req.user = decoded;
        next();
    } catch {
        res.status(401).json({ error: 'Invalid token' });
    }
}

// GET /api/settings/delivery — public
router.get('/delivery', async (req, res) => {
    try {
        const doc = await getDeliveryDoc();
        res.json(doc.value);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// PUT /api/settings/delivery — admin only
// Body: { tamilnadu: 50, nearby: 80, others: 100, freeShipping: false }
router.put('/delivery', adminOnly, async (req, res) => {
    try {
        const { tamilnadu, nearby, others, freeShipping } = req.body;
        if (
            typeof tamilnadu !== 'number' || tamilnadu < 0 ||
            typeof nearby !== 'number' || nearby < 0 ||
            typeof others !== 'number' || others < 0
        ) {
            return res.status(400).json({ error: 'All charges must be non-negative numbers' });
        }

        const doc = await Settings.findOneAndUpdate(
            { key: 'deliveryCharge' },
            { value: { tamilnadu, nearby, others, freeShipping: !!freeShipping } },
            { upsert: true, new: true }
        );
        res.json({ message: 'Delivery charges updated', value: doc.value });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Default price ranges for collection filter
const DEFAULT_PRICE_RANGES = [
    { label: 'Under ₹1,000', min: 0, max: 1000 },
    { label: '₹1,000 - ₹2,500', min: 1000, max: 2500 },
    { label: '₹2,500 - ₹5,000', min: 2500, max: 5000 },
    { label: '₹5,000 - ₹10,000', min: 5000, max: 10000 },
    { label: 'Above ₹10,000', min: 10000, max: 999999 },
];

async function getPriceRangesDoc() {
    let doc = await Settings.findOne({ key: 'priceRanges' });
    if (!doc) {
        doc = await Settings.create({ key: 'priceRanges', value: DEFAULT_PRICE_RANGES });
    }
    return doc;
}

// GET /api/settings/price-ranges — public (used by collections page)
router.get('/price-ranges', async (req, res) => {
    try {
        const doc = await getPriceRangesDoc();
        res.json(doc.value);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// PUT /api/settings/price-ranges — admin only
// Body: [{ label: string, min: number, max: number }, ...]
router.put('/price-ranges', adminOnly, async (req, res) => {
    try {
        const ranges = req.body;
        if (!Array.isArray(ranges) || ranges.length === 0) {
            return res.status(400).json({ error: 'Provide an array of price ranges' });
        }
        const doc = await Settings.findOneAndUpdate(
            { key: 'priceRanges' },
            { value: ranges },
            { upsert: true, new: true }
        );
        res.json({ message: 'Price ranges updated', value: doc.value });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
