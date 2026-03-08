import React from 'react';
import { Heart, Truck, Award, Users, MapPin, Phone, Clock, Sparkles } from 'lucide-react';
import { Card, CardContent } from '../components/ui/card';

const SAREE_TYPES = [
    { name: 'South Cotton', desc: 'Breathable, everyday elegance with traditional motifs' },
    { name: 'Soft Silk', desc: 'Luxurious drape with a silky sheen for special occasions' },
    { name: 'Linen Cotton', desc: 'Lightweight and crisp, perfect for summer styling' },
    { name: 'Silk Cotton', desc: 'The best of both worlds: silk sheen with cotton comfort' },
    { name: 'Mul Mul Cotton', desc: 'Ultra-soft muslin weave, light as a feather' },
    { name: 'Khadi Cotton', desc: 'Handspun heritage fabric with rustic charm' },
    { name: 'Premium Khadi Tissue Silk', desc: 'Luxurious tissue weave with golden shimmer' },
    { name: 'Kalyani Cotton', desc: 'Temple-inspired prints with rich color palettes' },
    { name: 'Kalyani Cotton Checked', desc: 'Classic checks with vibrant Kalyani patterns' },
    { name: 'Maheshwari Silk Cotton', desc: 'Regal Madhya Pradesh weave with reversible patterns' },
    { name: 'Pochampally Chanderi Cotton', desc: 'Ikat-dyed geometric artistry from Telangana' },
    { name: 'Madurai Sungudi Cotton', desc: 'Tie-dyed tradition from the temple city of Madurai' },
    { name: 'Chettinad Cotton', desc: 'Bold stripes and checks from the Chettinad heritage' },
];

export const AboutPage: React.FC = () => {
    return (
        <div className="min-h-screen bg-gradient-to-br from-beige-light to-white">
            {/* Hero Section */}
            <div className="relative bg-gradient-to-r from-maroon to-maroon-dark text-white py-20">
                <div className="absolute inset-0 bg-black/10" />
                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h1 className="text-4xl md:text-5xl font-bold font-playfair mb-4">About NishaDeepana Sarees</h1>
                    <p className="text-lg text-beige max-w-2xl mx-auto">
                        Weaving tradition into every thread since 2023 — bringing the finest sarees from Mettur to your doorstep.
                    </p>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                {/* Our Story */}
                <div className="max-w-3xl mx-auto text-center mb-16">
                    <h2 className="text-3xl font-bold text-maroon font-playfair mb-6">Our Story</h2>
                    <p className="text-gray-700 leading-relaxed text-lg mb-4">
                        NishaDeepana Sarees was founded in 2023 with a simple yet powerful vision — to make exquisite,
                        handpicked sarees accessible to women everywhere. Based in the heart of <strong>Mettur, Tamil Nadu</strong>,
                        we are passionate about celebrating the timeless beauty of Indian textiles.
                    </p>
                    <p className="text-gray-700 leading-relaxed text-lg mb-4">
                        From luxurious Kanchipuram silk to elegant Banarasi weaves, from everyday cotton sarees to stunning
                        designer pieces — we curate only the finest collections. Each saree in our collection is handpicked
                        for its quality, craftsmanship, and beauty.
                    </p>
                    <p className="text-gray-700 leading-relaxed text-lg">
                        Whether you are shopping for a wedding, a festival, or simply want to add elegance to your wardrobe,
                        NishaDeepana Sarees is your trusted destination for authentic Indian sarees.
                    </p>
                </div>

                {/* Values */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
                    {[
                        { icon: Award, title: 'Quality Assured', desc: 'Every saree is handpicked and quality-checked before reaching you' },
                        { icon: Truck, title: 'All India Delivery', desc: 'We deliver to every corner of India with secure packaging' },
                        { icon: Heart, title: 'Made with Love', desc: 'Each piece reflects our passion for traditional Indian textiles' },
                        { icon: Users, title: 'Happy Customers', desc: 'Hundreds of satisfied customers trust NishaDeepana Sarees' },
                    ].map((item, i) => (
                        <Card key={i} className="text-center hover:shadow-lg transition-shadow border-gold/20">
                            <CardContent className="p-6">
                                <item.icon className="h-10 w-10 text-maroon mx-auto mb-4" />
                                <h3 className="font-semibold text-lg text-maroon mb-2">{item.title}</h3>
                                <p className="text-gray-600 text-sm">{item.desc}</p>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Our Saree Collection — 13 Types */}
                <div className="mb-16">
                    <div className="text-center mb-10">
                        <div className="flex items-center justify-center gap-2 mb-3">
                            <Sparkles className="h-6 w-6 text-gold" />
                            <h2 className="text-3xl font-bold text-maroon font-playfair">Our Saree Collection</h2>
                            <Sparkles className="h-6 w-6 text-gold" />
                        </div>
                        <p className="text-gray-600 max-w-xl mx-auto">
                            We specialize in {SAREE_TYPES.length} exquisite types of sarees, each representing a unique weaving tradition from across India.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {SAREE_TYPES.map((type, i) => (
                            <div
                                key={i}
                                className="group bg-white border border-gold/20 rounded-xl p-5 hover:shadow-lg hover:border-maroon/30 transition-all duration-300 hover:-translate-y-1"
                            >
                                <div className="flex items-start gap-3">
                                    <div className="bg-gradient-to-br from-maroon to-maroon-dark text-white rounded-full h-8 w-8 flex items-center justify-center text-sm font-bold flex-shrink-0">
                                        {i + 1}
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-maroon group-hover:text-maroon-dark transition-colors">
                                            {type.name}
                                        </h3>
                                        <p className="text-gray-500 text-sm mt-1">{type.desc}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Quick Contact Info */}
                <div className="bg-gradient-to-r from-maroon to-maroon-dark text-white rounded-2xl p-8 md:p-12">
                    <h2 className="text-2xl font-bold text-center mb-8 font-playfair">Visit Us</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                        <div className="flex flex-col items-center gap-2">
                            <MapPin className="h-6 w-6 text-gold" />
                            <p className="font-medium">Mettur, Tamil Nadu</p>
                            <p className="text-beige text-sm">India</p>
                        </div>
                        <div className="flex flex-col items-center gap-2">
                            <Phone className="h-6 w-6 text-gold" />
                            <p className="font-medium">+91 95003 84237</p>
                            <p className="text-beige text-sm">Call or WhatsApp</p>
                        </div>
                        <div className="flex flex-col items-center gap-2">
                            <Clock className="h-6 w-6 text-gold" />
                            <p className="font-medium">All Days</p>
                            <p className="text-beige text-sm">9:00 AM - 7:00 PM</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
