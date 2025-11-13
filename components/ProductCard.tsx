import React, { useState, useEffect, useRef } from 'react';
import { Product } from '../types';
import { HeartIcon } from './Icons';
import { useAppContext } from '../App';

const ProductCard: React.FC<{ product: Product }> = ({ product }) => {
    const { openModal, addToCart, addToWishlist, currencySymbol, convertCurrency } = useAppContext();
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [isHovered, setIsHovered] = useState(false);
    const timeoutRef = useRef<number | null>(null);

    useEffect(() => {
        let intervalId: number;
        if (!isHovered) {
          intervalId = window.setInterval(() => {
            setCurrentImageIndex((prevIndex) =>
              prevIndex === product.images.length - 1 ? 0 : prevIndex + 1
            );
          }, 3000);
        }
    
        return () => {
          if (intervalId) clearInterval(intervalId);
        };
      }, [isHovered, product.images.length]);

    const handleQuickView = (e: React.MouseEvent) => {
        e.stopPropagation();
        openModal('product', product);
    }
    
    const handleAddToCart = (e: React.MouseEvent) => {
        e.stopPropagation();
        addToCart(product, product.sizes[0], product.colors[0]);
    }

    const handleAddToWishlist = (e: React.MouseEvent) => {
        e.stopPropagation();
        addToWishlist(product);
    }

    const salePercentage = product.originalPrice ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100) : 0;

    return (
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm group overflow-hidden" onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)}>
            <div className="relative aspect-square w-full overflow-hidden">
                {product.images.map((img, index) => (
                    <img key={index} src={img} alt={`${product.name} image ${index + 1}`} className={`absolute top-0 left-0 w-full h-full object-cover transition-opacity duration-500 ease-in-out ${index === currentImageIndex ? 'opacity-100' : 'opacity-0'}`} />
                ))}
                {salePercentage > 0 && <div className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-md">-{salePercentage}%</div>}
                
                <button onClick={handleAddToWishlist} className="absolute top-2 right-2 bg-white p-1.5 rounded-full text-gray-500 hover:text-red-500 transition-all lg:opacity-0 group-hover:opacity-100">
                    <HeartIcon className="h-5 w-5"/>
                </button>

                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex space-x-1.5">
                    {product.images.map((_, index) => (
                        <div key={index} onClick={() => setCurrentImageIndex(index)} className={`w-1.5 h-1.5 rounded-full cursor-pointer ${index === currentImageIndex ? 'bg-white' : 'bg-gray-400'}`}></div>
                    ))}
                </div>
            </div>
            <div className="p-4 text-center">
                <h3 className="font-semibold text-gray-800 truncate">{product.name}</h3>
                <div className="my-2">
                    <span className="font-bold text-lg text-denfit-blue">{currencySymbol}{convertCurrency(product.price)}</span>
                    {product.originalPrice && <span className="text-sm text-gray-400 line-through ml-2">{currencySymbol}{convertCurrency(product.originalPrice)}</span>}
                </div>
                <div className="flex flex-col sm:flex-row gap-2 justify-center">
                    <button onClick={handleQuickView} className="bg-white border border-gray-800 text-gray-800 text-sm font-semibold px-4 py-2 rounded-md hover:bg-gray-100 transition-colors w-full">Quick View</button>
                    <button onClick={handleAddToCart} className="bg-denfit-dark text-white text-sm font-semibold px-4 py-2 rounded-md hover:bg-gray-800 transition-colors w-full">Add to Cart</button>
                </div>
            </div>
        </div>
    );
};

export default ProductCard;