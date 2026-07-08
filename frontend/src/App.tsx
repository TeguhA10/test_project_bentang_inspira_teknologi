import { AppProvider, useApp } from './context/AppContext';
import { Login } from './components/Login';
import { Sidebar } from './components/Sidebar';
import { UserModal } from './components/UserModal';
import { ProductModal } from './components/ProductModal';
import { CheckoutModal } from './components/CheckoutModal';
import { DetailModal } from './components/DetailModal';
import { DashboardView } from './components/views/DashboardView';
import { UsersView } from './components/views/UsersView';
import { ProductsView } from './components/views/ProductsView';
import { PembelianView } from './components/views/PembelianView';
import { CartView } from './components/views/CartView';
import { HistoryView } from './components/views/HistoryView';
import { Shield } from 'lucide-react';

function AppContent() {
  const { currentUser, isCheckingAuth, activeTab } = useApp();

  if (isCheckingAuth) {
    return (
      <div className="flex justify-center items-center h-screen bg-slate-50 text-primary font-semibold">
        Memverifikasi Sesi...
      </div>
    );
  }

  if (!currentUser) {
    return <Login />;
  }

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      <main className="flex-1 flex flex-col h-screen overflow-y-auto">
        <header className="bg-white border-b border-slate-200 py-4 px-8 flex justify-end items-center shadow-sm">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
            <Shield size={16} className="text-success" />
            <span>Secure Connection / API Gateway</span>
          </div>
        </header>

        <div className="p-8 max-w-7xl w-full mx-auto flex-1">
          {activeTab === 'dashboard' && <DashboardView />}
          {activeTab === 'users' && currentUser.role === 'ADMIN' && <UsersView />}
          {activeTab === 'products' && currentUser.role === 'ADMIN' && <ProductsView />}
          {activeTab === 'pembelian' && currentUser.role === 'PEMBELI' && <PembelianView />}
          {activeTab === 'cart' && currentUser.role === 'PEMBELI' && <CartView />}
          {activeTab === 'history' && <HistoryView />}
        </div>
      </main>

      {/* Modals Zone */}
      <UserModal />
      <ProductModal />
      <CheckoutModal />
      <DetailModal />
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
