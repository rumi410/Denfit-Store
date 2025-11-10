// services/api.ts

import { Product, Order, User, Review } from '../types';

// Using a relative URL is robust for deployment. Assumes frontend is served by the same server as the backend.
const API_BASE_URL = '/api';

const handleResponse = async (response: Response) => {
    // For 204 No Content, we don't need to parse JSON
    if (response.status === 204) {
        return;
    }
    const data = await response.json();
    if (!response.ok) {
        // The backend sends messages like { message: '...' } on error
        const error = (data && data.message) || response.statusText;
        return Promise.reject(new Error(error));
    }
    return data;
};

export const fetchProducts = async (): Promise<Product[]> => {
    const response = await fetch(`${API_BASE_URL}/products`);
    return handleResponse(response);
};

export const loginUser = async (credentials: any): Promise<{ token: string, user: User }> => {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
    });
    return handleResponse(response);
};

export const signupUser = async (userData: any): Promise<{ token: string, user: User }> => {
    const response = await fetch(`${API_BASE_URL}/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
    });
    return handleResponse(response);
}

// NOTE: The provided backend has no endpoint for submitting reviews.
// This function will remain a mock that resolves locally.
// For a full implementation, a backend endpoint like `POST /api/products/:id/reviews` is needed.
export const submitReview = (productId: string, reviewData: { rating: number, comment: string }, user: User): Promise<Review> => {
    console.warn("Review submission is mocked. No backend endpoint available.");
    return new Promise((resolve) => {
        setTimeout(() => {
            const newReview: Review = {
                _id: `rev_${Date.now()}`,
                name: user.name,
                user: user._id,
                rating: reviewData.rating,
                comment: reviewData.comment,
                createdAt: new Date().toISOString()
            };
            resolve(newReview);
        }, 300);
    });
};

export const createOrder = async (orderDetails: any, token: string): Promise<Order> => {
    const response = await fetch(`${API_BASE_URL}/orders`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(orderDetails),
    });
    return handleResponse(response);
};

export const fetchMyOrders = async (token: string): Promise<Order[]> => {
    const response = await fetch(`${API_BASE_URL}/orders/myorders`, {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    return handleResponse(response);
};
