import React from 'react';
import { ShoppingCart, CheckCircle, AlertCircle, Check, Trash2 } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const CartView: React.FC = () => {
  const {
    cart,
    simponiBilling,
    setSimponiBilling,
    handleRemoveFromCart,
    handleCheckoutCart,
    formatRupiah,
    formatDate
  } = useApp();

  const totalPayment = cart.reduce((sum, item) => sum + parseFloat(item.harga), 0);

  return (
    <div className="animate-slide">
      <div className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 rounded-2xl p-8 flex justify-between items-center text-white mb-8 shadow-md">
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-bold">Keranjang Belanja Anda</h1>
          <p className="text-slate-100/90 text-sm max-w-lg">Periksa kembali produk token / hit API yang Anda pilih sebelum melanjutkan ke pembayaran.</p>
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
                <strong>SIMPONI Kemenkeu</strong>.
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

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-200 bg-slate-50">
          <h3 className="text-lg font-bold text-slate-800">Daftar Produk Di Keranjang</h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr>
                <th className="px-6 py-4 bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">#</th>
                <th className="px-6 py-4 bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">Nama Produk / Token</th>
                <th className="px-6 py-4 bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">Harga Satuan</th>
                <th className="px-6 py-4 bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {cart.map((item, idx) => (
                <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4 text-slate-700 border-b border-slate-100 align-middle">{idx + 1}</td>
                  <td className="px-6 py-4 text-slate-700 border-b border-slate-100 align-middle font-semibold">{item.produk_name}</td>
                  <td className="px-6 py-4 border-b border-slate-100 align-middle font-bold text-primary">
                    {formatRupiah(parseFloat(item.harga))}
                  </td>
                  <td className="px-6 py-4 text-slate-700 border-b border-slate-100 align-middle">
                    <button
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Hapus"
                      onClick={() => handleRemoveFromCart(item.id)}
                    >
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))}
              {cart.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-slate-400">
                    <ShoppingCart size={36} className="mx-auto opacity-30 mb-2" />
                    Keranjang belanja Anda kosong. Silakan pilih produk di halaman Pembelian.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {cart.length > 0 && (
          <div className="p-6 bg-slate-50 border-t border-slate-200 flex justify-between items-center">
            <div>
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Total Pembayaran:
              </span>
              <h2 className="text-3xl font-extrabold text-primary mt-0.5">
                {formatRupiah(totalPayment)}
              </h2>
            </div>
            <button
              className="bg-primary hover:bg-primary-hover text-white px-8 py-3.5 rounded-full text-sm font-semibold transition-colors"
              onClick={handleCheckoutCart}
            >
              Checkout Sekarang
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
