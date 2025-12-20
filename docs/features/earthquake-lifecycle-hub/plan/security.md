# Security Audit - Pre-Implementation

## Tech Stack Check

### Current Project Packages (Relevant)
- next: 16.1.0 (latest)
- react: 19.x (latest)
- @clerk/nextjs: Auth provider
- prisma: Database ORM
- web-push: Push notifications

### Security-Relevant Packages
- No known vulnerabilities in core stack
- Clerk handles auth securely
- Prisma prevents SQL injection

---

## Auth Requirements

### Authentication Needed: YES

**Reason:** Safety Hub contains personalized data (checklists, assessments)

### Authorization Model: User-Based

| Resource | Access |
|----------|--------|
| Checklist progress | Own user only |
| Damage photos | Own user only |
| Assessment link | Own user only |
| Static content | Any logged-in user |

### Permission Levels
1. **Logged-in user** - Full access to Safety Hub
2. **Anonymous** - No access (redirect to login)

### Session Handling
- Use existing Clerk auth
- No additional session management needed

---

## Data Security

### Database Changes: OPTIONAL (MVP)

**MVP Approach:** LocalStorage for checklists (no DB changes)

**Post-MVP Option:** Add models:
```prisma
model ChecklistProgress {
  id          String   @id @default(cuid())
  userId      String
  category    String
  items       Json     // {itemId: boolean}
  completedAt DateTime?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

model DamageAssessment {
  id            String   @id @default(cuid())
  userId        String
  assessmentId  String?  // Link to original assessment
  severity      String   // LOW, MODERATE, HIGH, SEVERE
  photos        Json     // [{url, analysis}]
  aiAnalysis    Json
  createdAt     DateTime @default(now())
}
```

### Migration Strategy
- MVP: No migrations needed
- Post-MVP: Standard Prisma migrate

### Rollback Plan
- LocalStorage data can be cleared without impact
- Database data has soft delete option

### Sensitive Data Identified
| Data | Classification | Handling |
|------|---------------|----------|
| Checklist progress | Low sensitivity | LocalStorage/DB |
| Damage photos | Medium sensitivity | Process in memory, optional storage |
| Building address | Already in assessment | No new exposure |
| User ID | Standard | Existing Clerk handling |

### Encryption Needs
- Data at rest: Standard DB encryption (existing)
- Data in transit: HTTPS (existing)
- Damage photos: No additional encryption for MVP

---

## API Security

### New Endpoints

| Endpoint | Method | Auth | Rate Limit |
|----------|--------|------|------------|
| `/api/analyze-image` (existing) | POST | Required | Existing |
| `/api/safety-hub/checklist` (future) | GET/PUT | Required | 100/hour |
| `/api/safety-hub/damage` (future) | POST | Required | 10/hour |

### Input Validation

**Damage Assessment Photos:**
```javascript
const damageSchema = z.object({
  photos: z.array(z.string().max(10_000_000)).max(3), // Max 3 photos, 10MB each
  assessmentId: z.string().optional(),
});
```

**Checklist Update:**
```javascript
const checklistSchema = z.object({
  category: z.enum(['supplies', 'safety', 'documents', 'family']),
  itemId: z.string(),
  completed: z.boolean(),
});
```

### Rate Limiting
- Damage assessment: 10 per hour per user (prevent abuse)
- Checklist updates: 100 per hour per user (reasonable usage)
- AI analysis: Existing rate limits apply

### CORS
- No changes needed (existing configuration)
- API routes protected by Clerk middleware

---

## Key/Secret Management

### Environment Variables Needed
- No new secrets for MVP
- Existing: `ANTHROPIC_API_KEY` for AI analysis

### Checklist
- [x] NO hardcoded secrets in this feature
- [x] .env.example doesn't need updates
- [x] No new API keys required

---

## OWASP Top 10 Check

| Vulnerability | Risk | Mitigation |
|--------------|------|------------|
| **Injection** | Low | Prisma ORM, parameterized queries |
| **Broken Auth** | Low | Clerk handles auth |
| **Sensitive Data** | Medium | Damage photos processed, not stored long-term |
| **XXE** | N/A | No XML processing |
| **Broken Access Control** | Low | userId check on all data access |
| **Misconfig** | Low | Standard Next.js config |
| **XSS** | Medium | React auto-escapes, sanitize user content |
| **Insecure Deserialization** | Low | JSON only, Zod validation |
| **Vulnerable Components** | Low | Regular npm audit |
| **Logging** | Medium | Add logging for damage assessments |

---

## Security Risks for This Feature

| Risk | Severity | Mitigation |
|------|----------|------------|
| False sense of safety from AI | High | Clear disclaimers, "consult professional" |
| Damage photos contain PII (faces, addresses) | Medium | Process in memory, optional storage, privacy notice |
| LocalStorage data accessible | Low | Non-sensitive data only |
| AI analysis manipulation | Low | Server-side processing, no user prompt injection |
| Rate limit bypass | Medium | Per-user rate limiting |

---

## Content Security

### Static Safety Content
- All content sourced from AFAD/FEMA
- No user-generated content in safety instructions
- Version-controlled content updates

### Disclaimers Required
```
// Required on damage assessment
"This AI assessment is preliminary only. It cannot replace
professional structural engineering inspection. Do not enter
damaged buildings without professional clearance."

// Required on preparedness content
"This guidance is based on AFAD and FEMA recommendations.
Always follow official instructions from local authorities
during emergencies."
```

---

## Legal Considerations

### Liability Mitigation
1. Source all content from official guidelines (AFAD, FEMA)
2. Add clear disclaimers on AI damage assessment
3. Recommend professional consultation
4. Log user acknowledgment of disclaimers
5. Do not guarantee safety outcomes

### Terms of Service
- Existing ToS covers AI analysis
- Add explicit Safety Hub section for damage assessment
- User accepts responsibility for acting on recommendations

---

## Security Testing Checklist

### Pre-Implementation
- [ ] Review existing auth flow
- [ ] Verify rate limiting works
- [ ] Check Clerk middleware covers new route

### Post-Implementation
- [ ] Test unauthorized access attempts
- [ ] Verify rate limits on damage endpoint
- [ ] Check photo upload size limits
- [ ] Test XSS in any user inputs
- [ ] Verify userId isolation

### Regular Maintenance
- [ ] Monthly npm audit
- [ ] Quarterly content review for accuracy
- [ ] Annual security review

---

## Security Verdict

**Status:** PASS (for MVP)

**Summary:**
- No new significant security risks
- Leverage existing auth (Clerk)
- Standard input validation
- Appropriate rate limiting
- Clear disclaimers for liability

**Recommendations:**
1. Add logging for damage assessment usage
2. Implement photo retention policy (auto-delete after 30 days)
3. Add user acknowledgment for AI disclaimer
