import axios from 'axios';
// Replace this with your actual FastAPI backend URL if it's different
const API_URL = 'http://localhost:8000/api';
const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export default api;

export const getProducts = async () => {
    // Your backend might use a different path like '/products' or '/products/'
    const response = await api.get('/products');
    return response.data;
};

export const loginUser = async (email: string, password: string) => {
    // Your backend expects a JSON object with email and password
    const response = await api.post('/auth/login', { email, password });
    return response.data;
};

export const registerUser = async (email: string, password: string, full_name?: string) => {
    const response = await api.post('/auth/register', { email, password, full_name });
    return response.data;
};

export const getCart = async () => {
    const response = await api.get('/cart');
    return response.data;
};

export const addToCartAPI = async (product_id: number, quantity: number) => {
    const response = await api.post('/cart/items', { product_id, quantity });
    return response.data;
};

export const updateCartItemAPI = async (item_id: number, quantity: number) => {
    const response = await api.put(`/cart/items/${item_id}`, { quantity });
    return response.data;
};

export const removeCartItemAPI = async (item_id: number) => {
    const response = await api.delete(`/cart/items/${item_id}`);
    return response.data;
};

export const clearCartAPI = async () => {
    const response = await api.delete('/cart');
    return response.data;
};
