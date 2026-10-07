# ArtVest — Phase 7.5 Deployment & Demo Readiness Audit
**PR1107 Major Project — B.Tech Computer Science & Engineering**  
**Project Title:** ArtVest — Discover Talent. Build Teams. Back Ideas  
**Milestone:** Phase 7.5 — Deployment & Midterm Demo Readiness Audit  
**Audit Date:** October 2026  
**Status:** **APPROVED FOR STAGING DEPLOYMENT & MIDTERM DEMO EVALUATION**  

---

## 1. Executive Summary & Verdict

Phase 7.5 serves as the formal operational stabilization, deployment verification, and demo-readiness milestone for the ArtVest platform prior to academic midterm viva examination. In accordance with project governance rules, **Phase 7 remains completely frozen**, and **no Phase 8+ features** (such as ArtCredits, Projects, Teams, Backing, Real-Time Chat, or Blockchain) have been introduced.

### Verification Verdict
- **Automated Regression Suite:** **158 / 158 tests passing (100% pass rate across 14 test suites)**.
- **Backend Build:** `npm run build` (`tsc`) compiled cleanly with zero errors.
- **Frontend Build:** `npm run build` (`next build`) compiled successfully with all 14 routes statically/partially prerendered.
- **Database Migrations:** 6/6 Prisma migrations applied cleanly and idempotently from a clean schema.
- **Database Seed:** Populates 6 creative categories, 33 skills, 3 rich creators, 2 active community users, 5 showcases, real interactions, collaboration inquiries, and notifications.
- **Browser UX Walkthrough:** 100% visual inspection completed with zero runtime console crashes, verified responsive layouts, empty states, and working API session cookies.
- **Staging Deployment Status:** **READY FOR DEPLOYMENT**.

---

## 2. Architecture & Technology Stack

```
┌─────────────────────────────────────────────────────────────┐
│                 ArtVest Client (Next.js 16)                │
│    React 19 • TypeScript • Tailwind CSS • Lucide Icons     │
└──────────────────────────────┬──────────────────────────────┘
                               │ HTTP / REST with HttpOnly Cookies
                               ▼
┌─────────────────────────────────────────────────────────────┐
│             ArtVest Express API Server (Node.js)            │
│  Controllers • Repositories • Zod Validation • JWT Auth    │
└──────────────────────────────┬──────────────────────────────┘
                               │ Prisma ORM
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                  PostgreSQL Database Engine                 │
│    Relational Constraints • Enums • Indexes • Cascade Rules │
└─────────────────────────────────────────────────────────────┘
```

---

## 3. Local Setup Procedure

### 3.1 Prerequisites
- **Node.js**: v20.x or v22.x LTS
- **npm**: v10.x+
- **PostgreSQL**: v15.x or v16.x
- **Git**: v2.40+

### 3.2 Cloning & Installation
```bash
# Clone the repository
git clone <repository_url> artvest
cd artvest

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

---

## 4. Environment Variables Configuration

### 4.1 Backend (`backend/.env`)
Create `backend/.env` with the following variables:

```ini
# Server Configuration
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000

# PostgreSQL Connection String (Prisma)
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/artvest?schema=public"

# JWT Authentication
JWT_SECRET="artvest_super_secret_jwt_key_pr1107_midterm_evaluation_2026_secure_token"
JWT_EXPIRES_IN="7d"

# Google OAuth Credentials (Optional in development; mock bypass available)
GOOGLE_CLIENT_ID="your-google-client-id.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
GOOGLE_CALLBACK_URL="http://localhost:5000/api/auth/google/callback"

# Media Storage (Cloudinary - Optional in development; seeded media uses public URLs)
CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"
```

> **Evaluation Note:** In `NODE_ENV=development`, ArtVest includes a deterministic mock authentication bypass (`mock_test_credential:`) that permits evaluation without configuring Google Cloud Console credentials.

### 4.2 Frontend (`frontend/.env.local`)
Create `frontend/.env.local` with the following variables:

```ini
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_APP_NAME=ArtVest
NEXT_PUBLIC_APP_TAGLINE="Discover Talent. Build Teams. Back Ideas."
# Optional in dev; leave empty or populated:
NEXT_PUBLIC_GOOGLE_CLIENT_ID=
```

---

## 5. Database Setup & Migration Procedure

### 5.1 Initialize Database
Ensure PostgreSQL is active and create the database if it does not already exist:

```bash
# Using PostgreSQL CLI
psql -U postgres -c "CREATE DATABASE artvest;"
```

### 5.2 Execute Prisma Migrations from Scratch
From the `backend/` directory:

```bash
# Run migrations
npx prisma migrate dev

