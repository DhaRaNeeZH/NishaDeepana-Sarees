import React from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, Heart, Share2, Star, Package, Truck, Shield, ChevronLeft, ChevronRight } from 'lucide-react';
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
import { Input } from '../components/ui/input';

export const ProductDetailPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { products } = useProducts();
    const saree = products.find(s => s.id === id);
    const [selectedImage, setSelectedImage] = React.useState(0);
    const [quantity, setQuantity] = React.useState(1);
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

    const relatedSarees = products
        .filter(s => s.category === saree.category && s.id !== saree.id)
        .slice(0, 4);

    const images = saree.images && saree.images.length > 0 ? saree.images : [saree.image];

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
                            <img
                                src={images[selectedImage]}
                                alt={saree.name}
                                className="w-full h-full object-cover"
                            />
                            {images.length > 1 && (
                                <>
                                    <button
                                        onClick={() => setSelectedImage((selectedImage - 1 + images.length) % images.length)}
                                        className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white"
                                    >
                                        <ChevronLeft className="h-6 w-6 text-maroon" />
                                    </button>
                                    <button
                                        onClick={() => setSelectedImage((selectedImage + 1) % images.length)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white"
                                    >
                                        <ChevronRight className="h-6 w-6 text-maroon" />
                                    </button>
                                </>
                            )}
                        </div>
                        {images.length > 1 && (
                            <div className="grid grid-cols-4 gap-2">
                                {images.map((img, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => setSelectedImage(idx)}
                                        className={`aspect-square rounded-md overflow-hidden border-2 ${selectedImage === idx ? 'border-maroon' : 'border-transparent'
                                            }`}
                                    >
                                        <img src={img} alt={`${saree.name} ${idx + 1}`} className="w-full h-full object-cover" />
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
                            <div className="flex">
                                {[...Array(5)].map((_, i) => (
                                    <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                                ))}
                            </div>
                            <span className="text-gray-600">(124 reviews)</span>
                        </div>

                        <div className="mb-6">
                            <div className="text-4xl font-bold text-maroon mb-2">
                                {formatCurrency(basePrice)}
                            </div>
                            <p className="text-gray-600 text-sm">Base price • Inclusive of all taxes</p>
                        </div>

                        <p className="text-gray-700 mb-6 leading-relaxed">{saree.description}</p>

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
                                <p className="font-semibold capitalize">{saree.blouseIncluded === 'none' ? 'No Blouse' : `${saree.blouseIncluded} Blouse`}</p>
                            </div>
                            <div>
                                <span className="text-sm text-gray-600">Availability</span>
                                <p className="font-semibold text-green-600">In Stock</p>
                            </div>
                        </div>



                        {/* Quantity Selector */}
                        <div className="mb-6">
                            <label className="block text-sm font-medium mb-2">Quantity</label>
                            <div className="flex items-center gap-4">
                                <Input
                                    type="number"
                                    min="1"
                                    value={quantity}
                                    onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                                    className="w-32 h-12 border-maroon/30 focus:border-maroon text-center font-semibold"
                                />
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

                        {/* Action Buttons */}
                        <div className="flex gap-4 mb-8">
                            <Button
                                size="lg"
                                className="flex-1 group bg-maroon hover:bg-maroon-dark text-beige"
                                onClick={handleAddToCart}
                            >
                                <ShoppingCart className="mr-2 h-5 w-5 group-hover:animate-bounce" />
                                Add to Cart
                            </Button>
                            <Button
                                size="lg"
                                className="flex-1 bg-black hover:bg-gray-900 text-white font-bold transition-all shadow-lg hover:shadow-xl active:scale-[0.98]"
                                onClick={handleBuyNow}
                            >
                                Buy Now
                            </Button>
                            <Button
                                size="lg"
                                variant="outline"
                                onClick={() => id && toggleWishlist(id)}
                                className={`border-maroon ${isLiked ? 'bg-red-50 text-red-500 border-red-300' : 'text-maroon'} hover:bg-maroon hover:text-beige`}
                            >
                                <Heart className={`h-5 w-5 ${isLiked ? 'fill-red-500 text-red-500' : ''}`} />
                            </Button>
                            <Button
                                size="lg"
                                variant="outline"
                                className="border-maroon text-maroon hover:bg-maroon hover:text-beige"
                            >
                                <Share2 className="h-5 w-5" />
                            </Button>
                        </div>

                        {/* Features */}
                        <div className="grid grid-cols-1 gap-4">
                            <Card className="border-maroon-light/30">
                                <CardContent className="flex items-center p-4">
                                    <Truck className="h-8 w-8 text-maroon mr-4" />
                                    <div>
                                        <h4 className="font-semibold">Free Shipping</h4>
                                        <p className="text-sm text-gray-600">On orders above ₹2,000</p>
                                    </div>
                                </CardContent>
                            </Card>
                            <Card className="border-maroon-light/30">
                                <CardContent className="flex items-center p-4">
                                    <Package className="h-8 w-8 text-maroon mr-4" />
                                    <div>
                                        <h4 className="font-semibold">Easy Returns</h4>
                                        <p className="text-sm text-gray-600">7-day return policy</p>
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
