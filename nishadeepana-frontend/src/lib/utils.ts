import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { CartItem } from "./types"

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        minimumFractionDigits: 0,
    }).format(amount)
}

// Simplified bulk discount: 10% for 10+ items
export function calculateBulkPrice(basePrice: number, quantity: number): number {
    if (quantity >= 10) return basePrice * 0.9; // 10% discount
    return basePrice;
}

// Calculate price for a single item
export function calculateItemTotal(item: CartItem): number {
    return item.price * item.quantity;
}



// Calculate cart total with bulk discount applied
export function calculateCartTotal(items: CartItem[]): {
    subtotal: number;
    totalQuantity: number;
    discount: number;
    total: number;
} {
    const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);
    const subtotal = items.reduce((sum, item) => sum + calculateItemTotal(item), 0);

    // Apply bulk discount if 10+ items
    const discountRate = totalQuantity >= 10 ? 0.1 : 0;
    const discount = subtotal * discountRate;
    const total = subtotal - discount;

    return { subtotal, totalQuantity, discount, total };
}
