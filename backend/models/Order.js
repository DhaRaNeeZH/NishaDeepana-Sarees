const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
    productId: { type: String, required: true },
    productName: { type: String, required: true },
    image: { type: String }, // Snapshot of product image at time of purchase
    quantity: { type: Number, required: true },
    basePrice: { type: Number, required: true },
    unitPrice: { type: Number, required: true },
    totalPrice: { type: Number, required: true },
    selectedBlouse: {
        kind: { type: String, default: 'none' },
        price: { type: Number, default: 0 },
    },
});

const orderSchema = new mongoose.Schema({
    items: [orderItemSchema],
    subtotal: { type: Number, required: true },
    discount: { type: Number, default: 0 },
    shipping: { type: Number, default: 0 },
    total: { type: Number, required: true },
    status: {
        type: String,
        enum: ['pending', 'paid', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'],
        default: 'pending',
    },
    payment: {
        method: { type: String, enum: ['cod', 'mock_pay', 'razorpay'], default: 'cod' },
        status: { type: String, enum: ['pending', 'paid', 'refunded'], default: 'pending' },
        providerOrderId: { type: String }, // Razorpay order ID (order_xxx)
        transactionId: { type: String },   // Razorpay payment ID (pay_xxx)
        paidAt: { type: Date },
    },
    customerName: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    shippingAddress: {
        street: String,
        city: String,
        state: String,
        pincode: String,
    },
    notes: { type: String, default: '' },
    cancelledAt: { type: Date },
    notificationLog: { type: String, default: '' },
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);
