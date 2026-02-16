# Escape Plan - Glamping OTA Platform

Escape Plan adalah platform Online Travel Agency (OTA) khusus untuk penyewaan glamping. Platform ini menghubungkan pelanggan (Customer) dengan pemilik glamping (Partner) melalui sistem manajemen yang terintegrasi (Admin).

## 🚀 Peran Pengguna (Roles)

### 1. Customer (Wisatawan)
- **Cari & Filter:** Mencari glamping berdasarkan lokasi, tanggal ketersediaan, jumlah tamu, dan fasilitas.
- **Booking & Payment:** Melakukan reservasi dan pembayaran melalui payment gateway.
- **Manage Booking:** Melihat riwayat pesanan, status pembayaran, dan e-ticket.
- **Review:** Memberikan rating dan ulasan setelah menginap.

### 2. Partner (Pemilik Glamping)
- **Listing Management:** Mengelola profil glamping, foto, lokasi, dan fasilitas.
- **Unit Management:** Mengatur tipe-tipe unit (tenda/kamar), harga per malam, dan jumlah unit.
- **Availability Calendar:** Mengatur ketersediaan tanggal dan harga dinamis (weekend/weekday).
- **Booking Management:** Melihat daftar tamu yang akan datang dan riwayat transaksi.
- **Wallet & Payout:** Memantau penghasilan dan mengajukan penarikan dana (payout).

### 3. Admin (Platform Operator)
- **Moderasi Listing:** Menyetujui atau menolak pendaftaran glamping baru dari Partner.
- **User Management:** Mengelola data customer dan partner.
- **Financial Monitoring:** Memantau perputaran uang, komisi platform, dan verifikasi payout.
- **Dispute Resolution:** Menangani masalah antara customer dan partner.

---

## 🔄 Alur Aplikasi (Flow)

### A. Alur Reservasi (Booking Flow)
1. **Pencarian:** Customer mencari lokasi dan memasukkan tanggal.
2. **Ketersediaan:** Sistem mengecek `UnitAvailability` untuk memastikan unit tidak penuh pada tanggal tersebut.
3. **Checkout:** Customer memilih unit, mengisi data diri, dan melihat rincian biaya (termasuk biaya layanan).
4. **Pembayaran:** Customer membayar via Payment Gateway. Status pesanan berubah menjadi `Paid`.
5. **Notifikasi:** Partner mendapatkan notifikasi pesanan masuk.
6. **Check-in:** Customer datang ke lokasi. Dana masih ditahan oleh platform (Escrow).
7. **Payout:** Setelah H+1 check-in tanpa komplain, dana diteruskan ke `PartnerWallet` (setelah dipotong komisi).

### B. Alur Onboarding Partner
1. Partner mendaftar dan mengisi profil bisnis.
2. Partner menambahkan lokasi glamping dan unit-unitnya.
3. Admin memverifikasi kelayakan listing.
4. Listing muncul di halaman pencarian customer.

---

## 🧪 Rencana Test Case (MVP)

### 1. Booking & Availability
- [ ] Pastikan unit yang sudah dipesan di tanggal X tidak muncul lagi di hasil pencarian tanggal X.
- [ ] Pastikan perhitungan total harga benar (Harga per malam * jumlah malam + service fee).
- [ ] Pastikan status booking berubah otomatis setelah pembayaran sukses (Webhook Payment Gateway).

### 2. Partner Dashboard
- [ ] Pastikan partner tidak bisa melihat data pesanan milik partner lain.
- [ ] Pastikan kalender ketersediaan tersinkronisasi dengan booking yang masuk.

### 3. Keamanan & Bisnis
- [ ] Pastikan komisi platform terpotong secara otomatis sebelum masuk ke dompet partner.
- [ ] Pastikan hanya role Admin yang bisa menyetujui penarikan dana (payout).

---

## 📊 Aspek Bisnis
- **Revenue Stream:** Komisi X% dari setiap transaksi sukses.
- **Value Proposition:** Kemudahan pencarian glamping yang terkurasi dan sistem pembayaran yang aman (Escrow).
- **Retention:** Sistem review untuk menjaga kualitas layanan dari partner.
