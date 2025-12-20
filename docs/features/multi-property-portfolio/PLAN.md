# Multi-Property Portfolio - Implementation Plan

## Phase 1: Database Schema Updates

### Task 1.1: Add Portfolio Models to Prisma Schema
**File:** `prisma/schema.prisma`

Add the following models:

```prisma
// Property grouping for portfolio organization
model PropertyGroup {
  id              String              @id @default(cuid())
  userId          String              @map("user_id")
  name            String
  description     String?
  color           String?             @default("#3B82F6") // Blue default
  icon            String?             @default("folder") // Lucide icon name
  createdAt       DateTime            @default(now()) @map("created_at")
  updatedAt       DateTime            @updatedAt @map("updated_at")

  assessments     AssessmentGroup[]

  @@index([userId])
  @@map("property_groups")
}

model AssessmentGroup {
  assessmentId    String              @map("assessment_id")
  groupId         String              @map("group_id")
  addedAt         DateTime            @default(now()) @map("added_at")

  assessment      Assessment          @relation(fields: [assessmentId], references: [id], onDelete: Cascade)
  group           PropertyGroup       @relation(fields: [groupId], references: [id], onDelete: Cascade)

  @@id([assessmentId, groupId])
  @@map("assessment_groups")
}
```

### Task 1.2: Update Assessment Model
**File:** `prisma/schema.prisma`

Add to Assessment model:
```prisma
model Assessment {
  // ... existing fields ...

  // Portfolio enhancements
  nickname        String?             // Custom display name
  priority        Int                 @default(0) // Sort priority (higher = more important)
  tags            String[]            @default([]) // Free-form tags

  // Relation
  groups          AssessmentGroup[]
}
```

### Task 1.3: Run Migration
```bash
npx prisma migrate dev --name add_portfolio_features
```

---

## Phase 2: Server Actions

### Task 2.1: Portfolio Server Actions
**File:** `lib/actions/portfolio.js` (new file)

