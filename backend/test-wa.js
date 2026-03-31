require('dotenv').config();
const { sendWhatsAppTemplate } = require('./utils/whatsapp');

// Targeting Mom's phone which just opted-in
const adminNumber = process.env.ADMIN_WHATSAPP_NUMBER;

console.log("Testing actual order template delivery to Mom's open line:", adminNumber);

sendWhatsAppTemplate(adminNumber, 'new_order_admin', [
    { type: 'text', text: "TEST_MOM" },
    { type: 'text', text: "31 Mar 2026" },
    { type: 'text', text: "PM" },
    { type: 'text', text: "Pooja Kumar" },
    { type: 'text', text: "919000000000" },
    { type: 'text', text: "1. Kanchipuram Silk × 1 = ₹8000" },
    { type: 'text', text: "₹8000" },
    { type: 'text', text: "₹0" },
    { type: 'text', text: "₹8000" },
    { type: 'text', text: "Razorpay" },
    { type: 'text', text: "pay_XYZ12345" },
    { type: 'text', text: "Mom Test Address" }
]).then((result) => {
    console.log("TEMPLATE RESPONSE:");
    console.dir(result, { depth: null });
}).catch(err => {
    console.error("Test failed:", err);
});
