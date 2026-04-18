const axios = require('axios');

const API_VERSION = 'v22.0';

/**
 * Core function — reads env vars fresh at call time (not at module load).
 * This prevents "undefined token" bugs on Render cold starts.
 * Returns { success: true, msgId } or { success: false, error: string }
 */
async function sendWhatsAppTemplate(to, templateName, parameters = [], languageCode = 'en') {
    const token = process.env.WHATSAPP_ACCESS_TOKEN;
    const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;

    if (!token || !phoneNumberId) {
        const err = `Missing env vars — TOKEN: ${!!token}, PHONE_ID: ${!!phoneNumberId}`;
        console.error('[WhatsApp]', err);
        return { success: false, error: err };
    }

    const url = `https://graph.facebook.com/${API_VERSION}/${phoneNumberId}/messages`;
    const body = {
        messaging_product: 'whatsapp',
        to,
        type: 'template',
        template: {
            name: templateName,
            language: { code: languageCode },
            components: [{ type: 'body', parameters }]
        }
    };

    try {
        console.log(`[WhatsApp] Sending "${templateName}" to ${to}`);
        const res = await axios.post(url, body, {
            headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
            timeout: 8000
        });
        const msgId = res.data?.messages?.[0]?.id || 'no-id';
        console.log(`[WhatsApp] ✅ Accepted by Meta. msgId=${msgId}`);
        return { success: true, msgId };
    } catch (err) {
        const detail = err.response?.data?.error?.message || err.message;
        console.error(`[WhatsApp] ❌ Meta rejected: ${detail}`);
        return { success: false, error: detail };
    }
}

/**
 * Sends admin (Mom) order notification.
 * Returns a result string for notificationLog.
 */
async function notifyAdminNewOrder(order) {
    const adminNum = process.env.ADMIN_WHATSAPP_NUMBER;
    if (!adminNum) return 'ADMIN_SKIPPED(no number)';

    const now = new Date();
    const dateStr = now.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'Asia/Kolkata' });
    const timeStr = now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Kolkata' });
    const shortId = order._id.toString().slice(-6).toUpperCase();
    const addr = order.shippingAddress || {};
    const fullAddress = `${addr.street || ''}, ${addr.city || ''}, ${addr.state || ''} - ${addr.pincode || ''}`.trim() || 'No address';
    const itemsList = (order.items || [])
        .map((item, i) => `${i + 1}. ${item?.productName || 'Item'} x${item?.quantity || 1} = Rs.${item?.totalPrice || 0}`)
        .join(' | ') || 'N/A';

    const params = [
        { type: 'text', text: shortId },
        { type: 'text', text: dateStr },
        { type: 'text', text: timeStr },
        { type: 'text', text: order.customerName || 'Unknown' },
        { type: 'text', text: order.phone || 'N/A' },
        { type: 'text', text: itemsList.slice(0, 500) },
        { type: 'text', text: `Rs.${order.subtotal || 0}` },
        { type: 'text', text: `Rs.${order.shipping || 0}` },
        { type: 'text', text: `Rs.${order.total || 0}` },
        { type: 'text', text: order.payment?.method === 'razorpay' ? 'Razorpay PAID' : 'Cash on Delivery' },
        { type: 'text', text: order.payment?.providerOrderId || 'N/A' },
        { type: 'text', text: fullAddress }
    ];

    const numbers = adminNum.split(',').map(n => n.trim()).filter(Boolean);
    const results = await Promise.all(numbers.map(n => sendWhatsAppTemplate(n, 'new_order_admin', params)));
    const ok = results.every(r => r.success);
    return ok ? 'ADMIN_OK' : `ADMIN_FAIL(${results.map(r => r.error).join('; ')})`;
}

/**
 * Sends customer order confirmation.
 * Returns a result string for notificationLog.
 */
async function notifyCustomerOrderConfirmed(order) {
    if (!order?.phone) return 'CUSTOMER_SKIPPED(no phone)';

    let cleanPhone = order.phone.replace(/\D/g, '');
    if (cleanPhone.length === 10) cleanPhone = '91' + cleanPhone;

    if (cleanPhone.length !== 12) {
        return `CUSTOMER_SKIPPED(invalid phone: ${order.phone})`;
    }

    const shortId = order._id.toString().slice(-6).toUpperCase();
    const itemsList = (order.items || []).map(item => `${item?.quantity || 1}x ${item?.productName || 'Item'}`).join(', ') || 'Your order';

    const params = [
        { type: 'text', text: (order.customerName || 'Customer').split(' ')[0] },
        { type: 'text', text: shortId },
        { type: 'text', text: itemsList.slice(0, 150) },
        { type: 'text', text: `Rs.${order.total || 0}` },
        { type: 'text', text: `https://nishadeepanasarees.vercel.app/track-order?orderId=${order._id}` }
    ];

    const result = await sendWhatsAppTemplate(cleanPhone, 'order_confirmation_customer', params, 'en');
    return result.success ? `CUSTOMER_OK(${cleanPhone})` : `CUSTOMER_FAIL(${result.error})`;
}

module.exports = { sendWhatsAppTemplate, notifyAdminNewOrder, notifyCustomerOrderConfirmed };
