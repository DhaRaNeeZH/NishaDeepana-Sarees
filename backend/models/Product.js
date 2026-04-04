const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: { type: String, required: true },
    price: { type: Number, required: true },
    originalPrice: { type: Number },
    freeDelivery: { type: Boolean, default: false },
    category: { type: String, required: true },
    sareeType: { type: String, required: true },
    fabric: { type: String, required: true },
    color: { type: String, default: '' },
    blouseIncluded: { type: String, enum: ['running', 'contrast', 'matching', 'none'], default: 'running' },
    image: { type: String, required: true },
    images: { type: [String], default: [] },
    description: { type: String, default: '' },
    featured: { type: Boolean, default: false },
    madeToOrder: { type: Boolean, default: false },
    inStock: { type: Boolean, default: true },
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);
