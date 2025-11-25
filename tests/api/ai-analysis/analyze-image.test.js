/**
 * API Tests: POST /api/analyze-image
 * Tests for the image analysis endpoint with structured outputs
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { POST, GET } from '@/app/api/analyze-image/route';

// Mock the structured outputs module
vi.mock('@/lib/ai/structuredOutputs', () => ({
  analyzeImagesStructured: vi.fn(),
}));

import { analyzeImagesStructured } from '@/lib/ai/structuredOutputs';

describe('[API] POST /api/analyze-image', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.ANTHROPIC_API_KEY = 'test-api-key';
  });

  afterEach(() => {
    delete process.env.ANTHROPIC_API_KEY;
  });

  // Helper to create form data with image
  function createFormDataWithImage(options = {}) {
    const {
      imageCount = 1,
      analysisType = 'building',
      imageType = 'image/jpeg',
      imageSize = 1024,
      additionalContext = null,
    } = options;

    const formData = new FormData();

    // Create mock image files
    for (let i = 0; i < imageCount; i++) {
      // Create a valid JPEG header for type detection
      const jpegHeader = new Uint8Array([0xFF, 0xD8, 0xFF, 0xE0]);
      const filler = new Uint8Array(imageSize - 4);
      const imageData = new Uint8Array([...jpegHeader, ...filler]);

      const file = new File([imageData], `test-image-${i}.jpg`, {
        type: imageType,
      });
      formData.append('images', file);
    }

    formData.append('analysisType', analysisType);

    if (additionalContext) {
      formData.append('additionalContext', JSON.stringify(additionalContext));
    }

    return formData;
  }

  // Helper to create request
  function createRequest(formData) {
    return new Request('http://localhost:3000/api/analyze-image', {
      method: 'POST',
      body: formData,
    });
  }

  describe('GET /api/analyze-image', () => {
    it('should return API status', async () => {
      const request = new Request('http://localhost:3000/api/analyze-image');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.status).toBe('API is running');
      expect(data.structuredOutputs).toBe(true);
      expect(data.supportedTypes).toContain('building');
      expect(data.supportedTypes).toContain('floorPlan');
      expect(data.supportedTypes).toContain('satellite');
    });
  });

  describe('Success Cases', () => {
    it('should analyze building image successfully', async () => {
      const mockAnalysisResult = {
        buildingLength: 25.0,
        buildingWidth: 15.0,
        buildingHeight: 12.0,
        numberOfStories: 4,
        structuralSystem: 'Reinforced Concrete Frame',
        constructionPeriod: '2000-2010',
        materialCondition: 'good',
        irregularities: {
          plan: 'regular',
          vertical: 'regular',
          mass: 'regular',
        },
        riskFactors: {
          softStory: 'not detected',
          heavyOverhang: 'not detected',
          adjacentBuilding: 'moderate',
          foundation: 'unknown',
        },
        confidence: 'high',
        recommendations: ['Regular maintenance recommended'],
      };

      analyzeImagesStructured.mockResolvedValue(mockAnalysisResult);

      const formData = createFormDataWithImage({ analysisType: 'building' });
      const request = createRequest(formData);
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.analysis).toBeDefined();
      expect(data.confidence).toBe('high');
      expect(data.imagesAnalyzed).toBe(1);
      expect(data.debug.structuredOutputs).toBe(true);
    });

    it('should analyze floor plan image successfully', async () => {
      const mockAnalysisResult = {
        buildingLength: 30.0,
        buildingWidth: 20.0,
        numberOfStories: 3,
        columnSpacing: 5.0,
        structuralSystem: 'Steel Frame',
        foundationType: 'Raft Foundation',
        wallThickness: 0.25,
        confidence: 'medium',
        extractedElements: ['columns', 'beams'],
        recommendations: [],
      };

      analyzeImagesStructured.mockResolvedValue(mockAnalysisResult);

      const formData = createFormDataWithImage({ analysisType: 'floorPlan' });
      const request = createRequest(formData);
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.analysis.buildingLength).toBe(30.0);
    });

    it('should analyze satellite image successfully', async () => {
      const mockAnalysisResult = {
        estimatedLength: 40.0,
        estimatedWidth: 25.0,
        estimatedStories: 5,
        buildingShape: 'rectangular',
        roofType: 'Flat',
        adjacentBuildings: 'multiple',
        confidence: 'high',
        recommendations: [],
      };

      analyzeImagesStructured.mockResolvedValue(mockAnalysisResult);

      const formData = createFormDataWithImage({ analysisType: 'satellite' });
      const request = createRequest(formData);
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.analysis.estimatedLength).toBe(40.0);
    });

    it('should handle multiple images', async () => {
      const mockAnalysisResult = {
        buildingLength: 25.0,
        buildingWidth: 15.0,
        numberOfStories: 4,
        structuralSystem: 'RC Frame',
        constructionPeriod: 'Unknown',
        materialCondition: 'good',
        irregularities: { plan: 'regular', vertical: 'regular', mass: 'regular' },
        riskFactors: {
          softStory: 'not detected',
          heavyOverhang: 'not detected',
          adjacentBuilding: 'none',
          foundation: 'unknown',
        },
        confidence: 'high',
        recommendations: [],
      };

      analyzeImagesStructured.mockResolvedValue(mockAnalysisResult);

      const formData = createFormDataWithImage({ imageCount: 3 });
      const request = createRequest(formData);
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.imagesAnalyzed).toBe(3);
    });

    it('should include additional context in analysis', async () => {
      const mockAnalysisResult = {
        buildingLength: 25.0,
        buildingWidth: 15.0,
        numberOfStories: 4,
        structuralSystem: 'RC Frame',
        constructionPeriod: 'Unknown',
        materialCondition: 'good',
        irregularities: { plan: 'regular', vertical: 'regular', mass: 'regular' },
        riskFactors: {
          softStory: 'not detected',
          heavyOverhang: 'not detected',
          adjacentBuilding: 'none',
          foundation: 'unknown',
        },
        confidence: 'high',
        recommendations: [],
      };

      analyzeImagesStructured.mockResolvedValue(mockAnalysisResult);

      const additionalContext = {
        location: {
          city: 'Istanbul',
          latitude: 41.0082,
          longitude: 28.9784,
        },
        seismic: {
          zone: '1',
          soilType: 'Z2',
        },
      };

      const formData = createFormDataWithImage({ additionalContext });
      const request = createRequest(formData);
      const response = await POST(request);

      expect(response.status).toBe(200);
      expect(analyzeImagesStructured).toHaveBeenCalledWith(
        expect.objectContaining({
          userPrompt: expect.stringContaining('Istanbul'),
        })
      );
    });
  });

  describe('Error Cases - Validation', () => {
    it('should reject request without images', async () => {
      const formData = new FormData();
      formData.append('analysisType', 'building');

      const request = createRequest(formData);
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain('No images');
    });

    it('should reject non-image files', async () => {
      const formData = new FormData();
      const textFile = new File(['hello world'], 'test.txt', {
        type: 'text/plain',
      });
      formData.append('images', textFile);
      formData.append('analysisType', 'building');

      const request = createRequest(formData);
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain('Invalid file type');
    });

    it('should reject oversized images', async () => {
      const formData = new FormData();
      // Create 11MB file (over 10MB limit)
      const largeData = new Uint8Array(11 * 1024 * 1024);
      largeData[0] = 0xFF; // JPEG header
      largeData[1] = 0xD8;
      const largeFile = new File([largeData], 'large.jpg', {
        type: 'image/jpeg',
      });
      formData.append('images', largeFile);
      formData.append('analysisType', 'building');

      const request = createRequest(formData);
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain('too large');
    });
  });

  describe('Error Cases - API Errors', () => {
    it('should handle missing API key', async () => {
      delete process.env.ANTHROPIC_API_KEY;

      const formData = createFormDataWithImage();
      const request = createRequest(formData);
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toContain('API configuration');
    });

    it('should handle AI refusal', async () => {
      analyzeImagesStructured.mockRejectedValue(
        new Error('AI refused to analyze the provided content')
      );

      const formData = createFormDataWithImage();
      const request = createRequest(formData);
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(422);
      expect(data.error).toContain('could not analyze');
    });

    it('should handle rate limiting', async () => {
      analyzeImagesStructured.mockRejectedValue(
        new Error('Rate limit exceeded')
      );

      const formData = createFormDataWithImage();
      const request = createRequest(formData);
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(429);
      expect(data.error).toContain('temporarily unavailable');
    });

    it('should handle truncation errors', async () => {
      analyzeImagesStructured.mockRejectedValue(
        new Error('Response truncated - content too long')
      );

      const formData = createFormDataWithImage();
      const request = createRequest(formData);
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(413);
      expect(data.error).toContain('too complex');
    });
  });

  describe('Response Format', () => {
    it('should return correct response structure', async () => {
      const mockAnalysisResult = {
        buildingLength: 25.0,
        buildingWidth: 15.0,
        numberOfStories: 4,
        structuralSystem: 'RC Frame',
        constructionPeriod: 'Unknown',
        materialCondition: 'good',
        irregularities: { plan: 'regular', vertical: 'regular', mass: 'regular' },
        riskFactors: {
          softStory: 'not detected',
          heavyOverhang: 'not detected',
          adjacentBuilding: 'none',
          foundation: 'unknown',
        },
        confidence: 'high',
        recommendations: [],
      };

      analyzeImagesStructured.mockResolvedValue(mockAnalysisResult);

      const formData = createFormDataWithImage();
      const request = createRequest(formData);
      const response = await POST(request);
      const data = await response.json();

      expect(data).toHaveProperty('success', true);
      expect(data).toHaveProperty('analysis');
      expect(data).toHaveProperty('confidence');
      expect(data).toHaveProperty('imagesAnalyzed');
      expect(data).toHaveProperty('debug');
      expect(data.debug).toHaveProperty('timestamp');
      expect(data.debug).toHaveProperty('processingTime');
      expect(data.debug).toHaveProperty('analysisType');
      expect(data.debug).toHaveProperty('claudeModel');
      expect(data.debug).toHaveProperty('structuredOutputs', true);
    });

    it('should format building analysis correctly', async () => {
      const mockAnalysisResult = {
        buildingLength: 25.0,
        buildingWidth: 15.0,
        buildingHeight: 12.0,
        numberOfStories: 4,
        structuralSystem: 'Reinforced Concrete',
        constructionPeriod: '2000-2010',
        materialCondition: 'good',
        irregularities: { plan: 'regular', vertical: 'regular', mass: 'regular' },
        riskFactors: {
          softStory: 'not detected',
          heavyOverhang: 'detected',
          adjacentBuilding: 'close',
          foundation: 'visible',
        },
        specialFeatures: { balconies: true },
        confidence: 'high',
        recommendations: ['Inspect balconies'],
      };

      analyzeImagesStructured.mockResolvedValue(mockAnalysisResult);

      const formData = createFormDataWithImage({ analysisType: 'building' });
      const request = createRequest(formData);
      const response = await POST(request);
      const data = await response.json();

      expect(data.analysis).toHaveProperty('detectedFeatures');
      expect(data.analysis).toHaveProperty('dimensions');
      expect(data.analysis).toHaveProperty('riskFactors');
      expect(data.analysis).toHaveProperty('recommendations');
    });
  });

  describe('Analysis Type Handling', () => {
    it('should default to building analysis type', async () => {
      const mockResult = {
        buildingLength: 25.0,
        buildingWidth: 15.0,
        numberOfStories: 4,
        structuralSystem: 'RC',
        constructionPeriod: 'Unknown',
        materialCondition: 'good',
        irregularities: { plan: 'regular', vertical: 'regular', mass: 'regular' },
        riskFactors: {
          softStory: 'not detected',
          heavyOverhang: 'not detected',
          adjacentBuilding: 'none',
          foundation: 'unknown',
        },
        confidence: 'medium',
        recommendations: [],
      };

      analyzeImagesStructured.mockResolvedValue(mockResult);

      const formData = new FormData();
      const jpegHeader = new Uint8Array([0xFF, 0xD8, 0xFF, 0xE0]);
      const file = new File([jpegHeader], 'test.jpg', { type: 'image/jpeg' });
      formData.append('images', file);
      // No analysisType specified

      const request = createRequest(formData);
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.debug.analysisType).toBe('building');
    });

    it('should handle architecturalPlan analysis type', async () => {
      const mockResult = {
        buildingLength: 30.0,
        buildingWidth: 20.0,
        numberOfStories: 3,
        structuralSystem: 'Steel',
        foundationType: 'Raft',
        confidence: 'high',
        recommendations: [],
      };

      analyzeImagesStructured.mockResolvedValue(mockResult);

      const formData = createFormDataWithImage({ analysisType: 'architecturalPlan' });
      const request = createRequest(formData);
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.debug.analysisType).toBe('architecturalPlan');
    });
  });
});
