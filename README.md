# ArtVest

> **Discover Talent. Build Teams. Back Ideas.**

**PR1107 Major Project (4 Credits) • B.Tech Computer Science Engineering**

ArtVest is a community-driven creative talent ecosystem where creative professionals can create structured professional profiles, showcase multimedia work, discover verified collaborators across creative disciplines, and build an audience.

---

## 1. Project Overview & Differentiator

ArtVest is **not** a generic social media or Instagram clone. Its primary technical differentiator is **Structured Creative Talent Discovery**.

Traditional platforms treat every creator identically with a generic bio and photo grid. ArtVest implements structured domain indexing so users can execute precise multi-attribute searches such as:
- *"Classical Singer in Jaipur"*
- *"Cinematographer + Documentary + Jaipur"*
- *"Female Actor + Hindi + Available for Collaboration"*
- *"3D Artist + Unreal Engine + Virtual Production"*

### Academic Development Phases
- **Phase 1 (Midterm Milestone)**: **Talent Discovery & Creative Community Platform** (Authentication, structured creator profiles, multimedia showcase posts, social interactions, multi-criteria talent discovery, creator studio).
- **Phase 2 (End-Term Milestone)**: **Community-Backed Creative Projects** (Creative project creation, multidisciplinary team assembly, virtual credit simulation wallet, community project backing).
  *Note: ArtVest does NOT implement real-money trading, cryptocurrency, blockchain, or financial securities. The credit system is an educational simulation.*

---

## 2. Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | [Next.js 16](https://nextjs.org/) (App Router), [React 19](https://react.dev/), [TypeScript](https://www.typescriptlang.org/), [Tailwind CSS v4](https://tailwindcss.com/), [Framer Motion](https://www.framer.com/motion/) |
| **Backend** | [Node.js](https://nodejs.org/) (v20+), [Express.js 4.21](https://expressjs.com/), [TypeScript](https://www.typescriptlang.org/) |
| **Authentication & Sessions**| Google OAuth / Google Identity Services, Cryptographic ID Token Verification (`google-auth-library`), Signed JWT in `HttpOnly` Cookies, Cookie-Parser |
| **Database & ORM** | [PostgreSQL](https://www.postgresql.org/), [Prisma ORM 6.19](https://www.prisma.io/), Docker Compose & Local Embedded Postgres Runner |
| **Security & Middleware**| Helmet, CORS with credentialed origins, Morgan, Zod |
| **Testing** | Node.js Test Runner (`node:test`, `node:assert`), Supertest |
| **Architecture** | Layered REST API Architecture (Routes $\rightarrow$ Controllers $\rightarrow$ Services $\rightarrow$ Prisma) |

---

## 3. Authentication & Session Architecture

ArtVest implements a strict **zero-trust client identity** model. Identity is never accepted from arbitrary client payloads; it is verified cryptographically via Google OAuth:

```
               ┌──────────────┐
               │    Google    │
               │ (OAuth / GIS)│
               └──────┬───────┘
                      │  Google ID Token
                      ▼
              ┌───────────────┐
              │ ArtVest API   │
              │ Authentication│
              └───────┬───────┘
                      │  Verify with google-auth-library
                      ▼
               ┌─────────────┐
               │    User     │
               │ PostgreSQL  │
               └──────┬──────┘
                      │  Issue Session JWT
                      ▼
             HttpOnly Cookie (artvest_session)
                      │  Secure, SameSite=Lax, Path=/
                      ▼
              ┌───────────────┐
              │   Next.js     │
              │   Frontend    │
              └───────────────┘
```

### Security Properties
1. **HttpOnly Cookies**: Session tokens cannot be accessed or stolen via client-side JavaScript (`document.cookie` / XSS).
2. **CORS with Credentials**: Configured exclusively for the trusted frontend origin (`http://localhost:3000`), rejecting wildcard `*` with credentials.
3. **Server-Enforced RBAC**: Roles (`USER`, `CREATOR`, `ADMIN`) are strictly determined by the server. Users cannot elevate their own role to `ADMIN` during onboarding or through client-sent payloads.
4. **Deterministic Profile Completion**: Creator profile scores are computed dynamically based on completed fields rather than hardcoded metrics.

---

## 4. API Endpoints (Phase 1)

| Method | Endpoint | Protection | Description |
|---|---|---|---|
| `POST` | `/api/auth/google` | Public | Verifies Google ID token, registers/finds user, sets session cookie |
| `POST` | `/api/auth/logout` | Public | Clears `artvest_session` cookie |
| `GET` | `/api/auth/me` | `requireAuth` | Returns authenticated user details and active profile |
| `GET` | `/api/categories` | Public | Fetches all creative categories from database |
| `GET` | `/api/skills` | Public | Fetches craft skills (filterable via `?categoryId=`) |
| `POST` | `/api/onboarding/user` | `requireAuth` | Completes onboarding for community member (`USER`) |
| `POST` | `/api/onboarding/creator`| `requireAuth` | Completes onboarding for creative professional (`CREATOR`) |
| `GET` | `/api/onboarding/status` | `requireAuth` | Checks current onboarding and profile completion status |
| `GET` | `/api/health` | Public | System uptime, version, and database connectivity status |

---

## 5. Local Setup & Execution

### Prerequisites
- **Node.js**: v20+
- **npm**: v10+
- **Docker** (Optional, or use the built-in local database runner)

### Installation
```bash
# Clone repository
git clone <repo-url>
cd artvest

# Install dependencies across all packages
npm install
npm --prefix backend install
npm --prefix frontend install
```

### Database Setup Options

#### Option A: Docker Compose
```bash
docker compose up -d
```

#### Option B: Embedded Local PostgreSQL Runner (No Docker required)
```bash
npm run db:local
```

### Environment Configuration
1. Backend configuration:
   ```bash
   cp backend/.env.example backend/.env
   ```
   Verify `DATABASE_URL=postgresql://postgres:postgres@localhost:5432/artvest?schema=public`.

2. Frontend configuration:
   ```bash
   cp frontend/.env.example frontend/.env.local
   ```

### Run Migrations & Database Seeding
```bash
# Apply Prisma migrations
npm run prisma:migrate

# Seed categories and skills (Idempotent upsert)
npm run prisma:seed
```

### Running the Application
```bash
# Run both Backend and Frontend concurrently:
npm run dev

# Or run separately:
npm run dev:backend   # Express API on http://localhost:5000
npm run dev:frontend  # Next.js App on http://localhost:3000
```

### Running Automated Test Suite
```bash
npm test
```
The test suite validates:
- Unauthenticated requests rejected with 401
- Session cookie verification
- Google token authentication flow
- Duplicate Google accounts prevented
- Duplicate creator skills prevented
- Re-onboarding prevented with 409
- Role hijacking prevention (ADMIN cannot be selected)
- Category and skill database indexing

---

## 6. Academic Viva Defense Highlights

- **Why HttpOnly Cookies Instead of LocalStorage?**: LocalStorage is vulnerable to Cross-Site Scripting (XSS) attacks. By setting an `HttpOnly`, `SameSite=Lax` cookie, session tokens are isolated from browser scripts and handled transparently by the network stack.
- **Why Separate User and Creator Onboarding?**: Creators require structured multi-attribute indexing (skills, experience, vocal ranges, camera gear) to allow precise collaborator discovery, whereas community members only need interest categories.
- **Why Hybrid JSON for Role Attributes?**: Using a strictly normalized table for every possible profession (30+ roles) leads to massive schema migration overhead. By combining normalized core entities with category-aware Zod-validated JSON attributes, ArtVest achieves infinite extensibility without schema bloat.
