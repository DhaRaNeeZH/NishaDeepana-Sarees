const axios = require('axios');

const FAST2SMS_API = 'https://www.fast2sms.com/dev/bulkV2';

/**
 * Send SMS via Fast2SMS Quick route (no DLT needed)
 * @param {string} number - 10-digit Indian mobile number (no +91)
 * @param {string} message - SMS message text
 */
async function sendSMS(number, message) {
    const apiKey = process.env.FAST2SMS_API_KEY;
    if (!apiKey) {
        console.error('[SMS] FAST2SMS_API_KEY not set in .env');
        return;
    }

    // Strip +91 or 91 prefix if present, keep only 10 digits
    const cleanNumber = String(number).replace(/^\+?91/, '').replace(/\D/g, '').slice(-10);

    try {
        const response = await axios.get(FAST2SMS_API, {
            params: {
                authorization: apiKey,
                route: 'q',          // Quick route - no DLT needed
                message,
                numbers: cleanNumber,
                flash: 0,
            },
            timeout: 10000,
        });
        console.log(`[SMS] Sent to ${cleanNumber}:`, response.data);
        return response.data;
    } catch (err) {
        console.error('[SMS] Failed to send:', err?.response?.data || err.message);
    }
}

/**
 * Send order alert SMS to mom with WhatsApp magic link
 * Clicking the link opens WhatsApp with a pre-written customer message
 */
async function sendMomAlert({ order, customerPhone, trackingUrl }) {
    const momNumber = process.env.MOM_PHONE_NUMBER;
    if (!momNumber) {
        console.error('[SMS] MOM_PHONE_NUMBER not set');
        return;
    }

    const itemsList = order.items
        .map(i => `${i.productName} x${i.quantity}`)
        .join(', ');

    // Pre-written WhatsApp message mom will send to customer
    const whatsappText = encodeURIComponent(
        `🎉 *NishaDeepana Sarees*\n\nDear ${order.customerName},\n\nYour order has been confirmed! ✅\n\nOrder ID: ${order._id}\nItems: ${itemsList}\nTotal: ₹${order.total}\n\n📦 Track your order:\n${trackingUrl}\n\nThank you for shopping with us! 🙏\n- NishaDeepana Sarees`
    );

    const magicLink = `https://wa.me/91${customerPhone.replace(/\D/g, '').slice(-10)}?text=${whatsappText}`;

    const message =
        `🛒 NEW ORDER!\n` +
        `Customer: ${order.customerName}\n` +
        `Phone: ${customerPhone}\n` +
        `Items: ${itemsList}\n` +
        `Amount: Rs.${order.total} (${order.payment?.status === 'paid' ? 'PAID' : 'COD'})\n` +
        `City: ${order.shippingAddress?.city}\n\n` +
        `Send WhatsApp to customer:\n${magicLink}`;

    return sendSMS(momNumber, message);
}

/**
 * Send order confirmation SMS directly to customer
 */
async function sendCustomerSMS({ order, trackingUrl }) {
    const phone = order.phone;
    if (!phone) return;

    const itemsList = order.items
        .map(i => `${i.productName} x${i.quantity}`)
        .join(', ');

    const message =
        `NishaDeepana Sarees: Hi ${order.customerName}! ` +
        `Your order is confirmed. ` +
        `Items: ${itemsList}. ` +
        `Total: Rs.${order.total}. ` +
        `Track: ${trackingUrl}. Thank you!`;

    return sendSMS(phone, message);
}

module.exports = { sendSMS, sendMomAlert, sendCustomerSMS };
