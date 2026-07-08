import React, { createContext, useContext, useState, useEffect } from 'react';
import { formatRupiah, formatDate } from '../utils/formatters';
import * as api from '../api/client';
import { User, Product, CartItem, Transaction, SimponiBilling } from '../types';

interface AppContextType {
  // Auth
  currentUser: User | null;
  isCheckingAuth: boolean;
  loginEmail: string;
  setLoginEmail: (val: string) => void;
  loginPassword: string;
  setLoginPassword: (val: string) => void;
  loginError: string;
  setLoginError: (val: string) => void;
  isLoggingIn: boolean;
  handleLogin: (e: React.FormEvent) => Promise<void>;
  handleLogout: () => Promise<void>;

  // Tabs
  activeTab: 'dashboard' | 'users' | 'products' | 'pembelian' | 'history' | 'cart';
  setActiveTab: (tab: 'dashboard' | 'users' | 'products' | 'pembelian' | 'history' | 'cart') => void;

  // Data lists
  users: User[];
  products: Product[];
  cart: CartItem[];
  transactions: Transaction[];
  fetchUsers: () => Promise<void>;
  fetchProducts: () => Promise<void>;
  fetchCart: () => Promise<void>;
  fetchTransactions: () => Promise<void>;

  // User Modal CRUD
  showUserModal: boolean;
  setShowUserModal: (val: boolean) => void;
  selectedUser: User | null;
  userForm: any;
  setUserForm: (val: any) => void;
  handleOpenUserModal: (user?: User | null) => void;
  handleSaveUser: (e: React.FormEvent) => Promise<void>;
  handleDeleteUser: (id: string) => Promise<void>;

  // Product Modal CRUD
  showProductModal: boolean;
  setShowProductModal: (val: boolean) => void;
  selectedProduct: Product | null;
  productForm: any;
  setProductForm: (val: any) => void;
  handleOpenProductModal: (product?: Product | null) => void;
  handleSaveProduct: (e: React.FormEvent) => Promise<void>;
  handleDeleteProduct: (id: string) => Promise<void>;

  // Cart & Checkout
  showCheckoutModal: boolean;
  setShowCheckoutModal: (val: boolean) => void;
  checkoutProduct: Product | null;
  setCheckoutProduct: (val: Product | null) => void;
  simponiBilling: SimponiBilling | null;
  setSimponiBilling: (val: SimponiBilling | null) => void;
  handleAddToCart: (product: Product) => Promise<void>;
  handleRemoveFromCart: (itemId: string) => Promise<void>;
  handleCheckoutCart: () => Promise<void>;
  handleConfirmCheckout: () => Promise<void>;

  // Transaction details modal (admin)
  showDetailModal: boolean;
  setShowDetailModal: (val: boolean) => void;
  selectedTransaction: Transaction | null;
  handleOpenDetailModal: (tx: Transaction) => void;
  handleApprovePayment: () => Promise<void>;

  // Formatters
  formatRupiah: (val: number) => string;
  formatDate: (dateStr: string) => string;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Auth state
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Routing tab
  const [activeTab, setActiveTab] = useState<'dashboard' | 'users' | 'products' | 'pembelian' | 'history' | 'cart'>('dashboard');

  // Lists
  const [users, setUsers] = useState<User[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  // User CRUD modal states
  const [showUserModal, setShowUserModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [userForm, setUserForm] = useState({ name: '', email: '', username: '', password: '', role: 'PEMBELI', status: true });

  // Product CRUD modal states
  const [showProductModal, setShowProductModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [productForm, setProductForm] = useState({ name: '', harga: '' });

  // Checkout states
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [checkoutProduct, setCheckoutProduct] = useState<Product | null>(null);
  const [simponiBilling, setSimponiBilling] = useState<SimponiBilling | null>(null);

  // Detail Modal states
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);

  // Check auth on mount (cookie verification) & sync across tabs
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await api.getMe();
        setCurrentUser(res.data);
        if (res.data.role === 'ADMIN') {
          setActiveTab('dashboard');
        } else {
          setActiveTab('pembelian');
        }
      } catch (err) {
        setCurrentUser(null);
      } finally {
        setIsCheckingAuth(false);
      }
    };

