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
- **Phase 2**: Creator Identity, Profiles & Portfolio Foundation (Live profile viewing & editing, dynamic skill management with proficiencies, discipline-specific role metadata validation, explainable profile strength scoring, public profile discovery `/creator/:creatorId`, privacy controls).
- **Phase 3**: Multimedia Portfolio & Showcase Posts (Extensible media model: Image, Video, Audio, Text, Showcase; Cloudinary/local media abstraction; 5-step showcase creator flow; Creator Studio `/app/studio` with Drafts, Published, and Featured work; interactive waveform audio player; live chronological showcase feed `/app`).
- **Phase 4**: Social Graph & Creative Interaction (Post likes & unlikes with unique constraint, saved bookmarks with paginated `/app/saved`, nested comments & replies with ownership rules, creator follow/unfollow graph, structured collaboration inquiries with PENDING/ACCEPTED/DECLINED/WITHDRAWN lifecycle state machine, Studio inquiries manager).
- **Phase 5**: Explore & Structured Discovery (Multi-attribute discovery by discipline, skill, location, experience, availability, and proficiency; multi-token keyword matching; transparent deterministic relevance scoring; URL query state synchronization; responsive filter sidebar & drawer; total 108/108 tests).
- **Phase 6**: Creator Studio & Notifications (Private Creator Studio dashboard `/app/studio` with verified real metrics, deterministic top-post engagement ranking, post performance analytics; decoupled event-driven in-app notifications `/app/notifications`, live unread counter badge, read state transitions, self-notification suppression, debounced domain events; all 108 pre-existing tests remained passing; 23 new Phase 6 tests were added; total suite = 131/131).
- **Phase 7 (Current Milestone — RELEASE CANDIDATE / VIVA READY)**: **Midterm Stabilization & Viva Readiness** (Zero feature creep; comprehensive security, RBAC & IDOR audit; idempotent realistic demo ecosystem with 3 creators & 2 community members; full academic viva prep guide; 0 build errors; all 131 pre-existing tests remained passing; 27 new Phase 7 security & IDOR regression tests were added; **total suite = 158/158**).
- **Phase 8-13**: Creative Projects, Multidisciplinary Teams & Community Backing.

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
The test suite executes 131/131 automated integration tests (100% passing):
- **Phase 1 (13 tests)**: Google OAuth verification, session cookie issuance, re-onboarding prevention, RBAC elevation blocking.
- **Phase 2 (14 tests)**: Creator profile retrieval, partial PATCH updates, validation rejection, 403 enforcement on non-creators, dynamic skill addition, duplicate skill conflict (409), skill deletion, session scoping isolation, roleAttributes discipline validation, deterministic profile completion, dynamic score recalculation, public profile visibility & privacy (`isPublic`), and user/creator separation.
- **Phase 3 (16 tests)**: Showcase draft creation, studio retrieval, draft modification, cross-creator modification isolation (403), draft deletion, draft-to-published lifecycle transition, incomplete post publishing rejection (400), draft privacy from public feed, published feed appearance, creator portfolio integration, featured ordering priority, standard USER restriction (403), unsupported media format rejection (400), file size limit enforcement (400), mutation ownership enforcement, feed pagination.
- **Phase 4 (40 tests)**: Like/unlike posts, unique constraints preventing duplicate likes, save/unsave posts, unique constraint on saves, draft post interaction rejection (400), comments and nested replies, self-reply prevention, cross-post parent rejection, owner comment edits and deletions, non-owner comment mutation blocking (403), follow/unfollow creators, self-follow prevention, follower/following lists, structured collaboration inquiry lifecycle (create, list sent/received, sender withdraw, recipient accept/decline, cross-user modification rejection, invalid status transition blocking, draft post reference rejection).
- **Phase 5 (25 tests)**: Public creator discovery, private creator exclusion (`isPublic: false`), category filtering, skill/role filtering, location/city matching, experience level filtering, availability status filtering, multi-attribute filter composition, empty results behavior, keyword search across fields, multi-token compound search ("Classical Singer in Jaipur"), explainable deterministic relevance scoring breakdown, sorting by profile strength, sorting by newest, pagination and limits, pagination limit validation (400), invalid enum filter rejection (400), published showcase discovery, draft post exclusion, postType filtering, authenticated viewer relationship state (`isFollowing`), unauthenticated discovery, explore overview combining creators/showcases/taxonomy, proficiency filtering, and stable tie-breaking for identical scores.
- **Phase 6 (23 tests)**: Like event notification, self-like notification suppression, comment event notification, follow event notification, collaboration inquiry notification, inquiry acceptance notification, inquiry decline notification, unauthenticated notification rejection (401), cross-user notification mutation blocking (403), mark single notification as read, mark all notifications as read, real database unread count calculation, notification pagination, invalid pagination rejection (400), server-side recipient derivation from session, Creator Studio authorized access (200), standard USER studio restriction (403), unauthenticated studio restriction (401), studio overview metrics aggregation (posts, published, drafts, likes, comments, saves, followers, inquiries, acceptance rate), deterministic top posts ranking, empty creator data zero handling, studio posts performance endpoint with sorting, cross-creator analytics isolation.

