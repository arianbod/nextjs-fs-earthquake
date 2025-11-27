# User Dashboard - Implementation Reasoning

> **Purpose:** Explain WHY we're implementing in this specific order and with these architectural choices.
> **Created:** November 2025
> **Status:** Production Release (not MVP)

---

## 1. Key Decisions Made

### 1.1 Deployment Strategy: All At Once

**Decision:** Build complete feature locally, deploy as single release.

**Rationale:**
- We're in production, not MVP - users expect complete features
- Avoids "half-baked" user experience
- Single QA cycle is more thorough
- No partial state management between releases
- Cleaner git history (feature branch → main)

**Trade-off accepted:** Longer time to first deploy, but higher quality release.

---

### 1.2 Testing Strategy: Full Coverage

**Decision:** Comprehensive test coverage before deployment.

**Rationale:**
- Production system requires reliability
- Assessment data is critical (users trust us with safety decisions)
- Database operations must be tested (save, load, delete)
- API routes need validation testing
- UI components need behavior tests

**Test Types:**
| Layer | Test Type | Tool |
|-------|-----------|------|
| Database | Integration tests | Vitest + Prisma |
| API Routes | Integration tests | Vitest + fetch |
| Components | Unit + behavior tests | Vitest + React Testing Library |
| E2E | Critical flows | Playwright (optional) |

---

### 1.3 Feature Scope: Complete (Not MVP)

**Decision:** Include all planned features in initial release.

**Features included:**
- [x] Persistent storage (database)
- [x] Resume capability
- [x] Assessment history/dashboard
- [x] Shareable URLs
- [x] Duplicate assessment
- [x] Delete/archive assessment
- [x] Share button with copy URL

**NOT included (future releases):**
- PDF export
- Side-by-side comparison
- Portfolio analytics
- Team accounts

---

### 1.4 File Storage Architecture: Separate Model with References

**Decision:** Create dedicated `File` model, reference by ID in assessments.

**Schema Approach:**
```
┌─────────────────┐         ┌─────────────────┐
│   Assessment    │         │      File       │
├─────────────────┤         ├─────────────────┤
│ id              │         │ id              │
│ userId          │         │ assessmentId    │──┐
│ location (JSON) │         │ type            │  │
│ building (JSON) │         │ filename        │  │
│ photoIds (JSON) │────────▶│ mimeType        │  │
│ results (JSON)  │         │ data (base64)   │  │
│ ...             │         │ size            │  │
└─────────────────┘         │ createdAt       │  │
                            └─────────────────┘  │
                                    ▲            │
                                    └────────────┘
```

**Rationale:**
1. **Separation of concerns** - Large binary data separate from metadata
2. **Query performance** - Assessment queries don't load image data unless needed
3. **Reusability** - Same file can be referenced multiple times (if needed)
4. **Future migration** - Easy to move to Vercel Blob/S3 later (just change data source)
5. **Size management** - Can query file sizes without loading data
6. **Cleanup** - Orphaned files can be identified and deleted

**Implementation:**
- `File` model stores base64 in `data` field
- `Assessment.photoIds` is JSON array of File IDs
- Lazy loading - files fetched only when displaying images
- On assessment delete → cascade delete associated files

---

## 2. Implementation Order Rationale

### Phase 1: Database Foundation
**Why first:** Everything else depends on data persistence.

```
1. File model (must exist before Assessment references it)
2. Assessment model (references File)
3. Database migrations
4. Basic CRUD utilities
```

### Phase 2: API Routes
**Why second:** Frontend needs API to interact with database.

```
1. File upload API (independent)
2. Assessment save API (depends on File)
3. Assessment get API
4. Assessment history API
5. Assessment delete API (cascades to Files)
```

### Phase 3: Assessment Flow Integration
**Why third:** Core user journey must work before dashboard.

```
1. Update context with DB functions
2. Save at each step
3. Load existing assessment
4. Resume functionality
```

### Phase 4: Dashboard UI
**Why fourth:** Needs working API and data.

```
1. Assessment list
2. Assessment cards
3. Quick actions (view, duplicate, delete, share)
4. Empty state
5. Loading states
```

### Phase 5: Testing
**Why last:** Need complete feature to test properly.

```
1. API route tests
2. Database operation tests
3. Component tests
4. Integration tests
```

---

## 3. Technical Constraints Acknowledged

| Constraint | How We Handle It |
|------------|------------------|
| Neon connection limits | Connection pooling via Prisma |
| Base64 size in DB | Separate File model, lazy loading |
| Vercel 10s timeout | Optimize queries, paginate results |
| JSON field indexing | Index scalar fields only (userId, status) |

---

## 4. What Success Looks Like

After implementation:

1. **User completes assessment** → Automatically saved at each step
2. **User closes browser** → No data lost
3. **User returns** → Sees assessment in dashboard, can resume
4. **User completes** → Gets permanent shareable URL
5. **User wants to compare** → Can duplicate and modify
6. **User wants to share** → Copy link button works
7. **User wants to cleanup** → Can delete assessments

**All with full test coverage and production-ready reliability.**

---

*Next: See plan.md for detailed task breakdown.*
