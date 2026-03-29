import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CreditCard, Truck, CheckCircle, ArrowLeft } from 'lucide-react';
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
    const [deliveryCharges, setDeliveryCharges] = useState<DeliveryCharges>({ tamilnadu: 50, nearby: 80, others: 100 });

    // Fetch delivery charges from backend on mount
    useEffect(() => {
        api.getDeliveryCharges().then(setDeliveryCharges).catch(() => { });
    }, []);

    const shipping = form.state.trim()
        ? getShippingCharge(form.state, deliveryCharges)
        : deliveryCharges.others;
    const totalWithShipping = cartSummary.total + shipping;
    const zoneLabel = form.state.trim() ? getZoneLabel(getDeliveryZone(form.state)) : 'Enter state for exact charge';

    if (items.length === 0) {
        navigate('/cart', { replace: true });
        return null;
    }

    const validate = (): boolean => {
        const errs: Partial<FormData> = {};
        if (!form.name.trim()) errs.name = 'Name is required';
        if (!form.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) errs.email = 'Valid email required';
        if (!form.phone.match(/^[+\d\s-]{10,15}$/)) errs.phone = 'Valid phone required';
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

    const handleCOD = async () => {
        if (!validate()) return;
        setIsProcessing(true);
        setApiError('');
        try {
            const payment: Payment = { method: 'cod', status: 'pending' };
            const saved = await api.createOrder(buildOrderPayload(payment));
            clearCart();
            navigate(`/track-order?orderId=${saved._id}`);
        } catch (err: any) {
            setApiError(err.message || 'Failed to place order. Please try again.');
            setIsProcessing(false);
        }
    };

    const handleRazorpay = async () => {
        if (!validate()) return;
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
            <Input
                id={id}
                type={type}
                placeholder={placeholder}
                value={form[id]}
                onChange={e => setForm(prev => ({ ...prev, [id]: e.target.value }))}
                className={errors[id] ? 'border-red-400 focus:ring-red-300' : 'border-gray-300 focus:border-maroon'}
                aria-invalid={!!errors[id]}
                aria-describedby={errors[id] ? `${id}-error` : undefined}
            />
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
                                    {field('email', 'Email', 'email', 'you@example.com')}
                                    {field('phone', 'Phone', 'tel', '+91 98765 43210')}
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
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            State <span className="text-red-500">*</span>
                                        </label>
                                        <select
                                            value={form.state}
                                            onChange={(e) => setForm({ ...form, state: e.target.value })}
                                            className={`w-full px-3 py-3 border rounded-xl text-sm bg-gray-50 focus:bg-white outline-none transition-all
                                                ${errors.state
                                                    ? 'border-red-400 focus:border-red-400 focus:ring-2 focus:ring-red-400/10'
                                                    : 'border-gray-200 focus:border-maroon focus:ring-2 focus:ring-maroon/10'
                                                }`}
                                        >
                                            <option value="">-- Select State --</option>
                                            <optgroup label="Tamil Nadu (₹50)">
                                                <option value="Tamil Nadu">Tamil Nadu</option>
                                                <option value="Puducherry">Puducherry</option>
                                            </optgroup>
                                            <optgroup label="Neighbouring States (₹80)">
                                                <option value="Andhra Pradesh">Andhra Pradesh</option>
                                                <option value="Karnataka">Karnataka</option>
                                                <option value="Kerala">Kerala</option>
                                            </optgroup>
                                            <optgroup label="Other States (₹100)">
                                                <option value="Andaman and Nicobar Islands">Andaman and Nicobar Islands</option>
                                                <option value="Arunachal Pradesh">Arunachal Pradesh</option>
                                                <option value="Assam">Assam</option>
                                                <option value="Bihar">Bihar</option>
                                                <option value="Chandigarh">Chandigarh</option>
                                                <option value="Chhattisgarh">Chhattisgarh</option>
                                                <option value="Dadra and Nagar Haveli and Daman and Diu">Dadra and Nagar Haveli and Daman and Diu</option>
                                                <option value="Delhi">Delhi</option>
                                                <option value="Goa">Goa</option>
                                                <option value="Gujarat">Gujarat</option>
                                                <option value="Haryana">Haryana</option>
                                                <option value="Himachal Pradesh">Himachal Pradesh</option>
                                                <option value="Jammu and Kashmir">Jammu and Kashmir</option>
                                                <option value="Jharkhand">Jharkhand</option>
                                                <option value="Ladakh">Ladakh</option>
                                                <option value="Lakshadweep">Lakshadweep</option>
                                                <option value="Madhya Pradesh">Madhya Pradesh</option>
                                                <option value="Maharashtra">Maharashtra</option>
                                                <option value="Manipur">Manipur</option>
                                                <option value="Meghalaya">Meghalaya</option>
                                                <option value="Mizoram">Mizoram</option>
                                                <option value="Nagaland">Nagaland</option>
                                                <option value="Odisha">Odisha</option>
                                                <option value="Puducherry">Puducherry</option>
                                                <option value="Punjab">Punjab</option>
                                                <option value="Rajasthan">Rajasthan</option>
                                                <option value="Sikkim">Sikkim</option>
                                                <option value="Telangana">Telangana</option>
                                                <option value="Tripura">Tripura</option>
                                                <option value="Uttar Pradesh">Uttar Pradesh</option>
                                                <option value="Uttarakhand">Uttarakhand</option>
                                                <option value="West Bengal">West Bengal</option>
                                            </optgroup>
                                        </select>
                                        {errors.state && (
                                            <p className="text-red-500 text-xs mt-1">{errors.state}</p>
                                        )}
                                        {form.state && (
                                            <p className="text-xs text-maroon mt-1 font-medium">
                                                🚚 Delivery charge for {form.state}: {formatCurrency(shipping)}
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

                                <Button
                                    size="lg"
                                    className="w-full bg-maroon hover:bg-maroon-dark text-beige flex items-center justify-center gap-3"
                                    onClick={handleCOD}
                                    disabled={isProcessing}
                                    aria-label="Pay on Delivery"
                                >
                                    <Truck className="h-5 w-5" />
                                    {isProcessing ? 'Placing Order...' : 'Pay on Delivery'}
                                </Button>

                                <Button
                                    size="lg"
                                    variant="outline"
                                    className="w-full border-gold text-maroon hover:bg-gold hover:text-maroon flex items-center justify-center gap-3"
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
