const mongoose = require('mongoose');

const userDataSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true, lowercase: true },
    cart: { type: mongoose.Schema.Types.Mixed, default: [] },   // array of cart items
    wishlist: { type: [String], default: [] },                       // array of product IDs
}, { timestamps: true });

module.exports = mongoose.model('UserData', userDataSchema);
