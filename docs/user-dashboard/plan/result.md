# User Dashboard - Implementation Guide

> **Document Type:** Executable Implementation Guide
> **Purpose:** Self-contained source of truth for building the User Dashboard feature
> **Status:** Ready for Implementation
> **Created:** November 2025

---

## Quick Reference

### What We're Building
A complete user dashboard system that:
- Saves assessments to PostgreSQL database
- Stores images in separate `File` model (base64)
- Provides resume capability for incomplete assessments
- Shows all assessments in a dashboard
- Enables sharing via permanent URLs
- Supports duplicate and delete operations

### Tech Stack
- Database: Prisma + Neon PostgreSQL
- Auth: Clerk (userId from session)
- API: Next.js App Router API routes
- UI: React + TailwindCSS + shadcn/ui
- Testing: Vitest + React Testing Library

### Key Architecture Decision
**Separate File model** - Images stored in dedicated `File` table with base64 data, referenced by ID in Assessment. This enables lazy loading, better query performance, and future migration to blob storage.

---

## Implementation Phases

```
Phase 1: Database Foundation ──────▶ Schema + Utilities
Phase 2: API Routes ───────────────▶ CRUD Endpoints
Phase 3: Assessment Flow ──────────▶ Save/Load Integration
Phase 4: Dashboard UI ─────────────▶ User Interface
Phase 5: Testing ──────────────────▶ Full Coverage
```

---

## Phase 1: Database Foundation

### Step 1.1: Update Prisma Schema

**File:** `prisma/schema.prisma`

Add the following models:

```prisma
// ===========================================
// FILE MODEL - Stores images/files as base64
// ===========================================
model File {
  id           String      @id @default(cuid())
  createdAt    DateTime    @default(now())

  // Ownership
  userId       String
  assessmentId String?
  assessment   Assessment? @relation(fields: [assessmentId], references: [id], onDelete: Cascade)

  // File metadata
  type         String      // 'user_photo', 'streetview', 'satellite', 'building_plan'
  filename     String?
  mimeType     String      // 'image/jpeg', 'image/png', 'image/webp'
  size         Int         // bytes

  // File data (base64 encoded)
  data         String      @db.Text

  // Optional metadata (dimensions, source, etc.)
  metadata     Json?

  @@index([userId])
  @@index([assessmentId])
  @@index([type])
}

// ===========================================
// ASSESSMENT MODEL - Main assessment data
// ===========================================
model Assessment {
  id          String           @id @default(cuid())
  createdAt   DateTime         @default(now())
  updatedAt   DateTime         @updatedAt

  // User relation (Clerk user ID)
  userId      String

  // Status tracking
  status      AssessmentStatus @default(DRAFT)
  currentStep Int              @default(1)

  // Location data
  // { address, formattedAddress, coordinates: {lat, lng},
  //   seismicZone, googlePlaceId, elevation }
  location    Json?

  // Weather data
  // { temperature, humidity, conditions, fetchedAt }
  weather     Json?

  // Building data
  // { type, stories, yearBuilt, construction, foundation,
  //   modifications, condition, usage }
  building    Json?

  // Structural data (steps 5-11)
  // { structuralSystem, irregularities, planDefinition,
  //   manipulations, specificConditions, extraLoad, neighbors }
  structural  Json?

  // AI Analysis results
  // { buildingType, confidence, findings, suggestions }
  aiAnalysis  Json?

  // Final calculated results
  // { score, grade, riskLevel, findings, recommendations }
  results     Json?

  // User-facing metadata
  // { title, notes, tags }
  metadata    Json?

  // Relations
  files       File[]

  @@index([userId])
  @@index([status])
  @@index([createdAt])
  @@index([userId, status])
}

enum AssessmentStatus {
  DRAFT        // Started but not completed any step
  IN_PROGRESS  // At least one step completed
  COMPLETE     // All steps done, results calculated
  ARCHIVED     // Soft deleted
}
```

### Step 1.2: Run Migration

```bash
npx prisma db push
npx prisma generate
```

