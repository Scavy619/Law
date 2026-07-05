import React from 'react'
import { Link, useNavigate } from 'react-router-dom';
import { Scale } from 'lucide-react';
import { assets } from '../assets/assets'

const WHATSAPP_URL =
    "https://wa.me/919472761482?text=Hi%20Shivam%2C%20I'd%20like%20to%20ask%20about%20my%20legal%20situation.";

const Footer = () => {
    const navigate = useNavigate();
    const handleClick = () => {
        navigate("/");          // Go to homepage
        window.scrollTo({ top: 0, behavior: "smooth" }); // Scroll to top
    };
    return (
        <footer className="border-t border-gray-200 bg-gray-50 py-5">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 md:pt-14 lg:pt-16 pb-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 md:gap-x-10 md:gap-y-8 lg:gap-16">
                    {/* Company Info */}
                    <div className="md:pr-4 lg:col-span-5">
                        <div className="mb-5 md:mb-6 cursor-pointer w-fit" onClick={handleClick}>
                            <div className="flex items-center gap-2 shrink-0">
                                <div className="bg-primary text-white rounded-lg p-1.5 shrink-0">
                                    <Scale className="w-9 h-9" />
                                </div>
                                <div className="leading-tight">
                                    <p className="font-bold text-gray-900 text-2xl">Shivam Parashar</p>
                                    <p className="text-[10px] sm:text-xs text-gray-500 tracking-wide uppercase -mt-0.5">Advocate, Delhi</p>
                                </div>
                            </div>
                        </div>

                        <p className="text-sm md:text-base text-gray-600 leading-relaxed mb-6 md:mb-8">
                            A Delhi-based advocate handling criminal, civil, family, corporate, property, and tax matters — with a hands-on, client-first approach and direct personal attention on every case.
                        </p>
                        <div className="flex space-x-4">
                            {/* WhatsApp */}
                            <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer" className="bg-[#25D366] p-2.5 md:p-3 rounded-full transition-all duration-300 transform hover:scale-110 hover:shadow-lg hover:shadow-[#25D366]/50 group">
                                <span className="sr-only">WhatsApp</span>
                                <svg className="h-4 w-4 md:h-5 md:w-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884M20.052 3.449C17.851 1.245 14.919.03 11.999.03 5.436.03.101 5.365.098 11.929c0 2.096.547 4.142 1.588 5.945L0 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.834-8.452z" />
                                </svg>
                            </a>

                            {/* LinkedIn */}
                            <a href="https://linkedin.com" className="bg-blue-600 p-2.5 md:p-3 rounded-full transition-all duration-300 transform hover:scale-110 hover:shadow-lg hover:shadow-blue-600/50 group">
                                <span className="sr-only">LinkedIn</span>
                                <svg className="h-4 w-4 md:h-5 md:w-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                                </svg>
                            </a>

                            {/* Instagram */}
                            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="bg-gradient-to-tr from-amber-500 via-pink-600 to-purple-600 p-2.5 md:p-3 rounded-full transition-all duration-300 transform hover:scale-110 hover:shadow-lg group">
                                <span className="sr-only">Instagram</span>
                                <svg className="h-4 w-4 md:h-5 md:w-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
                                </svg>
                            </a>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div className="lg:col-span-3 mt-2 md:mt-0">
                        <h3 className="text-sm md:text-base font-semibold text-gray-900 tracking-wider uppercase mb-4">
                            Company
                        </h3>
                        <ul className="space-y-2.5 md:space-y-3">
                            <li>
                                <Link to="/" className="text-sm md:text-base text-gray-600 hover:text-primary transition-colors" onClick={() => window.scrollTo(0, 0)}>
                                    Home
                                </Link>
                            </li>
                            <li>
                                <Link to="/about" className="text-sm md:text-base text-gray-600 hover:text-primary transition-colors" onClick={() => window.scrollTo(0, 0)}>
                                    About us
                                </Link>
                            </li>
                            <li>
                                <Link to="/contact-us" className="text-sm md:text-base text-gray-600 hover:text-primary transition-colors" onClick={() => window.scrollTo(0, 0)}>
                                    Contact Us
                                </Link>
                            </li>
                            <li>
                                <Link to="/privacy-policy" className="text-sm md:text-base text-gray-600 hover:text-primary transition-colors" onClick={() => window.scrollTo(0, 0)}>
                                    Privacy Policy
                                </Link>
                            </li>
                            <li>
                                <Link to="/terms-and-conditions" className="text-sm md:text-base text-gray-600 hover:text-primary transition-colors" onClick={() => window.scrollTo(0, 0)}>
                                    Terms & Conditions
                                </Link>
                            </li>
                            <li>
                                <Link to="/refund-policy" className="text-sm md:text-base text-gray-600 hover:text-primary transition-colors" onClick={() => window.scrollTo(0, 0)}>
                                    Refund Policy
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Contact Info */}
                    <div className="md:col-span-2 lg:col-span-4 mt-2 md:mt-0">
                        <h3 className="text-sm md:text-base font-semibold text-gray-900 tracking-wider uppercase mb-4">
                            Contact Us
                        </h3>
                        <div className="space-y-4 md:space-y-5 lg:space-y-6">
                            <div className="flex items-center">
                                <div className="shrink-0 bg-blue-100 p-2 rounded-lg">
                                    <svg className="h-5 w-5 md:h-6 md:w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                    </svg>
                                </div>
                                <div className="ml-4 text-sm md:text-base text-gray-600">
                                    <a href="tel:+919472761482" className="hover:text-blue-600 transition-colors duration-200">
                                        +91 94727 61482
                                    </a>
                                </div>
                            </div>
                            <div className="flex items-center">
                                <div className="shrink-0 bg-red-100 p-2 rounded-lg">
                                    <svg className="h-5 w-5 md:h-6 md:w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                    </svg>
                                </div>
                                <div className="ml-4 text-sm md:text-base text-gray-600">
                                    <a href="mailto:contact@shivamparasharlaw.in" className="hover:text-red-600 transition-colors duration-200 break-all md:break-normal">
                                        contact@shivamparasharlaw.in
                                    </a>
                                </div>
                            </div>
                            <div className="flex items-start">
                                <div className="shrink-0 bg-green-100 p-2 rounded-lg">
                                    <svg className="h-5 w-5 md:h-6 md:w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                </div>
                                <div className="ml-4 text-sm md:text-base text-gray-600">
                                    <a
                                        href="https://maps.google.com/?q=New%20Delhi%2C%20India"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="hover:text-green-600 transition-colors duration-200"
                                    >
                                        New Delhi, India
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="mt-10 md:mt-12 pt-6 md:pt-8 border-t border-gray-200">
                    <p className="text-sm md:text-base text-gray-500 text-center">
                        &copy; {new Date().getFullYear()} Adv. Shivam Parashar. All rights reserved.
                    </p>
                </div>
            </div>
        </footer>
    )
}

export default Footer;
