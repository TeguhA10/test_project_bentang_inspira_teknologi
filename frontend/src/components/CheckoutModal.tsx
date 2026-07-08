import React from 'react';
import { X } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const CheckoutModal: React.FC = () => {
  const {
    showCheckoutModal,
    setShowCheckoutModal,
    checkoutProduct,
    handleConfirmCheckout,
    formatRupiah
  } = useApp();

  if (!showCheckoutModal || !checkoutProduct) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden animate-slide">
        <div className="flex justify-between items-center px-6 py-4 border-b border-slate-200 bg-slate-50">
          <span className="font-bold text-slate-800">Checkout Pembelian</span>
          <button className="text-slate-400 hover:text-slate-600 transition-colors" onClick={() => setShowCheckoutModal(false)}>
            <X size={18} />
          </button>
        </div>
        <div className="p-6 flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-600">Nama Produk / Jumlah Token</label>
            <input
              className="w-full border border-slate-300 rounded-lg px-4 py-2.5 text-sm bg-slate-100 text-slate-500 cursor-not-allowed"
              type="text"
              value={checkoutProduct.name}
              disabled
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-600">Harga</label>
            <input
              className="w-full border border-slate-300 rounded-lg px-4 py-2.5 text-sm bg-slate-100 text-slate-500 cursor-not-allowed"
              type="text"
              value={formatRupiah(parseFloat(checkoutProduct.harga))}
              disabled
            />
          </div>

          <p className="text-sm text-slate-500">
            Pembelian token akan membuat kode billing transaksi <strong className="text-slate-700">SIMPONI</strong> baru yang berlaku selama 24 jam.
          </p>
        </div>
        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex justify-end gap-3">
          <button className="px-5 py-2.5 border border-slate-300 hover:bg-slate-100 rounded-lg text-sm font-semibold transition-colors text-slate-700" onClick={() => setShowCheckoutModal(false)}>
            Batal
          </button>
          <button
            className="px-5 py-2.5 bg-primary hover:bg-primary-hover text-white rounded-lg text-sm font-semibold transition-colors"
            onClick={handleConfirmCheckout}
          >
            Lanjutkan Pembayaran
          </button>
        </div>
      </div>
    </div>
  );
};
