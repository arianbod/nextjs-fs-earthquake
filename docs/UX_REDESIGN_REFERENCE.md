# UX Redesign Reference Guide

This document tracks all changes made during the UX redesign (November 2025) for easy rollback or feature restoration.

## Overview

The UX was simplified from 12 steps to 4 steps, but **NO FILES WERE DELETED**. All original components still exist and can be restored.

---

## Original Files (PRESERVED - NOT DELETED)

### Assessment Steps (All Still Exist)
| File | Lines | Status | Data Collected |
|------|-------|--------|----------------|
| `components/steps/LocationStep.jsx` | 614 | PRESERVED | GPS, seismic zone, street views (8 angles), satellite |
| `components/steps/WeatherDataStep.jsx` | 901 | PRESERVED | Rainfall, soil saturation, weather extremes |
| `components/steps/ArchitecturePlanStep.jsx` | ~200 | PRESERVED | Floor plan uploads, AI plan analysis |
| `components/steps/AIPhotoStep.jsx` | 809 | IN USE | Photo uploads, AI building analysis |
| `components/steps/BuildingInfoStep.jsx` | 460 | PRESERVED | Earthquake zone, soil type, design regulation, year, stories |
| `components/steps/StructuralSystemStep.jsx` | 162 | PRESERVED | Building type selection (RC, Steel, Timber, etc.) |
| `components/steps/IrregularityStep.jsx` | 232 | PRESERVED | Plan/vertical irregularities |
| `components/steps/PlanDefinitionStep.jsx` | 542 | PRESERVED | Detailed plan shape, dimensions |
| `components/steps/ManipulationReviewStep.jsx` | 190 | PRESERVED | Structural modifications check |
| `components/steps/SpecificConditionStep.jsx` | 242 | PRESERVED | Special conditions (slope, liquefaction) |
| `components/steps/ExtraLoadStep.jsx` | 312 | PRESERVED | Water tanks, solar panels, extra loads |
| `components/steps/NeighborBuildingsStep.jsx` | 230 | PRESERVED | Adjacent building analysis |

### Results Page Components (PRESERVED)
| File | Status | Contains |
|------|--------|----------|
| `components/results/EarthquakePerformanceChart.jsx` | PRESERVED | Performance chart (moved to expert mode) |
| `components/results/BuildingComparisonChart.jsx` | PRESERVED | Comparison chart |
| `components/results/CostBenefitCard.jsx` | PRESERVED | Cost analysis |
| `components/ImageGallery.jsx` | PRESERVED | Full image gallery display |

---

## New Simplified Files

### Assessment Steps (NEW)
| File | Replaces | Key Changes |
|------|----------|-------------|
| `components/steps/LocationStepSimple.jsx` | LocationStep + WeatherDataStep | Data collected SILENTLY in background |
| `components/steps/BuildingInfoCombined.jsx` | BuildingInfo + Structural + Irregularity | Single form with AI suggestions |
| `components/steps/OptionalDetailsStep.jsx` | PlanDef + Manipulation + Specific + ExtraLoad + Neighbors | Accordion style, can skip |

### Results Components (NEW)
| File | Purpose |
|------|---------|
| `components/results/ExpertModeToggle.jsx` | Toggle between simple/expert views |
| `components/results/SafetyScoreHero.jsx` | Clean score display |
| `components/results/KeyFindings.jsx` | 3-5 key findings |
| `components/results/ExpertDataPanels.jsx` | Collapsible expert data sections |

---

## How to Restore Original Flow

### Option 1: Full Rollback
Edit `components/AssessmentSteps.js` and uncomment the original imports:

```javascript
// Uncomment these:
import LocationStep from './steps/LocationStep';
import WeatherDataStep from './steps/WeatherDataStep';
import ArchitecturePlanStep from './steps/ArchitecturePlanStep';
import AIPhotoStep from './steps/AIPhotoStep';
import BuildingInfoStep from './steps/BuildingInfoStep';
import StructuralSystemStep from './steps/StructuralSystemStep';
import IrregularityStep from './steps/IrregularityStep';
import PlanDefinitionStep from './steps/PlanDefinitionStep';
import ManipulationReviewStep from './steps/ManipulationReviewStep';
import SpecificConditionStep from './steps/SpecificConditionStep';
import ExtraLoadStep from './steps/ExtraLoadStep';
import NeighborBuildingsStep from './steps/NeighborBuildingsStep';

// Replace AssessmentSteps array with:
const AssessmentSteps = [
    { component: LocationStep, title: "Location" },
    { component: WeatherDataStep, title: "Environmental Data" },
    { component: ArchitecturePlanStep, title: "Architectural Plans" },
    { component: AIPhotoStep, title: "Building Photos & AI Analysis" },
    { component: BuildingInfoStep, title: "Building Information" },
    { component: StructuralSystemStep, title: "Structural System" },
    { component: IrregularityStep, title: "Irregularity" },
    { component: PlanDefinitionStep, title: "Plan Definition" },
    { component: ManipulationReviewStep, title: "Manipulation Review" },
    { component: SpecificConditionStep, title: "Specific Condition" },
    { component: ExtraLoadStep, title: "Extra Load" },
    { component: NeighborBuildingsStep, title: "Neighbor Buildings" },
];
```

