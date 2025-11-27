# User Dashboard Feature - Comprehensive Reasoning Result

> **Document Type:** Final Synthesis Document
> **Purpose:** Self-contained source of truth for the User Dashboard feature
> **Status:** Ready for Implementation Planning
> **Created:** November 2025

---

## Executive Summary

QuakeWise users complete earthquake safety assessments but lose all data when they close their browser. This document synthesizes the complete reasoning and planning for implementing persistent storage and a user dashboard, enabling users to save, access, and manage their assessments permanently.

**Core Deliverable:** A database-backed assessment system with user dashboard, enabling:
- Automatic saving of assessment progress
- Resume capability from any device
- Permanent access to completed assessments
- Shareable assessment URLs

---

## Part 1: The Problem (WHY)

### 1.1 Current User Experience

```
User Journey Today:
┌─────────────────────────────────────────────────────────────┐
│  User starts assessment                                     │
│       ↓                                                     │
│  Enters location, uploads photos, waits for AI analysis     │
│       ↓                                                     │
│  Completes 4 steps (5-10 minutes of work)                   │
│       ↓                                                     │
│  Views results page                                         │
│       ↓                                                     │
│  Closes browser or navigates away                           │
│       ↓                                                     │
│  ❌ EVERYTHING IS LOST FOREVER                              │
└─────────────────────────────────────────────────────────────┘
```

### 1.2 Why This Is Unacceptable

1. **Wasted User Effort** - 5-10 minutes of data entry, photo uploads, and waiting for AI analysis is lost instantly
2. **No Cross-Device Access** - User completes on phone, cannot access on laptop
3. **No Shareability** - Cannot send results to family, landlord, or insurance
4. **No Comparison** - Cannot compare safety of multiple buildings
5. **Trust Problem** - A "safety assessment tool" that loses data undermines credibility

### 1.3 What Users Actually Need

| Need | Priority | Rationale |
|------|----------|-----------|
| Save assessment permanently | Critical | Core feature gap |
| Resume incomplete assessment | Critical | Prevents lost work |
| Access from any device | High | Modern user expectation |
| Share results with others | High | Key use case (landlords, buyers) |
| View assessment history | High | Compare buildings, track changes |
| Duplicate assessment | Medium | "What if I retrofitted?" scenarios |
| Delete old assessments | Medium | User control, GDPR compliance |

---

## Part 2: Current Technical State (WHAT WE HAVE)

### 2.1 Existing Infrastructure

| Component | Status | Notes |
|-----------|--------|-------|
| **Next.js 15 App Router** | Working | Modern React 19 setup |
| **Clerk Authentication** | Working | User IDs available |
| **Prisma ORM** | Working | Connected to Neon PostgreSQL |
| **PostgreSQL (Neon)** | Working | Serverless, has connection pooling |
| **Assessment Flow** | Working | 4 steps, smooth UX |
| **AI Analysis** | Working | Claude Sonnet 4, structured outputs |
| **Results Page** | Working | Shows score, grade, findings |
| **UserInputContext** | Working | React state only (no persistence) |
| **Dashboard Page** | Exists | Empty/placeholder at `/dashboard` |
| **History Page** | Exists | Non-functional at `/history` |

### 2.2 What's Missing

```
Current Data Flow:
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│  User Input  │ ──▶ │ React State  │ ──▶ │  Results     │
│  (Browser)   │     │ (Memory)     │     │  (Display)   │
└──────────────┘     └──────────────┘     └──────────────┘
                            ⚠️
                     Lost on refresh
                     Lost on close
                     Lost on navigate

Target Data Flow:
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│  User Input  │ ──▶ │ React State  │ ──▶ │  Results     │
│  (Browser)   │     │ (Memory)     │     │  (Display)   │
└──────────────┘     └──────┬───────┘     └──────────────┘
                           │                      ▲
                           ▼                      │
                     ┌──────────────┐             │
                     │  PostgreSQL  │ ────────────┘
                     │  (Permanent) │
                     └──────────────┘
                           ✅
                     Always available
                     Any device
                     Shareable URL
```

### 2.3 Existing Prisma Schema (Reference)

Current models (not related to assessments):
- ServiceToken (for API access)
- RateLimit (for API rate limiting)
- UsageLog (for API usage tracking)

**No Assessment model exists** - this is the core gap.

