import React from 'react';
import { X } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const ProductModal: React.FC = () => {
  const {
    showProductModal,
    setShowProductModal,
    selectedProduct,
    productForm,
    setProductForm,
    handleSaveProduct
  } = useApp();

  if (!showProductModal) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden animate-slide">
        <div className="flex justify-between items-center px-6 py-4 border-b border-slate-200 bg-slate-50">
          <span className="font-bold text-slate-800">{selectedProduct ? 'Edit Produk' : 'Tambah Produk Baru'}</span>
          <button className="text-slate-400 hover:text-slate-600 transition-colors" onClick={() => setShowProductModal(false)}>
            <X size={18} />
          </button>
        </div>
        <form onSubmit={handleSaveProduct}>
          <div className="p-6 flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-600">Nama Produk</label>
              <input
                className="w-full border border-slate-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary-light transition-all"
                type="text"
                placeholder="Masukkan nama produk..."
                value={productForm.name}
                onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                required
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-600">Harga per Token / Hit</label>
              <input
                className="w-full border border-slate-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary-light transition-all"
                type="number"
                placeholder="Contoh: 5000"
                value={productForm.harga}
                onChange={(e) => setProductForm({ ...productForm, harga: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex justify-end gap-3">
            <button className="px-5 py-2.5 border border-slate-300 hover:bg-slate-100 rounded-lg text-sm font-semibold transition-colors text-slate-700" type="button" onClick={() => setShowProductModal(false)}>
              Batal
            </button>
            <button className="px-5 py-2.5 bg-primary hover:bg-primary-hover text-white rounded-lg text-sm font-semibold transition-colors" type="submit">
              Simpan
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
