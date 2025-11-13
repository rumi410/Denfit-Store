import React, { useState, useEffect, useRef } from 'react';
import { useAppContext } from '../App';
import ProductCard from './ProductCard';
import { Product } from '../types';
import { ChevronLeftIcon, ChevronRightIcon, VerifiedIcon, GoogleIcon, StarIcon } from './Icons';

const HeroBanner: React.FC = () => {
    const { setFilter } = useAppContext();
    const [currentIndex, setCurrentIndex] = useState(0);
    const slides = [
        { img: 'https://images.unsplash.com/photo-1594938384914-204141365942?q=80&w=2070&auto=format&fit=crop', text: 'Explore Our New Jean Collection', button: 'Explore Jeans', category: 'Jeans' },
        { img: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?q=80&w=1935&auto=format&fit=crop', text: 'Premium Jackets for Every Season', button: 'Shop Jackets', category: 'Jackets' },
        { img: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?q=80&w=2070&auto=format&fit=crop', text: 'Comfortable & Stylish Hoodies', button: 'Discover Hoodies', category: 'Hoodies' },
        { img: 'https://images.unsplash.com/photo-1603252109360-704baafb8a8a?q=80&w=1976&auto=format&fit=crop', text: 'Shop All New Arrivals', button: 'Shop Now', category: 'All' },
    ];
    const timeoutRef = useRef<number | null>(null);

    const handleButtonClick = (category: string) => {
        setFilter({ category, subCategory: 'All' });
        document.getElementById('collections')?.scrollIntoView({ behavior: 'smooth' });
    };

    const resetTimeout = () => {
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };

    useEffect(() => {
        resetTimeout();
        timeoutRef.current = window.setTimeout(() =>
            setCurrentIndex((prevIndex) =>
                prevIndex === slides.length - 1 ? 0 : prevIndex + 1
            ), 5000);
        return () => resetTimeout();
    }, [currentIndex, slides.length]);

    return (
        <section className="relative w-full h-[60vh] md:h-[80vh] overflow-hidden bg-denfit-dark">
            {slides.map((slide, index) => (
                <div key={index} className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${index === currentIndex ? 'opacity-100' : 'opacity-0'}`}>
                    <img src={slide.img} alt={slide.text} className={`w-full h-full object-cover transition-transform duration-[10s] ease-linear ${index === currentIndex ? 'scale-110' : 'scale-100'}`} />
                    <div className="absolute inset-0 bg-black bg-opacity-40 flex flex-col items-center justify-center text-white text-center p-4">
                        <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold mb-4 animate-fade-in-down">{slide.text}</h2>
                        <button onClick={() => handleButtonClick(slide.category)} className="bg-denfit-blue text-white px-6 py-2 md:px-8 md:py-3 rounded-md font-semibold hover:bg-blue-700 transition-all duration-300 transform hover:scale-105">
                            {slide.button}
                        </button>
                    </div>
                </div>
            ))}
            <div className="absolute bottom-5 left-1/2 transform -translate-x-1/2 flex space-x-2">
                {slides.map((_, idx) => (
                    <div key={idx} className={`h-2 w-2 rounded-full cursor-pointer transition-all ${currentIndex === idx ? 'bg-white w-4' : 'bg-gray-400'}`} onClick={() => setCurrentIndex(idx)}></div>
                ))}
            </div>
        </section>
    );
};

const ProductCarousel: React.FC<{ title: string; products: Product[] }> = ({ title, products }) => {
    const carouselRef = useRef<HTMLDivElement>(null);

    const scroll = (direction: 'left' | 'right') => {
        if (carouselRef.current) {
            const cardWidth = carouselRef.current.children[0]?.clientWidth || 0;
            const scrollAmount = direction === 'left' ? -cardWidth * 2 : cardWidth * 2;
            carouselRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
        }
    };

    useEffect(() => {
        const interval = setInterval(() => {
            if (carouselRef.current) {
                const { scrollLeft, scrollWidth, clientWidth } = carouselRef.current;
                if (scrollLeft + clientWidth >= scrollWidth - 1) {
                    carouselRef.current.scrollTo({ left: 0, behavior: 'smooth' });
                } else {
                    carouselRef.current.scrollBy({ left: carouselRef.current.children[0]?.clientWidth, behavior: 'smooth' });
                }
            }
        }, 3000);
        return () => clearInterval(interval);
    }, []);

    if (!products || products.length === 0) return null;

    return (
        <section className="py-12 container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-8">{title}</h2>
            <div className="relative">
                <div ref={carouselRef} className="flex overflow-x-auto snap-x snap-mandatory scroll-smooth scrollbar-hide -mx-2">
                    {products.map(product => (
                        <div key={product._id} className="snap-start flex-shrink-0 w-1/2 sm:w-1/3 md:w-1/4 px-2">
                            <ProductCard product={product} />
                        </div>
                    ))}
                </div>
                 <button onClick={() => scroll('left')} className="absolute top-1/2 -left-4 transform -translate-y-1/2 bg-white rounded-full p-2 shadow-md hover:bg-gray-100 hidden md:block z-10"><ChevronLeftIcon /></button>
                 <button onClick={() => scroll('right')} className="absolute top-1/2 -right-4 transform -translate-y-1/2 bg-white rounded-full p-2 shadow-md hover:bg-gray-100 hidden md:block z-10"><ChevronRightIcon /></button>
            </div>
        </section>
    );
}


const Collections: React.FC = () => {
    const { products, filter, setFilter } = useAppContext();
    const mainFilter = filter.category;
    const subFilter = filter.subCategory;

    const categories = ['All', 'Jeans', 'Shirts', 'Jackets', 'Hoodies'];
    const subCategories: { [key: string]: string[] } = {
        Jeans: ['All', 'Baggy Jeans', 'Denim Jeans'],
        Shirts: ['All', 'Formal Shirts', 'Casual Shirts'],
        Jackets: ['All', 'Winter Jackets', 'Summer Jackets'],
        Hoodies: ['All', 'Pullovers', 'Zip-Up Hoodies'],
    };

    const handleMainFilter = (category: string) => {
        setFilter({ category, subCategory: 'All' });
    };
    
    const handleSubFilter = (subCategory: string) => {
        setFilter({ ...filter, subCategory });
    }

    const filteredProducts = products.filter(p => {
        const mainMatch = mainFilter === 'All' || p.category === mainFilter;
        const subMatch = subFilter === 'All' || p.subCategory === subFilter;
        return mainMatch && subMatch;
    });

    return (
        <section id="collections" className="py-12 bg-gray-50">
            <div className="container mx-auto px-4">
                <h2 className="text-3xl font-bold text-center mb-8">All Collections</h2>
                <div className="flex justify-center flex-wrap gap-2 md:gap-4 mb-6">
                    {categories.map(cat => (
                        <button key={cat} onClick={() => handleMainFilter(cat)} className={`px-6 py-2 rounded-full font-medium transition-colors ${mainFilter === cat ? 'bg-denfit-blue text-white' : 'bg-white text-gray-700 border hover:bg-gray-50'}`}>{cat}</button>
                    ))}
                </div>
                {mainFilter !== 'All' && subCategories[mainFilter] && (
                    <div className="bg-white p-4 rounded-lg shadow-sm mb-8 flex flex-col items-center">
                         <p className="font-semibold mb-3 text-black">Filter by {mainFilter}:</p>
                        <div className="flex justify-center flex-wrap gap-2 md:gap-4">
                           
                            {subCategories[mainFilter].map(subCat => (
                                <button key={subCat} onClick={() => handleSubFilter(subCat)} className={`px-5 py-1.5 rounded-full text-sm font-medium transition-colors ${subFilter === subCat ? 'bg-denfit-blue text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>{subCat}</button>
                            ))}
                        </div>
                    </div>
                )}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                    {filteredProducts.map(product => <ProductCard key={product._id} product={product} />)}
                </div>
            </div>
        </section>
    );
};

const Testimonials: React.FC = () => {
    const { openModal } = useAppContext();
    const carouselRef = useRef<HTMLDivElement>(null);
    const reviews = [
        { name: 'Inaam Ullah', avatar: 'I', text: "Love the Denfit shirts collection. Perfect for work and the quality is excellent.", rating: 5 },
        { name: 'Ikram Ullah', avatar: 'I', text: "The leather jackets from Denfit are amazing! Great craftsmanship.", rating: 5 },
        { name: 'Ibtisam Ullah', avatar: 'I', text: "Excellent customer support and fast delivery. Denfit products exceed expectations!", rating: 5 },
        { name: 'Abdul Majid', avatar: 'A', text: "The Denfit hoodies are so soft and comfortable. I live in mine!", rating: 5 },
        { name: 'Amna Khan', avatar: 'A', text: "Great fit on the Denfit jeans. Will definitely order again.", rating: 5},
        { name: 'Maria Khan', avatar: 'M', text: "Perfect for casual wear. Very stylish and comfortable.", rating: 4 },
        { name: 'Abdullah', avatar: 'A', text: "The denim is top-notch. Highly recommended Denfit for quality lovers.", rating: 5 },
        { name: 'Abdul Rehman', avatar: 'A', text: "My go-to store for all my fashion needs. Denfit never disappoints.", rating: 5 },
        { name: 'Fatima Ali', avatar: 'F', text: "The customer service is as great as the products. Very helpful team.", rating: 5 },
        { name: 'Zainab Ahmed', avatar: 'Z', text: "The winter collection from Denfit is a must-have. Warm and trendy.", rating: 5},
        { name: 'Usman Tariq', avatar: 'U', text: "I'm impressed with the stitching and fabric quality. Denfit is the real deal.", rating: 5 },
        { name: 'Ayesha Nadeem', avatar: 'A', text: "Finally found a brand that offers both style and comfort. Thank you, Denfit!", rating: 5 },
        { name: 'Hassan Raza', avatar: 'H', text: "The colors are vibrant and don't fade after washing. Great value for money.", rating: 4 },
        { name: 'Sana Javed', avatar: 'S', text: "Denfit has become my favorite online store. The variety is just amazing.", rating: 5 },
        { name: 'Ali Hassan', avatar: 'A', text: "The fitting is perfect, just as described in the size guide. Very reliable.", rating: 5 },
        { name: 'Mahnoor Shah', avatar: 'M', text: "My order arrived earlier than expected. Fantastic service from Denfit!", rating: 5 },
        { name: 'Bilal Ahmed', avatar: 'B', text: "Denfit's casual shirts are perfect for weekend outings. So trendy!", rating: 5 },
        { name: 'Nadia Hussain', avatar: 'N', text: "The online shopping experience was smooth and user-friendly.", rating: 5 },
        { name: 'Kamran Shah', avatar: 'K', text: "A truly premium feel to all Denfit products. Worth every penny.", rating: 5 },
        { name: 'Samiullah Khan', avatar: 'S', text: "I recommend Denfit to all my friends. You won't be disappointed.", rating: 5},
    ];
    const colors = ['bg-purple-500', 'bg-red-500', 'bg-blue-500', 'bg-pink-500', 'bg-indigo-500', 'bg-green-500', 'bg-yellow-500', 'bg-gray-500', 'bg-teal-500', 'bg-orange-500'];
    
    useEffect(() => {
        const interval = setInterval(() => {
            if (carouselRef.current) {
                const { scrollLeft, scrollWidth, clientWidth } = carouselRef.current;
                if (scrollLeft + clientWidth >= scrollWidth -1) {
                    carouselRef.current.scrollTo({ left: 0, behavior: 'smooth' });
                } else {
                    carouselRef.current.scrollBy({ left: carouselRef.current.children[0]?.clientWidth, behavior: 'smooth' });
                }
            }
        }, 3000);
        return () => clearInterval(interval);
    }, []);

    return (
        <section className="py-16 container mx-auto px-4">
            <div className="flex justify-between items-center mb-8">
                 <h2 className="text-3xl font-bold">What Our Customers Say</h2>
                 <button onClick={() => openModal('brand_review')} className="bg-denfit-blue text-white px-6 py-2 rounded-md font-semibold hover:bg-blue-700 transition-colors">Add Your Review</button>
            </div>
            <div className="relative">
                <div ref={carouselRef} className="flex overflow-x-auto snap-x snap-mandatory scroll-smooth scrollbar-hide -mx-3">
                    {reviews.map((review, index) => (
                         <div key={index} className="snap-start flex-shrink-0 w-full sm:w-1/2 md:w-1/3 lg:w-1/4 px-3">
                            <div className="bg-gray-50 p-6 rounded-lg shadow-sm h-full">
                                <div className="flex items-center mb-4">
                                    <div className={`w-12 h-12 rounded-full ${colors[index % colors.length]} text-white flex items-center justify-center text-xl font-bold mr-4`}>{review.avatar}</div>
                                    <div>
                                        <div className="flex items-center">
                                            <p className="font-semibold">{review.name}</p>
                                            <VerifiedIcon />
                                        </div>
                                        <div className="flex items-center text-sm text-gray-500">
                                            <GoogleIcon /><span className="ml-1">via Google</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex mb-2">
                                    {[...Array(5)].map((_, i) => <StarIcon key={i} className={`w-5 h-5 ${i < review.rating ? 'text-yellow-400' : 'text-gray-300'}`} />)}
                                </div>
                                <p className="text-gray-600 text-sm">{review.text}</p>
                            </div>
                         </div>
                     ))}
                </div>
            </div>
        </section>
    );
};

const HomePage: React.FC = () => {
    const { products } = useAppContext();
    const newArrivals = products.slice(0, 8);
    const featuredProducts = products.filter(p => p.originalPrice).slice(0, 8);
    
    return (
        <>
            <HeroBanner />
            <ProductCarousel title="New Arrivals" products={newArrivals} />
            <ProductCarousel title="On Sale" products={featuredProducts} />
            <Collections />
            <Testimonials />
        </>
    );
};

export default HomePage;