---

## 5. Phase 3 Architecture: Multimedia Portfolio & Showcase Posts

### 5.1 Post Lifecycle
```
+-------------+         User Edit / Upload Media         +---------------+
|    DRAFT    |  ------------------------------------->  |   PUBLISHED   |
+-------------+                                          +---------------+
       |                                                         |
       | Author Deletes                                          | Archive / Unpublish
       v                                                         v
  [ DELETED ]                                              +---------------+
                                                           |   ARCHIVED    |
                                                           +---------------+
```

- **Drafts**: Only visible to the author in Creator Studio (`GET /api/creator/posts?status=DRAFT`). Never returned in public feed or creator profiles.
- **Published**: Publicly visible in chronological feed (`GET /api/feed`) and creator portfolio. Validated for required media and fields prior to publication.
- **Featured**: Flagged showcase works (`isFeatured: true`) displayed in priority spotlight at the top of the creator's portfolio.

### 5.2 Media Storage Architecture
```
Browser (Upload Request)
       ↓
ArtVest API (/api/media/upload or /api/media/upload-signature)
       ↓ Authorization & File Validation
Cloudinary Media CDN (or Local Disk Fallback in dev/tests)
       ↓ Returns secure_url + metadata
ArtVest API
       ↓ Prisma Relational Insert
PostMedia Record (url, thumbnailUrl, duration, waveform, dimensions)
       ↓
Post Association
```

**Security Principle**: Cloudinary API Secret and storage credentials NEVER touch the browser. Upload signatures and file parsing occur entirely server-side.

### 5.3 File Limits & Supported Media Formats

| Media Type | Allowed MIME Types | File Size Limit | Processing / Metadata |
|---|---|---|---|
| **IMAGE** | JPEG, PNG, WebP, GIF | 10 MB | Dimensions (width, height), aspect ratio |
| **VIDEO** | MP4, WebM, QuickTime (MOV) | 100 MB | Video poster frame thumbnail generation, duration |
| **AUDIO** | MP3, WAV, FLAC, AAC, OGG | 50 MB | Duration calculation, normalized waveform points array (64 bars) |
| **TEXT** | Plain / Formatted Text | N/A | Typographic layout for scripts, essays, manifestos |
| **SHOWCASE** | Mixed Media Collection | Per item limits | Multi-media gallery carousel |

### 5.4 REST API Surface (Posts & Media)

| Method | Endpoint | Authorization | Description |
|---|---|---|---|
| `POST` | `/api/posts` | `CREATOR` role | Creates showcase draft or published post; ownership derived from `req.user.id` |
| `GET` | `/api/posts/:postId` | Public / Optional Auth | Retrieves post; restricts unpublished drafts strictly to author |
| `PATCH` | `/api/posts/:postId` | `CREATOR` (Author) | Updates metadata, tags, and media associations; enforces 403 on other creators |
| `DELETE`| `/api/posts/:postId` | `CREATOR` (Author) | Deletes post and cascades associated media records |
| `POST` | `/api/posts/:postId/publish` | `CREATOR` (Author) | Validates post completeness and transitions `DRAFT` $\rightarrow$ `PUBLISHED` |
| `POST` | `/api/posts/:postId/feature` | `CREATOR` (Author) | Features showcase work in creator's portfolio spotlight |
| `DELETE`| `/api/posts/:postId/feature` | `CREATOR` (Author) | Unfeatures showcase work |
| `GET` | `/api/creator/posts` | `CREATOR` role | Retrieves author's studio posts with filters (`DRAFT`, `PUBLISHED`, `FEATURED`) |
| `GET` | `/api/creators/:creatorId/posts` | Public / Optional Auth | Retrieves public published showcases for a creator; excludes drafts |
| `GET` | `/api/feed` | Public / Optional Auth | Chronological showcase feed with category/type filters and pagination |
| `POST` | `/api/media/upload` | `CREATOR` role | Uploads media file through backend abstraction; validates MIME and file size |
| `POST` | `/api/media/upload-signature` | `CREATOR` role | Generates signed upload authorization for direct Cloudinary upload |

