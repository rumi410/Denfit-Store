import React, { useState, useEffect, useCallback, createContext, useContext, ReactNode, useRef, useMemo } from 'react';
import { Product, CartItem, WishlistItem, User, Review, Order } from './types';
import { fetchProducts, loginUser, signupUser, submitReview, createOrder, fetchMyOrders } from './services/api';
import Header from './components/Header';
import HomePage from './components/HomePage';
import Footer from './components/Footer';
import { LoginModal, CartModal, WishlistModal, ProductDetailModal, CheckoutModal, OrdersModal, StaticContentModal } from './components/Modals';
import { WhatsAppIcon } from './components/Icons';

type ModalType = 'login' | 'cart' | 'wishlist' | 'product' | 'checkout' | 'orders' | 'static' | null;
type StaticPageType = 'About Us' | 'Size Guide' | 'Privacy Policy' | 'Shipping Policy' | 'Return Policy' | null;

interface Toast {
  id: number;
  message: string;
}

interface Filter {
  category: string;
  subCategory: string;
}

interface AppContextType {
  products: Product[];
  cart: CartItem[];
  wishlist: WishlistItem[];
  user: User | null;
  token: string | null;
  activeModal: ModalType;
  selectedProduct: Product | null;
  // FIX: Added staticPage to the context type to resolve usage errors in consumer components.
  staticPage: StaticPageType;
  orders: Order[];
  loading: boolean;
  error: string | null;
  filter: Filter;
  toasts: Toast[];
  currency: 'USD' | 'EUR' | 'INR';
  currencySymbol: '$' | '€' | '₹';
  setCurrency: (currency: 'USD' | 'EUR' | 'INR') => void;
  convertCurrency: (price: number) => string;
  setFilter: (filter: Filter) => void;
  addToCart: (product: Product, size: string, color: string) => void;
  removeFromCart: (productId: string) => void;
  updateCartQuantity: (productId: string, quantity: number) => void;
  addToWishlist: (product: Product) => void;
  removeFromWishlist: (productId: string) => void;
  login: (token: string, user: User) => void;
  signup: (userData: any) => Promise<void>;
  logout: () => void;
  openModal: (modal: ModalType, data?: Product | StaticPageType) => void;
  closeModal: () => void;
  fetchUserOrders: () => Promise<void>;
  placeOrder: (orderDetails: any) => Promise<void>;
  addReview: (productId: string, reviewData: { rating: number; comment: string; }) => Promise<void>;
  addToast: (message: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};

const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [activeModal, setActiveModal] = useState<ModalType>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [staticPage, setStaticPage] = useState<StaticPageType>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [filter, setFilter] = useState<Filter>({ category: 'All', subCategory: 'All' });
  const [currency, setCurrency] = useState<'USD' | 'EUR' | 'INR'>('USD');
  const toastId = useRef(0);

  const exchangeRates = { USD: 1, EUR: 0.93, INR: 83.45 };
  // FIX: Explicitly type currencySymbols to ensure currencySymbol is not inferred as a generic string.
  const currencySymbols: Record<'USD' | 'EUR' | 'INR', '$' | '€' | '₹'> = { USD: '$', EUR: '€', INR: '₹' };
  const currencySymbol = currencySymbols[currency];

