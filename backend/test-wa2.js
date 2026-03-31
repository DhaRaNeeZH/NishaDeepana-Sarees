require('dotenv').config();
const { sendWhatsAppTemplate } = require('./utils/whatsapp');

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

const adminNumber = process.env.ADMIN_WHATSAPP_NUMBER;
console.log("Testing WhatsApp API with raw logs...");
console.log("Target number:", adminNumber);

sendWhatsAppTemplate(adminNumber, 'new_order_admin', [
    { type: 'text', text: "TEST_ID" },
    { type: 'text', text: "31 Mar 2026" },
    { type: 'text', text: "PM" },
    { type: 'text', text: "Test Name" },
    { type: 'text', text: "Test Phone" },
    { type: 'text', text: "Test Items" },
    { type: 'text', text: "₹10" },
    { type: 'text', text: "₹0" },
    { type: 'text', text: "₹10" },
    { type: 'text', text: "Razorpay" },
    { type: 'text', text: "TxnID" },
    { type: 'text', text: "Test Address" }
]).then((result) => {
    console.log("RAW RESPONSE DATA:");
    console.dir(result, { depth: null });
}).catch(err => {
    console.error("Test failed:", err);
});
