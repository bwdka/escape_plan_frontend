# Gemini Memory - Escape Plan

## Project Overview
Escape Plan adalah platform OTA Glamping dengan 3 role: Customer, Partner, Admin.

## Database & Models Context
- **Database:** `escape_plan_v2` (MySQL).
- **Relasi Utama:** 
    - `Glamping` (1) <-> (M) `GlampingUnit`.
    - `GlampingUnit` (1) <-> (M) `UnitAvailability`.
- **UnitAvailability:** Digunakan untuk melacak stok dan harga khusus per tanggal. Menggunakan kolom `price_override` dan `stock_available`.
- **Komisi:** Platform mengambil komisi sebesar 10% (default) yang disimpan di kolom `commission_rate` pada tabel `glampings`.
- **Roles:** Menggunakan Enum `App\Enums\UserRole` (admin, partner, customer).

## Backend Setup
- **Framework:** Laravel 12.
- **Auth:** Laravel Sanctum dengan multi-role support.
- **Middleware:** `role:admin`, `role:partner`, dll (alias `role` terdaftar di `bootstrap/app.php`).
- **Media:** Menggunakan `glamping_images` table untuk galeri foto.

## Endpoint Synchronization (FE & BE)
| Feature | Method | Endpoint |
|---------|--------|----------|
| Login   | POST   | `/api/auth/login` |
| Register| POST   | `/api/auth/register` |
| Logout  | POST   | `/api/auth/logout` |
| Profile | GET    | `/api/profile` |
| Update Profile | PUT | `/api/profile` |

## Poin Penting Fase 1
- Database sudah direfaktor dengan `commission_rate` dan `price_override`.
- Auth Controller sudah mendukung Register, Login, Profile, dan Update Profile.
- Route API sudah tertata di `routes/api.php`.

## Repository Info
- **Backend:** `escape_plan_workspace` (Laravel 12)
- **Frontend Baru:** `escape-plane-frontend` (Next.js 15, Rathoni Repository)

## Poin Penting Fase 2
- **Landing Page:** Sudah terhubung ke API (useGlampings).
- **Search Logic:** Backend sudah mendukung filter ketersediaan (`check_in`, `check_out`).
- **Detail Page:** Sinkronisasi data antara `GlampingDetailResource` (BE) dan interface `Glamping` (FE).
- **Booking Flow:** Mendukung pemilihan unit dan integrasi Midtrans Snap (Real Token).
- **Partner Dashboard:** Overview stats sinkron (revenue, bookings, check-ins).

## Poin Penting Fase 3 & 4
- **Partner Verification:** Implementasi `is_verified` pada user. Partner baru default unverified dan diblokir middleware `verified_partner`.
- **Media Upload:** Komponen `MediaUpload` terintegrasi dengan API backend `/media/upload`.
- **Admin Control:** Halaman verifikasi admin untuk menyetujui partner baru dan listing glamping.
- **Dynamic Calendar:** Calendar partner kini mengambil data riil dari unit glamping yang dipilih.

## Catatan Teknis
- Middleware `verified_partner` terdaftar di `bootstrap/app.php` dan diaplikasikan pada grup rute `/api/partner`.
- Hubungan `images` pada `Glamping` direfaktor menjadi `glampingImages` untuk menghindari tabrakan dengan kolom JSON legacy.
- Jika terjadi error `Tablespace for table exists` saat migrasi, gunakan database baru atau hapus file `.ibd` manual di data directory MySQL.
- Payout dilakukan setelah H+1 check-in (Escrow system).
