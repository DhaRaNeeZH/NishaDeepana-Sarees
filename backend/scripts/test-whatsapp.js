require('dotenv').config();
const { sendWhatsAppTemplate } = require('../utils/whatsapp');

/**
 * Quick test for WhatsApp API connection using Meta's default hello_world template
 */
async function testConnection() {
    const adminNumber = process.env.ADMIN_WHATSAPP_NUMBER;
    console.log(`Sending test message to ${adminNumber}...`);

    // 'hello_world' is a default template provided by Meta for testing
    // It doesn't need custom parameters
    const result = await sendWhatsAppTemplate(adminNumber, 'hello_world', []);

    if (result.success) {
        console.log('✅ Connection test successful!');
        console.log('Response:', JSON.stringify(result.data, null, 2));
    } else {
        console.log('❌ Connection test failed.');
        console.log('Error:', JSON.stringify(result.error, null, 2));

        if (result.error && result.error.error && result.error.error.code === 190) {
            console.log('\nTIP: Your access token might have expired. Generate a new one in Meta Dashboard.');
        }
    }
}

testConnection();
