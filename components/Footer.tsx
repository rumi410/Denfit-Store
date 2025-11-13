import React from 'react';
import { DenfitLogo, InstagramIcon, FacebookIcon, TwitterIcon, YouTubeIcon, TikTokIcon } from './Icons';
import { useAppContext } from '../App';
import { StaticPageType } from '../types';

const Footer: React.FC = () => {
    const { openModal } = useAppContext();
    const currentYear = new Date().getFullYear();

    const quickLinks = [
        { name: 'Home', path: '/' },
        { name: 'All Collections', path: '#collections' },
    ];

    const infoLinks: {name: StaticPageType}[] = [
        { name: 'About Us' },
        { name: 'Size Guide' },
        { name: 'Privacy Policy' },
        { name: 'Shipping Policy' },
        { name: 'Return Policy' },
    ];

    return (
        <footer className="bg-denfit-dark text-white">
            <div className="container mx-auto px-4 py-12">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    {/* About */}
                    <div className="col-span-1 md:col-span-1">
                        <DenfitLogo showText={true} />
                        <p className="mt-4 text-gray-400 text-sm">Your one-stop shop for premium denim and casual wear. Quality, comfort, and style combined.</p>
                        <div className="flex space-x-4 mt-6">
                            <a href="#" className="text-gray-400 hover:text-social-facebook transition-colors"><FacebookIcon /></a>
                            <a href="#" className="text-gray-400 hover:text-social-instagram transition-colors"><InstagramIcon /></a>
                            <a href="#" className="text-gray-400 hover:text-social-twitter transition-colors"><TwitterIcon /></a>
                            <a href="#" className="text-gray-400 hover:text-social-youtube transition-colors"><YouTubeIcon /></a>
                            <a href="#" className="text-gray-400 hover:text-social-tiktok transition-colors"><TikTokIcon /></a>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
                        <ul className="space-y-2">
                            {quickLinks.map(link => (
                                <li key={link.name}><a href={link.path} className="text-gray-400 hover:text-white text-sm">{link.name}</a></li>
                            ))}
                             <li><button onClick={() => openModal('login')} className="text-gray-400 hover:text-white text-sm">My Account</button></li>
                        </ul>
                    </div>

                    {/* Information */}
                    <div>
                        <h3 className="text-lg font-semibold mb-4">Information</h3>
                        <ul className="space-y-2">
                            {infoLinks.map(link => (
                                <li key={link.name}>
                                    <button onClick={() => openModal('static', link.name)} className="text-gray-400 hover:text-white text-sm text-left">{link.name}</button>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Newsletter */}
                    <div>
                        <h3 className="text-lg font-semibold mb-4">Subscribe to our Newsletter</h3>
                        <p className="text-gray-400 text-sm mb-4">Get the latest updates on new products and upcoming sales.</p>
                        <form>
                            <div className="flex">
                                <input type="email" placeholder="Your email address" className="w-full bg-gray-800 text-white px-4 py-2 rounded-l-md focus:outline-none" />
                                <button type="submit" className="bg-denfit-blue text-white px-4 py-2 rounded-r-md hover:bg-blue-700">Subscribe</button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
            <div className="bg-black py-4">
                <div className="container mx-auto px-4 text-center text-gray-500 text-sm">
                    &copy; {currentYear} DENFIT. All Rights Reserved.
                </div>
            </div>
        </footer>
    );
};

export default Footer;