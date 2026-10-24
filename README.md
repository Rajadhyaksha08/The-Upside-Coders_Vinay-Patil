# SevaSaathi 🔧 — Indian Blue-Collar Service Marketplace

> **"Seva" = Service · "Saathi" = Companion**  
> *Har kaam ke liye, ek saathi*

A modern, mobile-first and desktop-responsive web application UI connecting Indian households with skilled blue-collar service workers (electricians, plumbers, maids, cooks, carpenters, painters, and AC technicians).

---

## 🌟 Key Features

### 👤 Customer Experience
- **Multi-Category Discovery**: Electricians, Plumbers, Maids, Cooks, Carpenters, Painters, AC Repair, Drivers, and more.
- **PIN-Code & Radius Matching**: 5 km, 10 km, and 15 km area filter.
- **Budget Selection**: Interactive ₹100 – ₹5,000 budget selector.
- **5-Step Booking Wizard**: Address validation, date & time slot selection, custom problem notes, and order confirmation.
- **Doorstep Security**: 6-digit security request code & 4-digit arrival OTP confirmation.
- **Private Masked Calling**: In-app phone calling simulator (`+91 98XXXXX210`) with active timer, mute, and speaker controls.
- **Ratings & Reviews**: Star rating system with verified customer feedback.

### 👷 Worker Partner Portal
- **Fast Onboarding**: 4-step registration with skill tags, hourly/fixed pricing, working radius, and Aadhaar OTP verification.
- **Availability Toggle**: Online 🟢 vs. Offline 🔴 switch with real-time customer visibility.
- **Live Job Offers**: Push offers with expiring countdown timers, task details, and one-tap Accept/Decline.
- **Doorstep OTP Flow**: Arrival OTP verification and Completion OTP release.
- **Partner Ledger**: Real-time balance tracker, transaction history, and instant UPI bank withdrawal simulation.
- **Referral Rewards**: Worker referral code copying (`SAATHI-RK482`) and WhatsApp invite generator.

### 🛡️ Admin & Dispute Mediation
- **Marketplace Health Dashboard**: GMV volume, city demand breakdown, active workers, and live activity feed.
- **Worker Moderation**: Review Aadhaar documents, approve, reject, or temporarily suspend accounts.
- **Grievance Resolution**: Customer-worker dispute mediation with partial refund processing.

### 📞 Basic Phone IVR Simulator (Toll-Free 1800)
- Designed for workers without smartphones on 2G networks.
- Simulated dial-in to `1800-SEVA-SAATHI`.
- **Realistic DTMF Keypad Tones** (dual-frequency telephone beeps via Web Audio API).
- **Interactive Speech Synthesis** (Hindi & English voice prompts via Web Speech API).
- Keypad menu options:
  - `1`: Check Availability
  - `2`: Toggle Online / Offline
  - `3`: Listen to nearby job offers
  - `4`: Hear wallet balance
  - `9`: Main Menu
  - `0`: Customer Support Officer

---

## 🎨 Tech Stack
- **Frontend**: React 18, Vite 5, Tailwind CSS v3
- **Routing**: React Router v6
- **Icons**: Lucide React
- **Notifications**: React Hot Toast
- **Audio Engine**: Web Audio API (DTMF Frequencies) & Web Speech API

---

## 🚀 Quick Start

```bash
# Clone the repository
git clone <repository-url>
cd sevasaathi/client

# Install dependencies
npm install

# Start development server
npm run dev
```

Visit `http://localhost:5173/` in your browser.
