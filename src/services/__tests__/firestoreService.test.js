import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  getAllCourses,
  getProgress,
  updateProgress,
  getUser,
} from '../firestoreService';
import { getDocs, getDoc, setDoc } from 'firebase/firestore';

describe('firestoreService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('getAllCourses returns array of course objects', async () => {
    getDocs
      .mockResolvedValueOnce({
        docs: [{ id: 'c1', data: () => ({ title: 'Course 1' }) }],
      })
      .mockResolvedValueOnce({ docs: [] });

    const courses = await getAllCourses();
    expect(courses).toEqual([{ id: 'c1', title: 'Course 1', lessons: [] }]);
  });

  it('getProgress returns progress for userId + courseId', async () => {
    getDoc.mockResolvedValueOnce({
      exists: () => true,
      data: () => ({ userId: 'u1', courseId: 'c1', completedLessons: ['l1'] }),
    });
    const progress = await getProgress('u1', 'c1');
    expect(progress.completedLessons).toEqual(['l1']);
  });

  it('updateProgress calls setDoc with correct payload', async () => {
    await updateProgress('u1', 'c1', ['l1', 'l2']);
    expect(setDoc).toHaveBeenCalledWith(
      expect.anything(),
      { userId: 'u1', courseId: 'c1', completedLessons: ['l1', 'l2'] },
      { merge: true },
    );
  });

  it('getUserProfile equivalent fetches correct user doc', async () => {
    getDoc.mockResolvedValueOnce({
      exists: () => true,
      data: () => ({ email: 'student@example.com' }),
    });
    const user = await getUser('uid-1');
    expect(user).toEqual({ email: 'student@example.com' });
  });

  it('handles empty firestore responses gracefully', async () => {
    getDoc.mockResolvedValueOnce({ exists: () => false, data: () => ({}) });
    const user = await getUser('missing');
    expect(user).toBeNull();
  });
});
