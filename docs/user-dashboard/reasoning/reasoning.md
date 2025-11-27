# User Dashboard Feature - Reasoning Document

> **Purpose:** Define WHY we need this feature, WHAT we currently have, WHAT we need, and WHAT we expect at the end.

---

## 1. The Problem Statement

### What is the core problem?

**Users complete earthquake safety assessments but have no way to:**
- Access them later
- Access them from other devices
- Compare multiple assessments
- Share results with others
- Track changes over time

**Current reality:**
> User spends 5-10 minutes uploading photos, confirming AI data, completing assessment.
> They close browser.
> Everything is GONE.

This is unacceptable for a serious safety tool.

---

## 2. Current State Analysis

### What We Have Now

| Component | Current State | Problem |
|-----------|--------------|---------|
| **Data Storage** | localStorage only | Browser-specific, easily lost |
| **Assessment Flow** | 4 steps, works well | No persistence between sessions |
| **Results Page** | Shows score, findings | No way to return to it later |
| **User Auth** | Clerk integration exists | Not connected to data storage |
| **Database** | Prisma + Neon PostgreSQL | Exists but assessments not stored |
| **Dashboard Page** | `/dashboard` route exists | Empty/placeholder |
| **History Page** | `/history` route exists | Non-functional |

### What Works Well
- Assessment flow is smooth (4 steps)
- AI analysis is accurate
- Results page is informative
- Authentication is working (Clerk)
- Database connection exists (Prisma/Neon)

### What's Missing
- No `Assessment` model in database
- No API to save/load assessments
- No functional dashboard
- No history view
- No share functionality

---

## 3. What We Need

### Core Requirements (Must Have)

1. **Persistent Storage**
   - Save assessment data in PostgreSQL
   - Generate unique ID for each assessment
   - Link assessments to user accounts

2. **Resume Capability**
   - User can close browser mid-assessment
   - Return later and continue from where they left
   - No re-uploading photos or re-entering data

3. **Assessment History**
   - View all past assessments
   - See status (draft, complete)
   - Basic metadata (date, address, score)

4. **Access Results Anytime**
   - Shareable URL for each assessment
   - Works across devices
   - Permanent (doesn't expire)

### Secondary Requirements (Should Have)

5. **Duplicate Assessment**
   - Clone existing assessment
   - Modify and re-calculate
   - Compare original vs modified

6. **Delete/Archive**
   - User can remove assessments
   - Soft delete (archive) option

7. **Basic Dashboard**
   - List of assessments
   - Quick stats (total, average score)
   - Quick actions (view, duplicate, delete)

### Future Requirements (Nice to Have)

8. **PDF Export**
   - Professional report generation
   - Downloadable certificate

9. **Comparison View**
   - Side-by-side comparison of 2+ assessments
   - Visual diff of scores/findings

10. **Portfolio Analytics**
    - Aggregate statistics
    - Risk distribution charts

---

## 4. What We Expect at End of This Feature

### User Experience

**Before (Current):**
```
User completes assessment → Sees results → Closes browser → Lost forever
```

**After (Target):**
```
User completes assessment → Saved automatically → Unique URL generated
                         → Visible in dashboard → Accessible forever
                         → Can share, duplicate, return anytime
```

### Technical Deliverables

1. **Database Schema**
   - `Assessment` model with all fields
   - Proper relations to User
   - Indexes for performance

2. **API Routes**
   - `POST /api/assessment/save` - Save/update assessment
   - `GET /api/assessment/[id]` - Get single assessment
   - `GET /api/assessment/history` - Get user's assessments
   - `DELETE /api/assessment/[id]` - Delete assessment

3. **Updated Assessment Flow**
   - Generate assessmentId at start
   - Save at each step completion
   - Load from DB on page load

4. **Dashboard Page**
   - Assessment list with metadata
   - Quick actions
   - Empty state for new users

5. **Updated Results Page**
   - Load from database
   - Show shareable URL
   - Add duplicate/share buttons

### Success Metrics

| Metric | Target |
|--------|--------|
| Assessment data persists across sessions | 100% |
| User can access past assessments | Yes |
| Shareable links work | Yes |
| No data loss on browser close | Yes |
| Dashboard loads in < 2 seconds | Yes |

---

## 5. Questions to Answer in Planning Phase

1. **Data Model:** What exact fields does Assessment need?
2. **Save Timing:** Save after each step or only at completion?
3. **Draft Handling:** How long to keep incomplete assessments?
4. **Storage Limits:** Any limits on free tier?
5. **Image Storage:** Where to store uploaded photos? (DB? S3? Vercel Blob?)
6. **Performance:** How to handle large assessment data efficiently?
7. **Migration:** How to handle existing localStorage data?
8. **Privacy:** What data can be shared? What's private?

---

## 6. Constraints & Considerations

### Technical Constraints
- Using Neon PostgreSQL (serverless, has connection limits)
- Vercel deployment (serverless functions, 10s timeout)
- Clerk for auth (need to sync user IDs)
- Current Prisma schema needs extension

### Business Constraints
- Free tier should be useful (not crippled)
- Premium features need clear value proposition
- GDPR compliance for EU users

### Time Constraints
- This is foundational - should be done properly
- Not rushing, but not over-engineering

---

## 7. References & Research Needed

### Similar Products to Study
- [ ] How does Zillow store home valuations?
- [ ] How does Notion handle document persistence?
- [ ] How do form builders (Typeform, JotForm) handle submissions?

### Technical Research
- [ ] Prisma best practices for JSON fields
- [ ] Vercel Blob vs S3 for image storage
- [ ] PostgreSQL JSONB performance considerations

---

## 8. Summary

### WHY We Need This
Users deserve to keep their assessment data permanently. A safety tool without persistence is unreliable.

### WHAT We Have
Working assessment flow, auth, database connection - but no data persistence.

### WHAT We Need
Database storage, API routes, dashboard UI, history view.

### WHAT We Expect
Users can complete assessments, close browser, return anytime, share with others, compare multiple buildings.

---

*Next Step: Create plan.md with actionable implementation steps based on this reasoning.*
