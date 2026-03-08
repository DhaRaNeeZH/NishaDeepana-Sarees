import React, { useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, ShoppingBag, ArrowRight, Plus, Minus } from 'lucide-react';
import { formatCurrency } from '../lib/utils';
import { calculateFinalUnitPrice, getBulkDiscountPercentage } from '../utils/pricing';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { BlouseBadge } from '../components/BlouseBadge';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';

export const CartPage: React.FC = () => {
    const { items, removeItem, updateQuantity, cartSummary } = useCart();
    const { isAuthenticated } = useAuth();
    const navigate = useNavigate();

    // Debounced quantity input state — keyed by productId
    const [inputValues, setInputValues] = React.useState<Record<string, string>>({});

    // Sync input values when items change
    React.useEffect(() => {
        setInputValues(prev => {
            const next = { ...prev };
            items.forEach(item => {
                if (!(item.productId in next)) {
                    next[item.productId] = String(item.quantity);
                }
            });
            return next;
        });
    }, [items]);

    const handleQtyInput = useCallback((productId: string, raw: string) => {
        setInputValues(prev => ({ ...prev, [productId]: raw }));
        const parsed = parseInt(raw, 10);
        if (!isNaN(parsed) && parsed >= 1) {
            updateQuantity(productId, parsed);
        }
    }, [updateQuantity]);

    const handleQtyBlur = useCallback((productId: string, currentQty: number) => {
        // Ensure displayed value matches actual quantity on blur
        setInputValues(prev => ({ ...prev, [productId]: String(currentQty) }));
    }, []);

    const handleQuickAdd = useCallback((productId: string, currentQty: number, amount: number) => {
        const newQty = currentQty + amount;
        updateQuantity(productId, newQty);
        setInputValues(prev => ({ ...prev, [productId]: String(newQty) }));
    }, [updateQuantity]);

    if (items.length === 0) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center max-w-md px-4">
                    <ShoppingBag className="h-24 w-24 text-gray-300 mx-auto mb-4" />
                    <h2 className="text-2xl md:text-3xl font-bold mb-2 text-gray-900">Your cart is empty</h2>
                    <p className="text-gray-600 mb-6">Add some beautiful sarees to get started!</p>
                    {!isAuthenticated && (
                        <p className="text-sm text-orange-600 mb-4">
                            💡 Login to save your cart across sessions!
                        </p>
                    )}
                    <Link to="/collections">
                        <Button size="lg" className="bg-maroon hover:bg-maroon-dark text-beige">
                            Browse Collection
                            <ArrowRight className="ml-2 h-5 w-5" />
                        </Button>
                    </Link>
                </div>
            </div>
        );
    }

    const shipping = cartSummary.subtotal >= 2000 ? 0 : 200;
    const totalWithShipping = cartSummary.total + shipping;
    const discountPct = getBulkDiscountPercentage(cartSummary.totalQuantity);

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl md:text-4xl font-bold text-gray-900">Shopping Cart</h1>
                    <Badge className="bg-maroon text-beige text-lg px-4 py-2">
                        {cartSummary.totalQuantity} {cartSummary.totalQuantity === 1 ? 'item' : 'items'}
                    </Badge>
                </div>

                {/* Bulk discount notification */}
                {cartSummary.totalQuantity >= 10 && (
                    <Card className="mb-6 bg-green-50 border-green-200">
                        <CardContent className="p-4">
                            <p className="text-green-800 font-medium text-center">
                                🎉 Bulk Discount Applied! You're saving {formatCurrency(cartSummary.discount)} ({discountPct}% off)
                            </p>
                        </CardContent>
                    </Card>
                )}

                {cartSummary.totalQuantity >= 5 && cartSummary.totalQuantity < 10 && (
                    <Card className="mb-6 bg-blue-50 border-blue-200">
                        <CardContent className="p-4">
                            <p className="text-blue-800 font-medium text-center">
                                💡 Add {10 - cartSummary.totalQuantity} more to get 10% bulk discount!
                            </p>
                        </CardContent>
                    </Card>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Cart Items */}
                    <div className="lg:col-span-2 space-y-4">
                        {items.map(item => {
                            const discountedUnitPrice = calculateFinalUnitPrice(
                                item.product.price,
                                item.quantity,
                                item.selectedBlouse.price
                            );
                            const itemTotal = discountedUnitPrice * item.quantity;
                            const itemDiscountPct = getBulkDiscountPercentage(item.quantity);
                            const inputVal = inputValues[item.productId] ?? String(item.quantity);

                            return (
                                <Card key={item.productId} className="overflow-hidden">
                                    <CardContent className="p-6">
                                        <div className="flex gap-4">
                                            {/* Product Image */}
                                            <Link to={`/product/${item.productId}`} className="flex-shrink-0">
                                                <img
                                                    src={item.product.image}
                                                    alt={item.product.name}
                                                    className="w-24 h-32 md:w-32 md:h-40 object-cover rounded-md hover:opacity-75 transition-opacity"
                                                    loading="lazy"
                                                />
                                            </Link>

                                            {/* Product Details */}
                                            <div className="flex-1 min-w-0">
                                                <div className="flex justify-between items-start mb-2">
                                                    <Link to={`/product/${item.productId}`}>
                                                        <h3 className="font-semibold text-lg hover:text-maroon transition-colors line-clamp-2">
                                                            {item.product.name}
                                                        </h3>
                                                    </Link>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => removeItem(item.productId)}
                                                        className="text-red-500 hover:text-red-700 hover:bg-red-50 ml-2 flex-shrink-0"
                                                        aria-label={`Remove ${item.product.name}`}
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>

                                                <div className="flex flex-wrap gap-2 mb-3">
                                                    <span className="text-sm text-gray-600">{item.product.sareeType}</span>
                                                    <span className="text-gray-300">•</span>
                                                    <span className="text-sm text-gray-600">{item.product.fabric}</span>
                                                    <BlouseBadge blouseType={item.product.blouseIncluded} className="text-xs" />
                                                </div>

                                                {/* Pricing */}
                                                <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
                                                    <div>
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <span className="text-xl font-bold text-maroon">
                                                                {formatCurrency(discountedUnitPrice)}
                                                            </span>
                                                            <span className="text-sm text-gray-400">/ piece</span>
                                                            {itemDiscountPct > 0 && (
                                                                <Badge className="bg-green-100 text-green-700 text-xs px-1.5 py-0.5">
                                                                    {itemDiscountPct}% off
                                                                </Badge>
                                                            )}
                                                        </div>
                                                        {itemDiscountPct > 0 && (
                                                            <div className="text-sm text-gray-400 line-through">
                                                                {formatCurrency(item.product.price)} / piece
                                                            </div>
                                                        )}
                                                        <div className="text-sm font-semibold text-gray-700 mt-1">
                                                            Line total: {formatCurrency(itemTotal)}
                                                        </div>
                                                    </div>

                                                    {/* Quantity Controls */}
                                                    <div className="flex flex-col gap-2">
                                                        {/* +/- with numeric input */}
                                                        <div className="flex items-center border rounded-md border-maroon overflow-hidden">
                                                            <button
                                                                onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                                                                disabled={item.quantity <= 1}
                                                                className="px-3 py-2 hover:bg-maroon/10 text-maroon font-bold disabled:opacity-30 transition-colors"
                                                                aria-label="Decrease quantity"
                                                            >
                                                                <Minus className="h-3 w-3" />
                                                            </button>
                                                            <input
                                                                type="number"
                                                                min="1"
                                                                value={inputVal}
                                                                onChange={e => handleQtyInput(item.productId, e.target.value)}
                                                                onBlur={() => handleQtyBlur(item.productId, item.quantity)}
                                                                className="w-16 text-center border-x border-maroon py-2 font-semibold text-sm focus:outline-none focus:bg-gold/5"
                                                                aria-label="Quantity"
                                                            />
                                                            <button
                                                                onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                                                                className="px-3 py-2 hover:bg-maroon/10 text-maroon font-bold transition-colors"
                                                                aria-label="Increase quantity"
                                                            >
                                                                <Plus className="h-3 w-3" />
                                                            </button>
                                                        </div>

                                                        {/* Quick-add buttons */}
                                                        <div className="flex gap-1">
                                                            {[10, 50, 100].map(amt => (
                                                                <button
                                                                    key={amt}
                                                                    onClick={() => handleQuickAdd(item.productId, item.quantity, amt)}
                                                                    className="flex-1 text-xs py-1.5 border border-gold/40 text-maroon rounded hover:bg-gold/10 transition-colors font-medium"
                                                                    aria-label={`Add ${amt} more`}
                                                                >
                                                                    +{amt}
                                                                </button>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>

                    {/* Order Summary */}
                    <div className="lg:col-span-1">
                        <Card className="sticky top-20">
                            <CardContent className="p-6">
                                <h2 className="text-xl font-bold mb-6 text-gray-900">Order Summary</h2>

                                <div className="space-y-3 mb-6">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Subtotal ({cartSummary.totalQuantity} items)</span>
                                        <span className="font-semibold">{formatCurrency(cartSummary.subtotal)}</span>
                                    </div>
                                    {cartSummary.discount > 0 && (
                                        <div className="flex justify-between text-green-700">
                                            <span className="font-medium">Bulk Discount ({discountPct}%)</span>
                                            <span className="font-semibold">−{formatCurrency(cartSummary.discount)}</span>
                                        </div>
                                    )}
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Shipping</span>
                                        <span className={shipping === 0 ? 'text-green-600 font-semibold' : ''}>
                                            {shipping === 0 ? 'FREE' : formatCurrency(shipping)}
                                        </span>
                                    </div>
                                    {cartSummary.subtotal < 2000 && cartSummary.subtotal >= 1500 && (
                                        <p className="text-sm text-orange-600">
                                            💡 Add {formatCurrency(2000 - cartSummary.subtotal)} more for free shipping!
                                        </p>
                                    )}
                                    <div className="border-t border-maroon/20 pt-3">
                                        <div className="flex justify-between text-lg font-bold">
                                            <span className="text-gray-900">Total</span>
                                            <span className="text-maroon text-2xl">{formatCurrency(totalWithShipping)}</span>
                                        </div>
                                    </div>
                                </div>

                                <Button
                                    size="lg"
                                    className="w-full mb-4 bg-maroon hover:bg-maroon-dark text-beige"
                                    onClick={() => navigate('/checkout')}
                                >
                                    Proceed to Checkout
                                    <ArrowRight className="ml-2 h-5 w-5" />
                                </Button>

                                <Link to="/collections">
                                    <Button
                                        variant="outline"
                                        size="lg"
                                        className="w-full border-maroon text-maroon hover:bg-maroon hover:text-beige"
                                    >
                                        Continue Shopping
                                    </Button>
                                </Link>

                                {/* Coupon code */}
                                <div className="mt-6 pt-6 border-t">
                                    <h3 className="font-semibold mb-2 text-sm">Have a coupon code?</h3>
                                    <div className="flex gap-2">
                                        <Input placeholder="Enter code" className="border-gray-300" aria-label="Coupon code" />
                                        <Button variant="outline" className="border-maroon text-maroon hover:bg-maroon hover:text-beige">
                                            Apply
                                        </Button>
                                    </div>
                                </div>

                                {!isAuthenticated && (
                                    <div className="mt-4 pt-4 border-t">
                                        <p className="text-sm text-gray-500 mb-3">
                                            💡 Login to save your cart and view order history!
                                        </p>
                                        <Link to="/login">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="w-full border-gold text-maroon hover:bg-gold hover:text-maroon"
                                            >
                                                Login Now
                                            </Button>
                                        </Link>
                                    </div>
                                )}

                                {/* Bulk discount tier info */}
                                <div className="mt-4 pt-4 border-t">
                                    <p className="text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">Bulk Discount Tiers</p>
                                    {[
                                        { qty: '10–19 pcs', pct: '10%' },
                                        { qty: '20–49 pcs', pct: '15%' },
                                        { qty: '50–99 pcs', pct: '20%' },
                                        { qty: '100+ pcs', pct: '30%' },
                                    ].map(tier => (
                                        <div key={tier.qty} className="flex justify-between text-xs text-gray-500 py-0.5">
                                            <span>{tier.qty}</span>
                                            <span className="font-semibold text-green-700">{tier.pct} off</span>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
};
