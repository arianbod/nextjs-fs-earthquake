# Multi-Property Portfolio - Reasoning Document (North Star)

## 1. The Idea

### What is it?
A portfolio management system that allows users (property managers, real estate investors, families with multiple properties) to organize, view, and manage multiple building assessments from a centralized dashboard.

### Why does it matter?
Currently, users with multiple properties must scroll through a flat list of assessments. This feature transforms QuakeWise from a single-property tool into an enterprise-ready portfolio manager for:
- **Real estate investors** managing 5-50+ rental properties
- **Property managers** overseeing multiple buildings for clients
- **Families** with multiple homes (primary residence, vacation home, inherited properties)
- **Small businesses** with multiple locations

### The Core Value Proposition
> "See your entire earthquake risk exposure across all properties at a glance, prioritize where to invest in safety, and share access with stakeholders who need it."

---

## 2. User Experience Vision

### Primary User Stories

#### Story 1: Portfolio Overview
```
As a property investor with 12 rental properties,
I want to see my aggregate earthquake risk across all buildings,
So that I can prioritize which properties need attention first.
```

#### Story 2: Property Grouping
```
As a property manager handling buildings in Istanbul and Izmir,
I want to group properties by city and risk level,
So that I can create targeted action plans for each region.
```

#### Story 3: Team Access
```
As a building owner who works with a structural engineer,
I want to share my portfolio (or specific properties) with my engineer,
So that they can review assessments and provide recommendations.
```

#### Story 4: Bulk Actions
```
As someone with 8 properties assessed over the past year,
I want to export all my assessment reports at once,
So that I can share them with my insurance company.
```

### User Flow

```
Dashboard → Portfolio Overview
    ├── Aggregate Risk Summary Card
    │   ├── Total Properties: 12
    │   ├── Average Score: 68%
    │   ├── High Risk: 3 | Medium: 5 | Low: 4
    │   └── Prioritized Action Items: 7
    │
    ├── Quick Filters
    │   ├── By Risk Level (All | High | Medium | Low)
    │   ├── By Location (All | Istanbul | Izmir | Antalya)
    │   └── By Status (Assessed | Needs Reassessment | Draft)
    │
    ├── Property Cards Grid/List Toggle
    │   ├── Compact view (more properties visible)
    │   └── Detailed view (more info per property)
    │
    └── Bulk Actions Bar (when items selected)
        ├── Export Selected (PDF/CSV)
        ├── Set Reassessment Reminders
        ├── Create Group
        └── Share with Team Member
```

---

## 3. Technical Approach

### Database Schema Changes

```prisma
// New model: Property Groups
model PropertyGroup {
  id              String              @id @default(cuid())
  userId          String              @map("user_id")
  name            String              // "Istanbul Properties", "High Priority"
  description     String?
  color           String?             // For UI badge color
  createdAt       DateTime            @default(now())
  updatedAt       DateTime            @updatedAt

  // Relation to assessments (many-to-many)
  assessments     AssessmentGroup[]

  @@index([userId])
  @@map("property_groups")
}

model AssessmentGroup {
  assessmentId    String              @map("assessment_id")
  groupId         String              @map("group_id")
  addedAt         DateTime            @default(now())

  assessment      Assessment          @relation(fields: [assessmentId], references: [id], onDelete: Cascade)
  group           PropertyGroup       @relation(fields: [groupId], references: [id], onDelete: Cascade)

  @@id([assessmentId, groupId])
  @@map("assessment_groups")
}

// New model: Team Access / Sharing
model PortfolioShare {
  id              String              @id @default(cuid())
  ownerId         String              @map("owner_id")     // User who owns
  sharedWithEmail String              @map("shared_with_email")
  sharedWithId    String?             @map("shared_with_id") // Filled when user signs up

  // Access level
  accessLevel     ShareAccessLevel    @default(VIEW_ONLY)

  // Scope: all portfolio or specific assessments/groups
  scopeType       ShareScopeType      @default(ALL_PORTFOLIO)
  scopedIds       String[]            // Assessment or group IDs if scoped

  // Status
  status          ShareStatus         @default(PENDING)
  invitedAt       DateTime            @default(now())
  acceptedAt      DateTime?
  expiresAt       DateTime?           // Optional expiration

  @@unique([ownerId, sharedWithEmail])
  @@index([sharedWithEmail])
  @@index([sharedWithId])
  @@map("portfolio_shares")
}

enum ShareAccessLevel {
  VIEW_ONLY       // Can view assessments
  COMMENT         // Can view + add notes
  EDIT            // Can modify assessments
  ADMIN           // Full access including sharing
}

enum ShareScopeType {
  ALL_PORTFOLIO
  SPECIFIC_ASSESSMENTS
  SPECIFIC_GROUPS
}

enum ShareStatus {
  PENDING
  ACCEPTED
  REVOKED
  EXPIRED
}
```

