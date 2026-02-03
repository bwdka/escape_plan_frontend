# Escape Plan API Documentation

## Global Standards
- **Base URL:** `https://api.escapeplan.com/api/v1`
- **Content-Type:** `application/json`
- **Accept:** `application/json`
- **Date Format:** `YYYY-MM-DD` (ISO 8601)
- **Authentication:** Bearer Token (Laravel Sanctum)

---

## 1. Authentication (Auth)

### A. Register
Mendaftar sebagai Customer atau Partner.

- **Endpoint:** `POST /auth/register`
- **Request Body:**
```json
{
    "name": "Fauzan Developer",
    "email": "fauzan@example.com",
    "password": "password123",
    "password_confirmation": "password123",
    "role": "customer", // enum: 'customer', 'partner'
    "phone": "6281234567890"
}
```
- **Response (201 Created):**
```json
{
    "meta": {
        "code": 201,
        "status": "success",
        "message": "User registered successfully"
    },
    "data": {
        "user": {
            "id": 1,
            "name": "Fauzan Developer",
            "email": "fauzan@example.com",
            "role": "customer"
        },
        "token": "1|laravel_sanctum_token_string..."
    }
}
```

### B. Login
- **Endpoint:** `POST /auth/login`
- **Request Body:**
```json
{
    "email": "fauzan@example.com",
    "password": "password123"
}
```
- **Response (200 OK):** (Same structure as Register, returns token)

---

## 2. Public / Discovery (Customer)

### A. Search & Filter Glampings
- **Endpoint:** `GET /glampings`
- **Query Parameters:**
  - `location`: string (e.g., "Bogor")
  - `check_in`: `YYYY-MM-DD`
  - `check_out`: `YYYY-MM-DD`
  - `guests`: integer
  - `vibe`: string (comma separated: riverside,forest)
  - `min_price`: integer
  - `max_price`: integer
  - `page`: integer (default: 1)
- **Response (200 OK):**
```json
{
    "data": [
        {
            "id": 101,
            "slug": "escape-bogor-riverside",
            "name": "Escape Bogor Riverside",
            "location_city": "Bogor",
            "thumbnail_url": "https://cdn.../img.jpg",
            "price_start_from": 500000,
            "rating": 4.8,
            "review_count": 120,
            "vibes": ["Riverside", "Couple"]
        }
    ],
    "links": { ... },
    "meta": { ... }
}
```

### B. Get Glamping Detail
Halaman detail lengkap termasuk list unit tipe tenda yang tersedia.

- **Endpoint:** `GET /glampings/{slug}`
- **Response (200 OK):**
```json
{
    "data": {
        "id": 101,
        "name": "Escape Bogor Riverside",
        "description": "Glamping mewah pinggir sungai...",
        "address": "Jl. Raya Puncak No. 1...",
        "latitude": -6.5971469,
        "longitude": 106.799513,
        "policy": {
            "check_in": "14:00",
            "check_out": "12:00",
            "is_pet_friendly": false
        },
        "amenities": [
            { "icon": "wifi", "name": "Free WiFi" },
            { "icon": "fire", "name": "Bonfire" }
        ],
        "gallery": [
            { "url": "...", "caption": "Front View" }
        ],
        "weather_code": "bogor_selatan",
        "units": [
            {
                "id": 5,
                "name": "VIP Tent (River View)",
                "capacity": 4,
                "price_per_night": 750000,
                "max_stock": 5,
                "available_stock": 2,
                "photos": ["..."]
            }
        ],
        "addons": [
            {
                "id": 1,
                "name": "BBQ Set (4 Pax)",
                "price": 150000,
                "unit": "per_package"
            }
        ]
    }
}
```

---

## 3. Booking & Transaction

### A. Calculate Price (Pre-Booking)
Cek harga total sebelum user klik "Pay", termasuk diskon & service fee.

- **Endpoint:** `POST /bookings/calculate`
- **Request Body:**
```json
{
    "unit_id": 5,
    "check_in": "2026-03-10",
    "check_out": "2026-03-11",
    "quantity": 1,
    "addons": [
        { "id": 1, "qty": 1 }
    ],
    "promo_code": "HEMAT100"
}
```
- **Response (200 OK):**
```json
{
    "data": {
        "base_price": 750000,
        "addons_price": 150000,
        "discount_amount": 75000,
        "service_fee": 10000,
        "tax_amount": 83500,
        "total_price": 918500,
        "breakdown": [
            { "label": "1 Night x 1 Unit", "value": 750000 },
            { "label": "Service Fee", "value": 10000 }
        ]
    }
}
```