### Step 1.3: Create Assessment Utilities

**File:** `lib/db/assessment.js`

```javascript
import prisma from '@/lib/prisma';

/**
 * Create a new assessment
 */
export async function createAssessment(userId) {
  return prisma.assessment.create({
    data: {
      userId,
      status: 'DRAFT',
      currentStep: 1,
    },
  });
}

/**
 * Update assessment data
 */
export async function updateAssessment(id, userId, data) {
  // Verify ownership
  const assessment = await prisma.assessment.findUnique({
    where: { id },
    select: { userId: true },
  });

  if (!assessment || assessment.userId !== userId) {
    throw new Error('Assessment not found or unauthorized');
  }

  return prisma.assessment.update({
    where: { id },
    data: {
      ...data,
      updatedAt: new Date(),
    },
  });
}

/**
 * Get single assessment (without file data)
 */
export async function getAssessment(id, userId = null) {
  const assessment = await prisma.assessment.findUnique({
    where: { id },
    include: {
      files: {
        select: {
          id: true,
          type: true,
          filename: true,
          mimeType: true,
          size: true,
          metadata: true,
          // Note: NOT including 'data' for performance
        },
      },
    },
  });

  // If userId provided, verify ownership (for private access)
  // If no userId, allow public access (for shared links)
  if (userId && assessment?.userId !== userId) {
    throw new Error('Unauthorized');
  }

  return assessment;
}

/**
 * Get assessment with full file data
 */
export async function getAssessmentWithFiles(id, userId) {
  const assessment = await prisma.assessment.findUnique({
    where: { id },
    include: {
      files: true, // Includes base64 data
    },
  });

  if (!assessment || assessment.userId !== userId) {
    throw new Error('Assessment not found or unauthorized');
  }

  return assessment;
}

/**
 * Get user's assessments (paginated)
 */
export async function getUserAssessments(userId, options = {}) {
  const {
    status = null,
    limit = 20,
    offset = 0,
    orderBy = 'updatedAt',
    order = 'desc',
  } = options;

  const where = {
    userId,
    status: status ? { in: status === 'ACTIVE' ? ['DRAFT', 'IN_PROGRESS', 'COMPLETE'] : [status] } : { not: 'ARCHIVED' },
  };

  const [assessments, total] = await Promise.all([
    prisma.assessment.findMany({
      where,
      orderBy: { [orderBy]: order },
      skip: offset,
      take: limit,
      include: {
        files: {
          where: { type: 'user_photo' },
          take: 1,
          select: {
            id: true,
            mimeType: true,
            // Include thumbnail data for preview
          },
        },
      },
    }),
    prisma.assessment.count({ where }),
  ]);

  return {
    assessments,
    total,
    hasMore: offset + assessments.length < total,
  };
}

/**
 * Archive (soft delete) assessment
 */
export async function archiveAssessment(id, userId) {
  const assessment = await prisma.assessment.findUnique({
    where: { id },
    select: { userId: true },
  });

  if (!assessment || assessment.userId !== userId) {
    throw new Error('Assessment not found or unauthorized');
  }

  return prisma.assessment.update({
    where: { id },
    data: { status: 'ARCHIVED' },
  });
}

/**
 * Permanently delete assessment and files
 */
export async function deleteAssessment(id, userId) {
  const assessment = await prisma.assessment.findUnique({
    where: { id },
    select: { userId: true },
  });

  if (!assessment || assessment.userId !== userId) {
    throw new Error('Assessment not found or unauthorized');
  }

  // Files will cascade delete due to relation
  return prisma.assessment.delete({
    where: { id },
  });
}

/**
 * Duplicate assessment
 */
export async function duplicateAssessment(id, userId) {
  const original = await prisma.assessment.findUnique({
    where: { id },
    include: { files: true },
  });

  if (!original || original.userId !== userId) {
    throw new Error('Assessment not found or unauthorized');
  }

  // Create new assessment
  const newAssessment = await prisma.assessment.create({
    data: {
      userId,
      status: 'DRAFT',
      currentStep: original.currentStep,
      location: original.location,
      weather: original.weather,
      building: original.building,
      structural: original.structural,
      aiAnalysis: original.aiAnalysis,
      results: null, // Don't copy results, user should recalculate
      metadata: {
        ...original.metadata,
        title: `Copy of ${original.metadata?.title || 'Assessment'}`,
        duplicatedFrom: original.id,
        duplicatedAt: new Date().toISOString(),
      },
    },
  });

  // Duplicate files
  if (original.files.length > 0) {
    await prisma.file.createMany({
      data: original.files.map((file) => ({
        userId,
        assessmentId: newAssessment.id,
        type: file.type,
        filename: file.filename,
        mimeType: file.mimeType,
        size: file.size,
        data: file.data,
        metadata: file.metadata,
      })),
    });
  }

  return newAssessment;
}
```

