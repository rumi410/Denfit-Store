import React, { useState, Fragment, useEffect } from 'react';
import { toast } from 'react-toastify';
import { useAppContext } from '../App';
import { Product, Order, StaticPageType, ShippingAddress, CustomerDetails } from '../types';
import { CloseIcon, HeartIcon, StarIcon, CheckCircleIcon, ShippingIcon, ConfirmedIcon, DeliveredIcon, EyeIcon, EyeOffIcon, VisaIcon, MastercardIcon, ChevronDownIcon } from './Icons';
import { forgotPassword, verifyPasscode, resetPassword, submitBrandReview, subscribeNewsletter } from '../services/api';

const ModalWrapper: React.FC<{ children: React.ReactNode, onClose: () => void, title: string, size?: 'sm' | 'md' | 'lg' | 'xl' }> = ({ children, onClose, title, size = 'md' }) => {
    const sizeClasses = {
        sm: 'max-w-sm',
        md: 'max-w-md',
        lg: 'max-w-2xl',
        xl: 'max-w-4xl',
    };
    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4 animate-fade-in" onClick={onClose}>
            <div className={`bg-white rounded-lg shadow-2xl w-full ${sizeClasses[size]} m-4 relative animate-scale-in max-h-[90vh] flex flex-col`} onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center p-4 border-b">
                    <h2 className="text-xl font-bold">{title}</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-800"><CloseIcon /></button>
                </div>
                <div className="p-6 overflow-y-auto">
                    {children}
                </div>
            </div>
        </div>
    );
};

export const LoginModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
    const { login, signup, openModal } = useAppContext();
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            if (isLogin) {
                await login({ email, password });
            } else {
                await signup({ name, email, password });
            }
            onClose();
        } catch (error: any) {
            toast.error(error.message || 'An error occurred.');
        } finally {
            setLoading(false);
        }
    };
    
    return (
        <ModalWrapper onClose={onClose} title={isLogin ? "Login" : "Sign Up"} size="sm">
            <form onSubmit={handleSubmit} className="space-y-4">
                {!isLogin && (
                    <input type="text" placeholder="Full Name" value={name} onChange={e => setName(e.target.value)} required className="w-full px-4 py-2 border rounded-md bg-white text-gray-900 focus:ring-1 focus:ring-denfit-blue focus:outline-none" />
                )}
                <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required className="w-full px-4 py-2 border rounded-md bg-white text-gray-900 focus:ring-1 focus:ring-denfit-blue focus:outline-none" />
                <div className="relative">
                    <input type={showPassword ? "text" : "password"} placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required className="w-full px-4 py-2 border rounded-md bg-white text-gray-900 focus:ring-1 focus:ring-denfit-blue focus:outline-none" />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400">
                        {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                    </button>
                </div>

                {isLogin && (
                    <div className="text-right">
                         <button type="button" onClick={() => {onClose(); openModal('forgot_password')}} className="text-sm text-denfit-blue hover:underline">Forgot Password?</button>
                    </div>
                )}

                <button type="submit" disabled={loading} className="w-full bg-denfit-blue text-white py-2 rounded-md hover:bg-blue-700 disabled:bg-gray-400">
                    {loading ? 'Loading...' : (isLogin ? 'Login' : 'Create Account')}
                </button>
            </form>
            <div className="text-center mt-4">
                <button onClick={() => setIsLogin(!isLogin)} className="text-sm text-denfit-blue hover:underline">
                    {isLogin ? "Don't have an account? Sign Up" : "Already have an account? Login"}
                </button>
            </div>
        </ModalWrapper>
    );
};