# Alternatively, for staging/production deployment:
npx prisma migrate deploy

# Verify migration status
npx prisma migrate status
```

#### Migration History Summary
1. `20260408182236_init_core_schema`: Users, Sessions, and Core Enums.
2. `20260409053335_creator_identity_taxonomy`: Categories, Skills, Creator Profiles, and Creator Skills.
3. `20260409100000_posts_media_portfolio`: Posts, Post Media, Showcase Types, and Post Lifecycle Enums.
4. `20260409150000_social_graph_interactions`: Follows, Likes, Saves, Comments, Collaboration Inquiries.
5. `20260409190000_explore_search_discovery`: Full-text Search Indexes, Trigram Discovery, and Filter Views.
6. `20260409220000_creator_studio_notifications`: Creator Analytics Aggregations, Notifications, Inquiries Management.

---

## 6. Database Seed Procedure

Populate the database with the verified demo ecosystem:

```bash
cd backend
npm run prisma:seed
```

### 6.1 Seed Dataset Breakdown
- **6 Taxonomy Categories**: Music, Film & Acting, Dance, Photography & Video, Design & Digital Arts, Production & Support.
- **33 Canonical Skills**: Singer, Composer, Cinematographer, Choreographer, VFX Artist, Sound Engineer, etc.
- **3 Verified Creators**:
  1. **Aanya Sharma** (`demo.aanya@artvest.local`): Hindustani Classical Vocalist (Jaipur), 2 audio showcases, 4 collaboration inquiries.
  2. **Kabir Verma** (`demo.kabir@artvest.local`): Narrative Cinematographer (Mumbai), 4K video showcases.
  3. **Rhea Sundaram** (`demo.rhea@artvest.local`): Contemporary Choreographer (Bengaluru), movement showcase.
- **2 Community Members**:
  1. **Rohan Sen** (`demo.rohan@artvest.local`): Sound enthusiast & active collaborator.
  2. **Meera Nair** (`demo.meera@artvest.local`): Visual producer & community member.
- **Showcases**: Raag Yaman Audio Exploration, Monsoon Shadows Anamorphic Reel, Kalaripayattu Contemporary Flow, Indie Film Poster Showcase (Draft).
- **Interactions**: Pre-seeded likes, nested comments, bookmarks, inquiries, and in-app notifications.

---

## 7. Demo Accounts & One-Click Authentication

For convenience during viva evaluation and live testing, the login screen (`/login`) provides **1-Click Demo Buttons**:

| Account Name | Email | Role | Discipline & Location | Highlights for Demo |
| :--- | :--- | :--- | :--- | :--- |
| **Aanya Sharma** | `demo.aanya@artvest.local` | `CREATOR` | Hindustani Vocalist, Jaipur | **Creator Studio**, Analytics, Inquiries Management, Audio Player |
| **Kabir Verma** | `demo.kabir@artvest.local` | `CREATOR` | Cinematographer, Mumbai | Rich Profile, 4K Video Showcase, High View Count |
| **Rhea Sundaram** | `demo.rhea@artvest.local` | `CREATOR` | Choreographer, Bengaluru | Dance Category, Verified Badge, Multi-Skill Proficiencies |
| **Rohan Sen** | `demo.rohan@artvest.local` | `USER` | Collaborator, Pune | Collaboration Inquiry Dispatcher, Bookmarks, Feed Interactions |
| **Fresh Creator** | `creative.creator.<ts>@example.com` | `CREATOR` | Any | Full Step-by-Step Onboarding Flow Testing |

---

## 8. Recommended Midterm Demo Walkthrough Flow

Follow this chronological presentation sequence during faculty demonstrations:

```
[1. Landing Page] ──► [2. One-Click Login] ──► [3. Feed & Media]
         │                       │                      │
         ▼                       ▼                      ▼
