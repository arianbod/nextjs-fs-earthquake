import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock SendGrid before importing
vi.mock('@sendgrid/mail', () => ({
  default: {
    setApiKey: vi.fn(),
    send: vi.fn(),
  },
}));

// Import after mocking
const { sendVerificationEmail } = await import('../emailService');
const sgMail = (await import('@sendgrid/mail')).default;
const mockSend = sgMail.send;
const mockSetApiKey = sgMail.setApiKey;

describe('EmailService - sendVerificationEmail', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.clearAllMocks();

    // Set up environment variables
    process.env = {
      ...originalEnv,
      SENDGRID_API_KEY: 'test-api-key',
      FROM_EMAIL: 'noreply@test.com',
      FROM_NAME: 'Test App',
      NEXT_PUBLIC_APP_URL: 'http://localhost:3000',
      DEFAULT_LANGUAGE: 'en',
      NODE_ENV: 'test',
    };

    // Mock successful SendGrid response by default
    mockSend.mockResolvedValue([
      {
        statusCode: 202,
        headers: { 'x-message-id': 'test-message-id-123' },
        body: {},
      },
    ]);
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe('Successful Email Sending', () => {
    it('should send verification email successfully', async () => {
      const result = await sendVerificationEmail(
        'user@example.com',
        'test-token-123',
        'user-id-456'
      );

      expect(result.success).toBe(true);
      expect(result.message).toBe('Verification email sent successfully');
      expect(result.details.statusCode).toBe(202);
      expect(result.details.messageId).toBe('test-message-id-123');
    });

    it('should call SendGrid with correct parameters', async () => {
      await sendVerificationEmail(
        'user@example.com',
        'test-token',
        'user-id'
      );

      expect(mockSetApiKey).toHaveBeenCalledWith('test-api-key');
      expect(mockSend).toHaveBeenCalledWith(
        expect.objectContaining({
          to: 'user@example.com',
          from: {
            email: 'noreply@test.com',
            name: 'Test App',
          },
          subject: 'Verify Your Email',
        })
      );
    });

    it('should include verification URL in email', async () => {
      await sendVerificationEmail(
        'user@example.com',
        'token123',
        'user456'
      );

      const emailCall = mockSend.mock.calls[0][0];
      const expectedUrl = 'http://localhost:3000/en/verify-email?token=token123&userId=user456';

      expect(emailCall.text).toContain(expectedUrl);
      expect(emailCall.html).toContain(expectedUrl);
    });

    it('should use default language if not specified', async () => {
      delete process.env.DEFAULT_LANGUAGE;

      await sendVerificationEmail(
        'user@example.com',
        'token123',
        'user456'
      );

      const emailCall = mockSend.mock.calls[0][0];
      expect(emailCall.text).toContain('/en/verify-email');
    });

    it('should include both text and HTML versions', async () => {
      await sendVerificationEmail(
        'user@example.com',
        'token123',
        'user456'
      );

      const emailCall = mockSend.mock.calls[0][0];

      expect(emailCall.text).toBeDefined();
      expect(emailCall.html).toBeDefined();
      expect(emailCall.text).toContain('verify your email');
      expect(emailCall.html).toContain('Verify Email');
    });

    it('should format HTML email correctly', async () => {
      await sendVerificationEmail(
        'user@example.com',
        'token123',
        'user456'
      );

      const emailCall = mockSend.mock.calls[0][0];

      expect(emailCall.html).toContain('<div');
      expect(emailCall.html).toContain('<h2>Email Verification</h2>');
      expect(emailCall.html).toContain('<a href=');
      expect(emailCall.html).toContain('Verify Email');
      expect(emailCall.html).toContain('24 hours');
    });
  });

  describe('Error Handling', () => {
    it('should handle missing SENDGRID_API_KEY', async () => {
      delete process.env.SENDGRID_API_KEY;

      const result = await sendVerificationEmail(
        'user@example.com',
        'token',
        'user-id'
      );

      expect(result.success).toBe(false);
      expect(result.error).toBe('Failed to send verification email');
    });

    it('should handle missing FROM_EMAIL', async () => {
      delete process.env.FROM_EMAIL;

      const result = await sendVerificationEmail(
        'user@example.com',
        'token',
        'user-id'
      );

      expect(result.success).toBe(false);
      expect(result.error).toBe('Failed to send verification email');
    });

    it('should handle missing NEXT_PUBLIC_APP_URL', async () => {
      delete process.env.NEXT_PUBLIC_APP_URL;

      const result = await sendVerificationEmail(
        'user@example.com',
        'token',
        'user-id'
      );

      expect(result.success).toBe(false);
    });

    it('should handle SendGrid API errors', async () => {
      mockSend.mockRejectedValue(new Error('SendGrid API Error'));

      const result = await sendVerificationEmail(
        'user@example.com',
        'token',
        'user-id'
      );

      expect(result.success).toBe(false);
      expect(result.error).toBe('Failed to send verification email');
    });

    it('should handle non-202 status codes', async () => {
      mockSend.mockResolvedValue([
        {
          statusCode: 400,
          headers: {},
          body: { errors: ['Invalid email'] },
        },
      ]);

      const result = await sendVerificationEmail(
        'invalid-email',
        'token',
        'user-id'
      );

      expect(result.success).toBe(false);
      expect(result.error).toBe('Failed to send verification email');
    });

    it('should handle network timeout errors', async () => {
      const timeoutError = new Error('Request timeout');
      timeoutError.code = 'ETIMEDOUT';
      mockSend.mockRejectedValue(timeoutError);

      const result = await sendVerificationEmail(
        'user@example.com',
        'token',
        'user-id'
      );

      expect(result.success).toBe(false);
      expect(result.error).toBe('Failed to send verification email');
    });

    it('should include error details in development mode', async () => {
      process.env.NODE_ENV = 'development';
      const testError = new Error('Test error message');
      mockSend.mockRejectedValue(testError);

      const result = await sendVerificationEmail(
        'user@example.com',
        'token',
        'user-id'
      );

      expect(result.success).toBe(false);
      expect(result.details).toBeDefined();
      expect(result.details.message).toBe('Test error message');
    });

    it('should not include error details in production', async () => {
      process.env.NODE_ENV = 'production';
      const testError = new Error('Test error message');
      mockSend.mockRejectedValue(testError);

      const result = await sendVerificationEmail(
        'user@example.com',
        'token',
        'user-id'
      );

      expect(result.success).toBe(false);
      expect(result.details).toBeUndefined();
    });
  });

  describe('Input Validation', () => {
    it('should handle various email formats', async () => {
      const emails = [
        'user@example.com',
        'test.user@example.co.uk',
        'user+tag@example.com',
      ];

      for (const email of emails) {
        mockSend.mockClear();
        const result = await sendVerificationEmail(email, 'token', 'user-id');

        expect(result.success).toBe(true);
        expect(mockSend).toHaveBeenCalledWith(
          expect.objectContaining({ to: email })
        );
      }
    });

    it('should handle tokens of different lengths', async () => {
      const tokens = [
        'short',
        'medium-length-token',
        'very-long-token-'.repeat(10),
      ];

      for (const token of tokens) {
        mockSend.mockClear();
        const result = await sendVerificationEmail(
          'user@example.com',
          token,
          'user-id'
        );

        expect(result.success).toBe(true);
        const emailCall = mockSend.mock.calls[0][0];
        expect(emailCall.text).toContain(token);
      }
    });

    it('should handle special characters in user ID', async () => {
      const userIds = ['user-123', 'user_456', 'user@special'];

      for (const userId of userIds) {
        mockSend.mockClear();
        const result = await sendVerificationEmail(
          'user@example.com',
          'token',
          userId
        );

        expect(result.success).toBe(true);
        const emailCall = mockSend.mock.calls[0][0];
        expect(emailCall.text).toContain(userId);
      }
    });
  });

  describe('URL Generation', () => {
    it('should generate correct verification URL', async () => {
      await sendVerificationEmail(
        'user@example.com',
        'abc123',
        'user789'
      );

      const emailCall = mockSend.mock.calls[0][0];
      const expectedUrl = 'http://localhost:3000/en/verify-email?token=abc123&userId=user789';

      expect(emailCall.text).toContain(expectedUrl);
      expect(emailCall.html).toContain(expectedUrl);
    });

    it('should use custom language if specified', async () => {
      process.env.DEFAULT_LANGUAGE = 'tr';

      await sendVerificationEmail(
        'user@example.com',
        'token',
        'user-id'
      );

      const emailCall = mockSend.mock.calls[0][0];
      expect(emailCall.text).toContain('/tr/verify-email');
    });

    it('should properly encode URL parameters', async () => {
      const specialToken = 'token+with&special=chars';
      const specialUserId = 'user/with/slashes';

      await sendVerificationEmail(
        'user@example.com',
        specialToken,
        specialUserId
      );

      const emailCall = mockSend.mock.calls[0][0];
      expect(emailCall.text).toContain(specialToken);
      expect(emailCall.text).toContain(specialUserId);
    });
  });
});
