require('dotenv').config();
const mongoose = require('mongoose');
const Order = require('./models/Order');
const { notifyCustomerOrderConfirmed } = require('./utils/whatsapp');

async function resendCustomerOrder() {
    try {
        console.log("Connecting to Live Database...");
        await mongoose.connect(process.env.MONGO_URI);

        console.log("Fetching order 69cbb2cf9ef4de85600764b4...");
        const realOrder = await Order.findById("69cbb2cf9ef4de85600764b4");

        if (!realOrder) {
            console.error("Order not found in DB!");
            return;
        }

        console.log(`Found real order for ₹${realOrder.total}. Pushing to WhatsApp Customer...`);

        // Push the real order to the customer!
        await notifyCustomerOrderConfirmed(realOrder);
        console.log("Successfully fired the Customer Confirmation text!");

        mongoose.connection.close();
    } catch (err) {
        console.error("Error resending order to customer:", err);
        mongoose.connection.close();
    }
}

resendCustomerOrder();
