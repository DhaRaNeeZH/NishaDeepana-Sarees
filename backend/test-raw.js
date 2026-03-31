require('dotenv').config();

const WHATSAPP_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN;
const PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;
const API_VERSION = 'v22.0';

// Targeted at the user's phone, since they sent the 'hi' message from it.
const targetNumber = '919345704134';

async function sendRawText() {
    console.log("Sending raw free-form text message to:", targetNumber);
    const url = `https://graph.facebook.com/${API_VERSION}/${PHONE_NUMBER_ID}/messages`;

    const data = {
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to: targetNumber,
        type: 'text',
        text: {
            preview_url: false,
            body: "AUTOMATED TEST: This is a raw text bypassing templates. If you are reading this, the routing connection is 100% PERFECT! 🚀"
        }
    };

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${WHATSAPP_TOKEN}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });
        const result = await response.json();
        console.log("RAW TEXT RESPONSE:");
        console.dir(result, { depth: null });
    } catch (err) {
        console.error("Fetch failed:", err);
    }
}

sendRawText();
