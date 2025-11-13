import React, { useState, useEffect, useCallback, createContext, useContext, ReactNode, useRef, useMemo } from 'react';
import { Product, CartItem, WishlistItem, User, Review, Order, StaticPageType, ShippingAddress } from './types';
import { fetchProducts, loginUser, signupUser, submitReview, createOrder, fetchMyOrders } from './services/api';
import Header from './components/Header';
import HomePage from './components/HomePage';
import Footer from './components/Footer';
import { LoginModal, CartModal, WishlistModal, ProductDetailModal, CheckoutModal, OrdersModal, StaticContentModal, ProfileModal } from './components/Modals';
import { WhatsAppIcon } from './components/Icons';

type ModalType = 'login' | 'cart' | 'wishlist' | 'product' | 'checkout' | 'orders' | 'static' | 'profile' | null;

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
  staticPage: StaticPageType;
  orders: Order[];
  loading: boolean;
  error: string | null;
  filter: Filter;
  toasts: Toast[];
  currency: 'USD' | 'EUR' | 'INR' | 'PKR';
  currencySymbol: '$' | '€' | '₹' | 'Rs';
  setCurrency: (currency: 'USD' | 'EUR' | 'INR' | 'PKR') => void;
  convertCurrency: (price: number) => string;
  setFilter: (filter: Filter) => void;
  addToCart: (product: Product, size: string, color: string) => void;
  removeFromCart: (productId: string) => void;
  updateCartQuantity: (productId: string, quantity: number) => void;
  addToWishlist: (product: Product) => void;
  removeFromWishlist: (productId: string) => void;
  login: (credentials: any) => Promise<void>;
  signup: (userData: any) => Promise<void>;
  logout: () => void;
  openModal: (modal: ModalType, data?: Product | StaticPageType) => void;
  closeModal: () => void;
  fetchUserOrders: () => Promise<void>;
  placeOrder: (orderDetails: any) => Promise<void>;
  addReview: (productId: string, reviewData: { rating: number; comment: string; }) => Promise<void>;
  addToast: (message: string) => void;
  updateUserAddress: (address: ShippingAddress) => void;
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
  const [currency, setCurrency] = useState<'USD' | 'EUR' | 'INR' | 'PKR'>('USD');
  const toastId = useRef(0);

  const exchangeRates = { USD: 1, EUR: 0.93, INR: 83.45, PKR: 278.50 };
  const currencySymbols: Record<'USD' | 'EUR' | 'INR' | 'PKR', '$' | '€' | '₹' | 'Rs'> = { USD: '$', EUR: '€', INR: '₹', PKR: 'Rs' };
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
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        // Fetch orders for the logged-in user on initial load
        (async () => {
            try {
                const userOrders = await fetchMyOrders(storedToken);
                setOrders(userOrders);
            } catch (err) {
                console.error("Failed to auto-fetch orders:", err);
            }
        })();
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
  
  const login = useCallback(async (credentials: any) => {
    const { token, user: loggedInUser } = await loginUser(credentials);
    setToken(token);
    // Load address from local storage upon login
    const storedAddress = localStorage.getItem(`user-address-${loggedInUser._id}`);
    const userWithAddress = storedAddress ? { ...loggedInUser, address: JSON.parse(storedAddress) } : loggedInUser;
    setUser(userWithAddress);
    
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userWithAddress));
    addToast(`Welcome back, ${loggedInUser.name}!`);

    // Fetch orders silently in the background after login
    try {
        const userOrders = await fetchMyOrders(token);
        setOrders(userOrders);
    } catch (err: any) {
        console.error("Failed to fetch orders on login:", err.message);
        addToast("Could not fetch your orders.");
    }
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
    setOrders([]);
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
      const userOrders = await fetchMyOrders(token as string); 
      setOrders(userOrders);
      openModal('orders');
    } catch (err: any) {
      setError(err.message);
      addToast(err.message);
    } finally {
      setLoading(false);
    }
  }, [token, addToast, openModal]);

  const updateUserAddress = useCallback((address: ShippingAddress) => {
    if (user) {
        const updatedUser = { ...user, address };
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
        // Also save address separately scoped by user ID for robustness
        localStorage.setItem(`user-address-${user._id}`, JSON.stringify(address));
        addToast('Address saved successfully!');
    }
  }, [user, addToast]);

  const placeOrder = useCallback(async (orderDetails: { shippingAddress: ShippingAddress, paymentMethod: string }) => {
    if (!token || !user) {
      addToast("You must be logged in to place an order.");
      openModal('login');
      throw new Error("User not logged in");
    }
    
    updateUserAddress(orderDetails.shippingAddress);

    const totalAmount = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);

    const orderData = {
        items: cart,
        totalAmount,
        shippingAddress: orderDetails.shippingAddress,
        paymentMethod: orderDetails.paymentMethod
    };
    
    const newOrder = await createOrder(orderData, token);
    setOrders(prevOrders => [newOrder, ...prevOrders]);
    setCart([]);
  }, [token, user, cart, addToast, openModal, updateUserAddress]);

  const addReview = useCallback(async (productId: string, reviewData: { rating: number; comment: string; }) => {
    if (!token || !user) {
      addToast("You must be logged in to add a review.");
      openModal('login');
      return;
    }
    try {
      const newReview = await submitReview(productId, reviewData, user);
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
  
  const value = useMemo(() => ({
    products, cart, wishlist, user, token, activeModal, selectedProduct, staticPage, orders, loading, error, filter, toasts, currency, currencySymbol, setCurrency, convertCurrency, setFilter,
    addToCart, removeFromCart, updateCartQuantity, addToWishlist, removeFromWishlist,
    login, signup, logout, openModal, closeModal, fetchUserOrders, placeOrder, addReview, addToast, updateUserAddress
  }), [
    products, cart, wishlist, user, token, activeModal, selectedProduct, staticPage, orders, loading, error, filter, toasts, currency, currencySymbol, convertCurrency,
    setFilter, addToCart, removeFromCart, updateCartQuantity, addToWishlist, removeFromWishlist,
    login, signup, logout, openModal, closeModal, fetchUserOrders, placeOrder, addReview, addToast, updateUserAddress
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
      {activeModal === 'profile' && <ProfileModal onClose={closeModal} />}
    </div>
  );
}

export default App;