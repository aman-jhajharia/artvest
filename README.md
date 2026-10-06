# ArtVest

> **Discover Talent. Build Teams. Back Ideas.**

**PR1107 Major Project (4 Credits) • B.Tech Computer Science Engineering**

ArtVest is a community-driven creative talent ecosystem where creative professionals can create structured professional profiles, showcase multimedia work, discover verified collaborators across creative disciplines, and build an audience.

---

## 1. Project Overview & Differentiator

ArtVest is **not** a generic social media or Instagram clone. Its primary technical differentiator is **Structured Creative Talent Discovery**.

Traditional platforms treat every creator identically with a generic bio and photo grid. ArtVest implements structured domain indexing so users can execute precise multi-attribute searches such as:
- *"Classical Singer in Jaipur"*
- *"Cinematographer + Documentary + Mumbai"*
- *"Female Actor + Hindi + Available for Collaboration"*
- *"3D Artist + Blender + Virtual Production"*

### Academic Development Milestones
- **Phase 0**: Architecture & Foundation (Monorepo, Next.js 16, Express, Prisma, PostgreSQL).
- **Phase 1**: Authentication & Onboarding (Google OAuth, HttpOnly JWT, RBAC, 5-step onboarding, deterministic score).
- **Phase 2 (Current Milestone)**: **Creator Identity, Profiles & Portfolio Foundation** (Live profile viewing & editing, dynamic skill management with proficiencies, discipline-specific role metadata validation, explainable profile strength scoring, public profile discovery `/creator/:creatorId`, privacy controls, portfolio foundation).
- **Phase 3 (Upcoming)**: Multimedia Posts & Showcase Feed.
- **Phase 4 (Upcoming)**: Social Graph & Collaborator Inquiries.
- **Phase 5 (End-Term Milestone)**: Creative Projects, Multidisciplinary Teams & Virtual Credit Backing Simulation.

---

