const PptxGenJS = require('./saree-splendor/node_modules/pptxgenjs');

const pptx = new PptxGenJS();
pptx.layout = 'LAYOUT_WIDE'; // 13.33" x 7.5"

// ── Brand Colors ─────────────────────────────────
const MAROON = '7B1C2E';
const GOLD = 'C9A84C';
const CREAM = 'FDF6EC';
const WHITE = 'FFFFFF';
const DARK = '1A1A2E';
const LGRAY = 'F3F4F6';
const MGRAY = '6B7280';

// ── Helpers ───────────────────────────────────────
function addBg(slide, color) {
    slide.addShape(pptx.ShapeType.rect, { x: 0, y: 0, w: '100%', h: '100%', fill: { color } });
}

function addAccentBar(slide, x, y, w, h, color) {
    slide.addShape(pptx.ShapeType.rect, { x, y, w, h, fill: { color }, line: { color, width: 0 } });
}

function heading(slide, text, y, color = MAROON, size = 32) {
    slide.addText(text, { x: 0.5, y, w: 12.3, h: 0.7, fontSize: size, bold: true, color, fontFace: 'Georgia' });
}

function sub(slide, text, y, color = MGRAY, size = 17) {
    slide.addText(text, { x: 0.5, y, w: 12.3, h: 0.45, fontSize: size, color, fontFace: 'Calibri' });
}

function bullet(slide, items, x, y, w, color = DARK) {
    const bullets = items.map(t => ({ text: t, options: { bullet: { code: '2714', color: GOLD }, fontSize: 15, color, breakLine: true, paraSpaceAfter: 6 } }));
    slide.addText(bullets, { x, y, w, h: 4, fontFace: 'Calibri', valign: 'top' });
}

function card(slide, x, y, w, h, title, titleColor, body, bgColor = WHITE) {
    // Card shadow
    slide.addShape(pptx.ShapeType.rect, { x: x + 0.04, y: y + 0.04, w, h, fill: { color: 'D1D5DB' }, line: { color: 'D1D5DB', width: 0 } });
    // Card bg
    slide.addShape(pptx.ShapeType.rect, { x, y, w, h, fill: { color: bgColor }, line: { color: 'E5E7EB', width: 1 }, rectRadius: 0.1 });
    // Title bar
    slide.addShape(pptx.ShapeType.rect, { x, y, w, h: 0.45, fill: { color: titleColor }, line: { color: titleColor, width: 0 } });
    slide.addText(title, { x: x + 0.15, y: y + 0.06, w: w - 0.3, h: 0.35, fontSize: 14, bold: true, color: WHITE, fontFace: 'Georgia' });
    slide.addText(body, { x: x + 0.12, y: y + 0.52, w: w - 0.24, h: h - 0.6, fontSize: 12.5, color: DARK, fontFace: 'Calibri', valign: 'top', breakLine: true });
}

// ═══════════════════════════════════════════════
// SLIDE 1 — TITLE
// ═══════════════════════════════════════════════
{
    const s = pptx.addSlide();
    // Full maroon background
    addBg(s, MAROON);
    // Gold decorative bars
    s.addShape(pptx.ShapeType.rect, { x: 0, y: 0, w: 0.18, h: '100%', fill: { color: GOLD } });
    s.addShape(pptx.ShapeType.rect, { x: 13.15, y: 0, w: 0.18, h: '100%', fill: { color: GOLD } });
    s.addShape(pptx.ShapeType.rect, { x: 0, y: 6.8, w: '100%', h: 0.18, fill: { color: GOLD } });

    // Logo / brand name
    s.addText('NishaDeepana', { x: 0.5, y: 1.4, w: 12, h: 1.1, fontSize: 54, bold: true, color: GOLD, fontFace: 'Georgia', align: 'center' });
    s.addText('SAREES', { x: 0.5, y: 2.45, w: 12, h: 0.7, fontSize: 28, bold: false, color: WHITE, fontFace: 'Calibri', align: 'center', charSpacing: 8 });

    // Divider
    s.addShape(pptx.ShapeType.rect, { x: 3.5, y: 3.3, w: 6.3, h: 0.04, fill: { color: GOLD } });

    s.addText('Full-Stack E-Commerce Platform', { x: 0.5, y: 3.55, w: 12, h: 0.55, fontSize: 20, color: CREAM, fontFace: 'Calibri', align: 'center', italic: true });
    s.addText('Feature Implementation Presentation', { x: 0.5, y: 4.15, w: 12, h: 0.45, fontSize: 16, color: GOLD, fontFace: 'Calibri', align: 'center' });

    s.addText('React + TypeScript  •  Node.js + Express  •  MongoDB Atlas', {
        x: 0.5, y: 5.4, w: 12, h: 0.38, fontSize: 13, color: 'C0B0B0', fontFace: 'Calibri', align: 'center'
    });

    s.addText('February 2026', { x: 0.5, y: 6.5, w: 12, h: 0.3, fontSize: 12, color: GOLD, fontFace: 'Calibri', align: 'center' });
}

