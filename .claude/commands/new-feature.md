# New Feature Planning System

You are helping the user set up a systematic feature planning structure. This system uses a 3-phase approach:

1. **Reasoning Phase** - WHY we need the feature
2. **Planning Phase** - HOW to implement it
3. **Action Phase** - Track execution

## Your Task

The user wants to plan a new feature: **$ARGUMENTS**

### Step 1: Create Folder Structure

Create the following folders under `docs/`:

```
docs/
  {{feature-name}}/
    reasoning/
      reasoning.md
      plan.md
      result.md
    plan/
      reasoning.md
      plan.md
      result.md
    action/
      tracking.md
```

### Step 2: Copy Templates

Copy templates from `docs/_templates/` to the new feature folder:

1. Copy `docs/_templates/feature-reasoning/*` to `docs/{{feature-name}}/reasoning/`
2. Copy `docs/_templates/feature-plan/*` to `docs/{{feature-name}}/plan/`
3. Copy `docs/_templates/feature-action/*` to `docs/{{feature-name}}/action/`

### Step 3: Replace Placeholders

In all copied files, replace:
- `{{FEATURE_NAME}}` with the actual feature name (Title Case)
- `{{DATE}}` with today's date
- `{{feature-name}}` with kebab-case version

### Step 4: Guide the User

After creating the structure, explain:

1. **Start with `reasoning/reasoning.md`** - Answer WHY this feature is needed
2. **Then `reasoning/plan.md`** - Define the technical approach
3. **Then `reasoning/result.md`** - Synthesize into final reasoning document
4. **Then `plan/reasoning.md`** - Why this implementation approach
5. **Then `plan/plan.md`** - Specific tasks
6. **Then `plan/result.md`** - Final implementation guide
7. **During execution, use `action/tracking.md`** - Track progress

### Step 5: Offer to Start

Ask if they want you to help fill in the first document (`reasoning/reasoning.md`) by asking guiding questions about:
- What problem does this feature solve?
- What's the current user experience?
- What do they expect after implementation?

## Important Notes

- If no feature name provided ($ARGUMENTS is empty), ask for one
- Use kebab-case for folder names (e.g., `user-dashboard`)
- Use Title Case for document headings (e.g., "User Dashboard")
- The templates contain extensive prompts - they're meant to be filled in, not just read
