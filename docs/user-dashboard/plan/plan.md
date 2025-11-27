# User Dashboard - Detailed Implementation Plan

> **Purpose:** Actionable task breakdown for implementing user dashboard feature.
> **Created:** November 2025
> **Prerequisite:** Read reasoning.md for architectural decisions.

---

## Phase 1: Database Foundation

### 1.1 Update Prisma Schema

**File:** `prisma/schema.prisma`

**Tasks:**
- [ ] Add `File` model for storing images/files
- [ ] Add `Assessment` model with file references
- [ ] Add `AssessmentStatus` enum
- [ ] Add proper indexes for query performance
- [ ] Run `npx prisma db push`
- [ ] Run `npx prisma generate`

**File Model:**
```prisma
model File {
  id           String   @id @default(cuid())
  createdAt    DateTime @default(now())

  // Ownership
  userId       String
  assessmentId String?
  assessment   Assessment? @relation(fields: [assessmentId], references: [id], onDelete: Cascade)

  // File metadata
  type         String      // 'photo', 'streetview', 'satellite', 'plan'
  filename     String?
  mimeType     String      // 'image/jpeg', 'image/png'
  size         Int         // bytes

  // File data
  data         String      @db.Text  // base64 encoded

  // Optional metadata
  metadata     Json?       // width, height, source, etc.

  @@index([userId])
  @@index([assessmentId])
  @@index([type])
}
```