### Step 1.4: Create File Utilities

**File:** `lib/db/file.js`

```javascript
import prisma from '@/lib/prisma';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

/**
 * Save a file
 */
export async function saveFile({
  userId,
  assessmentId,
  type,
  filename,
  mimeType,
  data, // base64 string
  metadata = null,
}) {
  // Validate mime type
  if (!ALLOWED_TYPES.includes(mimeType)) {
    throw new Error(`Invalid file type: ${mimeType}`);
  }

  // Calculate size from base64
  const size = Math.ceil((data.length * 3) / 4);

  if (size > MAX_FILE_SIZE) {
    throw new Error(`File too large: ${size} bytes (max ${MAX_FILE_SIZE})`);
  }

  return prisma.file.create({
    data: {
      userId,
      assessmentId,
      type,
      filename,
      mimeType,
      size,
      data,
      metadata,
    },
  });
}

/**
 * Save multiple files
 */
export async function saveFiles(files) {
  return prisma.file.createMany({
    data: files.map((file) => ({
      userId: file.userId,
      assessmentId: file.assessmentId,
      type: file.type,
      filename: file.filename,
      mimeType: file.mimeType,
      size: Math.ceil((file.data.length * 3) / 4),
      data: file.data,
      metadata: file.metadata || null,
    })),
  });
}

/**
 * Get file with data
 */
export async function getFile(id) {
  return prisma.file.findUnique({
    where: { id },
  });
}

/**
 * Get file metadata only (fast)
 */
export async function getFileMetadata(id) {
  return prisma.file.findUnique({
    where: { id },
    select: {
      id: true,
      type: true,
      filename: true,
      mimeType: true,
      size: true,
      metadata: true,
      createdAt: true,
    },
  });
}

/**
 * Get files for assessment
 */
export async function getAssessmentFiles(assessmentId, type = null) {
  return prisma.file.findMany({
    where: {
      assessmentId,
      ...(type && { type }),
    },
    orderBy: { createdAt: 'asc' },
  });
}

/**
 * Delete file
 */
export async function deleteFile(id, userId) {
  const file = await prisma.file.findUnique({
    where: { id },
    select: { userId: true },
  });

  if (!file || file.userId !== userId) {
    throw new Error('File not found or unauthorized');
  }

  return prisma.file.delete({
    where: { id },
  });
}

/**
 * Delete all files for assessment
 */
export async function deleteAssessmentFiles(assessmentId) {
  return prisma.file.deleteMany({
    where: { assessmentId },
  });
}

/**
 * Update file's assessment link
 */
export async function linkFileToAssessment(fileId, assessmentId) {
  return prisma.file.update({
    where: { id: fileId },
    data: { assessmentId },
  });
}
```

---

## Phase 2: API Routes

### Step 2.1: Assessment Create API

**File:** `app/api/assessment/route.js`

```javascript
import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { createAssessment } from '@/lib/db/assessment';

export async function POST(request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const assessment = await createAssessment(userId);

    return NextResponse.json({
      success: true,
      assessmentId: assessment.id,
      status: assessment.status,
      currentStep: assessment.currentStep,
    });
  } catch (error) {
    console.error('Error creating assessment:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create assessment' },
      { status: 500 }
    );
  }
}
```

