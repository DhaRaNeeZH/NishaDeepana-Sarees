// Pricing utilities for commerce engine

/**
 * Calculate bulk discount unit price based on quantity tiers
 * Tiers:
 * - 100+ units: 30% off (0.7x)
 * - 50-99 units: 20% off (0.8x)
 * - 20-49 units: 15% off (0.85x)
 * - 10-19 units: 10% off (0.9x)
 * - 1-9 units: No discount (1.0x)
 */
export function calculateBulkUnitPrice(basePrice: number, quantity: number): number {
    if (quantity >= 100) return basePrice * 0.7;
    if (quantity >= 50) return basePrice * 0.8;
    if (quantity >= 20) return basePrice * 0.85;
    if (quantity >= 10) return basePrice * 0.9;
    return basePrice;
}

/**
 * Calculate final unit price including blouse price
 * @param basePrice - Base saree price
 * @param quantity - Number of units
 * @param blousePrice - Price of selected blouse option
 * @returns Final price per unit after bulk discount + blouse
 */
export function calculateFinalUnitPrice(
    basePrice: number,
    quantity: number,
    blousePrice: number
): number {
    const discounted = calculateBulkUnitPrice(basePrice, quantity);
    return discounted + blousePrice;
}

/**
 * Get bulk discount percentage for display
 */
export function getBulkDiscountPercentage(quantity: number): number {
    if (quantity >= 100) return 30;
    if (quantity >= 50) return 20;
    if (quantity >= 20) return 15;
    if (quantity >= 10) return 10;
    return 0;
}

/**
 * Calculate cart totals
 */
export function calculateCartTotals(items: Array<{
    basePrice: number;
    quantity: number;
    blousePrice: number;
}>) {
    let subtotal = 0;
    let total = 0;

    items.forEach(item => {
        const itemSubtotal = item.basePrice * item.quantity;
        const itemTotal = calculateFinalUnitPrice(item.basePrice, item.quantity, item.blousePrice) * item.quantity;

        subtotal += itemSubtotal;
        total += itemTotal;
    });

    const discount = subtotal - total;

    return {
        subtotal,
        discount,
        total
    };
}