---

## 6. Phase 4 Architecture: Social Graph & Creative Interaction

### 6.1 Relational Social Graph & Interaction Model
```
             User (Viewer / Creator)
             │
   ┌─────────┼──────────┬──────────────┬────────────────┐
   │ 1       │ 1        │ 1            │ 1 (follower)   │ 1 (sender)
   ▼ *       ▼ *        ▼ *            ▼ *              ▼ *
  Like      Save     Comment         Follow     CollaborationInquiry
   │ *       │ *        │ *            │ * (following)  │ * (recipient)
   │         │          ├──────────┐   │                ├──→ User (Creator)
   ▼ 1       ▼ 1        ▼ 1        │ * ▼ 1              │
 ┌─────────────────────────┐       └── Comment (parent) └──→ Post (optional)
 │  Post (PUBLISHED only)  │
 └─────────────────────────┘
```

- **Post Interactions Restricted to PUBLISHED Work**: Backend strictly forbids likes, saves, comments, or post-referenced inquiries against `DRAFT`, `ARCHIVED`, or `DELETED` posts.
- **Relational Integrity via Database Constraints**:
  - `Like`: `@@unique([userId, postId])` enforces single-like idempotency at database level.
  - `Save`: `@@unique([userId, postId])` prevents duplicate bookmarks.
  - `Follow`: `@@unique([followerId, followingId])` prevents duplicate follows; backend rejects self-follows.
- **Nested Discussions**: `Comment` supports 1-level nested replies via `parentId` referencing root comment; self-replies and cross-post parent associations are rejected.
- **Structured Collaboration**: `CollaborationInquiry` transitions cleanly (`PENDING` $\rightarrow$ `ACCEPTED` | `DECLINED` | `WITHDRAWN`), keeping communication formal and asynchronous without unmonitored chat/DMs.

### 6.2 REST API Surface (Interactions & Social Graph)

| Method | Endpoint | Authorization | Description |
|---|---|---|---|
| `POST` | `/api/posts/:postId/like` | Authenticated | Likes a published post; idempotent with DB unique constraint |
| `DELETE`| `/api/posts/:postId/like` | Authenticated | Unlikes a post; decrements like count |
| `GET` | `/api/posts/:postId/likes` | Public | Returns like count and whether current viewer liked the post |
| `POST` | `/api/posts/:postId/save` | Authenticated | Bookmarks a published post to user's saved collection |
| `DELETE`| `/api/posts/:postId/save` | Authenticated | Removes post from saved collection |
| `GET` | `/api/user/saved` | Authenticated | Paginated list of user's saved showcase posts |
| `POST` | `/api/posts/:postId/comments`| Authenticated | Adds comment or reply (`parentId` optional, 1-2000 chars) |
| `GET` | `/api/posts/:postId/comments`| Public | Paginated list of comments with nested replies |
| `PATCH`| `/api/comments/:commentId` | Authenticated (Author) | Edits comment content; restricts strictly to original author |
| `DELETE`| `/api/comments/:commentId` | Authenticated (Author/Admin) | Deletes comment and cascades child replies |
| `POST` | `/api/creators/:creatorId/follow` | Authenticated | Follows creator by `userId` or `creatorProfileId`; blocks self-follow |
| `DELETE`| `/api/creators/:creatorId/follow` | Authenticated | Unfollows creator |
| `GET` | `/api/user/followers` | Authenticated | Paginated list of users following the authenticated user |
| `GET` | `/api/user/following` | Authenticated | Paginated list of creators the authenticated user follows |
| `POST` | `/api/collaboration/inquiries` | Authenticated | Submits structured inquiry to creator with optional work reference |
| `GET` | `/api/collaboration/inquiries/sent` | Authenticated | Paginated list of inquiries sent by the authenticated user |
| `GET` | `/api/collaboration/inquiries/received`| Authenticated | Paginated list of inquiries received by creator |
| `PATCH`| `/api/collaboration/inquiries/:id` | Authenticated (Sender/Recipient) | Status transition (`WITHDRAWN` for sender, `ACCEPTED`/`DECLINED` for recipient) |