### Step 2.2: Assessment CRUD API

**File:** `app/api/assessment/[id]/route.js`

```javascript
import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import {
  getAssessment,
  updateAssessment,
  archiveAssessment,
} from '@/lib/db/assessment';

// GET - Fetch assessment
export async function GET(request, { params }) {
  try {
    const { id } = await params;
    const { userId } = await auth();

    // Allow public access for sharing (pass null userId)
    const assessment = await getAssessment(id, null);

    if (!assessment) {
      return NextResponse.json(
        { success: false, error: 'Assessment not found' },
        { status: 404 }
      );
    }

    // If archived and not owner, deny access
    if (assessment.status === 'ARCHIVED' && assessment.userId !== userId) {
      return NextResponse.json(
        { success: false, error: 'Assessment not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      assessment,
      isOwner: assessment.userId === userId,
    });
  } catch (error) {
    console.error('Error fetching assessment:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch assessment' },
      { status: 500 }
    );
  }
}

// PUT - Update assessment
export async function PUT(request, { params }) {
  try {
    const { id } = await params;
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const {
      step,
      location,
      weather,
      building,
      structural,
      aiAnalysis,
      results,
      metadata,
      status,
    } = body;

    const updateData = {};

    if (step !== undefined) updateData.currentStep = step;
    if (location !== undefined) updateData.location = location;
    if (weather !== undefined) updateData.weather = weather;
    if (building !== undefined) updateData.building = building;
    if (structural !== undefined) updateData.structural = structural;
    if (aiAnalysis !== undefined) updateData.aiAnalysis = aiAnalysis;
    if (results !== undefined) updateData.results = results;
    if (metadata !== undefined) updateData.metadata = metadata;
    if (status !== undefined) updateData.status = status;

    const assessment = await updateAssessment(id, userId, updateData);

    return NextResponse.json({
      success: true,
      assessmentId: assessment.id,
      status: assessment.status,
      currentStep: assessment.currentStep,
    });
  } catch (error) {
    console.error('Error updating assessment:', error);

    if (error.message === 'Assessment not found or unauthorized') {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 403 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Failed to update assessment' },
      { status: 500 }
    );
  }
}

// DELETE - Archive assessment
export async function DELETE(request, { params }) {
  try {
    const { id } = await params;
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await archiveAssessment(id, userId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting assessment:', error);

    if (error.message === 'Assessment not found or unauthorized') {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 403 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Failed to delete assessment' },
      { status: 500 }
    );
  }
}
```

### Step 2.3: Assessment History API

**File:** `app/api/assessment/history/route.js`

```javascript
import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { getUserAssessments } from '@/lib/db/assessment';

export async function GET(request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit') || '20', 10);
    const offset = parseInt(searchParams.get('offset') || '0', 10);

    const result = await getUserAssessments(userId, {
      status,
      limit: Math.min(limit, 100), // Cap at 100
      offset,
    });

    return NextResponse.json({
      success: true,
      ...result,
    });
  } catch (error) {
    console.error('Error fetching assessments:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch assessments' },
      { status: 500 }
    );
  }
}
```

### Step 2.4: Assessment Duplicate API

**File:** `app/api/assessment/[id]/duplicate/route.js`

```javascript
import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { duplicateAssessment } from '@/lib/db/assessment';

export async function POST(request, { params }) {
  try {
    const { id } = await params;
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const newAssessment = await duplicateAssessment(id, userId);

    return NextResponse.json({
      success: true,
      assessmentId: newAssessment.id,
      status: newAssessment.status,
    });
  } catch (error) {
    console.error('Error duplicating assessment:', error);

    if (error.message === 'Assessment not found or unauthorized') {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 403 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Failed to duplicate assessment' },
      { status: 500 }
    );
  }
}
```

### Step 2.5: File Upload API

**File:** `app/api/files/upload/route.js`

