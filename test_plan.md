# Escape Plan - Test Plan Document

Dokumen ini berisi rencana pengujian (Test Plan) untuk memastikan kualitas dan keandalan platform Escape Plan Glamping OTA.

## 👥 Akun Uji Coba (Test Accounts)
| Role | Email | Password | Kegunaan |
|------|-------|----------|----------|
| **Admin** | `admin@escapeplan.com` | `password` | Verifikasi listing, cek statistik platform |
| **Partner 1** | `partner1@escapeplan.com` | `password` | Kelola glamping di Bandung (Lembang/Ciwidey) |
| **Partner 2** | `partner2@escapeplan.com` | `password` | Kelola glamping di Bogor & Bali |
| **Customer 1** | `customer1@escapeplan.com` | `password` | Simulasi booking & cek riwayat pesanan |
| **Customer 2** | `customer2@escapeplan.com` | `password` | Pengujian booking bersamaan (double booking) |

---

## 📊 Data Seeded (Default)
1. **Pine Forest Lembang** (Bandung) - 10 Standard Tents, 4 Cabins.
2. **Sunrise Rancabali** (Ciwidey) - Lakeside view.
3. **Mountain Retreat Puncak** (Bogor).
4. **Kintamani Volcanic Stay** (Bali).

*Catatan: Ada booking aktif untuk Alice Guest di Pine Forest Lembang (check-in 2 hari lagi).*

---

## 🔑 1. Autentikasi & Profil (All Roles)
| ID | Skenario | Langkah | Hasil yang Diharapkan |
|----|----------|---------|-----------------------|
| AUTH-01 | Registrasi Partner | Daftar dengan email baru, pilih role 'Partner' | Data tersimpan di DB, dialihkan ke Partner Onboarding |
| AUTH-02 | Login Multi-role | Login dengan akun Admin/Partner/Customer | Redirect otomatis ke Dashboard yang sesuai |
| AUTH-03 | Update Profil | Ubah nama, nomor telepon, dan data Bank | Perubahan tersimpan dan muncul di UI profil |
| AUTH-04 | Keamanan Middleware | Akses URL `/admin` dengan akun Customer | Muncul error 403 Forbidden |

---

## 🔍 2. Pencarian & Discovery (Customer)
| ID | Skenario | Langkah | Hasil yang Diharapkan |
|----|----------|---------|-----------------------|
| SRCH-01 | Filter Lokasi | Cari "Bandung" di search bar | Hanya menampilkan glamping di area Bandung |
| SRCH-02 | Filter Ketersediaan | Masukkan tanggal 14-16 Feb (tanggal yang sudah di-book) | Unit yang penuh tidak muncul di hasil pencarian |
| SRCH-03 | Detail Unit | Klik salah satu glamping dari hasil pencarian | Menampilkan foto, fasilitas, dan daftar unit yang tersedia |

---

## 💳 3. Alur Booking & Pembayaran (Customer -> Midtrans)
| ID | Skenario | Langkah | Hasil yang Diharapkan |
|----|----------|---------|-----------------------|
| BOOK-01 | Reservasi Unit | Pilih unit -> Isi form booking -> Klik "Pay & Book" | Muncul popup Midtrans Snap dengan nominal benar |
| BOOK-02 | Pembayaran Sukses | Selesaikan pembayaran di simulator Midtrans | Status booking berubah jadi 'Paid', masuk ke riwayat 'My Trips' |
| BOOK-03 | Pembayaran Gagal/Batal | Klik 'Pay' lalu tutup popup Snap tanpa bayar | Status booking tetap 'Unpaid', stok unit tidak berkurang permanen |
| BOOK-04 | Double Booking | Dua user mencoba book unit terakhir di tanggal yang sama secara bersamaan | User pertama berhasil, user kedua mendapat pesan "Unit no longer available" |

---

## 🏕️ 4. Manajemen Properti (Partner)
| ID | Skenario | Langkah | Hasil yang Diharapkan |
|----|----------|---------|-----------------------|
| PTNR-01 | Tambah Listing | Create glamping baru (nama, slug, foto) | Muncul di daftar glamping partner dengan status 'Pending' |
| PTNR-02 | Set Ketersediaan | Block tanggal tertentu di kalender unit | Tanggal tersebut tidak bisa dipilih oleh customer di frontend |
| PTNR-03 | Pantau Pendapatan | Cek Dashboard Partner setelah ada booking sukses | Angka 'Total Revenue' bertambah sesuai nominal booking |

---

## 🛡️ 5. Moderasi & Keuangan (Admin)
| ID | Skenario | Langkah | Hasil yang Diharapkan |
|----|----------|---------|-----------------------|
| ADMN-01 | Persetujuan Listing | Admin menyetujui glamping berstatus 'Pending' | Status berubah jadi 'Active' dan muncul di halaman pencarian |
| ADMN-02 | Verifikasi KYC | Admin mengecek data bank partner dan menyetujui | Partner mendapatkan akses untuk fitur Payout |
| ADMN-03 | Pantau Transaksi | Cek semua log transaksi dari semua partner | Menampilkan data transaksi secara akurat dan komisi platform |

---

## 🧪 6. Pengujian Integrasi & Edge Cases
- **Midtrans Webhook:** Pastikan saat Midtrans mengirim notifikasi sukses, backend Laravel mengupdate status di DB tanpa interaksi user.
- **Dynamic Pricing:** Pastikan harga otomatis berubah jika menginap melewati rentang Weekend (Jumat-Minggu).
- **Session Timeout:** Pastikan user yang tokennya habis otomatis diarahkan kembali ke halaman login.

---

## 🛠 Alat yang Digunakan
- **Postman:** Pengujian endpoint API secara terpisah.
- **Midtrans Simulator:** Simulasi pembayaran (Sandbox).
- **Laravel Pint & PHPUnit:** Pengujian unit dan integrasi di sisi backend.
- **React Testing Library:** Pengujian komponen frontend.
