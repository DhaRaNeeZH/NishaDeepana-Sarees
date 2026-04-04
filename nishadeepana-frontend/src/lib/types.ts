// Blouse type enum
export type BlouseType = 'running' | 'contrast' | 'matching' | 'none';

export interface Saree {
    id: string;
    name: string;
    description: string;
    price: number;
    originalPrice?: number;
    freeDelivery?: boolean;
    category: string;
    sareeType: string; // Specific type: South cotton, Soft silk, etc.
    fabric: string;
    color: string;
    image: string;
    images: string[];
    featured: boolean;
    madeToOrder: boolean;
    blouseIncluded: BlouseType; // What blouse comes with the saree
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
