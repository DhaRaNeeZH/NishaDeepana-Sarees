// ================================================================
// Payment Routes — Razorpay integration
// POST /api/payments/create-order  → creates Razorpay order
//   Body: { items: [{ productId, quantity }], deliveryCharge }
//   Server fetches real prices from DB — frontend amount is IGNORED.
// POST /api/payments/verify        → verifies payment signature
// ================================================================

const express = require('express');
const router = express.Router();
const Razorpay = require('razorpay');
const crypto = require('crypto');
const Product = require('../models/Product');

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// POST /api/payments/create-order
// Body: { items: [{ productId: string, quantity: number }], deliveryCharge: number }
// Server calculates total from DB prices — frontend amount is NOT trusted.
router.post('/create-order', async (req, res) => {
    try {
        const { items, deliveryCharge } = req.body;

        if (!items || !Array.isArray(items) || items.length === 0) {
            return res.status(400).json({ error: 'Cart items are required' });
        }

        // Fetch real prices from DB for each product
        const productIds = items.map(i => i.productId);
        const products = await Product.find({ _id: { $in: productIds } }, 'price sellingPrice').lean();

        if (products.length !== productIds.length) {
            return res.status(400).json({ error: 'One or more products not found' });
        }

        // Build a price lookup map
        const priceMap = {};
        for (const p of products) {
            priceMap[String(p._id)] = p.sellingPrice ?? p.price ?? 0;
        }

        // Calculate real subtotal from DB prices
        let subtotal = 0;
        for (const item of items) {
            const unitPrice = priceMap[String(item.productId)];
            if (unitPrice === undefined) {
                return res.status(400).json({ error: `Product ${item.productId} not found` });
            }
            subtotal += unitPrice * (item.quantity || 1);
        }

        // Apply delivery charge (validate it's a non-negative number)
        const shipping = typeof deliveryCharge === 'number' && deliveryCharge >= 0 ? deliveryCharge : 0;
        const totalRupees = subtotal + shipping;
        const totalPaise = Math.round(totalRupees * 100); // Razorpay uses paise

        if (totalPaise <= 0) {
            return res.status(400).json({ error: 'Calculated amount must be greater than 0' });
        }

        const order = await razorpay.orders.create({
            amount: totalPaise,
            currency: 'INR',
            receipt: `receipt_${Date.now()}`,
        });

        res.json({
            orderId: order.id,
            amount: order.amount,       // in paise (verified server-side)
            amountRupees: totalRupees,  // for display
            currency: order.currency,
            key: process.env.RAZORPAY_KEY_ID,
        });
    } catch (err) {
        res.status(500).json({ error: err.message || 'Failed to create payment order' });
    }
});

// POST /api/payments/verify
// Body: { razorpay_order_id, razorpay_payment_id, razorpay_signature }
router.post('/verify', (req, res) => {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

        if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
            return res.status(400).json({ error: 'Missing payment details' });
        }

        // Build the expected HMAC signature
        const body = razorpay_order_id + '|' + razorpay_payment_id;
        const expectedSignature = crypto
            .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
            .update(body)
            .digest('hex');

        if (expectedSignature === razorpay_signature) {
            res.json({ verified: true, paymentId: razorpay_payment_id });
        } else {
            res.status(400).json({ verified: false, error: 'Payment signature mismatch' });
        }
    } catch (err) {
        res.status(500).json({ error: err.message || 'Verification failed' });
    }
});

module.exports = router;
