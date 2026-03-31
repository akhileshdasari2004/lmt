import { useState, useEffect } from 'react';
import { getAllCourses, getCourse } from '../services/firestoreService';

export const useCourses = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoading(true);
        console.log('Fetching courses...');
        const data = await getAllCourses();
        console.log('Courses fetched:', data);
        setCourses(data);
      } catch (err) {
        console.error('Error fetching courses:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  return { courses, loading, error };
};

export const useCourse = (courseId) => {
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCourse = async () => {
      if (!courseId) {
        console.log('⚠️ useCourse: courseId not provided');
        return;
      }

      try {
        setLoading(true);
        console.log(`🔍 useCourse: Fetching course data for courseId=${courseId}`);
        const data = await getCourse(courseId);
        console.log(`✅ useCourse: Course data received:`, data);
        setCourse(data);
      } catch (err) {
        console.error(`❌ useCourse: Error fetching course ${courseId}:`, err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCourse();
  }, [courseId]);

  return { course, loading, error };
};
