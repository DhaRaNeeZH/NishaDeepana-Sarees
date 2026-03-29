// ================================================================
// Delivery Zone Utility
// Determines delivery charge based on the customer's state
// ================================================================

export interface DeliveryCharges {
    tamilnadu: number;
    nearby: number;
    others: number;
}

// Tamil Nadu
const TAMIL_NADU_STATES = ['Tamil Nadu'];

// Nearby states
const NEARBY_STATES = ['Kerala', 'Karnataka', 'Andhra Pradesh', 'Telangana'];

export type DeliveryZone = 'tamilnadu' | 'nearby' | 'others';

export function getDeliveryZone(state: string): DeliveryZone {
    if (TAMIL_NADU_STATES.includes(state)) return 'tamilnadu';
    if (NEARBY_STATES.includes(state)) return 'nearby';
    return 'others';
}

export function getShippingCharge(state: string, charges: DeliveryCharges): number {
    const zone = getDeliveryZone(state);
    return charges[zone];
}

export function getZoneLabel(zone: DeliveryZone): string {
    if (zone === 'tamilnadu') return 'Tamil Nadu';
    if (zone === 'nearby') return 'Nearby State';
    return 'Other State';
}
