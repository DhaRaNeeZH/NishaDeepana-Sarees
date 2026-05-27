const express = require('express');
const router = express.Router();
const Category = require('../models/Category');
const Product = require('../models/Product');

// GET /api/categories — all categories with live product count
router.get('/', async (req, res) => {
    try {
        const categories = await Category.find().sort({ order: 1, createdAt: 1 });

        // Auto-calculate product count for each category
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

// POST /api/categories — create (admin)
router.post('/', async (req, res) => {
    try {
        const cat = new Category(req.body);
        const saved = await cat.save();
        res.status(201).json(saved);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// PUT /api/categories/:id — update (admin)
router.put('/:id', async (req, res) => {
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

// DELETE /api/categories/:id — delete (admin)
router.delete('/:id', async (req, res) => {
    try {
        const cat = await Category.findByIdAndDelete(req.params.id);
        if (!cat) return res.status(404).json({ error: 'Category not found' });
        res.json({ message: 'Category deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
