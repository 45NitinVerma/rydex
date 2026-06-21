# 📋 Product Requirements Document (PRD)

**Product:** Rydex — On-Demand Ride Booking Platform  
**Version:** 1.0  
**Date:** June 2026  
**Status:** Active Development

---

## 1. Overview

Rydex is a full-stack, real-time ride-booking platform that connects **passengers** with **driver-partners** for on-demand vehicle hires. It supports multiple vehicle categories and features a robust admin control panel, live tracking, in-ride chat, OTP-gated ride events, and an integrated payment gateway.

---

## 2. Problem Statement

Local and inter-city commuters lack a reliable, transparent platform that allows them to book rides with verified drivers, track their journey in real time, and pay digitally — all in one seamless interface.

---

## 3. Goals

| # | Goal |
|---|------|
| G1 | Allow users to search, book, and pay for rides across multiple vehicle types |
| G2 | Enable driver-partners to receive ride requests, accept/reject, and earn trackable revenue |
| G3 | Provide admins with oversight: driver KYC verification, earnings analytics, and platform control |
| G4 | Ensure live, bidirectional communication between user, driver, and system via WebSockets |
| G5 | Enforce security through OTP verification at pickup & drop, email verification, and document KYC |

---

## 4. Scope

### In Scope
- User registration, authentication (email/password + Google OAuth)
- Ride search, booking flow, checkout, real-time tracking
- Partner onboarding: documents, vehicle, bank account, Video KYC
- Admin: dashboard, KYC approval, earnings analytics
- Payment via Razorpay (online) or Cash
- Real-time: Socket.IO for location, driver matching, ride state, in-ride chat

### Out of Scope (v1)
- Multi-city pricing engines
- Driver rating system (partially stubbed)
- Surge pricing
- iOS/Android native apps

---

## 5. User Personas

| Persona | Description |
|---------|-------------|
| **Passenger (User)** | Someone who needs a ride. Searches by vehicle type, books, pays, tracks. |
| **Driver-Partner** | A verified driver who owns a vehicle and earns by fulfilling ride requests. |
| **Admin** | Platform operator who approves KYC, monitors earnings, manages the system. |

---

## 6. Features & Requirements

### 6.1 Authentication
| ID | Requirement | Priority |
|----|-------------|----------|
| A1 | Email/password registration with OTP email verification | P0 |
| A2 | Google OAuth sign-in | P0 |
| A3 | Role-based access control: `user`, `partner`, `admin` | P0 |
| A4 | Session management via NextAuth | P0 |

### 6.2 User — Ride Booking
| ID | Requirement | Priority |
|----|-------------|----------|
| U1 | Search rides by vehicle type (bike, car, auto, loading, truck) | P0 |
| U2 | View nearby available partners on map | P0 |
| U3 | Select vehicle, view fare estimate, and confirm booking | P0 |
| U4 | Checkout: choose Razorpay or cash payment | P0 |
| U5 | Receive real-time ride status updates (requested → confirmed → started → completed) | P0 |
| U6 | Verify pickup via OTP shared with driver | P0 |
| U7 | Track driver location live on map during ride | P1 |
| U8 | In-ride chat with driver | P1 |
| U9 | View booking history | P1 |

### 6.3 Partner — Driver Operations
| ID | Requirement | Priority |
|----|-------------|----------|
| P1 | Multi-step onboarding: personal docs → vehicle → bank details | P0 |
| P2 | Video KYC with admin before activation | P0 |
| P3 | Receive incoming ride requests (real-time) | P0 |
| P4 | Accept or reject ride requests | P0 |
| P5 | Navigate to pickup using provided address | P1 |
| P6 | Verify pickup & drop with OTP | P0 |
| P7 | View earnings dashboard (total, per-ride) | P1 |
| P8 | Stream live location during active ride | P0 |

### 6.4 Admin — Platform Management
| ID | Requirement | Priority |
|----|-------------|----------|
| AD1 | Dashboard with KPI cards (rides, earnings, active users) | P0 |
| AD2 | Review and approve/reject driver KYC documents | P0 |
| AD3 | Conduct or schedule Video KYC for partner verification | P0 |
| AD4 | View platform earnings and per-partner commissions | P1 |
| AD5 | Manage driver reviews/ratings | P2 |

### 6.5 Payment
| ID | Requirement | Priority |
|----|-------------|----------|
| PM1 | Create Razorpay order on booking confirmation | P0 |
| PM2 | Verify payment signature server-side | P0 |
| PM3 | Support cash-on-delivery as fallback | P0 |
| PM4 | Split fare: admin commission + partner amount tracked per booking | P1 |

### 6.6 Real-Time Communication
| ID | Requirement | Priority |
|----|-------------|----------|
| RT1 | Socket.IO server for bi-directional events | P0 |
| RT2 | Identity binding: map userId → socketId on connection | P0 |
| RT3 | Ride room: join-ride, driver-location-update, driver-location events | P0 |
| RT4 | In-ride chat messages via chat-message → new-message | P1 |
| RT5 | Update user online/offline status on socket connect/disconnect | P0 |

---

## 7. Non-Functional Requirements

| Category | Requirement |
|----------|-------------|
| **Performance** | Booking search results < 2s; location updates < 500ms latency |
| **Security** | OTP expiry enforced; env secrets not exposed to client |
| **Scalability** | Socket server horizontally scalable; MongoDB Atlas with replica sets |
| **Availability** | 99.5% uptime target |
| **Accessibility** | Responsive UI; mobile-first design |

---

## 8. Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend + API | Next.js 14 (App Router), TypeScript |
| Styling | Tailwind CSS |
| Auth | NextAuth.js (Credentials + Google) |
| Database | MongoDB Atlas (Mongoose ODM) |
| Real-time | Socket.IO (standalone Express server) |
| Media | Cloudinary (document/vehicle image uploads) |
| Payments | Razorpay |
| Video KYC | ZegoCloud |
| Email | Nodemailer (Gmail SMTP) |
| AI | Gemini API |

---

## 9. Success Metrics

| Metric | Target |
|--------|--------|
| Ride booking success rate | ≥ 90% |
| Partner onboarding completion | ≥ 70% |
| Payment success rate | ≥ 95% |
| Real-time event delivery latency | < 500ms |
| Admin KYC review turnaround | < 24 hours |
