// src/hooks/useCourseManagement.js
import { useState, useEffect, useCallback } from 'react';
import {
  createCourse,
  getCourses,
  getCourseWithLessons,
  updateCourse,
  deleteCourse,
  updateCourseWithLessons,
} from '../services/courseService';

/**
 * Production-ready hook for course CRUD with toast notifications
 * @param {Function} showToast - Toast notification function
 */
export const useCourseManagement = (showToast) => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch all courses
  const fetchCourses = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getCourses();
      setCourses(data);
    } catch (err) {
      setError(err.message);
      showToast?.('Failed to load courses', 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  // Create course with lessons
  const handleCreateCourse = useCallback(
    async ({ title, description, lessons }) => {
      setLoading(true);
      setError(null);

      try {
        const courseId = await createCourse({
          title,
          description,
          lessons,
        });

        // Optimistic update
        const newCourse = {
          id: courseId,
          title,
          description,
          lessonCount: lessons.length,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        setCourses((prev) => [newCourse, ...prev]);

        showToast?.(
          `Course "${title}" created with ${lessons.length} lessons`,
          'success'
        );

        return { success: true, courseId };
      } catch (err) {
        const errorMsg = err.message || 'Failed to create course';
        setError(errorMsg);
        showToast?.(errorMsg, 'error');
        return { success: false, error: errorMsg };
      } finally {
        setLoading(false);
      }
    },
    [showToast]
  );

  // Update course with lessons
  const handleUpdateCourse = useCallback(
    async (courseId, courseData, lessons) => {
      setLoading(true);
      setError(null);

      try {
        await updateCourseWithLessons(courseId, courseData, lessons);

        // Update local state
        setCourses((prev) =>
          prev.map((c) =>
            c.id === courseId
              ? {
                  ...c,
                  ...courseData,
                  lessonCount: lessons.length,
                  updatedAt: new Date(),
                }
              : c
          )
        );

        showToast?.('Course updated successfully', 'success');
        return { success: true };
      } catch (err) {
        const errorMsg = err.message || 'Failed to update course';
        setError(errorMsg);
        showToast?.(errorMsg, 'error');
        return { success: false, error: errorMsg };
      } finally {
        setLoading(false);
      }
    },
    [showToast]
  );

  // Delete course
  const handleDeleteCourse = useCallback(
    async (courseId) => {
      setLoading(true);
      setError(null);

      try {
        await deleteCourse(courseId);

        // Optimistic update
        setCourses((prev) => prev.filter((c) => c.id !== courseId));

        showToast?.('Course deleted successfully', 'success');
        return { success: true };
      } catch (err) {
        const errorMsg = err.message || 'Failed to delete course';
        setError(errorMsg);
        showToast?.(errorMsg, 'error');
        return { success: false, error: errorMsg };
      } finally {
        setLoading(false);
      }
    },
    [showToast]
  );

  return {
    courses,
    loading,
    error,
    fetchCourses,
    createCourse: handleCreateCourse,
    updateCourse: handleUpdateCourse,
    deleteCourse: handleDeleteCourse,
  };
};

/**
 * Hook for single course with lessons
 * @param {string} courseId
 * @param {Function} showToast
 */
export const useCourseDetail = (courseId, showToast) => {
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchCourse = useCallback(async () => {
    if (!courseId) return;

    setLoading(true);
    setError(null);

    try {
      const data = await getCourseWithLessons(courseId);
      setCourse(data);
    } catch (err) {
      setError(err.message);
      showToast?.('Failed to load course details', 'error');
    } finally {
      setLoading(false);
    }
  }, [courseId, showToast]);

  useEffect(() => {
    fetchCourse();
  }, [fetchCourse]);

  const refreshCourse = useCallback(async () => {
    await fetchCourse();
  }, [fetchCourse]);

  return {
    course,
    loading,
    error,
    refreshCourse,
  };
};