// ═══════════════════════════════════════════════
// SLIDE 2 — TECH STACK
// ═══════════════════════════════════════════════
{
    const s = pptx.addSlide();
    addBg(s, CREAM);
    addAccentBar(s, 0, 0, '100%', 0.08, MAROON);
    addAccentBar(s, 0, 0.08, '100%', 0.55, DARK);
    s.addText('Technology Stack', { x: 0.5, y: 0.1, w: 12, h: 0.5, fontSize: 26, bold: true, color: GOLD, fontFace: 'Georgia' });

    const cols = [
        { title: '⚛  Frontend', color: MAROON, items: 'React 18 + TypeScript\nVite Build Tool\nTailwind CSS\nReact Router v6\nContext API\nLucide Icons\nShadcn/UI Components' },
        { title: '🟢  Backend', color: '16A34A', items: 'Node.js + Express.js\nMongoDB Atlas (Cloud)\nMongoose ODM\nJWT Authentication\nBcrypt Password Hashing\nCORS Middleware\nREST API Architecture' },
        { title: '🔗  Integration', color: '1D4ED8', items: 'Axios-style Fetch Client\nLocalStorage Caching\nJWT Bearer Tokens\nEnvironment Variables (.env)\nMongoose Models & Schemas\nError Boundary Handling\nResponsive Design (Mobile)' },
    ];

    cols.forEach((col, i) => {
        card(s, 0.35 + i * 4.3, 0.8, 4.1, 6.4, col.title, col.color, col.items);
    });
}

