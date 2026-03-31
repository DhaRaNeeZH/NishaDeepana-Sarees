const axios = require('axios');

/**
 * WhatsApp Notification Service — Meta Cloud API
 */

const WHATSAPP_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN;
const PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;
const API_VERSION = 'v22.0';

/**
 * Sends a WhatsApp message using a defined template
 * @param {string} to - Recipient phone number with country code (e.g. "919500384237")
 * @param {string} templateName - The name of the approved template in Meta Dashboard
 * @param {Array} parameters - Array of components/parameters for the template
 */
async function sendWhatsAppTemplate(to, templateName, parameters = []) {
    try {
        const url = `https://graph.facebook.com/${API_VERSION}/${PHONE_NUMBER_ID}/messages`;

        const data = {
            messaging_product: 'whatsapp',
            to: to,
            type: 'template',
            template: {
                name: templateName,
                language: { code: 'en' },
                components: [
                    {
                        type: 'body',
                        parameters: parameters
                    }
                ]
            }
        };

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${WHATSAPP_TOKEN}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });

        const result = await response.json();

        if (!response.ok) {
            console.error('WhatsApp API Error:', result);
            return { success: false, error: result };
        }

        console.log(`WhatsApp message sent to ${to} using template ${templateName}`);
        return { success: true, data: result };
    } catch (err) {
        console.error('WhatsApp Service Error:', err);
        return { success: false, error: err.message };
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

    const itemsList = order.items.map((item, index) =>
        `${index + 1}. ${item.productName} × ${item.quantity} = ₹${item.totalPrice}`
    ).join('\n');

    const fullAddress = `${order.shippingAddress.street}, ${order.shippingAddress.city}, ${order.shippingAddress.state} - ${order.shippingAddress.pincode}`.trim();

    const params = [
        { type: 'text', text: order._id.toString().slice(-6).toUpperCase() },
        { type: 'text', text: dateStr },
        { type: 'text', text: timeStr },
        { type: 'text', text: order.customerName },
        { type: 'text', text: order.phone },
        { type: 'text', text: itemsList.slice(0, 500) },
        { type: 'text', text: `₹${order.subtotal}` },
        { type: 'text', text: `₹${order.shipping || 0}` },
        { type: 'text', text: `₹${order.total}` },
        { type: 'text', text: order.payment?.method === 'razorpay' ? 'Razorpay ✅ PAID' : 'Cash on Delivery 📄' },
        { type: 'text', text: order.payment?.providerOrderId || order.payment?.id || 'N/A' },
        { type: 'text', text: fullAddress.slice(0, 200) }
    ];

    // Send the notification to ALL listed admin numbers concurrently
    const promises = adminNumbers.map(number => sendWhatsAppTemplate(number, 'new_order_admin', params));

    try {
        await Promise.all(promises);
        console.log(`Admin group notification success for order ${order._id}`);
    } catch (err) {
        throw err; // Let the caller catch it
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

    const itemsList = order.items.map(item => `${item.quantity}x ${item.productName}`).join(', ');

    const params = [
        { type: 'text', text: order.customerName.split(' ')[0] || 'Customer' },
        { type: 'text', text: order._id.toString().slice(-6).toUpperCase() },
        { type: 'text', text: itemsList.slice(0, 150) },
        { type: 'text', text: `₹${order.total}` },
        { type: 'text', text: `https://nishadeepanasarees.vercel.app/track-order` }
    ];

    try {
        await sendWhatsAppTemplate(cleanPhone, 'order_confirmation_customer', params);
    } catch (err) {
        console.error('Error sending customer confirmation:', err);
    }
}

module.exports = {
    sendWhatsAppTemplate,
    notifyAdminNewOrder,
    notifyCustomerOrderConfirmed
};
