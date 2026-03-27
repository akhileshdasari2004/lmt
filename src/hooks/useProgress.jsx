import { useState, useEffect, useCallback } from 'react';
import { getProgress, toggleLessonComplete, updateProgress } from '../services/firestoreService';

export const useProgress = (userId, courseId) => {
  const [progress, setProgress] = useState({ completedLessons: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProgress = async () => {
      if (!userId || !courseId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const data = await getProgress(userId, courseId);
        setProgress(data);
      } catch (err) {
        console.error('Error fetching progress:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProgress();
  }, [userId, courseId]);

  const toggleLesson = useCallback(
    async (lessonId) => {
      if (!userId || !courseId) return;

      try {
        const newCompleted = await toggleLessonComplete(userId, courseId, lessonId);
        setProgress((prev) => ({ ...prev, completedLessons: newCompleted }));
        return newCompleted;
      } catch (err) {
        console.error('Error toggling lesson:', err);
        throw err;
      }
    },
    [userId, courseId]
  );

  const calculateProgress = useCallback(
    (totalLessons) => {
      if (!totalLessons || totalLessons.length === 0) return 0;
      const completed = progress.completedLessons?.length || 0;
      return Math.round((completed / totalLessons.length) * 100);
    },
    [progress.completedLessons]
  );

  return {
    progress,
    loading,
    toggleLesson,
    calculateProgress,
    completedCount: progress.completedLessons?.length || 0,
  };
};
