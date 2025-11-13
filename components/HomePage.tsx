import React, { useState, useEffect, useRef } from 'react';
import { useAppContext } from '../App';
import ProductCard from './ProductCard';
import { Product } from '../types';
import { ChevronLeftIcon, ChevronRightIcon, VerifiedIcon, GoogleIcon, StarIcon } from './Icons';

const HeroBanner: React.FC = () => {
    const { setFilter } = useAppContext();
    const [currentIndex, setCurrentIndex] = useState(0);
    const slides = [
        { img: 'https://picsum.photos/id/10/1920/800', text: 'Explore Our New Jean Collection', button: 'Explore Jeans', category: 'Jeans' },
        { img: 'https://picsum.photos/id/20/1920/800', text: 'Premium Jackets for Every Season', button: 'Shop Jackets', category: 'Jackets' },
        { img: 'https://picsum.photos/id/30/1920/800', text: 'Comfortable & Stylish Hoodies', button: 'Discover Hoodies', category: 'Hoodies' },
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
            ), 3000);
        return () => resetTimeout();
    }, [currentIndex, slides.length]);

    return (
        <section className="relative w-full h-[50vh] md:h-[70vh] overflow-hidden bg-denfit-dark">
            <div className="whitespace-nowrap transition-transform duration-1000 ease-in-out h-full" style={{ transform: `translateX(${-currentIndex * 100}%)` }}>
                {slides.map((slide, index) => (
                    <div key={index} className="inline-block w-full h-full relative">
                        <img src={slide.img} alt={slide.text} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black bg-opacity-40 flex flex-col items-center justify-center text-white text-center p-4">
                            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold mb-4 animate-fade-in-down">{slide.text}</h2>
                            <button onClick={() => handleButtonClick(slide.category)} className="bg-denfit-blue text-white px-6 py-2 md:px-8 md:py-3 rounded-md font-semibold hover:bg-blue-700 transition-all duration-300 transform hover:scale-105">
                                {slide.button}
                            </button>
                        </div>
                    </div>
                ))}
            </div>
            <div className="absolute bottom-5 left-1/2 transform -translate-x-1/2 flex space-x-2">
                {slides.map((_, idx) => (
                    <div key={idx} className={`h-2 w-2 rounded-full cursor-pointer transition-colors ${currentIndex === idx ? 'bg-white' : 'bg-gray-400'}`} onClick={() => setCurrentIndex(idx)}></div>
                ))}
            </div>
        </section>
    );
};