### B. Create Booking (Checkout)
- **Endpoint:** `POST /bookings`
- **Header:** `Authorization: Bearer <token>`
- **Request Body:**
```json
{
    "unit_id": 5,
    "check_in": "2026-03-10",
    "check_out": "2026-03-11",
    "total_guests": 2,
    "customer_name": "Fauzan",
    "customer_phone": "08123...",
    "customer_email": "fauzan@email.com",
    "special_request": "Minta tenda dekat sungai",
    "addons": [{ "id": 1, "qty": 1 }],
    "promo_code": "HEMAT100"
}
```
- **Response (201 Created):**
```json
{
    "data": {
        "booking_code": "ESC-20260310-XYZ",
        "status": "UNPAID",
        "expired_at": "2026-02-04T10:00:00Z",
        "snap_token": "midtrans_snap_token_here",
        "payment_url": "https://app.sandbox.midtrans.com/snap/..."
    }
}
```

### C. Get My Bookings (History)
- **Endpoint:** `GET /bookings/my-trips`
- **Response:** List booking user dengan status (`PAID`, `UNPAID`, `COMPLETED`, `CANCELLED`).

---

## 4. Partner Panel (Owner)

### A. Dashboard Stats
- **Endpoint:** `GET /partner/dashboard`
- **Response (200 OK):**
```json
{
    "data": {
        "active_glampings": 1,
        "bookings_this_month": 15,
        "revenue_this_month": 15000000,
        "upcoming_checkins": 3
    }
}
```

### B. Calendar Availability (Sync View)
Mengambil data booking (Web) + blokir manual + iCal import untuk ditampilkan di kalender.

- **Endpoint:** `GET /partner/calendar`
- **Query Params:** `glamping_id`, `month`, `year`
- **Response (200 OK):**
```json
{
    "data": [
        {
            "date": "2026-03-10",
            "status": "fully_booked", // or 'partial', 'blocked', 'available'
            "details": [
                {
                    "unit_name": "VIP Tent",
                    "stock_left": 0,
                    "bookings": [
                        { "guest_name": "Budi", "source": "EscapePlan" }
                    ]
                }
            ]
        }
    ]
}
```

### C. Manual Block Date (Close Date)
Owner menutup tanggal karena ada acara keluarga/renovasi.

- **Endpoint:** `POST /partner/calendar/block`
- **Request Body:**
```json
{
    "unit_id": 5,
    "start_date": "2026-04-01",
    "end_date": "2026-04-03",
    "reason": "Maintenance Tenda"
}
```
- **Response:** 200 OK (Jika sukses) atau 422 Unprocessable Entity (Jika sudah ada booking masuk di tanggal itu).

### D. Manage iCal Sync
Mengatur link iCal untuk sync.

- **Endpoint:** `POST /partner/glampings/{id}/ical`
- **Request Body:**
```json
{
    "platform_name": "Airbnb",
    "ical_url": "https://airbnb.com/calendar/ical/..."
}
```
- **Response (200 OK):**
```json
{
    "data": {
        "import_status": "active",
        "export_url": "https://api.escapeplan.com/ical/export/glamping-101.ics"
    }
}
```

---

## 5. Webhook (Midtrans)
Endpoint ini TIDAK dipanggil oleh Frontend, tapi oleh server Midtrans.

- **Endpoint:** `POST /webhooks/payment-notification`
- **Logic:**
  1. Terima payload JSON dari Midtrans.
  2. Verifikasi Signature Key (Security).
  3. Cek `transaction_status`:
     - `settlement` / `capture`: Update booking jadi `PAID`, kurangi stok unit, kirim email tiket.
     - `expire` / `cancel`: Update booking jadi `CANCELLED`, balikin stok unit.
- **Response:** 200 OK (Wajib return 200 biar Midtrans gak retry terus).

---

## Notes untuk Frontend Dev (Next.js)

- **Handling 401:** Jika API return 401 Unauthorized, redirect user ke halaman Login.
- **Handling Validation (422):** Laravel return format error standar:
```json
{
    "message": "The given data was invalid.",
    "errors": {
        "email": ["The email has already been taken."],
        "password": ["The password must be at least 8 characters."]
    }
}
```
Map errors object ini ke form input field di React Hook Form.
- **Images:** Semua URL gambar dari API sudah full path (misal: `https://s3.aws.../img.jpg`), jadi tinggal masukin ke `<Image src={...} />`.
