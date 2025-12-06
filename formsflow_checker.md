# Form Flow Audit Report
Generated: 2025-09-28
Project: QuakeWise - Earthquake Safety Assessment Platform
Auditor: Claude Code (Specialized Form Flow Auditor)

## Executive Summary
- Total Forms Analyzed: 4 (assessment steps)
- Critical Issues: 3
- Warnings: 8
- Informational: 5
- Overall Status: NEEDS ATTENTION

---

## Form 1: LocationStepSimple (Step 1)
**Location:** C:\code\quakewise\components\steps\LocationStepSimple.jsx
**Type:** Location collection with GPS and background data gathering
**Status:** WARNING - Issues Found

### UI Layer
- **Component Type:** Client Component ('use client')
- **Fields:**
  - latitude (number, auto-detected via geolocation API)
  - longitude (number, auto-detected via geolocation API)
  - city (string, derived from geocoding)
  - earthquakeZone (string, calculated from coordinates)
  - soilType (string, inferred from seismic data)
  - address (string, from Google Geocoding)
  - neighborhood (string, from geocoding)
  - country (string, default 'Turkey')
  - numberOfStories (number, from Google Places API)
  - streetViewUrl (string, from Street View Service)
  - satelliteViewUrl (string, from Static Maps API)
  - weatherData (object, simulated)

- **Validation:**
  - Client-side: Geolocation timeout (10s), status checking
  - NO explicit schema validation
  - Manual map adjustment allowed without validation

- **UX Patterns:**
  - Auto-requests location on mount
  - Progress indicator during GPS fetch (simulated progress)
  - Success/error states with retry capability
  - Map interaction for manual adjustment
  - Background data collection (silent, no user feedback)

- **Issues Found:**
  - [WARNING] No validation schema for location coordinates bounds
  - [WARNING] Background data collection happens silently - failures are only logged to console
  - [INFO] Simulated weather data (lines 77-82) - not real API call
  - [WARNING] Map location can be changed without revalidating seismic zone calculation
  - [INFO] Google API key exposed in client-side code (process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY)

### Server Action Layer
- **Action Path:** C:\code\quakewise\lib\actions\assessment.js
- **Function Name:** saveLocation (line 243)
- **Security Measures:**
  - Clerk authentication check (userId verification)
  - Assessment ownership verification
  - Input field whitelisting (validLocationFields object)
  - Null/undefined value filtering

- **Error Handling:**
  - Try-catch wrapper
  - Returns { success: false, error: string } on failure
  - Console.error logging

- **Data Transformations:**
  - Maps locationData.fullAddress OR locationData.address to fullAddress
  - Maps locationData.placeId OR locationData.googlePlaceId to placeId
  - Filters out undefined values before DB write
  - Auto-sets assessment status to 'IN_PROGRESS'
  - Auto-increments currentStep to 2

- **Issues Found:**
  - [CRITICAL] No server-side validation of latitude/longitude ranges (could accept invalid coordinates)
  - [WARNING] No verification that earthquakeZone matches the coordinates (trusts client calculation)
  - [WARNING] No rate limiting on saveLocation calls
  - [INFO] Updates assessment title from address - could be empty string

### Schema Layer
- **Client Schema:** NONE - No Zod/Yup validation
- **Server Schema:** Implicit validation via Prisma model fields
- **Database Model:** Location (Prisma schema)
- **Alignment Status:** PARTIAL MISMATCH

**Schema Comparison:**

| Field | Client | Server Action | Prisma Model | Issues |
|-------|--------|---------------|--------------|--------|
| latitude | number | number | Float | No bounds validation |
| longitude | number | number | Float | No bounds validation |
| fullAddress | string | string | String? | Optional in DB, not validated |
| city | string | string | String? | Optional in DB, could be null |
| earthquakeZone | string | string | String? | No enum constraint |
| soilType | string | string | String? | No enum constraint |
| placeId | - | string | String? | Not set from client |
| weatherCondition | - | - | String? | Not used in current flow |
| temperature | - | - | Float? | Not used in current flow |

