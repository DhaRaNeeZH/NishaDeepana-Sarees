const { Resend } = require('resend');

/**
 * Initialize Resend with API Key
 */
function getResendClient() {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.error('[EMAIL] RESEND_API_KEY not set in .env');
    return null;
  }
  return new Resend(apiKey);
}

/**
 * Send a rich HTML order alert email to mom using Resend API (HTTP)
 * This bypasses SMTP blocks and IPv6/IPv4 raw socket issues.
 */
async function sendMomOrderEmail({ order, customerPhone, trackingUrl }) {
  const momEmail = process.env.MOM_EMAIL;
  if (!momEmail) {
    console.error('[EMAIL] MOM_EMAIL not set in .env');
    return;
  }

  const resend = getResendClient();
  if (!resend) return;

  const itemsList = order.items
    .map(i => `<tr>
            <td style="padding:6px 12px;border-bottom:1px solid #eee;">${i.productName}</td>
            <td style="padding:6px 12px;border-bottom:1px solid #eee;text-align:center;">${i.quantity}</td>
            <td style="padding:6px 12px;border-bottom:1px solid #eee;text-align:right;">₹${i.totalPrice}</td>
        </tr>`)
    .join('');

  const itemsText = order.items.map(i => `${i.productName} x${i.quantity}`).join(', ');

  // WhatsApp magic link — clicking this opens WhatsApp with pre-written message to customer
  const waMessage = encodeURIComponent(
    `🎉 *NishaDeepana Sarees*\n\nDear ${order.customerName},\n\nYour order has been confirmed! ✅\n\nOrder ID: ${order._id}\nItems: ${itemsText}\nTotal: ₹${order.total}\n\n📦 Track your order:\n${trackingUrl}\n\nThank you for shopping with us! 🙏\n- NishaDeepana Sarees`
  );
  const cleanPhone = String(customerPhone).replace(/\D/g, '').slice(-10);
  const magicLink = `https://wa.me/91${cleanPhone}?text=${waMessage}`;

  const paymentBadge = order.payment?.status === 'paid'
    ? `<span style="background:#22c55e;color:#fff;padding:3px 10px;border-radius:20px;font-size:13px;">PAID ✅</span>`
    : `<span style="background:#f59e0b;color:#fff;padding:3px 10px;border-radius:20px;font-size:13px;">COD 💵</span>`;

  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background:#f5f5f5;font-family:Arial,sans-serif;">
  <div style="max-width:560px;margin:30px auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.1);">

    <!-- Header -->
    <div style="background:#7B1C2E;padding:24px 30px;text-align:center;">
      <h1 style="color:#fff;margin:0;font-size:22px;">🛒 New Order Received!</h1>
      <p style="color:#f5c6d0;margin:6px 0 0;">NishaDeepana Sarees</p>
    </div>

    <!-- Body -->
    <div style="padding:24px 30px;">

      <!-- Order Meta -->
      <div style="background:#fdf2f4;border-left:4px solid #7B1C2E;padding:12px 16px;border-radius:4px;margin-bottom:20px;">
        <p style="margin:0;font-size:14px;color:#555;">Order ID: <strong>${order._id}</strong></p>
        <p style="margin:4px 0 0;font-size:14px;color:#555;">Payment: ${paymentBadge}</p>
      </div>

      <!-- Customer Info -->
      <h3 style="color:#7B1C2E;border-bottom:2px solid #fdf2f4;padding-bottom:6px;">👤 Customer Details</h3>
      <p style="margin:4px 0;"><strong>Name:</strong> ${order.customerName}</p>
      <p style="margin:4px 0;"><strong>Phone:</strong> ${customerPhone}</p>
      <p style="margin:4px 0;"><strong>Email:</strong> ${order.email || '—'}</p>
      <p style="margin:4px 0;"><strong>Address:</strong> ${order.shippingAddress?.street}, ${order.shippingAddress?.city}, ${order.shippingAddress?.state} - ${order.shippingAddress?.pincode}</p>

      <!-- Items Table -->
      <h3 style="color:#7B1C2E;border-bottom:2px solid #fdf2f4;padding-bottom:6px;margin-top:20px;">🛍️ Items Ordered</h3>
      <table style="width:100%;border-collapse:collapse;font-size:14px;">
        <thead>
          <tr style="background:#7B1C2E;color:#fff;">
            <th style="padding:8px 12px;text-align:left;">Product</th>
            <th style="padding:8px 12px;text-align:center;">Qty</th>
            <th style="padding:8px 12px;text-align:right;">Price</th>
          </tr>
        </thead>
        <tbody>${itemsList}</tbody>
      </table>

      <!-- Totals -->
      <div style="margin-top:16px;text-align:right;font-size:14px;">
        <p style="margin:4px 0;">Subtotal: ₹${order.subtotal}</p>
        ${order.discount > 0 ? `<p style="margin:4px 0;color:#16a34a;">Discount: -₹${order.discount}</p>` : ''}
        <p style="margin:4px 0;">Shipping: ₹${order.shipping}</p>
        <p style="margin:4px 0;font-size:18px;font-weight:bold;color:#7B1C2E;">Total: ₹${order.total}</p>
      </div>

      <!-- WhatsApp Magic Button -->
      <div style="margin-top:28px;text-align:center;">
        <p style="color:#555;font-size:14px;margin-bottom:12px;">Tap below to send WhatsApp confirmation to customer 👇</p>
        <a href="${magicLink}"
           style="display:inline-block;background:#25D366;color:#fff;text-decoration:none;padding:14px 32px;border-radius:50px;font-size:16px;font-weight:bold;">
          📲 Send WhatsApp to Customer
        </a>
      </div>

      <!-- Track Link -->
      <div style="margin-top:20px;text-align:center;">
        <a href="${trackingUrl}" style="color:#7B1C2E;font-size:13px;">View Order Tracking Page →</a>
      </div>
    </div>

    <!-- Footer -->
    <div style="background:#f9f9f9;padding:16px 30px;text-align:center;border-top:1px solid #eee;">
      <p style="margin:0;font-size:12px;color:#999;">NishaDeepana Sarees · Automated Order Alert</p>
    </div>
  </div>
</body>
</html>`;

  try {
    const { data, error } = await resend.emails.send({
      from: 'NishaDeepana Sarees <orders@nishadeepanasarees.in>',
      to: [momEmail],
      subject: `🛒 NEW ORDER — ${order.customerName} · ₹${order.total}`,
      html: html,
    });

    if (error) {
      console.error('[EMAIL] Resend Error:', error);
      throw new Error(error.message);
    }

    console.log(`[EMAIL] Order alert sent to mom via Resend: ${data.id}`);
    return data.id;
  } catch (err) {
    console.error('[EMAIL] Failed to send via Resend:', err.message);
    throw err;
  }
}

module.exports = { sendMomOrderEmail };
