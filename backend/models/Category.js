const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema(
    {
        name: { type: String, required: true, unique: true, trim: true },
        image: { type: String, default: '' },
        visible: { type: Boolean, default: true }, // show in homepage "Shop by Category"
        order: { type: Number, default: 0 },        // display order
    },
    { timestamps: true }
);

module.exports = mongoose.model('Category', categorySchema);