---

## 7. Phase 5 Architecture: Explore & Structured Discovery

### 7.1 Multi-Attribute Discovery Pipeline
```
User Search / Structured Filters
       │
       ▼
Prisma Relational Filter Pipeline (Indexed PostgreSQL queries)
 ├── Category           (Slug or ID, e.g. "music")
 ├── Skill / Role       (Name or Slug, e.g. "Classical Singer", "Cinematographer")
 ├── Location / City    (Case-insensitive substring, e.g. "Jaipur", "Mumbai")
 ├── Experience         (BEGINNER, INTERMEDIATE, ADVANCED, PROFESSIONAL, VETERAN)
 ├── Availability       (AVAILABLE_FOR_COLLAB, OPEN_TO_WORK, FREELANCE, COMMISSION)
 ├── Proficiency        (BEGINNER, INTERMEDIATE, ADVANCED, EXPERT)
 └── Multi-Token Search ("Classical Singer in Jaipur" -> [Classical, Singer, Jaipur])
       │
       ▼
Candidate Retrieval (STRICT: isPublic = true, status = PUBLISHED)
       │
       ▼
Deterministic Relevance Scoring Engine (Explainable, Transparent, Zero Black-Box ML)
       │
       ▼
Ranked Talent & Showcase Cards + Explainable Score Breakdown
```

### 7.2 REST API Surface (Explore & Discovery)

| Method | Endpoint | Authorization | Description |
|---|---|---|---|
| `GET` | `/api/explore` | Public / Optional Auth | Overview combining top creators, featured showcases, and active taxonomy |
| `GET` | `/api/explore/creators` | Public / Optional Auth | Multi-attribute creator discovery with deterministic scoring and score breakdowns |
| `GET` | `/api/explore/posts` | Public / Optional Auth | Published showcase discovery filtered by category, skill, postType, and tags |

### 7.3 Deterministic Scoring Formula
Ranking is 100% explainable and verifiable without machine learning:
$$\text{Relevance Score} = S_{\text{keyword}} (40) + S_{\text{category}} (20) + S_{\text{skill}} (25) + S_{\text{location}} (15) + S_{\text{experience}} (10) + S_{\text{availability}} (10) + S_{\text{quality}} (15) + S_{\text{depth}} (10)$$

Ties are broken deterministically using `profileCompletionScore DESC`, then `createdAt DESC`, and `id ASC`.

---

## 8. Phase 6 Architecture: Creator Studio & In-App Notifications

### 8.1 Creator Studio Domain
- **Route**: `/app/studio` (server-side guarded by `requireRole(UserRole.CREATOR)`).
- **Zero Fabricated Metrics**: All metrics are aggregated directly from PostgreSQL:
  - Posts: Total, Published, Draft, and Featured.
  - Engagement: Total Likes, Comments, Saves, and compound deterministic metric $\text{Total Engagement} = \text{Likes} + \text{Comments} + \text{Saves}$.
  - Followers: Verified total follower count and chronological recent follower list.
  - Collaboration Pipeline: Total inquiries, pending review, accepted, declined, and verified Acceptance Rate:
    $$\text{Acceptance Rate} = \frac{\text{Accepted}}{\text{Accepted} + \text{Declined}} \times 100$$
  - Profile Views: Real authenticated counter from `CreatorProfile.viewCount`.
- **Deterministic Top Posts Ranking**:
  $$\text{engagementScore} = \text{likes} + \text{comments} + \text{saves}$$
  Stable tie-breaking: `engagementScore DESC`, `publishedAt DESC`, `id ASC`.
- **Post Performance Endpoint (`GET /api/studio/posts`)**: Paginated post performance with sorting by `engagement`, `likes`, `comments`, `saves`, `views`, or `newest`.

### 8.2 In-App Notification Domain
- **Route**: `/app/notifications`
- **Domain Event Handlers**:
  - `POST_LIKED`: Triggered on showcase like (suppressed for self-like).
  - `COMMENT_CREATED`: Triggered on showcase comment (suppressed for self-comment).
  - `CREATOR_FOLLOWED`: Triggered when an enthusiast follows a creator.
  - `COLLABORATION_INQUIRY_CREATED`: Triggered when an inquiry is dispatched.
  - `COLLABORATION_ACCEPTED`: Triggered when an inquiry is accepted.
  - `COLLABORATION_DECLINED`: Triggered when an inquiry is declined.
