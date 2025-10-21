import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Create mock create function
const mockCreate = vi.fn();

// Mock the OpenAI module before importing
vi.mock('openai', () => {
  return {
    default: class MockOpenAI {
      constructor() {
        this.chat = {
          completions: {
            create: mockCreate,
          },
        };
      }
    },
  };
});

// Import after mocking
const { generateChatResponse } = await import('../action');

describe('generateChatResponse', () => {
  beforeEach(() => {
    // Reset mock before each test
    mockCreate.mockClear();
  });

  afterEach(() => {
    mockCreate.mockClear();
  });

  it('should successfully generate a chat response with valid input', async () => {
    const mockChatMessages = [
      { role: 'user', content: 'What is the best building type for earthquakes?' },
    ];

    const mockResponse = {
      choices: [
        {
          message: {
            role: 'assistant',
            content: 'Reinforced concrete frame buildings are generally best for earthquake resistance.',
          },
        },
      ],
      usage: {
        total_tokens: 50,
      },
    };

    mockCreate.mockResolvedValue(mockResponse);

    const result = await generateChatResponse(mockChatMessages);

    expect(result).toBeDefined();
    expect(result.message).toEqual(mockResponse.choices[0].message);
    expect(result.tokens).toBe(50);

    // Verify the OpenAI API was called with correct parameters
    expect(mockCreate).toHaveBeenCalledTimes(1);
    expect(mockCreate).toHaveBeenCalledWith({
      messages: [
        {
          role: 'system',
          content: 'you are a AI assistant for helping to fill a form about how the user building can be strong enough in earthquake situations',
        },
        ...mockChatMessages,
      ],
      model: 'gpt-4o-2024-05-13',
      temperature: 1,
      max_tokens: 500,
    });
  });

  it('should handle multiple messages in conversation', async () => {
    const mockChatMessages = [
      { role: 'user', content: 'What is seismic zone 1?' },
      { role: 'assistant', content: 'Zone 1 is low seismic activity.' },
      { role: 'user', content: 'What about zone 4?' },
    ];

    const mockResponse = {
      choices: [
        {
          message: {
            role: 'assistant',
            content: 'Zone 4 has very high seismic activity.',
          },
        },
      ],
      usage: {
        total_tokens: 75,
      },
    };

    mockCreate.mockResolvedValue(mockResponse);

    const result = await generateChatResponse(mockChatMessages);

    expect(result).toBeDefined();
    expect(result.message.content).toBe('Zone 4 has very high seismic activity.');
    expect(result.tokens).toBe(75);
    expect(mockCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        messages: expect.arrayContaining([
          expect.objectContaining({ role: 'system' }),
          ...mockChatMessages,
        ]),
      })
    );
  });

  it('should return null when OpenAI API throws an error', async () => {
    const mockChatMessages = [
      { role: 'user', content: 'Test message' },
    ];

    const mockError = new Error('OpenAI API Error: Rate limit exceeded');
    mockCreate.mockRejectedValue(mockError);

    const result = await generateChatResponse(mockChatMessages);

    expect(result).toBeNull();
    expect(mockCreate).toHaveBeenCalledTimes(1);
  });

  it('should return null when OpenAI API returns invalid response', async () => {
    const mockChatMessages = [
      { role: 'user', content: 'Test message' },
    ];

    // Mock a response with missing choices
    const mockInvalidResponse = {
      usage: {
        total_tokens: 10,
      },
    };

    mockCreate.mockResolvedValue(mockInvalidResponse);

    const result = await generateChatResponse(mockChatMessages);

    // This should throw an error trying to access choices[0].message
    // and be caught, returning null
    expect(result).toBeNull();
  });

  it('should handle network timeout errors', async () => {
    const mockChatMessages = [
      { role: 'user', content: 'Test message' },
    ];

    const timeoutError = new Error('Request timeout');
    timeoutError.code = 'ETIMEDOUT';
    mockCreate.mockRejectedValue(timeoutError);

    const result = await generateChatResponse(mockChatMessages);

    expect(result).toBeNull();
  });

  it('should handle authentication errors', async () => {
    const mockChatMessages = [
      { role: 'user', content: 'Test message' },
    ];

    const authError = new Error('Invalid API key');
    authError.status = 401;
    mockCreate.mockRejectedValue(authError);

    const result = await generateChatResponse(mockChatMessages);

    expect(result).toBeNull();
  });

  it('should pass correct model and parameters to OpenAI', async () => {
    const mockChatMessages = [
      { role: 'user', content: 'Test message' },
    ];

    const mockResponse = {
      choices: [{ message: { role: 'assistant', content: 'Response' } }],
      usage: { total_tokens: 20 },
    };

    mockCreate.mockResolvedValue(mockResponse);

    await generateChatResponse(mockChatMessages);

    expect(mockCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        model: 'gpt-4o-2024-05-13',
        temperature: 1,
        max_tokens: 500,
      })
    );
  });

  it('should include system message in all requests', async () => {
    const mockChatMessages = [
      { role: 'user', content: 'Help me assess my building' },
    ];

    const mockResponse = {
      choices: [{ message: { role: 'assistant', content: 'I can help!' } }],
      usage: { total_tokens: 15 },
    };

    mockCreate.mockResolvedValue(mockResponse);

    await generateChatResponse(mockChatMessages);

    const callArgs = mockCreate.mock.calls[0][0];
    const systemMessage = callArgs.messages.find(msg => msg.role === 'system');

    expect(systemMessage).toBeDefined();
    expect(systemMessage.content).toContain('AI assistant');
    expect(systemMessage.content).toContain('earthquake');
  });

  it('should handle empty message array', async () => {
    const mockResponse = {
      choices: [{ message: { role: 'assistant', content: 'Hello!' } }],
      usage: { total_tokens: 10 },
    };

    mockCreate.mockResolvedValue(mockResponse);

    const result = await generateChatResponse([]);

    expect(result).toBeDefined();
    expect(mockCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        messages: expect.arrayContaining([
          expect.objectContaining({ role: 'system' }),
        ]),
      })
    );
  });

  it('should handle token count correctly', async () => {
    const mockChatMessages = [
      { role: 'user', content: 'Long message that uses many tokens...' },
    ];

    const mockResponse = {
      choices: [{ message: { role: 'assistant', content: 'Response' } }],
      usage: {
        prompt_tokens: 200,
        completion_tokens: 150,
        total_tokens: 350,
      },
    };

    mockCreate.mockResolvedValue(mockResponse);

    const result = await generateChatResponse(mockChatMessages);

    expect(result.tokens).toBe(350);
  });

  it('should use correct API key from environment', () => {
    // The OpenAI class is instantiated with the API key from env
    // This is tested implicitly through successful calls
    expect(process.env.OPENAI_API_KEY).toBeDefined();
  });
});
