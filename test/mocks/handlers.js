import { http, HttpResponse } from 'msw';

// OpenAI API mock handlers
export const openaiHandlers = [
  http.post('https://api.openai.com/v1/chat/completions', async ({ request }) => {
    const body = await request.json();

    return HttpResponse.json({
      id: 'chatcmpl-test123',
      object: 'chat.completion',
      created: Date.now(),
      model: body.model || 'gpt-4o-2024-05-13',
      choices: [
        {
          index: 0,
          message: {
            role: 'assistant',
            content: 'This is a test response from the OpenAI API mock.',
          },
          finish_reason: 'stop',
        },
      ],
      usage: {
        prompt_tokens: 10,
        completion_tokens: 15,
        total_tokens: 25,
      },
    });
  }),

  // Mock for streaming responses
  http.post('https://api.openai.com/v1/chat/completions', async ({ request }) => {
    const body = await request.json();

    if (body.stream) {
      return new HttpResponse(
        new ReadableStream({
          start(controller) {
            const chunks = [
              'data: {"id":"chatcmpl-test","choices":[{"delta":{"content":"Test"},"index":0}]}\n\n',
              'data: {"id":"chatcmpl-test","choices":[{"delta":{"content":" response"},"index":0}]}\n\n',
              'data: [DONE]\n\n',
            ];

            chunks.forEach((chunk) => {
              controller.enqueue(new TextEncoder().encode(chunk));
            });
            controller.close();
          },
        }),
        {
          headers: {
            'Content-Type': 'text/event-stream',
          },
        }
      );
    }
  }),
];

// Seismic API mock handlers
export const seismicHandlers = [
  http.get('https://test-seismic-api.com/seismic-data', () => {
    return HttpResponse.json({
      latitude: 41.0082,
      longitude: 28.9784,
      zone: 1,
      soilType: 'Z2',
      pga: 0.4,
      availableData: true,
    });
  }),

  http.get('https://test-seismic-api.com/cities', () => {
    return HttpResponse.json([
      { id: 1, name: 'Istanbul', zone: 1 },
      { id: 2, name: 'Ankara', zone: 2 },
      { id: 3, name: 'Izmir', zone: 1 },
    ]);
  }),
];

// SendGrid API mock handlers
export const sendgridHandlers = [
  http.post('https://api.sendgrid.com/v3/mail/send', () => {
    return HttpResponse.json(
      { message: 'Email sent successfully' },
      { status: 202 }
    );
  }),
];

// Next.js API route handlers
export const nextApiHandlers = [
  http.post('http://localhost:3000/api/analyze-image', async ({ request }) => {
    const formData = await request.formData();
    const image = formData.get('image');

    return HttpResponse.json({
      success: true,
      analysis: {
        description: 'Mock image analysis result',
        detectedIssues: ['crack', 'structural damage'],
        confidence: 0.85,
      },
    });
  }),
];

// Combine all handlers
export const handlers = [
  ...openaiHandlers,
  ...seismicHandlers,
  ...sendgridHandlers,
  ...nextApiHandlers,
];
