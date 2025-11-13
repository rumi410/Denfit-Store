// services/api.ts

import { Product, Order, User, Review } from '../types.ts';

// The backend is running on port 5000, so we point the frontend to it directly.
const API_BASE_URL = 'http://localhost:5000/api';

const handleResponse = async (response: Response) => {
    // For 204 No Content, we don't need to parse JSON
    if (response.status === 204) {
        return;
    }
    
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.indexOf("application/json") !== -1) {
        const data = await response.json();
        if (!response.ok) {
            const error = (data && data.message) || response.statusText;
            return Promise.reject(new Error(error));
        }
        return data;
    } else {
        const text = await response.text();
        if (!response.ok) {
            console.error("Server returned a non-JSON error response:", text);
            return Promise.reject(new Error(`Server Error: ${response.status} ${response.statusText}. See console for details.`));
        }
        return Promise.reject(new Error("Received an unexpected non-JSON response from the server."));
    }
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
export const submitReview = (productId: string, reviewData: { rating: number, comment: string }, user: User): Promise<Review> => {
    console.warn("Review submission is mocked. Backend endpoint for reviews is not implemented.");
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