# {{FEATURE_NAME}} Implementation - Planning Reasoning

> **Document Type:** WHY Document for Planning Phase
> **Purpose:** Define WHY we're planning implementation this way
> **Prerequisite:** Complete `../reasoning/result.md` first
> **Next Step:** After completing this, create `plan.md`

---

## Instructions

This document bridges the reasoning phase to actual implementation. You're reasoning about HOW to execute, not WHAT to build (that's decided in reasoning/result.md).

**Input:** `../reasoning/result.md` (the WHAT)
**Output:** Reasoning for HOW to implement

---

## 1. Implementation Context

### 1.1 Reference Document

**Source of Truth:** `../reasoning/result.md`

**Key Deliverables from Reasoning:**
- [ ] [Deliverable 1 from result.md]
- [ ] [Deliverable 2 from result.md]
- [ ] [Deliverable 3 from result.md]

### 1.2 Current Development State

| Aspect | Status | Impact on Implementation |
|--------|--------|--------------------------|
| Branch | [Branch name] | [Clean/Has uncommitted work] |
| Dependencies | [Up to date?] | [Any updates needed?] |
| Environment | [Dev/Staging/Prod] | [Where to test] |
| Team | [Solo/Collaborative] | [Coordination needed?] |

---

## 2. Implementation Approach Reasoning

### 2.1 Order of Implementation

**Question:** In what order should we build the components?

**Options:**
- A) **Database First** - Schema → API → UI
- B) **UI First** - Components → API → Database
- C) **Vertical Slice** - One complete flow, then expand
- D) **Parallel** - Multiple streams simultaneously

**Decision:** [Option X]

**Reasoning:**
- [Why this order makes sense]
- [Dependencies that dictate order]
- [Risk considerations]

### 2.2 Incremental vs Big Bang

**Question:** How should we deploy changes?

**Options:**
- A) **Incremental** - Deploy each phase separately
- B) **Feature Flag** - Deploy hidden, reveal when ready
- C) **Big Bang** - Deploy all at once when complete

**Decision:** [Option X]

**Reasoning:**
- [Why this approach]
- [Rollback considerations]

### 2.3 Testing Strategy

**Question:** When and how to test?

**Options:**
- A) **TDD** - Tests first, then implementation
- B) **Test After** - Implement, then add tests
- C) **Manual First** - Manual testing, automate critical paths

**Decision:** [Option X]

**Reasoning:**
- [Time constraints]
- [Criticality of feature]
- [Existing test coverage]

---

## 3. Resource Assessment

### 3.1 Skills/Knowledge Needed

| Skill | Have It? | If No, Plan |
|-------|----------|-------------|
| [Skill 1: e.g., Prisma] | Yes/No | [Learn/Ask/Pair] |
| [Skill 2: e.g., API Auth] | Yes/No | [Learn/Ask/Pair] |
| [Skill 3: e.g., React Query] | Yes/No | [Learn/Ask/Pair] |

### 3.2 External Dependencies

| Dependency | Status | Risk |
|------------|--------|------|
| [Service/API] | Available/Unknown | [Low/Med/High] |
| [Library] | Installed/Need to add | [Low/Med/High] |

### 3.3 Blockers

<!-- What could prevent progress? -->

| Potential Blocker | Likelihood | Mitigation |
|-------------------|------------|------------|
| [Blocker 1] | Low/Med/High | [Plan] |
| [Blocker 2] | Low/Med/High | [Plan] |

---

## 4. Scope Boundaries

### 4.1 What's In Scope (This Implementation)

<!-- Copy from reasoning/result.md, confirm still accurate -->

- [x] [Feature 1]
- [x] [Feature 2]
- [x] [Feature 3]

### 4.2 What's Out of Scope (Future)

<!-- Copy from reasoning/result.md, confirm still accurate -->

- [ ] [Future feature 1]
- [ ] [Future feature 2]

### 4.3 Scope Creep Risks

<!-- Things that might tempt you to expand scope -->

| Temptation | Why Resist | Defer To |
|------------|------------|----------|
| [Nice to have X] | [Adds complexity] | [Future iteration] |
| [Nice to have Y] | [Not critical path] | [Future iteration] |

---

## 5. Success Criteria for Planning

### 5.1 What Good Planning Looks Like

- [ ] Every task is specific and actionable
- [ ] No task takes more than 4 hours
- [ ] Dependencies between tasks are clear
- [ ] Testing is included in each phase
- [ ] Rollback plan exists

### 5.2 Ready to Plan Checklist

- [ ] reasoning/result.md is complete and approved
- [ ] Implementation order is decided
- [ ] Blockers are identified
- [ ] Scope boundaries are clear
- [ ] Success criteria are defined

---

## 6. Summary

### WHY This Implementation Approach

> [One paragraph explaining the reasoning behind your implementation strategy]

### Key Decisions Made

1. **Order:** [Database/UI/Vertical first because...]
2. **Deployment:** [Incremental/Big Bang because...]
3. **Testing:** [TDD/After/Manual because...]

---

**Next Step:** Create `plan.md` with specific, actionable implementation tasks.
