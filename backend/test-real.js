require('dotenv').config();
const mongoose = require('mongoose');
const Order = require('./models/Order');
const { notifyAdminNewOrder } = require('./utils/whatsapp');

async function resendRealOrder() {
    try {
        console.log("Connecting to Live Database...");
        await mongoose.connect(process.env.MONGO_URI);

        console.log("Fetching order 69cbb2cf9ef4de85600764b4...");
        const realOrder = await Order.findById("69cbb2cf9ef4de85600764b4");

        if (!realOrder) {
            console.error("Order not found in DB! Using manual fallback...");
            // Manual fallback if ID is somehow wrong
            return;
        }

        console.log(`Found real order for ₹${realOrder.totalAmount}. Pushing to WhatsApp...`);

        // Push the real order to the admin!
        await notifyAdminNewOrder(realOrder);
        console.log("Successfully re-sent the REAL order to Mom!");

        mongoose.connection.close();
    } catch (err) {
        console.error("Error resending order:", err);
        mongoose.connection.close();
    }
}

resendRealOrder();
