# {{FEATURE_NAME}} - Plan Document

> **Document Type:** HOW Document
> **Purpose:** Define HOW to implement based on reasoning.md
> **Prerequisite:** Complete `reasoning.md` first
> **Next Step:** After completing this, create `result.md`

---

## Instructions

This document answers HOW to solve the problem defined in reasoning.md. Focus on technical decisions, not re-explaining the problem.

**Time estimate:** 45-90 minutes

---

## 1. Solution Overview

### High-Level Approach

<!-- One paragraph describing the overall solution strategy -->

### Architecture Diagram

```
[Draw a simple ASCII diagram of the solution]
Example:
┌──────────┐     ┌──────────┐     ┌──────────┐
│  Input   │ ──▶ │ Process  │ ──▶ │  Output  │
└──────────┘     └──────────┘     └──────────┘
```

### Key Components

| Component | Purpose | New/Modify |
|-----------|---------|------------|
| [Name] | [What it does] | New / Modify existing |
| [Name] | [What it does] | New / Modify existing |

---

## 2. Technical Decisions

### Decision 1: [Topic]

**Options Considered:**
- A) [Option A description]
- B) [Option B description]
- C) [Option C description]

**Decision:** Option [X]

**Reasoning:**
- [Why this option]
- [Trade-offs accepted]

### Decision 2: [Topic]

**Options Considered:**
- A) [Option A description]
- B) [Option B description]

**Decision:** Option [X]

**Reasoning:**
- [Why this option]
- [Trade-offs accepted]

<!-- Add more decisions as needed -->

---

## 3. Data Model

### New Models/Tables

```
[Schema definition - Prisma, SQL, or pseudocode]
Example:
model FeatureName {
  id        String   @id
  field1    String
  field2    Json?
  createdAt DateTime @default(now())
}
```

### Model Relationships

```
[Diagram showing relationships]
User 1──▶ N Feature
Feature 1──▶ 1 Detail
```

### Data Migration

<!-- If modifying existing data -->

- [ ] Migration needed: Yes/No
- [ ] Backward compatible: Yes/No
- [ ] Rollback plan: [Describe]

---

## 4. API Design

### Endpoints

| Method | Route | Purpose | Auth Required |
|--------|-------|---------|---------------|
| POST | `/api/...` | [Purpose] | Yes/No |
| GET | `/api/...` | [Purpose] | Yes/No |
| DELETE | `/api/...` | [Purpose] | Yes/No |

### Request/Response Contracts

**POST /api/[endpoint]**

```json
// Request
{
  "field1": "value",
  "field2": {}
}

// Response (Success)
{
  "success": true,
  "data": {}
}

// Response (Error)
{
  "success": false,
  "error": "message"
}
```

---

## 5. File Structure

```
[Project structure showing new/modified files]
app/
  api/
    feature/
      route.js          # NEW - [purpose]
  (pages)/
    feature/
      page.jsx          # MODIFY - [changes]

components/
  feature/
    ComponentA.jsx      # NEW - [purpose]
    ComponentB.jsx      # NEW - [purpose]

lib/
  feature/
    helper.js           # NEW - [purpose]
```

---

## 6. Implementation Phases

### Phase 1: [Name] - Foundation

**Goal:** [What this phase achieves]

**Tasks:**
- [ ] Task 1
- [ ] Task 2
- [ ] Task 3

**Deliverable:** [What's working after this phase]

### Phase 2: [Name] - Core Feature

**Goal:** [What this phase achieves]

**Tasks:**
- [ ] Task 1
- [ ] Task 2
- [ ] Task 3

**Deliverable:** [What's working after this phase]

### Phase 3: [Name] - Polish

**Goal:** [What this phase achieves]

**Tasks:**
- [ ] Task 1
- [ ] Task 2
- [ ] Task 3

**Deliverable:** [What's working after this phase]

---

## 7. Risk Mitigation

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| [Risk 1] | Low/Med/High | Low/Med/High | [Strategy] |
| [Risk 2] | Low/Med/High | Low/Med/High | [Strategy] |

---

## 8. Testing Strategy

### Unit Tests

- [ ] [Component/Function to test]
- [ ] [Component/Function to test]

### Integration Tests

- [ ] [Flow to test]
- [ ] [Flow to test]

### Manual Testing Checklist

- [ ] [Scenario 1]
- [ ] [Scenario 2]
- [ ] [Scenario 3]

---

## 9. Rollout Plan

### Pre-Launch

- [ ] Database migrations applied
- [ ] Environment variables set
- [ ] Feature flag (if applicable)

### Launch

- [ ] Deploy to staging
- [ ] Smoke test
- [ ] Deploy to production
- [ ] Monitor for errors

### Post-Launch

- [ ] Monitor metrics
- [ ] Gather feedback
- [ ] Plan iteration

---

## Checklist Before Moving to result.md

- [ ] All major technical decisions documented
- [ ] Data model defined
- [ ] API contracts specified
- [ ] Phases broken down with tasks
- [ ] Risks identified with mitigations
- [ ] Testing strategy outlined

**Next Step:** Create `result.md` to synthesize reasoning + plan into final reference document.
