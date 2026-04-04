import React from 'react';
import { ShoppingBag, TrendingDown, Truck, Award, Mail, Phone } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { formatCurrency } from '../lib/utils';

export const WholesalePage: React.FC = () => {
    const [formData, setFormData] = React.useState({
        name: '',
        email: '',
        phone: '',
        businessName: '',
        quantity: '',
        message: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        alert('Thank you for your interest! We will contact you shortly.');
    };

    const bulkPricingTiers = [
        { min: 10, max: 19, discount: 10, label: '10-19 pieces' },
        { min: 20, max: 49, discount: 15, label: '20-49 pieces' },
        { min: 50, max: 99, discount: 20, label: '50-99 pieces' },
        { min: 100, max: null, discount: 30, label: '100+ pieces' },
    ];

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Hero Section */}
            <section className="bg-gradient-to-br from-primary/10 to-purple-50 py-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h1 className="text-5xl font-bold mb-4">Wholesale & Bulk Orders</h1>
                    <p className="text-xl text-gray-700 max-w-2xl mx-auto">
                        Partner with NishaDeepana Sarees for exclusive wholesale prices.
                        Perfect for boutiques, retailers, and bulk buyers.
                    </p>
                </div>
            </section>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                {/* Benefits */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
                    {[
                        { icon: TrendingDown, title: 'Competitive Pricing', desc: 'Up to 30% off on bulk orders' },
                        { icon: ShoppingBag, title: 'Wide Selection', desc: '500+ designs to choose from' },
                        { icon: Truck, title: 'Fast Delivery', desc: 'Priority shipping for wholesalers' },
                        { icon: Award, title: 'Quality Assured', desc: '100% authentic products' },
                    ].map((benefit, idx) => (
                        <Card key={idx} className="text-center hover:shadow-lg transition-shadow">
                            <CardContent className="pt-6">
                                <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-4">
                                    <benefit.icon className="h-8 w-8 text-primary" />
                                </div>
                                <h3 className="font-semibold mb-2">{benefit.title}</h3>
                                <p className="text-sm text-gray-600">{benefit.desc}</p>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Pricing Tiers */}
                <div className="mb-16">
                    <h2 className="text-3xl font-bold text-center mb-8">Bulk Pricing Tiers</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {bulkPricingTiers.map((tier, idx) => (
                            <Card key={idx} className="hover:shadow-lg transition-all hover:scale-105 border-2 hover:border-primary">
                                <CardHeader className="text-center pb-4">
                                    <CardTitle className="text-xl">{tier.label}</CardTitle>
                                </CardHeader>
                                <CardContent className="text-center">
                                    <div className="text-4xl font-bold text-primary mb-2">
                                        {tier.discount}%
                                    </div>
                                    <p className="text-gray-600">OFF</p>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                    <div className="mt-8 text-center">
                        <Card className="inline-block bg-gradient-to-br from-primary/10 to-purple-50 border-primary/20">
                            <CardContent className="p-4">
                                <p className="text-gray-700">
                                    <strong>Example:</strong> Order 50 sarees @ ₹10,000 each = {formatCurrency(10000 * 0.8)} per piece
                                </p>
                            </CardContent>
                        </Card>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                    {/* Contact Form */}
                    <div>
                        <h2 className="text-3xl font-bold mb-6">Request a Quote</h2>
                        <Card>
                            <CardContent className="p-6">
                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium mb-2">Full Name *</label>
                                        <Input
                                            required
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            placeholder="John Doe"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-2">Email *</label>
                                        <Input
                                            required
                                            type="email"
                                            value={formData.email}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                            placeholder="john@example.com"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-2">Phone Number *</label>
                                        <Input
                                            required
                                            type="tel"
                                            value={formData.phone}
                                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                            placeholder="+91 98765 43210"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-2">Business Name</label>
                                        <Input
                                            value={formData.businessName}
                                            onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                                            placeholder="Your Boutique Name"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-2">Expected Quantity *</label>
                                        <Input
                                            required
                                            type="number"
                                            value={formData.quantity}
                                            onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                                            placeholder="50"
                                            min="10"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-2">Additional Requirements</label>
                                        <textarea
                                            className="w-full border rounded-md px-3 py-2 min-h-[100px]"
                                            value={formData.message}
                                            onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                            placeholder="Tell us about your requirements..."
                                        />
                                    </div>
                                    <Button type="submit" size="lg" className="w-full">
                                        Submit Inquiry
                                    </Button>
                                </form>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Info & FAQ */}
                    <div>
                        <h2 className="text-3xl font-bold mb-6">Why Choose Us?</h2>
                        <div className="space-y-6">
                            <Card>
                                <CardContent className="pt-6">
                                    <h3 className="font-semibold text-lg mb-3">Minimum Order Quantity</h3>
                                    <p className="text-gray-600 mb-2">
                                        Our minimum wholesale order is just 10 pieces, making it easy for
                                        small boutiques to get started with competitive pricing.
                                    </p>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardContent className="pt-6">
                                    <h3 className="font-semibold text-lg mb-3">Customization Available</h3>
                                    <p className="text-gray-600 mb-2">
                                        We offer customization options for bulk orders of 50+ pieces.
                                        Choose from our fabric selection and create exclusive designs
                                        for your store.
                                    </p>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardContent className="pt-6">
                                    <h3 className="font-semibold text-lg mb-3">Payment Terms</h3>
                                    <p className="text-gray-600">
                                        Flexible payment options available. We accept advance payment,
                                        COD (for orders below ₹50,000), and credit terms for regular
                                        wholesale partners.
                                    </p>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardContent className="pt-6">
                                    <h3 className="font-semibold text-lg mb-3">Delivery Timeline</h3>
                                    <p className="text-gray-600">
                                        Standard bulk orders are delivered within 7-10 business days.
                                        Custom orders may take 15-20 days depending on complexity.
                                    </p>
                                </CardContent>
                            </Card>

                            {/* Contact Info */}
                            <Card className="bg-primary text-white">
                                <CardContent className="pt-6">
                                    <h3 className="font-semibold text-lg mb-4">Get in Touch</h3>
                                    <ul className="space-y-4">
                                        <li className="flex items-center gap-3">
                                            <div className="bg-maroon/10 p-2 rounded-lg">
                                                <Phone className="h-5 w-5 text-maroon" />
                                            </div>
                                            <p className="text-gray-700 font-medium">+91 95003 84237</p>
                                        </li>
                                        <li className="flex items-center gap-3">
                                            <div className="bg-maroon/10 p-2 rounded-lg">
                                                <Mail className="h-5 w-5 text-maroon" />
                                            </div>
                                            <p className="text-gray-700 font-medium">nishadeepana@gmail.com</p>
                                        </li>
                                    </ul>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
