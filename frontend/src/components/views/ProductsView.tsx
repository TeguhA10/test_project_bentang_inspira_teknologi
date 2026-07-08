import React, { useState } from 'react';
import { Search, Plus, Edit, Trash2 } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const ProductsView: React.FC = () => {
  const {
    products,
    handleOpenProductModal,
    handleDeleteProduct,
    formatRupiah,
    formatDate
  } = useApp();

  const [productSearch, setProductSearch] = useState('');

  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(productSearch.toLowerCase())
  );

  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden animate-slide">
      <div className="p-6 border-b border-slate-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-50">
        <h3 className="text-lg font-bold text-slate-800">Data Master Produk</h3>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex items-center flex-1 sm:flex-initial">
            <Search className="absolute left-3 text-slate-400 pointer-events-none" size={16} />
            <input
              className="pl-9 pr-4 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary-light transition-all w-full sm:w-64 bg-white"
              type="text"
              placeholder="Cari produk..."
              value={productSearch}
              onChange={(e) => setProductSearch(e.target.value)}
            />
          </div>
          <button className="flex items-center gap-2 bg-primary hover:bg-primary-hover text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors shrink-0" onClick={() => handleOpenProductModal()}>
            <Plus size={16} />
            Tambah Produk
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-sm">
          <thead>
            <tr>
              <th className="px-6 py-4 bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">#</th>
              <th className="px-6 py-4 bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">Nama Produk</th>
              <th className="px-6 py-4 bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">Harga per Token / Hit</th>
              <th className="px-6 py-4 bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">Tanggal Input</th>
              <th className="px-6 py-4 bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts.map((p, idx) => (
              <tr key={p.id} className="hover:bg-slate-50/50 transition-colors">
                <td className="px-6 py-4 text-slate-700 border-b border-slate-100 align-middle">{idx + 1}</td>
                <td className="px-6 py-4 text-slate-700 border-b border-slate-100 align-middle font-semibold">{p.name}</td>
                <td className="px-6 py-4 border-b border-slate-100 align-middle font-bold text-primary">
                  {formatRupiah(parseFloat(p.harga))}
                </td>
                <td className="px-6 py-4 text-slate-700 border-b border-slate-100 align-middle">{formatDate(p.created_at)}</td>
                <td className="px-6 py-4 text-slate-700 border-b border-slate-100 align-middle">
                  <div className="flex items-center gap-2">
                    <button
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Edit"
                      onClick={() => handleOpenProductModal(p)}
                    >
                      <Edit size={14} />
                    </button>
                    <button
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete"
                      onClick={() => handleDeleteProduct(p.id)}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filteredProducts.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-slate-400">
                  Tidak ada data produk.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