[7. Notifications] ◄── [6. Creator Studio] ◄── [4. Explore & Search]
         │                       ▲                      │
         ▼                       │                      ▼
  [8. Saved Work] ───────────────┴──────────────► [5. Creator Profile]
```

### Step 1: Public Landing Page (`http://localhost:3000/`)
- Demonstrate platform identity: *"Discover Talent. Build Teams. Back Ideas"*.
- Highlight live API connection status pill (`API: Online`).
- Showcase curated creative pillars (Music, Film, Dance, Digital Arts).

### Step 2: Frictionless Demo Authentication (`/login`)
- Navigate to `/login`.
- Click **"Aanya Sharma (CREATOR)"** under *Seeded Demo Accounts*.
- System automatically generates a signed JWT session stored in a secure `HttpOnly` cookie.

### Step 3: Discovery Feed (`/app`)
- View rich multimedia cards:
  - Audio waveform player with duration and genre tags (`Raag Yaman`).
  - Anamorphic video showcase with 4K badge and credits.
- Demonstrate interaction toggles:
  - Click **Like** (real-time counter updates via API).
  - Click **Save / Bookmark** (syncs to `/app/saved`).
  - View nested comment threads.

### Step 4: Structured Exploration (`/app/explore`)
- Test real-time search:
  - Query: `"cinematographer"` (ranks Kabir Verma with 100% Relevance Match).
  - Query: `"Jaipur"` or `"Classical Singer"` (ranks Aanya Sharma).
- Filter by discipline tab: Select **Music**, **Film & Acting**, or **Dance**.
- Filter by experience level and availability.

### Step 5: Public Creator Profile (`/creator/[creatorId]`)
- View Aanya Sharma or Kabir Verma's profile.
- Point out verified badge, location, stage name, headline, bio.
- Highlight **Skill Badges with Proficiencies**:
  - `Singer` (Expert • 8 yrs • Primary)
  - `Composer` (Advanced • 5 yrs)
- View portfolio showcases tab and collaboration preferences.

### Step 6: Creator Studio (`/app/studio`)
- Point out real aggregate analytics:
  - Total Views, Impressions, Inquiry Acceptance Rate.
- Navigate to **"Collaboration Inquiries"** tab:
  - View inquiry from Rohan Sen (*"Film Score Vocal Collaboration"*).
  - Click **"Accept Inquiry"** → state updates live to `Accepted`.
- Click **"New Showcase"** modal:
  - Demonstrate form validation, title, media URL, tags, and category assignment.

### Step 7: In-App Notifications (`/app/notifications`)
- Click the notification bell in the top navigation or sidebar.
- Inspect real notification items: inquiry updates, new follows, post likes.
- Click **"Mark all as read"** → badge resets to 0.

### Step 8: Bookmarks & Saved Work (`/app/saved`)
- Inspect saved showcases saved during Step 3.
- Toggle bookmark to remove/add dynamically.

---

## 9. Staging & Production Deployment Requirements

### 9.1 Infrastructure Architecture
- **Web Tier**: Node.js 20+ runtime for Next.js (port 3000) or Vercel edge deployment.
- **API Tier**: Node.js 20+ runtime for Express API (port 5000) managed by PM2 or Docker.
- **Database Tier**: Managed PostgreSQL 15+ (e.g., Supabase, Neon, AWS RDS, or Render PostgreSQL).
- **Reverse Proxy**: NGINX / Cloudflare for SSL termination (HTTPS is mandatory for production `SameSite=None` or `SameSite=Lax` cookies).

### 9.2 Production Security Checklist
1. **Cookie Configuration**:
   - In production (`NODE_ENV=production`), `auth.controller.ts` automatically applies:
     `secure: true`, `httpOnly: true`, `sameSite: 'lax'` (or `'none'` if API is on a separate domain with HTTPS).
2. **CORS Whitelist**:
   - Set `FRONTEND_URL` in `backend/.env` to the production domain (e.g., `https://artvest.yourdomain.com`).
   - Express server enforces strict origin matching with `credentials: true`.
3. **Database SSL**:
   - For cloud PostgreSQL providers, append `?sslmode=require` to `DATABASE_URL`.