---

## Part 3: The Solution (HOW)

### 3.1 Database Schema

```prisma
model Assessment {
  id        String   @id @default(cuid())
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  // User relation (Clerk user ID)
  userId    String

  // Status tracking
  status    AssessmentStatus @default(DRAFT)
  currentStep Int @default(1)

  // Location data (JSON for flexibility)
  location  Json?

  // Building data
  building  Json?

  // AI Analysis results
  aiAnalysis Json?

  // Final results
  results   Json?

  // Metadata
  metadata  Json?

  // Indexes
  @@index([userId])
  @@index([status])
  @@index([createdAt])
}

enum AssessmentStatus {
  DRAFT
  IN_PROGRESS
  COMPLETE
  ARCHIVED
}
```

**Design Decisions:**

| Decision | Choice | Reasoning |
|----------|--------|-----------|
| ID Type | `cuid()` | URL-friendly, non-sequential, shareable |
| Data Structure | JSON fields | Flexibility for nested data, schema can evolve |
| Normalization | Single table | Assessment data always accessed together |
| Indexing | userId, status, createdAt | Common query patterns |

### 3.2 API Routes

| Route | Method | Purpose |
|-------|--------|---------|
| `/api/assessment/save` | POST | Create or update assessment |
| `/api/assessment/[id]` | GET | Get single assessment |
| `/api/assessment/[id]` | DELETE | Delete assessment |
| `/api/assessment/history` | GET | Get user's assessments (paginated) |

**API Contract:**

```typescript
// POST /api/assessment/save
Request: {
  assessmentId?: string;  // null for new, string for update
  step: number;           // 1-4
  data: {
    location?: object;
    building?: object;
    aiAnalysis?: object;
    results?: object;
  };
}

Response: {
  success: boolean;
  assessmentId: string;
  status: 'DRAFT' | 'IN_PROGRESS' | 'COMPLETE';
  currentStep: number;
}

// GET /api/assessment/history
Query: ?status=COMPLETE&limit=20&offset=0

Response: {
  success: boolean;
  assessments: Assessment[];
  total: number;
  hasMore: boolean;
}
```

### 3.3 Save Points in Assessment Flow

| Step | Save Trigger | Data Saved |
|------|--------------|------------|
| Step 1 (Location) | Click "Continue" | location, coordinates, seismicZone |
| Step 2 (AI Photo) | AI analysis complete | photos (base64), aiAnalysis |
| Step 3 (Building Info) | Click "Continue" | buildingType, stories, year, modifications |
| Step 4 (Optional/Results) | Click "Get Results" | dimensions, extras, final results |

### 3.4 Context Updates

Current `UserInputContext` needs:

```javascript
// New state
assessmentId: null,           // Database ID

// New functions
saveToDatabase: async (step) => { ... },
loadFromDatabase: async (id) => { ... },
```

### 3.5 File Structure

```
app/
  api/
    assessment/
      save/
        route.js          # POST - save assessment
      [id]/
        route.js          # GET, DELETE - single assessment
      history/
        route.js          # GET - user's assessments

components/
  dashboard/
    AssessmentCard.jsx    # Single assessment display
    AssessmentList.jsx    # List container
    DashboardStats.jsx    # Quick stats
    EmptyState.jsx        # For new users

lib/
  assessment/
    saveAssessment.js     # Database save logic
    loadAssessment.js     # Database load logic

prisma/
  schema.prisma           # Updated with Assessment model
```

---

## Part 4: Implementation Approach

### 4.1 Phase Breakdown

```
Phase 1: Foundation (Database + API)
├── Add Assessment model to Prisma
├── Run database migration
├── Create save API route
├── Create get API route
├── Create history API route
└── Add authentication checks

Phase 2: Integration (Assessment Flow)
├── Add assessmentId to UserInputContext
├── Implement saveToDatabase function
├── Add save calls after each step
├── Implement loadFromDatabase function
├── Handle URL parameter for resuming
└── Update results page to load from DB

Phase 3: Dashboard (UI)
├── Create AssessmentCard component
├── Create AssessmentList component
├── Implement dashboard page
├── Add empty state for new users
├── Add loading skeletons
└── Add pagination

Phase 4: Polish (Enhanced Features)
├── Add delete functionality
├── Add duplicate functionality
├── Add share button with copy URL
├── Error handling refinement
└── Mobile responsiveness check
```