**Assessment Model:**
```prisma
model Assessment {
  id          String   @id @default(cuid())
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  // User relation (Clerk user ID)
  userId      String

  // Status tracking
  status      AssessmentStatus @default(DRAFT)
  currentStep Int              @default(1)

  // Location data
  location    Json?    // { address, coordinates, seismicZone, googlePlaceId }

  // Building data
  building    Json?    // { type, stories, year, construction, etc. }

  // AI Analysis results
  aiAnalysis  Json?    // { findings, confidence, suggestions }

  // Final results
  results     Json?    // { score, grade, findings, recommendations }

  // Metadata
  metadata    Json?    // { title, notes, tags }

  // Relations
  files       File[]

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

---

### 1.2 Create Database Utility Functions

**File:** `lib/db/assessment.js`

**Tasks:**
- [ ] Create `createAssessment(userId)` - Start new assessment
- [ ] Create `updateAssessment(id, data)` - Update assessment fields
- [ ] Create `getAssessment(id)` - Get single assessment
- [ ] Create `getAssessmentWithFiles(id)` - Get with file data
- [ ] Create `getUserAssessments(userId, filters)` - Paginated list
- [ ] Create `deleteAssessment(id)` - Soft delete (archive)
- [ ] Create `duplicateAssessment(id)` - Clone assessment

**File:** `lib/db/file.js`

**Tasks:**
- [ ] Create `saveFile(data)` - Store file with base64
- [ ] Create `getFile(id)` - Get file with data
- [ ] Create `getFileMetadata(id)` - Get without data (fast)
- [ ] Create `deleteFile(id)` - Delete single file
- [ ] Create `deleteAssessmentFiles(assessmentId)` - Cleanup

---

## Phase 2: API Routes

### 2.1 File API

**File:** `app/api/files/upload/route.js`

**Tasks:**
- [ ] POST handler for file upload
- [ ] Validate file type and size
- [ ] Convert to base64 if not already
- [ ] Store in database
- [ ] Return file ID and metadata
- [ ] Add authentication check

**File:** `app/api/files/[id]/route.js`

**Tasks:**
- [ ] GET handler - return file data
- [ ] DELETE handler - remove file
- [ ] Add ownership validation

---

### 2.2 Assessment API

**File:** `app/api/assessment/route.js`

**Tasks:**
- [ ] POST handler - create new assessment
- [ ] Return assessmentId for client

**File:** `app/api/assessment/[id]/route.js`

**Tasks:**
- [ ] GET handler - fetch assessment
- [ ] PUT handler - update assessment
- [ ] DELETE handler - archive assessment
- [ ] Add ownership validation
- [ ] Handle public access for shared assessments

**File:** `app/api/assessment/history/route.js`

**Tasks:**
- [ ] GET handler with pagination
- [ ] Filter by status
- [ ] Sort by date
- [ ] Return count and hasMore

**File:** `app/api/assessment/[id]/duplicate/route.js`

**Tasks:**
- [ ] POST handler - clone assessment
- [ ] Copy all data and files
- [ ] Set status to DRAFT
- [ ] Return new assessmentId

---

## Phase 3: Assessment Flow Integration

### 3.1 Update User Input Context

**File:** `context/UserInputContext.jsx`

**Tasks:**
- [ ] Add `assessmentId` to state
- [ ] Add `saveToDatabase(step)` function
- [ ] Add `loadFromDatabase(id)` function
- [ ] Add `setAssessmentId(id)` function
- [ ] Add loading state for DB operations

---

### 3.2 Update Assessment Steps

**Files:** `components/steps/Step*.jsx`

**Tasks per step:**
- [ ] Step 1 (Location): Save location data on "Continue"
- [ ] Step 2 (Weather/StreetView): Save weather + streetview files on "Continue"
- [ ] Step 3 (AI Photo): Save uploaded photos + AI analysis on complete
- [ ] Step 4 (Building Info): Save building data on "Continue"
- [ ] Steps 5-11: Save respective data on "Continue"
- [ ] Final step: Mark status as COMPLETE

**Common changes:**
- [ ] Check for `?id=` URL param on mount
- [ ] Load existing data if ID present
- [ ] Show loading state while fetching
- [ ] Handle 404 (assessment not found)

---

### 3.3 Update Results Page

**File:** `app/(pages)/result/[id]/page.jsx`

**Tasks:**
- [ ] Fetch assessment from database by ID
- [ ] Handle loading state
- [ ] Handle not found state
- [ ] Display shareable URL
- [ ] Add "Share" button with copy
- [ ] Add "Duplicate" button
- [ ] Add "Back to Dashboard" link

---

## Phase 4: Dashboard UI

### 4.1 Dashboard Components

**File:** `components/dashboard/AssessmentCard.jsx`

**Tasks:**
- [ ] Display assessment summary (address, score, date)
- [ ] Show status badge (Draft, In Progress, Complete)
- [ ] Quick action buttons (View, Continue, Duplicate, Delete)
- [ ] Responsive design
- [ ] Loading skeleton variant

**File:** `components/dashboard/AssessmentList.jsx`

**Tasks:**
- [ ] Fetch assessments from API
- [ ] Handle loading state
- [ ] Handle empty state
- [ ] Pagination controls
- [ ] Filter tabs (All, Drafts, Complete)

**File:** `components/dashboard/EmptyState.jsx`

**Tasks:**
- [ ] Friendly message for new users
- [ ] "Start Assessment" CTA button
- [ ] Illustration or icon

**File:** `components/dashboard/DashboardStats.jsx`

**Tasks:**
- [ ] Total assessments count
- [ ] Average safety score
- [ ] Assessments this month

---

### 4.2 Dashboard Page

**File:** `app/(pages)/dashboard/page.jsx`

**Tasks:**
- [ ] Page layout with header
- [ ] "New Assessment" button
- [ ] AssessmentList component
- [ ] DashboardStats component
- [ ] Mobile responsive

---

### 4.3 Delete Confirmation Modal

**File:** `components/dashboard/DeleteConfirmModal.jsx`

**Tasks:**
- [ ] Confirmation dialog
- [ ] Warning message
- [ ] Cancel and Delete buttons
- [ ] Loading state during deletion

---

### 4.4 Share Dialog

**File:** `components/dashboard/ShareDialog.jsx`

**Tasks:**
- [ ] Display shareable URL
- [ ] Copy to clipboard button
- [ ] Success toast on copy

---

## Phase 5: Testing

### 5.1 Database Tests

**File:** `__tests__/db/assessment.test.js`

**Tasks:**
- [ ] Test createAssessment
- [ ] Test updateAssessment
- [ ] Test getAssessment
- [ ] Test getUserAssessments with filters
- [ ] Test deleteAssessment (archive behavior)
- [ ] Test duplicateAssessment

**File:** `__tests__/db/file.test.js`

**Tasks:**
- [ ] Test saveFile
- [ ] Test getFile
- [ ] Test deleteFile
- [ ] Test cascade delete with assessment

---

### 5.2 API Route Tests

**File:** `__tests__/api/assessment.test.js`

**Tasks:**
- [ ] Test POST /api/assessment (create)
- [ ] Test GET /api/assessment/[id]
- [ ] Test PUT /api/assessment/[id]
- [ ] Test DELETE /api/assessment/[id]
- [ ] Test GET /api/assessment/history
- [ ] Test POST /api/assessment/[id]/duplicate
- [ ] Test unauthorized access
- [ ] Test invalid data handling

**File:** `__tests__/api/files.test.js`

**Tasks:**
- [ ] Test POST /api/files/upload
- [ ] Test GET /api/files/[id]
- [ ] Test DELETE /api/files/[id]
- [ ] Test file size limits
- [ ] Test invalid file types

---

### 5.3 Component Tests

**File:** `__tests__/components/AssessmentCard.test.jsx`

**Tasks:**
- [ ] Test renders assessment data
- [ ] Test status badge variants
- [ ] Test action button clicks
- [ ] Test loading skeleton

**File:** `__tests__/components/AssessmentList.test.jsx`

**Tasks:**
- [ ] Test renders list of assessments
- [ ] Test empty state
- [ ] Test loading state
- [ ] Test pagination

---

### 5.4 Integration Tests

**File:** `__tests__/integration/assessment-flow.test.js`

**Tasks:**
- [ ] Test full flow: create → update → complete → view
- [ ] Test resume flow: start → close → resume
- [ ] Test duplicate flow
- [ ] Test delete flow

---

## File Structure Summary

```
prisma/
  schema.prisma                    # Updated