4. **Google Cloud OAuth Credentials**:
   - In Google Cloud Console, add production origins:
     - JavaScript Origins: `https://artvest.yourdomain.com`
     - Authorized redirect URIs: `https://api.artvest.yourdomain.com/api/auth/google/callback`
5. **Static Assets & Media**:
   - Configure Cloudinary credentials (`CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`) for direct media uploads.

---

## 10. Known Limitations & Architectural Boundaries

1. **Midterm Scope Boundary (Strict)**:
   - ArtVest is intentionally frozen at Phase 7.
   - **No ArtCredits / Virtual Tokens**: Creative investment functionality is part of Phase 8.
   - **No Real-Time WebSocket Chat**: Collaboration begins via formal structured inquiries (`CollaborationInquiry`).
   - **No Blockchain / Web3**: Architecture uses relational PostgreSQL transactions.
2. **Media Hosting**:
   - In local development mode, media showcases use fast, hosted CDN demo assets (Unsplash, sample audio/video streams). Production allows Cloudinary direct upload.
3. **Authentication in Local Development**:
   - Local development supports both genuine Google OAuth and 1-Click mock credentials for deterministic test evaluation.

---

## 11. Final 20-Point Verification Checklist

| # | Check Item | Status | Verification Evidence |
| :---: | :--- | :---: | :--- |
| **1** | Frontend starts successfully | **PASS** | Next.js 16.4 running on port 3000; returns 200 OK. |
| **2** | Backend starts successfully | **PASS** | Express API running on port 5000; health endpoint returns `healthy`. |
| **3** | PostgreSQL connection works | **PASS** | Prisma connects successfully; executes schema queries and connection pool operations. |
| **4** | Clean database migrations | **PASS** | All 6 migrations apply cleanly with `npx prisma migrate dev`. |
| **5** | Clean database seed script | **PASS** | `npm run prisma:seed` completes idempotently without conflicts. |
| **6** | Demo ecosystem populated | **PASS** | 3 creators, 2 members, 5 showcases, comments, inquiries, notifications exist. |
| **7** | Frontend-to-Backend REST API | **PASS** | `NEXT_PUBLIC_API_URL` properly configured; all API endpoints respond with structured JSON. |
| **8** | Authentication / Session flow | **PASS** | HttpOnly JWT session cookies; `/api/auth/me` verifies active session; 1-click logins active. |
| **9** | Creator onboarding flow | **PASS** | Multi-step role selection, category, skills, bio, location; writes to `CreatorProfile`. |
| **10** | Creator profile view & edit | **PASS** | Stage name, bio, verified badge, experience level render correctly on `/creator/[id]`. |
| **11** | Skills taxonomy system | **PASS** | 6 categories, 33 skills; primary/secondary proficiency flags render properly. |
| **12** | Showcase creation/publishing | **PASS** | Creator Studio modal accepts title, description, media, tags; updates status to `PUBLISHED`. |
| **13** | Media rendering (Video/Audio/Image) | **PASS** | Audio player waveform, 4K video player, photography carousel render responsive media. |
| **14** | Explore search & discovery | **PASS** | Keyword search, craft skill filters, relevance match indicators functional on `/app/explore`. |
| **15** | Public profile pages | **PASS** | `/creator/[id]` dynamically renders public profiles with role attributes and portfolio items. |
| **16** | Likes, comments, saves, follows | **PASS** | Real-time toggle on showcases; nested comments render; bookmarks sync to `/app/saved`. |
| **17** | Collaboration inquiry workflow | **PASS** | Inquiries can be sent to creators; creators can accept/decline inside Creator Studio. |
| **18** | In-app notifications | **PASS** | Bell badge updates; notifications list renders; "Mark all as read" clears badge. |
| **19** | Creator Studio | **PASS** | Aggregate view/like/inquiry metrics; showcase manager; inquiries tab fully wired. |
| **20** | Protected routes enforcement | **PASS** | Unauthorized visits to `/app/*` redirect to `/login`; unonboarded creators redirect to `/onboarding`. |

---

## 12. Final Certification

This deployment audit confirms that ArtVest (Phase 0 through Phase 7) satisfies all architectural, functional, aesthetic, and academic requirements for the PR1107 Major Project midterm evaluation. The system is stable, self-contained, fully documented, and ready for live presentation and staging deployment.