### Option 2: Restore Specific Features

#### Restore Weather Data Display
The weather data is still COLLECTED in `LocationStepSimple.jsx` (line ~90-110).
To display it again, add weather cards back to the component or create a separate step.

#### Restore Street View Gallery
Street views are still COLLECTED and stored in `userInput.streetViewImages`.
They're displayed in:
- Results page Expert Mode (`ExpertDataPanels.jsx`)
- Original `LocationStep.jsx` (if restored)

#### Restore Detailed Building Form
Use `BuildingInfoStep.jsx` instead of `BuildingInfoCombined.jsx` to get:
- Detailed soil type selection (ZA-ZE)
- Design regulation periods
- More granular earthquake zone selection

#### Restore Plan Analysis
`ArchitecturePlanStep.jsx` can be re-added to collect:
- Floor plan uploads
- AI structural analysis
- Rebar positions, grid systems, MEP data

---

## Data Flow Comparison

### Original Flow (Displayed Everything)
```
Location → [SHOW map + 8 street views + seismic cards + satellite]
Weather → [SHOW 20+ weather data points, rainfall, saturation]
Plans → [SHOW upload UI + AI analysis results]
Photos → [SHOW AI analysis with all details]
Building → [SHOW complex form with tooltips]
...etc
```

### New Flow (Collect Silently, Reveal in Results)
```
Location → [SHOW only map + address + zone number]
           [COLLECT silently: street views, weather, satellite, seismic details]

Building → [SHOW simple form with AI pre-fill]
           [COLLECT: type, stories, year, modifications]

Photos → [SHOW upload + simple analysis]
         [COLLECT: detailed AI analysis]

Details → [SHOW accordion - optional, can skip]
          [COLLECT: dimensions, neighbors, loads if user expands]

Results → [REVEAL everything: "wow moment" with all collected data]
          [Expert Mode: show all technical details]
```

---

## Important Data Fields

These fields are still collected and stored in `userInput`:

### Location Data
- `latitude`, `longitude` - GPS coordinates
- `address`, `city`, `neighborhood`, `country` - Address components
- `typeOfEarthquake`, `earthquakeZone` - Seismic zone
- `typeOfSoil`, `soilType` - Soil classification
- `streetViewUrl`, `streetViewImages` - All street view angles
- `satelliteViewUrl` - Satellite image
- `streetViewData` - AI analysis from street view

### Weather/Environmental Data
- `weatherData.rainfall` - 5-day rainfall, max daily, monthly estimate
- `weatherData.soilSaturationRisk` - LOW/MEDIUM/HIGH
- `weatherData.analysis` - Impact description, multiplier

### Building Data
- `buildingType`, `structuralSystem` - Construction type
- `numberOfStories`, `numberOfBasement` - Height
- `yearOfConstruction`, `designRegulation` - Age/code
- `hasModifications` - Structural changes
- `planIrregularity`, `verticalIrregularity` - Shape issues

### AI Analysis Data
- `aiAnalysisData` - Full photo analysis results
- `aiAnalysisData.buildingCharacteristics` - Detected features
- `aiAnalysisData.confidence` - Analysis confidence
- `aiAnalysisData.aiInsights` - Visual observations

### Optional Details (if user fills)
- `buildingLength`, `buildingWidth`, `floorHeight` - Dimensions
- `adjacentBuildingRisk`, `separationDistance` - Neighbors
- `extraLoads` - Water tanks, solar, equipment

---

## Results Page Comparison

### Original (5 tabs, ~1400 lines)
1. Summary - Score + findings
2. Images - Gallery + storage info
3. Input Data - 800+ lines of raw technical data
4. Details - Building characteristics
5. Certificate - PDF generation

### New (3 tabs + Expert Mode, ~520 lines)
1. Score - Hero score + key findings + Expert Mode toggle
2. Actions - Recommendations + consultation CTA
3. Report - Certificate + performance summary

Expert Mode reveals:
- AI Photo Analysis panel
- Location & Seismic Data panel
- Weather & Environmental panel
- Building Technical Specs panel
- Architectural Plan Analysis panel
- All Collected Images panel
- Calculation Methodology panel

---

## Git Reference

To see exactly what changed, compare commits:
- Before redesign: Check git history for commits before this date
- After redesign: Current HEAD

Key files modified:
- `components/AssessmentSteps.js` - Step configuration
- `app/(pages)/result/[id]/page.jsx` - Results page

Key files added:
- `components/steps/LocationStepSimple.jsx`
- `components/steps/BuildingInfoCombined.jsx`
- `components/steps/OptionalDetailsStep.jsx`
- `components/results/ExpertModeToggle.jsx`
- `components/results/SafetyScoreHero.jsx`
- `components/results/KeyFindings.jsx`
- `components/results/ExpertDataPanels.jsx`

---

## Questions?

The original functionality is all preserved. The new UX just:
1. Collects data silently instead of displaying it immediately
2. Reveals everything dramatically in the results page
3. Hides technical details behind Expert Mode toggle

Nothing was lost - just reorganized for better user experience.
