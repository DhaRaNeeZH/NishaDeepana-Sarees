import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, Heart, Share2, Package, Shield, ChevronLeft, ChevronRight, Play } from 'lucide-react';
import { useProducts } from '../contexts/ProductContext';
import { formatCurrency } from '../lib/utils';
import { calculateBulkUnitPrice, getBulkDiscountPercentage } from '../utils/pricing';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { ProductCard } from '../components/ProductCard';
import { BlouseBadge } from '../components/BlouseBadge';
import { useCart } from '../contexts/CartContext';
import { useWishlist } from '../contexts/WishlistContext';
import { api } from '../lib/api';
import { Saree } from '../lib/types';

export const ProductDetailPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { products } = useProducts();
    const saree = products.find(s => s.id === id);
    const [selectedImage, setSelectedImage] = useState(0);
    const [quantity, setQuantity] = useState(1);
    const [colorVariants, setColorVariants] = useState<Saree[]>([]);
    const { addItem } = useCart();
    const { isWishlisted, toggleWishlist } = useWishlist();
    const isLiked = id ? isWishlisted(id) : false;

    if (!saree) {
        return (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
                <h1 className="text-2xl font-bold mb-4">Product not found</h1>
                <Link to="/collections">
                    <Button className="bg-maroon hover:bg-maroon-dark text-beige">Back to Collections</Button>
                </Link>
            </div>
        );
    }

    const getRelatedScore = (s: Saree) => {
        let score = 0;
        if (s.category === saree.category) score += 2;
        if (s.sareeType === saree.sareeType) score += 2;
        if (s.colorTag && saree.colorTag && s.colorTag === saree.colorTag) score += 1;
        if (s.color && saree.color && s.color === saree.color) score += 1;
        return score;
    };

    const relatedSarees = products
        .filter(s => s.id !== saree.id)
        .sort((a, b) => getRelatedScore(b) - getRelatedScore(a))
        .slice(0, 4);

    const images = saree.images && saree.images.length > 0 ? [saree.image, ...saree.images] : [saree.image];
    const media = saree.video 
        ? [...images.map(url => ({ type: 'image', url })), { type: 'video', url: saree.video }]
        : images.map(url => ({ type: 'image', url }));

    useEffect(() => {
        if (saree?.colorGroup) {
            api.getColorVariants(saree.colorGroup)
                .then(variants => setColorVariants(variants.filter(v => v.id !== saree.id)))
                .catch(console.error);
        } else {
            setColorVariants([]);
        }
        // Reset state on navigation
        setSelectedImage(0);
        setQuantity(1);
    }, [saree?.colorGroup, saree?.id]);

    const getColorStyle = (tag?: string) => {
        if (!tag) return { backgroundColor: '#f3f4f6' };
        if (tag === 'Multicolor') return { background: 'linear-gradient(45deg, red, orange, yellow, green, blue, indigo, violet)' };
        return { backgroundColor: tag.toLowerCase() };
    };

    // Calculate pricing using new pricing engine
    const basePrice = saree.price;
    const subtotal = basePrice * quantity;
    const unitPriceWithDiscount = calculateBulkUnitPrice(basePrice, quantity);
    const totalPrice = unitPriceWithDiscount * quantity;
    const discount = subtotal - totalPrice;
    const discountPercentage = getBulkDiscountPercentage(quantity);

    const handleAddToCart = () => {
        addItem(saree, quantity);
    };

    const handleBuyNow = () => {
        addItem(saree, quantity);
        navigate('/checkout');
    };

    return (
        <div className="min-h-screen bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Breadcrumb */}
                <div className="flex items-center gap-2 text-sm text-gray-600 mb-8">
                    <Link to="/" className="hover:text-maroon">Home</Link>
                    <span>/</span>
                    <Link to="/collections" className="hover:text-maroon">Collections</Link>
                    <span>/</span>
                    <span className="text-gray-900">{saree.name}</span>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
                    {/* Image Gallery */}
                    <div>
                        <div className="relative aspect-[3/4] rounded-lg overflow-hidden bg-gray-100 mb-4 group">
                            {media[selectedImage].type === 'video' ? (
                                <video
                                    src={media[selectedImage].url}
                                    controls
                                    autoPlay
                                    muted
                                    loop
                                    className="w-full h-full object-contain bg-black"
                                />
                            ) : (
                                <img
                                    src={media[selectedImage].url}
                                    alt={saree.name}
                                    className="w-full h-full object-contain bg-gray-50"
                                />
                            )}
                            {media.length > 1 && (
                                <>
                                    <button
                                        onClick={() => setSelectedImage((selectedImage - 1 + media.length) % media.length)}
                                        className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white z-10"
                                    >
                                        <ChevronLeft className="h-6 w-6 text-maroon" />
                                    </button>
                                    <button
                                        onClick={() => setSelectedImage((selectedImage + 1) % media.length)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white z-10"
                                    >
                                        <ChevronRight className="h-6 w-6 text-maroon" />
                                    </button>
                                </>
                            )}
                        </div>
                        {media.length > 1 && (
                            <div className="grid grid-cols-4 gap-2">
                                {media.map((item, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => setSelectedImage(idx)}
                                        className={`relative aspect-square rounded-md overflow-hidden border-2 ${selectedImage === idx ? 'border-maroon' : 'border-transparent'}`}
                                    >
                                        {item.type === 'video' ? (
                                            <>
                                                <video src={item.url} className="w-full h-full object-cover opacity-70" />
                                                <div className="absolute inset-0 flex items-center justify-center">
                                                    <Play className="h-6 w-6 text-white drop-shadow-md" fill="currentColor" />
                                                </div>
                                            </>
                                        ) : (
                                            <img src={item.url} alt={`${saree.name} ${idx + 1}`} className="w-full h-full object-cover bg-gray-50" />
                                        )}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Product Info */}
                    <div>
                        <div className="flex flex-wrap gap-2 mb-4">
                            {saree.featured && <Badge className="bg-maroon text-beige">Featured</Badge>}
                            <BlouseBadge blouseType={saree.blouseIncluded} />
                        </div>

                        <h1 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900">{saree.name}</h1>

                        <div className="flex items-center gap-4 mb-6">
                            <p className="text-xs text-gray-400 italic">Pre-verified authentic collection</p>
                        </div>

                        <div className="mb-6">
                            <div className="flex items-baseline gap-3 mb-1">
                                <div className="text-4xl font-bold text-maroon">
                                    {formatCurrency(basePrice)}
                                </div>
                                {saree.originalPrice && saree.originalPrice > basePrice && (
                                    <div className="text-xl text-gray-400 line-through decoration-maroon/40 font-medium">
                                        {formatCurrency(saree.originalPrice)}
                                    </div>
                                )}
                            </div>
                            <div className="flex items-center gap-2">
                                <p className="text-gray-500 text-xs">Inclusive of all taxes</p>
                                {saree.freeDelivery && (
                                    <Badge className="bg-green-100 text-green-700 border-green-200 text-[10px] py-0">FREE DELIVERY</Badge>
                                )}
                            </div>
                        </div>

                        <p className="text-gray-700 mb-6 leading-relaxed whitespace-pre-wrap">{saree.description}</p>

                        <div className="grid grid-cols-2 gap-4 mb-6">
                            <div>
                                <span className="text-sm text-gray-600">Saree Type</span>
                                <p className="font-semibold text-maroon">{saree.sareeType}</p>
                            </div>
                            <div>
                                <span className="text-sm text-gray-600">Category</span>
                                <p className="font-semibold">{saree.category}</p>
                            </div>
                            <div>
                                <span className="text-sm text-gray-600">Fabric</span>
                                <p className="font-semibold">{saree.fabric}</p>
                            </div>
                            <div>
                                <span className="text-sm text-gray-600">Color</span>
                                <p className="font-semibold">{saree.color}</p>
                            </div>
                            <div>
                                <span className="text-sm text-gray-600">Blouse Included</span>
                                <p className="font-semibold">
                                    {saree.blouseIncluded === 'running' && 'Running Blouse'}
                                    {saree.blouseIncluded === 'contrast' && 'Contrast Blouse'}
                                    {saree.blouseIncluded === 'both' && 'Running + Contrast Blouse'}
                                    {saree.blouseIncluded === 'none' && 'No Blouse'}
                                </p>
                            </div>
                            <div>
                                <span className="text-sm text-gray-600">Availability</span>
                                <p className="font-semibold text-green-600">In Stock</p>
                            </div>
                        </div>


                        {/* Color Variants */}
                        {colorVariants.length > 0 && (
                            <div className="mb-6">
                                <span className="text-sm font-medium mb-2 block">Also available in:</span>
                                <div className="flex flex-wrap gap-3">
                                    <div className="relative cursor-default border-2 border-maroon rounded-full p-0.5" title={`${saree.colorTag || saree.color} (Selected)`}>
                                        <div 
                                            className="w-8 h-8 rounded-full border border-gray-200" 
                                            style={getColorStyle(saree.colorTag)} 
                                        />
                                    </div>
                                    {colorVariants.map(variant => (
                                        <Link 
                                            key={variant.id} 
                                            to={`/product/${variant.id}`} 
                                            className="border-2 border-transparent hover:border-gray-300 rounded-full p-0.5 transition-colors"
                                            title={variant.colorTag || variant.color}
                                        >
                                            <div 
                                                className="w-8 h-8 rounded-full border border-gray-200" 
                                                style={getColorStyle(variant.colorTag)} 
                                            />
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Quantity Selector */}
                        <div className="mb-6">
                            <label className="block text-sm font-medium mb-2">Quantity</label>
                            <div className="flex items-center gap-4">
                                <div className="flex items-center border border-maroon/30 rounded-lg overflow-hidden">
                                    <button
                                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                        className="px-4 py-3 text-maroon hover:bg-maroon hover:text-beige transition-colors font-bold text-lg select-none"
                                        aria-label="Decrease quantity"
                                    >
                                        −
                                    </button>
                                    <span className="px-5 py-3 font-semibold text-lg min-w-[3rem] text-center border-x border-maroon/30">
                                        {quantity}
                                    </span>
                                    <button
                                        onClick={() => setQuantity(quantity + 1)}
                                        className="px-4 py-3 text-maroon hover:bg-maroon hover:text-beige transition-colors font-bold text-lg select-none"
                                        aria-label="Increase quantity"
                                    >
                                        +
                                    </button>
                                </div>
                                {discountPercentage > 0 && (
                                    <Badge className="bg-green-100 text-green-800 border-green-300">
                                        {discountPercentage}% Bulk Discount Applied!
                                    </Badge>
                                )}
                            </div>
                        </div>

                        {/* Price Breakdown */}
                        <div className="mb-6 p-4 bg-beige-light rounded-lg border border-gold">
                            <h3 className="font-semibold mb-3 text-maroon">Price Breakdown</h3>
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Base Price per Saree:</span>
                                    <span className="font-medium">{formatCurrency(basePrice)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Quantity:</span>
                                    <span className="font-medium">× {quantity}</span>
                                </div>
                                <div className="flex justify-between pt-2 border-t border-gold">
                                    <span className="text-gray-600">Subtotal:</span>
                                    <span className="font-medium">{formatCurrency(subtotal)}</span>
                                </div>
                                {discount > 0 && (
                                    <div className="flex justify-between text-green-700">
                                        <span>Bulk Discount ({discountPercentage}%):</span>
                                        <span className="font-semibold">−{formatCurrency(discount)}</span>
                                    </div>
                                )}
                                <div className="flex justify-between pt-2 border-t border-maroon">
                                    <span className="font-semibold text-maroon text-lg">Total:</span>
                                    <span className="font-bold text-maroon text-2xl">{formatCurrency(totalPrice)}</span>
                                </div>
                            </div>
                        </div>

                        {/* Action Buttons — 2×2 grid so all buttons visible on mobile */}
                        <div className="mb-8 space-y-3">
                            <div className="grid grid-cols-2 gap-3">
                                <Button
                                    size="lg"
                                    className="group bg-maroon hover:bg-maroon-dark text-beige"
                                    onClick={handleAddToCart}
                                    id="add-to-cart-btn"
                                >
                                    <ShoppingCart className="mr-2 h-5 w-5 group-hover:animate-bounce" />
                                    Add to Cart
                                </Button>
                                <Button
                                    size="lg"
                                    className="bg-maroon hover:bg-maroon-dark text-beige font-bold border-2 border-gold shadow-[0_4px_20px_rgba(128,0,0,0.2)] hover:shadow-[0_8px_30px_rgba(128,0,0,0.3)] transition-all active:scale-[0.98]"
                                    onClick={handleBuyNow}
                                    id="buy-now-btn"
                                >
                                    Buy Now
                                </Button>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <Button
                                    size="lg"
                                    variant="outline"
                                    onClick={() => id && toggleWishlist(id)}
                                    className={`border-maroon ${isLiked ? 'bg-red-50 text-red-500 border-red-300' : 'text-maroon'} hover:bg-maroon hover:text-beige`}
                                    id="wishlist-btn"
                                >
                                    <Heart className={`mr-2 h-5 w-5 ${isLiked ? 'fill-red-500 text-red-500' : ''}`} />
                                    {isLiked ? 'Wishlisted' : 'Wishlist'}
                                </Button>
                                <Button
                                    size="lg"
                                    variant="outline"
                                    className="border-maroon text-maroon hover:bg-maroon hover:text-beige"
                                    id="share-btn"
                                    onClick={() => {
                                        if (navigator.share) {
                                            navigator.share({ title: saree.name, url: window.location.href });
                                        } else {
                                            navigator.clipboard.writeText(window.location.href);
                                            alert('Link copied!');
                                        }
                                    }}
                                >
                                    <Share2 className="mr-2 h-4 w-4" />
                                    Share
                                </Button>
                            </div>
                        </div>

                        {/* Features */}
                        <div className="grid grid-cols-1 gap-4">
                            <Card className="border-maroon-light/30">
                                <CardContent className="flex items-center p-4">
                                    <Package className="h-8 w-8 text-maroon mr-4 flex-shrink-0" />
                                    <div>
                                        <h4 className="font-semibold">Return Policy</h4>
                                        <p className="text-sm text-gray-600">Returns accepted only for damaged items with unboxing video proof.</p>
                                    </div>
                                </CardContent>
                            </Card>
                            <Card className="border-maroon-light/30">
                                <CardContent className="flex items-center p-4">
                                    <Shield className="h-8 w-8 text-maroon mr-4" />
                                    <div>
                                        <h4 className="font-semibold">100% Authentic</h4>
                                        <p className="text-sm text-gray-600">Guaranteed genuine products</p>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>

                {/* Related Products */}
                {relatedSarees.length > 0 && (
                    <div>
                        <h2 className="text-3xl font-bold mb-8 text-gray-900">You May Also Like</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            {relatedSarees.map((s) => (
                                <ProductCard key={s.id} saree={s} />
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
