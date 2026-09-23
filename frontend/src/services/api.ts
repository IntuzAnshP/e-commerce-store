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

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;
        
        // If error is 401, not a retry, and the original request was NOT for login or refresh token
        if (
            error.response?.status === 401 && 
            !originalRequest._retry && 
            originalRequest.url &&
            !originalRequest.url.includes('/auth/login') && 
            !originalRequest.url.includes('/auth/refresh-token')
        ) {
            originalRequest._retry = true;
            try {
                const refreshToken = localStorage.getItem('refresh_token');
                if (!refreshToken) throw new Error("No refresh token");

                // Call the refresh endpoint 
                const res = await api.post('/auth/refresh-token', { refresh_token: refreshToken });
                const { access_token, refresh_token: new_refresh_token } = res.data.data;
                
                localStorage.setItem('token', access_token);
                localStorage.setItem('refresh_token', new_refresh_token);

                // Update the failed request's header and retry
                originalRequest.headers.Authorization = `Bearer ${access_token}`;
                return api(originalRequest);
            } catch (refreshError) {
                // If refresh fails, clear tokens and force login
                localStorage.removeItem('token');
                localStorage.removeItem('refresh_token');
                window.location.href = '/'; 
                return Promise.reject(refreshError);
            }
        }
        
        return Promise.reject(error);
    }
);

export default api;

export const getProducts = async () => {
    // Your backend might use a different path like '/products' or '/products/'
    const response = await api.get('/products');
    return response.data;
};

export const getProductById = async (id: number | string) => {
    const response = await api.get(`/products/${id}`);
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
    const response = await api.patch(`/cart/items/${item_id}`, { quantity });
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

export const createOrder = async (shipping_address: any) => {
    const response = await api.post('/orders', { shipping_address });
    return response.data;
};

export const getUserOrders = async () => {
    const response = await api.get('/orders');
    return response.data;
};

export const getUserProfile = async () => {
    const response = await api.get('/users/me');
    return response.data;
};

export const updateUserProfile = async (userData: any) => {
    const response = await api.patch('/users/me', userData);
    return response.data;
};

export const changePassword = async (passwordData: any) => {
    const response = await api.patch('/users/me/password', passwordData);
    return response.data;
};

// Admin API endpoints
export const createProduct = async (productData: any) => {
    const response = await api.post('/products', productData);
    return response.data;
};

export const updateProduct = async (id: number | string, productData: any) => {
    const response = await api.patch(`/products/${id}`, productData);
    return response.data;
};

export const deleteProduct = async (id: number | string) => {
    const response = await api.delete(`/products/${id}`);
    return response.data;
};

export const uploadProductImage = async (id: number | string, file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post(`/products/${id}/image`, formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
    return response.data;
};

export const getCategories = async () => {
    const response = await api.get('/categories');
    return response.data;
};

export const createCategory = async (categoryData: { name: string, description?: string }) => {
    const response = await api.post('/categories', categoryData);
    return response.data;
};

export const updateCategory = async (id: number | string, categoryData: { name?: string, description?: string }) => {
    const response = await api.patch(`/categories/${id}`, categoryData);
    return response.data;
};

export const deleteCategory = async (id: number | string) => {
    const response = await api.delete(`/categories/${id}`);
    return response.data;
};

export const getAllOrders = async () => {
    const response = await api.get('/admin/orders');
    return response.data;
};

export const updateOrderStatus = async (id: number | string, status: string) => {
    const response = await api.patch(`/admin/orders/${id}/status`, { status });
    return response.data;
};

export const getDashboardStats = async () => {
    const response = await api.get('/admin/dashboard');
    return response.data;
};
