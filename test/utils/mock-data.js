/**
 * Mock data for testing various scenarios
 */

export const mockOpenAIResponse = {
  id: 'chatcmpl-test123',
  object: 'chat.completion',
  created: 1234567890,
  model: 'gpt-4o-2024-05-13',
  choices: [
    {
      index: 0,
      message: {
        role: 'assistant',
        content: 'This is a helpful response about earthquake safety.',
      },
      finish_reason: 'stop',
    },
  ],
  usage: {
    prompt_tokens: 50,
    completion_tokens: 20,
    total_tokens: 70,
  },
};

export const mockSeismicData = {
  latitude: 41.0082,
  longitude: 28.9784,
  zone: 1,
  soilType: 'Z2',
  pga: 0.4,
  availableData: true,
  nearestFault: {
    name: 'North Anatolian Fault',
    distance: 15,
    type: 'strike-slip',
  },
  seismicParameters: {
    Ss: 1.5,
    S1: 0.6,
    SDs: 1.0,
    SD1: 0.5,
  },
};

export const mockBuildingData = {
  buildingType: 'residential',
  floors: 5,
  constructionYear: 2010,
  structuralSystem: 'reinforced_concrete',
  foundationType: 'shallow',
  soilType: 'Z2',
  totalArea: 500,
  hasBasement: false,
  irregularities: {
    plan: false,
    vertical: false,
    mass: false,
  },
};

export const mockCalculationResults = {
  safetyScore: 75,
  performanceLevel: 'life_safety',
  riskLevel: 'moderate',
  vulnerabilityFactors: {
    structural: 0.3,
    seismic: 0.4,
    soil: 0.2,
    age: 0.1,
  },
  recommendations: [
    'Consider seismic retrofitting',
    'Regular structural inspections recommended',
    'Ensure compliance with current building codes',
  ],
};

export const mockCities = [
  { id: 1, name: 'Istanbul', zone: 1, population: 15000000 },
  { id: 2, name: 'Ankara', zone: 2, population: 5500000 },
  { id: 3, name: 'Izmir', zone: 1, population: 4300000 },
  { id: 4, name: 'Bursa', zone: 2, population: 3000000 },
];

export const mockUserInputContext = {
  step1: {
    buildingType: 'residential',
    floors: 5,
    constructionYear: 2010,
  },
  step2: {
    structuralSystem: 'reinforced_concrete',
    foundationType: 'shallow',
  },
  step3: {
    latitude: 41.0082,
    longitude: 28.9784,
    city: 'Istanbul',
  },
};

export const mockChatHistory = [
  {
    role: 'user',
    content: 'What is the seismic zone for Istanbul?',
    timestamp: 1234567890,
  },
  {
    role: 'assistant',
    content: 'Istanbul is located in seismic zone 1, which is the highest risk zone in Turkey.',
    timestamp: 1234567891,
  },
  {
    role: 'user',
    content: 'What building type is safest?',
    timestamp: 1234567892,
  },
  {
    role: 'assistant',
    content: 'Reinforced concrete frame buildings with proper seismic design are generally the safest option.',
    timestamp: 1234567893,
  },
];

export const mockEmailData = {
  to: 'user@example.com',
  subject: 'Earthquake Safety Assessment Results',
  from: 'noreply@earthquakeapp.com',
  html: '<p>Your assessment results are ready.</p>',
  text: 'Your assessment results are ready.',
};

export const mockAssessmentSteps = {
  'building-info': {
    completed: true,
    data: {
      buildingType: 'residential',
      floors: 5,
      constructionYear: 2010,
    },
  },
  'structural-system': {
    completed: true,
    data: {
      structuralSystem: 'reinforced_concrete',
      foundationType: 'shallow',
    },
  },
  location: {
    completed: true,
    data: {
      latitude: 41.0082,
      longitude: 28.9784,
      city: 'Istanbul',
    },
  },
  'specific-condition': {
    completed: false,
    data: {},
  },
};

export const mockPersonas = {
  openai: {
    id: 'openai',
    name: 'OpenAI Assistant',
    provider: 'openai',
    model: 'gpt-4o-2024-05-13',
  },
  claude: {
    id: 'claude',
    name: 'Claude',
    provider: 'anthropic',
    model: 'claude-3-5-sonnet-20241022',
  },
};
