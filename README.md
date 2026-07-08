# Dompet PNBP Microservices System

Sistem manajemen Dompet Penerimaan Negara Bukan Pajak (PNBP) berbasis arsitektur microservices. Proyek ini mengintegrasikan beberapa layanan microservices backend menggunakan Node.js/Express dan frontend berbasis React (Vite + TypeScript + Tailwind CSS).

---

## 🏗️ Arsitektur & Teknologi

### Teknologi Utama:
- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS (v3), Axios, Lucide React
- **Backend (Microservices)**: Node.js, Express, JSON Web Token (JWT)
- **Database**: PostgreSQL (Relasional)
- **Containerization**: Docker & Docker Compose
- **Gateway**: API Gateway untuk routing request dari frontend ke microservices backend.

### Struktur Layanan (Microservices & Port):
| Nama Service | Deskripsi | Port Default |
| :--- | :--- | :---: |
| **api-gateway** | Gateway utama sebagai gerbang masuk request API | `4000` |
| **auth-service** | Mengelola autentikasi user, registrasi, login, & blacklist JWT | `4001` |
| **rbac-service** | Mengelola Role-Based Access Control (RBAC) & role user | `4002` |
| **data-master-service** | Mengelola data master produk/layanan | `4003` |
| **transaksi-service** | Mengelola transaksi pembelian, cart, & tagihan Simponi Billing | `4004` |
| **frontend** | Aplikasi antarmuka pengguna (React Vite Web App) | `5173` |

---

## 🛠️ Prasyarat (Prerequisites)

Sebelum menjalankan aplikasi, pastikan Anda telah memasang:
1. **Node.js** (Rekomendasi v18 ke atas) & **npm**
2. **PostgreSQL Database** (Berjalan secara lokal di port `5432` dengan user default `postgres`)
3. **Docker Desktop** (Jika ingin menjalankan microservices menggunakan Docker)

---

## 🚀 Cara Menjalankan Aplikasi

### Opsi A: Menjalankan Menggunakan Docker (Direkomendasikan - Satu Perintah)

Sesuai ketentuan, **database PostgreSQL dan pembuatan table dilakukan secara lokal (di luar Docker)**, sedangkan seluruh service backend dan frontend dijalankan di dalam Docker container.

#### 1. Inisialisasi Database Lokal
Pastikan database PostgreSQL Anda aktif di local (port `5432`), kemudian jalankan script untuk membuat database dan tabel secara lokal:
```bash
npm run init-db
```
*(Script ini akan menghapus dan membuat ulang database `auth_service_db`, `rbac_service_db`, `data_master_service_db`, dan `transaksi_service_db` beserta tabel-tabelnya secara lokal).*

#### 2. Jalankan Seluruh Container Service
Jalankan perintah berikut di root project untuk membangun (build) dan menjalankan seluruh service:
```bash
npm run docker:up
```
*Atau menggunakan perintah native Docker:*
```bash
docker compose up --build
```
Semua service mikro dan frontend akan berjalan secara otomatis. Anda dapat membuka frontend di browser melalui alamat:
👉 **[http://localhost:5173](http://localhost:5173)**

Untuk mematikan container:
```bash
npm run docker:down
```

---

### Opsi B: Menjalankan Secara Lokal (Tanpa Docker)

#### 1. Instalasi Dependensi
Instal seluruh package dependency untuk root project serta semua sub-microservices sekaligus dengan perintah:
```bash
npm run install-all
```

#### 2. Konfigurasi Environment Variables (`.env`)
Salin file `.env.example` menjadi `.env` di setiap direktori service berikut dan sesuaikan konfigurasinya (seperti password database PostgreSQL lokal Anda):
- `api-gateway/.env`
- `auth-service/.env`
- `rbac-service/.env`
- `data-master-service/.env`
- `transaksi-service/.env`

#### 3. Inisialisasi Database
Jalankan pembuatan database dan tabel lokal:
```bash
npm run init-db
```

#### 4. Jalankan Aplikasi
Jalankan seluruh service backend dan frontend secara bersamaan menggunakan:
```bash
npm run dev
```
Aplikasi frontend akan tersedia di:
👉 **[http://localhost:5173](http://localhost:5173)**

---

## 📂 Dokumentasi API & Postman
Gunakan Postman Collection yang sudah disediakan di folder root untuk menguji API endpoint dari setiap service:
- File Postman: `Dompet_PNBP.postman_collection.json`
