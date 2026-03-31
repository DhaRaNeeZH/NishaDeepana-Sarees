require('dotenv').config();
const { sendWhatsAppTemplate } = require('./utils/whatsapp');

const adminNumber = process.env.ADMIN_WHATSAPP_NUMBER;
console.log("Sending fallback 'hello_world' template to force open the line...");

sendWhatsAppTemplate(adminNumber, 'hello_world', []).then((result) => {
    console.log("RAW RESPONSE DATA:");
    console.dir(result, { depth: null });
}).catch(err => {
    console.error("Test failed:", err);
});