### 4.2 Key Technical Decisions

| Decision | Choice | Alternative Considered | Why Chosen |
|----------|--------|----------------------|------------|
| JSON vs Normalized | JSON fields | Separate tables | Simpler queries, flexibility |
| Image Storage | Base64 in DB (MVP) | Vercel Blob | Simpler for MVP, migrate later |
| Save Timing | After each step | Only at completion | Prevents lost work |
| Draft Retention | 30 days | Forever / 7 days | Balance user needs vs cleanup |
| Delete Behavior | Soft delete (ARCHIVED) | Hard delete | User recovery, audit trail |

### 4.3 URL Structure

```
Assessment in progress: /assessment/3?id=clx123abc
Completed results:      /result/clx123abc
Dashboard:              /dashboard
```

---

## Part 5: Success Criteria

### 5.1 Functional Requirements

| Requirement | Acceptance Criteria |
|-------------|---------------------|
| Persistence | User completes assessment, closes browser, returns - data is there |
| Resume | User can continue incomplete assessment from any device |
| History | Dashboard shows all user assessments with metadata |
| Sharing | Anyone with link can view completed assessment |
| Delete | User can remove assessments from their account |

### 5.2 Non-Functional Requirements

| Requirement | Target |
|-------------|--------|
| Dashboard load time | < 2 seconds |
| Save operation | < 1 second |
| Mobile support | Fully responsive |
| Error handling | Graceful with retry options |

### 5.3 What "Done" Looks Like

```
Target User Journey:
┌─────────────────────────────────────────────────────────────┐
│  User starts assessment                                     │
│       ↓                                                     │
│  Step 1: Location → Click Continue → SAVED                  │
│       ↓                                                     │
│  Step 2: Photos → AI Complete → SAVED                       │
│       ↓                                                     │
│  ⚡ User closes browser / loses connection                  │
│       ↓                                                     │
│  User returns → Sees assessment in Dashboard                │
│       ↓                                                     │
│  Clicks "Continue" → Resumes at Step 3                      │
│       ↓                                                     │
│  Completes assessment → Permanent URL generated             │
│       ↓                                                     │
│  ✅ Can access forever, share with anyone, compare later    │
└─────────────────────────────────────────────────────────────┘
```

---

## Part 6: Risk Mitigation

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Neon connection limits | Medium | High | Use connection pooling, optimize queries |
| Large JSON slowing queries | Low | Medium | Index on scalar fields only, not JSON |
| Race conditions on save | Low | Medium | Use updatedAt for optimistic locking |
| Image storage bloat | Medium | Medium | Consider Vercel Blob migration post-MVP |
| Auth token expiry mid-save | Low | Low | Clerk handles refresh automatically |

---

## Part 7: Future Considerations (Not In Scope)

These are explicitly **NOT** part of this implementation but noted for future:

- PDF export of assessment results
- Side-by-side comparison view
- Portfolio analytics dashboard
- Team/organization accounts
- Email notifications for draft reminders
- Assessment templates

---

## Appendix: Quick Reference

### Database Commands
```bash
# Add schema changes
npx prisma db push

# Generate client
npx prisma generate

# View data
npx prisma studio
```

### Key Files to Modify
1. `prisma/schema.prisma` - Add Assessment model
2. `context/UserInputContext.jsx` - Add persistence functions
3. `app/(pages)/dashboard/page.jsx` - Implement dashboard
4. `app/(pages)/result/[id]/page.jsx` - Load from database

### Environment Variables (Existing)
- `DATABASE_URL` - Neon PostgreSQL (already configured)
- `CLERK_SECRET_KEY` - For user ID access in API routes

---

## Conclusion

This document provides complete reasoning for the User Dashboard feature. The solution is:

- **Technically sound** - Uses existing infrastructure (Prisma, Neon, Clerk)
- **User-focused** - Solves real pain points (data loss, no access)
- **Scoped appropriately** - MVP first, enhancements later
- **Implementation-ready** - Clear phases, file structure, API contracts

**Next Step:** Use this document as the foundation for creating the actual implementation plan in `docs/user-dashboard/plan/`.

---

*This is the authoritative source document for the User Dashboard feature. All implementation decisions should reference this document.*