  const convertCurrency = useCallback((price: number) => {
    const convertedPrice = price * exchangeRates[currency];
    return convertedPrice.toFixed(2);
  }, [currency]);

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
    }
  }, []);
  
  const addToast = useCallback((message: string) => {
    const id = toastId.current++;
    setToasts(prev => [...prev, { id, message }]);
    setTimeout(() => {
      setToasts(currentToasts => currentToasts.filter(toast => toast.id !== id));
    }, 3000);
  }, []);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoading(true);
        const fetchedProducts = await fetchProducts();
        setProducts(fetchedProducts);
      } catch (err: any) {
        const errorMessage = err.message || 'Failed to load products.';
        setError(errorMessage);
        addToast(errorMessage);
      } finally {
        setLoading(false);
      }
    };
    loadProducts();
  }, [addToast]);

  const addToCart = useCallback((product: Product, size: string, color: string) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item._id === product._id && item.size === size && item.color === color);
      if (existingItem) {
        return prevCart.map(item =>
          item._id === product._id && item.size === size && item.color === color
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prevCart, { ...product, quantity: 1, size, color }];
    });
    addToast(`${product.name} has been added to your cart`);
  }, [addToast]);

  const removeFromCart = useCallback((productId: string) => {
    setCart(prevCart => prevCart.filter(item => item._id !== productId));
  }, []);
  
  const updateCartQuantity = useCallback((productId: string, quantity: number) => {
      setCart(prevCart =>
          prevCart.map(item =>
              item._id === productId ? { ...item, quantity: Math.max(1, quantity) } : item
          ).filter(item => item.quantity > 0)
      );
  }, []);

  const addToWishlist = useCallback((product: Product) => {
    setWishlist(prev => {
      if (prev.find(item => item._id === product._id)) {
        addToast(`${product.name} is already in your wishlist`);
        return prev;
      }
      addToast(`${product.name} has been added to your wishlist`);
      return [...prev, product];
    });
  }, [addToast]);

  const removeFromWishlist = useCallback((productId: string) => {
    setWishlist(prev => prev.filter(item => item._id !== productId));
  }, []);

  const login = useCallback((token: string, user: User) => {
    setToken(token);
    setUser(user);
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    addToast(`Welcome back, ${user.name}!`);
  }, [addToast]);

  const signup = useCallback(async (userData: any) => {
      const { token, user } = await signupUser(userData);
      setToken(token);
      setUser(user);
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      addToast(`Welcome to DENFIT, ${user.name}!`);
  }, [addToast]);

  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    addToast("You have been logged out.");
  }, [addToast]);

  const openModal = useCallback((modal: ModalType, data?: Product | StaticPageType) => {
    if (modal === 'product' && data) setSelectedProduct(data as Product);
    if (modal === 'static' && data) setStaticPage(data as StaticPageType);
    setActiveModal(modal);
  }, []);

  const closeModal = useCallback(() => {
    setActiveModal(null);
    setSelectedProduct(null);
    setStaticPage(null);
  }, []);

  const fetchUserOrders = useCallback(async () => {
    if (!token) {
      addToast("You must be logged in to view orders.");
      openModal('login');
      return;
    }
    try {
      setLoading(true);
      // const userOrders = await fetchMyOrders(token); // REAL API CALL
      const userOrders = [ // MOCK DATA FOR DEMO
          { _id: '176270', user: 'user123', orderItems: [{ name: 'Varsity Bomber', qty: 1, image: 'https://picsum.photos/id/103/500/500', price: 74.99, product: '2' }], shippingAddress: { address: 'aaaa', city: 'Lahore' }, paymentMethod: 'Cash on Delivery', totalPrice: 74.99, isPaid: false, isDelivered: false, createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), status: 'Confirmed' as const },
          { _id: '176271', user: 'user123', orderItems: [{ name: 'Classic Denim Jeans', qty: 2, image: 'https://picsum.photos/id/201/500/500', price: 79.99, product: '3' }], shippingAddress: { address: 'bbbb', city: 'Karachi' }, paymentMethod: 'Visa', totalPrice: 159.98, isPaid: true, isDelivered: true, deliveredAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(), createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(), status: 'Delivered' as const }
      ];
      setOrders(userOrders);
      openModal('orders');
    } catch (err: any) {
      setError(err.message);
      addToast(err.message);
    } finally {
      setLoading(false);
    }
  }, [token, addToast, openModal]);

  const placeOrder = useCallback(async (orderDetails: any) => {
    if (!token || !user) {
      addToast("You must be logged in to place an order.");
      openModal('login');
      return;
    }
    try {
      setLoading(true);
      const total = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
      // MOCK order creation
      const newOrder: Order = {
        _id: `ord_${Date.now()}`,
        user: user._id,
        orderItems: cart.map(item => ({ name: item.name, qty: item.quantity, image: item.images[0], price: item.price, product: item._id })),
        shippingAddress: orderDetails.shippingAddress,
        paymentMethod: orderDetails.paymentMethod,
        totalPrice: total,
        isPaid: orderDetails.paymentMethod !== 'Cash on Delivery',
        isDelivered: false,
        createdAt: new Date().toISOString(),
        status: 'Confirmed'
      };
      
      setOrders(prevOrders => [newOrder, ...prevOrders]); // Add to history
      setCart([]); // Clear cart
      // We don't call closeModal here, CheckoutModal will do it.
    } catch (err: any) {
      setError(err.message);
      addToast(err.message);
    } finally {
      setLoading(false);
    }
  }, [token, user, cart, addToast, openModal]);

  const addReview = useCallback(async (productId: string, reviewData: { rating: number; comment: string; }) => {
    if (!token || !user) {
      addToast("You must be logged in to add a review.");
      openModal('login');
      return;
    }
    try {
      const newReview: Review = { _id: `rev-${Date.now()}`, name: user.name, rating: reviewData.rating, comment: reviewData.comment, user: user._id, createdAt: new Date().toISOString() };
      setProducts(prevProducts => {
          const productIndex = prevProducts.findIndex(p => p._id === productId);
          if (productIndex === -1) return prevProducts;
          const updatedProduct = { ...prevProducts[productIndex], reviews: [newReview, ...prevProducts[productIndex].reviews], numReviews: prevProducts[productIndex].numReviews + 1 };
          const newProducts = [...prevProducts];
          newProducts[productIndex] = updatedProduct;
          if (selectedProduct && selectedProduct._id === productId) {
              setSelectedProduct(updatedProduct);
          }
          return newProducts;
      });
      addToast('Review submitted successfully!');
    } catch (err: any) {
      setError(err.message);
      addToast(err.message);
    }
  }, [token, user, selectedProduct, addToast, openModal]);

  // FIX: Added staticPage to the context value and dependency array.
  const value = useMemo(() => ({
    products, cart, wishlist, user, token, activeModal, selectedProduct, staticPage, orders, loading, error, filter, toasts, currency, currencySymbol, setCurrency, convertCurrency, setFilter,
    addToCart, removeFromCart, updateCartQuantity, addToWishlist, removeFromWishlist,
    login, signup, logout, openModal, closeModal, fetchUserOrders, placeOrder, addReview, addToast
  }), [
    products, cart, wishlist, user, token, activeModal, selectedProduct, staticPage, orders, loading, error, filter, toasts, currency, currencySymbol, convertCurrency,
    setFilter, addToCart, removeFromCart, updateCartQuantity, addToWishlist, removeFromWishlist,
    login, signup, logout, openModal, closeModal, fetchUserOrders, placeOrder, addReview, addToast
  ]);

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

