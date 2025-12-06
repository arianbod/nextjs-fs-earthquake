# {{FEATURE_NAME}} Implementation - Detailed Plan

> **Document Type:** Implementation Plan (Actionable Tasks)
> **Purpose:** Specific tasks to execute
> **Prerequisite:** Complete `reasoning.md` first
> **Next Step:** After completing this, create `result.md`

---

## Instructions

This is your **executable** plan. Every task should be:
- **Specific** - Clear what to do
- **Actionable** - Can start immediately
- **Measurable** - Know when it's done
- **Small** - Max 4 hours each

---

## Phase 1: {{PHASE_1_NAME}}

**Goal:** [What's working after this phase]

**Estimated Effort:** [X hours/tasks]

### Tasks

#### 1.1 [Task Name]

**File(s):** `path/to/file.js`

**Action:**
```
[Specific description of what to do]
```

**Acceptance Criteria:**
- [ ] [How to verify it's done]

**Dependencies:** None / Task X.X

---

#### 1.2 [Task Name]

**File(s):** `path/to/file.js`

**Action:**
```
[Specific description of what to do]
```

**Acceptance Criteria:**
- [ ] [How to verify it's done]

**Dependencies:** Task 1.1

---

#### 1.3 [Task Name]

**File(s):** `path/to/file.js`

**Action:**
```
[Specific description of what to do]
```

**Acceptance Criteria:**
- [ ] [How to verify it's done]

**Dependencies:** Task 1.2

---

### Phase 1 Checkpoint

**Before moving to Phase 2:**
- [ ] All Phase 1 tasks complete
- [ ] Tests passing (if applicable)
- [ ] Manually verified: [What to test]
- [ ] Committed to git with message: `feat({{feature}}): Phase 1 - [description]`

---

## Phase 2: {{PHASE_2_NAME}}

**Goal:** [What's working after this phase]

**Estimated Effort:** [X hours/tasks]

### Tasks

#### 2.1 [Task Name]

**File(s):** `path/to/file.js`

**Action:**
```
[Specific description of what to do]
```

**Acceptance Criteria:**
- [ ] [How to verify it's done]

**Dependencies:** Phase 1 complete

---

#### 2.2 [Task Name]

**File(s):** `path/to/file.js`

**Action:**
```
[Specific description of what to do]
```

**Acceptance Criteria:**
- [ ] [How to verify it's done]

**Dependencies:** Task 2.1

---

### Phase 2 Checkpoint

**Before moving to Phase 3:**
- [ ] All Phase 2 tasks complete
- [ ] Tests passing
- [ ] Manually verified: [What to test]
- [ ] Committed to git

---

## Phase 3: {{PHASE_3_NAME}}

**Goal:** [What's working after this phase]

**Estimated Effort:** [X hours/tasks]

### Tasks

#### 3.1 [Task Name]

**File(s):** `path/to/file.js`

**Action:**
```
[Specific description of what to do]
```

**Acceptance Criteria:**
- [ ] [How to verify it's done]

---

#### 3.2 [Task Name]

**File(s):** `path/to/file.js`

**Action:**
```
[Specific description of what to do]
```

**Acceptance Criteria:**
- [ ] [How to verify it's done]

---

### Phase 3 Checkpoint (Final)

**Before marking feature complete:**
- [ ] All tasks complete
- [ ] All tests passing
- [ ] Full manual test of user journey
- [ ] Documentation updated (if needed)
- [ ] Ready for deployment

---

## Quick Reference

### Commands to Run

```bash
# Start development
npm run dev

# Run tests
npm run test

# Database commands
npx prisma db push
npx prisma generate
npx prisma studio

# Build check
npm run build
```

### Key Files

| File | Purpose |
|------|---------|
| `path/to/file1.js` | [Purpose] |
| `path/to/file2.js` | [Purpose] |

### Git Strategy

```bash
# Feature branch
git checkout -b feature/{{feature-name}}

# Commit per phase
git commit -m "feat({{feature}}): Phase 1 - [description]"
git commit -m "feat({{feature}}): Phase 2 - [description]"
git commit -m "feat({{feature}}): Phase 3 - [description]"

# Final merge
git checkout main
git merge feature/{{feature-name}}
```

---

## Rollback Plan

**If something goes wrong:**

1. **Database:** [How to rollback schema changes]
2. **Code:** `git revert [commit]` or `git checkout main`
3. **Data:** [How to handle if data was affected]

---

## Checklist Before Creating result.md

- [ ] All phases have specific tasks
- [ ] Each task has acceptance criteria
- [ ] Dependencies are marked
- [ ] Checkpoints defined
- [ ] Rollback plan exists
- [ ] Commands documented

**Next Step:** Create `result.md` to synthesize into final implementation reference.
