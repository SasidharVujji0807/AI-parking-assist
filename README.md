# 🅿️ ParkAI — AI-Powered Parking Finder

A production-grade AI-powered parking finder web application built for the AI Hackathon.

**Live Demo:** [https://ai-parking-assist-b025zcaf0-sasidharvujji0807.vercel.app](https://ai-parking-assist-b025zcaf0-sasidharvujji0807.vercel.app)

## 🚀 Features

- **🔍 Smart Search** — Find parking by location, city, type, price, and amenities  
- **🗺️ Interactive Map** — Leaflet/OpenStreetMap with live parking markers (no API key needed)  
- **🤖 AI Assistant** — Gemini 1.5 Flash AI that understands natural language parking requests  
- **❤️ Favorites** — Save parking locations for quick access  
- **⭐ Reviews** — Community ratings and reviews  
- **📊 Role Dashboards** — Separate UIs for users, parking operators, and admins  
- **🔐 Secure Auth** — Supabase Auth with email/password, JWT, and Row-Level Security  
- **⚡ EV Charging Filter** — Dedicated EV parking discovery  
- **🇮🇳 India-First** — Seed data for Mumbai, Bengaluru, Delhi, Chennai, Hyderabad, Pune

## 🏗️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 18 + TypeScript + Vite |
| **Styling** | Tailwind CSS |
| **Maps** | Leaflet + OpenStreetMap (free, no key) |
| **Backend** | Node.js + Express + TypeScript |
| **Database** | Supabase (PostgreSQL) |
| **Auth** | Supabase Auth |
| **AI** | Google Gemini 1.5 Flash (`@google/genai`) |
| **Validation** | Zod |
| **Deployment** | Vercel |

## ⚙️ Setup

### 1. Clone the repository

```bash
git clone https://github.com/your-username/ai-parking-assist.git
cd ai-parking-assist
```

### 2. Set up Supabase

1. Create a project at [supabase.com](https://supabase.com)
2. Go to **SQL Editor** and run `supabase/migrations/001_initial_schema.sql`
3. Then run `supabase/seed.sql` to add sample Indian parking locations
4. Copy your **Project URL**, **anon key**, and **service role key**

### 3. Get a Gemini API key

1. Go to [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Create a new API key (free tier available)

### 4. Configure environment variables

```bash
cp .env.example .env
```

Edit `.env` with your values:

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
GEMINI_API_KEY=your-gemini-key
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### 5. Install and run locally

```bash
# Install root + server dependencies
npm install

# Install client dependencies  
npm install --prefix client

# Start development (both client and server)
npm run dev
```

- Frontend: http://localhost:5173
- Backend: http://localhost:5000

## 🌐 Deploy to Vercel

### Option A — Vercel Dashboard (Recommended)

1. Push code to GitHub
2. Go to [vercel.com](https://vercel.com) → **New Project**
3. Import your GitHub repository
4. **Framework**: Other (or leave auto-detect)
5. Add these **Environment Variables** in Vercel:

| Variable | Value |
|----------|-------|
| `SUPABASE_URL` | Your Supabase project URL |
| `SUPABASE_ANON_KEY` | Your Supabase anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | Your Supabase service role key |
| `GEMINI_API_KEY` | Your Google Gemini API key |
| `CORS_ORIGIN` | Your Vercel app URL (e.g., `https://your-app.vercel.app`) |
| `VITE_SUPABASE_URL` | Same as SUPABASE_URL |
| `VITE_SUPABASE_ANON_KEY` | Same as SUPABASE_ANON_KEY |
| `NODE_ENV` | `production` |

6. Click **Deploy** ✅

### Option B — Vercel CLI

```bash
npm i -g vercel
vercel login
vercel --prod
```

## 📁 Project Structure

```
ai-parking-assist/
├── api/                     # Vercel Serverless Functions
│   └── index.ts             # Catch-all API handler
├── client/                  # React frontend (Vite)
│   ├── src/
│   │   ├── components/      # Reusable UI + layout components
│   │   ├── pages/           # Page components
│   │   ├── hooks/           # Custom React hooks
│   │   ├── services/        # API service layer
│   │   ├── contexts/        # Auth context
│   │   └── types/           # TypeScript types
│   └── index.html
├── server/                  # Express backend
│   └── src/
│       ├── controllers/     # Route handlers
│       ├── middleware/      # Auth, error handling
│       ├── routes/          # Express routes
│       ├── services/        # AI (Gemini) + scoring engine
│       └── schemas/         # Zod validation schemas
├── supabase/
│   ├── migrations/          # SQL schema
│   └── seed.sql             # Sample Indian city data
├── vercel.json              # Vercel deployment config
└── .env.example             # Environment variable template
```

## 🔒 Security

- ✅ Gemini API key is **server-side only** — never exposed to browser
- ✅ Supabase service role key is **server-side only**
- ✅ Row-Level Security (RLS) on all tables
- ✅ JWT verification on all authenticated endpoints
- ✅ Rate limiting (global + AI-specific)
- ✅ Helmet security headers
- ✅ Input validation with Zod
- ✅ Parameterized queries via Supabase client

## 👥 User Roles

| Role | Access |
|------|--------|
| **User** | Search, favorites, reviews, AI assistant |
| **Operator** | + Manage own parking listings |
| **Admin** | + Manage all listings, users, reports |

To make a user an operator/admin: update their role in the Supabase `profiles` table.

## 🤖 AI Pipeline

1. User submits natural-language query
2. Gemini extracts structured intent (location, price, amenities, etc.)
3. Backend queries database with extracted filters
4. Deterministic scoring engine ranks results (distance 30%, price 25%, rating 25%, availability 15%, amenities 5%)
5. Gemini generates explanations for top results
6. All AI-suggested parking IDs are validated against real DB results (prevents hallucination)

---

Built with ❤️ for the AI Hackathon
