// src/hooks/useAdminCourses.js
import { useState, useEffect, useCallback } from 'react';
import {
  createCourse,
  getAllCoursesAdmin,
  getCourseById,
  updateCourse,
  deleteCourse,
} from '../services/adminCourseService';

/**
 * Hook for managing courses in admin panel
 */
export const useAdminCourses = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch all courses
  const fetchCourses = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getAllCoursesAdmin();
      setCourses(data);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching courses:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  // Create new course
  const addCourse = useCallback(async (courseData) => {
    setLoading(true);
    setError(null);
    try {
      const courseId = await createCourse(courseData);
      // Refresh courses list
      await fetchCourses();
      return { success: true, courseId };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, [fetchCourses]);

  // Update existing course
  const editCourse = useCallback(async (courseId, updates) => {
    setLoading(true);
    setError(null);
    try {
      await updateCourse(courseId, updates);
      // Update local state
      setCourses((prev) =>
        prev.map((c) => (c.id === courseId ? { ...c, ...updates } : c))
      );
      return { success: true };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, []);

  // Delete course
  const removeCourse = useCallback(async (courseId) => {
    setLoading(true);
    setError(null);
    try {
      await deleteCourse(courseId);
      // Update local state
      setCourses((prev) => prev.filter((c) => c.id !== courseId));
      return { success: true };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    courses,
    loading,
    error,
    fetchCourses,
    addCourse,
    editCourse,
    removeCourse,
  };
};

/**
 * Hook for fetching single course with details
 * @param {string} courseId
 */
export const useAdminCourse = (courseId) => {
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchCourse = useCallback(async () => {
    if (!courseId) return;

    setLoading(true);
    setError(null);
    try {
      const data = await getCourseById(courseId);
      setCourse(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [courseId]);

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
