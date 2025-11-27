# User Dashboard & Data Persistence Strategy

## Executive Summary

This document explores why QuakeWise must store assessment data in a database and what value this creates for users, the platform, and the business.

---

## Part 1: Why Store Data?

### Current State (Problem)
- Assessments exist only in browser localStorage
- User loses everything if they clear browser data
- No way to access assessments from different devices
- No history, no comparisons, no portfolio management
- We lose valuable data that could improve our AI

### The Fundamental Question
> "If a user spends 10 minutes providing building photos, location, and details... shouldn't that assessment belong to THEM permanently?"

**Answer: Absolutely yes.**

---

## Part 2: User Value Propositions

### 2.1 Assessment History
**What users get:**
- See all past assessments in one place
- Track assessment dates and changes over time
- Never lose their work
- Access from any device (phone, tablet, computer)

**Real scenario:**
> User does assessment on phone while standing at building.
> Later, wants to show landlord the results on their laptop.
> Currently: IMPOSSIBLE. With database: Just log in.

### 2.2 Building Portfolio
**What users get:**
- Property investors can track multiple buildings
- Real estate agents can manage client properties
- Families can assess all properties they're considering buying

**Real scenario:**
> Family shopping for homes. They visit 5 houses over 2 weekends.
> Do QuakeWise assessment at each one.
> Later, compare all 5 side-by-side: "House 3 has best score, House 1 is risky"

### 2.3 Duplicate & Edit
**What users get:**
- "What if I add a retrofit?" - duplicate assessment, modify, compare
- Track improvement over time after actual renovations
- Test scenarios: "What if building was 10 years newer?"

**Real scenario:**
> User gets score of 62%. Sees recommendation: "Add shear walls"
> Duplicates assessment, marks "shear walls added"
> New score: 78%. Now they know the ROI of the retrofit.

### 2.4 Share & Collaborate
**What users get:**
- Share assessment link with others (family, engineers, buyers)
- Generate professional PDF reports
- Export data for insurance or municipal applications

**Real scenario:**
> User selling home. Buyer wants earthquake safety proof.
> User shares QuakeWise report link.
> Buyer sees: verified assessment, score, recommendations.
> Deal closes faster.

### 2.5 Re-assessment Reminders
**What users get:**
- "It's been 2 years since your assessment - buildings age, codes change"
- After major earthquake in region: "Your building area was affected - re-assess?"
- After platform AI improvement: "We can now detect more - re-assess for free?"

---

## Part 3: Platform Value Propositions