// ═══════════════════════════════════════════════
// SLIDE 3 — SYSTEM ARCHITECTURE
// ═══════════════════════════════════════════════
{
    const s = pptx.addSlide();
    addBg(s, DARK);
    s.addText('System Architecture', { x: 0.4, y: 0.15, w: 12.5, h: 0.6, fontSize: 26, bold: true, color: GOLD, fontFace: 'Georgia' });
    s.addText('Three-tier full-stack architecture with React frontend, Express backend, and MongoDB cloud database', {
        x: 0.4, y: 0.72, w: 12.5, h: 0.35, fontSize: 13, color: CREAM, fontFace: 'Calibri'
    });

    const boxes = [
        { x: 0.3, label: '🖥  React\nFrontend\nlocalhost:5173', color: MAROON },
        { x: 4.75, label: '⚙  Express\nBackend\nlocalhost:5000', color: '065F46' },
        { x: 9.2, label: '🍃  MongoDB\nAtlas\nCloud DB', color: '1E40AF' },
    ];

    boxes.forEach(b => {
        s.addShape(pptx.ShapeType.rect, { x: b.x, y: 1.4, w: 3.6, h: 2.1, fill: { color: b.color }, line: { color: GOLD, width: 2 }, rectRadius: 0.12 });
        s.addText(b.label, { x: b.x, y: 1.4, w: 3.6, h: 2.1, fontSize: 16, bold: true, color: WHITE, fontFace: 'Calibri', align: 'center', valign: 'middle' });
    });

    // Arrows
    [[3.9, 2.42], [8.35, 2.42]].forEach(([x, y]) => {
        s.addShape(pptx.ShapeType.rect, { x, y, w: 0.85, h: 0.08, fill: { color: GOLD } });
        s.addText('▶', { x: x + 0.6, y: y - 0.14, w: 0.3, h: 0.35, fontSize: 14, color: GOLD });
    });

    // Context layer
    const ctxItems = [
        { label: 'AuthContext', desc: 'JWT login, admin role, session', color: '7C3AED' },
        { label: 'ProductContext', desc: 'Products list, add/edit/delete', color: MAROON },
        { label: 'CartContext', desc: 'Cart items, quantity, total', color: '065F46' },
        { label: 'OrderContext', desc: 'Order placement & tracking', color: '1D4ED8' },
        { label: 'WishlistContext', desc: 'Saved products per user', color: 'B45309' },
    ];

    s.addText('React Context Layer (Global State)', { x: 0.3, y: 3.8, w: 12.7, h: 0.35, fontSize: 14, bold: true, color: GOLD, fontFace: 'Georgia' });
    ctxItems.forEach((c, i) => {
        s.addShape(pptx.ShapeType.rect, { x: 0.3 + i * 2.58, y: 4.2, w: 2.4, h: 0.9, fill: { color: c.color }, line: { color: GOLD, width: 1 }, rectRadius: 0.1 });
        s.addText(c.label + '\n' + c.desc, { x: 0.3 + i * 2.58, y: 4.2, w: 2.4, h: 0.9, fontSize: 10, color: WHITE, fontFace: 'Calibri', align: 'center', valign: 'middle' });
    });

    s.addText('REST API Endpoints: /api/auth  /api/products  /api/orders  /api/wholesale', {
        x: 0.3, y: 5.35, w: 12.7, h: 0.4, fontSize: 13, color: CREAM, fontFace: 'Calibri'
    });
    s.addText('Security: JWT Bearer Token • Bcrypt (saltRounds=10) • Admin-only routes • CORS enabled', {
        x: 0.3, y: 5.78, w: 12.7, h: 0.4, fontSize: 13, color: GOLD, fontFace: 'Calibri'
    });
}

// ═══════════════════════════════════════════════
// SLIDE 4 — CUSTOMER FEATURES (Side A)
// ═══════════════════════════════════════════════
{
    const s = pptx.addSlide();
    addBg(s, WHITE);
    addAccentBar(s, 0, 0, '100%', 0.08, GOLD);
    addAccentBar(s, 0, 0.08, '100%', 0.58, MAROON);
    s.addText('Customer-Facing Features', { x: 0.4, y: 0.12, w: 10, h: 0.5, fontSize: 26, bold: true, color: GOLD, fontFace: 'Georgia' });
    s.addText('Pages & User Experience', { x: 0.4, y: 0.64, w: 12.5, h: 0.35, fontSize: 14, color: CREAM, fontFace: 'Calibri', italic: true });

    const features = [
        {
            title: '🏠  Home Page',
            color: MAROON,
            body: '• Animated hero with CTA buttons\n• Featured sarees carousel\n• Category quick-links\n• WhatsApp float button',
        },
        {
            title: '👗  Collections Page',
            color: '7C3AED',
            body: '• Category/fabric/color filters\n• Real-time search bar\n• Grid & list views\n• Responsive product cards',
        },
        {
            title: '📋  Product Detail',
            color: '065F46',
            body: '• Full image + description\n• Add to Cart & Wishlist\n• Fabric, color, type details\n• Price display with rupee symbol',
        },
        {
            title: '🛒  Cart & Checkout',
            color: '1D4ED8',
            body: '• Quantity controls + remove\n• Live total calculation\n• Address form at checkout\n• Order placed → stored in MongoDB',
        },
        {
            title: '❤  Wishlist',
            color: 'B91C1C',
            body: '• Save/remove products\n• Persisted in localStorage\n• Wishlist count badge on nav\n• Move to cart from wishlist',
        },
        {
            title: '📦  My Orders & Tracking',
            color: 'B45309',
            body: '• All past orders from MongoDB\n• Order status with timeline\n• Pending→Processing→Shipped→Delivered\n• Cancel order feature',
        },
    ];

    features.forEach((f, i) => {
        const col = i % 3;
        const row = Math.floor(i / 3);
        card(s, 0.28 + col * 4.32, 1.1 + row * 3.05, 4.1, 2.85, f.title, f.color, f.body);
    });
}

