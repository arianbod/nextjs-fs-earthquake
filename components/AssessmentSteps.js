import LocationStep from './steps/LocationStep';
import BuildingInfoStep from './steps/BuildingInfoStep';
import StructuralSystemStep from './steps/StructuralSystemStep';
import IrregularityStep from './steps/IrregularityStep';
import PlanDefinitionStep from './steps/PlanDefinitionStep';
import ManipulationReviewStep from './steps/ManipulationReviewStep';
import SpecificConditionStep from './steps/SpecificConditionStep';
import ExtraLoadStep from './steps/ExtraLoadStep';
import NeighborBuildingsStep from './steps/NeighborBuildingsStep';

const AssessmentSteps = [
    { component: LocationStep, title: "Location" },
    { component: BuildingInfoStep, title: "Building Information" },
    { component: StructuralSystemStep, title: "Structural System" },
    { component: IrregularityStep, title: "Irregularity" },
    { component: PlanDefinitionStep, title: "Plan Definition" },
    { component: ManipulationReviewStep, title: "Manipulation Review" },
    { component: SpecificConditionStep, title: "Specific Condition" },
    { component: ExtraLoadStep, title: "Extra Load" },
    { component: NeighborBuildingsStep, title: "Neighbor Buildings" },
];

export default AssessmentSteps;