# ⚙️ Technical Requirements Document (TRD)

**Product:** Rydex  
**Version:** 1.0  
**Date:** June 2026  
**Audience:** Engineering Team

---

## 1. Architecture Overview

Rydex follows a **monorepo** structure with two independently deployable services:

```
rydex/
├── rydex/          # Next.js 14 App (frontend + API routes)
└── socketServer/   # Standalone Socket.IO + Express server
```

```
┌──────────────┐    HTTPS / REST     ┌──────────────────────┐
│   Browser    │ ──────────────────► │   Next.js App        │
│  (React UI)  │                     │   (App Router APIs)  │
│              │ ◄────────────────── │   Port: 3000         │
│              │                     └──────────┬───────────┘
│              │    WebSocket                   │ Mongoose
│              │ ──────────────────► ┌──────────▼───────────┐
│              │ ◄────────────────── │   Socket.IO Server   │
│              │                     │   Port: 8085         │
└──────────────┘                     └──────────┬───────────┘
                                                │
                                     ┌──────────▼───────────┐
                                     │   MongoDB Atlas       │
                                     │   (Replica Set)       │
                                     └──────────────────────┘
```

**Internal Socket Trigger:** Next.js API routes emit targeted socket events to specific users via `POST /emit` on the Socket.IO server (server-to-server call), keeping the real-time layer decoupled from the API layer.

---

## 2. Data Models

### 2.1 User
```typescript
{
  name: String (required)
  email: String (unique, required)
  password?: String           // absent for OAuth users
  role: "user" | "partner" | "admin"
  isEmailVerified: Boolean
  partnerOnboardingSteps: Number [0–8]
  mobileNumber?: String
  partnerStatus: "pending" | "approved" | "rejected"
  rejectionReason?: String
  otp?: String
  otpExpiry?: Date
  videoKycStatus: "not_required" | "pending" | "in_progress" | "approved" | "rejected"
  videoKycRoomId: String
  videoKycRejectionReason: String
  socketId: String | null
  location: { type: "Point", coordinates: [lng, lat] }  // 2dsphere index
  isOnline: Boolean
}
```

### 2.2 Booking
```typescript
{
  user: ObjectId → User
  driver?: ObjectId → User
  vehicle: ObjectId → Vehicle
  pickUpAddress: String
  dropAddress: String
  pickUpLocation: { type: "Point", coordinates: [lng, lat] }
  dropLocation:   { type: "Point", coordinates: [lng, lat] }
  fare: Number
  userMobileNumber: String
  driverMobileNumber?: String
  bookingStatus: "idle" | "requested" | "awaiting_payment" | "confirmed"
                | "started" | "completed" | "cancelled" | "rejected" | "expired"
  paymentStatus: "pending" | "paid" | "cash" | "failed"
  paymentDeadline: Date
  adminCommission: Number
  partnerAmount: Number
  pickUpOtp: String
  pickUpOtpExpires: Date
  dropOtp: String
  dropOtpExpires: Date
}
```

### 2.3 Vehicle
```typescript
{
  owner: ObjectId → User
  type: "bike" | "car" | "loading" | "truck" | "auto"
  vehicleModel: String
  number: String (unique)
  imageUrl?: String           // Cloudinary URL
  baseFare?: Number
  pricePerKM: Number
  waitingCharge: Number
  status: "pending" | "approved" | "rejected"
  rejectionReason?: String
  isActive: Boolean
}
```

### 2.4 PartnerDocs
```typescript
{
  owner: ObjectId → User
  aadharUrl: String           // Cloudinary URL
  rcUrl: String               // Cloudinary URL
  licenseUrl: String          // Cloudinary URL
  status: "pending" | "approved" | "rejected"
  rejectionReason?: String
}
```

### 2.5 PartnerBank
```typescript
{
  owner: ObjectId → User
  accountHolder: String
  accountNumber: String
  ifsc: String
  upi?: String
  status: "not_added" | "added" | "verified"
}
```

### 2.6 ChatMessage
```typescript
{
  bookingId: ObjectId → Booking
  senderId: ObjectId → User
  message: String
  createdAt: Date
}
```

---

## 3. API Endpoints

### Auth (`/api/auth/...`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/signin` | NextAuth credentials sign-in |
| GET | `/api/auth/session` | Get current session |

### Booking (`/api/booking/...`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/booking/create` | Create a new booking (idle → requested) |
| GET/PATCH | `/api/booking/[id]` | Get or update booking by ID |
| GET | `/api/booking/active` | Fetch user's currently active booking |

### Partner (`/api/partner/...`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET/POST | `/api/partner/onboarding` | Multi-step onboarding data |
| GET | `/api/partner/bookings` | Partner's booking history |
| GET | `/api/partner/earning` | Partner earnings breakdown |
| GET | `/api/partner/my-active` | Partner's active ride |
| POST | `/api/partner/video-kyc` | Initiate/update video KYC room |

### Payment (`/api/payment/...`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/payment/create` | Create Razorpay order |
| POST | `/api/payment/verify` | Verify Razorpay payment signature |

### Admin (`/api/admin/...`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/dashboard` | Platform KPIs |
| GET | `/api/admin/earning` | Aggregate earnings data |
| GET/POST | `/api/admin/video-kyc` | Manage KYC sessions |
| GET | `/api/admin/reviews` | Partner reviews |

### User (`/api/user/...`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET/PATCH | `/api/user` | Get or update user profile |