```javascript
import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { saveFile, saveFiles } from '@/lib/db/file';

export async function POST(request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();

    // Handle single or multiple files
    if (Array.isArray(body.files)) {
      const filesWithUser = body.files.map((file) => ({
        ...file,
        userId,
      }));

      await saveFiles(filesWithUser);

      return NextResponse.json({
        success: true,
        count: body.files.length,
      });
    }

    // Single file
    const file = await saveFile({
      userId,
      assessmentId: body.assessmentId,
      type: body.type,
      filename: body.filename,
      mimeType: body.mimeType,
      data: body.data,
      metadata: body.metadata,
    });

    return NextResponse.json({
      success: true,
      fileId: file.id,
    });
  } catch (error) {
    console.error('Error uploading file:', error);

    if (error.message.includes('Invalid file type') || error.message.includes('File too large')) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Failed to upload file' },
      { status: 500 }
    );
  }
}
```

### Step 2.6: File Get/Delete API

**File:** `app/api/files/[id]/route.js`

```javascript
import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { getFile, deleteFile } from '@/lib/db/file';

// GET - Fetch file data
export async function GET(request, { params }) {
  try {
    const { id } = await params;

    const file = await getFile(id);

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'File not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      file,
    });
  } catch (error) {
    console.error('Error fetching file:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch file' },
      { status: 500 }
    );
  }
}

// DELETE - Remove file
export async function DELETE(request, { params }) {
  try {
    const { id } = await params;
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await deleteFile(id, userId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting file:', error);

    if (error.message === 'File not found or unauthorized') {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 403 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Failed to delete file' },
      { status: 500 }
    );
  }
}
```

---

## Phase 3: Assessment Flow Integration

### Step 3.1: Update UserInputContext

This phase requires reviewing existing `context/UserInputContext.jsx` and adding:
- `assessmentId` state
- `saveToDatabase()` function
- `loadFromDatabase()` function
- Integration with each step

*Implementation details depend on current context structure.*

### Step 3.2: Update Step Components

Each step needs:
1. Check for `?id=` URL param on mount
2. Load existing data if present
3. Save data on "Continue" click
4. Update assessment status

*See plan.md for step-by-step tasks.*

---

## Phase 4: Dashboard UI

*See plan.md for detailed component specifications.*

Key components:
- `AssessmentCard.jsx`
- `AssessmentList.jsx`
- `EmptyState.jsx`
- `DashboardStats.jsx`
- `DeleteConfirmModal.jsx`
- `ShareDialog.jsx`

---

## Phase 5: Testing

### Test File Structure

```
__tests__/
├── db/
│   ├── assessment.test.js
│   └── file.test.js
├── api/
│   ├── assessment.test.js
│   └── files.test.js
├── components/
│   ├── AssessmentCard.test.jsx
│   └── AssessmentList.test.jsx
└── integration/
    └── assessment-flow.test.js
```

### Vitest Config

**File:** `vitest.config.js`

```javascript
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./vitest.setup.js'],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './'),
    },
  },
});
```

---

## Commands Reference

```bash
# Database
npx prisma db push          # Apply schema changes
npx prisma generate         # Generate client
npx prisma studio           # Visual data browser

# Development
npm run dev                 # Start dev server (port 3000)

# Testing
npm run test                # Run all tests
npm run test:watch          # Watch mode
npm run test:coverage       # Coverage report

# Build
npm run build               # Production build
```

---

## Success Checklist

When implementation is complete:

- [ ] User can create new assessment
- [ ] Assessment saves automatically at each step
- [ ] User can close browser and resume later
- [ ] Dashboard shows all user assessments
- [ ] Completed assessments have shareable URLs
- [ ] User can duplicate assessments
- [ ] User can delete assessments
- [ ] Share button copies URL to clipboard
- [ ] All API routes have authentication
- [ ] All tests pass
- [ ] No console errors in production

---

*This document is the authoritative implementation guide. Track progress in `action/tracking.md`.*
