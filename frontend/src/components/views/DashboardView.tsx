import React from 'react';
import {
  UserCheck,
  Users as UsersIcon,
  ShoppingBag,
  History,
  DollarSign
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const DashboardView: React.FC = () => {
  const {
    currentUser,
    users,
    products,
    transactions,
    formatRupiah
  } = useApp();

  if (currentUser?.role !== 'ADMIN') {
    return (
      <div className="w-full bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-8 flex justify-between items-center text-white mb-8 shadow-md animate-slide">
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-bold">Selamat Datang, {currentUser?.email}!</h1>
          <p className="text-slate-100/90 text-sm max-w-lg">Mulai beli dan kelola token kependudukan Anda untuk kemudahan integrasi data.</p>
        </div>
        <UserCheck size={48} className="opacity-20 shrink-0" />
      </div>
    );
  }

  const unpaidCount = transactions.filter((t) => t.status === 'BELUM_DIBAYAR').length;
  const totalRevenue = transactions
    .filter((t) => t.status === 'SUDAH_DIBAYAR')
    .reduce((sum, t) => sum + parseFloat(t.total_harga), 0);

  return (
    <div className="animate-slide">
      <div className="w-full bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-8 flex justify-between items-center text-white mb-8 shadow-md">
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-bold">Selamat Datang, Admin!</h1>
          <p className="text-slate-100/90 text-sm max-w-lg">Anda dapat mengelola pengguna, data master produk, dan melakukan validasi riwayat pembayaran.</p>
        </div>
        <UserCheck size={48} className="opacity-15 shrink-0" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex items-center gap-4 transition-all hover:shadow-md">
          <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-blue-50 text-blue-600 shrink-0">
            <UsersIcon size={24} />
          </div>
          <div className="flex flex-col">
            <div className="text-2xl font-bold text-slate-800">{users.length}</div>
            <div className="text-xs font-medium text-slate-400 uppercase tracking-wider">Total Pengguna</div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex items-center gap-4 transition-all hover:shadow-md">
          <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-emerald-50 text-emerald-600 shrink-0">
            <ShoppingBag size={24} />
          </div>
          <div className="flex flex-col">
            <div className="text-2xl font-bold text-slate-800">{products.length}</div>
            <div className="text-xs font-medium text-slate-400 uppercase tracking-wider">Jumlah Produk</div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex items-center gap-4 transition-all hover:shadow-md">
          <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-amber-50 text-amber-600 shrink-0">
            <History size={24} />
          </div>
          <div className="flex flex-col">
            <div className="text-2xl font-bold text-slate-800">{unpaidCount}</div>
            <div className="text-xs font-medium text-slate-400 uppercase tracking-wider">Menunggu Pembayaran</div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex items-center gap-4 transition-all hover:shadow-md">
          <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-red-50 text-red-600 shrink-0">
            <DollarSign size={24} />
          </div>
          <div className="flex flex-col">
            <div className="text-2xl font-bold text-slate-800">{formatRupiah(totalRevenue)}</div>
            <div className="text-xs font-medium text-slate-400 uppercase tracking-wider">Total Pendapatan</div>
          </div>
        </div>
      </div>
    </div>
  );
};
