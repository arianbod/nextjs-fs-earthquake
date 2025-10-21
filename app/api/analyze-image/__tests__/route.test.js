import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST } from '../route';
import { NextResponse } from 'next/server';

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
  });

  it('should successfully analyze image with valid payload', async () => {
    const mockRequest = {
      json: vi.fn().mockResolvedValue({
        imageData: 'base64encodedimage',
        analysisType: 'structural',
      }),
    };

    const response = await POST(mockRequest);
    const data = await response.json();

    expect(mockRequest.json).toHaveBeenCalledTimes(1);
    expect(NextResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({
        analysis: expect.any(Object),
      })
    );
    expect(data.analysis).toBeDefined();
    expect(data.analysis.type).toBe('demo');
  });

  it('should format analysis result correctly', async () => {
    const mockPayload = {
      imageData: 'testimage',
      metadata: { filename: 'building.jpg' },
    };

    const mockRequest = {
      json: vi.fn().mockResolvedValue(mockPayload),
    };

    const response = await POST(mockRequest);
    const data = await response.json();

    expect(data.analysis.type).toBe('demo');
    expect(data.analysis.raw).toEqual(mockPayload);
  });

  it('should handle empty payload', async () => {
    const mockRequest = {
      json: vi.fn().mockResolvedValue({}),
    };

    const response = await POST(mockRequest);
    const data = await response.json();

    expect(data.analysis).toBeDefined();
    expect(data.analysis.type).toBe('demo');
    expect(data.analysis.raw).toEqual({});
  });

  it('should return 500 on JSON parsing error', async () => {
    const mockRequest = {
      json: vi.fn().mockRejectedValue(new Error('Invalid JSON')),
    };

    const response = await POST(mockRequest);
    const data = await response.json();

    expect(NextResponse.json).toHaveBeenCalledWith(
      { error: 'Image analysis failed' },
      { status: 500 }
    );
    expect(data.error).toBe('Image analysis failed');
    expect(response.status).toBe(500);
  });

  it('should handle malformed request', async () => {
    const mockRequest = {
      json: vi.fn().mockRejectedValue(new SyntaxError('Unexpected token')),
    };

    const response = await POST(mockRequest);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toBe('Image analysis failed');
  });

  it('should handle network errors gracefully', async () => {
    const mockRequest = {
      json: vi.fn().mockRejectedValue(new Error('Network error')),
    };

    const response = await POST(mockRequest);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data).toHaveProperty('error');
  });

  it('should process different payload structures', async () => {
    const payloads = [
      { image: 'data1', type: 'crack' },
      { image: 'data2', analysis: 'full' },
      { imageUrl: 'http://example.com/image.jpg' },
    ];

    for (const payload of payloads) {
      const mockRequest = {
        json: vi.fn().mockResolvedValue(payload),
      };

      const response = await POST(mockRequest);
      const data = await response.json();

      expect(data.analysis.raw).toEqual(payload);
      expect(data.analysis.type).toBe('demo');
    }
  });

  it('should handle large payloads', async () => {
    const largePayload = {
      imageData: 'x'.repeat(10000),
      metadata: {
        size: 10000,
        format: 'base64',
      },
    };

    const mockRequest = {
      json: vi.fn().mockResolvedValue(largePayload),
    };

    const response = await POST(mockRequest);
    const data = await response.json();

    expect(data.analysis).toBeDefined();
    expect(data.analysis.raw.imageData).toHaveLength(10000);
  });
});
