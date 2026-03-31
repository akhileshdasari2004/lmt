import { useState, useEffect, useCallback, useRef } from 'react';
import { getProgress, toggleLessonComplete, updateProgress } from '../services/firestoreService';

/**
 * Hook for managing course progress tracking
 * Storage: /users/{userId}/progress/{courseId}
 * 
 * @param {string} userId - The user's UID
 * @param {string} courseId - The course ID
 * @returns {Object} Progress state and methods
 */
export const useProgress = (userId, courseId) => {
  const [progress, setProgress] = useState({ completedLessons: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    const fetchProgress = async () => {
      if (!userId || !courseId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        console.log(`Fetching progress for user: ${userId}, course: ${courseId}`);
        const data = await getProgress(userId, courseId);
        console.log('Progress data fetched:', data);
        
        if (isMountedRef.current) {
          setProgress(data || { completedLessons: [] });
        }
      } catch (err) {
        console.error('Error fetching progress:', err);
        if (isMountedRef.current) {
          setError(err.message);
          setProgress({ completedLessons: [] });
        }
      } finally {
        if (isMountedRef.current) {
          setLoading(false);
        }
      }
    };

    fetchProgress();
  }, [userId, courseId]);

  const toggleLesson = useCallback(
    async (lessonId) => {
      if (!userId || !courseId) {
        console.error('Missing userId or courseId');
        return;
      }

      try {
        console.log(`Toggling lesson ${lessonId} for user ${userId} in course ${courseId}`);
        const newCompleted = await toggleLessonComplete(userId, courseId, lessonId);
        
        if (isMountedRef.current) {
          console.log('Updated completed lessons:', newCompleted);
          setProgress((prev) => ({ 
            ...prev, 
            completedLessons: newCompleted,
            updatedAt: new Date(),
          }));
        }
        return newCompleted;
      } catch (err) {
        console.error('Error toggling lesson:', err);
        if (isMountedRef.current) {
          setError(err.message);
        }
        throw err;
      }
    },
    [userId, courseId]
  );

  const calculateProgress = useCallback(
    (totalLessons) => {
      if (!totalLessons || totalLessons.length === 0) return 0;
      const completed = progress.completedLessons?.length || 0;
      const percent = Math.round((completed / totalLessons.length) * 100);
      console.log(`Progress calculation: ${completed}/${totalLessons.length} = ${percent}%`);
      return percent;
    },
    [progress.completedLessons]
  );

  const refreshProgress = useCallback(
    async () => {
      if (!userId || !courseId) return;
      
      try {
        console.log('Refreshing progress...');
        const data = await getProgress(userId, courseId);
        if (isMountedRef.current) {
          setProgress(data || { completedLessons: [] });
        }
      } catch (err) {
        console.error('Error refreshing progress:', err);
        if (isMountedRef.current) {
          setError(err.message);
        }
      }
    },
    [userId, courseId]
  );

  return {
    progress,
    loading,
    error,
    toggleLesson,
    calculateProgress,
    refreshProgress,
    completedCount: progress.completedLessons?.length || 0,
  };
};
