# User Dashboard Feature - Implementation Plan

> **Purpose:** Define HOW to implement the user dashboard feature based on reasoning.md.
> **Prerequisite:** Read reasoning.md first.

---

## Plan Overview

### Phases
| Phase | Focus | Duration Estimate |
|-------|-------|-------------------|
| **Phase 1** | Database Schema & API | Foundation |
| **Phase 2** | Assessment Flow Integration | Core feature |
| **Phase 3** | Dashboard UI | User-facing |
| **Phase 4** | Enhanced Features | Polish |

---

## Phase 1: Database Schema & API

### 1.1 Design Assessment Schema

**File:** `prisma/schema.prisma`

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

**Decisions Made:**
- Using `cuid()` for shareable URLs (not auto-increment)
- JSON fields for flexible nested data (location, building, etc.)
- Status enum for clear state management
- Indexes on userId, status, createdAt for query performance

### 1.2 Create API Routes

**Route 1: Save/Update Assessment**
```
POST /api/assessment/save
Body: { assessmentId?, step, data }
Returns: { assessmentId, status }
```

**Route 2: Get Single Assessment**
```
GET /api/assessment/[id]
Returns: { assessment } or 404
```

**Route 3: Get User's Assessments**
```
GET /api/assessment/history
Query: ?status=COMPLETE&limit=10&offset=0
Returns: { assessments[], total }
```

**Route 4: Delete Assessment**
```
DELETE /api/assessment/[id]
Returns: { success } or 403/404
```

### 1.3 Implementation Tasks

- [ ] Add Assessment model to Prisma schema
- [ ] Run `npx prisma db push` to create table
- [ ] Create `/api/assessment/save/route.js`
- [ ] Create `/api/assessment/[id]/route.js`
- [ ] Create `/api/assessment/history/route.js`
- [ ] Add authentication check to all routes
- [ ] Add error handling and validation

---

## Phase 2: Assessment Flow Integration

### 2.1 Assessment Context Updates

**Current:** `UserInputContext` stores data in React state only.

**Change:** Add database sync capability.

```javascript
// New function in context
const saveToDatabase = async (step) => {
  const response = await fetch('/api/assessment/save', {
    method: 'POST',
    body: JSON.stringify({
      assessmentId: userInput.assessmentId,
      step,
      data: getDataForStep(step)
    })
  });
  const { assessmentId } = await response.json();
  if (!userInput.assessmentId) {
    updateUserInput({ assessmentId });
  }
};
```

### 2.2 Step-by-Step Save Points

| Step | When to Save | What Data |
|------|--------------|-----------|
| Step 1 (Location) | On "Continue" click | location, seismicZone, coordinates |
| Step 2 (Photos) | After AI analysis complete | photos, aiAnalysis |
| Step 3 (Confirm) | On "Continue" click | building type, stories, year |
| Step 4 (Optional) | On "Get Results" click | dimensions, extras |
| Results | On results calculation | score, grade, findings |

### 2.3 Load Existing Assessment

**On assessment page load:**
1. Check URL for assessmentId: `/assessment/[step]?id=xxx`
2. If exists, fetch from database
3. Populate UserInputContext
4. Resume from saved step

### 2.4 Implementation Tasks

- [ ] Add `assessmentId` to UserInputContext
- [ ] Create `saveToDatabase()` function
- [ ] Call save after each step completion
- [ ] Add `loadFromDatabase()` function
- [ ] Update assessment page to check for `?id=` param
- [ ] Handle loading state while fetching
- [ ] Handle error state if assessment not found

---

## Phase 3: Dashboard UI

### 3.1 Dashboard Page Layout

**File:** `app/(pages)/dashboard/page.jsx`

```
┌─────────────────────────────────────────────────────────┐
│  My Assessments                          [+ New Assessment] │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │ 📍 123 Main St, Istanbul                        │   │
│  │    Score: 78% (B)  •  Nov 15, 2025  •  Complete │   │
│  │    [View] [Duplicate] [Delete]                  │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │ 📍 45 Beach Rd, Antalya                         │   │
│  │    Score: 62% (C)  •  Nov 20, 2025  •  Complete │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │ 📍 Draft Assessment                             │   │
│  │    Step 2/4  •  Nov 26, 2025  •  In Progress    │   │
│  │    [Continue] [Delete]                          │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### 3.2 Dashboard Components

1. **AssessmentCard** - Single assessment display
2. **AssessmentList** - List container with loading/empty states
3. **DashboardStats** - Quick stats (total, average score)
4. **EmptyState** - For users with no assessments

### 3.3 Implementation Tasks

- [ ] Create AssessmentCard component
- [ ] Create AssessmentList component
- [ ] Update dashboard page to fetch from API
- [ ] Add loading skeleton
- [ ] Add empty state
- [ ] Add "New Assessment" button
- [ ] Add pagination (if many assessments)

---

## Phase 4: Enhanced Features

### 4.1 Share Functionality

**Shareable URL:** `https://quakewise.com/result/[assessmentId]`

- Already works if results page loads from DB
- Add "Copy Link" button
- Consider: public vs private assessments

### 4.2 Duplicate Assessment