lib/
  db/
    assessment.js                  # NEW
    file.js                        # NEW

app/
  api/
    assessment/
      route.js                     # NEW - POST create
      [id]/
        route.js                   # NEW - GET, PUT, DELETE
        duplicate/
          route.js                 # NEW - POST duplicate
      history/
        route.js                   # NEW - GET list
    files/
      upload/
        route.js                   # NEW - POST upload
      [id]/
        route.js                   # NEW - GET, DELETE

  (pages)/
    dashboard/
      page.jsx                     # UPDATE
    result/
      [id]/
        page.jsx                   # UPDATE

components/
  dashboard/
    AssessmentCard.jsx             # NEW
    AssessmentList.jsx             # NEW
    EmptyState.jsx                 # NEW
    DashboardStats.jsx             # NEW
    DeleteConfirmModal.jsx         # NEW
    ShareDialog.jsx                # NEW

context/
  UserInputContext.jsx             # UPDATE

__tests__/
  db/
    assessment.test.js             # NEW
    file.test.js                   # NEW
  api/
    assessment.test.js             # NEW
    files.test.js                  # NEW
  components/
    AssessmentCard.test.jsx        # NEW
    AssessmentList.test.jsx        # NEW
  integration/
    assessment-flow.test.js        # NEW
```

---

## Implementation Checklist

### Phase 1: Database Foundation
- [ ] 1.1 File model in schema
- [ ] 1.2 Assessment model in schema
- [ ] 1.3 Run migrations
- [ ] 1.4 Assessment utility functions
- [ ] 1.5 File utility functions

### Phase 2: API Routes
- [ ] 2.1 File upload API
- [ ] 2.2 File get/delete API
- [ ] 2.3 Assessment create API
- [ ] 2.4 Assessment get/update/delete API
- [ ] 2.5 Assessment history API
- [ ] 2.6 Assessment duplicate API

### Phase 3: Flow Integration
- [ ] 3.1 Update UserInputContext
- [ ] 3.2 Update Step 1 (Location)
- [ ] 3.3 Update Step 2 (Weather)
- [ ] 3.4 Update Step 3 (AI Photo)
- [ ] 3.5 Update Step 4 (Building Info)
- [ ] 3.6 Update Steps 5-11
- [ ] 3.7 Update Results page

### Phase 4: Dashboard UI
- [ ] 4.1 AssessmentCard component
- [ ] 4.2 AssessmentList component
- [ ] 4.3 EmptyState component
- [ ] 4.4 DashboardStats component
- [ ] 4.5 Dashboard page
- [ ] 4.6 DeleteConfirmModal
- [ ] 4.7 ShareDialog

### Phase 5: Testing
- [ ] 5.1 Database tests
- [ ] 5.2 API route tests
- [ ] 5.3 Component tests
- [ ] 5.4 Integration tests

---

*Next: See result.md for executable implementation guide.*