const ProductCarousel: React.FC<{ title: string; products: Product[] }> = ({ title, products }) => {
    const carouselRef = useRef<HTMLDivElement>(null);
    const scrollIntervalRef = useRef<number | null>(null);

    const startAutoScroll = () => {
        if (scrollIntervalRef.current) clearInterval(scrollIntervalRef.current);
        scrollIntervalRef.current = window.setInterval(() => {
            if (carouselRef.current) {
                const { scrollLeft, scrollWidth, clientWidth } = carouselRef.current;
                const cardWidth = carouselRef.current.children[0]?.clientWidth || 0;
                
                if (scrollLeft + clientWidth >= scrollWidth - 1) { // -1 for precision issues
                    carouselRef.current.scrollTo({ left: 0, behavior: 'smooth' });
                } else {
                    carouselRef.current.scrollBy({ left: cardWidth, behavior: 'smooth' });
                }
            }
        }, 3000);
    };
    
    const stopAutoScroll = () => {
        if (scrollIntervalRef.current) clearInterval(scrollIntervalRef.current);
    };

    useEffect(() => {
        startAutoScroll();
        return () => stopAutoScroll();
    }, [products]);

    const scroll = (direction: 'left' | 'right') => {
        stopAutoScroll();
        if (carouselRef.current) {
            const cardWidth = carouselRef.current.children[0]?.clientWidth || 0;
            const scrollAmount = direction === 'left' ? -cardWidth * 2 : cardWidth * 2;
            carouselRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
        }
        startAutoScroll();
    };


    if (!products || products.length === 0) return null;

    return (
        <section className="py-12 container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-8">{title}</h2>
            <div className="relative" onMouseEnter={stopAutoScroll} onMouseLeave={startAutoScroll}>
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
        Hoodies: ['All', 'Pullovers', 'Zip-Up Hoodies', 'Winter Hoodies'],
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
                        <button key={cat} onClick={() => handleMainFilter(cat)} className={`px-6 py-2 rounded-full font-medium transition-colors ${mainFilter === cat ? 'bg-denfit-blue text-white' : 'bg-white text-gray-700 border'}`}>{cat}</button>
                    ))}
                </div>
                {mainFilter !== 'All' && subCategories[mainFilter] && (
                    <div className="bg-white p-4 rounded-lg shadow-sm mb-8 flex flex-col items-center">
                         <p className="font-semibold mb-3 text-black">Filter by {mainFilter}:</p>
                        <div className="flex justify-center flex-wrap gap-2 md:gap-4">
                           
                            {subCategories[mainFilter].map(subCat => (
                                <button key={subCat} onClick={() => handleSubFilter(subCat)} className={`px-5 py-1.5 rounded-full text-sm font-medium transition-colors ${subFilter === subCat ? 'bg-denfit-blue text-white' : 'bg-gray-100 text-gray-600'}`}>{subCat}</button>
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
    const { openModal, user } = useAppContext();
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

    const reviews = [
        { name: 'Bilal Ahmad', avatar: 'B', text: "Love the formal shirts collection. Perfect for work and the quality is excellent.", rating: 5 },
        { name: 'Nadia Hussain', avatar: 'N', text: "The leather jackets are amazing! Great craftsmanship and attention to detail.", rating: 5 },
        { name: 'Kamran Shah', avatar: 'K', text: "Excellent customer support and fast delivery. The products exceed expectations!", rating: 5 },
        { name: 'Aisha Khan', avatar: 'A', text: "The hoodies are so soft and comfortable. I live in mine!", rating: 5 },
        { name: 'Samiullah Khan', avatar: 'S', text: "Great fit on the jeans. Will definitely order again.", rating: 5},
    ];
    const colors = ['bg-purple-500', 'bg-red-500', 'bg-blue-500', 'bg-pink-500', 'bg-indigo-500'];
    
    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const itemsVisible = isMobile ? 1 : 3;
    const maxIndex = reviews.length > itemsVisible ? reviews.length - itemsVisible : 0;
    
    const nextSlide = () => setCurrentIndex(prev => (prev >= maxIndex ? 0 : prev + 1));
    const prevSlide = () => setCurrentIndex(prev => (prev <= 0 ? maxIndex : prev - 1));

    const handleAddReview = () => {
        if (user) {
            alert("Please select a product to review from its detail page.");
        } else {
            openModal('login');
        }
    };
    
    return (
        <section className="py-16 container mx-auto px-4">
            <div className="flex justify-between items-center mb-8">
                 <h2 className="text-3xl font-bold text-center">What Our Customers Say</h2>
                 <button onClick={handleAddReview} className="bg-denfit-blue text-white px-6 py-2 rounded-md font-semibold hover:bg-blue-700 transition-colors">Add Review</button>
            </div>
            <div className="relative">
                <div className="overflow-hidden">
                    <div className="flex transition-transform duration-500 ease-in-out" style={{ transform: `translateX(-${currentIndex * (100 / itemsVisible)}%)` }}>
                         {reviews.map((review, index) => (
                             <div key={index} className="w-full md:w-1/3 flex-shrink-0 px-2" style={{ flexBasis: `${100 / itemsVisible}%` }}>
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
                                        {[...Array(review.rating)].map((_, i) => <StarIcon key={i} className="w-5 h-5 text-yellow-400" />)}
                                    </div>
                                    <p className="text-gray-600">{review.text}</p>
                                </div>
                             </div>
                         ))}
                    </div>
                </div>
                 <button onClick={prevSlide} className="absolute top-1/2 -left-4 transform -translate-y-1/2 bg-white rounded-full p-2 shadow-md hover:bg-gray-100 z-10 hidden md:flex"><ChevronLeftIcon /></button>
                 <button onClick={nextSlide} className="absolute top-1/2 -right-4 transform -translate-y-1/2 bg-white rounded-full p-2 shadow-md hover:bg-gray-100 z-10 hidden md:flex"><ChevronRightIcon /></button>
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
            <ProductCarousel title="Featured Products" products={featuredProducts} />
            <Collections />
            <Testimonials />
        </>
    );
};

export default HomePage;