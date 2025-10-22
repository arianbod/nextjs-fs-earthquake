import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST, GET } from '../route';
import { NextResponse } from 'next/server';

// Mock the image analysis helper
const mockAnalyzeBuildingImage = vi.fn();
vi.mock('@/utils/imageAnalysisHelper', () => ({
  analyzeBuildingImage: (...args) => mockAnalyzeBuildingImage(...args),
  validateImageData: vi.fn((imageData) => {
    if (!imageData) return { valid: false, errors: ['No image data'] };
    if (imageData === 'invalid') return { valid: false, errors: ['Invalid format'] };
    if (imageData.startsWith('data:image/')) return { valid: true, isBase64: true, isURL: false };
    if (imageData.startsWith('http')) return { valid: true, isURL: true, isBase64: false };
    return { valid: false, errors: ['Must be URL or base64'] };
  }),
  formatAnalysisResult: vi.fn((result) => {
    if (!result.success) {
      return {
        success: false,
        error: result.error || 'Analysis failed',
        errorCode: result.errorCode,
        metadata: result.metadata,
      };
    }
    return {
      success: true,
      data: {
        analysis: result.analysis,
        confidence: result.confidence,
        issues: result.issues,
        recommendations: result.recommendations,
      },
      metadata: result.metadata,
    };
  }),
  createFallbackResponse: vi.fn((reason) => ({
    success: false,
    error: reason,
    data: {
      analysis: { structural_type: 'unknown' },
      confidence: 0,
      issues: ['Analysis failed'],
      recommendations: ['Please try uploading a clearer image'],
    },
  })),
}));

// Mock NextResponse
vi.mock('next/server', () => ({
  NextResponse: {
    json: vi.fn((data, options) => ({
      json: async () => data,
      status: options?.status || 200,
      ok: !options?.status || options.status < 400,
    })),
  },
}));

describe('/api/analyze-image POST endpoint', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.OPENAI_API_KEY = 'test-key';
  });

  it('should successfully analyze image with base64 data', async () => {
    mockAnalyzeBuildingImage.mockResolvedValue({
      success: true,
      analysis: { structural_type: 'concrete', condition: 'good' },
      confidence: 0.85,
      issues: ['minor cracks'],
      recommendations: ['monitor cracks'],
      metadata: { tokensUsed: 100 },
    });

    const mockRequest = {
      json: vi.fn().mockResolvedValue({
        imageData: 'data:image/jpeg;base64,/9j/4AAQSkZJRg...',
      }),
    };

    const response = await POST(mockRequest);
    const data = await response.json();

    expect(mockAnalyzeBuildingImage).toHaveBeenCalledWith(
      'data:image/jpeg;base64,/9j/4AAQSkZJRg...',
      expect.objectContaining({
        model: 'gpt-4o-mini',
        maxTokens: 1000,
        retryAttempts: 2,
      })
    );
    expect(data.success).toBe(true);
    expect(data.data.analysis.structural_type).toBe('concrete');
    expect(data.data.confidence).toBe(0.85);
  });

  it('should successfully analyze image with URL', async () => {
    mockAnalyzeBuildingImage.mockResolvedValue({
      success: true,
      analysis: { structural_type: 'masonry' },
      confidence: 0.9,
      issues: [],
      recommendations: [],
      metadata: {},
    });

    const mockRequest = {
      json: vi.fn().mockResolvedValue({
        imageUrl: 'https://example.com/building.jpg',
      }),
    };

    const response = await POST(mockRequest);
    const data = await response.json();

    expect(mockAnalyzeBuildingImage).toHaveBeenCalled();
    expect(data.success).toBe(true);
  });

  it('should return 400 for missing image data', async () => {
    const mockRequest = {
      json: vi.fn().mockResolvedValue({}),
    };

    const response = await POST(mockRequest);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
    expect(data.error).toContain('No image data provided');
  });

  it('should return 400 for invalid JSON in request', async () => {
    const mockRequest = {
      json: vi.fn().mockRejectedValue(new SyntaxError('Unexpected token')),
    };

    const response = await POST(mockRequest);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
    expect(data.error).toBe('Invalid JSON in request body');
  });

  it('should return 400 for invalid image data format', async () => {
    const mockRequest = {
      json: vi.fn().mockResolvedValue({
        imageData: 'invalid',
      }),
    };

    const response = await POST(mockRequest);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
    expect(data.error).toBe('Invalid image data');
  });

  it('should return 500 when OpenAI API key is missing', async () => {
    delete process.env.OPENAI_API_KEY;

    const mockRequest = {
      json: vi.fn().mockResolvedValue({
        imageData: 'data:image/jpeg;base64,test',
      }),
    };

    const response = await POST(mockRequest);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.success).toBe(false);
    expect(data.error).toContain('OpenAI API key');
  });

  it('should handle analysis failures', async () => {
    mockAnalyzeBuildingImage.mockResolvedValue({
      success: false,
      error: 'OpenAI API error',
      errorCode: 'RATE_LIMIT',
      metadata: { attempts: 3 },
    });

    const mockRequest = {
      json: vi.fn().mockResolvedValue({
        imageData: 'data:image/jpeg;base64,test',
      }),
    };

    const response = await POST(mockRequest);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.success).toBe(false);
    expect(data.error).toBe('OpenAI API error');
  });

  it('should pass custom options to analysis function', async () => {
    mockAnalyzeBuildingImage.mockResolvedValue({
      success: true,
      analysis: {},
      confidence: 0.8,
      issues: [],
      recommendations: [],
      metadata: {},
    });

    const mockRequest = {
      json: vi.fn().mockResolvedValue({
        imageUrl: 'https://example.com/image.jpg',
        options: {
          model: 'gpt-4o',
          maxTokens: 2000,
          temperature: 0.5,
        },
      }),
    };

    await POST(mockRequest);

    expect(mockAnalyzeBuildingImage).toHaveBeenCalledWith(
      'https://example.com/image.jpg',
      expect.objectContaining({
        model: 'gpt-4o',
        maxTokens: 2000,
        temperature: 0.5,
        retryAttempts: 2,
      })
    );
  });
});

describe('/api/analyze-image GET endpoint', () => {
  it('should return API documentation', async () => {
    const response = await GET();
    const data = await response.json();

    expect(data.endpoint).toBe('/api/analyze-image');
    expect(data.method).toBe('POST');
    expect(data.description).toContain('earthquake safety');
    expect(data.requestFormat).toBeDefined();
    expect(data.responseFormat).toBeDefined();
  });
});
