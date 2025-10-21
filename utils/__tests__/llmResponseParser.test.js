import { describe, it, expect } from 'vitest';
import {
  extractJSON,
  safeJSONParse,
  fixCommonJSONIssues,
  validateJSONStructure,
  parseLLMResponse,
  getImageAnalysisSchema,
  sanitizeLLMResponse,
  extractConfidence,
  retryParse,
} from '../llmResponseParser';

describe('llmResponseParser', () => {
  describe('extractJSON', () => {
    it('should extract JSON from markdown code blocks with json tag', () => {
      const input = '```json\n{"key": "value"}\n```';
      const result = extractJSON(input);
      expect(result).toBe('{"key": "value"}');
    });

    it('should extract JSON from markdown code blocks without language tag', () => {
      const input = '```\n{"key": "value"}\n```';
      const result = extractJSON(input);
      expect(result).toBe('{"key": "value"}');
    });

    it('should extract JSON from backticks', () => {
      const input = 'Here is the data: `{"key": "value"}`';
      const result = extractJSON(input);
      expect(result).toBe('{"key": "value"}');
    });

    it('should extract JSON object from mixed text', () => {
      const input = 'Some text before {"key": "value"} and after';
      const result = extractJSON(input);
      expect(result).toBe('{"key": "value"}');
    });

    it('should extract JSON array from text', () => {
      const input = 'Here is an array: [1, 2, 3]';
      const result = extractJSON(input);
      expect(result).toBe('[1, 2, 3]');
    });

    it('should handle nested JSON in markdown', () => {
      const input = '```json\n{"outer": {"inner": "value"}}\n```';
      const result = extractJSON(input);
      expect(result).toBe('{"outer": {"inner": "value"}}');
    });

    it('should return original text if no JSON patterns found', () => {
      const input = 'Plain text with no JSON';
      const result = extractJSON(input);
      expect(result).toBe('Plain text with no JSON');
    });

    it('should throw error for null input', () => {
      expect(() => extractJSON(null)).toThrow('Invalid input');
    });

    it('should throw error for non-string input', () => {
      expect(() => extractJSON(123)).toThrow('Invalid input');
    });

    it('should handle whitespace correctly', () => {
      const input = '  \n  ```json\n{"key": "value"}\n```  \n  ';
      const result = extractJSON(input);
      expect(result).toBe('{"key": "value"}');
    });
  });

  describe('safeJSONParse', () => {
    it('should parse valid JSON', () => {
      const result = safeJSONParse('{"key": "value"}');
      expect(result).toEqual({ key: 'value' });
    });

    it('should parse JSON from markdown', () => {
      const result = safeJSONParse('```json\n{"key": "value"}\n```');
      expect(result).toEqual({ key: 'value' });
    });

    it('should return fallback for invalid JSON', () => {
      const result = safeJSONParse('invalid json', { fallback: { error: true } });
      expect(result).toEqual({ error: true });
    });

    it('should throw error when throwOnError is true', () => {
      expect(() => safeJSONParse('invalid', { throwOnError: true })).toThrow();
    });

    it('should return null fallback by default', () => {
      const result = safeJSONParse('invalid json');
      expect(result).toBeNull();
    });

    it('should parse arrays', () => {
      const result = safeJSONParse('[1, 2, 3]');
      expect(result).toEqual([1, 2, 3]);
    });

    it('should handle empty string', () => {
      const result = safeJSONParse('', { fallback: 'empty' });
      expect(result).toBe('empty');
    });

    it('should parse complex nested JSON', () => {
      const complex = '{"a": {"b": {"c": [1, 2, {"d": "e"}]}}}';
      const result = safeJSONParse(complex);
      expect(result).toEqual({ a: { b: { c: [1, 2, { d: 'e' }] } } });
    });
  });

  describe('fixCommonJSONIssues', () => {
    it('should remove trailing commas', () => {
      const input = '{"key": "value",}';
      const fixed = fixCommonJSONIssues(input);
      const parsed = JSON.parse(fixed);
      expect(parsed).toEqual({ key: 'value' });
    });

    it('should fix single quotes to double quotes', () => {
      const input = "{'key': 'value'}";
      const fixed = fixCommonJSONIssues(input);
      const parsed = JSON.parse(fixed);
      expect(parsed).toEqual({ key: 'value' });
    });

    it('should remove single-line comments', () => {
      const input = '{\n  "key": "value" // comment\n}';
      const fixed = fixCommonJSONIssues(input);
      const parsed = JSON.parse(fixed);
      expect(parsed).toEqual({ key: 'value' });
    });

    it('should remove multi-line comments', () => {
      const input = '{"key": /* comment */ "value"}';
      const fixed = fixCommonJSONIssues(input);
      const parsed = JSON.parse(fixed);
      expect(parsed).toEqual({ key: 'value' });
    });

    it('should fix unquoted keys', () => {
      const input = '{key: "value"}';
      const fixed = fixCommonJSONIssues(input);
      const parsed = JSON.parse(fixed);
      expect(parsed).toEqual({ key: 'value' });
    });

    it('should handle multiple issues at once', () => {
      // Simpler case: markdown + trailing comma
      const input = '```json\n{"key": "value",}\n```';
      const result = safeJSONParse(input);
      expect(result).toEqual({ key: 'value' });
    });

    it('should handle arrays with trailing commas', () => {
      const input = '[1, 2, 3,]';
      const fixed = fixCommonJSONIssues(input);
      const parsed = JSON.parse(fixed);
      expect(parsed).toEqual([1, 2, 3]);
    });
  });

  describe('validateJSONStructure', () => {
    it('should validate required fields', () => {
      const data = { name: 'test', age: 25 };
      const schema = { required: ['name', 'age'] };
      const result = validateJSONStructure(data, schema);

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should detect missing required fields', () => {
      const data = { name: 'test' };
      const schema = { required: ['name', 'age'] };
      const result = validateJSONStructure(data, schema);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Missing required field: age');
    });

    it('should validate field types', () => {
      const data = { name: 'test', age: 25, tags: ['a', 'b'] };
      const schema = {
        properties: {
          name: 'string',
          age: 'number',
          tags: 'array',
        },
      };
      const result = validateJSONStructure(data, schema);

      expect(result.valid).toBe(true);
    });

    it('should detect incorrect field types', () => {
      const data = { name: 123, age: '25' };
      const schema = {
        properties: {
          name: 'string',
          age: 'number',
        },
      };
      const result = validateJSONStructure(data, schema);

      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('should handle non-object data', () => {
      const result = validateJSONStructure('not an object', {});

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Data must be an object');
    });

    it('should handle null data', () => {
      const result = validateJSONStructure(null, {});

      expect(result.valid).toBe(false);
    });

    it('should pass validation with empty schema', () => {
      const data = { anything: 'goes' };
      const result = validateJSONStructure(data, {});

      expect(result.valid).toBe(true);
    });
  });

  describe('parseLLMResponse', () => {
    it('should parse valid JSON response', () => {
      const response = '{"analysis": {"result": "good"}}';
      const result = parseLLMResponse(response);

      expect(result.success).toBe(true);
      expect(result.data).toEqual({ analysis: { result: 'good' } });
      expect(result.errors).toHaveLength(0);
    });

    it('should parse markdown-wrapped response', () => {
      const response = '```json\n{"analysis": {"result": "good"}}\n```';
      const result = parseLLMResponse(response);

      expect(result.success).toBe(true);
      expect(result.data).toEqual({ analysis: { result: 'good' } });
    });

    it('should validate against schema', () => {
      const response = '{"analysis": {"result": "good"}}';
      const schema = { required: ['analysis'] };
      const result = parseLLMResponse(response, { expectedSchema: schema });

      expect(result.success).toBe(true);
    });

    it('should fail validation for missing required fields', () => {
      const response = '{"notAnalysis": "data"}';
      const schema = { required: ['analysis'] };
      const result = parseLLMResponse(response, { expectedSchema: schema });

      expect(result.success).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('should handle parsing errors', () => {
      const response = 'completely invalid {{{ json';
      const result = parseLLMResponse(response);

      expect(result.success).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.rawResponse).toBe(response);
    });

    it('should include raw response in result', () => {
      const response = '{"test": "data"}';
      const result = parseLLMResponse(response);

      expect(result.rawResponse).toBe(response);
    });

    it('should call onError callback on failure', () => {
      let errorCalled = false;
      const response = 'invalid json';
      const onError = () => { errorCalled = true; };

      parseLLMResponse(response, { onError });

      expect(errorCalled).toBe(true);
    });
  });

  describe('getImageAnalysisSchema', () => {
    it('should return valid schema for image analysis', () => {
      const schema = getImageAnalysisSchema();

      expect(schema).toHaveProperty('required');
      expect(schema).toHaveProperty('properties');
      expect(schema.required).toContain('analysis');
    });

    it('should validate image analysis response', () => {
      const schema = getImageAnalysisSchema();
      const validData = {
        analysis: { result: 'safe' },
        confidence: 0.95,
        issues: ['crack'],
        recommendations: ['repair'],
      };

      const result = validateJSONStructure(validData, schema);
      expect(result.valid).toBe(true);
    });
  });

  describe('sanitizeLLMResponse', () => {
    it('should remove script tags', () => {
      const input = '<script>alert("xss")</script>{"key": "value"}';
      const sanitized = sanitizeLLMResponse(input);

      expect(sanitized).not.toContain('<script>');
      expect(sanitized).toContain('{"key": "value"}');
    });

    it('should remove HTML tags', () => {
      const input = '<div>{"key": "value"}</div>';
      const sanitized = sanitizeLLMResponse(input);

      expect(sanitized).not.toContain('<div>');
      expect(sanitized).toBe('{"key": "value"}');
    });

    it('should remove null bytes', () => {
      const input = 'text\0with\0nulls';
      const sanitized = sanitizeLLMResponse(input);

      expect(sanitized).toBe('textwithnulls');
    });

    it('should normalize line endings', () => {
      const input = 'line1\r\nline2\rline3';
      const sanitized = sanitizeLLMResponse(input);

      expect(sanitized).toBe('line1\nline2\nline3');
    });

    it('should handle empty input', () => {
      expect(sanitizeLLMResponse('')).toBe('');
      expect(sanitizeLLMResponse(null)).toBe('');
    });

    it('should preserve JSON structure', () => {
      const input = '  \n  {"key": "value"}  \n  ';
      const sanitized = sanitizeLLMResponse(input);

      expect(sanitized).toBe('{"key": "value"}');
    });
  });

  describe('extractConfidence', () => {
    it('should extract confidence from number (0-1)', () => {
      expect(extractConfidence(0.85)).toBe(0.85);
      expect(extractConfidence(0.5)).toBe(0.5);
      expect(extractConfidence(1.0)).toBe(1.0);
    });

    it('should convert percentage to decimal', () => {
      expect(extractConfidence(85)).toBeCloseTo(0.85);
      expect(extractConfidence(100)).toBe(1.0);
      expect(extractConfidence(50)).toBe(0.5);
    });

    it('should extract from object with confidence field', () => {
      const response = { confidence: 0.9 };
      expect(extractConfidence(response)).toBe(0.9);
    });

    it('should extract from object with percentage confidence', () => {
      const response = { confidence: 90 };
      expect(extractConfidence(response)).toBeCloseTo(0.9);
    });

    it('should try alternative field names', () => {
      expect(extractConfidence({ certainty: 0.8 })).toBe(0.8);
      expect(extractConfidence({ probability: 0.7 })).toBe(0.7);
      expect(extractConfidence({ score: 0.6 })).toBe(0.6);
    });

    it('should return default 0.5 if no confidence found', () => {
      expect(extractConfidence({})).toBe(0.5);
      expect(extractConfidence({ other: 'field' })).toBe(0.5);
    });

    it('should clamp values to 0-1 range', () => {
      expect(extractConfidence(-0.5)).toBe(0);
      expect(extractConfidence(1.5)).toBe(1);
    });
  });

  describe('retryParse', () => {
    it('should parse valid JSON on first attempt', async () => {
      const result = await retryParse('{"key": "value"}');
      expect(result).toEqual({ key: 'value' });
    });

    it('should retry with different strategies', async () => {
      const markdownJSON = '```json\n{"key": "value"}\n```';
      const result = await retryParse(markdownJSON);
      expect(result).toEqual({ key: 'value' });
    });

    it('should handle malformed JSON with fixes', async () => {
      const malformed = '{key: "value",}';
      const result = await retryParse(malformed);
      expect(result).toEqual({ key: 'value' });
    });

    it('should throw on completely invalid JSON', async () => {
      await expect(retryParse('completely invalid {{{')).rejects.toThrow();
    });

    it('should respect maxAttempts parameter', async () => {
      const invalid = 'invalid';
      await expect(retryParse(invalid, 1)).rejects.toThrow();
    });
  });

  describe('Real-world LLM Response Scenarios', () => {
    it('should handle OpenAI Vision API response format', () => {
      const response = `
Here is the analysis:
\`\`\`json
{
  "analysis": {
    "structural_issues": ["cracks in foundation", "water damage"],
    "severity": "moderate"
  },
  "confidence": 0.87,
  "issues": ["crack", "water damage"],
  "recommendations": ["inspect foundation", "repair water damage"]
}
\`\`\`
      `;

      const result = parseLLMResponse(response, {
        expectedSchema: getImageAnalysisSchema(),
      });

      expect(result.success).toBe(true);
      expect(result.data.analysis).toBeDefined();
      expect(result.data.confidence).toBe(0.87);
    });

    it('should handle response with extra text', () => {
      const response = `
Based on the image provided, I can see several issues:

{"analysis": {"result": "issues found"}, "confidence": 0.9, "issues": ["crack"], "recommendations": ["repair"]}

Let me know if you need more details.
      `;

      const result = parseLLMResponse(response, {
        expectedSchema: getImageAnalysisSchema(),
      });

      expect(result.success).toBe(true);
    });

    it('should handle response with trailing commas (common LLM issue)', () => {
      const response = `{
        "analysis": {"result": "good",},
        "confidence": 0.95,
        "issues": [],
        "recommendations": [],
      }`;

      const result = parseLLMResponse(response);
      expect(result.success).toBe(true);
    });

    it('should handle response with comments (sometimes LLMs add them)', () => {
      const response = `{
        "analysis": {"result": "good"}, // Building looks safe
        "confidence": 0.95,
        "issues": [], /* No issues found */
        "recommendations": []
      }`;

      const result = parseLLMResponse(response);
      expect(result.success).toBe(true);
    });
  });
});