// ═══════════════════════════════════════════════
// SLIDE 5 — CUSTOMER FEATURES (Side B)
// ═══════════════════════════════════════════════
{
    const s = pptx.addSlide();
    addBg(s, CREAM);
    addAccentBar(s, 0, 0, '100%', 0.08, MAROON);
    addAccentBar(s, 0, 0.08, '100%', 0.58, DARK);
    s.addText('Additional Customer Features', { x: 0.4, y: 0.12, w: 10, h: 0.5, fontSize: 26, bold: true, color: GOLD, fontFace: 'Georgia' });
    s.addText('Authentication, Profile & More', { x: 0.4, y: 0.64, w: 12.5, h: 0.35, fontSize: 14, color: CREAM, fontFace: 'Calibri', italic: true });

    const features2 = [
        {
            title: '🔐  Authentication',
            color: MAROON,
            body: '• Register with name, email, phone\n• JWT login stored in localStorage\n• Secure logout clears session\n• Protected routes (cart, profile, orders)',
        },
        {
            title: '👤  Profile Page',
            color: '6B21A8',
            body: '• Shows user name, email, role\n• Cart & wishlist counts\n• View my orders link\n• Admin badge for admin users',
        },
        {
            title: '🏭  Wholesale Page',
            color: '065F46',
            body: '• Bulk inquiry form\n• WhatsApp integration\n• Tiered pricing displayed\n• Form submission stored',
        },
        {
            title: 'ℹ  About & Contact',
            color: '1D4ED8',
            body: '• Brand story & team info\n• Contact form with validation\n• Location & business info\n• Fully responsive layout',
        },
        {
            title: '📍  Navigation & UX',
            color: 'B45309',
            body: '• Sticky navbar with cart badge\n• Admin Panel button (admin only)\n• Mobile hamburger menu\n• Page transitions & animations',
        },
        {
            title: '🔎  Track Order',
            color: '0F766E',
            body: '• Search by order ID\n• Live status from MongoDB\n• Order timeline display\n• Estimated delivery info',
        },
    ];

    features2.forEach((f, i) => {
        const col = i % 3;
        const row = Math.floor(i / 3);
        card(s, 0.28 + col * 4.32, 1.1 + row * 3.05, 4.1, 2.85, f.title, f.color, f.body);
    });
}

