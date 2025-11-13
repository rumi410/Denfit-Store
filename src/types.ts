export interface Review {
  _id: string;
  name: string;
  rating: number;
  comment: string;
  user: string;
  createdAt: string;
}

export interface Product {
  _id: string;
  name: string;
  images: string[];
  description: string;
  category: string;
  subCategory: string;
  price: number;
  originalPrice?: number;
  stock: number;
  reviews: Review[];
  numReviews: number;
  rating: number;
  sizes: string[];
  colors: string[];
}

export interface CartItem extends Product {
  quantity: number;
  size: string;
  color: string;
  cartItemId: string;
}

export type WishlistItem = Product;

export interface ShippingAddress {
  address: string;
  city: string;
  postalCode?: string;
  country?: string;
}

export interface CustomerDetails {
    name: string;
    email: string;
    phone: string;
}

export interface User {
  _id: string;
  name:string;
  email: string;
  address?: ShippingAddress;
}

export interface OrderItem {
    _id: string;
    name: string;
    qty: number;
    image: string;
    price: number;
    product: string;
    size: string;
    color: string;
}

export interface Order {
  _id: string;
  userId: string;
  orderItems: OrderItem[];
  shippingAddress: ShippingAddress;
  customerDetails: CustomerDetails;
  paymentMethod: string;
  totalAmount: number;
  isPaid: boolean;
  paidAt?: string;
  isDelivered: boolean;
  deliveredAt?: string;
  createdAt: string;
  status: 'Confirmed' | 'Shipped' | 'Delivered' | 'Cancelled';
}

export type StaticPageType = 'About Us' | 'Size Guide' | 'Privacy Policy' | 'Shipping Policy' | 'Return Policy' | null;
