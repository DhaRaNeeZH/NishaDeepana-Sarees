// ================================================================
// Payment Routes — Razorpay integration
// POST /api/payments/create-order  → creates Razorpay order
// POST /api/payments/verify        → verifies payment signature
// ================================================================

const express = require('express');
const router = express.Router();
const Razorpay = require('razorpay');
const crypto = require('crypto');

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// POST /api/payments/create-order
// Body: { amount: 125000 }  (amount in paise — ₹1250 = 125000 paise)
router.post('/create-order', async (req, res) => {
    try {
        const { amount } = req.body;
        if (!amount || amount <= 0) {
            return res.status(400).json({ error: 'Invalid amount' });
        }

        const options = {
            amount: Math.round(amount), // already in paise from frontend
            currency: 'INR',
            receipt: `receipt_${Date.now()}`,
        };

        const order = await razorpay.orders.create(options);
        res.json({
            orderId: order.id,
            amount: order.amount,
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

        // Build the expected signature
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