// ═══════════════════════════════════════════════
// SLIDE 6 — ADMIN PANEL FEATURES
// ═══════════════════════════════════════════════
{
    const s = pptx.addSlide();
    addBg(s, DARK);
    addAccentBar(s, 0, 0, '100%', 0.08, GOLD);
    s.addText('🛡  Admin Panel', { x: 0.4, y: 0.15, w: 12.5, h: 0.6, fontSize: 28, bold: true, color: GOLD, fontFace: 'Georgia' });
    s.addText('Secure admin portal — separate login, protected routes, real MongoDB data', {
        x: 0.4, y: 0.72, w: 12.5, h: 0.35, fontSize: 13, color: CREAM, fontFace: 'Calibri', italic: true
    });

    const adminFeatures = [
        {
            title: '📊  Dashboard',
            color: '7C3AED',
            body: '• Total Revenue (live from DB)\n• Total Orders count\n• Pending Orders (action needed)\n• Total Products count\n• Unique Customers count\n• Refresh button for live data\n• Recent Orders list',
        },
        {
            title: '📦  Product Management',
            color: MAROON,
            body: '• View all products in table\n• ✏ Edit product (opens modal)\n• 🗑 Delete with confirmation\n• ➕ Add New Product modal\n• Real-time UI updates\n• Saves to MongoDB\n• Image, price, category, fabric',
        },
        {
            title: '🛒  Order Management',
            color: '065F46',
            body: '• View all customer orders\n• Filter by status\n• Update order status\n  (Pending → Processing →\n   Shipped → Delivered)\n• Cancel / Refund orders\n• Customer details view',
        },
        {
            title: '🔒  Admin Login',
            color: '1D4ED8',
            body: '• Separate /admin/login route\n• Auto-clears customer session\n• JWT role: "admin" check\n• AdminGuard on all /admin routes\n• Gold "Admin Panel" button\n  appears in Navbar for admins\n• Secure session management',
        },
    ];

    adminFeatures.forEach((f, i) => {
        const col = i % 2;
        const row = Math.floor(i / 2);
        const bgC = i % 2 === 0 ? '1F2937' : '111827';
        // Card border
        s.addShape(pptx.ShapeType.rect, { x: 0.28 + col * 6.55, y: 1.2 + row * 2.9, w: 6.3, h: 2.75, fill: { color: bgC }, line: { color: f.color, width: 2.5 }, rectRadius: 0.12 });
        // Title bar
        s.addShape(pptx.ShapeType.rect, { x: 0.28 + col * 6.55, y: 1.2 + row * 2.9, w: 6.3, h: 0.48, fill: { color: f.color }, rectRadius: 0.08 });
        s.addText(f.title, { x: 0.44 + col * 6.55, y: 1.26 + row * 2.9, w: 6.0, h: 0.38, fontSize: 15, bold: true, color: WHITE, fontFace: 'Georgia' });
        s.addText(f.body, { x: 0.44 + col * 6.55, y: 1.75 + row * 2.9, w: 5.9, h: 2.05, fontSize: 12.5, color: CREAM, fontFace: 'Calibri', valign: 'top' });
    });
}

