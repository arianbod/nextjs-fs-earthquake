# {{FEATURE_NAME}} - Reasoning Result

> **Document Type:** SYNTHESIS Document (Final Reference)
> **Purpose:** Self-contained source of truth combining reasoning + plan
> **Status:** Ready for Implementation Planning
> **Created:** {{DATE}}

---

## Executive Summary

<!--
Write this AFTER completing reasoning.md and plan.md.
This should be a 3-5 sentence summary that a busy stakeholder can read.
-->

**Problem:** [One sentence describing the problem]

**Solution:** [One sentence describing the solution approach]

**Scope:** [What's included and explicitly excluded]

**Outcome:** [What users will be able to do after implementation]

---

## Part 1: The Problem (WHY)

<!-- Synthesize from reasoning.md Section 1 -->

### 1.1 Current User Experience

```
[Copy the current user journey from reasoning.md]
```

### 1.2 Why This Must Be Solved

<!-- Top 3 reasons, prioritized -->

1. **[Reason 1]** - [Impact]
2. **[Reason 2]** - [Impact]
3. **[Reason 3]** - [Impact]

### 1.3 User Needs Summary

| Need | Priority | Rationale |
|------|----------|-----------|
| [Need 1] | Critical | [Why critical] |
| [Need 2] | High | [Why high] |
| [Need 3] | Medium | [Why medium] |

---

## Part 2: Current State (WHAT WE HAVE)

<!-- Synthesize from reasoning.md Section 2 -->

### 2.1 Existing Infrastructure

| Component | Status | Relevant To This Feature |
|-----------|--------|--------------------------|
| [Component] | Working/Partial/Missing | [How it relates] |

### 2.2 Gap Analysis

```
Current State:
┌──────────────┐     ┌──────────────┐
│  [Current]   │ ──▶ │  [Current]   │
└──────────────┘     └──────────────┘
        ⚠️ GAP: [What's missing]

Target State:
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│  [Current]   │ ──▶ │  [NEW]       │ ──▶ │  [Target]    │
└──────────────┘     └──────────────┘     └──────────────┘
```

---

## Part 3: The Solution (HOW)

<!-- Synthesize from plan.md -->

### 3.1 Architecture

```
[Copy architecture diagram from plan.md]
```

### 3.2 Data Model

```
[Copy data model from plan.md]
```

### 3.3 API Summary

| Endpoint | Purpose |
|----------|---------|
| `POST /api/...` | [Purpose] |
| `GET /api/...` | [Purpose] |

### 3.4 Key Technical Decisions

| Decision | Choice | Why |
|----------|--------|-----|
| [Topic 1] | [Choice] | [Brief rationale] |
| [Topic 2] | [Choice] | [Brief rationale] |

---

## Part 4: Implementation Approach

<!-- Synthesize from plan.md phases -->

### 4.1 Phase Overview

| Phase | Focus | Deliverable |
|-------|-------|-------------|
| Phase 1 | [Focus] | [What's working] |
| Phase 2 | [Focus] | [What's working] |
| Phase 3 | [Focus] | [What's working] |

### 4.2 File Structure

```
[Copy file structure from plan.md]
```

---

## Part 5: Success Criteria

### 5.1 Functional Requirements

| Requirement | Acceptance Criteria |
|-------------|---------------------|
| [Req 1] | [How to verify] |
| [Req 2] | [How to verify] |

### 5.2 Non-Functional Requirements

| Requirement | Target |
|-------------|--------|
| Performance | [Target] |
| Reliability | [Target] |
| Usability | [Target] |

### 5.3 Definition of Done

```
Target User Journey:
┌─────────────────────────────────────────────────────────────┐
│  [Step-by-step of what user can do after implementation]    │
│       ↓                                                     │
│  [Step]                                                     │
│       ↓                                                     │
│  [Step]                                                     │
│       ↓                                                     │
│  ✅ [Final outcome]                                         │
└─────────────────────────────────────────────────────────────┘
```

---

## Part 6: Risk Mitigation

| Risk | Mitigation |
|------|------------|
| [Risk 1] | [Strategy] |
| [Risk 2] | [Strategy] |

---

## Part 7: Out of Scope (Future)

<!-- Explicitly list what is NOT part of this implementation -->

These are **NOT** included in this implementation:
- [Future feature 1]
- [Future feature 2]
- [Future feature 3]

---

## Appendix: Quick Reference

### Key Files to Create/Modify

1. `path/to/file.js` - [Purpose]
2. `path/to/file.js` - [Purpose]

### Commands

```bash
# [Useful command 1]
command here

# [Useful command 2]
command here
```

### Environment Variables

| Variable | Purpose | Required |
|----------|---------|----------|
| `VAR_NAME` | [Purpose] | Yes/No |

---

## Conclusion

<!-- One paragraph summary of the entire feature -->

This document provides complete reasoning for {{FEATURE_NAME}}. The solution is:

- **Technically sound** - [Why]
- **User-focused** - [What problem it solves]
- **Scoped appropriately** - [What's in/out]
- **Implementation-ready** - [What's defined]

**Next Step:** Use this document as foundation for creating implementation plan in `docs/{{FEATURE_NAME}}/plan/`.

---

*This is the authoritative source document for {{FEATURE_NAME}}. All implementation decisions should reference this document.*
