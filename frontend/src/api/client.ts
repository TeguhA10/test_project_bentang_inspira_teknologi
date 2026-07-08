import axios from 'axios';

const apiClient = axios.create({
  baseURL: 'http://localhost:4000/api',
  withCredentials: true
});

// Auth
export const loginUser = (email: string, password: string) => {
  return apiClient.post('/login', { email, password });
};

export const getMe = () => {
  return apiClient.get('/me');
};

export const logoutUser = () => {
  return apiClient.post('/logout');
};

// Users
export const getUsers = () => {
  return apiClient.get('/users');
};

export const createUser = (data: any) => {
  return apiClient.post('/users', data);
};

export const updateUser = (id: string, data: any) => {
  return apiClient.put(`/users/${id}`, data);
};

export const deleteUser = (id: string) => {
  return apiClient.delete(`/users/${id}`);
};

// Products
export const getProducts = () => {
  return apiClient.get('/products');
};

export const createProduct = (data: any) => {
  return apiClient.post('/products', data);
};

export const updateProduct = (id: string, data: any) => {
  return apiClient.put(`/products/${id}`, data);
};

export const deleteProduct = (id: string) => {
  return apiClient.delete(`/products/${id}`);
};

// Cart
export const getCart = () => {
  return apiClient.get('/cart');
};

export const addToCart = (produkId: string) => {
  return apiClient.post('/cart/add', { produk_id: produkId });
};

export const removeFromCart = (itemId: string) => {
  return apiClient.delete(`/cart/${itemId}`);
};

// Checkout
export const checkoutCart = () => {
  return apiClient.post('/checkout', {});
};

// Transactions
export const getTransactions = () => {
  return apiClient.get('/transactions');
};

export const approvePayment = (id: string) => {
  return apiClient.put(`/transactions/${id}/pay`, {});
};

export default apiClient;
