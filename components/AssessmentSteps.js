// components/AssessmentSteps.js
// Simplified 5-step assessment flow (was 12 steps)

// New simplified components
import LocationStepSimple from './steps/LocationStepSimple';
import BuildingInfoCombined from './steps/BuildingInfoCombined';
import AIPhotoStep from './steps/AIPhotoStep';
import OptionalDetailsStep from './steps/OptionalDetailsStep';

// Keep old imports for backwards compatibility (can be removed later)
// import LocationStep from './steps/LocationStep';
// import WeatherDataStep from './steps/WeatherDataStep';
// import ArchitecturePlanStep from './steps/ArchitecturePlanStep';
// import BuildingInfoStep from './steps/BuildingInfoStep';
// import StructuralSystemStep from './steps/StructuralSystemStep';
// import IrregularityStep from './steps/IrregularityStep';
// import PlanDefinitionStep from './steps/PlanDefinitionStep';
// import ManipulationReviewStep from './steps/ManipulationReviewStep';
// import SpecificConditionStep from './steps/SpecificConditionStep';
// import ExtraLoadStep from './steps/ExtraLoadStep';
// import NeighborBuildingsStep from './steps/NeighborBuildingsStep';

/**
 * New Simplified Assessment Flow (5 steps)
 *
 * Old flow (12 steps):
 * 1. Location → 2. Weather → 3. Architecture Plans → 4. AI Photos →
 * 5. Building Info → 6. Structural System → 7. Irregularity →
 * 8. Plan Definition → 9. Manipulation → 10. Specific Condition →
 * 11. Extra Load → 12. Neighbors
 *
 * New flow (5 steps):
 * 1. Location (GPS + background data collection for weather, street view, etc.)
 * 2. Building Info (type, stories, year, modifications - combined form)
 * 3. Photos (AI analysis - optional but recommended)
 * 4. Details (optional - dimensions, neighbors, loads, plans - accordion style)
 * 5. → Results Page
 *
 * Key UX improvements:
 * - Data collected silently in background (no overwhelming info dumps)
 * - "Wow moments" saved for results page reveal
 * - Optional details can be skipped entirely
 * - AI suggestions help auto-fill forms
 */

const AssessmentSteps = [
    {
        component: LocationStepSimple,
        title: "Location",
        description: "Where is your building?"
    },
    {
        component: AIPhotoStep,
        title: "Photos",
        description: "Upload photos for AI analysis"
    },
    {
        component: BuildingInfoCombined,
        title: "Confirm Details",
        description: "Verify AI detected information"
    },
    {
        component: OptionalDetailsStep,
        title: "Extra Details",
        description: "Optional - for more accuracy"
    },
];

export default AssessmentSteps;

/**
 * Original 12-step flow (kept for reference/rollback)
 *
 * const OriginalAssessmentSteps = [
 *     { component: LocationStep, title: "Location" },
 *     { component: WeatherDataStep, title: "Environmental Data" },
 *     { component: ArchitecturePlanStep, title: "Architectural Plans" },
 *     { component: AIPhotoStep, title: "Building Photos & AI Analysis" },
 *     { component: BuildingInfoStep, title: "Building Information" },
 *     { component: StructuralSystemStep, title: "Structural System" },
 *     { component: IrregularityStep, title: "Irregularity" },
 *     { component: PlanDefinitionStep, title: "Plan Definition" },
 *     { component: ManipulationReviewStep, title: "Manipulation Review" },
 *     { component: SpecificConditionStep, title: "Specific Condition" },
 *     { component: ExtraLoadStep, title: "Extra Load" },
 *     { component: NeighborBuildingsStep, title: "Neighbor Buildings" },
 * ];
 */
