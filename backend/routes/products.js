const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const Order = require('../models/Order');
const adminOnly = require('../middleware/adminOnly');

// GET /api/products/best-selling-ids — public (used on home page)
router.get('/best-selling-ids', async (req, res) => {
    try {
        const orders = await Order.find(
            { status: { $nin: ['cancelled', 'refunded'] } },
            'items'
        ).lean();

        const salesMap = {};
        for (const order of orders) {
            for (const item of order.items) {
                salesMap[item.productId] = (salesMap[item.productId] || 0) + (item.quantity || 1);
            }
        }

        const sorted = Object.entries(salesMap)
            .sort((a, b) => b[1] - a[1])
            .map(([productId, count]) => ({ productId, count }));

        res.json(sorted);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET /api/products — public (customers browse)
router.get('/', async (req, res) => {
    try {
        const products = await Product.find().sort({ createdAt: -1 });
        res.json(products);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET /api/products/:id — public (product detail page)
router.get('/:id', async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) return res.status(404).json({ error: 'Product not found' });
        res.json(product);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST /api/products — admin only
router.post('/', adminOnly, async (req, res) => {
    try {
        const product = new Product(req.body);
        const saved = await product.save();
        res.status(201).json(saved);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// PUT /api/products/:id — admin only
router.put('/:id', adminOnly, async (req, res) => {
    try {
        const product = await Product.findByIdAndUpdate(
            req.params.id, req.body, { new: true, runValidators: true }
        );
        if (!product) return res.status(404).json({ error: 'Product not found' });
        res.json(product);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// DELETE /api/products/:id — admin only
router.delete('/:id', adminOnly, async (req, res) => {
    try {
        const product = await Product.findByIdAndDelete(req.params.id);
        if (!product) return res.status(404).json({ error: 'Product not found' });
        res.json({ message: 'Product deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