// ═══════════════════════════════════════════════
// SLIDE 7 — DATABASE & API
// ═══════════════════════════════════════════════
{
    const s = pptx.addSlide();
    addBg(s, WHITE);
    addAccentBar(s, 0, 0, '100%', 0.08, GOLD);
    addAccentBar(s, 0, 0.08, '100%', 0.58, MAROON);
    s.addText('Database & REST API Design', { x: 0.4, y: 0.12, w: 10, h: 0.5, fontSize: 26, bold: true, color: GOLD, fontFace: 'Georgia' });
    s.addText('MongoDB Atlas • Mongoose Models • Express REST Endpoints', {
        x: 0.4, y: 0.64, w: 12.5, h: 0.35, fontSize: 13, color: CREAM, fontFace: 'Calibri', italic: true
    });

    // Models
    s.addShape(pptx.ShapeType.rect, { x: 0.3, y: 1.1, w: 5.8, h: 5.65, fill: { color: LGRAY }, line: { color: MAROON, width: 2 }, rectRadius: 0.1 });
    s.addText('📁  MongoDB Models', { x: 0.5, y: 1.15, w: 5.4, h: 0.4, fontSize: 16, bold: true, color: MAROON, fontFace: 'Georgia' });

    const models = [
        { name: 'User', fields: 'name, email, password (bcrypt), phone, role [customer|admin]' },
        { name: 'Product', fields: 'name, sareeType, category, fabric, color, price, image, description, featured, madeToOrder' },
        { name: 'Order', fields: 'userId, customerName, email, items[], total, status, address, createdAt' },
        { name: 'Wholesale', fields: 'name, email, phone, shopName, quantity, message' },
    ];

    models.forEach((m, i) => {
        s.addShape(pptx.ShapeType.rect, { x: 0.45, y: 1.65 + i * 1.22, w: 5.5, h: 1.1, fill: { color: WHITE }, line: { color: GOLD, width: 1.5 }, rectRadius: 0.08 });
        s.addText(m.name, { x: 0.6, y: 1.7 + i * 1.22, w: 5.2, h: 0.35, fontSize: 14, bold: true, color: MAROON, fontFace: 'Georgia' });
        s.addText(m.fields, { x: 0.6, y: 2.05 + i * 1.22, w: 5.2, h: 0.55, fontSize: 11, color: DARK, fontFace: 'Calibri' });
    });

    // API Routes
    s.addShape(pptx.ShapeType.rect, { x: 6.6, y: 1.1, w: 6.7, h: 5.65, fill: { color: DARK }, line: { color: GOLD, width: 2 }, rectRadius: 0.1 });
    s.addText('🔗  REST API Endpoints', { x: 6.8, y: 1.15, w: 6.3, h: 0.4, fontSize: 16, bold: true, color: GOLD, fontFace: 'Georgia' });

    const apis = [
        { method: 'POST', path: '/api/auth/register', desc: 'Create account' },
        { method: 'POST', path: '/api/auth/login', desc: 'Login + JWT token' },
        { method: 'GET', path: '/api/products', desc: 'List all products' },
        { method: 'POST', path: '/api/products', desc: 'Add product (admin)' },
        { method: 'PUT', path: '/api/products/:id', desc: 'Edit product (admin)' },
        { method: 'DELETE', path: '/api/products/:id', desc: 'Delete product (admin)' },
        { method: 'GET', path: '/api/orders', desc: 'Get all orders (admin)' },
        { method: 'POST', path: '/api/orders', desc: 'Place new order' },
        { method: 'PATCH', path: '/api/orders/:id/status', desc: 'Update status (admin)' },
        { method: 'PUT', path: '/api/orders/:id/cancel', desc: 'Cancel order' },
        { method: 'POST', path: '/api/wholesale', desc: 'Wholesale inquiry' },
    ];

    const methodColors = { GET: '16A34A', POST: '1D4ED8', PUT: 'B45309', DELETE: 'B91C1C', PATCH: '7C3AED' };

    apis.forEach((a, i) => {
        const mc = methodColors[a.method] || MAROON;
        s.addShape(pptx.ShapeType.rect, { x: 6.75, y: 1.6 + i * 0.46, w: 0.85, h: 0.32, fill: { color: mc } });
        s.addText(a.method, { x: 6.75, y: 1.6 + i * 0.46, w: 0.85, h: 0.32, fontSize: 9.5, bold: true, color: WHITE, fontFace: 'Calibri', align: 'center', valign: 'middle' });
        s.addText(a.path, { x: 7.65, y: 1.6 + i * 0.46, w: 2.9, h: 0.32, fontSize: 11, color: GOLD, fontFace: 'Courier New', valign: 'middle' });
        s.addText(a.desc, { x: 10.6, y: 1.6 + i * 0.46, w: 2.5, h: 0.32, fontSize: 11, color: CREAM, fontFace: 'Calibri', valign: 'middle' });
    });
}

