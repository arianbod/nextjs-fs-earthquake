# {{FEATURE_NAME}} - Implementation Plan Result

> **Document Type:** SYNTHESIS Document (Implementation Reference)
> **Purpose:** Self-contained implementation guide
> **Status:** Ready for Execution
> **Created:** {{DATE}}

---

## Executive Summary

**Feature:** {{FEATURE_NAME}}

**Source:** `../reasoning/result.md`

**Implementation Strategy:** [One sentence: e.g., "Database-first, incremental deployment, manual testing"]

**Phases:** [X] phases, [Y] total tasks

**Key Files:** [List 3-5 most important files]

---

## Implementation Overview

### Phase Summary

| Phase | Name | Tasks | Goal |
|-------|------|-------|------|
| 1 | [Name] | [X] | [What's working] |
| 2 | [Name] | [X] | [What's working] |
| 3 | [Name] | [X] | [What's working] |

### Dependency Graph

```
Phase 1: [Name]
├── Task 1.1: [Name]
├── Task 1.2: [Name] (depends on 1.1)
└── Task 1.3: [Name] (depends on 1.2)
    │
    ▼
Phase 2: [Name]
├── Task 2.1: [Name]
└── Task 2.2: [Name] (depends on 2.1)
    │
    ▼
Phase 3: [Name]
├── Task 3.1: [Name]
└── Task 3.2: [Name]
    │
    ▼
✅ Feature Complete
```

---

## Phase 1: {{PHASE_1_NAME}}

### Overview
- **Goal:** [What's working after this phase]
- **Tasks:** [X]
- **Key Deliverable:** [Specific output]

### Task List

| # | Task | File(s) | Done |
|---|------|---------|------|
| 1.1 | [Task name] | `path/file.js` | [ ] |
| 1.2 | [Task name] | `path/file.js` | [ ] |
| 1.3 | [Task name] | `path/file.js` | [ ] |

### Checkpoint
- [ ] Tasks complete
- [ ] Verified: [How to test]
- [ ] Committed: `feat({{feature}}): Phase 1`

---

## Phase 2: {{PHASE_2_NAME}}

### Overview
- **Goal:** [What's working after this phase]
- **Tasks:** [X]
- **Key Deliverable:** [Specific output]

### Task List

| # | Task | File(s) | Done |
|---|------|---------|------|
| 2.1 | [Task name] | `path/file.js` | [ ] |
| 2.2 | [Task name] | `path/file.js` | [ ] |

### Checkpoint
- [ ] Tasks complete
- [ ] Verified: [How to test]
- [ ] Committed: `feat({{feature}}): Phase 2`

---

## Phase 3: {{PHASE_3_NAME}}

### Overview
- **Goal:** [What's working after this phase]
- **Tasks:** [X]
- **Key Deliverable:** [Specific output]

### Task List

| # | Task | File(s) | Done |
|---|------|---------|------|
| 3.1 | [Task name] | `path/file.js` | [ ] |
| 3.2 | [Task name] | `path/file.js` | [ ] |

### Checkpoint
- [ ] Tasks complete
- [ ] Verified: [How to test]
- [ ] Committed: `feat({{feature}}): Phase 3`

---

## Quick Reference

### Files to Create

| File | Purpose |
|------|---------|
| `path/to/new/file.js` | [Purpose] |

### Files to Modify

| File | Changes |
|------|---------|
| `path/to/existing/file.js` | [What changes] |

### Commands

```bash
# Development
npm run dev

# Database
npx prisma db push
npx prisma generate

# Testing
npm run test
npm run build
```

### Environment Variables

| Variable | Purpose | Value |
|----------|---------|-------|
| `VAR_NAME` | [Purpose] | [Required/Optional] |

---

## Verification Checklist

### Functional Testing

- [ ] [User action 1] works correctly
- [ ] [User action 2] works correctly
- [ ] [Edge case 1] handled
- [ ] [Edge case 2] handled

### Technical Testing

- [ ] Build passes: `npm run build`
- [ ] No console errors
- [ ] API responses correct
- [ ] Database operations work

### User Journey Test

```
1. [Step 1] → Expected: [Result]
2. [Step 2] → Expected: [Result]
3. [Step 3] → Expected: [Result]
✅ Feature working end-to-end
```

---

## Rollback Plan

**If issues occur:**

1. **Code:** `git revert HEAD` or `git checkout main -- [file]`
2. **Database:** [Rollback command or manual steps]
3. **Data:** [Recovery steps if needed]

---

## Success Criteria

| Criteria | Target | Verified |
|----------|--------|----------|
| [Criteria 1] | [Target] | [ ] |
| [Criteria 2] | [Target] | [ ] |
| [Criteria 3] | [Target] | [ ] |

---

## Post-Implementation

### After Feature Complete

- [ ] Update documentation if needed
- [ ] Clean up feature branch
- [ ] Monitor for issues
- [ ] Gather user feedback

### Next Iteration (Future)

Items deferred from this implementation:
- [Future item 1]
- [Future item 2]

---

## Conclusion

This document is the **executable implementation guide** for {{FEATURE_NAME}}.

**To implement:** Work through phases 1 → 2 → 3, checking off tasks and verifying at each checkpoint.

**Source of truth:** `../reasoning/result.md` for WHY decisions, this document for HOW to execute.

**Track progress:** Use `../action/tracking.md` during execution.

---

*This is the authoritative implementation plan for {{FEATURE_NAME}}.*