### Vehicles (`/api/vehicles/...`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/vehicles` | List vehicles (filtered by type/location) |

### Chat (`/api/chat/...`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/chat` | Fetch chat messages for a booking |

---

## 4. Real-Time Events (Socket.IO)

### Client → Server
| Event | Payload | Action |
|-------|---------|--------|
| `identity` | `userId` | Bind socket to user; mark online |
| `update-location` | `{ userId, latitude, longitude }` | Update user's GeoJSON coordinates |
| `join-ride` | `bookingId` | Join room `ride-{bookingId}` |
| `driver-location-update` | `{ bookingId, latitude, longitude }` | Relay location to ride room |
| `chat-message` | `{ bookingId, message, ... }` | Relay message to ride room |

### Server → Client (via `/emit` REST bridge)
| Event | Trigger | Recipients |
|-------|---------|------------|
| `booking-request` | New booking created | Nearby online drivers |
| `booking-accepted` | Driver accepts | User |
| `booking-rejected` | Driver rejects | User |
| `ride-started` | Driver confirms OTP | User |
| `ride-completed` | Drop OTP verified | User |
| `driver-location` | Driver updates location | All in ride room |
| `new-message` | Chat message sent | All in ride room |

---

## 5. Authentication & Security

| Concern | Implementation |
|---------|---------------|
| Session management | NextAuth.js with JWT strategy |
| OAuth | Google OAuth 2.0 |
| Password hashing | bcrypt (implicit via NextAuth) |
| Email verification | 6-digit OTP, stored hashed, with expiry |
| Pickup/Drop OTP | Short numeric OTP with TTL (Date expiry field) |
| Payment integrity | Razorpay HMAC-SHA256 signature verification server-side |
| Role enforcement | Middleware checks `session.user.role` on protected routes |
| Media security | Cloudinary signed uploads |

---

## 6. Infrastructure & Config

### Environment Variables (Next.js)
| Variable | Purpose |
|----------|---------|
| `MONGODB_URL` | MongoDB Atlas connection string |
| `AUTH_SECRET` | NextAuth secret |
| `GOOGLE_CLIENT_ID/SECRET` | OAuth credentials |
| `EMAIL_USER/PASS` | SMTP for OTP emails |
| `CLOUDINARY_CLOUD_NAME/API_KEY/API_SECRET` | Media upload |
| `NEXT_PUBLIC_ZEGO_APP_ID/SERVER_SECRET` | Video KYC (ZegoCloud) |
| `NEXT_PUBLIC_SOCKET_SERVER_URL` | Socket.IO server URL |
| `RAZORPAY_KEY_ID/KEY_SECRET` | Payment gateway |
| `NEXT_PUBLIC_RAZORPAY_KEY_ID` | Client-side Razorpay init |
| `GEMINI_API_URL` | AI integration endpoint |

### Database Indexes
| Collection | Index |
|------------|-------|
| `users` | `location: "2dsphere"` — geo-proximity partner lookup |
| `users` | `email: unique` |
| `vehicles` | `number: unique` |

---

## 7. Partner Onboarding Flow (State Machine)

```
Step 0: Account created (role = user)
  ↓  [User applies to become partner]
Step 1: Personal details submitted
Step 2: Aadhaar document uploaded
Step 3: RC (Registration Certificate) uploaded
Step 4: Driving License uploaded
  ↓  [Admin reviews docs]
Step 5: Docs approved
Step 6: Vehicle details added
Step 7: Bank account added
Step 8: Video KYC completed
  ↓  [Admin approves]
Status: partnerStatus = "approved", role = "partner"
```

`partnerOnboardingSteps` (0–8) tracks progress; `partnerStatus` reflects admin decision.

---

## 8. Booking State Machine

```
idle
  ↓ [User creates booking]
requested
  ↓ [Driver accepts]          ↓ [Driver rejects / no response]
awaiting_payment            rejected / expired
  ↓ [User pays (Razorpay or cash)]
confirmed
  ↓ [Driver reaches pickup; User validates OTP]
started
  ↓ [Trip ends; Drop OTP validated]
completed
```

Any state can transition to `cancelled` if user/driver cancels before `started`.

---

## 9. Fare Calculation

```
fare = baseFare + (distanceKM × pricePerKM) + (waitingMinutes × waitingCharge)

adminCommission = fare × commissionRate    // configured on admin side
partnerAmount   = fare - adminCommission
```

Both values are stored on the `Booking` document at creation time.

---

## 10. Geolocation

- MongoDB **2dsphere** index on `users.location`
- Driver search uses `$near` or `$geoWithin` queries with a configurable radius
- Location is updated continuously via Socket.IO `update-location` events from the browser's Geolocation API (`GeoUpdater` component polls periodically)

---

## 11. Video KYC

- Built on **ZegoCloud** SDK (`ZEGO_APP_ID` + `ZEGO_SERVER_SECRET`)
- Admin initiates a room; partner joins via `/video-kyc` page
- `videoKycStatus` transitions: `pending → in_progress → approved | rejected`
- Rejection reason stored in `videoKycRejectionReason`

---

## 12. Deployment Targets

| Service | Recommended Platform |
|---------|---------------------|
| Next.js App | Vercel / Railway |
| Socket.IO Server | Railway / Render |
| MongoDB | MongoDB Atlas (M10+) |
| Media | Cloudinary (free tier → paid) |
