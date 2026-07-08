# Dompet PNBP Microservices System

Sistem manajemen Dompet Penerimaan Negara Bukan Pajak (PNBP) berbasis arsitektur microservices. Proyek ini mengintegrasikan beberapa layanan microservices backend menggunakan Node.js/Express dan frontend berbasis React (Vite + TypeScript + Tailwind CSS).

---

## 🏗️ Arsitektur & Teknologi

### Teknologi Utama:
- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS (v3), Axios, Lucide React
- **Backend (Microservices)**: Node.js, Express, JSON Web Token (JWT)
- **Database**: PostgreSQL 16 (Containerized via Docker)
- **Containerization**: Docker & Docker Compose
- **Gateway**: API Gateway untuk routing request dari frontend ke microservices backend.

### Struktur Layanan (Microservices & Port):
| Nama Service | Deskripsi | Port Default |
| :--- | :--- | :---: |
| **postgres** | Database PostgreSQL (containerized) | `5433` (host) → `5432` (container) |
| **init-db** | Auto-create database, tabel & seed data (run once) | - |
| **api-gateway** | Gateway utama sebagai gerbang masuk request API | `4000` |
| **auth-service** | Mengelola autentikasi user, registrasi, login, & blacklist JWT | `4001` |
| **rbac-service** | Mengelola Role-Based Access Control (RBAC) & role user | `4002` |
| **data-master-service** | Mengelola data master produk/layanan | `4003` |
| **transaksi-service** | Mengelola transaksi pembelian, cart, & tagihan Simponi Billing | `4004` |
| **frontend** | Aplikasi antarmuka pengguna (React Vite Web App) | `5173` |

---

## 🛠️ Prasyarat (Prerequisites)

Sebelum menjalankan aplikasi, pastikan Anda telah memasang:
1. **Docker Desktop** (Wajib - semua service termasuk database berjalan di Docker)
2. **Node.js** (Opsional - hanya jika ingin menjalankan secara lokal tanpa Docker)

> **Catatan:** Anda **TIDAK perlu** menginstal PostgreSQL secara lokal. Database PostgreSQL sudah disediakan otomatis di dalam Docker container.

---

## 🚀 Cara Menjalankan Aplikasi

### ✅ Opsi A: Satu Perintah dengan Docker (Direkomendasikan)

Cukup **satu perintah** untuk menjalankan semuanya (database + init tabel + seed data + semua service + frontend):

```bash
npm start
```

Perintah ini akan secara otomatis:
1. ✅ Menjalankan container **PostgreSQL**
2. ✅ Membuat database (`auth_service_db`, `rbac_service_db`, `data_master_service_db`, `transaksi_service_db`)
3. ✅ Membuat semua tabel yang diperlukan
4. ✅ Mengisi data awal (seed users, roles, produk)
5. ✅ Menjalankan semua microservices backend
6. ✅ Menjalankan frontend

Setelah semua container berjalan, buka browser:
👉 **[http://localhost:5173](http://localhost:5173)**

#### Melihat Logs
```bash
npm run logs
```

#### 🛑 Menghentikan & Menghapus Semua Container (Satu Perintah)
```bash
npm stop
```
> Perintah ini akan **menghentikan** semua container, **menghapus** container, dan **menghapus volume** database. Saat `npm start` dijalankan kembali, database akan dibuat ulang dari awal.

---

### Opsi B: Menjalankan Secara Lokal (Tanpa Docker)

#### 1. Instalasi Dependensi
```bash
npm run install-all
```

#### 2. Konfigurasi Environment Variables (`.env`)
Salin file `.env.example` menjadi `.env` di setiap direktori service berikut dan sesuaikan konfigurasinya:
- `api-gateway/.env`
- `auth-service/.env`
- `rbac-service/.env`
- `data-master-service/.env`
- `transaksi-service/.env`

#### 3. Inisialisasi Database
Pastikan PostgreSQL lokal Anda berjalan di port `5432`, kemudian jalankan:
```bash
npm run init-db
```

#### 4. Jalankan Aplikasi
```bash
npm run dev
```

Aplikasi frontend akan tersedia di:
👉 **[http://localhost:5173](http://localhost:5173)**

---

## 🔐 Data User Login (Default)

Berikut adalah akun user default yang sudah di-seed saat inisialisasi database:

| Role | Nama | Email | Password |
| :---: | :--- | :--- | :---: |
| **ADMIN** | Andi Pratama | `admin@mail.com` | `password123` |
| **PEMBELI** | Siti Rahmawati | `pembeli@mail.com` | `password123` |

> **Catatan:** Password di atas adalah plain text yang akan di-hash (bcrypt) secara otomatis saat proses seeding database.

### Cara Login:
1. Buka **[http://localhost:5173](http://localhost:5173)**
2. Masukkan **Email** dan **Password** dari tabel di atas
3. Klik **Login**

### Perbedaan Hak Akses:
| Fitur | ADMIN | PEMBELI |
| :--- | :---: | :---: |
| Kelola Data Master (CRUD Produk) | ✅ | ❌ |
| Lihat Daftar Produk | ✅ | ✅ |
| Buat Transaksi / Keranjang | ❌ | ✅ |
| Kelola User (CRUD) | ✅ | ❌ |
| Lihat Profil Sendiri | ✅ | ✅ |

---

## 📋 Ringkasan Perintah

| Perintah | Deskripsi |
| :--- | :--- |
| `npm start` | 🚀 Jalankan semua (DB + init + services + frontend) |
| `npm stop` | 🛑 Hentikan & hapus semua container + volume |
| `npm run logs` | 📋 Lihat logs semua container |
| `npm run dev` | 💻 Jalankan secara lokal (tanpa Docker) |
| `npm run init-db` | 🗄️ Inisialisasi database (untuk mode lokal) |
| `npm run install-all` | 📦 Install semua dependensi (untuk mode lokal) |

---

## 📂 Dokumentasi API & Postman
Gunakan Postman Collection yang sudah disediakan di folder root untuk menguji API endpoint dari setiap service:
- File Postman: `Dompet_PNBP.postman_collection.json`

---

## 🐳 Konfigurasi Database Docker

| Parameter | Nilai |
| :--- | :--- |
| **Image** | `postgres:16-alpine` |
| **User** | `postgres` |
| **Password** | `password123!` |
| **Host Port** | `5433` |
| **Container Port** | `5432` |
| **Databases** | `auth_service_db`, `rbac_service_db`, `data_master_service_db`, `transaksi_service_db` |

> Anda dapat mengakses database dari host menggunakan tool seperti pgAdmin atau DBeaver di `localhost:5433` dengan kredensial di atas.
