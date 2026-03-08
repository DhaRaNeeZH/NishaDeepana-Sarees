// ================================================================
// Seed Script — Populates MongoDB with 13 products
// Run once: node seed.js
// ================================================================

const mongoose = require('mongoose');
require('dotenv').config();
const Product = require('./models/Product');

const products = [
    {
        name: 'South Cotton Saree - Classic Elegance',
        description: 'Traditional South cotton saree with intricate weaving. Lightweight and perfect for everyday wear.',
        price: 1800, category: 'Cotton', sareeType: 'South Cotton', fabric: 'Pure Cotton',
        color: 'Off White, Red Border',
        image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=800',
        featured: true, inStock: true, madeToOrder: false, blouseIncluded: 'running',
    },
    {
        name: 'Soft Silk Saree - Timeless Beauty',
        description: 'Luxurious soft silk saree with rich texture and vibrant colors.',
        price: 4500, category: 'Silk', sareeType: 'Soft Silk', fabric: 'Soft Silk',
        color: 'Deep Red, Gold',
        image: 'https://images.unsplash.com/photo-1583391733981-9c336921fa18?w=800',
        featured: true, inStock: true, madeToOrder: false, blouseIncluded: 'contrast',
    },
    {
        name: 'Linen Cotton Saree - Summer Breeze',
        description: 'Breathable linen cotton blend perfect for warm weather.',
        price: 2200, category: 'Cotton', sareeType: 'Linen Cotton', fabric: 'Linen Cotton',
        color: 'Beige, Blue',
        image: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=800',
        featured: false, inStock: true, madeToOrder: false, blouseIncluded: 'contrast',
    },
    {
        name: 'Silk Cotton Saree - Perfect Blend',
        description: 'Beautiful blend of silk and cotton offering comfort and elegance.',
        price: 3200, category: 'Silk Cotton', sareeType: 'Silk Cotton', fabric: 'Silk Cotton',
        color: 'Green, Gold Border',
        image: 'https://images.unsplash.com/photo-1583391733956-6f8a1426d50a?w=800',
        featured: true, inStock: true, madeToOrder: false, blouseIncluded: 'contrast',
    },
    {
        name: 'Mul Mul Cotton Saree - Delicate Grace',
        description: 'Ultra-soft mul mul cotton saree that drapes beautifully.',
        price: 1600, category: 'Cotton', sareeType: 'Mul Mul Cotton', fabric: 'Mul Mul Cotton',
        color: 'Pastel Pink, White',
        image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=800',
        featured: false, inStock: true, madeToOrder: false, blouseIncluded: 'contrast',
    },
    {
        name: 'Khadi Cotton Saree - Handwoven Heritage',
        description: 'Authentic handwoven khadi cotton saree supporting traditional artisans.',
        price: 2800, category: 'Khadi', sareeType: 'Khadi Cotton', fabric: 'Khadi Cotton',
        color: 'Natural White, Brown',
        image: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=800',
        featured: false, inStock: true, madeToOrder: false, blouseIncluded: 'contrast',
    },
    {
        name: 'Premium Khadi Tissue Silk - Luxury Edition',
        description: 'Exquisite tissue silk with khadi weave. A premium choice for sophisticated occasions.',
        price: 8500, category: 'Silk', sareeType: 'Premium Khadi Tissue Silk', fabric: 'Tissue Silk',
        color: 'Gold, Ivory',
        image: 'https://images.unsplash.com/photo-1583391733981-9c336921fa18?w=800',
        featured: true, inStock: true, madeToOrder: true, blouseIncluded: 'running',
    },
    {
        name: 'Kalyani Cotton Saree - Traditional Charm',
        description: 'Classic Kalyani cotton weave. Known for durability and comfort.',
        price: 1900, category: 'Cotton', sareeType: 'Kalyani Cotton', fabric: 'Kalyani Cotton',
        color: 'Yellow, Green Border',
        image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=800',
        featured: false, inStock: true, madeToOrder: false, blouseIncluded: 'running',
    },
    {
        name: 'Kalyani Cotton Checked Saree - Modern Classic',
        description: 'Contemporary checked pattern in traditional Kalyani cotton.',
        price: 2100, category: 'Cotton', sareeType: 'Kalyani Cotton Checked', fabric: 'Kalyani Cotton',
        color: 'Blue, White Check',
        image: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=800',
        featured: false, inStock: true, madeToOrder: false, blouseIncluded: 'running',
    },
    {
        name: 'Maheshwari Silk Cotton - Royal Elegance',
        description: 'Renowned Maheshwari weave in silk cotton blend. A heritage piece.',
        price: 4800, category: 'Silk Cotton', sareeType: 'Maheshwari Silk Cotton', fabric: 'Silk Cotton',
        color: 'Purple, Silver',
        image: 'https://images.unsplash.com/photo-1583391733981-9c336921fa18?w=800',
        featured: true, inStock: true, madeToOrder: false, blouseIncluded: 'contrast',
    },
    {
        name: 'Pochampally Chanderi Cotton - Artistic Weave',
        description: 'Beautiful Pochampally ikat patterns on Chanderi cotton.',
        price: 3800, category: 'Chanderi', sareeType: 'Pochampally Chanderi Cotton', fabric: 'Chanderi Cotton',
        color: 'Orange, Teal',
        image: 'https://images.unsplash.com/photo-1583391733956-6f8a1426d50a?w=800',
        featured: true, inStock: true, madeToOrder: false, blouseIncluded: 'contrast',
    },
    {
        name: 'Madurai Sungudi Cotton - Kalamkari Blouse',
        description: 'Traditional Madurai sungudi cotton saree with exclusive matching kalamkari blouse.',
        price: 2600, category: 'Cotton', sareeType: 'Madurai Sungudi Cotton', fabric: 'Sungudi Cotton',
        color: 'Maroon, Gold Dots',
        image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=800',
        featured: false, inStock: true, madeToOrder: false, blouseIncluded: 'matching',
    },
    {
        name: 'Chettinad Cotton Saree - Pure Tradition',
        description: 'Authentic Chettinad cotton saree from Tamil Nadu.',
        price: 2400, category: 'Cotton', sareeType: 'Chettinad Cotton', fabric: 'Chettinad Cotton',
        color: 'Black, White Stripe',
        image: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=800',
        featured: false, inStock: true, madeToOrder: false, blouseIncluded: 'none',
    },
];

async function seed() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected to MongoDB');

        // Clear existing products
        await Product.deleteMany({});
        console.log('🗑️  Cleared existing products');

        // Insert all products
        const inserted = await Product.insertMany(products);
        console.log(`📦 Inserted ${inserted.length} products into MongoDB`);

        inserted.forEach(p => console.log(`   • ${p.name} — ₹${p.price} (${p.category}) — ${p.color}`));

        console.log('\n🎉 Seed complete! Your database is ready.');
        process.exit(0);
    } catch (err) {
        console.error('❌ Seed failed:', err.message);
        process.exit(1);
    }
}

seed();