export const CartModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
    const { cart, removeFromCart, updateCartQuantity, openModal, user, currencySymbol, convertCurrency } = useAppContext();
    const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

    const handleCheckout = () => {
        if (cart.length === 0) {
            toast.warn("Your cart is empty.");
            return;
        }
        if (!user) {
            toast.warn("Please login to proceed to checkout.");
            onClose();
            openModal('login');
            return;
        }
        onClose();
        openModal('checkout');
    };

    return (
        <ModalWrapper onClose={onClose} title={`Your Cart (${cart.reduce((acc, item) => acc + item.quantity, 0)})`} size="lg">
            {cart.length === 0 ? (
                <div className="text-center py-8">
                    <p>Your cart is empty.</p>
                    <button onClick={onClose} className="mt-4 bg-denfit-blue text-white px-6 py-2 rounded-md hover:bg-blue-700">Continue Shopping</button>
                </div>
            ) : (
                <Fragment>
                    <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
                        {cart.map(item => (
                            <div key={item.cartItemId} className="flex items-center gap-4 border-b pb-4">
                                <img src={item.images[0]} alt={item.name} className="w-24 h-24 object-cover rounded-md" />
                                <div className="flex-grow">
                                    <h3 className="font-semibold">{item.name}</h3>
                                    <p className="text-sm text-gray-500">Size: {item.size}, Color: {item.color}</p>
                                    <p className="font-bold">{currencySymbol}{convertCurrency(item.price)}</p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button onClick={() => updateCartQuantity(item.cartItemId, item.quantity - 1)} className="border px-2 rounded-md">-</button>
                                    <span>{item.quantity}</span>
                                    <button onClick={() => updateCartQuantity(item.cartItemId, item.quantity + 1)} className="border px-2 rounded-md">+</button>
                                </div>
                                <button onClick={() => removeFromCart(item.cartItemId)} className="text-red-500 hover:text-red-700"><CloseIcon /></button>
                            </div>
                        ))}
                    </div>
                    <div className="mt-6 text-right">
                        <p className="text-lg font-bold">Subtotal: {currencySymbol}{convertCurrency(subtotal)}</p>
                        <p className="text-sm text-gray-500">Shipping & taxes calculated at checkout.</p>
                        <button onClick={handleCheckout} className="mt-4 bg-denfit-blue text-white px-6 py-2 rounded-md hover:bg-blue-700">Checkout</button>
                    </div>
                </Fragment>
            )}
        </ModalWrapper>
    );
};


