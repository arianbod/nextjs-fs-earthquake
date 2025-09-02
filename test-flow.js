// Test script to verify the assessment flow components
const fs = require('fs');
const path = require('path');

console.log('🔍 Testing QuakeWise Assessment Flow\n');
console.log('=' .repeat(50));

// Check if all step components exist
const steps = [
    'LocationStep',
    'WeatherDataStep', 
    'AIPhotoStep',
    'BuildingInfoStep',
    'StructuralSystemStep',
    'IrregularityStep',
    'PlanDefinitionStep',
    'ManipulationReviewStep',
    'SpecificConditionStep',
    'ExtraLoadStep',
    'NeighborBuildingsStep'
];

console.log('\n📋 Step Components Check:');
console.log('-'.repeat(30));

steps.forEach((step, index) => {
    const filePath = path.join(__dirname, 'components', 'steps', `${step}.jsx`);
    const exists = fs.existsSync(filePath);
    const icon = exists ? '✅' : '❌';
    console.log(`${icon} Step ${index + 1}: ${step} ${exists ? '(Found)' : '(Missing!)'}`);
});

// Check AssessmentSteps.js configuration
console.log('\n⚙️ Assessment Steps Configuration:');
console.log('-'.repeat(30));

const assessmentStepsPath = path.join(__dirname, 'components', 'AssessmentSteps.js');
if (fs.existsSync(assessmentStepsPath)) {
    const content = fs.readFileSync(assessmentStepsPath, 'utf8');
    const stepsOrder = content.match(/component: (\w+)/g);
    if (stepsOrder) {
        console.log('✅ Steps configured in order:');
        stepsOrder.forEach((match, index) => {
            const stepName = match.replace('component: ', '');
            console.log(`   ${index + 1}. ${stepName}`);
        });
    }
} else {
    console.log('❌ AssessmentSteps.js not found!');
}

// Check for key features in each step
console.log('\n🔎 Key Features Check:');
console.log('-'.repeat(30));

// Check LocationStep for Street View integration
const locationStepPath = path.join(__dirname, 'components', 'steps', 'LocationStep.jsx');
if (fs.existsSync(locationStepPath)) {
    const content = fs.readFileSync(locationStepPath, 'utf8');
    const hasStreetView = content.includes('streetViewService');
    const hasGooglePlaces = content.includes('googlePlacesService');
    const savesStreetViewUrl = content.includes('streetViewUrl');
    
    console.log('LocationStep:');
    console.log(`  ${hasStreetView ? '✅' : '❌'} Street View Service integration`);
    console.log(`  ${hasGooglePlaces ? '✅' : '❌'} Google Places Service integration`);
    console.log(`  ${savesStreetViewUrl ? '✅' : '❌'} Saves Street View URLs`);
}

// Check WeatherDataStep for Street View display
const weatherStepPath = path.join(__dirname, 'components', 'steps', 'WeatherDataStep.jsx');
if (fs.existsSync(weatherStepPath)) {
    const content = fs.readFileSync(weatherStepPath, 'utf8');
    const showsStreetView = content.includes('userInput.streetViewUrl');
    const showsSatellite = content.includes('userInput.satelliteViewUrl');
    const hasWowBadge = content.includes('WOW');
    const hasAnimations = content.includes('animate-fade-in');
    
    console.log('\nWeatherDataStep:');
    console.log(`  ${showsStreetView ? '✅' : '❌'} Shows Street View images`);
    console.log(`  ${showsSatellite ? '✅' : '❌'} Shows Satellite images`);
    console.log(`  ${hasWowBadge ? '✅' : '❌'} Has WOW badge`);
    console.log(`  ${hasAnimations ? '✅' : '❌'} Has fade-in animations`);
}

// Check AIPhotoStep for Claude API integration
const aiPhotoStepPath = path.join(__dirname, 'components', 'steps', 'AIPhotoStep.jsx');
if (fs.existsSync(aiPhotoStepPath)) {
    const content = fs.readFileSync(aiPhotoStepPath, 'utf8');
    const hasMultipleUploads = content.includes('uploadedPhotos');
    const sendsToClaude = content.includes('/api/analyze-image');
    const combinesWithGoogle = content.includes('Google Street View');
    
    console.log('\nAIPhotoStep:');
    console.log(`  ${hasMultipleUploads ? '✅' : '❌'} Multiple photo upload areas`);
    console.log(`  ${sendsToClaude ? '✅' : '❌'} Sends to Claude API`);
    console.log(`  ${combinesWithGoogle ? '✅' : '❌'} Mentions combining with Google images`);
}

// Check BuildingInfoStep for auto-population
const buildingInfoPath = path.join(__dirname, 'components', 'steps', 'BuildingInfoStep.jsx');
if (fs.existsSync(buildingInfoPath)) {
    const content = fs.readFileSync(buildingInfoPath, 'utf8');
    const hasAutoFill = content.includes('hasAIData');
    const showsDataSource = content.includes('Location-based') || content.includes('AI Detected');
    
    console.log('\nBuildingInfoStep:');
    console.log(`  ${hasAutoFill ? '✅' : '❌'} Auto-fills from AI data`);
    console.log(`  ${showsDataSource ? '✅' : '❌'} Shows data source badges`);
}

// Check API route
console.log('\n🔌 API Endpoints:');
console.log('-'.repeat(30));

const apiPath = path.join(__dirname, 'app', 'api', 'analyze-image', 'route.js');
if (fs.existsSync(apiPath)) {
    const content = fs.readFileSync(apiPath, 'utf8');
    const hasCorrectModel = content.includes('claude-3-5-sonnet');
    const hasToolSchema = content.includes('buildingAnalysisTool');
    
    console.log('analyze-image API:');
    console.log(`  ${hasCorrectModel ? '✅' : '❌'} Uses correct Claude model`);
    console.log(`  ${hasToolSchema ? '✅' : '❌'} Has structured tool schema`);
} else {
    console.log('❌ analyze-image API route not found!');
}

console.log('\n' + '='.repeat(50));
console.log('✨ Flow Summary:');
console.log('  1. Location Step → Secretly gathers Street View/Satellite');
console.log('  2. Weather Step → Reveals Street View with WOW moment');
console.log('  3. AI Photo Step → User uploads + combines with Google');
console.log('  4. Building Info → Auto-populated from all sources');

console.log('\n🎯 Testing Complete!');