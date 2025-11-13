import { Product, Order, User, Review } from './types';

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
            console.error("Server returned a non-JSON error response:", text);
            // This is where the "<!DOCTYPE html>" error was likely coming from
            return Promise.reject(new Error(`An unexpected server error occurred. Please try again.`));
        }
         // Handle cases where a non-json success response is text
        return { message: text };
    }
};

export const fetchProducts = async (): Promise<Product[]> => {
    const response = await fetch(`${API_BASE_URL}/products`);
    return handleResponse(response);
};

export const loginUser = async (credentials: any): Promise<{ token: string, _id: string, name: string, email: string }> => {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
    });
    return handleResponse(response);
};

export const signupUser = async (userData: any): Promise<{ token: string } & User> => {
    const response = await fetch(`${API_BASE_URL}/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
    });
    return handleResponse(response);
}

export const submitReview = async (productId: string, reviewData: { rating: number; comment: string; }, token: string): Promise<Review> => {
    const response = await fetch(`${API_BASE_URL}/products/${productId}/reviews`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(reviewData),
    });
    return handleResponse(response);
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

// --- Forgot Password Flow ---
export const forgotPassword = async (email: string): Promise<{ message: string }> => {
    const response = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
    });
    return handleResponse(response);
};

export const verifyPasscode = async (email: string, passcode: string): Promise<{ message: string }> => {
    const response = await fetch(`${API_BASE_URL}/auth/verify-passcode`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, passcode }),
    });
    return handleResponse(response);
};

export const resetPassword = async (email: string, passcode: string, newPassword: string): Promise<{ message: string }> => {
    const response = await fetch(`${API_BASE_URL}/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, passcode, newPassword }),
    });
    return handleResponse(response);
};

// --- Newsletter and Brand Review ---
export const subscribeNewsletter = async (email: string): Promise<{ message: string }> => {
  const response = await fetch(`${API_BASE_URL}/users/newsletter`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  });
  return handleResponse(response);
};

export const submitBrandReview = async (reviewData: { name: string, rating: number, comment: string }): Promise<any> => {
  const response = await fetch(`${API_BASE_URL}/reviews/brand`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(reviewData),
  });
  return handleResponse(response);
};