- **Rules & Guardrails**:
  - Self-notification suppression: Users are never alerted about their own interactions.
  - Rapid-action debouncing: Repeated actions for the same resource within 60 seconds are deduplicated.
  - Server-side recipient derivation: Never trusts client-supplied recipient IDs.
  - Ownership protection: Users cannot view or mutate another user's notifications (`403 Forbidden`).
  - Real-time unread badge: Indexed counter query `@@index([recipientId, isRead])`.

### 8.3 REST API Surface (Studio & Notifications)

| Method | Endpoint | Authorization | Description |
|---|---|---|---|
| `GET` | `/api/studio/overview` | `CREATOR` only | Comprehensive studio metrics, profile snapshot, funnel, and top posts |
| `GET` | `/api/studio/posts` | `CREATOR` only | Post-by-post engagement metrics with sorting (`engagement`, `likes`, etc.) |
| `GET` | `/api/notifications` | Authenticated | Paginated notification list (`page`, `limit`, `unreadOnly`) |
| `GET` | `/api/notifications/unread-count` | Authenticated | Real-time unread notification count |
| `PATCH` | `/api/notifications/:id/read` | Authenticated (Owner) | Marks a specific notification as read with timestamp |
| `PATCH` | `/api/notifications/read-all` | Authenticated | Marks all unread notifications for caller as read |

---

## 9. Academic Defense Q&A Highlights

1. **Why not store media files directly in PostgreSQL using BYTEA?**
   Storing binary blobs in relational tables degrades database performance, bloats backups, and prevents edge CDN caching. ArtVest stores references and rich metadata in PostgreSQL (`PostMedia`), while delegating asset delivery to a dedicated CDN provider (Cloudinary) or filesystem abstraction.

2. **How does ArtVest prevent client-side privilege escalation in Creator Studio and Notifications?**
   Endpoints strictly derive identity from the verified JWT in the `HttpOnly` cookie via `req.user.id`. Creator Studio endpoints enforce `requireRole(UserRole.CREATOR)` and query records strictly where `authorId === req.user.id` or `recipientId === req.user.id`. Notification mutations enforce record ownership before updating `isRead`. Client-supplied IDs in query strings or payloads are never trusted for authorization.

3. **How are duplicate likes, saves, and follows prevented under high concurrency?**
   Application-layer checks alone suffer from race conditions (TOCTOU). ArtVest enforces relational integrity via composite unique constraints (`@@unique([userId, postId])` for `Like` and `Save`, and `@@unique([followerId, followingId])` for `Follow`). Any concurrent duplicate inserts are rejected deterministically by the database engine.

4. **How does ArtVest prevent the N+1 query problem when aggregating Studio analytics?**
   Rather than loading full record graphs into JavaScript memory or issuing sequential queries in a loop, ArtVest leverages Prisma's database-level parallel aggregation functions (`prisma.post.count`, `prisma.like.count`, `prisma.follow.count`, `prisma.collaborationInquiry.count`) run concurrently via `Promise.all`. Zero unbounded entity tables are loaded into memory.

5. **Why an in-app database notification system rather than WebSockets, Push, or Email?**
   For this development phase and project scope, in-process domain event triggers and database storage provide high auditability, testability, and persistence without introducing fragile background daemons, third-party SMTP quotas, or persistent WebSocket socket management. Polling and page revalidation deliver an instant, responsive user experience while keeping the architecture maintainable and defensible.

6. **How does ArtVest prevent notification spam and self-notifications?**
   `NotificationService.createNotification` enforces a strict guard: if `actorId === recipientId`, execution halts immediately with zero database writes. Additionally, duplicate actions within 60 seconds targeting the same actor, recipient, type, and resource return the existing notification rather than creating redundant database rows.

7. **How does ArtVest calculate Creator Studio engagement and top-performing works?**
   Engagement is calculated deterministically as $\text{Engagement Score} = \text{Likes} + \text{Comments} + \text{Saves}$. Top performing showcases are ordered deterministically by `engagementScore DESC`, then `publishedAt DESC`, with `id ASC` as an absolute tie-breaker, completely avoiding unexplainable "black-box" machine learning algorithms.


