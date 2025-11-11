import React, { useState, Fragment, useEffect } from 'react';
import { useAppContext } from '../App.tsx';
import { Product, Order, StaticPageType, ShippingAddress } from '../types.ts';
import { CloseIcon, HeartIcon, StarIcon, CheckCircleIcon, ShippingIcon, ConfirmedIcon, DeliveredIcon } from './Icons.tsx';

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
    const { login, signup, addToast } = useAppContext();
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [loading, setLoading] = useState(false);

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
            addToast(error.message || 'An error occurred.');
        } finally {
            setLoading(false);
        }
    };
    
    return (
        <ModalWrapper onClose={onClose} title={isLogin ? "Login" : "Sign Up"} size="sm">
            <form onSubmit={handleSubmit} className="space-y-4">
                {!isLogin && (
                    <input type="text" placeholder="Full Name" value={name} onChange={e => setName(e.target.value)} required className="w-full px-4 py-2 border rounded-md bg-white text-gray-900" />
                )}
                <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required className="w-full px-4 py-2 border rounded-md bg-white text-gray-900" />
                <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required className="w-full px-4 py-2 border rounded-md bg-white text-gray-900" />
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
    const { cart, removeFromCart, updateCartQuantity, currencySymbol, convertCurrency, openModal, user, addToast } = useAppContext();
    const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

    const handleCheckout = () => {
        if (!user) {
            addToast("Please login to proceed to checkout.");
            onClose();
            openModal('login');
            return;
        }
        onClose();
        openModal('checkout');
    };

    return (
        <ModalWrapper onClose={onClose} title={`Your Cart (${cart.length})`} size="lg">
            {cart.length === 0 ? (
                <p className="text-center py-8">Your cart is empty.</p>
            ) : (
                <Fragment>
                    <div className="space-y-4">
                        {cart.map(item => (
                            <div key={`${item._id}-${item.size}-${item.color}`} className="flex items-center gap-4 border-b pb-4">
                                <img src={item.images[0]} alt={item.name} className="w-24 h-24 object-cover rounded-md" />
                                <div className="flex-grow">
                                    <h3 className="font-semibold">{item.name}</h3>
                                    <p className="text-sm text-gray-500">Size: {item.size}, Color: {item.color}</p>
                                    <p className="font-bold">{currencySymbol}{convertCurrency(item.price)}</p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button onClick={() => updateCartQuantity(item._id, item.quantity - 1)} className="border px-2 rounded-md">-</button>
                                    <span>{item.quantity}</span>
                                    <button onClick={() => updateCartQuantity(item._id, item.quantity + 1)} className="border px-2 rounded-md">+</button>
                                </div>
                                <button onClick={() => removeFromCart(item._id)} className="text-red-500 hover:text-red-700"><CloseIcon /></button>
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
    const { wishlist, removeFromWishlist, addToCart, currencySymbol, convertCurrency, addToast } = useAppContext();
    
    const handleAddToCart = (item: Product) => {
        addToCart(item, item.sizes[0], item.colors[0]);
        removeFromWishlist(item._id);
        addToast(`${item.name} moved to cart.`);
    };

    return (
        <ModalWrapper onClose={onClose} title={`Your Wishlist (${wishlist.length})`} size="lg">
            {wishlist.length === 0 ? (
                <p className="text-center py-8">Your wishlist is empty.</p>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {wishlist.map(item => (
                        <div key={item._id} className="flex items-center gap-4 border p-2 rounded-md">
                            <img src={item.images[0]} alt={item.name} className="w-20 h-20 object-cover rounded-md" />
                            <div className="flex-grow">
                                <h3 className="font-semibold">{item.name}</h3>
                                <p className="font-bold">{currencySymbol}{convertCurrency(item.price)}</p>
                                <div className="flex gap-2 mt-2">
                                    <button onClick={() => handleAddToCart(item)} className="text-sm bg-denfit-dark text-white px-3 py-1 rounded-md hover:bg-gray-800">Move to Cart</button>
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


export const ProductDetailModal: React.FC<{ product: Product, onClose: () => void }> = ({ product, onClose }) => {
    const { addToCart, addToWishlist, currencySymbol, convertCurrency, addReview, user, addToast, openModal } = useAppContext();
    const [selectedSize, setSelectedSize] = useState(product.sizes[0]);
    const [selectedColor, setSelectedColor] = useState(product.colors[0]);
    const [mainImage, setMainImage] = useState(product.images[0]);
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState('');

    const handleAddReview = (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) {
            addToast("You must be logged in to add a review.");
            openModal('login');
            return;
        }
        if (rating > 0 && comment) {
            addReview(product._id, { rating, comment });
            setRating(0);
            setComment('');
        } else {
            addToast("Please provide a rating and a comment.")
        }
    };
    
    return (
        <ModalWrapper onClose={onClose} title={product.name} size="xl">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                    <img src={mainImage} alt={product.name} className="w-full h-auto object-cover rounded-lg mb-4" />
                    <div className="flex gap-2">
                        {product.images.map(img => (
                            <img key={img} src={img} onClick={() => setMainImage(img)} alt={`${product.name} thumbnail`} className={`w-16 h-16 object-cover rounded-md cursor-pointer border-2 ${mainImage === img ? 'border-denfit-blue' : 'border-transparent'}`} />
                        ))}
                    </div>
                </div>
                <div>
                    <p className="mb-4 text-gray-600">{product.description}</p>
                    <div className="flex items-center gap-2 mb-4">
                        <div className="flex text-yellow-400">{[...Array(5)].map((_, i) => <StarIcon key={i} className={i < product.rating ? 'text-yellow-400' : 'text-gray-300'} />)}</div>
                        <span className="text-sm text-gray-500">({product.numReviews} reviews)</span>
                    </div>
                     <div className="my-4">
                        <span className="font-bold text-2xl text-denfit-blue">{currencySymbol}{convertCurrency(product.price)}</span>
                        {product.originalPrice && <span className="text-md text-gray-400 line-through ml-2">{currencySymbol}{convertCurrency(product.originalPrice)}</span>}
                    </div>
                    <div className="mb-4">
                        <h4 className="font-semibold mb-2">Size:</h4>
                        <div className="flex gap-2 flex-wrap">
                            {product.sizes.map(size => <button key={size} onClick={() => setSelectedSize(size)} className={`border px-4 py-2 rounded-md ${selectedSize === size ? 'bg-denfit-dark text-white' : ''}`}>{size}</button>)}
                        </div>
                    </div>
                    <div className="mb-6">
                        <h4 className="font-semibold mb-2">Color:</h4>
                        <div className="flex gap-2 flex-wrap">
                            {product.colors.map(color => <button key={color} onClick={() => setSelectedColor(color)} className={`border px-4 py-2 rounded-md ${selectedColor === color ? 'bg-denfit-dark text-white' : ''}`}>{color}</button>)}
                        </div>
                    </div>
                    <div className="flex gap-4">
                        <button onClick={() => addToCart(product, selectedSize, selectedColor)} className="flex-grow bg-denfit-blue text-white py-3 rounded-md hover:bg-blue-700">Add to Cart</button>
                        <button onClick={() => addToWishlist(product)} className="border p-3 rounded-md hover:bg-gray-100"><HeartIcon /></button>
                    </div>

                    <div className="mt-8">
                        <h4 className="font-semibold mb-2 border-t pt-4">Reviews</h4>
                        <form onSubmit={handleAddReview} className="mb-4 space-y-2">
                            <div className="flex">
                                {[...Array(5)].map((_, i) => <StarIcon key={i} onClick={() => setRating(i + 1)} className={`cursor-pointer ${i < rating ? 'text-yellow-400' : 'text-gray-300'}`} />)}
                            </div>
                            <textarea value={comment} onChange={e => setComment(e.target.value)} placeholder="Write your review..." className="w-full border p-2 rounded-md bg-white text-gray-900" rows={3}></textarea>
                            <button type="submit" className="bg-denfit-dark text-white px-4 py-1 rounded-md text-sm">Submit Review</button>
                        </form>
                        
                        <div className="space-y-4 max-h-40 overflow-y-auto">
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
                    </div>
                </div>
            </div>
        </ModalWrapper>
    );
};

export const CheckoutModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
    const { placeOrder, cart, currencySymbol, convertCurrency, user, addToast } = useAppContext();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [address, setAddress] = useState<ShippingAddress>(user?.address || { address: '', city: '', postalCode: '', country: '' });

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setAddress({ ...address, [e.target.name]: e.target.value });
    };

    const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const shipping = 5.00;
    const total = subtotal + shipping;

    const handlePlaceOrder = async () => {
        if (!address.address || !address.city || !address.country) {
            addToast("Please fill in all required address fields.");
            return;
        }
        setLoading(true);
        try {
            await placeOrder({
                shippingAddress: address,
                paymentMethod: 'Cash on Delivery',
            });
            setStep(2);
        } catch (error: any) {
            addToast(error.message || 'Failed to place order.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <ModalWrapper onClose={onClose} title="Checkout" size="lg">
            {step === 1 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                        <h3 className="font-bold text-lg mb-4">Shipping Address</h3>
                        <div className="space-y-3">
                            <input type="text" name="address" placeholder="Address" value={address.address} onChange={handleInputChange} className="w-full p-2 border rounded bg-white text-gray-900" required />
                            <input type="text" name="city" placeholder="City" value={address.city} onChange={handleInputChange} className="w-full p-2 border rounded bg-white text-gray-900" required />
                            <div className="flex gap-3">
                                <input type="text" name="postalCode" placeholder="Postal Code" value={address.postalCode} onChange={handleInputChange} className="w-full p-2 border rounded bg-white text-gray-900" />
                                <input type="text" name="country" placeholder="Country" value={address.country} onChange={handleInputChange} className="w-full p-2 border rounded bg-white text-gray-900" required />
                            </div>
                        </div>
                    </div>
                    <div>
                        <h3 className="font-bold text-lg mb-4">Order Summary</h3>
                        <div className="space-y-2 mb-4 max-h-48 overflow-y-auto pr-2">
                            {cart.map(item => (
                                <div key={item._id} className="flex justify-between items-center text-sm">
                                    <span>{item.name} x {item.quantity}</span>
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
                            {loading ? "Placing Order..." : "Place Order"}
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
    const { orders = [], loading, error, convertCurrency, currencySymbol } = useAppContext();
    
    const OrderStatusTracker: React.FC<{ order: Order }> = ({ order }) => {
        const isConfirmed = ['Confirmed', 'Shipped', 'Delivered'].includes(order.status);
        const isShipped = ['Shipped', 'Delivered'].includes(order.status);
        const isDelivered = order.status === 'Delivered';
        
        return (
            <div className="flex items-center justify-between mt-4">
                <div className="text-center">
                    <div className={`mx-auto w-12 h-12 rounded-full flex items-center justify-center ${isConfirmed ? 'bg-denfit-blue' : 'bg-gray-200'}`}><ConfirmedIcon active={isConfirmed} /></div>
                    <p className="text-xs mt-1">Confirmed</p>
                </div>
                <div className={`flex-grow h-1 ${isShipped ? 'bg-denfit-blue' : 'bg-gray-200'}`}></div>
                <div className="text-center">
                    <ShippingIcon active={isShipped} />
                    <p className="text-xs mt-1">Shipped</p>
                </div>
                 <div className={`flex-grow h-1 ${isDelivered ? 'bg-denfit-blue' : 'bg-gray-200'}`}></div>
                <div className="text-center">
                    <DeliveredIcon active={isDelivered} />
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
        'Size Guide': <div><p>Please refer to the size chart on each product page for the best fit. If you are between sizes, we recommend sizing up for a more relaxed fit.</p></div>,
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
    const { user, updateUserAddress, addToast } = useAppContext();
    const [activeTab, setActiveTab] = useState('details');
    const [address, setAddress] = useState<ShippingAddress>(user?.address || { address: '', city: '', postalCode: '', country: '' });

    const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setAddress({ ...address, [e.target.name]: e.target.value });
    };

    const handleSaveAddress = (e: React.FormEvent) => {
        e.preventDefault();
        if (!address.address || !address.city || !address.country) {
            addToast("Please fill in all required address fields.");
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
                            <input type="text" name="country" placeholder="Country" value={address.country} onChange={handleAddressChange} className="w-full p-2 border rounded bg-white text-gray-900" required />
                        </div>
                    </div>
                    <button type="submit" className="bg-denfit-blue text-white px-6 py-2 rounded-md hover:bg-blue-700">Save Address</button>
                </form>
            )}
        </ModalWrapper>
    );
};