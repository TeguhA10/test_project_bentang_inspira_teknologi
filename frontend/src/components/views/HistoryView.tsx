import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';

export const HistoryView: React.FC = () => {
  const {
    transactions,
    handleOpenDetailModal,
    formatRupiah,
    formatDate
  } = useApp();

  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const filteredTransactions = transactions.filter((t) => {
    const date = new Date(t.created_at);

    // Date Filtering
    if (startDate) {
      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0);
      if (date < start) return false;
    }
    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      if (date > end) return false;
    }

    // Status Filtering
    if (statusFilter !== 'ALL') {
      if (statusFilter === 'PENDING' && t.status !== 'BELUM_DIBAYAR') return false;
      if (statusFilter === 'PAID' && t.status !== 'SUDAH_DIBAYAR') return false;
      if (statusFilter === 'EXPIRED' && t.status !== 'EXPIRED') return false;
    }

    return true;
  });

  return (
    <div className="animate-slide">
      <div className="flex flex-wrap items-end gap-4 p-5 bg-white border border-slate-200 rounded-xl mb-6 shadow-sm text-left">
        <div className="flex flex-col gap-1.5">
          <span className="text-xs font-semibold text-slate-500">Tanggal Awal</span>
          <input
            className="border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary-light transition-all bg-white"
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <span className="text-xs font-semibold text-slate-500">Tanggal Akhir</span>
          <input
            className="border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary-light transition-all bg-white"
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <span className="text-xs font-semibold text-slate-500">Status Pembayaran</span>
          <select
            className="border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary-light bg-white transition-all min-w-[160px]"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="ALL">Semua</option>
            <option value="PENDING">Menunggu Pembayaran</option>
            <option value="PAID">Sudah Dibayar</option>
            <option value="EXPIRED">Expired</option>
          </select>
        </div>
        <button
          className="px-4 py-2 border border-slate-300 hover:bg-slate-100 rounded-lg text-sm font-semibold transition-colors text-slate-700"
          onClick={() => {
            setStartDate('');
            setEndDate('');
            setStatusFilter('ALL');
          }}
        >
          Reset Filter
        </button>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-200 bg-slate-50">
          <h3 className="text-lg font-bold text-slate-800">History Transaksi Pembayaran</h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr>
                <th className="px-6 py-4 bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">#</th>
                <th className="px-6 py-4 bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">ID Transaksi / Kode Billing</th>
                <th className="px-6 py-4 bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">Tanggal</th>
                <th className="px-6 py-4 bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">Detail Produk</th>
                <th className="px-6 py-4 bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">Total Pembelian</th>
                <th className="px-6 py-4 bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">Status Pembayaran</th>
                <th className="px-6 py-4 bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filteredTransactions.map((tx, idx) => {
                const productName = tx.items?.[0]?.produk_name || 'Paket API';
                return (
                  <tr key={tx.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 text-slate-700 border-b border-slate-100 align-middle">{idx + 1}</td>
                    <td className="px-6 py-4 text-slate-700 border-b border-slate-100 align-middle">
                      <div className="font-semibold text-slate-800">{tx.kode_billing}</div>
                      <div className="text-[10px] text-slate-400 font-mono mt-0.5">{tx.id}</div>
                    </td>
                    <td className="px-6 py-4 text-slate-700 border-b border-slate-100 align-middle">{formatDate(tx.created_at)}</td>
                    <td className="px-6 py-4 text-slate-700 border-b border-slate-100 align-middle">
                      {productName} {tx.items && tx.items.length > 1 ? `(+${tx.items.length - 1} item)` : ''}
                    </td>
                    <td className="px-6 py-4 border-b border-slate-100 align-middle font-bold text-primary">
                      {formatRupiah(parseFloat(tx.total_harga))}
                    </td>
                    <td className="px-6 py-4 text-slate-700 border-b border-slate-100 align-middle">
                      {tx.status === 'BELUM_DIBAYAR' && (
                        <span className="bg-warning-light text-warning px-2.5 py-1 rounded text-xs font-semibold">Menunggu Pembayaran</span>
                      )}
                      {tx.status === 'SUDAH_DIBAYAR' && (
                        <span className="bg-success-light text-success px-2.5 py-1 rounded text-xs font-semibold">Sudah Dibayar</span>
                      )}
                      {tx.status === 'EXPIRED' && (
                        <span className="bg-danger-light text-danger px-2.5 py-1 rounded text-xs font-semibold">Expired</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-slate-700 border-b border-slate-100 align-middle">
                      <button
                        className="px-3 py-1.5 border border-slate-300 hover:bg-slate-100 rounded-lg text-xs font-semibold text-slate-700 transition-colors"
                        onClick={() => handleOpenDetailModal(tx)}
                      >
                        Detail
                      </button>
                    </td>
                  </tr>
                );
              })}
              {filteredTransactions.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-slate-400">
                    Tidak ada data transaksi ditemukan.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
