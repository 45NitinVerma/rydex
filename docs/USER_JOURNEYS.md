# 🗺️ User Journeys — All Roles

**Product:** Rydex  
**Version:** 1.0

---

## Role 1: Passenger (User)

### Journey 1.1 — First-Time Registration & Booking

```
[Landing Page]
    │
    ├─ Clicks "Sign Up"
    │       ↓
    │   [Auth Modal] — Email + Password
    │       ↓
    │   OTP sent to email → User enters OTP
    │       ↓
    │   Email Verified ✓ | Role = "user"
    │
    ├─ OR "Sign in with Google" → Instant access
    │
    ↓
[Home / PublicHome]
    │
    ├─ Selects vehicle type (bike / car / auto / loading / truck)
    │       ↓
    │   [Search Page]
    │       ↓
    │   Enters Pickup & Drop locations (map + text)
    │       ↓
    │   Available vehicles listed with fare estimate
    │       ↓
    │   Selects a vehicle → clicks "Book"
    │
    ↓
[Booking Created] — status: "idle" → "requested"
    │   System finds nearby online partners
    │   Sends `booking-request` socket event to drivers
    │
    ↓
[Waiting for Driver Response]
    │
    ├─ Driver Accepts → status: "awaiting_payment"
    │       ↓
    │   [Checkout Page]
    │       ├─ Pay via Razorpay → payment verified → status: "confirmed"
    │       └─ Pay via Cash → status: "confirmed"
    │
    ↓
[Confirmed Ride]
    │   Driver en route to pickup
    │   User tracks driver on live map
    │
    ↓
[Driver Arrives]
    │   User shares Pickup OTP → Driver enters it
    │   status: "started"
    │
    ↓
[Active Ride]
    │   User sees live driver location on map
    │   In-ride chat available with driver
    │
    ↓
[Trip Ends]
    │   Driver enters Drop OTP → User confirms
    │   status: "completed"
    │
    ↓
[Completed Screen] — summary, fare details shown
```

---

### Journey 1.2 — View Booking History

```
[Nav] → "My Bookings"
    ↓
[Bookings Page] — lists all past bookings
    ↓
Tap a booking → view status, fare, driver, vehicle info
```

---

## Role 2: Driver-Partner

### Journey 2.1 — Onboarding (New Partner)

```
[Home] — Authenticated as regular User
    │
    ├─ Clicks "Become a Partner" / navigates to onboarding
    │
    ↓
[Step 1] — Personal Details
    │   Name, mobile number, etc.
    │
    ↓
[Step 2] — Upload Aadhaar
    │   Image upload → stored on Cloudinary
    │
    ↓
[Step 3] — Upload RC (Vehicle Registration Certificate)
    │
    ↓
[Step 4] — Upload Driving License
    │
    ↓
[Admin Reviews Docs] ← async step
    │
    ├─ Rejected → Partner notified with reason → re-upload
    │
    ↓ Approved
[Step 5] — Add Vehicle Details
    │   Type, model, number plate, image
    │   Pricing: baseFare, pricePerKM, waitingCharge
    │
    ↓
[Step 6] — Add Bank Account
    │   Account holder, account number, IFSC, UPI (optional)
    │
    ↓
[Step 7] — Video KYC
    │   Admin schedules / initiates ZegoCloud session
    │   Partner joins video call
    │   Admin approves / rejects live
    │
    ↓ Approved
[Partner Activated] — role = "partner", partnerStatus = "approved"
```

---

### Journey 2.2 — Receiving & Fulfilling a Ride

```
[Partner Dashboard]
    │   Status: Online (isOnline = true)
    │   Location continuously streamed via socket
    │
    ↓
[Incoming Ride Request]
    │   Socket event: `booking-request`
    │   Panel shows: pickup, drop, fare, user phone
    │
    ├─ Partner clicks "Accept"
    │       ↓
    │   Booking: status → "awaiting_payment"
    │   User notified via socket
    │
    ├─ Partner clicks "Reject"
    │       ↓
    │   Booking: status → "rejected"
    │   User notified
    │
    ↓ (After Accept)
[Pending Requests / Active Ride View]
    │   Partner navigates to pickup address
    │
    ↓
[At Pickup Location]
    │   Partner enters Pickup OTP (from user)
    │   status → "started"
    │
    ↓
[Active Ride]
    │   Partner's location streamed to user in real time
    │   In-ride chat with user available
    │
    ↓
[At Drop Location]
    │   User shares Drop OTP → Partner enters it
    │   status → "completed"
    │   partnerAmount credited to earnings
    │
    ↓
[Back to Dashboard] — awaiting next request
```

