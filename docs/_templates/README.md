# Feature Planning System

A systematic approach to planning and implementing features using structured documentation.

## Overview

This system ensures thorough thinking before coding through three phases:

```
┌─────────────────────────────────────────────────────────────────┐
│                    FEATURE PLANNING SYSTEM                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  PHASE 1: REASONING          PHASE 2: PLANNING       PHASE 3   │
│  ┌─────────────────┐        ┌─────────────────┐     ┌────────┐ │
│  │ reasoning.md    │        │ reasoning.md    │     │tracking│ │
│  │ (WHY problem)   │        │ (WHY approach)  │     │   .md  │ │
│  ├─────────────────┤        ├─────────────────┤     │        │ │
│  │ plan.md         │        │ plan.md         │     │ Track  │ │
│  │ (HOW to think)  │        │ (HOW to execute)│     │progress│ │
│  ├─────────────────┤        ├─────────────────┤     │        │ │
│  │ result.md       │───────▶│ result.md       │────▶│ during │ │
│  │ (SYNTHESIS)     │        │ (SYNTHESIS)     │     │ work   │ │
│  └─────────────────┘        └─────────────────┘     └────────┘ │
│                                                                 │
│  Answers: WHAT & WHY        Answers: HOW exactly    Answers:   │
│                                                     WHAT done  │
└─────────────────────────────────────────────────────────────────┘
```

## Quick Start

### Option 1: Use Slash Command (Recommended)

```bash
/new-feature user-dashboard
```

This creates the full folder structure and copies templates.

### Option 2: Manual Setup

1. Copy `_templates/feature-reasoning/` to `docs/your-feature/reasoning/`
2. Copy `_templates/feature-plan/` to `docs/your-feature/plan/`
3. Copy `_templates/feature-action/` to `docs/your-feature/action/`
4. Replace `{{FEATURE_NAME}}` placeholders

## Template Structure

```
docs/_templates/
├── feature-reasoning/          # Phase 1: Understanding
│   ├── reasoning.md           # WHY - Problem & requirements
│   ├── plan.md                # HOW - Technical approach
│   └── result.md              # SYNTHESIS - Final reasoning doc
│
├── feature-plan/              # Phase 2: Implementation
│   ├── reasoning.md           # WHY - Implementation approach
│   ├── plan.md                # HOW - Specific tasks
│   └── result.md              # SYNTHESIS - Executable plan
│
├── feature-action/            # Phase 3: Execution
│   └── tracking.md            # Track progress & issues
│
└── README.md                  # This file
```

## Workflow

### Phase 1: Reasoning (WHAT & WHY)

**Goal:** Understand the problem before thinking about solutions.

1. **reasoning.md** - Answer these questions:
   - What problem are we solving?
   - Who has this problem?
   - What's the current state?
   - What do we expect after solving it?

2. **plan.md** - Technical thinking:
   - What are the solution options?
   - What are the trade-offs?
   - What technical decisions need to be made?

3. **result.md** - Synthesize:
   - Self-contained document
   - Anyone can read ONLY this file and understand the feature
   - Source of truth for implementation

### Phase 2: Planning (HOW)

**Goal:** Create an executable implementation plan.

1. **reasoning.md** - Implementation reasoning:
   - Why this implementation order?
   - What's the deployment strategy?
   - What resources are needed?

2. **plan.md** - Specific tasks:
   - Phase-by-phase breakdown
   - Each task is specific and actionable
   - Acceptance criteria for each task

3. **result.md** - Executable guide:
   - Checklist-style document
   - Can be followed step-by-step
   - Includes verification steps

### Phase 3: Action (TRACKING)

**Goal:** Track progress during execution.

- **tracking.md** - Real-time updates:
  - Session logs
  - Blockers and resolutions
  - Decisions made during implementation
  - Deviations from plan
  - Retrospective after completion

## Document Purposes

| Document | Phase | Purpose | Key Question |
|----------|-------|---------|--------------|
| `reasoning/reasoning.md` | 1 | Problem definition | WHY do we need this? |
| `reasoning/plan.md` | 1 | Solution design | WHAT should we build? |
| `reasoning/result.md` | 1 | **Source of truth** | Complete understanding |
| `plan/reasoning.md` | 2 | Implementation why | WHY this approach? |
| `plan/plan.md` | 2 | Task breakdown | HOW exactly? |
| `plan/result.md` | 2 | **Executable guide** | Step-by-step |
| `action/tracking.md` | 3 | Progress tracking | WHAT's happening? |

## When to Use This System

### Use It For:
- New features with multiple components
- Features requiring architectural decisions
- Work that spans multiple days/sessions
- Features you'll need to maintain long-term
- Collaborative work

### Skip It For:
- Bug fixes
- Single-file changes
- Trivial additions
- Quick experiments

## Tips for Success

1. **Don't skip reasoning phase** - Understanding the problem prevents wasted implementation work

2. **Keep result.md self-contained** - Someone reading ONLY result.md should understand everything

3. **Update tracking.md in real-time** - Don't rely on memory

4. **Be honest in retrospective** - Future you will thank current you

5. **Timebox each document** - Don't over-document:
   - reasoning.md: 30-60 min
   - plan.md: 45-90 min
   - result.md: 30-45 min

## Example Feature Structure

After using `/new-feature user-dashboard`:

```
docs/
├── user-dashboard/
│   ├── reasoning/
│   │   ├── reasoning.md    # Why we need user dashboard
│   │   ├── plan.md         # Technical approach decisions
│   │   └── result.md       # Complete reasoning document
│   ├── plan/
│   │   ├── reasoning.md    # Why this implementation order
│   │   ├── plan.md         # Phase 1, 2, 3 with tasks
│   │   └── result.md       # Executable implementation guide
│   └── action/
│       └── tracking.md     # Progress during implementation
```

## Working with AI Assistants (Claude Code)

This system is particularly effective with AI assistants:

1. **Context Preservation** - When a session ends, `result.md` files preserve full context
2. **Clear Entry Points** - AI can start new session by reading `result.md`
3. **Traceable Decisions** - AI can reference reasoning when asked "why did we...?"
4. **Structured Prompts** - Templates guide AI to ask right questions

### Starting a New Session

```
Read docs/feature-name/reasoning/result.md to understand
what we're building and why.

Then read docs/feature-name/plan/result.md to see the
implementation plan.

Then check docs/feature-name/action/tracking.md to see
current progress.
```

---

*This system is inspired by Amazon's 6-pager memos, RFCs, ADRs, and the principle that clear thinking precedes clear code.*
