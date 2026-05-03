# CleanCity — AI Powered Waste Reporting App

**Final Year Project · MIVA Open University · 2026**  
**Student:** Olumutimi Jesutumininu  
**Matric No:** 2023/A/SENG/0027  
**Department:** Software Engineering  
**Supervisor:** Oluwatoyin Adelakun-Adeyemo  

---

## Overview

CleanCity is a web-based prototype of an AI-powered environmental reporting system designed for Nigerian urban waste management. Citizens can report waste and environmental issues using their mobile devices. The system uses AI to automatically classify uploaded photos and generate professional incident reports.

## Features

- 📸 **AI Auto-Classification** — Upload a photo and Claude AI writes the full report automatically
- 🔐 **Real Authentication** — Secure login/register via Supabase Auth
- 🗄️ **Live Database** — Reports stored in real-time via Supabase (PostgreSQL)
- 🗺️ **GPS Location** — Automatic location capture for every report
- 📊 **Admin Panel** — Secured admin dashboard for LAWMA authorities
- 📱 **Mobile-First** — Designed to run as a PWA on any mobile browser

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | HTML5, CSS3, Vanilla JavaScript |
| AI Classification | Claude API (Anthropic) — claude-sonnet-4-20250514 |
| Authentication | Supabase Auth |
| Database | Supabase (PostgreSQL) |
| Storage | Supabase Storage |
| Deployment | GitHub Pages |

## How to Run

### Option 1 — Live URL (recommended)
Visit: `https://tumininu-code.github.io/cleancity-app`

### Option 2 — Run Locally
1. Clone this repository:
   ```bash
   git clone https://github.com/Tumininu-code/cleancity-app.git
   ```
2. Open `index.html` in any modern browser (Chrome recommended)
3. No installation or server required

## Demo Credentials

**Admin Login:**
- Email: `admin@cleancity.ng`
- Password: `CleanCity@2026`

**Citizen:** Register a new account from the splash screen

## Project Structure

```
cleancity-app/
├── index.html              # Splash + Login + Register
├── css/
│   └── style.css           # Complete stylesheet
├── js/
│   ├── app.js              # Core logic + AI classification
│   ├── auth.js             # Authentication handlers
│   └── supabase.js         # Database client
└── pages/
    ├── home.html           # Citizen dashboard
    ├── report.html         # AI-powered report submission
    ├── success.html        # Submission confirmation
    ├── my-reports.html     # User report history
    ├── map.html            # Hotspot map
    ├── profile.html        # User profile
    └── admin.html          # Admin panel (protected)
```

## System Architecture

```
Mobile Browser (Client)
        ↓
    HTML/CSS/JS
        ↓
  Claude AI API ←→ Image Classification
        ↓
  Supabase Auth ←→ User Authentication  
        ↓
  Supabase DB  ←→ Reports / Data Storage
```

## Alignment with SDG 11.6
This system directly supports UN Sustainable Development Goal 11.6 — reducing the adverse environmental impact of cities by enabling citizen-driven waste reporting, real-time monitoring, and data-driven response by authorities.

---
*Submitted in partial fulfillment of the requirements for the award of B.Sc. Software Engineering, MIVA Open University, March 2026*
