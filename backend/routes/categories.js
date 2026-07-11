const express = require('express');
const router = express.Router();
const Category = require('../models/Category');
const Product = require('../models/Product');
const adminOnly = require('../middleware/adminOnly');

// GET /api/categories — public (used on home page + collections filter)
router.get('/', async (req, res) => {
    try {
        const categories = await Category.find().sort({ order: 1, createdAt: 1 });

        const withCounts = await Promise.all(
            categories.map(async (cat) => {
                const count = await Product.countDocuments({ category: cat.name });
                return { ...cat.toObject(), count };
            })
        );

        res.json(withCounts);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST /api/categories — admin only
router.post('/', adminOnly, async (req, res) => {
    try {
        const cat = new Category(req.body);
        const saved = await cat.save();
        res.status(201).json(saved);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// PUT /api/categories/:id — admin only
router.put('/:id', adminOnly, async (req, res) => {
    try {
        const cat = await Category.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );
        if (!cat) return res.status(404).json({ error: 'Category not found' });
        res.json(cat);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// DELETE /api/categories/:id — admin only
router.delete('/:id', adminOnly, async (req, res) => {
    try {
        const cat = await Category.findByIdAndDelete(req.params.id);
        if (!cat) return res.status(404).json({ error: 'Category not found' });
        res.json({ message: 'Category deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
