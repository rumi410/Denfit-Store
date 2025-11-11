// services/api.ts

import { Product, Order, User, Review } from '../types.ts';

const API_BASE_URL = '/api';

const handleResponse = async (response: Response) => {
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
            // This will now show the HTML error page content for easier debugging
            console.error("Server returned a non-JSON error response:", text);
            return Promise.reject(new Error(`Server Error: ${response.status} ${response.statusText}. See console for details.`));
        }
        // This case is unlikely for a well-behaved API but good to have.
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

// NOTE: The backend needs an endpoint like `POST /api/products/:id/reviews` for this to work fully.
// This function remains a local mock.
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