---

### Journey 2.3 — View Earnings

```
[Partner Dashboard] → "Earnings" tab
    ↓
[Partner Earning Page]
    │   Total earned, per-ride breakdown
    │   Admin commission deducted, net shown
    ↓
Scroll through ride-wise earnings history
```

---

## Role 3: Admin

### Journey 3.1 — Daily Operations Dashboard

```
[Admin Dashboard] — auto-redirected on login (role = "admin")
    │
    ├─ KPI Cards:
    │   • Total Rides (completed)
    │   • Platform Earnings (total commission)
    │   • Active Partners
    │   • Pending KYC Reviews
    │
    ├─ Quick Actions:
    │   • Pending KYC → navigate to review queue
    │   • Video KYC sessions → manage active calls
    │   • Earnings breakdown → analytics view
```

---

### Journey 3.2 — KYC Document Review

```
[Admin Dashboard] → KYC Queue
    ↓
[List of Partners with status = "pending"]
    │
    ↓ Select a Partner
[Partner Detail View]
    │   Preview: Aadhaar, RC, Driving License (Cloudinary images)
    │
    ├─ Click "Approve"
    │       ↓
    │   PartnerDocs.status → "approved"
    │   Partner.partnerOnboardingSteps incremented
    │   Partner notified
    │
    └─ Click "Reject" + enter reason
            ↓
        PartnerDocs.status → "rejected"
        rejectionReason saved
        Partner notified → asked to re-upload
```

---

### Journey 3.3 — Video KYC Session

```
[Admin Dashboard] → "Video KYC" section
    ↓
[List of partners with videoKycStatus = "pending"]
    │
    ↓ Select Partner → "Initiate KYC"
[ZegoCloud Room Created]
    │   Admin joins video call
    │   Partner is notified and joins at /video-kyc
    │
    │   Admin verifies identity live
    │
    ├─ Approve → videoKycStatus → "approved"
    │            partnerStatus  → "approved" (if all steps complete)
    │
    └─ Reject  → videoKycStatus → "rejected"
                 videoKycRejectionReason saved
```

---

### Journey 3.4 — Platform Earnings Review

```
[Admin Dashboard] → "Earnings" tab
    ↓
[Admin Earning Page]
    │   Total platform commission (sum of adminCommission across bookings)
    │   Per-partner breakdown
    │   Filterable by date range / partner
    ↓
Export or share report (future scope)
```

---

## Booking Lifecycle — Cross-Role View

```
         USER                    SYSTEM                  PARTNER
          │                        │                        │
          │── Book Ride ──────────►│                        │
          │                        │── Notify drivers ─────►│
          │                        │                        │── Accept ──┐
          │◄─── Driver Accepted ───│◄────────────────────── │            │
          │                        │                        │            │
          │── Pay (Razorpay/Cash) ►│                        │            │
          │◄── Confirmed ──────────│───── Confirmed ────────►│           │
          │                        │                        │            │
          │   [Driver en route]    │                        │            │
          │◄── Live Location ──────│◄── Location Stream ────│            │
          │                        │                        │            │
          │── Share Pickup OTP ───►│◄── Enter Pickup OTP ───│            │
          │◄── Ride Started ───────│───── Ride Started ─────►│           │
          │                        │                        │            │
          │   [Ride in progress]   │                        │            │
          │◄── Live Location ──────│◄── Location Stream ────│            │
          │◄──► In-ride Chat ─────►│◄──► In-ride Chat ──────│            │
          │                        │                        │            │
          │── Share Drop OTP ─────►│◄── Enter Drop OTP ─────│            │
          │◄── Ride Completed ─────│───── Ride Completed ───►│           │
          │                        │                        │            │
```
