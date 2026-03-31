import { useCourses } from '../hooks/useCourses';
import { useProgress } from '../hooks/useProgress';
import { useAuth } from '../hooks/useAuth';
import CourseCard from '../components/CourseCard';
import Sidebar from '../components/Sidebar';
import { useEffect, useMemo } from 'react';

const Dashboard = () => {
  const { user } = useAuth();
  const { courses, loading: coursesLoading } = useCourses();

  useEffect(() => {
    console.log('Dashboard mounted/updated. User:', user?.uid);
  }, [user?.uid, courses.length]);

  const stats = useMemo(() => {
    const totalCourses = courses.length;
    let totalLessons = 0;
    courses.forEach((course) => {
      totalLessons += course.lessons?.length || 0;
    });

    return {
      totalCourses,
      totalLessons,
    };
  }, [courses]);

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-text-primary mb-2">
            Please log in
          </h2>
          <p className="text-text-secondary">
            You need to be logged in to view your dashboard.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface text-text-primary flex">
      <Sidebar />

      <main className="flex-1 flex flex-col">
        {/* Top bar */}
        <div className="px-4 md:px-8 lg:px-12 py-6 border-b border-surface-border flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-text-muted mb-1">
              Dashboard
            </p>
            <h1 className="text-2xl font-semibold tracking-tight text-text-primary">
              Good to see you, {user.email?.split('@')[0] || 'student'}
            </h1>
            <p className="text-xs text-text-secondary mt-1">
              Track your learning progress across all active courses.
            </p>
          </div>

          <div className="w-full md:w-72">
            <div className="relative">
              <input
                type="text"
                placeholder="Search courses (UI only)…"
                className="w-full rounded-xl border border-surface-border bg-surface px-4 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
              />
              <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-xs text-text-muted">
                ⌘K
              </span>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="px-4 md:px-8 lg:px-12 py-6 space-y-8">
          {/* Stats row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="rounded-2xl bg-surface-card border border-surface-border px-4 py-4 shadow-[0_4px_24px_rgba(0,0,0,0.4)]">
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-text-muted mb-2">
                Courses
              </p>
              <p className="text-2xl font-semibold text-text-primary">
                {stats.totalCourses}
              </p>
              <p className="text-xs text-text-secondary mt-1">
                Enrolled courses
              </p>
            </div>

            <div className="rounded-2xl bg-surface-card border border-surface-border px-4 py-4 shadow-[0_4px_24px_rgba(0,0,0,0.4)]">
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-text-muted mb-2">
                Lessons
              </p>
              <p className="text-2xl font-semibold text-text-primary">
                {stats.totalLessons}
              </p>
              <p className="text-xs text-text-secondary mt-1">
                Total lessons available
              </p>
            </div>

            <div className="rounded-2xl bg-surface-card border border-surface-border px-4 py-4 shadow-[0_4px_24px_rgba(0,0,0,0.4)]">
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-text-muted mb-2">
                Overall progress
              </p>
              <p className="text-2xl font-semibold text-text-primary">
                {/* Individual card shows accurate %; here we show placeholder */}
                —
              </p>
              <p className="text-xs text-text-secondary mt-1">
                Per-course cards show detailed progress
              </p>
            </div>
          </div>

          {/* Courses */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-text-muted">
                  My courses
                </p>
                <h2 className="text-lg font-semibold text-text-primary mt-1">
                  Continue where you left off
                </h2>
              </div>
            </div>

            {coursesLoading ? (
              <div className="flex items-center justify-center py-16">
                <div className="flex flex-col items-center gap-3">
                  <span className="h-8 w-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" />
                  <p className="text-text-secondary text-sm">
                    Loading courses…
                  </p>
                </div>
              </div>
            ) : courses.length === 0 ? (
              <div className="rounded-2xl bg-surface-card border border-dashed border-surface-border px-6 py-10 text-center">
                <p className="text-sm font-medium text-text-primary mb-1">
                  No courses yet
                </p>
                <p className="text-xs text-text-secondary">
                  Add courses to your Firestore database to see them here.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {courses.map((course, index) => (
                  <CourseCardWithProgress
                    key={course.id}
                    course={course}
                    userId={user.uid}
                    index={index}
                  />
                ))}
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
};

// Wrapper component to get progress for each course
const CourseCardWithProgress = ({ course, userId, index }) => {
  const { calculateProgress, loading, error } = useProgress(userId, course.id);
  const progress = calculateProgress(course.lessons || []);

  if (error) {
    console.error('Progress error for course', course.id, error);
  }

  return (
    <CourseCard
      course={course}
      progress={progress}
      loading={loading}
      index={index}
    />
  );
};

export default Dashboard;
