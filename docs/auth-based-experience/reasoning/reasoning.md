# Auth-Based Experience - Reasoning Document

> **Document Type:** WHY Document
> **Purpose:** Define WHY we need this feature, WHAT we currently have, and WHAT we expect
> **Created:** November 2025
> **Next Step:** After completing this, create `plan.md`

---

## 1. Problem Statement

### What is the core problem?

**The Problem:**
> Currently, both logged-in users and guests see the same homepage and navigation. This creates a confusing experience where:
> - New visitors see features they can't use without signing up
> - Returning users see marketing content meant for new visitors
> - The navigation doesn't adapt to user context (draft assessments, history, etc.)

**Current User Experience:**
```
Guest visits homepage → Sees full marketing content → Clicks "Start Assessment"
                                                            ↓
Logged-in user visits homepage → Sees same marketing content → Has to navigate to Dashboard separately
```

### Why is this unacceptable?

1. **Friction for returning users**: Logged-in users must navigate away from homepage to access their work
2. **Wasted real estate**: Showing marketing content to already-converted users wastes screen space
3. **Missed engagement opportunities**: Could show personalized content, recent assessments, or progress
4. **Cognitive load**: Users have to figure out where to go rather than being guided

---

## 2. Current State Analysis

### What We Have Now

| Component | Current State | Problem |
|-----------|---------------|---------|
| Homepage (/) | Marketing-focused, same for all | Doesn't adapt to auth state |
| Navbar | Smart but same structure for all | Could show different actions |
| Dashboard | Separate page, opt-in navigation | Not immediately visible |
| Assessment flow | Same entry point for all | Could streamline for returning users |

### What Works Well (Don't Break These)

- Marketing homepage is effective for new visitors
- Smart navbar already has quick-resume functionality
- Dashboard shows user's assessments well
- Assessment flow is smooth once started

### What's Missing

- Context-aware homepage content for logged-in users
- Quick-access to recent/in-progress assessments from homepage
- Personalized greeting and stats on homepage
- Different CTA hierarchy for new vs returning users

---

## 3. Requirements

### Must Have (Critical)

1. **Conditional Homepage Content**
   - Description: Show different hero/content based on auth state
   - User benefit: See relevant content immediately

2. **Quick Resume Widget**
   - Description: Homepage shows in-progress assessments for logged-in users
   - User benefit: Continue work with one click from homepage

3. **Personalized Stats Display**
   - Description: Show user's assessment count, average score on homepage
   - User benefit: Immediate sense of progress and engagement

### Should Have (Important)

4. **Different CTA Hierarchy**
   - Description: "Continue Assessment" primary for logged-in, "Start Assessment" for guests
   - User benefit: Most relevant action is most prominent

5. **Recent Assessments Preview**
   - Description: Show last 2-3 assessments on logged-in homepage
   - User benefit: Quick access without navigating to dashboard

### Nice to Have (Future)

6. **Personalized Recommendations**
   - Description: Suggest next steps based on assessment history
   - Why deferred: Requires more complex logic, defer to V2

---

## 4. Expected Outcome

### Target User Experience

**Before (Current):**
```
Logged-in user → Homepage with marketing → Click Dashboard → See assessments → Continue work
```

**After (Target):**
```
Logged-in user → Personalized homepage → See recent assessments → Click to continue directly
```

### Success Metrics

| Metric | Target | How to Measure |
|--------|--------|----------------|
| Time to continue assessment | < 2 clicks | User testing |
| Homepage engagement | Higher for logged-in | Analytics |
| Dashboard bounce rate | Decrease | Analytics |

### What "Done" Looks Like

- [ ] Guest homepage shows current marketing content
- [ ] Logged-in homepage shows personalized content
- [ ] Quick resume visible on homepage for logged-in users
- [ ] Recent assessments shown on homepage
- [ ] Stats (completed, in-progress, avg score) shown
- [ ] Navigation adapts appropriately

---

## 5. Constraints

### Technical Constraints

- Must use Clerk's `useUser` hook for auth state
- Server components need `auth()` from Clerk
- Homepage currently uses `'use client'` directive

### Business Constraints

- Should not break existing user flows
- Marketing content still needed for SEO/new visitors

### Dependencies

- Clerk authentication (already implemented)
- Dashboard stats API (already implemented - `getDashboardStats`)
- Draft assessment API (already implemented - `getLastDraftAssessment`)

---

## 6. Open Questions

1. **How much content should differ?**
   - Options: A) Just hero section B) Hero + features C) Completely different page
   - Leaning toward: B) Hero + key sections
   - Need to research: Current conversion funnel

2. **Separate route or conditional rendering?**
   - Options: A) Same `/` with conditions B) `/` for guests, `/home` for logged-in
   - Leaning toward: A) Same route with conditions
   - Reason: Simpler routing, better SEO

---

## 7. Summary

### WHY We Need This
> Logged-in users currently see marketing content designed for new visitors, creating friction and missed opportunities for engagement. We need personalized experiences based on authentication state.

### WHAT We Have
> A single homepage that serves all users identically, with dashboard/assessments available through navigation. Smart navbar exists but homepage doesn't leverage user context.

### WHAT We Need
> Conditional homepage rendering that shows personalized content (recent assessments, stats, quick-resume) for logged-in users while preserving marketing focus for guests.

### WHAT We Expect
> Logged-in users can access and continue their work directly from homepage, reducing clicks and improving engagement. Guests still see effective marketing content.

---

## Checklist Before Moving to plan.md

- [x] Problem is clearly defined in user terms
- [x] Current state is documented honestly
- [x] Requirements are prioritized (must/should/nice)
- [x] Success metrics are measurable
- [x] Constraints are identified
- [x] Open questions are listed

**Next Step:** Create `plan.md` to define HOW to solve this problem.
