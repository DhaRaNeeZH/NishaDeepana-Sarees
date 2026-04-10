const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const { notifyAdminNewOrder, notifyCustomerOrderConfirmed } = require('../utils/whatsapp');

// GET /api/orders — All orders (admin)
router.get('/', async (req, res) => {
    try {
        const { email } = req.query;
        const filter = email ? { email } : {};
        const orders = await Order.find(filter).sort({ createdAt: -1 });
        res.json(orders);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET /api/orders/track/:id — Public tracking (Limited fields)
router.get('/track/:id', async (req, res) => {
    try {
        const order = await Order.findById(req.params.id)
            .select('items subtotal discount shipping total status customerName phone shippingAddress payment.method payment.status createdAt');

        if (!order) return res.status(404).json({ error: 'Order not found' });
        res.json(order);
    } catch (err) {
        res.status(400).json({ error: 'Invalid Order ID format' });
    }
});

// POST /api/orders — Create order (checkout)
router.post('/', async (req, res) => {
    console.log('[ORDER] POST /api/orders called');
    try {
        const order = new Order(req.body);
        const saved = await order.save();
        console.log(`[ORDER] Saved to DB: ${saved._id}`);

        // Send notifications BEFORE responding to ensure Render free tier
        // does not kill the process right after res.json()
        console.log(`[ORDER] Triggering WhatsApp for order ${saved._id}...`);
        try {
            await Promise.race([
                Promise.all([
                    notifyAdminNewOrder(saved),
                    notifyCustomerOrderConfirmed(saved)
                ]),
                new Promise((_, reject) => setTimeout(() => reject(new Error('WhatsApp timeout after 10s')), 10000))
            ]);
            console.log(`[ORDER] WhatsApp DONE for order ${saved._id}`);
        } catch (notifyErr) {
            console.error(`[ORDER] WhatsApp FAILED:`, notifyErr?.message || notifyErr);
        }

        res.status(201).json(saved);
    } catch (err) {
        console.error('[ORDER] Save error:', err);
        if (!res.headersSent) res.status(400).json({ error: err.message });
    }
});

// PATCH /api/orders/:id/status — Update status (admin)
router.patch('/:id/status', async (req, res) => {
    try {
        const { status } = req.body;
        const order = await Order.findByIdAndUpdate(
            req.params.id, { status }, { new: true }
        );
        if (!order) return res.status(404).json({ error: 'Order not found' });
        res.json(order);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// POST /api/orders/:id/cancel — Cancel order
router.post('/:id/cancel', async (req, res) => {
    try {
        const order = await Order.findByIdAndUpdate(
            req.params.id,
            { status: 'cancelled', cancelledAt: new Date() },
            { new: true }
        );
        if (!order) return res.status(404).json({ error: 'Order not found' });
        res.json(order);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST /api/orders/:id/refund — Mark refunded
router.post('/:id/refund', async (req, res) => {
    try {
        // TODO: Trigger Razorpay refund API here
        // const razorpay = new Razorpay({ key_id, key_secret });
        // await razorpay.payments.refund(paymentId, { amount });

        const order = await Order.findByIdAndUpdate(
            req.params.id,
            { status: 'refunded', 'payment.status': 'refunded' },
            { new: true }
        );
        if (!order) return res.status(404).json({ error: 'Order not found' });
        res.json(order);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST /api/orders/:id/notes — Add admin note
router.patch('/:id/notes', async (req, res) => {
    try {
        const { notes } = req.body;
        const order = await Order.findByIdAndUpdate(
            req.params.id, { notes }, { new: true }
        );
        res.json(order);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
