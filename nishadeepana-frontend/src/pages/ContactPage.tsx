import React from 'react';
import { MapPin, Phone, Mail, Clock, Send, MessageCircle } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent } from '../components/ui/card';

export const ContactPage: React.FC = () => {
    const [formData, setFormData] = React.useState({
        name: '', email: '', phone: '', subject: '', message: ''
    });
    const [submitted, setSubmitted] = React.useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitted(true);
        setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-beige-light to-white">
            {/* Hero */}
            <div className="bg-gradient-to-r from-maroon to-maroon-dark text-white py-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h1 className="text-4xl md:text-5xl font-bold font-playfair mb-4">Contact Us</h1>
                    <p className="text-beige text-lg">We'd love to hear from you! Reach out for orders, enquiries, or just to say hello.</p>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Contact Info Cards */}
                    <div className="space-y-6">
                        <Card className="border-gold/20 hover:shadow-lg transition-shadow">
                            <CardContent className="p-6 flex items-start gap-4">
                                <div className="bg-maroon/10 p-3 rounded-full">
                                    <Phone className="h-6 w-6 text-maroon" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-maroon mb-1">Phone / WhatsApp</h3>
                                    <p className="text-gray-700 font-medium">+91 95003 84237</p>
                                    <p className="text-gray-500 text-sm mt-1">Call or WhatsApp us anytime during business hours</p>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="border-gold/20 hover:shadow-lg transition-shadow">
                            <CardContent className="p-6 flex items-start gap-4">
                                <div className="bg-maroon/10 p-3 rounded-full">
                                    <Mail className="h-6 w-6 text-maroon" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-maroon mb-1">Email</h3>
                                    <p className="text-gray-700 font-medium">nishadeepana@gmail.com</p>
                                    <p className="text-gray-500 text-sm mt-1">We'll respond within 24 hours</p>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="border-gold/20 hover:shadow-lg transition-shadow">
                            <CardContent className="p-6 flex items-start gap-4">
                                <div className="bg-maroon/10 p-3 rounded-full">
                                    <MapPin className="h-6 w-6 text-maroon" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-maroon mb-1">Location</h3>
                                    <p className="text-gray-700 font-medium">Mettur, Tamil Nadu</p>
                                    <p className="text-gray-500 text-sm mt-1">India</p>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="border-gold/20 hover:shadow-lg transition-shadow">
                            <CardContent className="p-6 flex items-start gap-4">
                                <div className="bg-maroon/10 p-3 rounded-full">
                                    <Clock className="h-6 w-6 text-maroon" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-maroon mb-1">Business Hours</h3>
                                    <p className="text-gray-700 font-medium">All Days Open</p>
                                    <p className="text-gray-500 text-sm mt-1">9:00 AM – 7:00 PM IST</p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Contact Form */}
                    <div className="lg:col-span-2">
                        <Card className="shadow-lg border-gold/20">
                            <CardContent className="p-8">
                                <div className="flex items-center gap-3 mb-6">
                                    <MessageCircle className="h-6 w-6 text-maroon" />
                                    <h2 className="text-2xl font-bold text-maroon font-playfair">Send us a Message</h2>
                                </div>

                                {submitted ? (
                                    <div className="text-center py-12">
                                        <div className="bg-green-50 border border-green-200 rounded-xl p-8">
                                            <Send className="h-12 w-12 text-green-500 mx-auto mb-4" />
                                            <h3 className="text-xl font-semibold text-green-700 mb-2">Message Sent!</h3>
                                            <p className="text-green-600">Thank you for reaching out. We'll get back to you soon.</p>
                                            <Button
                                                className="mt-4 bg-maroon hover:bg-maroon-dark text-beige"
                                                onClick={() => setSubmitted(false)}
                                            >
                                                Send Another Message
                                            </Button>
                                        </div>
                                    </div>
                                ) : (
                                    <form onSubmit={handleSubmit} className="space-y-4">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium mb-2">Your Name *</label>
                                                <Input
                                                    value={formData.name}
                                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                                    placeholder="Enter your name"
                                                    required
                                                    className="h-12"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium mb-2">Email *</label>
                                                <Input
                                                    type="email"
                                                    value={formData.email}
                                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                                    placeholder="your@email.com"
                                                    required
                                                    className="h-12"
                                                />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium mb-2">Phone</label>
                                                <Input
                                                    value={formData.phone}
                                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                                    placeholder="+91 98765 43210"
                                                    className="h-12"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium mb-2">Subject *</label>
                                                <Input
                                                    value={formData.subject}
                                                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                                                    placeholder="Order enquiry, bulk order, etc."
                                                    required
                                                    className="h-12"
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium mb-2">Message *</label>
                                            <textarea
                                                value={formData.message}
                                                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                                placeholder="Tell us how we can help you..."
                                                required
                                                rows={5}
                                                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                            />
                                        </div>

                                        <Button type="submit" className="w-full h-12 bg-maroon hover:bg-maroon-dark text-beige font-semibold">
                                            <Send className="h-4 w-4 mr-2" />
                                            Send Message
                                        </Button>
                                    </form>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
};
