import React from 'react';
import { X, AlertCircle } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const DetailModal: React.FC = () => {
  const {
    showDetailModal,
    setShowDetailModal,
    selectedTransaction,
    currentUser,
    handleApprovePayment,
    formatRupiah,
    formatDate
  } = useApp();

  if (!showDetailModal || !selectedTransaction) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden animate-slide">
        <div className="flex justify-between items-center px-6 py-4 border-b border-slate-200 bg-slate-50">
          <span className="font-bold text-slate-800">Detail Transaksi</span>
          <button className="text-slate-400 hover:text-slate-600 transition-colors" onClick={() => setShowDetailModal(false)}>
            <X size={18} />
          </button>
        </div>
        <div className="p-6 flex flex-col gap-4">
          <table className="w-full border-collapse text-sm">
            <tbody>
              <tr className="border-b border-slate-100">
                <td className="py-2.5 text-slate-500 font-semibold w-1/3 text-left">ID Transaksi</td>
                <td className="py-2.5 text-slate-800 text-left font-mono text-xs">{selectedTransaction.id}</td>
              </tr>
              <tr className="border-b border-slate-100">
                <td className="py-2.5 text-slate-500 font-semibold w-1/3 text-left">Kode Billing</td>
                <td className="py-2.5 text-left font-bold text-primary">
                  {selectedTransaction.kode_billing}
                </td>
              </tr>
              <tr className="border-b border-slate-100">
                <td className="py-2.5 text-slate-500 font-semibold w-1/3 text-left valign-top">Detail Produk</td>
                <td className="py-2.5 text-left text-slate-800 font-medium">
                  {selectedTransaction.items && selectedTransaction.items.length > 0 ? (
                    <div className="flex flex-col gap-1.5">
                      {selectedTransaction.items.map((item: any, i: number) => (
                        <div key={i} className="flex justify-between gap-4">
                          <span>• {item.produk_name}</span>
                          <span className="text-slate-500 font-mono text-xs">
                            {formatRupiah(parseFloat(item.harga))}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    'Paket API'
                  )}
                </td>
              </tr>
              <tr className="border-b border-slate-100">
                <td className="py-2.5 text-slate-500 font-semibold w-1/3 text-left">Total Nominal</td>
                <td className="py-2.5 text-left font-bold text-primary">
                  {formatRupiah(parseFloat(selectedTransaction.total_harga))}
                </td>
              </tr>
              <tr className="border-b border-slate-100">
                <td className="py-2.5 text-slate-500 font-semibold w-1/3 text-left">Status</td>
                <td className="py-2.5 text-left">
                  {selectedTransaction.status === 'BELUM_DIBAYAR' && (
                    <span className="bg-warning-light text-warning px-2.5 py-1 rounded text-xs font-semibold">Menunggu Pembayaran</span>
                  )}
                  {selectedTransaction.status === 'SUDAH_DIBAYAR' && (
                    <span className="bg-success-light text-success px-2.5 py-1 rounded text-xs font-semibold">Sudah Dibayar</span>
                  )}
                  {selectedTransaction.status === 'EXPIRED' && (
                    <span className="bg-danger-light text-danger px-2.5 py-1 rounded text-xs font-semibold">Expired</span>
                  )}
                </td>
              </tr>
              <tr className="border-b border-slate-100">
                <td className="py-2.5 text-slate-500 font-semibold w-1/3 text-left">Tanggal Transaksi</td>
                <td className="py-2.5 text-slate-800 text-left">{formatDate(selectedTransaction.created_at)}</td>
              </tr>
              <tr>
                <td className="py-2.5 text-slate-500 font-semibold w-1/3 text-left">Masa Berlaku</td>
                <td className="py-2.5 text-left font-semibold text-danger">
                  {formatDate(selectedTransaction.expired_at)}
                </td>
              </tr>
            </tbody>
          </table>

          {selectedTransaction.status === 'BELUM_DIBAYAR' && currentUser?.role === 'ADMIN' && (
            <div className="flex items-center gap-2.5 p-3.5 bg-primary-light text-primary rounded-lg text-xs mt-2">
              <AlertCircle size={16} className="shrink-0" />
              <span>
                Sebagai Admin, Anda dapat memverifikasi pembayaran dan mengubah status transaksi ini menjadi{' '}
                <strong>Sudah Dibayar</strong>.
              </span>
            </div>
          )}
        </div>
        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex justify-end gap-3">
          <button className="px-5 py-2.5 border border-slate-300 hover:bg-slate-100 rounded-lg text-sm font-semibold transition-colors text-slate-700" onClick={() => setShowDetailModal(false)}>
            Tutup
          </button>

          {selectedTransaction.status === 'BELUM_DIBAYAR' && currentUser?.role === 'ADMIN' && (
            <button
              className="px-5 py-2.5 bg-success hover:bg-success-hover text-white rounded-lg text-sm font-semibold transition-colors"
              onClick={handleApprovePayment}
            >
              Verifikasi Pembayaran
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
