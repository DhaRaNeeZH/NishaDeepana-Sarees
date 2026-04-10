const axios = require('axios');

/**
 * WhatsApp Notification Service — Meta Cloud API
 */

const WHATSAPP_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN;
const PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;
const API_VERSION = 'v22.0';

async function sendWhatsAppTemplate(to, templateName, parameters = [], languageCode = 'en') {
    try {
        const url = `https://graph.facebook.com/${API_VERSION}/${PHONE_NUMBER_ID}/messages`;

        console.log(`[WhatsApp] Sending ${templateName} to ${to}...`);

        const data = {
            messaging_product: 'whatsapp',
            to: to,
            type: 'template',
            template: {
                name: templateName,
                language: { code: languageCode },
                components: [
                    {
                        type: 'body',
                        parameters: parameters
                    }
                ]
            }
        };

        const response = await axios.post(url, data, {
            headers: {
                'Authorization': `Bearer ${WHATSAPP_TOKEN}`,
                'Content-Type': 'application/json'
            }
        });

        console.log(`[WhatsApp] Message Sent! ID: ${response.data.messages?.[0]?.id}`);
        return { success: true, data: response.data };
    } catch (err) {
        const errorData = err.response?.data || err.message;
        console.error('[WhatsApp] Send Failed:', JSON.stringify(errorData, null, 2));
        return { success: false, error: errorData };
    }
}

/**
 * Notify Admin (Mom) about a new order with FULL DETAILS
 * This matches the requested detailed WhatsApp format
 */
async function notifyAdminNewOrder(order) {
    const adminNumbersStr = process.env.ADMIN_WHATSAPP_NUMBER;
    if (!adminNumbersStr) return;

    // Split by comma to support multiple admin numbers
    const adminNumbers = adminNumbersStr.split(',').map(num => num.trim()).filter(Boolean);

    // Variables:
    // {{1}} Order ID (#ABC123)
    // {{2}} Date (30 Mar 2026)
    // {{3}} Time (6:30 PM)
    // {{4}} Customer Name
    // {{5}} Customer Phone
    // {{6}} Items Summary (Full list)
    // {{7}} Subtotal
    // {{8}} Shipping
    // {{9}} Total
    // {{10}} Method (Online Paid / COD)
    // {{11}} Txn ID
    // {{12}} Full Address
    const now = new Date();
    const dateStr = now.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
    const timeStr = now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });

    const itemsList = (order.items || []).map((item, index) =>
        `${index + 1}. ${item?.productName || 'Item'} × ${item?.quantity || 1} = ₹${item?.totalPrice || 0}`
    ).join('\n') || 'N/A';

    const shortId = order._id.toString().slice(-6).toUpperCase();
    const addr = order.shippingAddress || {};
    const fullAddress = `${addr.street || ''}, ${addr.city || ''}, ${addr.state || ''} - ${addr.pincode || ''}`.trim();

    console.log(`[WA-ADMIN] Building notification for order ${shortId}`);

    const params = [
        { type: 'text', text: shortId },
        { type: 'text', text: dateStr },
        { type: 'text', text: timeStr },
        { type: 'text', text: order.customerName || 'Unknown' },
        { type: 'text', text: order.phone || 'N/A' },
        { type: 'text', text: itemsList.slice(0, 500).replace(/\n/g, ' | ') },
        { type: 'text', text: `₹${order.subtotal || 0}` },
        { type: 'text', text: `₹${order.shipping || 0}` },
        { type: 'text', text: `₹${order.total || 0}` },
        { type: 'text', text: order.payment?.method === 'razorpay' ? 'Razorpay PAID' : 'Cash on Delivery' },
        { type: 'text', text: order.payment?.providerOrderId || order.payment?.transactionId || 'N/A' },
        { type: 'text', text: fullAddress || 'No address' }
    ];

    // Send the notification to ALL listed admin numbers
    const promises = adminNumbers.map(number => sendWhatsAppTemplate(number, 'new_order_admin', params));

    try {
        await Promise.all(promises);
        console.log(`Admin notification success for order ${order._id}`);
    } catch (err) {
        console.error('Admin notification failed:', err);
    }
}

/**
 * Triggered automatically to notify the customer when an order is successful
 */
async function notifyCustomerOrderConfirmed(order) {
    if (!order || !order.phone) return;

    // customer phone could be string with or without country code. Ensure it starts with 91 for India.
    let cleanPhone = order.phone.replace(/\D/g, '');
    if (cleanPhone.length === 10) cleanPhone = '91' + cleanPhone;

    const itemsList = (order.items || []).map(item => `${item?.quantity || 1}x ${item?.productName || 'Item'}`).join(', ') || 'Your order';
    console.log(`[WA-CUSTOMER] Building notification for ${cleanPhone}`);

    const params = [
        { type: 'text', text: (order.customerName || 'Customer').split(' ')[0] },
        { type: 'text', text: order._id.toString().slice(-6).toUpperCase() },
        { type: 'text', text: itemsList.slice(0, 150) },
        { type: 'text', text: `₹${order.total}` },
        { type: 'text', text: `https://nishadeepanasarees.vercel.app/track-order?orderId=${order._id}` }
    ];

    try {
        // Reverting to 'en' as the diagnostic report showed en_US does not exist
        const result = await sendWhatsAppTemplate(cleanPhone, 'order_confirmation_customer', params, 'en');

        const adminNumbersStr = process.env.ADMIN_WHATSAPP_NUMBER;
        const adminNumbers = adminNumbersStr ? adminNumbersStr.split(',').map(num => num.trim()).filter(Boolean) : [];

        if (!result.success) {
            const errorDetails = result.error?.error?.message || JSON.stringify(result.error);
            console.error(`Customer notification failed: ${errorDetails}`);

            // Notify Admin about the specific failure
            const errorParams = [
                { type: 'text', text: order._id.toString().slice(-6).toUpperCase() },
                { type: 'text', text: new Date().toLocaleDateString('en-IN') },
                { type: 'text', text: new Date().toLocaleTimeString('en-IN') },
                { type: 'text', text: '⚠️ AUTO-SEND FAILED' },
                { type: 'text', text: order.phone },
                { type: 'text', text: `META ERROR: ${errorDetails.slice(0, 200)}` },
                { type: 'text', text: '-' }, { type: 'text', text: '-' }, { type: 'text', text: '-' },
                { type: 'text', text: '-' }, { type: 'text', text: '-' }, { type: 'text', text: 'Template/Params mismatch' }
            ];
            adminNumbers.forEach(num => sendWhatsAppTemplate(num, 'new_order_admin', errorParams));
        } else {
            console.log(`Automated Customer WhatsApp sent for order ${order._id}`);
        }
    } catch (err) {
        console.error('Error sending customer confirmation:', err);
    }
}

module.exports = {
    sendWhatsAppTemplate,
    notifyAdminNewOrder,
    notifyCustomerOrderConfirmed
};
