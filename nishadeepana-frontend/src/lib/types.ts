// Blouse type enum
export type BlouseType = 'running' | 'contrast' | 'both' | 'none';

export interface Saree {
    id: string;
    name: string;
    description: string;
    price: number;
    originalPrice?: number;
    freeDelivery?: boolean;
    category: string;
    sareeType: string;
    fabric: string;
    color: string;
    colorTag?: string;      // one of 11 basic color names e.g. 'Red', 'Blue'
    colorGroup?: string;    // shared ID linking color variants e.g. 'banarasi-katan-001'
    image: string;
    images: string[];
    video?: string;         // Cloudinary video URL
    featured: boolean;
    madeToOrder: boolean;
    inStock?: boolean;
    blouseIncluded: BlouseType;
    createdAt?: string;
}

export interface CartItem extends Saree {
    quantity: number;
}

export interface Order {
    id: string;
    customerName: string;
    email: string;
    phone: string;
    items: CartItem[];
    total: number;
    status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
    orderDate: string;
    shippingAddress: string;
    isWholesale: boolean;
}

export interface Category {
    id: string;
    name: string;
    image: string;
    count: number;
}

export interface Testimonial {
    id: string;
    name: string;
    rating: number;
    comment: string;
    image: string;
}

export interface User {
    id: string;
    email: string;
    name: string;
    role: 'customer' | 'admin';
}

export interface AuthState {
    user: User | null;
    isAuthenticated: boolean;
    isAdmin: boolean;
}
