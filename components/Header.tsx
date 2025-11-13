import React, { useState, useRef, useEffect } from 'react';
import { useAppContext } from '../App';
import { DenfitLogo, SearchIcon, UserIcon, HeartIcon, CartIcon, ChevronDownIcon, HamburgerIcon, CloseIcon, FireIcon } from './Icons';
import { Product } from '../types';

const NavItem: React.FC<{
    label: string;
    subItems?: { name: string, subCategory: string }[];
    onClick: (category: string, subCategory: string) => void;
}> = ({ label, subItems, onClick }) => {
    const [isOpen, setIsOpen] = useState(false);
    return (
        <div className="relative" onMouseEnter={() => setIsOpen(true)} onMouseLeave={() => setIsOpen(false)}>
            <button onClick={() => onClick(label, 'All')} className="flex items-center space-x-1 py-2 text-gray-600 hover:text-denfit-blue transition-colors">
                <span>{label}</span>
                {subItems && <ChevronDownIcon />}
            </button>
            {subItems && isOpen && (
                <div className="absolute top-full left-0 mt-1 w-48 bg-white shadow-lg rounded-md py-2 z-20">
                    {subItems.map(item => (
                        <button key={item.name} onClick={() => onClick(label, item.subCategory)} className="w-full text-left block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">{item.name}</button>
                    ))}
                </div>
            )}
        </div>
    );
};

