/**
 * Tests for Claude Structured Outputs Helper
 * Tests helper functions and constants
 */

import { describe, it, expect } from 'vitest';
import { z } from 'zod';
import {
  createImageContent,
  STRUCTURED_OUTPUTS_BETA,
  DEFAULT_MODEL,
} from '@/lib/ai/structuredOutputs';

describe('[AI] Structured Outputs Helper', () => {
  describe('Constants', () => {
    it('should export correct beta identifier', () => {
      expect(STRUCTURED_OUTPUTS_BETA).toBe('structured-outputs-2025-11-13');
    });

    it('should export correct default model', () => {
      expect(DEFAULT_MODEL).toBe('claude-sonnet-4-5-20250929');
    });
  });

  describe('createImageContent', () => {
    it('should create correct image content object for JPEG', () => {
      const base64Data = 'aGVsbG8gd29ybGQ=';
      const mediaType = 'image/jpeg';

      const result = createImageContent(base64Data, mediaType);

      expect(result).toEqual({
        type: 'image',
        source: {
          type: 'base64',
          media_type: 'image/jpeg',
          data: 'aGVsbG8gd29ybGQ=',
        },
      });
    });

    it('should create correct image content object for PNG', () => {
      const base64Data = 'iVBORw0KGgo=';
      const mediaType = 'image/png';

      const result = createImageContent(base64Data, mediaType);

      expect(result).toEqual({
        type: 'image',
        source: {
          type: 'base64',
          media_type: 'image/png',
          data: 'iVBORw0KGgo=',
        },
      });
    });

    it('should create correct image content object for WebP', () => {
      const base64Data = 'UklGRiQAAABXRUJQ';
      const mediaType = 'image/webp';

      const result = createImageContent(base64Data, mediaType);

      expect(result.source.media_type).toBe('image/webp');
    });

    it('should handle empty base64 data', () => {
      const result = createImageContent('', 'image/jpeg');

      expect(result.source.data).toBe('');
      expect(result.type).toBe('image');
    });

    it('should handle long base64 data', () => {
      const longData = 'a'.repeat(10000);
      const result = createImageContent(longData, 'image/jpeg');

      expect(result.source.data).toBe(longData);
      expect(result.source.data.length).toBe(10000);
    });

    it('should preserve exact data without modification', () => {
      const testData = 'ABC123+/=';
      const result = createImageContent(testData, 'image/png');

      expect(result.source.data).toBe('ABC123+/=');
    });
  });

  describe('Image Content Structure', () => {
    it('should have correct structure for API', () => {
      const content = createImageContent('test', 'image/jpeg');

      // Verify all required fields exist
      expect(content).toHaveProperty('type');
      expect(content).toHaveProperty('source');
      expect(content.source).toHaveProperty('type');
      expect(content.source).toHaveProperty('media_type');
      expect(content.source).toHaveProperty('data');
    });

    it('should have correct source type', () => {
      const content = createImageContent('test', 'image/jpeg');

      expect(content.source.type).toBe('base64');
    });

    it('should create valid content for multiple images', () => {
      const images = [
        createImageContent('image1', 'image/jpeg'),
        createImageContent('image2', 'image/png'),
        createImageContent('image3', 'image/webp'),
      ];

      expect(images).toHaveLength(3);
      images.forEach(img => {
        expect(img.type).toBe('image');
        expect(img.source.type).toBe('base64');
      });
    });
  });

  describe('Zod Schema Compatibility', () => {
    it('should work with simple Zod schemas', () => {
      const simpleSchema = z.object({
        name: z.string(),
        value: z.number(),
      });

      // Verify schema can be used
      const result = simpleSchema.parse({ name: 'test', value: 42 });
      expect(result.name).toBe('test');
      expect(result.value).toBe(42);
    });

    it('should work with nullable fields', () => {
      const nullableSchema = z.object({
        required: z.string(),
        optional: z.string().nullable(),
      });

      const result1 = nullableSchema.parse({ required: 'yes', optional: null });
      expect(result1.optional).toBeNull();

      const result2 = nullableSchema.parse({ required: 'yes', optional: 'value' });
      expect(result2.optional).toBe('value');
    });

    it('should work with arrays', () => {
      const arraySchema = z.object({
        items: z.array(z.string()),
        numbers: z.array(z.number()),
      });

      const result = arraySchema.parse({
        items: ['a', 'b', 'c'],
        numbers: [1, 2, 3],
      });

      expect(result.items).toEqual(['a', 'b', 'c']);
      expect(result.numbers).toEqual([1, 2, 3]);
    });

    it('should work with nested objects', () => {
      const nestedSchema = z.object({
        parent: z.object({
          child: z.object({
            value: z.string(),
          }),
        }),
      });

      const result = nestedSchema.parse({
        parent: { child: { value: 'nested' } },
      });

      expect(result.parent.child.value).toBe('nested');
    });

    it('should work with enums', () => {
      const enumSchema = z.object({
        status: z.enum(['active', 'inactive', 'pending']),
        priority: z.enum(['low', 'medium', 'high']),
      });

      const result = enumSchema.parse({ status: 'active', priority: 'high' });
      expect(result.status).toBe('active');
      expect(result.priority).toBe('high');
    });

    it('should reject invalid enum values', () => {
      const enumSchema = z.object({
        status: z.enum(['active', 'inactive']),
      });

      expect(() => enumSchema.parse({ status: 'invalid' })).toThrow();
    });

    it('should handle optional fields', () => {
      const optionalSchema = z.object({
        required: z.string(),
        optional: z.string().optional(),
      });

      const result1 = optionalSchema.parse({ required: 'yes' });
      expect(result1.optional).toBeUndefined();

      const result2 = optionalSchema.parse({ required: 'yes', optional: 'value' });
      expect(result2.optional).toBe('value');
    });

    it('should handle describe() for documentation', () => {
      const describedSchema = z.object({
        name: z.string().describe('The name field'),
        age: z.number().int().describe('Age in years'),
      });

      // Schema should still work with describe
      const result = describedSchema.parse({ name: 'Test', age: 25 });
      expect(result.name).toBe('Test');
      expect(result.age).toBe(25);
    });
  });

  describe('Message Building', () => {
    it('should be able to build user message with images', () => {
      const userPrompt = 'Analyze this building';
      const images = [
        createImageContent('img1', 'image/jpeg'),
        createImageContent('img2', 'image/png'),
      ];

      const content = [
        { type: 'text', text: userPrompt },
        ...images,
      ];

      expect(content).toHaveLength(3);
      expect(content[0].type).toBe('text');
      expect(content[0].text).toBe('Analyze this building');
      expect(content[1].type).toBe('image');
      expect(content[2].type).toBe('image');
    });

    it('should handle single image', () => {
      const userPrompt = 'What do you see?';
      const images = [createImageContent('data', 'image/jpeg')];

      const content = [
        { type: 'text', text: userPrompt },
        ...images,
      ];

      expect(content).toHaveLength(2);
    });

    it('should handle multiple images', () => {
      const images = Array.from({ length: 5 }, (_, i) =>
        createImageContent(`image${i}`, 'image/jpeg')
      );

      const content = [
        { type: 'text', text: 'Analyze all images' },
        ...images,
      ];

      expect(content).toHaveLength(6);
    });
  });

  describe('Beta Header', () => {
    it('should have correct format for API header', () => {
      expect(STRUCTURED_OUTPUTS_BETA).toMatch(/^structured-outputs-\d{4}-\d{2}-\d{2}$/);
    });

    it('should be a string', () => {
      expect(typeof STRUCTURED_OUTPUTS_BETA).toBe('string');
    });
  });

  describe('Model Configuration', () => {
    it('should use claude-sonnet model', () => {
      expect(DEFAULT_MODEL).toContain('claude-sonnet');
    });

    it('should be a valid model ID format', () => {
      expect(DEFAULT_MODEL).toMatch(/^claude-[\w-]+-\d{8}$/);
    });
  });
});