### Modifications to Existing Assessment Model

```prisma
model Assessment {
  // ... existing fields ...

  // New relation for groups
  groups          AssessmentGroup[]

  // Portfolio metadata
  nickname        String?             // User-friendly name beyond title
  priority        Int?                @default(0) // For manual sorting
  tags            String[]            // Free-form tags for filtering
}
```

### Server Actions Required

1. **Portfolio Actions** (`lib/actions/portfolio.js`)
   - `getPortfolioSummary()` - Aggregate stats across all assessments
   - `getGroupedAssessments()` - Assessments organized by groups
   - `createGroup()`, `updateGroup()`, `deleteGroup()`
   - `addToGroup()`, `removeFromGroup()`

2. **Sharing Actions** (`lib/actions/sharing.js`)
   - `inviteToPortfolio()` - Send email invite
   - `acceptInvite()` - Accept share invitation
   - `revokeAccess()` - Remove access
   - `getSharedWithMe()` - Portfolios shared with current user
   - `getMyShares()` - Who I've shared with

3. **Bulk Actions** (`lib/actions/bulk.js`)
   - `bulkExport()` - Generate PDF/CSV for multiple assessments
   - `bulkSetReminders()` - Set reassessment reminders
   - `bulkUpdateTags()` - Add/remove tags from multiple

---

## 4. UI Components

### New Components

```
/components/portfolio/
├── PortfolioOverview.jsx       # Main dashboard with aggregate stats
├── PortfolioSummaryCard.jsx    # Aggregate risk visualization
├── PropertyGrid.jsx            # Grid/list toggle view
├── PropertyFilters.jsx         # Filter by risk, location, status
├── GroupManagement.jsx         # Create/edit groups modal
├── BulkActionsBar.jsx          # Actions when items selected
├── ShareModal.jsx              # Invite team members
├── SharedWithBadge.jsx         # Show who has access
└── PriorityList.jsx            # Prioritized maintenance view
```

### Updated Components

```
/components/dashboard/
├── AssessmentCard.jsx          # Add checkbox, group badge
└── DashboardStats.jsx          # Integrate with portfolio stats
```

### New Pages

```
/app/[locale]/(pages)/portfolio/
├── page.jsx                    # Main portfolio view
├── groups/
│   └── page.jsx                # Group management
├── shared/
│   └── page.jsx                # Shared portfolios (from others)
└── team/
    └── page.jsx                # Team access management
```

---

## 5. Security Considerations

### Access Control
- Portfolio shares must validate both owner AND recipient
- Scoped shares must verify assessment/group belongs to owner
- Expired shares must be checked on every access
- Rate limit invite emails (prevent spam)

### Data Privacy
- Shared users should NOT see owner's personal info beyond name
- Email addresses for invites must be validated
- Consider GDPR: ability to revoke and remove shared data

### Input Validation
- Group names: max 50 chars, sanitize HTML
- Tags: max 10 tags per assessment, 30 chars each
- Share emails: valid format, not own email

---

## 6. Success Metrics

1. **Adoption**: % of users with 3+ assessments who use groups
2. **Engagement**: Average groups created per portfolio user
3. **Sharing**: % of portfolios with at least one share
4. **Retention**: Do portfolio users return more frequently?
5. **Time Saved**: Reduction in time to export multiple reports

---

## 7. MVP Scope (Phase 1)

### Must Have
- [ ] Portfolio overview with aggregate risk stats
- [ ] Filter assessments by risk level
- [ ] Basic grouping (create, add/remove assessments)
- [ ] Bulk export to PDF

### Nice to Have (Phase 2)
- [ ] Team sharing with email invites
- [ ] Location-based filtering
- [ ] Custom tags
- [ ] Reassessment reminder scheduling

### Future (Phase 3)
- [ ] Role-based access (viewer, editor, admin)
- [ ] Portfolio comparison reports
- [ ] Integration with property management systems
- [ ] White-label reports for property managers

---

## 8. Open Questions

1. **Pricing**: Should portfolio features be premium-only?
2. **Limits**: Max properties per portfolio? Max shares?
3. **Notifications**: Email or just in-app for share invites?
4. **Mobile**: How does grouping work on mobile?

---

## Decision Log

| Date | Decision | Rationale |
|------|----------|-----------|
| TBD | MVP focuses on grouping + stats | Core value without complexity of sharing |
| TBD | Groups are flat (no nesting) | Simplicity, can add hierarchy later |
| TBD | Bulk actions via selection, not groups | More flexible for ad-hoc operations |