// ═══════════════════════════════════════════════
// SLIDE 8 — FEATURE COMPARISON TABLE
// ═══════════════════════════════════════════════
{
    const s = pptx.addSlide();
    addBg(s, CREAM);
    addAccentBar(s, 0, 0, '100%', 0.08, MAROON);
    addAccentBar(s, 0, 0.08, '100%', 0.58, DARK);
    s.addText('Feature Implementation Summary', { x: 0.4, y: 0.12, w: 12.5, h: 0.5, fontSize: 26, bold: true, color: GOLD, fontFace: 'Georgia' });
    s.addText('All features from the project slide — implemented and verified', {
        x: 0.4, y: 0.64, w: 12.5, h: 0.35, fontSize: 13, color: CREAM, fontFace: 'Calibri', italic: true
    });

    const rows = [
        ['Feature', 'From PPT', 'Status', 'Tech Used'],
        ['Secure Admin Login', '✅', '✅ Done', 'JWT + role:admin + AdminGuard'],
        ['Dashboard – Orders, Revenue, Customers', '✅', '✅ Done', 'Live MongoDB data, real-time stats'],
        ['Add Product', '✅', '✅ Done', 'POST /api/products + Modal UI'],
        ['Edit Product', '✅', '✅ Done', 'PUT /api/products/:id + pre-filled Modal'],
        ['Delete Product', '✅', '✅ Done', 'DELETE /api/products/:id + confirmation'],
        ['View All Orders', '✅', '✅ Done', 'GET /api/orders (admin route)'],
        ['Update Order Status', '✅', '✅ Done', 'PATCH /api/orders/:id/status'],
        ['Order Lifecycle (Pending→Delivered)', '✅', '✅ Done', 'Status enum + dropdown in AdminOrders'],
        ['Customer Registration & Login', '✅', '✅ Done', 'Bcrypt + JWT + AuthContext'],
        ['Product Browse & Filter', '✅', '✅ Done', 'CollectionsPage + filter/search'],
        ['Add to Cart & Checkout', '✅', '✅ Done', 'CartContext + MongoDB order creation'],
        ['Wishlist', '✅', '✅ Done', 'WishlistContext + localStorage'],
        ['Order Tracking', '✅', '✅ Done', 'TrackOrderPage + live status'],
        ['Wholesale Inquiry Form', '✅', '✅ Done', 'POST /api/wholesale + WhatsApp'],
    ];

    const colW = [4.2, 1.1, 1.3, 5.7];
    const startX = [0.25, 4.5, 5.65, 7.0];
    const totalH = 6.55;
    const rowH = totalH / rows.length;

    rows.forEach((row, ri) => {
        const isHeader = ri === 0;
        const isEven = ri % 2 === 1;
        const bg = isHeader ? MAROON : isEven ? 'E8E0D0' : WHITE;
        s.addShape(pptx.ShapeType.rect, { x: 0.25, y: 0.9 + ri * rowH, w: 12.85, h: rowH, fill: { color: bg }, line: { color: 'D1D5DB', width: 0.5 } });

        row.forEach((cell, ci) => {
            const isStatus = ci === 2;
            const statusColor = isStatus && cell.includes('Done') ? '15803D' : DARK;
            s.addText(cell, {
                x: startX[ci], y: 0.9 + ri * rowH, w: colW[ci], h: rowH,
                fontSize: isHeader ? 12 : 11,
                bold: isHeader,
                color: isHeader ? GOLD : isStatus ? statusColor : DARK,
                fontFace: isHeader ? 'Georgia' : 'Calibri',
                valign: 'middle',
            });
        });
    });
}

// ═══════════════════════════════════════════════
// SLIDE 9 — SECURITY & KEY DECISIONS
// ═══════════════════════════════════════════════
{
    const s = pptx.addSlide();
    addBg(s, DARK);
    addAccentBar(s, 0, 0, '100%', 0.08, GOLD);
    s.addText('Security & Design Decisions', { x: 0.4, y: 0.15, w: 12.5, h: 0.6, fontSize: 26, bold: true, color: GOLD, fontFace: 'Georgia' });

    const items = [
        { icon: '🔒', title: 'Password Security', desc: 'Bcrypt with saltRounds=10 — passwords never stored as plain text in MongoDB', color: MAROON },
        { icon: '🎟', title: 'JWT Authentication', desc: 'Signed token (HS256) stored in localStorage — 7-day expiry — sent as Bearer header on all API calls', color: '7C3AED' },
        { icon: '🛡', title: 'Admin Guard', desc: 'AdminGuard component wraps all /admin/* routes — redirects to /admin/login if role !== admin', color: '1D4ED8' },
        { icon: '♻', title: 'Real-time UI Updates', desc: 'After edit/delete/add, ProductContext state is updated immediately — no page reload required', color: '065F46' },
        { icon: '💾', title: 'LocalStorage Caching', desc: 'Products and user session cached in localStorage for offline resilience and faster loads', color: 'B45309' },
        { icon: '📱', title: 'Responsive Design', desc: 'All pages work on mobile, tablet, and desktop — hamburger menu for mobile, grid adapts to screen', color: '0F766E' },
    ];

    items.forEach((item, i) => {
        const col = i % 2;
        const row = Math.floor(i / 2);
        s.addShape(pptx.ShapeType.rect, { x: 0.3 + col * 6.55, y: 0.92 + row * 2.1, w: 6.3, h: 2.0, fill: { color: '1F2937' }, line: { color: item.color, width: 2 }, rectRadius: 0.12 });
        s.addShape(pptx.ShapeType.rect, { x: 0.3 + col * 6.55, y: 0.92 + row * 2.1, w: 0.65, h: 2.0, fill: { color: item.color }, rectRadius: 0.08 });
        s.addText(item.icon, { x: 0.35 + col * 6.55, y: 1.12 + row * 2.1, w: 0.6, h: 0.6, fontSize: 22, align: 'center', valign: 'middle' });
        s.addText(item.title, { x: 1.1 + col * 6.55, y: 0.98 + row * 2.1, w: 5.3, h: 0.42, fontSize: 14, bold: true, color: GOLD, fontFace: 'Georgia' });
        s.addText(item.desc, { x: 1.1 + col * 6.55, y: 1.42 + row * 2.1, w: 5.3, h: 1.3, fontSize: 12.5, color: CREAM, fontFace: 'Calibri', valign: 'top' });
    });

    s.addText('JWT_SECRET stored in .env  •  MongoDB URI in .env  •  CORS configured for frontend origin', {
        x: 0.3, y: 7.0, w: 13, h: 0.35, fontSize: 11.5, color: GOLD, fontFace: 'Calibri', align: 'center'
    });
}