**Flow:**
1. User clicks "Duplicate" on assessment
2. API creates new assessment with same data
3. Status set to DRAFT
4. Redirect to assessment/1 with new ID

### 4.3 Delete Assessment

**Flow:**
1. User clicks "Delete"
2. Confirmation modal
3. API soft-deletes (status = ARCHIVED) or hard delete
4. Remove from list

### 4.4 Implementation Tasks

- [ ] Add share button with copy-to-clipboard
- [ ] Create duplicate API endpoint
- [ ] Create delete confirmation modal
- [ ] Implement archive vs hard delete decision
- [ ] Add success/error toasts

---

## Technical Decisions

### Decision 1: JSON vs Normalized Tables

**Options:**
- A) Separate tables for Location, Building, AIAnalysis
- B) JSON fields in single Assessment table

**Decision: Option B (JSON fields)**

**Reasoning:**
- Assessment data is always accessed together
- No need to query Location separately from Assessment
- Schema flexibility (AI analysis structure may change)
- Simpler queries
- PostgreSQL JSONB is performant

### Decision 2: Image Storage

**Options:**
- A) Store base64 in database
- B) Store in Vercel Blob, save URL in DB
- C) Store in S3/Cloudinary, save URL in DB

**Decision: Option B (Vercel Blob) - for later**

**Reasoning:**
- Native Vercel integration
- Simple API
- Good enough for MVP
- Can migrate to S3 later if needed

**For MVP:** Store base64 in JSON field (simpler, images already base64 from AI analysis)

### Decision 3: Save Timing

**Options:**
- A) Save only at completion
- B) Save after each step
- C) Auto-save with debounce

**Decision: Option B (save after each step)**

**Reasoning:**
- User doesn't lose work if browser closes
- Each step has natural "Continue" action
- Simple to implement
- No complex debounce logic needed

### Decision 4: Draft Retention

**Options:**
- A) Keep drafts forever
- B) Delete drafts after 30 days
- C) Delete drafts after 7 days

**Decision: Option B (30 days)**

**Reasoning:**
- Users may return after a week
- Don't want infinite draft buildup
- 30 days is reasonable balance
- Can implement cleanup job later

---

## API Specifications

### POST /api/assessment/save

**Request:**
```json
{
  "assessmentId": "clx123..." | null,
  "step": 1,
  "data": {
    "location": {...},
    "building": {...}
  }
}
```

**Response (Success):**
```json
{
  "success": true,
  "assessmentId": "clx123...",
  "status": "IN_PROGRESS",
  "currentStep": 1
}
```

**Response (Error):**
```json
{
  "success": false,
  "error": "Unauthorized"
}
```

### GET /api/assessment/[id]

**Response (Success):**
```json
{
  "success": true,
  "assessment": {
    "id": "clx123...",
    "status": "COMPLETE",
    "currentStep": 4,
    "location": {...},
    "building": {...},
    "aiAnalysis": {...},
    "results": {...},
    "createdAt": "2025-11-26T...",
    "updatedAt": "2025-11-26T..."
  }
}
```

### GET /api/assessment/history

**Query Params:**
- `status`: DRAFT | IN_PROGRESS | COMPLETE | ARCHIVED
- `limit`: number (default 20)
- `offset`: number (default 0)

**Response:**
```json
{
  "success": true,
  "assessments": [...],
  "total": 15,
  "hasMore": true
}
```

---

## File Structure

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
    AssessmentCard.jsx
    AssessmentList.jsx
    DashboardStats.jsx
    EmptyState.jsx

lib/
  assessment/
    saveAssessment.js     # Database save logic
    loadAssessment.js     # Database load logic

prisma/
  schema.prisma           # Updated with Assessment model
```

---

## Implementation Order

### Week 1: Foundation
1. ✅ Prisma schema update
2. ✅ Database migration
3. ✅ Save API route
4. ✅ Get API route
5. ✅ History API route

### Week 2: Integration
6. ✅ Update UserInputContext with saveToDatabase
7. ✅ Add save calls to each step
8. ✅ Add load on page mount
9. ✅ Update results page to load from DB

### Week 3: Dashboard
10. ✅ AssessmentCard component
11. ✅ AssessmentList component
12. ✅ Dashboard page implementation
13. ✅ Empty state and loading states

### Week 4: Polish
14. ✅ Delete functionality
15. ✅ Duplicate functionality
16. ✅ Share button
17. ✅ Error handling and edge cases

---

## Risk Mitigation

| Risk | Mitigation |
|------|------------|
| Database connection limits (Neon) | Use connection pooling, optimize queries |
| Large JSON fields slow queries | Index on id/userId only, not JSON |
| User has many assessments | Pagination, lazy loading |
| Concurrent saves (race condition) | Use updatedAt for optimistic locking |
| Auth token expired mid-save | Refresh token, retry logic |

---

## Success Criteria

- [ ] User can complete assessment, close browser, return and see it
- [ ] Dashboard shows all user's assessments
- [ ] Shareable link works for anyone
- [ ] No data loss on browser close
- [ ] Page loads in < 2 seconds
- [ ] Works on mobile devices

---

*Next Step: Create reasoning-result.md with final conclusions and implementation checklist.*