- **Issues Found:**
  - [CRITICAL] No validation schema at ANY layer - relies on implicit type coercion
  - [WARNING] earthquakeZone and soilType have no enum constraints (could be any string)
  - [WARNING] Optional fields in DB can be null but client doesn't handle null states properly
  - [INFO] weatherCondition and temperature fields exist in DB but never populated

### Database Layer
- **Target Model:** Location (one-to-one with Assessment)
- **Operation Type:** UPSERT (create if not exists, update if exists)
- **Transaction Used:** No (atomic upsert)
- **Constraints:**
  - Unique constraint on assessmentId (one location per assessment)
  - Foreign key: assessmentId references Assessment.id (onDelete: CASCADE)
  - No check constraints on coordinate ranges
  - No indexes beyond primary key and unique assessmentId

- **Cascading Effects:**
  - Updates Assessment.status to 'IN_PROGRESS'
  - Updates Assessment.currentStep to 2
  - Updates Assessment.title from address

- **Issues Found:**
  - [WARNING] No database-level validation on coordinate ranges
  - [INFO] No index on commonly queried fields (city, earthquakeZone)
  - [WARNING] Upsert could silently overwrite existing data without versioning

### Flow Summary
```
UI → updateUserInput (context) → saveLocationToDb → saveLocation (server action) → Prisma.location.upsert
[GPS coords] → [context cache] → [HTTP request] → [Auth check] → [DB write]

Validation Layers:
UI: Browser geolocation API validation only
Client-side Schema: NONE
Server-side Schema: NONE
Database Schema: Type constraints only (no bounds/enum checks)
```

**Data Persistence Path:**
1. Geolocation API provides coords
2. Client calculates seismic zone (getZoneByCoordinates)
3. Client geocodes address via Google API
4. Client fetches Google Places/Street View data
5. updateUserInput stores in React Context
6. onNext triggers saveLocationToDb
7. Server action saveLocation validates ownership
8. Prisma upserts to Location table
9. Assessment table updated with status/step

---

## Form 2: AIPhotoStep (Step 2)
**Location:** C:\code\quakewise\components\steps\AIPhotoStep.jsx
**Type:** Photo upload with AI analysis
**Status:** WARNING - Issues Found

### UI Layer
- **Component Type:** Client Component
- **Fields:**
  - images (array of file objects with base64, name, size, type)
  - aiAnalysisData (object, AI analysis results)
  - aiAnalysisComplete (boolean flag)