const Toast: React.FC<{ message: string }> = ({ message }) => {
    return (
        <div className="bg-denfit-dark text-white py-2 px-4 rounded-md shadow-lg animate-fade-in-up">
            {message}
        </div>
    );
};

function App() {
  return (
    <AppProvider>
      <MainApp />
    </AppProvider>
  );
}

function MainApp() {
  const { activeModal, closeModal, selectedProduct, toasts, staticPage } = useAppContext();

  return (
    <div className="bg-white text-gray-800 font-sans">
      <Header />
      <main>
        <HomePage />
      </main>
      <Footer />
      <div className="fixed bottom-6 right-6 z-50">
          <a href="https://wa.me/1234567890" target="_blank" rel="noopener noreferrer" className="bg-green-500 text-white p-4 rounded-full shadow-lg hover:bg-green-600 transition-transform hover:scale-110 flex items-center justify-center">
              <WhatsAppIcon />
          </a>
      </div>
      
      <div className="fixed bottom-24 right-6 z-50 space-y-2">
          {toasts.map(toast => <Toast key={toast.id} message={toast.message} />)}
      </div>

      {activeModal === 'login' && <LoginModal onClose={closeModal} />}
      {activeModal === 'cart' && <CartModal onClose={closeModal} />}
      {activeModal === 'wishlist' && <WishlistModal onClose={closeModal} />}
      {activeModal === 'product' && selectedProduct && <ProductDetailModal product={selectedProduct} onClose={closeModal} />}
      {activeModal === 'checkout' && <CheckoutModal onClose={closeModal} />}
      {activeModal === 'orders' && <OrdersModal onClose={closeModal} />}
      {activeModal === 'static' && staticPage && <StaticContentModal page={staticPage} onClose={closeModal} />}
    </div>
  );
}

export default App;
