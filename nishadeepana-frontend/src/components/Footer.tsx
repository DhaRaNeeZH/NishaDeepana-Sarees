import React from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Mail, Phone, MapPin } from 'lucide-react';

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
                        {/* Social: Facebook + WhatsApp Group only */}
                        <div className="flex items-center gap-4">
                            <a
                                href="https://www.facebook.com/profile.php?id=100007146435328"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 hover:text-gold transition-colors text-sm"
                                title="Follow us on Facebook"
                            >
                                <Facebook className="h-5 w-5" />
                                <span className="text-xs text-beige/60">Facebook</span>
                            </a>
                            <a
                                href="https://chat.whatsapp.com/KugIbeE8Ou4FkfvuCMsIsn"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 hover:text-gold transition-colors text-sm"
                                title="Join our WhatsApp Group"
                            >
                                {/* WhatsApp SVG icon */}
                                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                                </svg>
                                <span className="text-xs text-beige/60">Group</span>
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
                                <a href="tel:+919500384237" className="hover:text-gold transition-colors">+91 95003 84237</a>
                            </li>
                            <li className="flex items-center space-x-2">
                                <Mail className="h-5 w-5 text-gold flex-shrink-0" />
                                <a href="mailto:nishadeepana@gmail.com" className="hover:text-gold transition-colors">nishadeepana@gmail.com</a>
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