export const WishlistModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
    const { wishlist, removeFromWishlist, addToCart, currencySymbol, convertCurrency } = useAppContext();
    
    const handleAddToCart = (item: Product) => {
        addToCart(item, item.sizes[0], item.colors[0]);
        removeFromWishlist(item._id);
    };

    return (
        <ModalWrapper onClose={onClose} title={`Your Wishlist (${wishlist.length})`} size="lg">
            {wishlist.length === 0 ? (
                 <div className="text-center py-8">
                    <p>Your wishlist is empty.</p>
                    <button onClick={onClose} className="mt-4 bg-denfit-blue text-white px-6 py-2 rounded-md hover:bg-blue-700">Continue Shopping</button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {wishlist.map(item => (
                        <div key={item._id} className="flex items-center gap-4 border p-2 rounded-md">
                            <img src={item.images[0]} alt={item.name} className="w-20 h-20 object-cover rounded-md" />
                            <div className="flex-grow">
                                <h3 className="font-semibold">{item.name}</h3>
                                <p className="font-bold">{currencySymbol}{convertCurrency(item.price)}</p>
                                <div className="flex gap-2 mt-2">
                                    <button onClick={() => handleAddToCart(item)} className="text-sm bg-black text-white px-3 py-1 rounded-md hover:bg-denfit-blue">Move to Cart</button>
                                    <button onClick={() => removeFromWishlist(item._id)} className="text-sm border px-3 py-1 rounded-md hover:bg-gray-100">Remove</button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </ModalWrapper>
    );
};

const AccordionItem: React.FC<{ title: string, children: React.ReactNode }> = ({ title, children }) => {
    const [isOpen, setIsOpen] = useState(false);
    return (
        <div className="border-t">
            <button onClick={() => setIsOpen(!isOpen)} className="w-full flex justify-between items-center py-3 text-left">
                <span className="font-semibold">{title}</span>
                <ChevronDownIcon />
            </button>
            {isOpen && <div className="pb-3 text-gray-600">{children}</div>}
        </div>
    )
}

export const ProductDetailModal: React.FC<{ product: Product, onClose: () => void }> = ({ product, onClose }) => {
    const { addToCart, addToWishlist, addReview, user, openModal, currencySymbol, convertCurrency } = useAppContext();
    const [selectedSize, setSelectedSize] = useState(product.sizes[0]);
    const [selectedColor, setSelectedColor] = useState(product.colors[0]);
    const [mainImageIndex, setMainImageIndex] = useState(0);
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState('');

    useEffect(() => {
        const interval = setInterval(() => {
            setMainImageIndex(prev => (prev + 1) % product.images.length);
        }, 3000);
        return () => clearInterval(interval);
    }, [product.images.length]);

    const handleAddReview = (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) {
            toast.warn("You must be logged in to add a review.");
            onClose();
            openModal('login');
            return;
        }
        if (rating > 0 && comment) {
            addReview(product._id, { rating, comment });
            setRating(0);
            setComment('');
        } else {
            toast.warn("Please provide a rating and a comment.")
        }
    };
    
    return (
        <ModalWrapper onClose={onClose} title={product.name} size="xl">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Image Section */}
                <div>
                    <div className="relative aspect-square w-full overflow-hidden rounded-lg mb-2">
                        {product.images.map((img, index) => (
                             <img key={img} src={img} alt={product.name} className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${index === mainImageIndex ? 'opacity-100' : 'opacity-0'}`} />
                        ))}
                    </div>
                    <div className="flex justify-center gap-2">
                        {product.images.map((img, index) => (
                            <img key={img} src={img} onClick={() => setMainImageIndex(index)} alt={`${product.name} thumbnail`} className={`w-16 h-16 object-cover rounded-md cursor-pointer border-2 ${mainImageIndex === index ? 'border-denfit-blue' : 'border-transparent'}`} />
                        ))}
                    </div>
                </div>
                {/* Details Section */}
                <div className="flex flex-col">
                    <div className="flex items-center gap-2 mb-2">
                        <div className="flex text-yellow-400">{[...Array(5)].map((_, i) => <StarIcon key={i} className={i < Math.round(product.rating) ? 'text-yellow-400' : 'text-gray-300'} />)}</div>
                        <span className="text-sm text-gray-500">({product.numReviews} reviews)</span>
                    </div>
                     <div className="my-2">
                        <span className="font-bold text-2xl text-denfit-blue">{currencySymbol}{convertCurrency(product.price)}</span>
                        {product.originalPrice && <span className="text-md text-gray-400 line-through ml-2">{currencySymbol}{convertCurrency(product.originalPrice)}</span>}
                    </div>
                    <div className="mb-4">
                        <h4 className="font-semibold mb-2">Color: <span className="font-normal">{selectedColor}</span></h4>
                        <div className="flex gap-2 flex-wrap">
                            {product.colors.map(color => <button key={color} onClick={() => setSelectedColor(color)} className={`border px-4 py-2 rounded-md ${selectedColor === color ? 'bg-black text-white' : 'bg-white text-black'}`}>{color}</button>)}
                        </div>
                    </div>
                    <div className="mb-4">
                        <h4 className="font-semibold mb-2">Size: <span className="font-normal">{selectedSize}</span></h4>
                        <div className="flex gap-2 flex-wrap">
                            {product.sizes.map(size => <button key={size} onClick={() => setSelectedSize(size)} className={`border px-4 py-2 rounded-md ${selectedSize === size ? 'bg-black text-white' : 'bg-white text-black'}`}>{size}</button>)}
                        </div>
                    </div>
                   
                    <div className="flex gap-4 my-4">
                        <button onClick={() => addToCart(product, selectedSize, selectedColor)} className="flex-grow bg-denfit-blue text-white py-3 rounded-md hover:bg-blue-700">Add to Cart</button>
                        <button onClick={() => addToWishlist(product)} className="border p-3 rounded-md hover:bg-gray-100"><HeartIcon /></button>
                    </div>
                    
                    <AccordionItem title="Size Guide">
                        <p>This is a sample size guide. Please refer to our detailed size chart for accurate measurements.</p>
                    </AccordionItem>
                    <AccordionItem title="Product Description">
                        <p>{product.description}</p>
                    </AccordionItem>
                    
                    {/* Reviews Section */}
                    <div className="mt-4 flex-grow flex flex-col">
                        <h4 className="font-semibold mb-2 border-t pt-4">Reviews</h4>
                         <div className="space-y-4 flex-grow overflow-y-auto pr-2 max-h-40">
                            {product.reviews.length > 0 ? product.reviews.map(review => (
                                <div key={review._id} className="border-b pb-2">
                                    <div className="flex justify-between">
                                        <span className="font-semibold">{review.name}</span>
                                        <div className="flex">{[...Array(5)].map((_, i) => <StarIcon key={i} className={`w-4 h-4 ${i < review.rating ? 'text-yellow-400' : 'text-gray-300'}`} />)}</div>
                                    </div>
                                    <p className="text-gray-600 text-sm">{review.comment}</p>
                                </div>
                            )) : <p className="text-sm text-gray-500">No reviews yet.</p>}
                        </div>

                        <form onSubmit={handleAddReview} className="mt-4 space-y-2">
                            <div className="flex">
                                {[...Array(5)].map((_, i) => <StarIcon key={i} onClick={() => setRating(i + 1)} className={`cursor-pointer w-6 h-6 ${i < rating ? 'text-yellow-400' : 'text-gray-300'}`} />)}
                            </div>
                            <textarea value={comment} onChange={e => setComment(e.target.value)} placeholder="Write your review..." className="w-full border p-2 rounded-md bg-white text-gray-900" rows={2}></textarea>
                            <button type="submit" className="bg-black text-white px-4 py-1 rounded-md text-sm hover:bg-denfit-blue">Submit Review</button>
                        </form>
                    </div>
                </div>
            </div>
        </ModalWrapper>
    );
};

export const CheckoutModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
    const { placeOrder, cart, user, openModal, currencySymbol, convertCurrency } = useAppContext();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [customerDetails, setCustomerDetails] = useState<CustomerDetails>({ name: user?.name || '', email: user?.email || '', phone: '' });
    const [shippingAddress, setShippingAddress] = useState<ShippingAddress>(user?.address || { address: '', city: '', postalCode: '', country: '' });
    const [paymentMethod, setPaymentMethod] = useState('cod');

    const handleCustomerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setCustomerDetails({ ...customerDetails, [e.target.name]: e.target.value });
    };

    const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setShippingAddress({ ...shippingAddress, [e.target.name]: e.target.value });
    };
    
    const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const shipping = 5.00;
    const total = subtotal + shipping;

    const handlePlaceOrder = async () => {
        if (!customerDetails.name || !customerDetails.email || !customerDetails.phone || !shippingAddress.address || !shippingAddress.city) {
            toast.warn("Please fill in all required customer and address fields.");
            return;
        }
        setLoading(true);
        try {
            await placeOrder({ customerDetails, shippingAddress, paymentMethod });
            setStep(2);
        } catch (error: any) {
            toast.error(error.message || 'Failed to place order.');
        } finally {
            setLoading(false);
        }
    };

    if(!user) {
        onClose();
        openModal('login');
        return null;
    }

    return (
        <ModalWrapper onClose={onClose} title="Checkout" size="xl">
            {step === 1 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                    <div>
                        <h3 className="font-bold text-lg mb-4">1. Customer Information</h3>
                        <div className="space-y-3">
                            <input type="text" name="name" placeholder="Full Name" value={customerDetails.name} onChange={handleCustomerChange} className="w-full p-2 border rounded bg-white text-gray-900" required />
                            <input type="email" name="email" placeholder="Email Address" value={customerDetails.email} onChange={handleCustomerChange} className="w-full p-2 border rounded bg-white text-gray-900" required />
                            <input type="tel" name="phone" placeholder="Phone Number" value={customerDetails.phone} onChange={handleCustomerChange} className="w-full p-2 border rounded bg-white text-gray-900" required />
                        </div>
                        <h3 className="font-bold text-lg mb-4 mt-6">2. Shipping Address</h3>
                        <div className="space-y-3">
                            <input type="text" name="address" placeholder="Street Address" value={shippingAddress.address} onChange={handleAddressChange} className="w-full p-2 border rounded bg-white text-gray-900" required />
                            <input type="text" name="city" placeholder="City" value={shippingAddress.city} onChange={handleAddressChange} className="w-full p-2 border rounded bg-white text-gray-900" required />
                            <div className="flex gap-3">
                                <input type="text" name="postalCode" placeholder="Postal Code (Optional)" value={shippingAddress.postalCode} onChange={handleAddressChange} className="w-full p-2 border rounded bg-white text-gray-900" />
                                <input type="text" name="country" placeholder="Country" value={shippingAddress.country} onChange={handleAddressChange} className="w-full p-2 border rounded bg-white text-gray-900" />
                            </div>
                        </div>
                         <h3 className="font-bold text-lg mb-4 mt-6">3. Payment Method</h3>
                         <div className="space-y-2">
                            <label className="flex items-center p-3 border rounded-md has-[:checked]:bg-blue-50 has-[:checked]:border-denfit-blue cursor-pointer">
                                <input type="radio" name="paymentMethod" value="cod" checked={paymentMethod === 'cod'} onChange={e => setPaymentMethod(e.target.value)} className="mr-3"/>
                                Cash on Delivery
                            </label>
                             <label className="flex items-center p-3 border rounded-md has-[:checked]:bg-blue-50 has-[:checked]:border-denfit-blue cursor-pointer">
                                <input type="radio" name="paymentMethod" value="card" checked={paymentMethod === 'card'} onChange={e => setPaymentMethod(e.target.value)} className="mr-3"/>
                                <div className="flex items-center gap-2">
                                  Credit / Debit Card <VisaIcon/> <MastercardIcon />
                                </div>
                            </label>
                            {paymentMethod === 'card' && (
                                <div className="p-4 border rounded-md space-y-3 bg-gray-50">
                                    <input type="text" placeholder="Cardholder Name" className="w-full p-2 border rounded" />
                                    <input type="text" placeholder="Card Number" className="w-full p-2 border rounded" />
                                    <div className="flex gap-3">
                                        <input type="text" placeholder="MM/YY" className="w-full p-2 border rounded" />
                                        <input type="text" placeholder="CVV" className="w-full p-2 border rounded" />
                                    </div>
                                </div>
                            )}
                         </div>
                    </div>
                    <div>
                        <h3 className="font-bold text-lg mb-4">Order Summary</h3>
                        <div className="space-y-2 mb-4 max-h-48 overflow-y-auto pr-2 bg-gray-50 p-3 rounded-md">
                            {cart.map(item => (
                                <div key={item.cartItemId} className="flex justify-between items-center text-sm">
                                    <div className="flex items-center gap-2">
                                        <img src={item.images[0]} alt={item.name} className="w-10 h-10 object-cover rounded"/>
                                        <span>{item.name} (x{item.quantity})</span>
                                    </div>
                                    <span>{currencySymbol}{convertCurrency(item.price * item.quantity)}</span>
                                </div>
                            ))}
                        </div>
                        <div className="border-t pt-4 space-y-2">
                            <div className="flex justify-between"><span>Subtotal</span><span>{currencySymbol}{convertCurrency(subtotal)}</span></div>
                            <div className="flex justify-between"><span>Shipping</span><span>{currencySymbol}{convertCurrency(shipping)}</span></div>
                            <div className="flex justify-between font-bold text-lg"><span>Total</span><span>{currencySymbol}{convertCurrency(total)}</span></div>
                        </div>
                        <button onClick={handlePlaceOrder} disabled={loading} className="mt-6 w-full bg-denfit-blue text-white py-3 rounded-md hover:bg-blue-700 disabled:bg-gray-400">
                            {loading ? "Processing..." : (paymentMethod === 'cod' ? 'Place Order' : 'Pay Now')}
                        </button>
                    </div>
                </div>
            ) : (
                <div className="text-center py-8">
                    <CheckCircleIcon />
                    <h2 className="text-2xl font-bold mt-4">Order Placed Successfully!</h2>
                    <p className="text-gray-600 mt-2">Thank you for your purchase. You can track your order in the 'My Orders' section.</p>
                    <button onClick={onClose} className="mt-6 bg-denfit-dark text-white px-6 py-2 rounded-md">Continue Shopping</button>
                </div>
            )}
        </ModalWrapper>
    );
};


export const OrdersModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
    const { orders = [], loading, error, currencySymbol, convertCurrency } = useAppContext();
    
    const OrderStatusTracker: React.FC<{ order: Order }> = ({ order }) => {
        const isConfirmed = ['Confirmed', 'Shipped', 'Delivered'].includes(order.status);
        const isShipped = ['Shipped', 'Delivered'].includes(order.status);
        const isDelivered = order.status === 'Delivered';
        
        return (
            <div className="flex items-center justify-between mt-4 text-center">
                <div className="flex flex-col items-center">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isConfirmed ? 'bg-denfit-blue' : 'bg-gray-200'}`}><ConfirmedIcon active={isConfirmed} /></div>
                    <p className="text-xs mt-1">Confirmed</p>
                </div>
                <div className={`flex-grow h-0.5 mx-2 ${isShipped ? 'bg-denfit-blue' : 'bg-gray-200'}`}></div>
                <div className="flex flex-col items-center">
                     <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isShipped ? 'bg-denfit-blue text-white' : 'bg-gray-200 text-gray-500'}`}><ShippingIcon active={isShipped} /></div>
                    <p className="text-xs mt-1">Shipped</p>
                </div>
                 <div className={`flex-grow h-0.5 mx-2 ${isDelivered ? 'bg-denfit-blue' : 'bg-gray-200'}`}></div>
                <div className="flex flex-col items-center">
                     <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isDelivered ? 'bg-denfit-blue text-white' : 'bg-gray-200 text-gray-500'}`}><DeliveredIcon active={isDelivered} /></div>
                    <p className="text-xs mt-1">Delivered</p>
                </div>
            </div>
        )
    }

    return (
        <ModalWrapper onClose={onClose} title="My Orders" size="xl">
            {loading && <p>Loading orders...</p>}
            {error && <p className="text-red-500">{error}</p>}
            {!loading && !error && (
                orders.length === 0 ? <p className="text-center py-8">You have no orders yet.</p> : (
                    <div className="space-y-6 max-h-[70vh] overflow-y-auto pr-2">
                        {orders.map(order => (
                            <div key={order._id} className="border p-4 rounded-lg">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h3 className="font-bold">Order #{order._id.slice(-6).toUpperCase()}</h3>
                                        <p className="text-sm text-gray-500">Placed on: {new Date(order.createdAt).toLocaleDateString()}</p>
                                        <p className="font-semibold text-md mt-1">Total: {currencySymbol}{convertCurrency(order.totalAmount)}</p>
                                    </div>
                                    <span className={`px-3 py-1 text-xs font-semibold rounded-full ${order.status === 'Delivered' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}`}>{order.status}</span>
                                </div>
                                <div className="mt-4 border-t pt-4">
                                     <h4 className="font-semibold text-sm mb-2">Items:</h4>
                                    {order.orderItems.map(item => (
                                        <div key={item._id} className="flex items-center gap-4 mb-2">
                                            <img src={item.image} alt={item.name} className="w-12 h-12 object-cover rounded"/>
                                            <div>
                                                <p>{item.name} <span className="text-sm text-gray-500">x {item.qty}</span></p>
                                                <p className="text-xs text-gray-500">Size: {item.size}, Color: {item.color}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <OrderStatusTracker order={order} />
                            </div>
                        ))}
                    </div>
                )
            )}
        </ModalWrapper>
    );
};

export const StaticContentModal: React.FC<{ page: StaticPageType, onClose: () => void }> = ({ page, onClose }) => {
    const content: { [key in NonNullable<StaticPageType>]: React.ReactNode } = {
        'About Us': <div><p>DENFIT was founded in 2023 with a mission to provide high-quality, stylish, and comfortable denim and casual wear for everyone. We believe in sustainable fashion and ethical manufacturing.</p></div>,
        'Size Guide': <img src="https://i.ibb.co/6w2MY5c/size-guide.png" alt="Size Guide" className="w-full h-auto"/>,
        'Privacy Policy': <div><p>Your privacy is important to us. We do not sell your personal information to third parties. Please read our full privacy policy for more details.</p></div>,
        'Shipping Policy': <div><p>We offer standard and express shipping. Standard shipping takes 5-7 business days, while express shipping takes 2-3 business days. Shipping costs are calculated at checkout.</p></div>,
        'Return Policy': <div><p>We accept returns within 30 days of purchase. Items must be in their original condition with tags attached. Please visit our returns portal to initiate a return.</p></div>,
    };
    return (
        <ModalWrapper onClose={onClose} title={page || ''}>
            {page && content[page]}
        </ModalWrapper>
    );
};

export const ProfileModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
    const { user, updateUserAddress } = useAppContext();
    const [activeTab, setActiveTab] = useState('details');
    const [address, setAddress] = useState<ShippingAddress>(user?.address || { address: '', city: '', postalCode: '', country: '' });

    useEffect(() => {
        if(user?.address) {
            setAddress(user.address);
        }
    }, [user]);

    const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setAddress({ ...address, [e.target.name]: e.target.value });
    };

    const handleSaveAddress = (e: React.FormEvent) => {
        e.preventDefault();
        if (!address.address || !address.city) {
            toast.warn("Please fill in Address and City.");
            return;
        }
        updateUserAddress(address);
    };

    if (!user) return null;

    return (
        <ModalWrapper onClose={onClose} title="My Profile" size="lg">
            <div className="flex border-b mb-4">
                <button onClick={() => setActiveTab('details')} className={`px-4 py-2 ${activeTab === 'details' ? 'border-b-2 border-denfit-blue font-semibold' : ''}`}>Account Details</button>
                <button onClick={() => setActiveTab('address')} className={`px-4 py-2 ${activeTab === 'address' ? 'border-b-2 border-denfit-blue font-semibold' : ''}`}>My Address</button>
            </div>
            {activeTab === 'details' && (
                <div className="space-y-2">
                    <p><strong>Name:</strong> {user.name}</p>
                    <p><strong>Email:</strong> {user.email}</p>
                </div>
            )}
            {activeTab === 'address' && (
                <form onSubmit={handleSaveAddress} className="space-y-4">
                     <h3 className="font-semibold text-md">Saved Shipping Address</h3>
                     <div className="space-y-3">
                        <input type="text" name="address" placeholder="Address" value={address.address} onChange={handleAddressChange} className="w-full p-2 border rounded bg-white text-gray-900" required />
                        <input type="text" name="city" placeholder="City" value={address.city} onChange={handleAddressChange} className="w-full p-2 border rounded bg-white text-gray-900" required />
                        <div className="flex gap-3">
                            <input type="text" name="postalCode" placeholder="Postal Code" value={address.postalCode} onChange={handleAddressChange} className="w-full p-2 border rounded bg-white text-gray-900" />
                            <input type="text" name="country" placeholder="Country" value={address.country} onChange={handleAddressChange} className="w-full p-2 border rounded bg-white text-gray-900" />
                        </div>
                    </div>
                    <button type="submit" className="bg-denfit-blue text-white px-6 py-2 rounded-md hover:bg-blue-700">Save Address</button>
                </form>
            )}
        </ModalWrapper>
    );
};

export const ForgotPasswordModal: React.FC<{ onClose: () => void, onLoginOpen: () => void }> = ({ onClose, onLoginOpen }) => {
    const [step, setStep] = useState(1); // 1: email, 2: passcode, 3: new password
    const [email, setEmail] = useState('');
    const [passcode, setPasscode] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    
    const handleEmailSubmit = async () => {
        setLoading(true);
        try {
            await forgotPassword(email);
            toast.info("A passcode has been sent to your email.");
            setStep(2);
        } catch (error: any) {
            toast.error(error.message || "Failed to send passcode.");
        } finally {
            setLoading(false);
        }
    };

    const handlePasscodeSubmit = async () => {
         setLoading(true);
        try {
            await verifyPasscode(email, passcode);
            toast.info("Passcode verified. Please set a new password.");
            setStep(3);
        } catch (error: any) {
            toast.error(error.message || "Invalid or expired passcode.");
        } finally {
            setLoading(false);
        }
    };
    
    const handlePasswordReset = async () => {
        if (newPassword !== confirmPassword) {
            toast.warn("Passwords do not match.");
            return;
        }
        setLoading(true);
        try {
            await resetPassword(email, passcode, newPassword);
            toast.info("Password reset successfully! Please log in with your new password.");
            onLoginOpen();
        } catch (error: any) {
            toast.error(error.message || "Failed to reset password.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <ModalWrapper onClose={onClose} title="Forgot Password" size="sm">
            {step === 1 && (
                <div className="space-y-4">
                    <p className="text-sm text-gray-600">Enter your email address and we'll send you a code to reset your password.</p>
                    <input type="email" placeholder="Email Address" value={email} onChange={e => setEmail(e.target.value)} className="w-full p-2 border rounded bg-white text-gray-900" required />
                    <button onClick={handleEmailSubmit} disabled={loading} className="w-full bg-denfit-blue text-white py-2 rounded-md hover:bg-blue-700 disabled:bg-gray-400">
                       {loading ? 'Sending...' : 'Send Passcode'}
                    </button>
                </div>
            )}
            {step === 2 && (
                 <div className="space-y-4">
                    <p className="text-sm text-gray-600">Enter the 6-digit passcode sent to {email}.</p>
                    <input type="text" placeholder="Passcode" value={passcode} onChange={e => setPasscode(e.target.value)} className="w-full p-2 border rounded bg-white text-gray-900" required />
                    <button onClick={handlePasscodeSubmit} disabled={loading} className="w-full bg-denfit-blue text-white py-2 rounded-md hover:bg-blue-700 disabled:bg-gray-400">
                        {loading ? 'Verifying...' : 'Verify Passcode'}
                    </button>
                </div>
            )}
            {step === 3 && (
                 <div className="space-y-4">
                    <p className="text-sm text-gray-600">Create a new password for your account.</p>
                    <input type="password" placeholder="New Password" value={newPassword} onChange={e => setNewPassword(e.target.value)} className="w-full p-2 border rounded bg-white text-gray-900" required />
                    <input type="password" placeholder="Confirm New Password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} className="w-full p-2 border rounded bg-white text-gray-900" required />
                    <button onClick={handlePasswordReset} disabled={loading} className="w-full bg-denfit-blue text-white py-2 rounded-md hover:bg-blue-700 disabled:bg-gray-400">
                        {loading ? 'Resetting...' : 'Reset Password'}
                    </button>
                </div>
            )}
        </ModalWrapper>
    );
};

export const BrandReviewModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
    const [name, setName] = useState('');
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if(rating === 0 || !comment || !name) {
            toast.warn("Please fill in all fields.");
            return;
        }
        setLoading(true);
        try {
            await submitBrandReview({ name, rating, comment });
            toast.info("Thank you for your review!");
            onClose();
        } catch (error: any) {
            toast.error(error.message || "Failed to submit review.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <ModalWrapper onClose={onClose} title="Leave a Review for DENFIT">
            <form onSubmit={handleSubmit} className="space-y-4">
                <input type="text" placeholder="Your Name" value={name} onChange={e => setName(e.target.value)} className="w-full p-2 border rounded bg-white text-gray-900" required />
                <div className="flex justify-center">
                    {[...Array(5)].map((_, i) => <StarIcon key={i} onClick={() => setRating(i + 1)} className={`cursor-pointer w-8 h-8 ${i < rating ? 'text-yellow-400' : 'text-gray-300'}`} />)}
                </div>
                <textarea value={comment} onChange={e => setComment(e.target.value)} placeholder="Tell us about your experience..." className="w-full border p-2 rounded-md bg-white text-gray-900" rows={4} required></textarea>
                <button type="submit" disabled={loading} className="w-full bg-denfit-blue text-white py-2 rounded-md hover:bg-blue-700">
                    {loading ? 'Submitting...' : 'Submit Review'}
                </button>
            </form>
        </ModalWrapper>
    );
};

export const NewsletterModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await subscribeNewsletter(email);
            toast.info("Thank you for subscribing!");
            onClose();
        } catch (error: any) {
            toast.error(error.message || "Failed to subscribe.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <ModalWrapper onClose={onClose} title="JOIN OUR MAILING LIST" size="md">
            <div className="text-center">
                <p className="text-gray-600 mb-4">Sign Up for exclusive updates, new arrivals & insider only discounts.</p>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <input type="email" placeholder="enter your email address" value={email} onChange={e => setEmail(e.target.value)} className="w-full px-4 py-3 border rounded-md bg-white text-gray-900 text-center" required />
                    <button type="submit" disabled={loading} className="w-full bg-denfit-dark text-white py-3 rounded-md hover:bg-gray-800 disabled:bg-gray-400 font-bold">
                        {loading ? 'Subscribing...' : 'SUBSCRIBE'}
                    </button>
                </form>
                 <button onClick={onClose} className="text-sm text-gray-500 mt-4 hover:underline">No, thanks</button>
            </div>
        </ModalWrapper>
    );
};
