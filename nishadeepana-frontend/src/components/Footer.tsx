import React from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Instagram, MessageCircle, Mail, Phone, MapPin } from 'lucide-react';

export const Footer: React.FC = () => {
    return (
        <footer className="bg-maroon-dark text-beige">
            <div className="w-full px-8 xl:px-16 py-12">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    {/* Brand */}
                    <div className="col-span-1">
                        <h3 className="text-2xl font-bold text-gold mb-4">
                            NishaDeepana Sarees
                        </h3>
                        <p className="text-sm mb-4 text-beige/80">
                            Premium handloom and silk sarees for every occasion.
                            Authentic craftsmanship, timeless elegance.
                        </p>
                        <div className="flex space-x-4">
                            <a href="https://www.facebook.com" target="_blank" rel="noopener noreferrer" className="hover:text-gold transition-colors">
                                <Facebook className="h-5 w-5" />
                            </a>
                            <a href="https://www.instagram.com" target="_blank" rel="noopener noreferrer" className="hover:text-gold transition-colors">
                                <Instagram className="h-5 w-5" />
                            </a>
                            <a href="https://wa.me/919500384237" target="_blank" rel="noopener noreferrer" className="hover:text-gold transition-colors">
                                <MessageCircle className="h-5 w-5" />
                            </a>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h4 className="text-gold font-semibold mb-4">Quick Links</h4>
                        <ul className="space-y-2 text-sm">
                            <li>
                                <Link to="/" className="hover:text-gold transition-colors">
                                    Home
                                </Link>
                            </li>
                            <li>
                                <Link to="/collections" className="hover:text-gold transition-colors">
                                    Collections
                                </Link>
                            </li>
                            <li>
                                <Link to="/wholesale" className="hover:text-gold transition-colors">
                                    Wholesale
                                </Link>
                            </li>
                            <li>
                                <Link to="/track-order" className="hover:text-gold transition-colors">
                                    Track Order
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Customer Service */}
                    <div>
                        <h4 className="text-gold font-semibold mb-4">Customer Service</h4>
                        <ul className="space-y-2 text-sm">
                            <li>
                                <Link to="/about" className="hover:text-gold transition-colors">
                                    About Us
                                </Link>
                            </li>
                            <li>
                                <Link to="/contact" className="hover:text-gold transition-colors">
                                    Contact Us
                                </Link>
                            </li>
                            <li>
                                <Link to="/profile" className="hover:text-gold transition-colors">
                                    My Account
                                </Link>
                            </li>
                            <li>
                                <Link to="/wishlist" className="hover:text-gold transition-colors">
                                    Wishlist
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Contact */}
                    <div>
                        <h4 className="text-gold font-semibold mb-4">Contact Us</h4>
                        <ul className="space-y-3 text-sm">
                            <li className="flex items-start space-x-2">
                                <MapPin className="h-5 w-5 text-gold flex-shrink-0 mt-0.5" />
                                <span>Mettur, Tamil Nadu, India</span>
                            </li>
                            <li className="flex items-center space-x-2">
                                <Phone className="h-5 w-5 text-gold flex-shrink-0" />
                                <span>+91 95003 84237</span>
                            </li>
                            <li className="flex items-center space-x-2">
                                <Mail className="h-5 w-5 text-gold flex-shrink-0" />
                                <span>nishadeepana@gmail.com</span>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="border-t border-maroon mt-8 pt-8 text-center text-sm">
                    <p className="text-beige/70">&copy; {new Date().getFullYear()} NishaDeepana Sarees. All rights reserved.</p>
                </div>
            </div>
        </footer>
    );
};