```javascript
'use server';

import { auth } from '@clerk/nextjs/server';
import prisma from '@/lib/db/prisma';
import { revalidatePath } from 'next/cache';

/**
 * Get portfolio summary with aggregate statistics
 */
export async function getPortfolioSummary() {
  const { userId } = await auth();
  if (!userId) return { success: false, error: 'Unauthorized' };

  const assessments = await prisma.assessment.findMany({
    where: { userId, status: { not: 'ARCHIVED' } },
    include: {
      safetyResult: { select: { overallScore: true, riskLevel: true } },
      location: { select: { city: true } },
      groups: { include: { group: true } },
    },
  });

  // Aggregate statistics
  const stats = {
    totalProperties: assessments.length,
    completed: assessments.filter(a => a.status === 'COMPLETE').length,
    inProgress: assessments.filter(a => a.status !== 'COMPLETE').length,
    byRisk: {
      low: 0,
      moderate: 0,
      high: 0,
      veryHigh: 0,
    },
    byCity: {},
    averageScore: 0,
    needsReassessment: 0,
  };

  let totalScore = 0;
  let scoredCount = 0;
  const oneYearAgo = new Date();
  oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

  assessments.forEach(a => {
    // Risk level counts
    const risk = a.safetyResult?.riskLevel?.toLowerCase()?.replace(' ', '') || 'unknown';
    if (stats.byRisk[risk] !== undefined) stats.byRisk[risk]++;

    // City counts
    const city = a.location?.city || 'Unknown';
    stats.byCity[city] = (stats.byCity[city] || 0) + 1;

    // Score average
    if (a.safetyResult?.overallScore) {
      totalScore += a.safetyResult.overallScore;
      scoredCount++;
    }

    // Reassessment check
    if (a.completedAt && new Date(a.completedAt) < oneYearAgo) {
      stats.needsReassessment++;
    }
  });

  stats.averageScore = scoredCount > 0 ? Math.round(totalScore / scoredCount) : null;

  return { success: true, stats, assessments };
}

/**
 * Create a new property group
 */
export async function createGroup(data) {
  const { userId } = await auth();
  if (!userId) return { success: false, error: 'Unauthorized' };

  const group = await prisma.propertyGroup.create({
    data: {
      userId,
      name: data.name.slice(0, 50),
      description: data.description?.slice(0, 200),
      color: data.color || '#3B82F6',
      icon: data.icon || 'folder',
    },
  });

  revalidatePath('/portfolio');
  return { success: true, group };
}

/**
 * Get all groups for current user
 */
export async function getGroups() {
  const { userId } = await auth();
  if (!userId) return { success: false, error: 'Unauthorized' };

  const groups = await prisma.propertyGroup.findMany({
    where: { userId },
    include: {
      assessments: {
        include: {
          assessment: {
            include: {
              safetyResult: { select: { riskLevel: true, overallScore: true } },
            },
          },
        },
      },
    },
    orderBy: { name: 'asc' },
  });

  return { success: true, groups };
}

/**
 * Add assessment to a group
 */
export async function addToGroup(assessmentId, groupId) {
  const { userId } = await auth();
  if (!userId) return { success: false, error: 'Unauthorized' };

  // Verify ownership
  const [assessment, group] = await Promise.all([
    prisma.assessment.findFirst({ where: { id: assessmentId, userId } }),
    prisma.propertyGroup.findFirst({ where: { id: groupId, userId } }),
  ]);

  if (!assessment || !group) {
    return { success: false, error: 'Not found or unauthorized' };
  }

  await prisma.assessmentGroup.upsert({
    where: { assessmentId_groupId: { assessmentId, groupId } },
    create: { assessmentId, groupId },
    update: {},
  });

  revalidatePath('/portfolio');
  return { success: true };
}

/**
 * Remove assessment from group
 */
export async function removeFromGroup(assessmentId, groupId) {
  const { userId } = await auth();
  if (!userId) return { success: false, error: 'Unauthorized' };

  await prisma.assessmentGroup.deleteMany({
    where: {
      assessmentId,
      groupId,
      group: { userId },
    },
  });

  revalidatePath('/portfolio');
  return { success: true };
}

/**
 * Delete a group (keeps assessments)
 */
export async function deleteGroup(groupId) {
  const { userId } = await auth();
  if (!userId) return { success: false, error: 'Unauthorized' };

  await prisma.propertyGroup.deleteMany({
    where: { id: groupId, userId },
  });

  revalidatePath('/portfolio');
  return { success: true };
}

/**
 * Update assessment tags
 */
export async function updateAssessmentTags(assessmentId, tags) {
  const { userId } = await auth();
  if (!userId) return { success: false, error: 'Unauthorized' };

  // Validate and sanitize tags
  const cleanTags = tags
    .slice(0, 10)
    .map(t => t.slice(0, 30).trim())
    .filter(t => t.length > 0);

  await prisma.assessment.updateMany({
    where: { id: assessmentId, userId },
    data: { tags: cleanTags },
  });

  revalidatePath('/portfolio');
  return { success: true };
}

/**
 * Update assessment nickname
 */
export async function updateAssessmentNickname(assessmentId, nickname) {
  const { userId } = await auth();
  if (!userId) return { success: false, error: 'Unauthorized' };

  await prisma.assessment.updateMany({
    where: { id: assessmentId, userId },
    data: { nickname: nickname?.slice(0, 100) || null },
  });

  revalidatePath('/portfolio');
  return { success: true };
}
```

### Task 2.2: Bulk Actions
**File:** `lib/actions/bulk.js` (new file)

```javascript
'use server';

import { auth } from '@clerk/nextjs/server';
import prisma from '@/lib/db/prisma';

/**
 * Get assessments for bulk export
 */
export async function getBulkExportData(assessmentIds) {
  const { userId } = await auth();
  if (!userId) return { success: false, error: 'Unauthorized' };

  const assessments = await prisma.assessment.findMany({
    where: {
      id: { in: assessmentIds },
      userId,
      status: 'COMPLETE',
    },
    include: {
      location: true,
      buildingInfo: true,
      safetyResult: true,
    },
  });

  return { success: true, assessments };
}

/**
 * Bulk update priority
 */
export async function bulkUpdatePriority(assessmentIds, priority) {
  const { userId } = await auth();
  if (!userId) return { success: false, error: 'Unauthorized' };

  await prisma.assessment.updateMany({
    where: { id: { in: assessmentIds }, userId },
    data: { priority },
  });

  return { success: true };
}
```