// ═══════════════════════════════════════════════
// SLIDE 10 — THANK YOU
// ═══════════════════════════════════════════════
{
    const s = pptx.addSlide();
    addBg(s, MAROON);
    s.addShape(pptx.ShapeType.rect, { x: 0, y: 0, w: '100%', h: 0.12, fill: { color: GOLD } });
    s.addShape(pptx.ShapeType.rect, { x: 0, y: 7.38, w: '100%', h: 0.12, fill: { color: GOLD } });
    s.addShape(pptx.ShapeType.rect, { x: 0, y: 0, w: 0.12, h: '100%', fill: { color: GOLD } });
    s.addShape(pptx.ShapeType.rect, { x: 13.2, y: 0, w: 0.12, h: '100%', fill: { color: GOLD } });

    s.addText('Thank You', { x: 0.5, y: 1.2, w: 12.3, h: 1.0, fontSize: 58, bold: true, color: GOLD, fontFace: 'Georgia', align: 'center' });
    s.addShape(pptx.ShapeType.rect, { x: 3.5, y: 2.4, w: 6.3, h: 0.05, fill: { color: GOLD } });

    s.addText('NishaDeepana Sarees', { x: 0.5, y: 2.65, w: 12.3, h: 0.65, fontSize: 28, color: WHITE, fontFace: 'Georgia', align: 'center', italic: true });

    const summary = [
        '✅  15+ Features implemented end-to-end',
        '✅  Secure Admin Portal with CRUD operations',
        '✅  Real-time MongoDB data across all pages',
        '✅  Complete customer journey from browse → order → track',
        '✅  JWT auth + Admin role-based access control',
    ];
    summary.forEach((line, i) => {
        s.addText(line, { x: 2.5, y: 3.5 + i * 0.52, w: 8.5, h: 0.46, fontSize: 16, color: CREAM, fontFace: 'Calibri', align: 'center' });
    });

    s.addText('Built with React • Node.js • MongoDB Atlas', {
        x: 0.5, y: 6.55, w: 12.3, h: 0.35, fontSize: 13, color: GOLD, fontFace: 'Calibri', align: 'center'
    });
}

// ── Save ──────────────────────────────────────
const OUT = 'C:/myyweb2/NishaDeepana_Sarees_Features.pptx';
pptx.writeFile({ fileName: OUT }).then(() => {
    console.log('✅  PPT saved to: ' + OUT);
}).catch(err => {
    console.error('❌  Error:', err.message);
});
