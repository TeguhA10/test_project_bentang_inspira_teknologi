import React from 'react';
import { ShoppingCart, CheckCircle, AlertCircle, Check } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const PembelianView: React.FC = () => {
  const {
    products,
    simponiBilling,
    setSimponiBilling,
    handleAddToCart,
    setCheckoutProduct,
    setShowCheckoutModal,
    formatRupiah,
    formatDate
  } = useApp();

  return (
    <div className="animate-slide">
      <div className="w-full bg-gradient-to-r from-blue-600 to-blue-800 rounded-2xl p-8 flex justify-between items-center text-white mb-8 shadow-md">
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-bold">Beli Produk Token / Hit API</h1>
          <p className="text-slate-100/90 text-sm max-w-lg">Pilih paket hit data yang Anda butuhkan untuk akses data kependudukan dan lainnya secara cepat.</p>
        </div>
        <ShoppingCart size={48} className="opacity-20 shrink-0" />
      </div>

      {simponiBilling && (
        <div className="bg-white border-2 border-emerald-500 rounded-xl shadow-lg mb-8 overflow-hidden">
          <div className="px-6 py-4 bg-emerald-50 border-b border-emerald-100 flex justify-between items-center">
            <h3 className="text-emerald-700 font-bold flex items-center gap-2 text-base">
              <CheckCircle size={18} />
              Kode Billing SIMPONI Berhasil Dibuat
            </h3>
            <button
              className="px-3 py-1.5 border border-emerald-300 hover:bg-emerald-100/50 rounded-lg text-xs font-semibold text-emerald-800 transition-colors"
              onClick={() => setSimponiBilling(null)}
            >
              Tutup Receipt
            </button>
          </div>
          <div className="p-6 flex flex-col gap-5">
            <div className="flex items-start gap-3 p-4 bg-emerald-50 text-emerald-800 border border-emerald-100 rounded-lg text-sm">
              <AlertCircle size={18} className="shrink-0 mt-0.5" />
              <div>
                <strong>Billing Berhasil Dibuat!</strong> Berikut informasi kode billing dari sistem{' '}
                <strong>SIMPONI Kemenkeu</strong> untuk produk <strong>{simponiBilling.productName}</strong>.
              </div>
            </div>

            <table className="w-full border-collapse text-sm">
              <tbody>
                <tr className="border-b border-slate-100">
                  <td className="py-2.5 text-slate-500 font-semibold w-1/3 text-left">Kode Billing</td>
                  <td className="py-2.5 text-left font-bold text-primary text-lg">
                    {simponiBilling.kode_billing}
                  </td>
                </tr>
                <tr className="border-b border-slate-100">
                  <td className="py-2.5 text-slate-500 font-semibold w-1/3 text-left">Nominal Pembayaran</td>
                  <td className="py-2.5 text-left font-bold text-primary">
                    {formatRupiah(parseFloat(simponiBilling.nominal))}
                  </td>
                </tr>
                <tr>
                  <td className="py-2.5 text-slate-500 font-semibold w-1/3 text-left">Tanggal Kadaluarsa</td>
                  <td className="py-2.5 text-left font-bold text-danger">
                    {formatDate(simponiBilling.expired_at)}
                  </td>
                </tr>
              </tbody>
            </table>

            <div className="p-5 bg-slate-50 border border-slate-200 rounded-lg text-left">
              <div className="font-bold text-slate-700 text-sm mb-3">Tata Cara Pembayaran:</div>
              <ol className="list-decimal pl-5 text-sm text-slate-600 flex flex-col gap-2">
                <li>Buka aplikasi mobile banking atau ATM bank persepsi Anda (BRI / BNI / Mandiri / BSI / Bank lainnya).</li>
                <li>
                  Pilih menu <strong>"Pembayaran"</strong> → <strong>"Penerimaan Negara / PNBP"</strong> →{' '}
                  <strong>"SIMPONI"</strong>.
                </li>
                <li>
                  Masukkan <strong>Kode Billing</strong> yang tertera di atas.
                </li>
                <li>Periksa rincian transaksi dan lakukan pembayaran.</li>
                <li>
                  Simpan bukti bayar. Token akan otomatis aktif setelah pembayaran terverifikasi oleh sistem.
                </li>
              </ol>
            </div>

            <div className="flex justify-end">
              <button className="flex items-center gap-2 bg-primary hover:bg-primary-hover text-white px-5 py-2.5 rounded-lg text-sm font-semibold transition-colors" onClick={() => setSimponiBilling(null)}>
                <Check size={16} />
                Selesai
              </button>
            </div>
          </div>
        </div>
      )}

      <h2 className="text-lg font-bold mb-4 text-slate-800 text-left">
        Daftar Produk API
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {products.map((p, idx) => {
          const cardStyles = [
            'border-t-4 border-t-blue-500',
            'border-t-4 border-t-amber-500',
            'border-t-4 border-t-indigo-500'
          ];
          const theme = cardStyles[idx % cardStyles.length];
          return (
            <div key={p.id} className={`bg-white border border-slate-200 rounded-xl p-6 shadow-sm flex flex-col items-center justify-between min-h-[220px] transition-all hover:shadow-md hover:border-slate-300 text-center ${theme}`}>
              <div className="text-slate-800 font-bold text-base mb-2">{p.name}</div>
              <div className="text-primary font-extrabold text-2xl mb-6">{formatRupiah(parseFloat(p.harga))}</div>
              <div className="flex flex-col gap-2 w-full">
                <button className="w-full bg-primary hover:bg-primary-hover text-white font-semibold py-2.5 rounded-lg text-xs transition-colors" onClick={() => handleAddToCart(p)}>
                  + Tambah ke Keranjang
                </button>
                <button
                  className="w-full bg-white hover:bg-primary-light text-primary border border-primary font-semibold py-2.5 rounded-lg text-xs transition-colors"
                  onClick={() => {
                    setCheckoutProduct(p);
                    setShowCheckoutModal(true);
                  }}
                >
                  Beli Sekarang
                </button>
              </div>
            </div>
          );
        })}
        {products.length === 0 && (
          <div className="col-span-full padding p-10 bg-white rounded-xl border border-slate-200 text-slate-400 text-center">
            Tidak ada produk yang dapat dibeli saat ini.
          </div>
        )}
      </div>
    </div>
  );
};
