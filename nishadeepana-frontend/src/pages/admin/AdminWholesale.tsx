import React from 'react';
import { MessageCircle, Users, Package, TrendingUp, Phone } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Link } from 'react-router-dom';

// Wholesale inquiries come via WhatsApp — no mock data shown.
// This page shows the WhatsApp contact and a guide for managing inquiries.

export const AdminWholesale: React.FC = () => {
    const waGroupLink = 'https://chat.whatsapp.com/KugIbeE8Ou4FkfvuCMsIsn';
    const waPersonalLink = 'https://wa.me/919500384237';

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-beige-light">
            {/* Header */}
            <div className="bg-gradient-to-r from-maroon via-maroon-light to-maroon-dark text-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="flex justify-between items-center">
                        <div>
                            <h1 className="text-4xl font-bold mb-2">Wholesale Management</h1>
                            <p className="text-beige">
                                Wholesale inquiries come through WhatsApp. Use the links below to manage them.
                            </p>
                        </div>
                        <Link to="/admin">
                            <Button className="bg-gold hover:bg-gold-dark text-maroon font-semibold">
                                ← Dashboard
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

                {/* Info cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <Card className="border-t-4 border-t-maroon hover:shadow-lg transition-all">
                        <CardHeader className="bg-gradient-to-r from-maroon/5 to-transparent">
                            <CardTitle className="flex items-center text-maroon">
                                <MessageCircle className="h-5 w-5 mr-2" />
                                Personal WhatsApp
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-4">
                            <p className="text-gray-600 text-sm mb-4">
                                Customers send direct wholesale inquiries here. Reply and negotiate one-on-one.
                            </p>
                            <a href={waPersonalLink} target="_blank" rel="noopener noreferrer">
                                <Button className="w-full bg-green-600 hover:bg-green-700 text-white">
                                    <MessageCircle className="h-4 w-4 mr-2" />
                                    Open WhatsApp Chat
                                </Button>
                            </a>
                        </CardContent>
                    </Card>

                    <Card className="border-t-4 border-t-yellow-500 hover:shadow-lg transition-all">
                        <CardHeader className="bg-gradient-to-r from-gold/10 to-transparent">
                            <CardTitle className="flex items-center text-yellow-700">
                                <Users className="h-5 w-5 mr-2" />
                                WhatsApp Group
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-4">
                            <p className="text-gray-600 text-sm mb-4">
                                Your community group for sharing new arrivals, offers, and wholesale updates.
                            </p>
                            <a href={waGroupLink} target="_blank" rel="noopener noreferrer">
                                <Button className="w-full bg-yellow-600 hover:bg-yellow-700 text-white">
                                    <Users className="h-4 w-4 mr-2" />
                                    Open Group Chat
                                </Button>
                            </a>
                        </CardContent>
                    </Card>

                    <Card className="border-t-4 border-t-green-500 hover:shadow-lg transition-all">
                        <CardHeader className="bg-gradient-to-r from-green-100 to-transparent">
                            <CardTitle className="flex items-center text-green-700">
                                <Phone className="h-5 w-5 mr-2" />
                                Direct Call
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-4">
                            <p className="text-gray-600 text-sm mb-4">
                                For urgent wholesale orders or negotiations that need a quick call.
                            </p>
                            <a href="tel:+919500384237">
                                <Button className="w-full bg-green-500 hover:bg-green-600 text-white">
                                    <Phone className="h-4 w-4 mr-2" />
                                    Call +91 95003 84237
                                </Button>
                            </a>
                        </CardContent>
                    </Card>
                </div>

                {/* How it works */}
                <Card className="border-maroon/20">
                    <CardHeader className="bg-gradient-to-r from-maroon/5 to-gold/5">
                        <CardTitle className="flex items-center text-maroon">
                            <TrendingUp className="h-5 w-5 mr-2" />
                            How Wholesale Works
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {[
                                {
                                    step: '1',
                                    title: 'Customer Clicks "Request a Quote"',
                                    desc: 'On the Wholesale page, clicking the button opens WhatsApp with a pre-filled message.',
                                    icon: MessageCircle,
                                    color: 'text-maroon bg-maroon/10',
                                },
                                {
                                    step: '2',
                                    title: 'Message Arrives on Your Phone',
                                    desc: 'You receive the inquiry directly — name, quantity, category, and their requirements.',
                                    icon: Phone,
                                    color: 'text-blue-600 bg-blue-100',
                                },
                                {
                                    step: '3',
                                    title: 'Negotiate & Confirm',
                                    desc: 'Discuss pricing, delivery timeline, and payment terms directly on WhatsApp.',
                                    icon: Users,
                                    color: 'text-green-600 bg-green-100',
                                },
                                {
                                    step: '4',
                                    title: 'Process via Admin Orders',
                                    desc: 'Once confirmed, create the order manually in Admin Orders and track it.',
                                    icon: Package,
                                    color: 'text-yellow-700 bg-yellow-100',
                                },
                            ].map((item) => (
                                <div key={item.step} className="flex flex-col items-center text-center p-4 rounded-xl bg-gray-50 border">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-3 ${item.color}`}>
                                        <item.icon className="h-5 w-5" />
                                    </div>
                                    <div className="text-xs font-bold text-gray-400 mb-1">STEP {item.step}</div>
                                    <h4 className="font-semibold text-sm text-gray-900 mb-2">{item.title}</h4>
                                    <p className="text-xs text-gray-500">{item.desc}</p>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};
