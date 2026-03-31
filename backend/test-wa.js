require('dotenv').config();
const { sendWhatsAppTemplate } = require('./utils/whatsapp');

// Dummy order data to simulate a new order
const fakeOrder = {
    _id: "69cbb2cf9ef4de85600764b4",
    shippingAddress: {
        name: "Test User",
        phone: "919345704134",
        address: "123 Test St",
        city: "Test City",
        state: "TS",
        zipCode: "123456"
    },
    items: [
        { name: "Test Saree", quantity: 1, price: 3484 }
    ],
    totalAmount: 3484,
    shippingPrice: 0,
    paymentMethod: "online",
    payment: {
        id: "pay_SXosuZvE25SPzA"
    }
};

const { notifyAdminNewOrder } = require('./utils/whatsapp');

console.log("Testing WhatsApp API...");
notifyAdminNewOrder(fakeOrder).then(() => {
    console.log("Success! Message sent.");
}).catch(err => {
    console.error("Test failed:", err?.response?.data || err.message);
});
