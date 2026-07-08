import React from 'react';
import {
  CreditCard,
  TrendingUp,
  Users as UsersIcon,
  ShoppingBag,
  History,
  ShoppingCart,
  LogOut
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const Sidebar: React.FC = () => {
  const {
    currentUser,
    activeTab,
    setActiveTab,
    cart,
    handleLogout
  } = useApp();

  if (!currentUser) return null;

  return (
    <aside className="w-64 bg-slate-900 text-slate-100 flex flex-col p-5 shrink-0 shadow-2xl z-10">
      <div className="flex items-center gap-3 px-3 pb-5 mb-6 border-b border-slate-800">
        <CreditCard className="text-primary" size={24} />
        <span className="text-lg font-bold tracking-wider">DOMPET PNBP</span>
      </div>

      <nav className="flex flex-col gap-2 flex-1">
        {currentUser.role === 'ADMIN' && (
          <>
            <a
              className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium text-sm transition-all cursor-pointer ${
                activeTab === 'dashboard' ? 'bg-primary text-white hover:bg-primary-hover' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-100'
              }`}
              onClick={() => setActiveTab('dashboard')}
            >
              <TrendingUp size={18} />
              Dashboard
            </a>
            <a
              className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium text-sm transition-all cursor-pointer ${
                activeTab === 'users' ? 'bg-primary text-white hover:bg-primary-hover' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-100'
              }`}
              onClick={() => setActiveTab('users')}
            >
              <UsersIcon size={18} />
              Users
            </a>
            <a
              className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium text-sm transition-all cursor-pointer ${
                activeTab === 'products' ? 'bg-primary text-white hover:bg-primary-hover' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-100'
              }`}
              onClick={() => setActiveTab('products')}
            >
              <ShoppingBag size={18} />
              Master Produk
            </a>
            <a
              className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium text-sm transition-all cursor-pointer ${
                activeTab === 'history' ? 'bg-primary text-white hover:bg-primary-hover' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-100'
              }`}
              onClick={() => setActiveTab('history')}
            >
              <History size={18} />
              History Transaksi
            </a>
          </>
        )}

        {currentUser.role === 'PEMBELI' && (
          <>
            <a
              className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium text-sm transition-all cursor-pointer ${
                activeTab === 'pembelian' ? 'bg-primary text-white hover:bg-primary-hover' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-100'
              }`}
              onClick={() => setActiveTab('pembelian')}
            >
              <ShoppingBag size={18} />
              Pembelian Produk
            </a>
            <a
              className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium text-sm transition-all cursor-pointer ${
                activeTab === 'cart' ? 'bg-primary text-white hover:bg-primary-hover' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-100'
              }`}
              onClick={() => setActiveTab('cart')}
            >
              <div className="relative inline-flex">
                <ShoppingCart size={18} />
                {cart.length > 0 && (
                  <span className="absolute -top-2 -right-2 bg-danger text-white text-[9px] font-bold w-[17px] h-[17px] rounded-full flex items-center justify-center border-2 border-slate-900">
                    {cart.length}
                  </span>
                )}
              </div>
              Keranjang Belanja
            </a>
            <a
              className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium text-sm transition-all cursor-pointer ${
                activeTab === 'history' ? 'bg-primary text-white hover:bg-primary-hover' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-100'
              }`}
              onClick={() => setActiveTab('history')}
            >
              <History size={18} />
              History Pembayaran
            </a>
          </>
        )}
      </nav>

      <div className="mt-auto pt-5 border-t border-slate-800">
        <div className="flex items-center gap-3 px-3 mb-4">
          <div className="bg-slate-800 w-10 h-10 rounded-full flex items-center justify-center text-primary font-semibold border-2 border-slate-700">
            {currentUser.email.slice(0, 2).toUpperCase()}
          </div>
          <div className="overflow-hidden text-left">
            <div className="text-xs font-semibold truncate text-slate-200">{currentUser.email}</div>
            <div className="text-[10px] text-slate-500 mt-0.5">
              <span className="bg-blue-950 text-blue-300 px-1.5 py-0.5 rounded text-[9px] font-bold uppercase">
                {currentUser.role}
              </span>
            </div>
          </div>
        </div>

        <a
          className="flex items-center gap-3 px-4 py-3 rounded-lg font-medium text-sm text-slate-400 hover:bg-slate-800 hover:text-slate-100 transition-all cursor-pointer"
          onClick={handleLogout}
        >
          <LogOut size={18} />
          Keluar
        </a>
      </div>
    </aside>
  );
};
