import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { CreditCard, CheckCircle, ArrowLeft, ChevronDown } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { formatCurrency } from '../lib/utils';
import { calculateFinalUnitPrice, getBulkDiscountPercentage } from '../utils/pricing';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../lib/api';
import { getShippingCharge, getDeliveryZone, getZoneLabel, type DeliveryCharges } from '../utils/deliveryZone';
import type { Payment } from '../types/order';

interface FormData {
    name: string;
    email: string;
    phone: string;
    street: string;
    city: string;
    state: string;
    pincode: string;
}

const INITIAL_FORM: FormData = {
    name: '', email: '', phone: '',
    street: '', city: '', state: '', pincode: '',
};

export const CheckoutPage: React.FC = () => {
    const { items, cartSummary, clearCart } = useCart();
    const { user } = useAuth();
    const navigate = useNavigate();

    const [form, setForm] = useState<FormData>({
        ...INITIAL_FORM,
        name: user?.name ?? '',
        email: user?.email ?? '',
    });
    const [errors, setErrors] = useState<Partial<FormData>>({});
    const [isProcessing, setIsProcessing] = useState(false);
    const [apiError, setApiError] = useState('');
    const [deliveryCharges, setDeliveryCharges] = useState<DeliveryCharges>({ tamilnadu: 50, nearby: 80, others: 50 });
    const [returnPolicyAccepted, setReturnPolicyAccepted] = useState(false);
    const [returnPolicyError, setReturnPolicyError] = useState(false);
    const [freeShipping, setFreeShipping] = useState(false);
    const [stateDropdownOpen, setStateDropdownOpen] = useState(false);
    const stateDropdownRef = useRef<HTMLDivElement>(null);

    // Fetch delivery charges from backend on mount
    useEffect(() => {
        api.getDeliveryCharges().then((data) => {
            setDeliveryCharges(data);
            setFreeShipping(!!(data as any).freeShipping);
        }).catch(() => { });
    }, []);

    // Close state dropdown when clicking outside
    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (stateDropdownRef.current && !stateDropdownRef.current.contains(e.target as Node)) {
                setStateDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const allItemsFreeDelivery = items.length > 0 && items.every(item => item.product.freeDelivery);
    const isActuallyFreeShipping = freeShipping || allItemsFreeDelivery;

    const shipping = isActuallyFreeShipping ? 0 : (form.state.trim()
        ? getShippingCharge(form.state, deliveryCharges)
        : deliveryCharges.others);
    const totalWithShipping = cartSummary.total + shipping;
    const zoneLabel = isActuallyFreeShipping
        ? (freeShipping ? 'Festival Free Delivery 🎉' : 'Free Delivery Applied 🚚')
        : (form.state.trim() ? getZoneLabel(getDeliveryZone(form.state)) : 'Enter state for exact charge');

    if (items.length === 0) {
        navigate('/cart', { replace: true });
        return null;
    }

    const validate = (): boolean => {
        const errs: Partial<FormData> = {};
        if (!form.name.trim()) errs.name = 'Name is required';
        // Email is optional — many customers don't have one
        if (form.email && !form.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) errs.email = 'Please enter a valid email';
        if (!form.phone.replace(/\D/g, '').match(/^\d{10}$/)) errs.phone = '10-digit mobile number required';
        if (!form.street.trim()) errs.street = 'Street address is required';
        if (!form.city.trim()) errs.city = 'City is required';
        if (!form.state.trim()) errs.state = 'State is required';
        if (!form.pincode.match(/^\d{6}$/)) errs.pincode = 'Valid 6-digit pincode required';
        setErrors(errs);
        return Object.keys(errs).length === 0;
    };

    const buildOrderPayload = (payment: Payment) => ({
        items: items.map(item => {
            const unitPrice = calculateFinalUnitPrice(
                item.product.price,
                item.quantity,
                item.selectedBlouse.price
            );
            return {
                productId: item.productId,
                productName: item.product.name,
                image: item.product.image, // Add image snapshot
                quantity: item.quantity,
                basePrice: item.product.price,
                selectedBlouse: item.selectedBlouse,
                unitPrice,
                totalPrice: unitPrice * item.quantity,
            };
        }),
        subtotal: cartSummary.subtotal,
        discount: cartSummary.discount,
        shipping,
        total: totalWithShipping,
        status: payment.status === 'paid' ? 'paid' : 'pending',
        payment,
        customerName: form.name,
        email: form.email,
        phone: form.phone,
        shippingAddress: {
            street: form.street,
            city: form.city,
            state: form.state,
            pincode: form.pincode,
        },
    });



    const handleRazorpay = async () => {
        if (!validate()) return;
        if (!returnPolicyAccepted) {
            setReturnPolicyError(true);
            const el = document.getElementById('return-policy-checkbox');
            el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
            return;
        }
        setReturnPolicyError(false);
        setIsProcessing(true);
        setApiError('');
        try {
            // Load Razorpay script dynamically
            await new Promise<void>((resolve, reject) => {
                if ((window as any).Razorpay) { resolve(); return; }
                const script = document.createElement('script');
                script.src = 'https://checkout.razorpay.com/v1/checkout.js';
                script.onload = () => resolve();
                script.onerror = () => reject(new Error('Failed to load Razorpay'));
                document.body.appendChild(script);
            });

            // Create Razorpay order on backend
            const amountPaise = Math.round(totalWithShipping * 100);
            const orderData = await api.createPaymentOrder(amountPaise);

            // Open Razorpay checkout popup
            await new Promise<void>((resolve, reject) => {
                const rzp = new (window as any).Razorpay({
                    key: orderData.key,
                    amount: orderData.amount,
                    currency: orderData.currency,
                    name: 'NishaDeepana Sarees',
                    description: 'Saree Purchase',
                    order_id: orderData.orderId,
                    prefill: {
                        name: form.name,
                        email: form.email,
                        contact: form.phone,
                    },
                    theme: { color: '#7B1C2E' },
                    config: {
                        display: {
                            blocks: {
                                banks: {
                                    name: 'Online Payment Methods',
                                    instruments: [
                                        { method: 'upi' },
                                        { method: 'card' },
                                        { method: 'netbanking' },
                                        { method: 'wallet' }
                                        // EMI is intentionally omitted here
                                    ]
                                }
                            },
                            sequence: ['block.banks'],
                            preferences: {
                                show_default_blocks: false
                            }
                        }
                    },
                    handler: async (response: any) => {
                        try {
                            // Verify payment signature on backend
                            const verified = await api.verifyPayment({
                                razorpay_order_id: response.razorpay_order_id,
                                razorpay_payment_id: response.razorpay_payment_id,
                                razorpay_signature: response.razorpay_signature,
                            });
                            if (!verified.verified) throw new Error('Payment verification failed');

                            // Save order to DB
                            const payment: Payment = {
                                method: 'razorpay',
                                status: 'paid',
                                providerOrderId: response.razorpay_order_id,
                                transactionId: response.razorpay_payment_id,
                                paidAt: new Date().toISOString(),
                            };
                            const saved = await api.createOrder(buildOrderPayload(payment));
                            clearCart();
                            navigate(`/track-order?orderId=${saved._id}`);
                            resolve();
                        } catch (err: any) {
                            reject(err);
                        }
                    },
                    modal: {
                        ondismiss: () => reject(new Error('Payment cancelled')),
                    },
                });
                rzp.open();
            });
        } catch (err: any) {
            if (err.message !== 'Payment cancelled') {
                setApiError(err.message || 'Payment failed. Please try again.');
            }
            setIsProcessing(false);
        }
    };

    const field = (
        id: keyof FormData,
        label: string,
        type = 'text',
        placeholder = ''
    ) => (
        <div>
            <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">
                {label} <span className="text-red-500">*</span>
            </label>
            <div className="relative">
                {id === 'phone' && (
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-semibold border-r pr-2 h-6 flex items-center">
                        +91
                    </div>
                )}
                <Input
                    id={id}
                    type={type}
                    placeholder={placeholder}
                    value={form[id]}
                    onChange={e => {
                        let val = e.target.value;
                        if (id === 'phone') {
                            // Strip anything that isn't a digit if they are typing in the phone box
                            val = val.replace(/\D/g, '').slice(0, 10);
                        }
                        setForm(prev => ({ ...prev, [id]: val }));
                    }}
                    className={`
                    ${errors[id] ? 'border-red-400 focus:ring-red-300' : 'border-gray-300 focus:border-maroon'}
                    ${id === 'phone' ? 'pl-16' : ''}
                `}
                    aria-invalid={!!errors[id]}
                    aria-describedby={errors[id] ? `${id}-error` : undefined}
                />
            </div>
            {errors[id] && (
                <p id={`${id}-error`} className="text-red-500 text-xs mt-1">{errors[id]}</p>
            )}
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <button
                    onClick={() => navigate('/cart')}
                    className="flex items-center gap-2 text-gray-500 hover:text-maroon mb-6 transition-colors"
                    aria-label="Back to cart"
                >
                    <ArrowLeft className="h-4 w-4" /> Back to Cart
                </button>

                <h1 className="text-3xl font-bold text-gray-900 mb-8" style={{ fontFamily: 'Playfair Display, serif' }}>
                    Checkout
                </h1>

                <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                    {/* Form — 3 cols */}
                    <div className="lg:col-span-3 space-y-6">
                        {/* Customer Details */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg text-maroon">Customer Details</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {field('name', 'Full Name', 'text', 'Your name')}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                                            Email <span className="text-gray-400 text-xs font-normal">(Optional)</span>
                                        </label>
                                        <div className="relative">
                                            <Input
                                                id="email"
                                                type="email"
                                                placeholder="you@example.com"
                                                value={form.email}
                                                onChange={e => setForm(prev => ({ ...prev, email: e.target.value }))}
                                                className={errors.email ? 'border-red-400 focus:ring-red-300' : 'border-gray-300 focus:border-maroon'}
                                            />
                                        </div>
                                        {errors.email && (
                                            <p id="email-error" className="text-red-500 text-xs mt-1">{errors.email}</p>
                                        )}
                                    </div>
                                    {field('phone', 'Mobile Number (10 digits)', 'tel', '93457 04134')}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Shipping Address */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg text-maroon">Shipping Address</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {field('street', 'Street Address', 'text', '123 MG Road')}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {field('city', 'City', 'text', 'Chennai')}
                                    <div ref={stateDropdownRef} className="relative">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            State <span className="text-red-500">*</span>
                                        </label>
                                        {/* Custom State Dropdown — same style as sort, works great on mobile */}
                                        <button
                                            type="button"
                                            onClick={() => setStateDropdownOpen(v => !v)}
                                            className={`w-full flex items-center justify-between px-3 py-3 border rounded-xl text-sm bg-gray-50 hover:bg-white transition-all outline-none ${
                                                errors.state
                                                    ? 'border-red-400'
                                                    : stateDropdownOpen
                                                        ? 'border-maroon ring-2 ring-maroon/10 bg-white'
                                                        : 'border-gray-200'
                                            }`}
                                            aria-haspopup="listbox"
                                            aria-expanded={stateDropdownOpen}
                                        >
                                            <span className={form.state ? 'text-gray-800' : 'text-gray-400'}>
                                                {form.state || '-- Select State --'}
                                            </span>
                                            <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform flex-shrink-0 ${stateDropdownOpen ? 'rotate-180' : ''}`} />
                                        </button>

                                        {stateDropdownOpen && (
                                            <div className="absolute left-0 right-0 top-full mt-1 z-50 bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden max-h-64 overflow-y-auto">
                                                {[
                                                    { group: '🏠 Tamil Nadu Zone', states: ['Tamil Nadu', 'Puducherry'] },
                                                    { group: '🗺️ Neighbouring States', states: ['Andhra Pradesh', 'Karnataka', 'Kerala'] },
                                                    { group: '🇮🇳 Other States', states: ['Andaman and Nicobar Islands','Arunachal Pradesh','Assam','Bihar','Chandigarh','Chhattisgarh','Dadra and Nagar Haveli and Daman and Diu','Delhi','Goa','Gujarat','Haryana','Himachal Pradesh','Jammu and Kashmir','Jharkhand','Ladakh','Lakshadweep','Madhya Pradesh','Maharashtra','Manipur','Meghalaya','Mizoram','Nagaland','Odisha','Punjab','Rajasthan','Sikkim','Telangana','Tripura','Uttar Pradesh','Uttarakhand','West Bengal'] },
                                                ].map(({ group, states }) => (
                                                    <div key={group}>
                                                        <div className="px-3 py-1.5 text-xs font-semibold text-gray-400 bg-gray-50 border-b border-gray-100 sticky top-0">{group}</div>
                                                        {states.map(s => (
                                                            <button
                                                                key={s}
                                                                type="button"
                                                                onClick={() => {
                                                                    setForm(prev => ({ ...prev, state: s }));
                                                                    setStateDropdownOpen(false);
                                                                }}
                                                                className={`w-full text-left px-4 py-2.5 text-sm transition-colors hover:bg-maroon/5 border-b border-gray-50 last:border-0 ${
                                                                    form.state === s ? 'bg-maroon/10 text-maroon font-medium' : 'text-gray-700'
                                                                }`}
                                                            >
                                                                {s}
                                                            </button>
                                                        ))}
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        {errors.state && (
                                            <p className="text-red-500 text-xs mt-1">{errors.state}</p>
                                        )}
                                        {form.state && (
                                            <p className="text-xs text-maroon mt-1 font-medium">
                                                🚚 Standard delivery rate: {formatCurrency(shipping)}
                                            </p>
                                        )}
                                    </div>
                                </div>
                                {field('pincode', 'Pincode', 'text', '600001')}
                            </CardContent>
                        </Card>

                        {/* Payment Options */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg text-maroon">Payment Method</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                {apiError && (
                                    <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
                                        {apiError}
                                    </div>
                                )}

                                {/* T&C Note */}
                                <div className="rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-xs text-gray-700 leading-relaxed">
                                    <p className="font-semibold text-blue-800 mb-1">📋 Please note before placing your order:</p>
                                    <p>🎨 Saree colors may appear slightly different due to photography, lighting, and screen settings — this is completely normal. Returns or exchanges are accepted only for damaged or defective products. A video proof of the package being opened must be provided to process any return.</p>
                                </div>

                                {/* Return Policy — mandatory checkbox */}
                                <div id="return-policy-checkbox" className={`rounded-xl border p-4 ${returnPolicyError ? 'border-red-400 bg-red-50' : 'border-amber-300 bg-amber-50'}`}>
                                    <label className="flex items-start gap-3 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={returnPolicyAccepted}
                                            onChange={e => { setReturnPolicyAccepted(e.target.checked); setReturnPolicyError(false); }}
                                            className="mt-1 w-4 h-4 accent-maroon flex-shrink-0"
                                        />
                                        <span className="text-xs text-gray-700 leading-relaxed">
                                            <span className="font-semibold text-maroon">I agree to the Return Policy:</span>{' '}
                                            Returns are accepted <strong>only if the product is damaged</strong>. A{' '}
                                            <strong>video proof of the package being opened</strong> must be provided to process any return. No other returns will be accepted.
                                        </span>
                                    </label>
                                    {returnPolicyError && (
                                        <p className="text-red-600 text-xs mt-2 font-medium">⚠️ Please accept the return policy to continue.</p>
                                    )}
                                </div>

                                <Button
                                    size="lg"
                                    className="w-full bg-maroon hover:bg-maroon-dark text-beige flex items-center justify-center gap-3 font-semibold"
                                    onClick={handleRazorpay}
                                    disabled={isProcessing}
                                    aria-label="Pay Online with Razorpay"
                                >
                                    {isProcessing ? (
                                        <span className="flex items-center gap-2">
                                            <span className="h-4 w-4 border-2 border-maroon border-t-transparent rounded-full animate-spin" />
                                            Processing...
                                        </span>
                                    ) : (
                                        <>
                                            <CreditCard className="h-5 w-5" />
                                            Pay Online (UPI / Card / Netbanking)
                                        </>
                                    )}
                                </Button>

                                <p className="text-xs text-gray-400 text-center pt-1">
                                    Secured by Razorpay — Orders saved to our database.
                                </p>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Order Summary — 2 cols */}
                    <div className="lg:col-span-2">
                        <Card className="sticky top-20">
                            <CardHeader>
                                <CardTitle className="text-lg text-maroon">Order Summary</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3 mb-4 max-h-60 overflow-y-auto pr-1">
                                    {items.map(item => {
                                        const unitPrice = calculateFinalUnitPrice(
                                            item.product.price,
                                            item.quantity,
                                            item.selectedBlouse.price
                                        );
                                        const discountPct = getBulkDiscountPercentage(item.quantity);
                                        return (
                                            <div key={item.productId} className="flex gap-3 items-start pb-3 border-b last:border-0">
                                                <img
                                                    src={item.product.image}
                                                    alt={item.product.name}
                                                    className="w-12 h-16 object-cover rounded flex-shrink-0"
                                                    loading="lazy"
                                                />
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-medium line-clamp-2">{item.product.name}</p>
                                                    <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                                                    {discountPct > 0 && (
                                                        <Badge className="text-xs bg-green-100 text-green-700 mt-0.5">{discountPct}% off</Badge>
                                                    )}
                                                </div>
                                                <div className="text-right flex-shrink-0">
                                                    <p className="text-sm font-bold text-maroon">
                                                        {formatCurrency(unitPrice * item.quantity)}
                                                    </p>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>

                                <div className="space-y-2 pt-3 border-t">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600">Subtotal</span>
                                        <span>{formatCurrency(cartSummary.subtotal)}</span>
                                    </div>
                                    {cartSummary.discount > 0 && (
                                        <div className="flex justify-between text-sm text-green-700">
                                            <span>Bulk Discount ({getBulkDiscountPercentage(cartSummary.totalQuantity)}%)</span>
                                            <span>-{formatCurrency(cartSummary.discount)}</span>
                                        </div>
                                    )}
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600">
                                            Shipping
                                            <span className="block text-xs text-gray-400">{zoneLabel}</span>
                                        </span>
                                        <span className="font-medium text-maroon">
                                            {formatCurrency(shipping)}
                                        </span>
                                    </div>
                                    <div className="flex justify-between font-bold text-lg pt-2 border-t">
                                        <span>Total</span>
                                        <span className="text-maroon">{formatCurrency(totalWithShipping)}</span>
                                    </div>
                                </div>

                                <div className="mt-4 flex items-center gap-2 text-xs text-gray-400">
                                    <CheckCircle className="h-3 w-3 text-green-500" />
                                    Secure checkout — saved to database
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
};
