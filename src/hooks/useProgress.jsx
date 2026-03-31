import { useState, useEffect, useCallback, useRef } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../services/firebase';
import {
  getOrCreateProgress,
  getProgressDocId,
  toggleLessonComplete,
} from '../services/firestoreService';

/**
 * Hook for managing course progress tracking
 * Storage: /progress/{userId}_{courseId}
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
    if (!userId || !courseId) {
      setProgress({ completedLessons: [] });
      setError(null);
      setLoading(false);
      return;
    }

    let unsubscribe = null;

    const setupProgress = async () => {
      if (!userId || !courseId) {
        return;
      }

      try {
        setLoading(true);
        setError(null);

        await getOrCreateProgress(userId, courseId);

        const progressId = getProgressDocId(userId, courseId);
        const progressRef = doc(db, 'progress', progressId);
        unsubscribe = onSnapshot(
          progressRef,
          (snapshot) => {
            if (!isMountedRef.current) return;

            if (snapshot.exists()) {
              setProgress(snapshot.data());
            } else {
              setProgress({ userId, courseId, completedLessons: [] });
            }
            setLoading(false);
          },
          (snapshotError) => {
            console.error('Error subscribing to progress:', snapshotError);
            if (isMountedRef.current) {
              setError(snapshotError.message);
              setProgress({ completedLessons: [] });
              setLoading(false);
            }
          },
        );
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

    setupProgress();

    return () => {
      if (unsubscribe) unsubscribe();
    };
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
        const data = await getOrCreateProgress(userId, courseId);
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