### 3.1 AI Training Data
**Every assessment teaches us:**
- What building types exist in which regions
- Common construction patterns by decade
- Photo quality patterns (what angles work best)
- Which AI detections users correct (where we're wrong)

### 3.2 Regional Risk Mapping
**Aggregate anonymous data to show:**
- "68% of buildings in Antalya are pre-1999 code"
- "This neighborhood has 40% soft-story buildings"
- Valuable for municipalities, disaster preparedness

### 3.3 User Engagement & Retention
**With stored data:**
- Users have reason to return
- We can email: "Your assessment from 6 months ago..."
- Build long-term relationship, not one-time tool

### 3.4 Premium Features Foundation
**Database enables monetization:**
- Free: 3 assessments
- Premium: Unlimited + PDF reports + comparison tools
- Enterprise: API access + bulk assessments + white-label

---

## Part 4: Data Model Reasoning

### What to Store Per Assessment

```
Assessment {
  id: UUID (shareable link: /result/abc123)
  userId: FK to User
  createdAt: timestamp
  updatedAt: timestamp
  status: 'draft' | 'in_progress' | 'complete' | 'archived'
  currentStep: 1-4

  // Location Data
  location: {
    latitude, longitude
    address, city, country
    seismicZone
    soilType
  }

  // Building Data
  building: {
    type
    stories
    yearBuilt
    modifications
    dimensions (optional)
  }

  // AI Analysis Data
  aiAnalysis: {
    photos: [{ url, analyzed, results }]
    confidence
    buildingCharacteristics
    irregularities
    recommendations
  }

  // Results
  results: {
    safetyScore
    grade (A-F)
    keyFindings
    recommendations
    calculationDetails (for experts)
  }

  // Metadata
  metadata: {
    version: "1.0" (for future migrations)
    source: 'web' | 'api' | 'mobile'
    duplicatedFrom: UUID (if cloned)
  }
}
```

### Why Store at Each Step?

| Step | Store Immediately? | Reason |
|------|-------------------|--------|
| 1. Location | YES | Expensive: GPS, Street View API calls, seismic lookup |
| 2. Photos | YES | Very expensive: AI analysis costs money |
| 3. Confirm | YES | User corrections improve our AI |
| 4. Optional | YES | Any detail helps accuracy |
| Results | YES | The whole point - user's permanent record |

**Key insight:** If user closes browser at step 3, they shouldn't lose steps 1-2.

---

## Part 5: User Dashboard Features

### 5.1 Assessment List View
```
My Assessments (3)
─────────────────────────────────────────
📍 123 Main St, Istanbul          Score: 78%  ✓ Complete
   Created: Nov 15, 2025          Grade: B

📍 45 Beach Rd, Antalya           Score: 62%  ✓ Complete
   Created: Nov 20, 2025          Grade: C

📍 Draft Assessment               Step 2/4    ⏳ In Progress
   Created: Nov 26, 2025

[+ New Assessment]
```

### 5.2 Quick Actions
- **View** - See full results
- **Duplicate** - Clone and modify
- **Share** - Get shareable link
- **Download PDF** - Professional report
- **Delete** - Remove from account
- **Archive** - Hide but keep data

### 5.3 Comparison View
```
Compare Assessments
─────────────────────────────────────────
                  | 123 Main St | 45 Beach Rd
──────────────────|─────────────|────────────
Safety Score      |    78%      |    62%
Grade             |     B       |     C
Stories           |     4       |     6
Building Type     |   Concrete  |   Masonry
Year Built        |    2005     |    1985
Seismic Zone      |   Zone 2    |   Zone 1
──────────────────|─────────────|────────────
Verdict: 123 Main St is safer choice
```

### 5.4 Portfolio Analytics (Premium)
```
Your Portfolio Overview
─────────────────────────────────────────
Total Buildings Assessed: 8
Average Safety Score: 71%

Risk Distribution:
  A (Excellent): 1 building
  B (Good): 3 buildings
  C (Fair): 2 buildings
  D (Poor): 1 building
  F (Critical): 1 building  ⚠️

Recommendation: 2 buildings need immediate attention
[View High-Risk Buildings]
```

---

## Part 6: Business Model Impact

### Free Tier
- 3 assessments stored
- Basic results view
- 30-day data retention for drafts

### Premium ($9.99/month)
- Unlimited assessments
- Permanent storage
- PDF reports
- Comparison tools
- Priority AI processing

### Enterprise (Custom pricing)
- API access
- Bulk assessments
- White-label option
- Custom integrations
- Dedicated support

### Why This Works
1. Free tier is genuinely useful (not crippled)
2. Power users (investors, agents) naturally need Premium
3. Database enables the premium features
4. No database = no premium = no revenue

---

## Part 7: Technical Implementation Path

### Phase 1: Basic Persistence
1. Add Prisma schema for Assessment
2. Save assessment on each step completion
3. Load assessment from database on page load
4. Basic dashboard with list view

### Phase 2: User Experience
1. Draft auto-save (debounced)
2. Resume incomplete assessments
3. Duplicate assessment feature
4. Share assessment link

### Phase 3: Premium Features
1. PDF generation
2. Comparison view
3. Portfolio analytics
4. Export functionality

### Phase 4: Advanced
1. Re-assessment reminders
2. Regional insights
3. AI improvement loop
4. API for third parties

---

## Part 8: Privacy & Security Considerations

### What We Store
- Location data (with consent)
- Building photos (user-uploaded)
- Assessment results

### What We DON'T Store
- Exact user address in analytics
- Photos beyond assessment context
- Personal identification without consent

### User Controls
- Delete assessment anytime
- Export all data (GDPR compliance)
- Control sharing permissions
- Opt-out of anonymous analytics

---

## Conclusion

### Storing assessment data is not optional - it's foundational.

Without database:
- One-time tool
- No user loyalty
- No premium features
- No business model
- No AI improvement

With database:
- Personal building safety portfolio
- Reason to return
- Premium tier justification
- Data-driven platform improvement
- Real business value

### Recommended Next Steps

1. **Immediate:** Design Prisma schema for assessments
2. **This week:** Implement save-on-step-complete
3. **Next week:** Basic dashboard with assessment list
4. **Following:** Duplicate, share, PDF features

---

## Appendix: User Stories

### Story 1: The Home Buyer
> "I'm looking at 5 houses. I want to assess each one and compare their earthquake safety scores before making an offer."

**Requires:** Assessment storage, comparison view

### Story 2: The Property Manager
> "I manage 20 buildings. I need to track all their safety scores and know which ones need retrofit attention."

**Requires:** Portfolio view, bulk assessment, risk alerts

### Story 3: The Homeowner
> "I did an assessment last year. Now I want to update it after adding earthquake straps to my water heater."

**Requires:** Assessment history, duplicate & edit

### Story 4: The Real Estate Agent
> "I want to share QuakeWise reports with my clients as part of the home-buying process."

**Requires:** Shareable links, professional PDF reports

### Story 5: The Insurance Company
> "We want to offer earthquake insurance discounts based on QuakeWise scores."

**Requires:** API access, verified assessments, integration

---

*Document created: November 2025*
*Last updated: November 26, 2025*
