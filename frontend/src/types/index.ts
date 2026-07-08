export interface User {
  id: string;
  name: string;
  email: string;
  role: 'ADMIN' | 'PEMBELI';
  status: boolean;
  created_at: string;
  user_id?: string; // added to match decoding payload where id might map to user_id
}

export interface Product {
  id: string;
  name: string;
  harga: string;
  created_at: string;
}

export interface CartItem {
  id: string;
  pembeli_id: string;
  produk_id: string;
  harga: string;
  transaksi_id: string | null;
  produk_name?: string;
}

export interface TransactionItem {
  id: string;
  transaksi_id: string;
  pembeli_id: string;
  produk_id: string;
  harga: string;
  produk_name: string;
}

export interface Transaction {
  id: string;
  kode_billing: string;
  PEMBELI_id: string;
  total_harga: string;
  status: 'BELUM_DIBAYAR' | 'SUDAH_DIBAYAR' | 'EXPIRED';
  expired_at: string;
  created_at: string;
  items?: TransactionItem[];
}

export interface SimponiBilling {
  kode_billing: string;
  nominal: string;
  expired_at: string;
  productName: string;
}
