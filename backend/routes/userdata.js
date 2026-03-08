const express = require('express');
const router = express.Router();
const UserData = require('../models/UserData');

// GET /api/userdata/:email — Load user's cart + wishlist
router.get('/:email', async (req, res) => {
    try {
        const email = req.params.email.toLowerCase();
        let data = await UserData.findOne({ email });
        if (!data) {
            data = { email, cart: [], wishlist: [] };
        }
        res.json({ cart: data.cart, wishlist: data.wishlist });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// PUT /api/userdata/:email/cart — Save cart
router.put('/:email/cart', async (req, res) => {
    try {
        const email = req.params.email.toLowerCase();
        const { cart } = req.body;
        const data = await UserData.findOneAndUpdate(
            { email },
            { cart },
            { upsert: true, new: true }
        );
        res.json({ cart: data.cart });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// PUT /api/userdata/:email/wishlist — Save wishlist
router.put('/:email/wishlist', async (req, res) => {
    try {
        const email = req.params.email.toLowerCase();
        const { wishlist } = req.body;
        const data = await UserData.findOneAndUpdate(
            { email },
            { wishlist },
            { upsert: true, new: true }
        );
        res.json({ wishlist: data.wishlist });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
