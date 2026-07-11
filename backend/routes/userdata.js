const express = require('express');
const router = express.Router();
const UserData = require('../models/UserData');
const requireAuth = require('../middleware/requireAuth');

// All userdata routes require a valid login token.
// The server also enforces that users can only access their OWN data.
// A logged-in user cannot read or modify another user's cart/wishlist.

function checkOwnership(req, res, next) {
    const tokenEmail = req.user?.email?.toLowerCase();
    const paramEmail = req.params.email?.toLowerCase();
    if (tokenEmail !== paramEmail) {
        return res.status(403).json({ error: 'Access denied: you can only access your own data' });
    }
    next();
}

// GET /api/userdata/:email — Load user's cart + wishlist (own data only)
router.get('/:email', requireAuth, checkOwnership, async (req, res) => {
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

// PUT /api/userdata/:email/cart — Save cart (own data only)
router.put('/:email/cart', requireAuth, checkOwnership, async (req, res) => {
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

// PUT /api/userdata/:email/wishlist — Save wishlist (own data only)
router.put('/:email/wishlist', requireAuth, checkOwnership, async (req, res) => {
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