## 2. Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | [Next.js 16](https://nextjs.org/) (App Router, Turbopack), [React 19](https://react.dev/), [TypeScript](https://www.typescriptlang.org/), [Tailwind CSS v4](https://tailwindcss.com/), [Framer Motion](https://www.framer.com/motion/), [Lucide React](https://lucide.dev/) |
| **Backend** | [Node.js](https://nodejs.org/) (v20+), [Express.js 4.21](https://expressjs.com/), [TypeScript](https://www.typescriptlang.org/) |
| **Authentication & Sessions**| Google OAuth / Google Identity Services, Cryptographic ID Token Verification (`google-auth-library`), Signed JWT in `HttpOnly` Cookies, Cookie-Parser |
| **Database & ORM** | [PostgreSQL](https://www.postgresql.org/), [Prisma ORM 6.19](https://www.prisma.io/), Docker Compose & Local Embedded Postgres Runner |
| **Security & Middleware**| Helmet, CORS with credentialed origins, Morgan, Zod validation |
| **Testing** | Node.js Test Runner (`node:test`, `node:assert`), Supertest |
| **Architecture** | Layered REST API Architecture (Routes $\rightarrow$ Controllers $\rightarrow$ Services $\rightarrow$ Prisma ORM) |

---

## 3. Phase 2 Architecture: Creator Identity & Skills

### 3.1 REST API Surface

| Method | Endpoint | Authorization | Description |
|---|---|---|---|
| `GET` | `/api/creator/profile` | `CREATOR` role | Retrieves creator profile, skills, portfolio items, and explainable completion breakdown |
| `PATCH` | `/api/creator/profile` | `CREATOR` role | Partially updates profile attributes, role metadata, and recalculates completion score |
| `GET` | `/api/creator/skills` | `CREATOR` role | Lists all skills assigned to the authenticated creator |
| `POST` | `/api/creator/skills` | `CREATOR` role | Adds a skill with proficiency and experience; validates category constraints |
| `PATCH` | `/api/creator/skills/:skillId` | `CREATOR` role | Updates proficiency, experience, or designates skill as primary |
| `DELETE` | `/api/creator/skills/:skillId` | `CREATOR` role | Removes secondary skill; prevents deletion of primary skill |
| `GET` | `/api/creator/profile/completion` | `CREATOR` role | Returns 100-point profile strength score, rank status, and actionable checklist |
| `GET` | `/api/creators/:creatorId` | Public / Optional Auth | Public profile view; enforces privacy (`isPublic`), increments view count |
| `GET` | `/api/user/profile` | Authenticated | Retrieves standard non-creator user profile |
| `PATCH` | `/api/user/profile` | Authenticated | Updates display name, username, bio, location, and interests |
| `GET` | `/api/categories` | Public | Retrieves seeded creative discipline categories |
| `GET` | `/api/skills` | Public | Retrieves skills taxonomy (filterable by `categoryId`) |

### 3.2 Dynamic Skill Management
Skills are relationally linked through the `CreatorSkill` model:
- **Primary Skill Designation**: Each creator has a designated primary craft. When a new skill is designated as primary, previously primary skills are atomically unset in a transaction. Primary skills must belong to the creator's primary category.
- **Proficiency Tracking**: Skills support explicit proficiency levels: `BEGINNER`, `INTERMEDIATE`, `ADVANCED`, `EXPERT`.
- **Integrity Constraints**: Database composite unique constraint `@@unique([creatorProfileId, skillId])` guarantees duplicate skills are impossible (returns HTTP 409).
- **Protection of Primary Skill**: A creator cannot delete their primary craft unless another craft is designated as primary first.

### 3.3 Role-Specific Metadata Validation
Rather than maintaining brittle database tables for every creative profession, ArtVest uses a category-aware Zod validation strategy (`roleAttributes.validator.ts`):
- **Music (Singers/Musicians/Producers)**: `genres`, `languages`, `vocalType`, `instruments`, `daws`, `productionSpecialties`
- **Photography & Video**: `photographyTypes`, `videoStyles`, `cameraEquipment`, `editingTools`
- **Film & Acting**: `actingStyles`, `languages`, `theatreExperience`, `projectTypes`, `directingExperience`
- **Design & 3D**: `designSpecialties`, `tools`, `animationTypes`, `software`, `vfxSpecialties`
- **Arbitrary JSON Prevention**: Malicious or unrecognized payloads fail with HTTP 400 `INVALID_ROLE_ATTRIBUTES`.

### 3.4 Deterministic Profile Completion
The backend calculates profile strength deterministically on a 100-point scale:
- Stage Name / Alias: 10%
- Headline Tagline: 5%
- Creative Bio ($\ge 20$ chars): 10%
- Primary Craft Role: 10%
- Discipline Category: 10%
- Location: 10%
- Secondary Skills Versatility: 10%
- Experience Seniority: 10%
- Availability Status: 10%
- Specialized Role Attributes: 10%
- Visual Cover Banner: 5%

Creators receive actionable tips and one of four earned ranks:
- `Emerging Talent` ($<40\%$)
- `Active Creative` ($40-69\%$)
- `Established Creator` ($70-89\%$)
- `Master Portfolio` ($\ge 90\%$)

### 3.5 Portfolio Foundation & Phase 3 Upload Roadmap
`Post` and `PostMedia` models support multimedia showcases with:
- `PostType`: `IMAGE`, `VIDEO`, `AUDIO`, `TEXT`, `SHOWCASE`
- `MediaType`: `IMAGE`, `VIDEO`, `AUDIO`, `DOCUMENT`
- `isFeatured`: Highlights top works on the creator's profile.

**Intended Phase 3 Media Architecture**:
```
Frontend (File Selector)
       ↓  (Multipart/form-data with session cookie)
ArtVest Backend (Upload Middleware)
       ↓  (Signed upload with private provider keys)
Cloudinary / AWS S3 (Storage & CDN)
       ↓  (Returns optimized URLs + audio waveforms)
Database (Stored as PostMedia)
```
Provider secrets are strictly quarantined in backend `.env` and never exposed to the client browser.

---

## 4. Setup & Running Locally

### Prerequisites
- Node.js v20+
- PostgreSQL (Docker or local embedded runner)

### Starting the Database
#### Option A: Docker
```bash
docker compose up -d
```

#### Option B: Embedded Local PostgreSQL Runner
```bash
npm run db:local
```

### Environment Configuration
```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env.local
```

### Migrations & Seed
```bash
npm run prisma:migrate
npm run prisma:seed
```

### Running Applications
```bash
# Run both Backend & Frontend concurrently:
npm run dev

# Or run separately:
npm run dev:backend   # Express API on http://localhost:5000
npm run dev:frontend  # Next.js on http://localhost:3000
```

### Running Automated Test Suite
```bash
npm test
```
The test suite executes 27/27 automated integration tests:
- **Phase 1 (13 tests)**: Google OAuth verification, session cookie issuance, re-onboarding prevention, RBAC elevation blocking.
- **Phase 2 (14 tests)**: Creator profile retrieval, partial PATCH updates, validation rejection, 403 enforcement on non-creators, dynamic skill addition, duplicate skill conflict (409), skill deletion, session scoping isolation, roleAttributes discipline validation, deterministic profile completion, dynamic score recalculation, public profile visibility & privacy (`isPublic`), and user/creator separation.

---

## 5. Academic Defense Q&A Highlights

1. **Why not create separate database tables for every creative profession?**
   Creating 30+ normalized tables (e.g., `SingerProfile`, `ActorProfile`, `VFXProfile`) introduces schema bloat, high migration risk, and complex polymorphic joins. ArtVest uses a hybrid normalized core (`CreatorProfile` + `CreatorSkill`) with category-aware Zod-validated JSON attributes (`roleAttributes`), ensuring strict type safety and infinite extensibility.

2. **How does ArtVest prevent client-side privilege escalation?**
   Endpoints strictly derive identity from the verified JWT in the `HttpOnly` cookie via `req.user.id`. Client-supplied user IDs in request bodies are ignored. All creator endpoints require `requireRole(UserRole.CREATOR)`.

3. **How does the skills architecture prevent category mismatch?**
   When a skill is added or elevated to `isPrimary`, the backend verifies that the skill's category matches the creator's `primaryCategoryId`. Secondary skills are checked against the database taxonomy.