- **Validation:**
  - File type check: image/* only
  - File size check: 10MB max
  - Image count limit: 10 photos max
  - No schema validation for analysis results

- **UX Patterns:**
  - Camera capture or file upload
  - Grid display with delete capability
  - AI analysis with animated progress
  - Celebration animation on success
  - Re-analysis capability
  - Skip option (photos optional)

- **Issues Found:**
  - [WARNING] Base64 encoding in state causes large memory footprint for multiple images
  - [INFO] File validation is client-side only (lines 64-66)
  - [WARNING] No validation of AI analysis structure before storing to context
  - [INFO] Analysis can be re-run multiple times (could waste API calls)

### Server Action Layer
- **Action Path:** Multiple layers
  1. C:\code\quakewise\lib\imageAnalysis.js → analyzeImagesWithAI (client-side API call)
  2. C:\code\quakewise\app\api\analyze-image\route.js (API route - not shown in audit)
  3. C:\code\quakewise\lib\actions\assessment.js → updateAssessment (saves aiPhotoAnalysis)
  4. C:\code\quakewise\lib\actions\file.js → saveImages (saves image files)

- **Function Name:** saveAiPhotoAnalysisToDb (context method, line 318)
- **Security Measures:**
  - Authentication check in server actions
  - Assessment ownership verification
  - File type validation in file.js (ALLOWED_TYPES array)
  - File size validation (10MB max)

- **Error Handling:**
  - Client: Try-catch with retry logic (maxRetries = 2)
  - Server: Try-catch with error response objects
  - Image save failures logged but don't block flow

- **Issues Found:**
  - [CRITICAL] AI analysis results NOT validated against schema before DB storage
  - [WARNING] Images saved to DB separately from analysis - could have orphaned records
  - [WARNING] No deduplication check - same image could be uploaded multiple times
  - [INFO] API call failures only logged to console (lines 82, 122)

### Schema Layer
- **Client Schema:** NONE
- **Server Schema:** Implicit via Anthropic API response structure
- **Database Model:**
  - Assessment.aiPhotoAnalysis (JSON field)
  - AssessmentImage table for files

- **Alignment Status:** NO SCHEMA VALIDATION

**Expected AI Analysis Structure** (from processBuildingPhotoAnalysis):
```javascript
{
  buildingCharacteristics: {
    stories: number|string,
    type: string,
    structuralSystem: string,
    materialCondition: string,
    constructionPeriod: string
  },
  buildingType: string,
  numberOfStories: number,
  // ... other fields
}
```

- **Issues Found:**
  - [CRITICAL] No Zod schema to validate AI response structure
  - [WARNING] AI may return strings for numeric fields (e.g., stories) - type coercion on line 109-110
  - [WARNING] Field mapping inconsistencies (buildingCharacteristics.type vs buildingType)
  - [INFO] AI analysis stored as JSON blob - no relational structure for querying

### Database Layer
- **Target Models:**
  1. Assessment.aiPhotoAnalysis (JSON column)
  2. AssessmentImage table

- **Operation Type:**
  1. UPDATE (Assessment record)
  2. CREATE MANY (AssessmentImage records)

- **Transaction Used:** No - separate operations
- **Constraints:**
  - AssessmentImage: imageType enum, mimeType validation in code
  - Foreign key to Assessment (onDelete: CASCADE)
  - No uniqueness constraints on images

- **Issues Found:**
  - [CRITICAL] aiPhotoAnalysis and images saved in separate operations - not atomic
  - [WARNING] If image save fails, analysis still saved (data inconsistency)
  - [WARNING] No versioning - re-analysis overwrites previous results
  - [INFO] Large base64 strings stored in DB (should use blob storage for production)

### Flow Summary
```
UI → File Upload → Base64 Encode → API Call → AI Analysis → updateUserInput → saveAiPhotoAnalysisToDb
                                                                          → saveImagesToDb

Validation Layers:
File Upload: Type & size check (client)
AI API: Anthropic validates request, no output schema validation
Server Action: Type & size check, auth check
Database: Type constraints only
```

**Data Persistence Path:**
1. User selects/captures photos
2. Client converts to base64 (toBase64 function)
3. Client stores in local state (images array)
4. On analyze: Client calls analyzeImagesWithAI
5. API route processes images with Claude
6. AI returns analysis (structure not validated)
7. Client processes via processBuildingPhotoAnalysis
8. updateUserInput stores in context
9. saveAiPhotoAnalysisToDb → Assessment.aiPhotoAnalysis JSON field
10. saveImagesToDb → AssessmentImage table (separate operation)

---

## Form 3: BuildingInfoCombined (Step 3)
**Location:** C:\code\quakewise\components\steps\BuildingInfoCombined.jsx
**Type:** Building details confirmation/edit form
**Status:** NEEDS ATTENTION - Issues Found

### UI Layer
- **Component Type:** Client Component
- **Fields:**
  - buildingType (enum: reinforced-concrete, steel, masonry, timber, mixed)
  - numberOfStories (number)
  - yearOfConstruction (number, 1900-current year)
  - hasModifications (enum: yes, no)
  - numberOfBasement (number, 0-10)

- **Validation:**
  - Required: buildingType, numberOfStories
  - Range checks: yearOfConstruction (1900-2025), numberOfBasement (0-10)
  - NO schema validation framework
  - Validation done via disabled state on button (line 167)

- **UX Patterns:**
  - Two modes: "confirm" (for AI data) and "edit"
  - Auto-applies AI data on mount (useEffect line 67-74)
  - Show/hide advanced options (accordion)
  - Direct field editing with immediate context updates

- **Issues Found:**
  - [WARNING] AI buildingType mapping happens client-side (mapAiBuildingType) - could fail silently
  - [CRITICAL] Required field validation ONLY on client (isValid check, line 84)
  - [WARNING] numberOfStories can be string or number - type inconsistency
  - [INFO] Advanced fields (hasModifications, numberOfBasement) not required but not validated
  - [WARNING] aiDataApplied flag prevents re-application but not reset on data clear

### Server Action Layer
- **Action Path:** C:\code\quakewise\lib\actions\assessment.js
- **Function Name:** saveBuildingInfo (line 317)
- **Security Measures:**
  - Clerk auth check
  - Assessment ownership verification
  - Field whitelisting (only specific fields accepted)

- **Data Transformations:**
  - parseInt(numberOfStories) - could fail if invalid string
  - parseInt(yearOfConstruction) - could return NaN
  - buildingAge calculated: currentYear - constructionYear
  - irregularity string mapped to boolean flags (hasVerticalIrregularity, hasPlanIrregularity)
  - floorArea calculated from length * width (if both present)

- **Error Handling:**
  - Try-catch wrapper
  - Returns error object on failure
  - No validation error details returned

- **Issues Found:**
  - [CRITICAL] parseInt() can return NaN - no validation before DB write (line 361-362)
  - [CRITICAL] No server-side validation that buildingType is in allowed enum
  - [WARNING] irregularity mapping is simplistic (line 367-368) - doesn't match client structure
  - [WARNING] floorArea calculation assumes valid numbers (line 370-372)

### Schema Layer
- **Client Schema:** NONE
- **Server Schema:** NONE
- **Database Model:** BuildingInfo (Prisma)
- **Alignment Status:** CRITICAL MISMATCHES

**Field Mapping Issues:**

| Client Field | Server Field | Prisma Field | Type | Issues |
|-------------|--------------|--------------|------|--------|
| buildingType | buildingType | buildingType | String | No enum validation |
| numberOfStories | numberOfFloors | numberOfFloors | Int | Name mismatch, parseInt can fail |
| yearOfConstruction | constructionYear | constructionYear | Int? | parseInt can return NaN |
| hasModifications | - | - | - | Not saved to DB! |
| numberOfBasement | - | numberOfBasements | Int? | Field name mismatch |
| - | buildingAge | buildingAge | Int? | Calculated, could be negative |
| irregularity | hasVerticalIrregularity | hasVerticalIrregularity | Boolean | Simple string matching |
| irregularity | hasPlanIrregularity | hasPlanIrregularity | Boolean | Simple string matching |

- **Issues Found:**
  - [CRITICAL] hasModifications collected but NEVER saved to database
  - [CRITICAL] numberOfBasement field name mismatch (client: numberOfBasement, DB: numberOfBasements)
  - [CRITICAL] buildingType has no enum constraint - accepts any string
  - [WARNING] Calculated buildingAge not validated (could be negative if year is future)
  - [WARNING] irregularity mapping loses information (yes/no vs specific types)

### Database Layer
- **Target Model:** BuildingInfo (one-to-one with Assessment)
- **Operation Type:** UPSERT
- **Transaction Used:** No
- **Constraints:**
  - Unique on assessmentId
  - Foreign key to Assessment (onDelete: CASCADE)
  - No check constraints on field values
  - No enum constraints

- **Issues Found:**
  - [CRITICAL] No database constraints on numberOfFloors (could be 0, negative, or absurdly large)
  - [CRITICAL] No constraint on constructionYear (could be 0, negative, or future year)
  - [WARNING] buildingType accepts any string value (should be enum)
  - [INFO] No index on commonly filtered fields (buildingType, numberOfFloors)

### Flow Summary
```
UI → updateUserInput → saveBuildingInfoToDb → saveBuildingInfo → BuildingInfo.upsert

Validation Flow:
UI: Required field check only (buildingType, numberOfStories)
Client Schema: NONE
Server Validation: NONE (parseInt without error handling)
Database: Type constraints only
```

**Critical Data Loss:**
- hasModifications field collected but never persisted
- numberOfBasement has field name mismatch (may fail silently or be ignored)

---

## Form 4: OptionalDetailsStep (Step 4)
**Location:** C:\code\quakewise\components\steps\OptionalDetailsStep.jsx
**Type:** Optional details collection (dimensions, neighbors, loads)
**Status:** WARNING - Informational Issues

### UI Layer
- **Component Type:** Client Component
- **Fields (Accordion Sections):**
  1. Dimensions:
     - buildingLength (number, meters)
     - buildingWidth (number, meters)
     - floorHeight (number, meters)
  2. Neighbors:
     - adjacentBuildingRisk (enum: none, similar, taller, shorter)
     - separationDistance (number, meters)
  3. Extra Loads:
     - extraLoads.waterTank (boolean)
     - extraLoads.solarPanels (boolean)
     - extraLoads.heavyEquipment (boolean)
     - extraLoads.roofGarden (boolean)

- **Validation:**
  - NO validation - all fields completely optional
  - No min/max constraints
  - No required indicators

- **UX Patterns:**
  - Accordion UI with expandable sections
  - "Done" button per section marks completion (UI state only)
  - Main "Get Results" button always enabled
  - Can skip entire step

- **Issues Found:**
  - [INFO] All fields optional - no validation
  - [INFO] Completion tracking (completedSections) is UI state only - not persisted
  - [WARNING] extraLoads object structure not validated before save
  - [INFO] No guidance on units (meters assumed but not labeled in some places)

### Server Action Layer
- **Action Path:** NONE - This step has NO server action!
- **Function Name:** N/A
- **Security Measures:** N/A

- **Issues Found:**
  - [CRITICAL] Optional details collected but NEVER saved to database
  - [CRITICAL] All form data goes to context only - lost on page refresh
  - [CRITICAL] No persistence layer for this step at all

### Schema Layer
- **Client Schema:** NONE
- **Server Schema:** N/A (no server action)
- **Database Model:** N/A (no corresponding table fields)
- **Alignment Status:** NO DATABASE MAPPING

- **Issues Found:**
  - [CRITICAL] buildingLength and buildingWidth used in saveBuildingInfo to calculate floorArea BUT never saved themselves
  - [CRITICAL] adjacentBuildingRisk and separationDistance collected but never persisted
  - [CRITICAL] extraLoads object collected but never persisted
  - [WARNING] floorHeight collected but never used anywhere

### Database Layer
- **Target Model:** NONE
- **Operation Type:** NONE
- **Transaction Used:** N/A
- **Constraints:** N/A

- **Issues Found:**
  - [CRITICAL] Entire step's data is ephemeral - exists only in React Context
  - [CRITICAL] Data lost on page refresh (no localStorage backup shown)
  - [INFO] Some fields used for calculations (buildingLength/Width) but not stored

### Flow Summary
```
UI → updateUserInput → React Context ONLY
NO SERVER ACTION
NO DATABASE PERSISTENCE

Data Flow:
User Input → Context State → Used in results calculation → LOST after results shown
```

**Critical Gap:**
This entire form collects data that is never persisted. The data exists only in memory and is used for immediate calculations in the results page, then lost.

---

## Overall Findings

### Critical Issues (Must Fix Immediately)

1. **Form 1 (LocationStepSimple):**
   - No validation of latitude/longitude ranges at any layer
   - Server trusts client-side seismic zone calculation without verification

2. **Form 2 (AIPhotoStep):**
   - AI analysis results stored to DB with ZERO schema validation
   - Images and analysis saved in separate non-atomic operations (data consistency risk)

3. **Form 3 (BuildingInfoCombined):**
   - parseInt() operations can produce NaN values written to DB
   - hasModifications field collected but NEVER saved
   - numberOfBasement field name mismatch (client vs DB)
   - No server-side validation that required fields are present
   - buildingType accepts any string (should be enum)

4. **Form 4 (OptionalDetailsStep):**
   - Entire step collects data that is NEVER persisted to database
   - buildingLength/Width used for calculation but not stored
   - adjacentBuildingRisk, separationDistance, extraLoads all lost

### Warnings (Should Fix)

1. **Overall Architecture:**
   - NO schema validation library (Zod, Yup) used anywhere in the codebase
   - Validation is inconsistent - some at UI level, none at server level
   - No centralized validation approach

2. **Form 1 (LocationStepSimple):**
   - Background data collection failures are silent (only console.error)
   - earthquakeZone and soilType have no enum constraints
   - No rate limiting on location save operations

3. **Form 2 (AIPhotoStep):**
   - Base64 images in React state cause large memory footprint
   - No deduplication - same image can be uploaded multiple times
   - Type coercion for AI response fields (stories can be string or number)

4. **Form 3 (BuildingInfoCombined):**
   - AI buildingType mapping can fail silently with no fallback
   - irregularity mapping is simplistic (yes/no doesn't capture complexity)
   - Calculated buildingAge not validated (could be negative)

5. **Database Layer (All Forms):**
   - No database-level constraints on numeric ranges
   - No enum constraints for categorical fields
   - Missing indexes on commonly queried fields
   - No versioning/audit trail for data changes

### Informational (Good to Know)

1. **Form 1:**
   - Weather data is simulated (lines 77-82 in LocationStepSimple.jsx)
   - Google API key exposed as public env var (expected for client-side SDK)
   - Some Location table fields never populated (weatherCondition, temperature)

2. **Form 2:**
   - AI analysis can be re-run multiple times (potential for wasted API calls)
   - Large images stored as base64 in DB (should use blob storage for production)

3. **Form 3:**
   - AI data auto-applied on mount via useEffect
   - Advanced fields in accordion are truly optional

4. **Form 4:**
   - Step is entirely optional by design
   - "Done" button per section is UI state only

5. **Context Pattern:**
   - UserInputContext serves as in-memory cache
   - Good separation between context (cache) and DB (persistence)
   - Context properly provides DB sync functions

### Architecture Assessment

**Data Flow Pattern:**
```
UI Component → updateUserInput (context) → onNext() → saveXxxToDb (context method) → Server Action → Prisma
```

**Validation Layers Present:**
- UI: Minimal (required field checks, disabled buttons)
- Client Schema: NONE
- Server Validation: NONE (only auth/ownership checks)
- Database: Type constraints only

**Missing Validation Layers:**
1. No Zod/Yup schemas anywhere
2. No server-side input validation
3. No database constraints beyond types
4. No enum types for categorical data

**State Management:**
- Context: Well-structured, appropriate use
- DB Sync: Methods properly defined in context
- Persistence: Inconsistent (Step 4 has none)

**Error Handling:**
- Try-catch present in all server actions
- Error objects returned (not thrown)
- Validation errors NOT distinguished from system errors
- Client-side errors logged but not always shown to user

---

## Recommendations

### Immediate Actions (Priority 1)

1. **Add Zod Schema Validation:**
   ```
   Create schemas/assessment.ts with:
   - locationSchema (lat/lng bounds, required fields)
   - buildingInfoSchema (enum for buildingType, number validation)
   - aiAnalysisSchema (validate AI response structure)
   ```

2. **Fix Form 3 Data Loss:**
   - Map hasModifications to database field (add to BuildingInfo model)
   - Fix numberOfBasement → numberOfBasements field name
   - Add server-side validation before parseInt()

3. **Fix Form 4 Persistence:**
   - Create OptionalDetails table OR add JSON column to Assessment
   - Implement saveOptionalDetailsToDb server action
   - Call on step completion

4. **Add Server-Side Validation:**
   - Validate all inputs in server actions using Zod
   - Return specific validation errors (field-level)
   - Check latitude range (-90 to 90), longitude range (-180 to 180)

### Short-Term Actions (Priority 2)

5. **Add Database Constraints:**
   ```sql
   ALTER TABLE Location ADD CONSTRAINT check_latitude CHECK (latitude >= -90 AND latitude <= 90);
   ALTER TABLE Location ADD CONSTRAINT check_longitude CHECK (longitude >= -180 AND longitude <= 180);
   ALTER TABLE BuildingInfo ADD CONSTRAINT check_floors CHECK (numberOfFloors > 0 AND numberOfFloors < 200);
   CREATE TYPE building_type AS ENUM ('reinforced-concrete', 'steel', 'masonry', 'timber', 'mixed');
   ```

6. **Atomic Operations:**
   - Wrap image save + analysis save in Prisma transaction
   - Use Promise.all for related operations or ensure rollback capability

7. **Add Input Validation UI:**
   - Show field-level errors (not just disabled buttons)
   - Use react-hook-form with Zod resolver
   - Validate on blur, not just on submit

### Long-Term Improvements (Priority 3)

8. **Centralize Validation:**
   - Create shared validation schemas in /schemas directory
   - Use same schema on client and server
   - Generate TypeScript types from Zod schemas

9. **Add Versioning:**
   - Track aiPhotoAnalysis versions (allow re-analysis without data loss)
   - Add updatedAt tracking for BuildingInfo, Location

10. **Optimize Image Handling:**
    - Use object storage (S3, Cloudinary) instead of base64 in DB
    - Store only URLs in database
    - Implement image compression before upload

11. **Add Audit Trail:**
    - Log all assessment updates with user, timestamp, changes
    - Track which data came from AI vs manual input

12. **Improve Error UX:**
    - Toast notifications for save failures
    - Retry mechanism with exponential backoff
    - Offline mode with localStorage queue

---

## Schema Alignment Matrix

| Field | Step 1 | Step 2 | Step 3 | Step 4 | Context | Server Action | Database | Status |
|-------|--------|--------|--------|--------|---------|---------------|----------|--------|
| latitude | SET | - | - | - | STORED | VALIDATED (auth only) | SAVED | NO BOUNDS CHECK |
| longitude | SET | - | - | - | STORED | VALIDATED (auth only) | SAVED | NO BOUNDS CHECK |
| buildingType | - | AI SET | REQUIRED | - | STORED | NO VALIDATION | SAVED | NO ENUM |
| numberOfStories | AI SET | AI SET | REQUIRED | - | STORED | parseInt (unsafe) | SAVED (numberOfFloors) | NAME MISMATCH |
| hasModifications | - | - | COLLECTED | - | STORED | NOT SAVED | NOT IN DB | DATA LOSS |
| numberOfBasement | - | - | COLLECTED | - | STORED | NOT MAPPED | numberOfBasements | NAME MISMATCH |
| buildingLength | - | - | - | COLLECTED | STORED | USED but not saved | NOT IN DB | DATA LOSS |
| buildingWidth | - | - | - | COLLECTED | STORED | USED but not saved | NOT IN DB | DATA LOSS |
| adjacentBuildingRisk | - | - | - | COLLECTED | STORED | NOT SAVED | NOT IN DB | DATA LOSS |
| extraLoads | - | - | - | COLLECTED | STORED | NOT SAVED | NOT IN DB | DATA LOSS |

**Legend:**
- SET = User directly sets value
- AI SET = AI provides value
- COLLECTED = Form collects value
- REQUIRED = Validation requires value
- STORED = In React Context
- SAVED = Persisted to DB
- DATA LOSS = Collected but never saved

---

## Next Steps for Fixing Agent

The fixing agent should prioritize issues in this order:

1. **Critical Data Loss (Fix First):**
   - Add OptionalDetails persistence (Step 4)
   - Fix hasModifications field mapping (Step 3)
   - Fix numberOfBasement field name (Step 3)

2. **Critical Validation (Fix Second):**
   - Add Zod schemas for all forms
   - Add server-side validation in all save actions
   - Add parseInt safety checks

3. **Database Integrity (Fix Third):**
   - Add constraints on numeric ranges
   - Add enum types for categorical fields
   - Make atomic operations for related saves

4. **User Experience (Fix Fourth):**
   - Add field-level error display
   - Improve save failure handling
   - Add offline support

This audit provides a complete roadmap for systematic remediation of all form flow issues in the QuakeWise assessment process.
