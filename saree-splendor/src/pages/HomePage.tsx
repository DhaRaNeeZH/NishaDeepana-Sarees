import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Star, TrendingUp, Package, Shield } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { ProductCard } from '../components/ProductCard';
import { useProducts } from '../contexts/ProductContext';
import { categories } from '../data/categories';
import { testimonials } from '../data/testimonials';
import heroImage from '../images/hero-saree.jpg';

export const HomePage: React.FC = () => {
    const { products } = useProducts();
    const featuredSarees = products.filter(s => s.featured).slice(0, 6);

    return (
        <div className="min-h-screen">
            {/* Hero Section */}
            <section className="relative h-[800px] md:h-[900px] overflow-hidden">
                {/* Background Image */}
                <div className="absolute inset-0">
                    <img
                        src={heroImage}
                        alt="Luxury Saree"
                        className="w-full h-full object-cover"
                    />
                    {/* Darker overlay to match reference */}
                    <div className="absolute inset-0 bg-gradient-to-r from-[#2C0A12]/95 via-[#4A0E1A]/90 to-[#4A0E1A]/60"></div>
                </div>

                {/* Content - Full width with edge padding */}
                <div className="relative w-full px-8 xl:px-16 h-full flex items-start pt-32 md:pt-40">
                    <div className="w-full lg:w-2/3 xl:w-1/2 text-white">

                        {/* Heading - Bolder and darker */}
                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-black leading-tight mb-6">
                            Nisha Deepana Sarees
                            <br />
                            <span className="text-[#D4AF37]">
                                Crafted Just for You
                            </span>
                        </h1>

                        {/* Subtext */}
                        <p className="text-base md:text-lg lg:text-xl text-white/90 mb-8 leading-relaxed">
                            Authentic South Indian cotton and silk sarees, thoughtfully curated and
                            tailored with elegance. Designed for timeless beauty.
                        </p>

                        {/* Buttons */}
                        <div className="flex flex-wrap gap-4">
                            <Link to="/collections">
                                <Button
                                    size="lg"
                                    className="bg-[#D4AF37] hover:bg-[#c49b2c] text-black font-semibold px-8"
                                >
                                    Explore Collection
                                    <ArrowRight className="ml-2 h-5 w-5" />
                                </Button>
                            </Link>

                            <Link to="/wholesale">
                                <Button
                                    size="lg"
                                    className="bg-white hover:bg-gray-100 text-black font-semibold px-8"
                                >
                                    Bulk Orders
                                </Button>
                            </Link>
                        </div>

                        {/* Trust Indicators */}
                        <div className="mt-12 flex flex-wrap gap-6 text-sm text-white/80">
                            <span>🧵 Made on Order</span>
                            <span>♾ Unlimited Availability</span>
                            <span>👗 Optional Blouse Customization</span>
                            <span>📦 Wholesale Friendly</span>
                        </div>
                    </div>
                </div>
            </section>
            {/* Features */}
            <section className="py-16 bg-white">
                <div className="w-full px-8 xl:px-16">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                        {[
                            { icon: Shield, title: 'Authentic Products', desc: '100% genuine handloom & silk sarees' },
                            { icon: Package, title: 'Fast Delivery', desc: 'Shipped within 2-3 business days' },
                            { icon: TrendingUp, title: 'Bulk Orders', desc: 'Special wholesale pricing available' },
                            { icon: Star, title: 'Premium Quality', desc: 'Handpicked for excellence' },
                        ].map((feature, idx) => (
                            <Card key={idx} className="text-center hover:shadow-lg transition-shadow">
                                <CardContent className="pt-6">
                                    <div className="inline-flex items-center justify-center w-12 h-12 bg-maroon/10 rounded-full mb-4">
                                        <feature.icon className="h-6 w-6 text-maroon" />
                                    </div>
                                    <h3 className="font-semibold mb-2">{feature.title}</h3>
                                    <p className="text-sm text-gray-600">{feature.desc}</p>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            </section>

            {/* Categories */}
            <section className="py-16 bg-gray-50">
                <div className="w-full px-8 xl:px-16">
                    <div className="text-center mb-12">
                        <h2 className="text-4xl font-bold mb-4">Shop by Category</h2>
                        <p className="text-gray-600">Explore our diverse collection of traditional and contemporary sarees</p>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
                        {categories.map((category) => (
                            <Link
                                key={category.id}
                                to={`/collections?category=${category.name}`}
                                className="group"
                            >
                                <div className="relative aspect-square rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-all">
                                    <img
                                        src={category.image}
                                        alt={category.name}
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex flex-col justify-end p-4">
                                        <h3 className="text-white font-semibold text-lg">{category.name}</h3>
                                        <p className="text-white/80 text-sm">{category.count} items</p>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            </section>

            {/* Featured Products */}
            <section className="py-16 bg-white">
                <div className="w-full px-8 xl:px-16">
                    <div className="text-center mb-12">
                        <h2 className="text-4xl font-bold mb-4">Featured Sarees</h2>
                        <p className="text-gray-600">Our handpicked selection of premium sarees</p>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                        {featuredSarees.map((saree) => (
                            <ProductCard key={saree.id} saree={saree} />
                        ))}
                    </div>
                    <div className="text-center mt-12">
                        <Link to="/collections">
                            <Button size="lg" variant="outline" className="border-maroon text-maroon hover:bg-maroon hover:text-beige">
                                View All Collection
                                <ArrowRight className="ml-2 h-5 w-5" />
                            </Button>
                        </Link>
                    </div>
                </div>
            </section>

            {/* Testimonials */}
            <section className="py-16 bg-gradient-to-br from-maroon/5 to-beige-light">
                <div className="w-full px-8 xl:px-16">
                    <div className="text-center mb-12">
                        <h2 className="text-4xl font-bold mb-4">What Our Customers Say</h2>
                        <p className="text-gray-600">Trusted by thousands of satisfied customers</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {testimonials.slice(0, 3).map((testimonial) => (
                            <Card key={testimonial.id} className="hover:shadow-lg transition-shadow">
                                <CardContent className="pt-6">
                                    <div className="flex items-center mb-4">
                                        <img
                                            src={testimonial.image}
                                            alt={testimonial.name}
                                            className="w-12 h-12 rounded-full mr-4"
                                        />
                                        <div>
                                            <h4 className="font-semibold">{testimonial.name}</h4>
                                            <div className="flex">
                                                {[...Array(testimonial.rating)].map((_, i) => (
                                                    <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                    <p className="text-gray-600 text-sm italic">"{testimonial.comment}"</p>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-16 bg-gradient-to-r from-maroon to-maroon-dark text-beige">
                <div className="w-full px-8 xl:px-16 text-center">
                    <h2 className="text-4xl font-bold mb-4">Looking for Bulk Orders?</h2>
                    <p className="text-xl mb-8 opacity-90">
                        Get exclusive wholesale pricing for orders of 10+ sarees.
                        Perfect for boutiques and retailers.
                    </p>
                    <Link to="/wholesale">
                        <Button size="lg" className="bg-gold hover:bg-gold-dark text-maroon font-semibold">
                            Learn More About Wholesale
                            <ArrowRight className="ml-2 h-5 w-5" />
                        </Button>
                    </Link>
                </div>
            </section>
        </div>
    );
};