    checkAuth();

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'session_active') {
        checkAuth();
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Fetch view-specific data when active tab changes
  useEffect(() => {
    if (!currentUser) return;

    if (activeTab === 'users' && currentUser.role === 'ADMIN') {
      fetchUsers();
    }
    if (activeTab === 'products' || activeTab === 'pembelian') {
      fetchProducts();
    }
    if (activeTab === 'pembelian' && currentUser.role === 'PEMBELI') {
      fetchCart();
    }
    if (activeTab === 'history') {
      fetchTransactions();
    }
    if (activeTab === 'dashboard') {
      if (currentUser.role === 'ADMIN') {
        fetchUsers();
        fetchProducts();
        fetchTransactions();
      } else {
        fetchTransactions();
      }
    }
  }, [activeTab, currentUser]);

  // Auth Operations
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginEmail || !loginPassword) {
      setLoginError('Email dan password wajib diisi.');
      return;
    }
    setIsLoggingIn(true);
    setLoginError('');

    try {
      await api.loginUser(loginEmail, loginPassword);
      const meRes = await api.getMe();
      setCurrentUser(meRes.data);
      if (meRes.data.role === 'ADMIN') {
        setActiveTab('dashboard');
      } else {
        setActiveTab('pembelian');
      }
      localStorage.setItem('session_active', 'login_' + Date.now().toString());
    } catch (err: any) {
      setLoginError(err.response?.data?.error || 'Koneksi ke server gagal.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    try {
      await api.logoutUser();
    } catch (err) {
      console.error('Error during logout API call:', err);
    } finally {
      setCurrentUser(null);
      setUsers([]);
      setProducts([]);
      setCart([]);
      setTransactions([]);
      setLoginEmail('');
      setLoginPassword('');
      setActiveTab('dashboard');
      localStorage.setItem('session_active', 'logout_' + Date.now().toString());
    }
  };

  // Fetching Data
  const fetchUsers = async () => {
    try {
      const res = await api.getUsers();
      setUsers(res.data);
    } catch (err) {
      console.error('Error fetching users:', err);
    }
  };

  const fetchProducts = async () => {
    try {
      const res = await api.getProducts();
      setProducts(res.data);
    } catch (err) {
      console.error('Error fetching products:', err);
    }
  };

  const fetchCart = async () => {
    try {
      const res = await api.getCart();
      setCart(res.data);
    } catch (err) {
      console.error('Error fetching cart:', err);
    }
  };

  const fetchTransactions = async () => {
    try {
      const res = await api.getTransactions();
      setTransactions(res.data);
    } catch (err) {
      console.error('Error fetching transactions:', err);
    }
  };

  // User CRUD
  const handleOpenUserModal = (user: User | null = null) => {
    if (user) {
      setSelectedUser(user);
      setUserForm({
        name: user.name,
        email: user.email,
        username: user.email.split('@')[0],
        password: '',
        role: user.role,
        status: user.status
      });
    } else {
      setSelectedUser(null);
      setUserForm({
        name: '',
        email: '',
        username: '',
        password: '',
        role: 'PEMBELI',
        status: true
      });
    }
    setShowUserModal(true);
  };

  const handleSaveUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (selectedUser) {
        const body: any = {
          name: userForm.name,
          email: userForm.email,
          role: userForm.role,
          status: userForm.status
        };
        if (userForm.password) body.password = userForm.password;
        await api.updateUser(selectedUser.id, body);
      } else {
        await api.createUser(userForm);
      }
      fetchUsers();
      setShowUserModal(false);
    } catch (err: any) {
      alert(err.response?.data?.error || 'Gagal menyimpan user');
    }
  };

  const handleDeleteUser = async (id: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus user ini?')) return;
    try {
      await api.deleteUser(id);
      fetchUsers();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Gagal menghapus user');
    }
  };

  // Product CRUD
  const handleOpenProductModal = (product: Product | null = null) => {
    if (product) {
      setSelectedProduct(product);
      setProductForm({
        name: product.name,
        harga: product.harga.toString()
      });
    } else {
      setSelectedProduct(null);
      setProductForm({
        name: '',
        harga: ''
      });
    }
    setShowProductModal(true);
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const body = {
        name: productForm.name,
        harga: parseFloat(productForm.harga)
      };
      if (selectedProduct) {
        await api.updateProduct(selectedProduct.id, body);
      } else {
        await api.createProduct(body);
      }
      fetchProducts();
      setShowProductModal(false);
    } catch (err: any) {
      alert(err.response?.data?.error || 'Gagal menyimpan produk');
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus produk ini?')) return;
    try {
      await api.deleteProduct(id);
      fetchProducts();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Gagal menghapus produk');
    }
  };

  // Cart & Purchase Actions
  const handleAddToCart = async (product: Product) => {
    try {
      await api.addToCart(product.id);
      fetchCart();
      alert(`"${product.name}" berhasil ditambahkan ke keranjang belanja.`);
    } catch (err: any) {
      alert(err.response?.data?.error || 'Gagal menambahkan produk ke keranjang.');
    }
  };

  const handleRemoveFromCart = async (itemId: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus item ini dari keranjang?')) return;
    try {
      await api.removeFromCart(itemId);
      fetchCart();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Gagal menghapus item dari keranjang.');
    }
  };

  const handleCheckoutCart = async () => {
    if (cart.length === 0) return;
    try {
      const checkoutRes = await api.checkoutCart();
      setSimponiBilling({
        kode_billing: checkoutRes.data.kode_billing,
        nominal: checkoutRes.data.total_harga,
        expired_at: checkoutRes.data.expired_at,
        productName: cart.map((c) => c.produk_name).join(', ')
      });
      fetchCart();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Proses checkout gagal.');
    }
  };

  const handleConfirmCheckout = async () => {
    if (!checkoutProduct) return;
    try {
      await api.addToCart(checkoutProduct.id);
      const checkoutRes = await api.checkoutCart();
      setSimponiBilling({
        kode_billing: checkoutRes.data.kode_billing,
        nominal: checkoutRes.data.total_harga,
        expired_at: checkoutRes.data.expired_at,
        productName: checkoutProduct.name
      });
      setShowCheckoutModal(false);
      fetchCart();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Proses checkout gagal.');
    }
  };

  // Payment confirmation (admin)
  const handleOpenDetailModal = (tx: Transaction) => {
    setSelectedTransaction(tx);
    setShowDetailModal(true);
  };

  const handleApprovePayment = async () => {
    if (!selectedTransaction) return;
    try {
      await api.approvePayment(selectedTransaction.id);
      fetchTransactions();
      setShowDetailModal(false);
    } catch (err: any) {
      alert(err.response?.data?.error || 'Gagal memperbarui status pembayaran.');
    }
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        isCheckingAuth,
        loginEmail,
        setLoginEmail,
        loginPassword,
        setLoginPassword,
        loginError,
        setLoginError,
        isLoggingIn,
        handleLogin,
        handleLogout,
        activeTab,
        setActiveTab,
        users,
        products,
        cart,
        transactions,
        fetchUsers,
        fetchProducts,
        fetchCart,
        fetchTransactions,
        showUserModal,
        setShowUserModal,
        selectedUser,
        userForm,
        setUserForm,
        handleOpenUserModal,
        handleSaveUser,
        handleDeleteUser,
        showProductModal,
        setShowProductModal,
        selectedProduct,
        productForm,
        setProductForm,
        handleOpenProductModal,
        handleSaveProduct,
        handleDeleteProduct,
        showCheckoutModal,
        setShowCheckoutModal,
        checkoutProduct,
        setCheckoutProduct,
        simponiBilling,
        setSimponiBilling,
        handleAddToCart,
        handleRemoveFromCart,
        handleCheckoutCart,
        handleConfirmCheckout,
        showDetailModal,
        setShowDetailModal,
        selectedTransaction,
        handleOpenDetailModal,
        handleApprovePayment,
        formatRupiah,
        formatDate
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
