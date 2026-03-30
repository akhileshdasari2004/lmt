import { useState, useCallback, useEffect } from "react";
import {
  getAllCoursesForAdmin,
  getCourseForAdmin,
  addCourse,
  updateCourseAdmin,
  deleteCourseAdmin,
  getAllEnrollments,
  getDashboardStats,
} from "../services/adminService";

/**
 * Custom hook for admin operations
 * Manages courses, enrollments, and dashboard data
 */
export const useAdminOperations = () => {
  const [courses, setCourses] = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [dashboardStats, setDashboardStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch all courses
  const fetchCourses = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getAllCoursesForAdmin();
      setCourses(data);
      setError(null);
    } catch (err) {
      setError(err.message);
      console.error("Error fetching courses:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch all enrollments
  const fetchEnrollments = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getAllEnrollments();
      setEnrollments(data);
      setError(null);
    } catch (err) {
      setError(err.message);
      console.error("Error fetching enrollments:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch dashboard stats
  const fetchDashboardStats = useCallback(async () => {
    try {
      const stats = await getDashboardStats();
      setDashboardStats(stats);
      setError(null);
    } catch (err) {
      setError(err.message);
      console.error("Error fetching dashboard stats:", err);
    }
  }, []);

  // Fetch single course
  const fetchCourse = useCallback(async (courseId) => {
    setLoading(true);
    try {
      const course = await getCourseForAdmin(courseId);
      setError(null);
      return course;
    } catch (err) {
      setError(err.message);
      console.error("Error fetching course:", err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Add course
  const handleAddCourse = useCallback(
    async (courseData) => {
      try {
        const result = await addCourse(courseData);
        if (result.success) {
          await fetchCourses();
          setError(null);
        } else {
          setError(result.error);
        }
        return result;
      } catch (err) {
        const errorMsg = err.message || "Failed to add course";
        setError(errorMsg);
        return { success: false, error: errorMsg };
      }
    },
    [fetchCourses],
  );

  // Update course
  const handleUpdateCourse = useCallback(
    async (courseId, courseData) => {
      try {
        const result = await updateCourseAdmin(courseId, courseData);
        if (result.success) {
          await fetchCourses();
          setError(null);
        } else {
          setError(result.error);
        }
        return result;
      } catch (err) {
        const errorMsg = err.message || "Failed to update course";
        setError(errorMsg);
        return { success: false, error: errorMsg };
      }
    },
    [fetchCourses],
  );

  // Delete course
  const handleDeleteCourse = useCallback(
    async (courseId, imageUrl) => {
      try {
        const result = await deleteCourseAdmin(courseId, imageUrl);
        if (result.success) {
          await fetchCourses();
          setError(null);
        } else {
          setError(result.error);
        }
        return result;
      } catch (err) {
        const errorMsg = err.message || "Failed to delete course";
        setError(errorMsg);
        return { success: false, error: errorMsg };
      }
    },
    [fetchCourses],
  );

  // Load initial data
  useEffect(() => {
    fetchCourses();
    fetchEnrollments();
    fetchDashboardStats();
  }, [fetchCourses, fetchEnrollments, fetchDashboardStats]);

  return {
    // State
    courses,
    enrollments,
    dashboardStats,
    loading,
    error,

    // Methods
    fetchCourses,
    fetchEnrollments,
    fetchDashboardStats,
    fetchCourse,
    handleAddCourse,
    handleUpdateCourse,
    handleDeleteCourse,
  };
};
