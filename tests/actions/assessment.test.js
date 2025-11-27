/**
 * Assessment Server Actions Tests
 * Tests for the user dashboard assessment functionality
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { nanoid } from 'nanoid';

// Mock Clerk auth
vi.mock('@clerk/nextjs/server', () => ({
  auth: vi.fn(),
}));

// Mock Next.js cache
vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}));

// Import after mocking
import { auth } from '@clerk/nextjs/server';

// Import the server actions we're testing
import {
  createAssessment,
  getAssessment,
  getUserAssessments,
  updateAssessment,
  saveLocation,
  saveBuildingInfo,
  saveSafetyResult,
  archiveAssessment,
  deleteAssessment,
  duplicateAssessment,
  getDashboardStats,
} from '@/lib/actions/assessment';

// Test user ID
const TEST_USER_ID = `test_user_${nanoid(10)}`;
let testAssessmentId = null;

describe('Assessment Server Actions', () => {
  beforeEach(() => {
    // Mock authenticated user
    auth.mockResolvedValue({ userId: TEST_USER_ID });
  });

  afterEach(async () => {
    vi.clearAllMocks();
  });

  describe('createAssessment', () => {
    it('should create a new assessment for authenticated user', async () => {
      const result = await createAssessment();

      expect(result.success).toBe(true);
      expect(result.assessmentId).toBeDefined();
      expect(typeof result.assessmentId).toBe('string');

      // Save for later tests
      testAssessmentId = result.assessmentId;
    });

    it('should fail for unauthenticated user', async () => {
      auth.mockResolvedValue({ userId: null });

      const result = await createAssessment();

      expect(result.success).toBe(false);
      expect(result.error).toBe('Unauthorized');
    });
  });

  describe('getAssessment', () => {
    it('should fetch an existing assessment', async () => {
      // First create one
      const createResult = await createAssessment();
      expect(createResult.success).toBe(true);

      const result = await getAssessment(createResult.assessmentId);

      expect(result.success).toBe(true);
      expect(result.assessment).toBeDefined();
      expect(result.assessment.id).toBe(createResult.assessmentId);
      expect(result.assessment.userId).toBe(TEST_USER_ID);
      expect(result.assessment.status).toBe('DRAFT');
    });

    it('should return error for non-existent assessment', async () => {
      const result = await getAssessment('non-existent-id');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Assessment not found');
    });
  });

  describe('updateAssessment', () => {
    it('should update assessment fields', async () => {
      // Create assessment first
      const createResult = await createAssessment();
      expect(createResult.success).toBe(true);

      const result = await updateAssessment(createResult.assessmentId, {
        status: 'IN_PROGRESS',
        currentStep: 3,
        title: 'Test Building',
      });

      expect(result.success).toBe(true);
      expect(result.assessment.status).toBe('IN_PROGRESS');
      expect(result.assessment.currentStep).toBe(3);
    });

    it('should fail for other users assessment', async () => {
      // Create assessment as one user
      const createResult = await createAssessment();
      expect(createResult.success).toBe(true);

      // Switch to different user
      auth.mockResolvedValue({ userId: 'different_user_123' });

      const result = await updateAssessment(createResult.assessmentId, {
        title: 'Hacked Title',
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe('Assessment not found or unauthorized');
    });
  });

  describe('saveLocation', () => {
    it('should save location data to assessment', async () => {
      const createResult = await createAssessment();
      expect(createResult.success).toBe(true);

      const locationData = {
        latitude: 41.0082,
        longitude: 28.9784,
        fullAddress: '123 Test Street, Istanbul',
        city: 'Istanbul',
        country: 'Turkey',
        earthquakeZone: 'Zone 1',
      };

      const result = await saveLocation(createResult.assessmentId, locationData);

      expect(result.success).toBe(true);
      expect(result.location).toBeDefined();
      expect(result.location.latitude).toBe(41.0082);
      expect(result.location.city).toBe('Istanbul');
    });
  });

  describe('saveBuildingInfo', () => {
    it('should save building info to assessment', async () => {
      const createResult = await createAssessment();
      expect(createResult.success).toBe(true);

      // First save location (required step)
      await saveLocation(createResult.assessmentId, {
        latitude: 41.0082,
        longitude: 28.9784,
        fullAddress: 'Test Address',
      });

      const buildingData = {
        buildingType: 'Residential',
        numberOfFloors: 5,
        constructionYear: 2010,
        structuralSystem: 'RC Frame',
      };

      const result = await saveBuildingInfo(createResult.assessmentId, buildingData);

      expect(result.success).toBe(true);
      expect(result.buildingInfo).toBeDefined();
      expect(result.buildingInfo.numberOfFloors).toBe(5);
    });
  });

  describe('archiveAssessment', () => {
    it('should archive an assessment (soft delete)', async () => {
      const createResult = await createAssessment();
      expect(createResult.success).toBe(true);

      const result = await archiveAssessment(createResult.assessmentId);

      expect(result.success).toBe(true);

      // Verify it's archived
      const getResult = await getAssessment(createResult.assessmentId);
      expect(getResult.assessment.status).toBe('ARCHIVED');
    });

    it('should fail for unauthorized user', async () => {
      const createResult = await createAssessment();

      auth.mockResolvedValue({ userId: 'other_user' });

      const result = await archiveAssessment(createResult.assessmentId);

      expect(result.success).toBe(false);
    });
  });

  describe('duplicateAssessment', () => {
    it('should create a copy of an assessment', async () => {
      // Create and populate an assessment
      const createResult = await createAssessment();
      expect(createResult.success).toBe(true);

      await saveLocation(createResult.assessmentId, {
        latitude: 41.0082,
        longitude: 28.9784,
        fullAddress: 'Original Address',
      });

      await updateAssessment(createResult.assessmentId, {
        title: 'Original Assessment',
        currentStep: 5,
      });

      // Duplicate it
      const duplicateResult = await duplicateAssessment(createResult.assessmentId);

      expect(duplicateResult.success).toBe(true);
      expect(duplicateResult.assessmentId).toBeDefined();
      expect(duplicateResult.assessmentId).not.toBe(createResult.assessmentId);

      // Verify the duplicate has correct data
      const dupAssessment = await getAssessment(duplicateResult.assessmentId);
      expect(dupAssessment.assessment.title).toContain('Copy of');
      expect(dupAssessment.assessment.status).toBe('DRAFT');
      expect(dupAssessment.assessment.location).toBeDefined();
    });
  });

  describe('getUserAssessments', () => {
    it('should return paginated list of user assessments', async () => {
      // Create a few assessments
      await createAssessment();
      await createAssessment();
      await createAssessment();

      const result = await getUserAssessments({ limit: 10 });

      expect(result.success).toBe(true);
      expect(result.assessments).toBeDefined();
      expect(Array.isArray(result.assessments)).toBe(true);
      expect(result.total).toBeGreaterThanOrEqual(3);
    });

    it('should filter by status', async () => {
      // Create and complete an assessment
      const createResult = await createAssessment();
      await saveSafetyResult(createResult.assessmentId, {
        overallScore: 75,
        riskLevel: 'Moderate',
        safetyRating: 'B',
      });

      const completeResult = await getUserAssessments({ status: 'COMPLETE' });
      const draftResult = await getUserAssessments({ status: 'DRAFT' });

      expect(completeResult.success).toBe(true);
      expect(draftResult.success).toBe(true);

      // Completed ones should all have COMPLETE status
      completeResult.assessments.forEach((a) => {
        expect(a.status).toBe('COMPLETE');
      });
    });

    it('should fail for unauthenticated user', async () => {
      auth.mockResolvedValue({ userId: null });

      const result = await getUserAssessments();

      expect(result.success).toBe(false);
      expect(result.error).toBe('Unauthorized');
    });
  });

  describe('getDashboardStats', () => {
    it('should return dashboard statistics', async () => {
      const result = await getDashboardStats();

      expect(result.success).toBe(true);
      expect(result.stats).toBeDefined();
      expect(typeof result.stats.total).toBe('number');
      expect(typeof result.stats.completed).toBe('number');
      expect(typeof result.stats.inProgress).toBe('number');
    });

    it('should fail for unauthenticated user', async () => {
      auth.mockResolvedValue({ userId: null });

      const result = await getDashboardStats();

      expect(result.success).toBe(false);
    });
  });
});

// Cleanup test data after all tests
afterAll(async () => {
  try {
    // Delete all test assessments
    if (global.prisma) {
      await global.prisma.assessment.deleteMany({
        where: {
          userId: {
            startsWith: 'test_user_',
          },
        },
      });
      console.log('Test assessments cleaned up');
    }
  } catch (error) {
    console.log('Cleanup note:', error.message);
  }
});
