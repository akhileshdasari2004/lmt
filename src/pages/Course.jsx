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
      <div className="min-h-screen flex items-center justify-center bg-violet-25">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-violet-900 mb-2">
            Please log in
          </h2>
          <p className="text-violet-400 mb-4">
            You need to be logged in to view this course.
          </p>
          <button
            onClick={handleGoBack}
            className="s-button"
          >
            Back to dashboard
          </button>
        </div>
      </div>
    );
  }

  if (courseLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-violet-25">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-violet-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-violet-400">Loading course…</p>
        </div>
      </div>
    );
  }

  if (courseError || !course) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-violet-25">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-violet-900 mb-2">
            Course not found
          </h2>
          <p className="text-violet-400 mb-4">
            The course you&apos;re looking for doesn&apos;t exist.
          </p>
          <button
            onClick={handleGoBack}
            className="s-button"
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
    <div className="min-h-screen bg-violet-25 text-violet-900">
      <header className="border-b border-violet-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-2 text-xs text-violet-400 mb-6">
            <span onClick={handleGoBack} className="hover:text-violet-600 cursor-pointer">
              Dashboard
            </span>
            <span>/</span>
            <span className="text-violet-700 font-medium">{course.title}</span>
          </div>

          <div className="s-card mb-6 flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-violet-100 flex items-center justify-center flex-shrink-0">
              <span className="text-2xl font-bold text-violet-600">
                {(course.title || 'C')[0]}
              </span>
            </div>
            <div className="flex-1">
              <h1 className="text-xl font-semibold text-violet-900">{course.title}</h1>
              {course.description && (
                <p className="mt-1 text-sm text-violet-400 max-w-2xl">{course.description}</p>
              )}
              <div className="s-progress-track mt-2">
                <div className="s-progress-fill" style={{ width: `${progressPercent}%` }} />
              </div>
              <div className="flex justify-between mt-1">
                <span className="text-xs text-violet-400">
                  {completedLessons.length} of {lessons.length} lessons
                </span>
                <span className="text-xs font-medium text-violet-600">{progressPercent}%</span>
              </div>
            </div>
            {progressError && (
              <p className="mt-3 text-xs text-red-600">
                Error loading progress: {progressError}
              </p>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-violet-400">
              Lessons
            </p>
            <h2 className="text-lg font-semibold text-violet-900 mt-1">
              Work through each step at your own pace
            </h2>
          </div>
        </div>

        {progressLoading ? (
          <div className="flex justify-center py-10">
            <span className="h-6 w-6 border-4 border-violet-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : lessons.length === 0 ? (
          <div className="s-card text-center">
            <p className="text-sm font-medium text-violet-900 mb-1">
              No lessons available
            </p>
            <p className="text-xs text-violet-400">
              Ask an administrator to add lessons to this course.
            </p>
          </div>
        ) : (
          <div className="rounded-2xl bg-white border border-violet-100 divide-y divide-violet-100">
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
