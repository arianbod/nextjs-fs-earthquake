# UI Design - reassessment-reminders

## Theming Strategy (90% Rule)

**Use theme tokens over hardcoded values 90% of the time.**

### Project Tailwind Version
- Current: 3.4.17 (from package.json)
- Approach: Use tailwind.config.ts theme.extend

### Theme Tokens to Use
- Colors: `--color-amber-500` for warning badges
- Typography: Existing text styles
- Spacing: Standard Tailwind spacing

## Component Structure

### Existing Components (Reuse)

| Component | Location | Modifications Needed |
|-----------|----------|---------------------|
| AlertSettings.jsx | components/alerts/ | Add reassessment section |
| Switch | components/ui/ | None |
| Slider | components/ui/ | None |
| AssessmentCard.jsx | components/dashboard/ | Add "due" badge |

### New Components (Create)

| Component | Type | Complexity |
|-----------|------|------------|
| ReassessmentBadge | Display | Low |

## UI Changes

### 1. AlertSettings.jsx - Add Reassessment Section

**Location:** After earthquake alert settings, before save button

**New Section:**
```jsx
<Card>
  <CardHeader>
    <CardTitle>Reassessment Reminders</CardTitle>
    <CardDescription>
      Get reminded when your building assessments are due for review
    </CardDescription>
  </CardHeader>
  <CardContent>
    {/* Toggle */}
    <div className="flex items-center justify-between">
      <Label>Enable Reminders</Label>
      <Switch checked={reassessmentEnabled} onCheckedChange={...} />
    </div>

    {/* Frequency Selector */}
    <div className="mt-4">
      <Label>Remind me every</Label>
      <Select value={frequencyDays}>
        <option value={30}>30 days</option>
        <option value={90}>90 days</option>
        <option value={180}>6 months</option>
        <option value={365}>1 year (recommended)</option>
      </Select>
    </div>
  </CardContent>
</Card>
```

### 2. AssessmentCard.jsx - Add Due Badge

**Location:** Next to status badge in card header

**Condition:** Show when `daysSinceComplete > user.reassessmentFrequencyDays`

**Badge Style:**
```jsx
{isDueForReassessment && (
  <Badge variant="warning" className="bg-amber-500 text-white">
    Due for reassessment
  </Badge>
)}
```

### 3. Push Notification Design

**Title:** "Reassessment Reminder"
**Body:** "Your assessment for {address} is {days} days old. Tap to reassess."
**Icon:** Building/refresh icon
**Actions:**
- "Reassess Now" -> Deep link to /result/[id]?reassess=true
- "Remind Later" -> Snooze for 7 days

## States to Design

- [x] Default state: Reassessment enabled, 365 days
- [x] Loading state: Use existing spinner
- [x] Empty state: N/A
- [x] Error state: Use existing toast
- [x] Success state: "Settings saved" toast

## Accessibility

- [x] ARIA labels on toggle and select
- [x] Keyboard navigation (existing components)
- [x] Focus management (existing)
- [x] Color contrast (amber on white passes)

## i18n Keys to Add

```json
{
  "Alerts": {
    "reassessmentReminders": "Reassessment Reminders",
    "reassessmentDescription": "Get reminded when your building assessments are due for review",
    "enableReminders": "Enable Reminders",
    "remindEvery": "Remind me every",
    "days30": "30 days",
    "days90": "90 days",
    "months6": "6 months",
    "year1": "1 year (recommended)",
    "dueForReassessment": "Due for reassessment"
  }
}
```
