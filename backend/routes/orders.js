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
    try {
        const order = new Order(req.body);
        const saved = await order.save();

        // Trigger WhatsApp notifications (async, don't wait for them to finish)
        notifyAdminNewOrder(saved).catch(err => console.error('Admin notification failed:', err));
        notifyCustomerOrderConfirmed(saved).catch(err => console.error('Customer notification failed:', err));

        res.status(201).json(saved);
    } catch (err) {
        console.error('Order saving error:', err);
        res.status(400).json({ error: err.message });
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

// GET /api/orders/debug-whatsapp — Diagnostic tool
router.get('/debug-whatsapp-check', async (req, res) => {
    try {
        const { sendWhatsAppTemplate } = require('../utils/whatsapp');
        const adminNumber = process.env.ADMIN_WHATSAPP_NUMBER?.split(',')[0];

        if (!adminNumber) return res.json({ error: 'ADMIN_WHATSAPP_NUMBER not set' });

        const testParams = [
            { type: 'text', text: 'DEBUG123' },
            { type: 'text', text: 'Diagnostic' },
            { type: 'text', text: 'Test' },
            { type: 'text', text: 'ADMIN' },
            { type: 'text', text: '919500384237' },
            { type: 'text', text: 'TEST ITEMS' },
            { type: 'text', text: '0' }, { type: 'text', text: '0' }, { type: 'text', text: '0' },
            { type: 'text', text: 'TEST' }, { type: 'text', text: 'TEST' }, { type: 'text', text: 'DIAGNOSTIC TEST' }
        ];

        const result = await sendWhatsAppTemplate(adminNumber, 'new_order_admin', testParams);
        res.json({
            message: 'Diagnostic test triggered',
            config: {
                token_prefix: process.env.WHATSAPP_ACCESS_TOKEN?.slice(0, 10),
                phone_id: process.env.WHATSAPP_PHONE_NUMBER_ID,
                admin_num: adminNumber
            },
            result
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
