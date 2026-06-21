# 🚗 Rydex — On-Demand Ride Booking Platform

Rydex is a modern, production-grade, real-time ride-booking platform built with Next.js 14 and Socket.IO. It enables passengers to search and book rides across multiple vehicle categories (bike, car, auto, loading, truck), tracks drivers live on a map, facilitates in-ride chat, verifies rides via OTPs, and automates driver onboarding (including Video KYC and payment settlements).

---

## 🏗️ Architecture Overview

Rydex is structured as a decoupled monorepo:

*   **`rydex/`**: Next.js 14 Web Application (Client App + API Server Routes).
*   **`socketServer/`**: Standalone Socket.IO Express server handling location streaming, dispatch messaging, and real-time chat.
*   **`docs/`**: Core specification documents including Product Requirements (PRD), Technical Requirements (TRD), and User Journeys.

```
┌──────────────┐    HTTPS / REST     ┌──────────────────────┐
│   Browser    │ ──────────────────► │   Next.js App        │
│  (React UI)  │                     │   (App Router APIs)  │
│              │ ◄────────────────── │   Port: 3000         │
│              │                     └──────────┬───────────┘
│              │    WebSocket                   │ Mongoose Connect
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

---

## ⚡ Key Features

### 👤 Passengers (Users)
*   **Ride Search**: Live fare estimator based on vehicle type, base fare, distance, and waiting charges.
*   **Interactive Maps**: Search location autocompletion and live map visualizer utilizing Leaflet.
*   **Ride Tracking**: Real-time driver location updates streaming live onto the user's map.
*   **Secure Verification**: Double-OTP gated stages (Pickup OTP to start the ride, Drop OTP to complete it).
*   **Payments**: Seamless integration with Razorpay for online transactions, plus Cash as fallback.
*   **In-ride Communication**: Real-time, socket-powered text chat with the active driver.

### 🪪 Driver-Partners
*   **Multi-Step Onboarding**: Guided progress dashboard from step 0 to 8:
    *   *Step 1-4*: Submitting personal details, uploading Aadhaar, RC, and Driver's License.
    *   *Step 5-7*: Registering vehicle types and pricing rules, plus adding bank accounts.
    *   *Step 8*: Undergoing live Video KYC with the administrator.
*   **Real-time Dispatch**: Receive immediate socket broadcast of ride requests in the vicinity.
*   **Status Management**: Easy toggling of online/offline status with automated geolocation polling.
*   **Earnings Panel**: Detailed track record showing gross rides, platform commissions, and net earnings.

### 🛡️ Admins
*   **KPI Operations Control**: Dashboard illustrating total system revenue, completed rides, online drivers, and pending tasks.
*   **Verification Portal**: View driver documents and approve/reject with rejection reason notifications.
*   **Video KYC Integration**: In-app live video verification stream via ZegoCloud.
*   **Commission Tracking**: Full ledger of admin platform commission rates and partner payouts.

---

## 🛠️ Tech Stack

*   **Frontend**: Next.js 14 (App Router), React 19, Redux Toolkit, Tailwind CSS, Leaflet Maps, Framer Motion.
*   **Backend & APIs**: Next.js Serverless Route Handlers, Standalone Socket.IO Server (Node.js/Express).
*   **Database**: MongoDB Atlas via Mongoose ODM.
*   **Real-time Services**: Socket.IO, ZegoCloud (Video KYC).
*   **Third-party Integrations**: Razorpay (Payments), Cloudinary (Doc & Image uploads), Nodemailer (OTP Mailer).

---

## 📂 Project Structure

```
rydex/
├── docs/                      # Core design & spec files
│   ├── PRD.md                 # Product Requirements Document
│   ├── TRD.md                 # Technical Requirements Document
│   └── USER_JOURNEYS.md       # All Roles User Journeys
├── rydex/                     # Next.js 14 Application
│   ├── src/
│   │   ├── app/               # Next.js App Router (Pages & APIs)
│   │   ├── components/        # Reusable UI React Components
│   │   ├── hooks/             # Custom React Hooks
│   │   ├── lib/               # Database helpers, configs, and APIs
│   │   ├── models/            # Mongoose Schemas (User, Booking, Vehicle, etc.)
│   │   └── redux/             # Redux State Store and Slices
│   └── package.json
└── socketServer/              # Standalone Real-time Server
    ├── models/                # Synced schemas for Socket contexts
    ├── index.js               # Express entrypoint & Socket listeners
    └── package.json
```

---

## 🚀 Setup & Installation

### Prerequisites
*   Node.js (v18+ recommended)
*   MongoDB Instance (local or Atlas replica set for transactions)

### 1. Configure Environment Variables

Create **`rydex/rydex/.env.local`**:
```ini
MONGODB_URL=your_mongodb_connection_url
AUTH_SECRET=your_nextauth_secret_key
GOOGLE_CLIENT_ID=your_google_oauth_client_id
GOOGLE_CLIENT_SECRET=your_google_oauth_client_secret
EMAIL_USER=your_smtp_sender_email
EMAIL_PASS=your_smtp_app_password
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
NEXT_PUBLIC_ZEGO_APP_ID=your_zegocloud_app_id
NEXT_PUBLIC_ZEGO_SERVER_SECRET=your_zegocloud_server_secret
NEXT_PUBLIC_SOCKET_SERVER_URL=http://localhost:8085
RAZORPAY_KEY_ID=your_razorpay_key_id
NEXT_PUBLIC_RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
GEMINI_API_URL=your_gemini_api_endpoint_and_key
```

Create **`rydex/socketServer/.env`**:
```ini
PORT=8085
MONGODB_URL=your_mongodb_connection_url
NEXT_BASE_URL=http://localhost:3000
```

### 2. Start the Socket Server
```bash
cd socketServer
npm install
npm run dev
```

### 3. Start the Web Application
```bash
cd rydex
npm install
npm run dev
```

The Web Application will run on `http://localhost:3000` and communicate with the Socket Server running on `http://localhost:8085`.

---

## 📖 Deep-Dive Documentation

For detailed functional specifications, database models, technical API mappings, and comprehensive user steps, refer to:
*   [Product Requirements Document (PRD)](file:///d:/Web_Development\Projects\rydex\docs\PRD.md)
*   [Technical Requirements Document (TRD)](file:///d:/Web_Development\Projects\rydex\docs\TRD.md)
*   [All Roles User Journeys](file:///d:/Web_Development\Projects\rydex\docs\USER_JOURNEYS.md)
