// src/hooks/useAdminLessons.js
import { useState, useEffect, useCallback } from 'react';
import {
  createLesson,
  getLessonsByCourse,
  getLessonById,
  updateLesson,
  deleteLesson,
  reorderLessons,
  bulkCreateLessons,
} from '../services/adminCourseService';

/**
 * Hook for managing lessons within a course
 * @param {string} courseId
 */
export const useAdminLessons = (courseId) => {
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch all lessons for course
  const fetchLessons = useCallback(async () => {
    if (!courseId) return;

    setLoading(true);
    setError(null);
    try {
      const data = await getLessonsByCourse(courseId);
      setLessons(data);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching lessons:', err);
    } finally {
      setLoading(false);
    }
  }, [courseId]);

  useEffect(() => {
    fetchLessons();
  }, [fetchLessons]);

  // Add single lesson
  const addLesson = useCallback(
    async (lessonData) => {
      setLoading(true);
      setError(null);
      try {
        const lessonId = await createLesson(courseId, lessonData);
        await fetchLessons();
        return { success: true, lessonId };
      } catch (err) {
        setError(err.message);
        return { success: false, error: err.message };
      } finally {
        setLoading(false);
      }
    },
    [courseId, fetchLessons]
  );

  // Add multiple lessons
  const addMultipleLessons = useCallback(
    async (lessonsArray) => {
      setLoading(true);
      setError(null);
      try {
        const lessonIds = await bulkCreateLessons(courseId, lessonsArray);
        await fetchLessons();
        return { success: true, lessonIds };
      } catch (err) {
        setError(err.message);
        return { success: false, error: err.message };
      } finally {
        setLoading(false);
      }
    },
    [courseId, fetchLessons]
  );

  // Edit lesson
  const editLesson = useCallback(
    async (lessonId, updates) => {
      setLoading(true);
      setError(null);
      try {
        await updateLesson(courseId, lessonId, updates);
        setLessons((prev) =>
          prev.map((l) => (l.id === lessonId ? { ...l, ...updates } : l))
        );
        return { success: true };
      } catch (err) {
        setError(err.message);
        return { success: false, error: err.message };
      } finally {
        setLoading(false);
      }
    },
    [courseId]
  );

  // Remove lesson
  const removeLesson = useCallback(
    async (lessonId) => {
      setLoading(true);
      setError(null);
      try {
        await deleteLesson(courseId, lessonId);
        setLessons((prev) => prev.filter((l) => l.id !== lessonId));
        return { success: true };
      } catch (err) {
        setError(err.message);
        return { success: false, error: err.message };
      } finally {
        setLoading(false);
      }
    },
    [courseId]
  );

  // Reorder lessons
  const reorder = useCallback(
    async (orderedLessonIds) => {
      setLoading(true);
      setError(null);
      try {
        await reorderLessons(courseId, orderedLessonIds);
        // Update local order
        const reorderedLessons = orderedLessonIds
          .map((id) => lessons.find((l) => l.id === id))
          .filter(Boolean)
          .map((l, index) => ({ ...l, order: index }));
        setLessons(reorderedLessons);
        return { success: true };
      } catch (err) {
        setError(err.message);
        return { success: false, error: err.message };
      } finally {
        setLoading(false);
      }
    },
    [courseId, lessons]
  );

  return {
    lessons,
    loading,
    error,
    fetchLessons,
    addLesson,
    addMultipleLessons,
    editLesson,
    removeLesson,
    reorder,
  };
};

/**
 * Hook for single lesson operations
 * @param {string} courseId
 * @param {string} lessonId
 */
export const useAdminLesson = (courseId, lessonId) => {
  const [lesson, setLesson] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchLesson = useCallback(async () => {
    if (!courseId || !lessonId) return;

    setLoading(true);
    setError(null);
    try {
      const data = await getLessonById(courseId, lessonId);
      setLesson(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [courseId, lessonId]);

  useEffect(() => {
    fetchLesson();
  }, [fetchLesson]);

  return {
    lesson,
    loading,
    error,
    refreshLesson: fetchLesson,
  };
};
