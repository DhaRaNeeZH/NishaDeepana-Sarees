import { Order } from '../lib/types';

export const orders: Order[] = [
    {
        id: 'ORD-2024-001',
        customerName: 'Priya Sharma',
        email: 'priya.sharma@example.com',
        phone: '+91 98765 43210',
        items: [
            {
                id: '1',
                name: 'Royal Banarasi Silk Saree',
                description: 'Exquisite handwoven Banarasi silk saree',
                price: 12500,
                category: 'Banarasi',
                sareeType: 'Banarasi Silk',
                fabric: 'Pure Silk',
                color: 'Royal Blue',
                image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=800',
                images: [],
                featured: true,
                madeToOrder: false,
                blouseIncluded: 'contrast',
                quantity: 1
            }
        ],
        total: 12500,
        status: 'delivered',
        orderDate: '2024-01-15',
        shippingAddress: '123 MG Road, Bangalore, Karnataka - 560001',
        isWholesale: false
    },
    {
        id: 'ORD-2024-002',
        customerName: 'Divya Patel',
        email: 'divya.patel@example.com',
        phone: '+91 98765 43211',
        items: [
            {
                id: '2',
                name: 'Kanjivaram Temple Border Saree',
                description: 'Traditional Kanjivaram saree',
                price: 18900,
                category: 'Kanjivaram',
                sareeType: 'Kanjivaram Silk',
                fabric: 'Pure Silk',
                color: 'Maroon',
                image: 'https://images.unsplash.com/photo-1583391733981-9c336921fa18?w=800',
                images: [],
                featured: true,
                madeToOrder: false,
                blouseIncluded: 'running',
                quantity: 20
            }
        ],
        total: 302400,
        status: 'processing',
        orderDate: '2024-02-01',
        shippingAddress: '456 Fashion Street, Mumbai, Maharashtra - 400001',
        isWholesale: true
    },
    {
        id: 'ORD-2024-003',
        customerName: 'Ananya Reddy',
        email: 'ananya.reddy@example.com',
        phone: '+91 98765 43212',
        items: [
            {
                id: '3',
                name: 'Chanderi Cotton Silk Saree',
                description: 'Lightweight Chanderi saree',
                price: 3500,
                category: 'Chanderi',
                sareeType: 'Chanderi Cotton',
                fabric: 'Cotton Silk',
                color: 'Peach',
                image: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=800',
                images: [],
                featured: false,
                madeToOrder: false,
                blouseIncluded: 'contrast',
                quantity: 2
            }
        ],
        total: 7000,
        status: 'shipped',
        orderDate: '2024-02-05',
        shippingAddress: '789 Anna Nagar, Chennai, Tamil Nadu - 600040',
        isWholesale: false
    },
    {
        id: 'ORD-2024-004',
        customerName: 'Meera Krishnan',
        email: 'meera.k@example.com',
        phone: '+91 98765 43213',
        items: [
            {
                id: '5',
                name: 'Pure Georgette Designer Saree',
                description: 'Flowy georgette saree',
                price: 5800,
                category: 'Georgette',
                sareeType: 'Georgette',
                fabric: 'Georgette',
                color: 'Navy Blue',
                image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=800',
                images: [],
                featured: true,
                madeToOrder: false,
                blouseIncluded: 'none',
                quantity: 1
            }
        ],
        total: 5800,
        status: 'pending',
        orderDate: '2024-02-10',
        shippingAddress: '321 Jubilee Hills, Hyderabad, Telangana - 500033',
        isWholesale: false
    }
];
