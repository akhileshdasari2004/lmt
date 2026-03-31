import { useParams, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { useState } from 'react';
import { useCourse } from '../hooks/useCourses';
import { useProgress } from '../hooks/useProgress';
import { useAuth } from '../hooks/useAuth';
import LessonItem from '../components/LessonItem';
import { getOrCreateProgress, getStudentAssignments } from '../services/firestoreService';

const Course = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const {
    course,
    loading: courseLoading,
    error: courseError,
  } = useCourse(id);
  const {
    progress,
    toggleLesson,
    calculateProgress,
    loading: progressLoading,
    error: progressError,
  } = useProgress(user?.uid, id);
  const [assignedLessons, setAssignedLessons] = useState([]);

  const handleGoBack = () => {
    navigate('/dashboard');
  };

  useEffect(() => {
    if (!user?.uid || !id) return;
    getOrCreateProgress(user.uid, id).catch((err) => {
      console.error('Error ensuring progress document exists:', err);
    });
  }, [user?.uid, id]);

  useEffect(() => {
    if (!user?.uid || !id) {
      setAssignedLessons([]);
      return;
    }

    const unsubscribe = getStudentAssignments(user.uid, (lessons) => {
      const filtered = (lessons || []).filter((lesson) => lesson.courseId === id);
      setAssignedLessons(filtered);
    });

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [user?.uid, id]);

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-text-primary mb-2">
            Please log in
          </h2>
          <p className="text-text-secondary mb-4">
            You need to be logged in to view this course.
          </p>
          <button
            onClick={handleGoBack}
            className="px-4 py-2 rounded-xl bg-brand-500 text-white text-sm font-semibold hover:bg-brand-600 transition-colors"
          >
            Back to dashboard
          </button>
        </div>
      </div>
    );
  }

  if (courseLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-text-secondary">Loading course…</p>
        </div>
      </div>
    );
  }

  if (courseError || !course) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-text-primary mb-2">
            Course not found
          </h2>
          <p className="text-text-secondary mb-4">
            The course you&apos;re looking for doesn&apos;t exist.
          </p>
          <button
            onClick={handleGoBack}
            className="px-4 py-2 rounded-xl bg-brand-500 text-white text-sm font-semibold hover:bg-brand-600 transition-colors"
          >
            Back to dashboard
          </button>
        </div>
      </div>
    );
  }

  const hasSubjectAssignment = assignedLessons.some(
    (lesson) => lesson.assignmentType === 'subject' || lesson.lessonId == null,
  );
  const lessons = hasSubjectAssignment
    ? course.lessons || []
    : assignedLessons.map((lesson, index) => ({
        id: lesson.lessonId,
        title: lesson.lessonTitle,
        order: index,
      }));
  const completedLessons = progress.completedLessons || [];
  const progressPercent = calculateProgress(lessons);

  return (
    <div className="min-h-screen bg-surface text-text-primary">
      <header className="border-b border-surface-border">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <button
            onClick={handleGoBack}
            className="inline-flex items-center gap-2 text-xs font-medium text-text-secondary hover:text-text-primary mb-4"
          >
            <span className="h-5 w-5 rounded-full border border-surface-border flex items-center justify-center">
              ←
            </span>
            Back to dashboard
          </button>

          <h1 className="text-3xl font-bold tracking-tight text-text-primary">
            {course.title}
          </h1>
          {course.description && (
            <p className="mt-2 text-sm text-text-secondary max-w-2xl">
              {course.description}
            </p>
          )}

          {/* Progress Summary */}
          <div className="mt-5 rounded-2xl bg-surface-card border border-surface-border px-4 py-4">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
              <div className="flex items-center gap-3">
                <span className="inline-flex items-center rounded-full bg-brand-500/10 px-3 py-1 text-[11px] font-semibold text-brand-400">
                  {completedLessons.length} of {lessons.length} lessons
                  complete
                </span>
              </div>
              <span className="text-sm font-semibold text-text-secondary">
                {progressPercent}% overall
              </span>
            </div>
            <div className="w-full h-2 rounded-full bg-surface-muted overflow-hidden">
              <div
                className="h-full rounded-full bg-brand-500 transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            {progressError && (
              <p className="mt-3 text-xs text-danger">
                Error loading progress: {progressError}
              </p>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-text-muted">
              Lessons
            </p>
            <h2 className="text-lg font-semibold text-text-primary mt-1">
              Work through each step at your own pace
            </h2>
          </div>
        </div>

        {progressLoading ? (
          <div className="flex justify-center py-10">
            <span className="h-6 w-6 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : lessons.length === 0 ? (
          <div className="rounded-2xl bg-surface-card border border-surface-border px-6 py-10 text-center">
            <p className="text-sm font-medium text-text-primary mb-1">
              No lessons available
            </p>
            <p className="text-xs text-text-secondary">
              Ask an administrator to add lessons to this course.
            </p>
          </div>
        ) : (
          <div className="rounded-2xl bg-surface-card border border-surface-border divide-y divide-surface-border">
            {lessons.map((lesson) => (
              <LessonItem
                key={lesson.id}
                lesson={lesson}
                isCompleted={completedLessons.includes(lesson.id)}
                onToggle={toggleLesson}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Course;
