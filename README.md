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
| **Database & ORM** | [PostgreSQL](https://www.postgresql.org/), [Prisma ORM 6.19](https://www.prisma.io/) |
| **Security & Middleware**| Helmet, CORS, Morgan, Zod |
| **Media Storage** | Cloudinary / Object Storage (Phase 3) |
| **Architecture** | Layered REST API Architecture (Routes $\rightarrow$ Controllers $\rightarrow$ Services $\rightarrow$ Repositories $\rightarrow$ Prisma) |

---

## 3. Repository Structure

```
artvest/
├── ARCHITECTURE.md              # In-depth architectural specification & viva guide
├── README.md                    # Project documentation & setup instructions
├── package.json                 # Monorepo orchestration scripts
├── .gitignore                   # Multi-package ignore rules
│
├── backend/                     # Express.js REST API Service
│   ├── .env.example             # Backend environment variable template
│   ├── package.json             # Backend dependencies & scripts
│   ├── tsconfig.json            # NodeNext TypeScript configuration
│   ├── prisma/
│   │   ├── schema.prisma        # Phase 1 Prisma PostgreSQL schema
│   │   └── seed.ts              # Seeding script for categories & skills
│   └── src/
│       ├── config/              # Central configuration & Prisma client singleton
│       ├── controllers/         # HTTP request controllers (HealthController)
│       ├── middleware/          # Global error handling, 404, security
│       ├── routes/              # Express API routers (HealthRoutes, ApiRoutes)
│       ├── services/            # Business logic (HealthService)
│       ├── repositories/        # Data access abstraction
│       ├── validators/          # Input validation schemas (Zod)
│       ├── utils/               # Standard ApiResponse formatter, logger
│       ├── types/               # Backend domain types
│       ├── app.ts               # Express application factory
│       └── server.ts            # Server entry point & graceful shutdown
│
└── frontend/                    # Next.js App Router Web Application
    ├── .env.example             # Frontend environment variable template
    ├── package.json             # Frontend dependencies & scripts
    ├── tsconfig.json            # TypeScript configuration
    ├── next.config.ts           # Next.js & Turbopack configuration
    └── src/
        ├── app/
        │   ├── globals.css      # Dark obsidian design system tokens
        │   ├── layout.tsx       # Root layout with SEO metadata
        │   ├── page.tsx         # Cinematic landing page
        │   ├── login/           # Authentication shell & role selection preview
        │   └── app/             # Application platform shell
        │       ├── layout.tsx   # App sidebar & navigation wrapper
        │       ├── page.tsx     # Creative showcase feed shell
        │       ├── explore/     # Structured multi-attribute talent discovery
        │       ├── studio/      # Creator Studio & analytics dashboard
        │       ├── profile/     # Role-specific creator profile shell
        │       ├── notifications/ # Notifications shell
        │       └── saved/       # Bookmarked showcases shell
        ├── components/
        │   ├── layout/          # Navbar, AppSidebar, Footer
        │   └── ui/              # PhaseBanner, Badge primitives
        ├── features/            # Feature-sliced modules
        ├── services/            # API client connecting to backend
        └── types/               # Frontend domain TypeScript definitions
```

---

## 4. Phase 1 Database Scope (Prisma Entities)

The current Prisma schema (`backend/prisma/schema.prisma`) implements all Phase 1 domain entities:

1. **`User`**: Authentication credentials, Google ID, RBAC roles (`USER`, `CREATOR`, `ADMIN`), onboarding status.
2. **`UserProfile`**: General community member attributes (username, bio, interests).
3. **`CreatorProfile`**: Professional attributes (stage name, headline, location, city, experience level, availability, profile completion score, verified status, and scalable `roleAttributes` JSON).
4. **`Category`**: 6 Creative Disciplines:
   - Music
   - Film & Acting
   - Dance
   - Photography & Video
   - Design & Digital Arts
   - Production & Support
5. **`Skill`**: 30+ granular craft roles linked to categories (Singer, Cinematographer, Actor, 3D Artist, etc.).
6. **`CreatorSkill`**: Relational pivot connecting creators to specific skills with years of experience.
7. **`Post`**: Multimedia showcase posts (`IMAGE`, `VIDEO`, `AUDIO`, `TEXT`, `SHOWCASE`) with category association and tags.
8. **`PostMedia`**: Media assets with durations, aspect ratios, thumbnails, and waveform metadata.
9. **`Comment`**: Hierarchical post comments with nested reply capability.
10. **`Like`**: Unique user appreciations with composite constraints `[postId, userId]`.
11. **`Save`**: User bookmarks with composite constraints `[postId, userId]`.
12. **`Follow`**: Asymmetric social graph connections with composite constraints `[followerId, followingId]`.
13. **`Notification`**: Activity alerts for follows, likes, comments, and collaboration inquiries.
14. **`Report`**: Moderation audit trails for safety.

*Phase 2 entities (`Project`, `VirtualWallet`, `CreditTransaction`, `ProjectBacking`) are intentionally deferred.*

---

## 5. Getting Started & Local Execution

### Prerequisites
- **Node.js**: v20+
- **npm**: v10+
- **PostgreSQL**: Local or hosted instance (e.g. Supabase / Neon / Local Docker)

### Installation

Clone the repository and install dependencies across the monorepo:
```bash
# Clone repository
git clone <repo-url>
cd artvest

# Install root dependencies
npm install

# Install backend dependencies
cd backend && npm install && cd ..

# Install frontend dependencies
cd frontend && npm install && cd ..
```

### Environment Configuration

1. Set up backend environment:
```bash
cp backend/.env.example backend/.env
```
Configure `DATABASE_URL` with your PostgreSQL connection string in `backend/.env`.

2. Set up frontend environment:
```bash
cp frontend/.env.example frontend/.env.local
```

### Running the Application

You can start both frontend and backend concurrently from the root directory:
```bash
npm run dev
```

Or run them individually in separate terminal sessions:
```bash
# Terminal 1: Backend API (runs on http://localhost:5000)
npm run dev:backend

# Terminal 2: Frontend Web App (runs on http://localhost:3000)
npm run dev:frontend
```

### Verifying System Status

- **Backend Health Check**: [http://localhost:5000/api/health](http://localhost:5000/api/health)
- **Frontend Web Application**: [http://localhost:3000](http://localhost:3000)
- **Talent Discovery**: [http://localhost:3000/app/explore](http://localhost:3000/app/explore)
- **Creator Studio**: [http://localhost:3000/app/studio](http://localhost:3000/app/studio)
- **Creator Profile**: [http://localhost:3000/app/profile](http://localhost:3000/app/profile)

---

## 6. Academic Viva Defense Highlights

- **Why Not Use a Single Profile Model?**: General social networks collapse all users into a generic bio. In ArtVest, a vocalist has structured genres, vocal range, and languages, while a cinematographer has camera packages and color workflows. By storing standard fields relationally and craft-specific metadata in indexed JSON attributes, we achieve infinite extensibility without 30 redundant tables.
- **Why Separate Express Backend from Next.js?**: Ensures clear multi-tier architectural separation for academic defense (Presentation Tier $\rightarrow$ Application Tier $\rightarrow$ Persistence Tier) rather than tight coupling in Next.js Server Actions.
- **Why Disallow Dislikes?**: ArtVest is built for constructive creative discovery and portfolio evaluation, avoiding negative downvoting loops that harm emerging artists.

---

## 7. Git Commit Convention

All contributions follow Conventional Commits:
- `feat(scope)`: New feature addition
- `fix(scope)`: Bug fixes
- `refactor(scope)`: Code refactoring without behavioral change
- `docs(scope)`: Documentation updates
- `chore(scope)`: Tooling, dependency, or configuration changes