---

## Phase 3: UI Components

### Task 3.1: Portfolio Overview Page
**File:** `app/[locale]/(pages)/portfolio/page.jsx` (new file)

Mobile-first design with:
- Summary cards at top (total, by risk level)
- Filter pills (risk, city, status)
- View toggle (grid/list)
- Property cards with selection checkboxes
- Floating bulk action bar when items selected

### Task 3.2: Portfolio Components
**Directory:** `components/portfolio/` (new directory)

| Component | Purpose |
|-----------|---------|
| `PortfolioSummary.jsx` | Aggregate stats cards |
| `RiskDistributionChart.jsx` | Visual risk breakdown |
| `PropertyFilters.jsx` | Filter by risk/city/status |
| `PropertyGrid.jsx` | Grid layout for properties |
| `PropertyListItem.jsx` | List layout row |
| `GroupBadge.jsx` | Shows group membership |
| `BulkActionsBar.jsx` | Sticky bar for bulk actions |
| `CreateGroupModal.jsx` | Create/edit group dialog |
| `AddToGroupMenu.jsx` | Dropdown to add to group |

### Task 3.3: i18n Translations
**Files:** `messages/en.json`, `messages/tr.json`

Add Portfolio namespace with all UI strings.

---

## Phase 4: Navigation & Routing

### Task 4.1: Add Portfolio to Navigation
**File:** `components/navigation/Navbar.jsx`

Add portfolio link between Dashboard and Safety Hub.

### Task 4.2: Update Middleware
**File:** `middleware.ts`

Portfolio page requires authentication (not public).

---

## Phase 5: Testing & Polish

### Task 5.1: Verify Functionality
- Create 3+ assessments
- Create groups
- Add/remove from groups
- Filter by risk level
- Bulk select and export

### Task 5.2: Mobile Responsiveness
- Test on mobile viewport
- Ensure touch targets are adequate
- Test swipe gestures if applicable

### Task 5.3: Accessibility
- Keyboard navigation for selection
- Screen reader announcements for actions
- Focus management in modals

---

## Implementation Order

```
1. prisma/schema.prisma           # Add models
2. npx prisma migrate dev         # Run migration
3. lib/actions/portfolio.js       # Server actions
4. lib/actions/bulk.js            # Bulk actions
5. messages/en.json               # EN translations
6. messages/tr.json               # TR translations
7. components/portfolio/*         # UI components
8. app/[locale]/portfolio/page.jsx # Main page
9. components/navigation/Navbar.jsx # Add nav link
10. Build & test
```

---

## Files to Create

| File | Type | Description |
|------|------|-------------|
| `prisma/schema.prisma` | MODIFY | Add PropertyGroup, AssessmentGroup models |
| `lib/actions/portfolio.js` | CREATE | Portfolio server actions |
| `lib/actions/bulk.js` | CREATE | Bulk operation actions |
| `app/[locale]/(pages)/portfolio/page.jsx` | CREATE | Main portfolio page |
| `components/portfolio/PortfolioSummary.jsx` | CREATE | Stats summary |
| `components/portfolio/PropertyFilters.jsx` | CREATE | Filter controls |
| `components/portfolio/PropertyGrid.jsx` | CREATE | Grid/list view |
| `components/portfolio/BulkActionsBar.jsx` | CREATE | Bulk actions |
| `components/portfolio/CreateGroupModal.jsx` | CREATE | Group management |
| `components/navigation/Navbar.jsx` | MODIFY | Add portfolio link |
| `messages/en.json` | MODIFY | Add EN translations |
| `messages/tr.json` | MODIFY | Add TR translations |

---

## Security Checklist

- [x] All actions verify `userId` from auth()
- [x] Group/assessment operations verify ownership
- [x] Input sanitization (name, tags length limits)
- [x] No SQL injection (using Prisma)
- [x] Rate limiting consideration for bulk operations
