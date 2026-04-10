# Escape Plan Project Roadmap (TODO)

Daftar tugas untuk membangun MVP Escape Plan yang solid.

## 🛠️ Fase 1: Fondasi Backend & Database (Completed)
- [x] **Refactor Database Schema:** Relasi Glamping-Unit, UnitAvailability optimization, commission_rate.
- [x] **Auth System:** Multi-role (Customer, Partner, Admin), Profile management, Partner Approval system (is_verified).

## 🎨 Fase 2: Frontend & UI/UX (Completed)
- [x] **New Visual Identity:** Forest Luxury theme (#26503e), refined typography, and enhanced "Liquid Glass" effects.
- [x] **Customer Flow:** Search, Results, Detail, Booking (Midtrans Snap), and My Journeys page.
- [x] **Mobile Responsiveness:** All customer-facing pages (Detail, Search, My Trips) optimized for mobile.
- [x] **Real-time UX:** Countdown timer and automatic cancellation UI for pending bookings.
- [x] **Navbar Layout:** Spacing tuned for edge-to-edge layout per feedback.
- [x] **Sticky Booking Widget:** Reserve panel follows scroll on detail page.
- [ ] **Bilingual UI (ID/EN):** Completed for Home, Auth, Search, Glamping Detail, Booking, Booking Detail, Booking Success, Navbar/Footer, Admin/Partner layout; remaining pages still pending.

## 🏢 Fase 3: Partner Dashboard (Completed)
- [x] **Listing Management:** Full CRUD for Glampings & Units with MediaUpload.
- [x] **Availability Calendar:** Dynamic selection and tomorrow-only block validation.
- [x] **Partner Settings:** Identity and Financial/Bank account management.
- [x] **Data Isolation:** All data scoped to authenticated partner.

## 🛡️ Fase 4: Admin Dashboard (Completed)
- [x] **Queue System:** Verification queue for Partners and Listing approvals.
- [x] **User Control:** Full user management with status toggles.
- [x] **Monitoring:** System-wide transaction and booking monitor.

## 🧪 Fase 5: Testing & Deployment (In Progress)
- [x] **Production Build:** Initial compilation and build fixes.
- [ ] **Code Quality:** Fix 134 ESLint/TypeScript errors currently ignored in `next.config.ts`.
- [ ] **Unit Testing:** Logic perhitungan harga and ketersediaan.
- [ ] **Integration Testing:** Full booking journey verification.
- [ ] **Deployment:** Setup staging environment.

---
*Status: MVP Core features are 100% implemented and visually polished.*