const Header: React.FC = () => {
    const { cart, wishlist, user, openModal, setFilter, logout, currency, setCurrency, fetchUserOrders, orders = [] } = useAppContext();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isSearchActive, setIsSearchActive] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const { products } = useAppContext();
    const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
    const searchRef = useRef<HTMLDivElement>(null);
    const userMenuRef = useRef<HTMLDivElement>(null);

    const navCategories = {
        Jeans: [{ name: 'Baggy Jeans', subCategory: 'Baggy Jeans' }, { name: 'Denim Jeans', subCategory: 'Denim Jeans' }],
        Shirts: [{ name: 'Formal Shirts', subCategory: 'Formal Shirts' }, { name: 'Casual Shirts', subCategory: 'Casual Shirts' }],
        Jackets: [{ name: 'Winter Jackets', subCategory: 'Winter Jackets' }, { name: 'Summer Jackets', subCategory: 'Summer Jackets' }],
        Hoodies: [{ name: 'Pullovers', subCategory: 'Pullovers' }, { name: 'Zip-Up Hoodies', subCategory: 'Zip-Up Hoodies' }, { name: 'Winter Hoodies', subCategory: 'Winter Hoodies' }],
    }

    const handleFilterClick = (category: string, subCategory: string) => {
        setFilter({ category, subCategory });
        const collectionsSection = document.getElementById('collections');
        if (collectionsSection) {
            collectionsSection.scrollIntoView({ behavior: 'smooth' });
        }
        setIsMobileMenuOpen(false);
    };

    const handleTrendingSearchClick = (term: string) => {
        const termMap: { [key: string]: string } = {
            "jeans": "Jeans",
            "denim": "Jeans",
            "shirts": "Shirts",
            "jackets": "Jackets",
            "hoodies": "Hoodies"
        };
        const category = termMap[term.toLowerCase()] || 'All';
        handleFilterClick(category, 'All');
        setIsSearchActive(false);
        setSearchTerm('');
    };

    useEffect(() => {
        if (searchTerm.length >= 1) {
            setFilteredProducts(products.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase())));
        } else {
            setFilteredProducts([]);
        }
    }, [searchTerm, products]);
    
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
                setIsSearchActive(false);
            }
            if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
                setIsUserMenuOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const trendingSearches = ["Jeans", "Hoodies", "Shirts", "Jackets", "Denim"];
    
    const CurrencySelector: React.FC<{ isMobile?: boolean }> = ({ isMobile }) => (
        <div className="relative group">
            <button className="flex items-center py-2 text-gray-600 hover:text-denfit-blue transition-colors">
                {currency} <ChevronDownIcon />
            </button>
            <div className={`absolute top-full mt-1 w-24 bg-white shadow-lg rounded-md py-1 z-20 ${isMobile ? 'left-0' : 'right-0'} opacity-0 group-hover:opacity-100 transition-opacity`}>
                <button onClick={() => setCurrency('USD')} className="w-full text-left block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">USD</button>
                <button onClick={() => setCurrency('EUR')} className="w-full text-left block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">EUR</button>
                <button onClick={() => setCurrency('INR')} className="w-full text-left block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">INR</button>
                <button onClick={() => setCurrency('PKR')} className="w-full text-left block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">PKR</button>
            </div>
        </div>
    );

    return (
        <header className="bg-white shadow-md sticky top-0 z-30">
            {/* Desktop Header */}
            <div className="hidden lg:flex container mx-auto px-4 h-20 items-center justify-between">
                <div className="flex items-center space-x-8">
                    <a href="/"><DenfitLogo showText={true} /></a>
                    <div className="relative w-72" ref={searchRef}>
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <SearchIcon />
                        </div>
                        <input
                            type="text"
                            placeholder="Search for products..."
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-denfit-blue bg-white text-gray-900"
                            onFocus={() => setIsSearchActive(true)}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            value={searchTerm}
                        />
                         {isSearchActive && (
                             <div className="absolute top-full mt-2 w-full bg-white rounded-lg shadow-xl p-4 z-40">
                                {searchTerm.length < 1 ? (
                                    <>
                                        <div className="flex items-center mb-2">
                                            <FireIcon />
                                            <h3 className="font-semibold ml-2 text-black">Trending Searches</h3>
                                        </div>
                                        <div className="flex flex-wrap gap-2">
                                            {trendingSearches.map(term => <button key={term} onClick={() => handleTrendingSearchClick(term)} className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm hover:bg-gray-200">{term}</button>)}
                                        </div>
                                    </>
                                ) : (
                                    <div className="max-h-80 overflow-y-auto">
                                        <h3 className="font-semibold mb-2 text-black">PRODUCTS</h3>
                                        {filteredProducts.length > 0 ? filteredProducts.map(p => (
                                            <div key={p._id} className="flex items-center p-2 hover:bg-gray-100 rounded-md cursor-pointer border-b" onClick={() => {openModal('product', p); setIsSearchActive(false); setSearchTerm('')}}>
                                                <img src={p.images[0]} alt={p.name} className="w-12 h-12 object-cover rounded-md mr-4"/>
                                                <div>
                                                    <p className="font-semibold text-black">{p.name}</p>
                                                    <p className="text-sm text-gray-600">${p.price.toFixed(2)}</p>
                                                </div>
                                            </div>
                                        )) : <p className="text-gray-500 text-center py-4">No products found.</p>}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                <nav className="flex items-center space-x-6 font-medium">
                    <NavItem label="Jeans" subItems={navCategories.Jeans} onClick={handleFilterClick} />
                    <NavItem label="Shirts" subItems={navCategories.Shirts} onClick={handleFilterClick}/>
                    <NavItem label="Jackets" subItems={navCategories.Jackets} onClick={handleFilterClick}/>
                    <NavItem label="Hoodies" subItems={navCategories.Hoodies} onClick={handleFilterClick}/>
                </nav>

                <div className="flex items-center space-x-6">
                    <CurrencySelector />
                    <div className="relative" ref={userMenuRef}>
                        <button onClick={() => user ? setIsUserMenuOpen(!isUserMenuOpen) : openModal('login')} className="hover:text-denfit-blue transition-colors"><UserIcon /></button>
                         {user && isUserMenuOpen && (
                             <div className="absolute top-full right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-2 z-20">
                                 <div className="px-4 py-2 border-b">
                                     <p className="font-semibold text-sm">{user.name}</p>
                                     <p className="text-xs text-gray-500">{user.email}</p>
                                 </div>
                                 <button onClick={() => { openModal('profile'); setIsUserMenuOpen(false); }} className="w-full text-left block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">My Profile</button>
                                 <button onClick={() => { fetchUserOrders(); setIsUserMenuOpen(false); }} className="w-full text-left block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">My Orders</button>
                                 <button onClick={() => { logout(); setIsUserMenuOpen(false); }} className="w-full text-left block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Logout</button>
                             </div>
                         )}
                    </div>
                    <button onClick={() => openModal('wishlist')} className="relative hover:text-denfit-blue transition-colors">
                        <HeartIcon />
                        {wishlist.length > 0 && <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">{wishlist.length}</span>}
                    </button>
                    <button onClick={() => openModal('cart')} className="relative hover:text-denfit-blue transition-colors">
                        <CartIcon />
                        {cart.length > 0 && <span className="absolute -top-2 -right-2 bg-denfit-blue text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">{cart.reduce((sum, item) => sum + item.quantity, 0)}</span>}
                    </button>
                </div>
            </div>

            {/* Mobile Header */}
            <div className="lg:hidden container mx-auto px-4 py-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}><HamburgerIcon /></button>
                        <CurrencySelector isMobile={true}/>
                    </div>
                    <a href="/"><DenfitLogo showText={false} /></a>
                    <div className="flex items-center space-x-3">
                         <button onClick={() => user ? openModal('profile') : openModal('login')}><UserIcon /></button>
                         <button onClick={() => openModal('wishlist')} className="relative">
                            <HeartIcon />
                            {wishlist.length > 0 && <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">{wishlist.length}</span>}
                        </button>
                        <button onClick={() => openModal('cart')} className="relative">
                            <CartIcon />
                             {cart.length > 0 && <span className="absolute -top-2 -right-2 bg-denfit-blue text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">{cart.reduce((sum, item) => sum + item.quantity, 0)}</span>}
                        </button>
                    </div>
                </div>
                 <div className="mt-4 relative" ref={searchRef}>
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                        <SearchIcon />
                    </div>
                    <input type="text" placeholder="Search for products..." className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-denfit-blue bg-white text-gray-900" onFocus={() => setIsSearchActive(true)}  onChange={(e) => setSearchTerm(e.target.value)} value={searchTerm}/>
                     {isSearchActive && (
                        <div className="absolute top-full mt-2 w-full bg-white rounded-lg shadow-xl p-4 z-40">
                             {searchTerm.length < 1 ? (
                                <>
                                    <div className="flex items-center mb-2">
                                        <FireIcon />
                                        <h3 className="font-semibold ml-2 text-black">Trending Searches</h3>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {trendingSearches.map(term => <button key={term} onClick={() => handleTrendingSearchClick(term)} className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm hover:bg-gray-200">{term}</button>)}
                                    </div>
                                </>
                            ) : (
                                <div className="max-h-80 overflow-y-auto">
                                    <h3 className="font-semibold mb-2 text-black">PRODUCTS</h3>
                                    {filteredProducts.length > 0 ? filteredProducts.map(p => (
                                        <div key={p._id} className="flex items-center p-2 hover:bg-gray-100 rounded-md cursor-pointer border-b" onClick={() => {openModal('product', p); setIsSearchActive(false); setSearchTerm('')}}>
                                            <img src={p.images[0]} alt={p.name} className="w-12 h-12 object-cover rounded-md mr-4"/>
                                            <div>
                                                <p className="font-semibold text-black">{p.name}</p>
                                                <p className="text-sm text-gray-600">${p.price.toFixed(2)}</p>
                                            </div>
                                        </div>
                                    )) : <p className="text-gray-500 text-center py-4">No products found.</p>}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
            
            {/* Mobile Menu */}
            {isMobileMenuOpen && (
                 <div className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40" onClick={() => setIsMobileMenuOpen(false)}>
                    <div className="fixed inset-y-0 left-0 w-4/5 max-w-sm bg-white p-6 z-50 overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                        <div className="flex justify-between items-center mb-6">
                            <DenfitLogo/>
                            <button onClick={() => setIsMobileMenuOpen(false)}><CloseIcon/></button>
                        </div>
                        <nav className="flex flex-col space-y-2">
                             {Object.entries(navCategories).map(([category, subCats]) => (
                                <details key={category} className="group">
                                    <summary className="flex justify-between items-center font-medium cursor-pointer list-none py-2">
                                        {category}
                                        <ChevronDownIcon />
                                    </summary>
                                    <div className="pl-4 flex flex-col items-start">
                                        {subCats.map(sub => (
                                            <button key={sub.name} onClick={() => handleFilterClick(category, sub.subCategory)} className="py-1 text-gray-600 hover:text-denfit-blue">{sub.name}</button>
                                        ))}
                                    </div>
                                </details>
                            ))}
                            <hr className="my-4"/>
                             {user && (
                                <>
                                 <button onClick={() => { fetchUserOrders(); setIsMobileMenuOpen(false); }} className="text-left w-full py-2 font-medium">My Orders</button>
                                 <button onClick={() => { logout(); setIsMobileMenuOpen(false); }} className="text-left w-full py-2 font-medium text-red-500">Logout</button>
                                </>
                            )}
                        </nav>
                    </div>
                </div>
            )}
        </header>
    );
};

export default Header;