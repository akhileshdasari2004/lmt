import { useProgress } from '../hooks/useProgress';
import { useAuth } from '../hooks/useAuth';
import CourseCard from '../components/CourseCard';
import Sidebar from '../components/Sidebar';
import { useEffect, useMemo, useState } from 'react';
import {
  getAllCourses,
  createSubjectRequest,
  getStudentAssignments,
  getStudentRequests,
} from '../services/firestoreService';

const Dashboard = () => {
  const { user } = useAuth();
  const [allCourses, setAllCourses] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [coursesLoading, setCoursesLoading] = useState(true);
  const [requests, setRequests] = useState([]);
  const [submittingRequestFor, setSubmittingRequestFor] = useState('');
  const [requestError, setRequestError] = useState('');
  const [requestSuccess, setRequestSuccess] = useState('');

  useEffect(() => {
    let unsubscribeAssignments = null;
    let unsubscribeRequests = null;
    const loadCourses = async () => {
      try {
        setCoursesLoading(true);
        const data = await getAllCourses();
        setAllCourses(data);
      } catch (err) {
        console.error('Error loading courses:', err);
      } finally {
        setCoursesLoading(false);
      }
    };

    if (user?.uid) {
      loadCourses();
      unsubscribeAssignments = getStudentAssignments(user.uid, setAssignments);
      unsubscribeRequests = getStudentRequests(user.uid, setRequests);
    }

    return () => {
      if (unsubscribeAssignments) unsubscribeAssignments();
      if (unsubscribeRequests) unsubscribeRequests();
    };
  }, [user?.uid]);

  const assignedCourseMap = useMemo(() => {
    const map = {};
    assignments.forEach((item) => {
      if (!map[item.courseId]) {
        map[item.courseId] = {
          id: item.courseId,
          title: item.courseTitle || 'Untitled Course',
          lessons: [],
          assignmentType: item.assignmentType || 'lesson',
        };
      }

      if (item.assignmentType === 'subject' || item.lessonId == null) {
        map[item.courseId].assignmentType = 'subject';
      } else {
        map[item.courseId].lessons.push({
          id: item.lessonId,
          title: item.lessonTitle || 'Untitled Lesson',
        });
      }
    });
    return map;
  }, [assignments]);

  const courses = useMemo(() => {
    const result = Object.values(assignedCourseMap);
    return result.map((assignedCourse) => {
      const sourceCourse = allCourses.find((c) => c.id === assignedCourse.id);
      const lessons =
        assignedCourse.assignmentType === 'subject'
          ? sourceCourse?.lessons || []
          : assignedCourse.lessons;
      return {
        ...sourceCourse,
        ...assignedCourse,
        lessons,
      };
    });
  }, [assignedCourseMap, allCourses]);

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

  const approvedRequests = useMemo(
    () => requests.filter((r) => r.status === 'approved'),
    [requests],
  );

  const pendingRequests = useMemo(
    () => requests.filter((r) => r.status === 'pending'),
    [requests],
  );

  const blockedRequestCourseIds = useMemo(() => {
    const set = new Set();
    requests.forEach((r) => {
      if (r.status === 'pending' || r.status === 'approved') {
        set.add(r.courseId);
      }
    });
    return set;
  }, [requests]);

  const requestableCourses = useMemo(() => {
    return allCourses.filter((course) => !blockedRequestCourseIds.has(course.id));
  }, [allCourses, blockedRequestCourseIds]);

  const handleSubjectRequest = async (course) => {
    if (!user?.uid || !course?.id) return;
    if (blockedRequestCourseIds.has(course.id)) return;

    try {
      setSubmittingRequestFor(course.id);
      setRequestError('');
      setRequestSuccess('');

      await createSubjectRequest(
        user.uid,
        user.email || '',
        user.displayName || user.email || 'Student',
        course.id,
        course.title || 'Untitled Course',
      );

      setRequestSuccess(`Request sent for "${course.title || 'Untitled Course'}".`);
    } catch (err) {
      setRequestError(err.message || 'Failed to request subject.');
    } finally {
      setSubmittingRequestFor('');
    }
  };

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
                Total assigned lessons
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
                  No lessons assigned yet
                </p>
                <p className="text-xs text-text-secondary">
                  Once an admin assigns lessons, they will appear here automatically.
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

          {/* Approved Requests */}
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-text-muted">
                  Approved requests
                </p>
                <h2 className="text-lg font-semibold text-text-primary mt-1">
                  Subjects approved by admin
                </h2>
              </div>
            </div>

            {approvedRequests.length === 0 ? (
              <div className="rounded-2xl bg-surface-card border border-surface-border px-6 py-6 text-center">
                <p className="text-sm font-medium text-text-primary mb-1">
                  No approved requests yet
                </p>
                <p className="text-xs text-text-secondary">
                  Once an admin approves your subject requests, they will show up here.
                </p>
              </div>
            ) : (
              <div className="rounded-2xl bg-surface-card border border-surface-border divide-y divide-surface-border">
                {approvedRequests.map((req) => (
                  <div key={req.requestId} className="px-4 py-3 flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-medium text-text-primary">
                        {req.courseTitle || 'Untitled Subject'}
                      </p>
                      <p className="text-xs text-text-muted">
                        Approved request
                      </p>
                    </div>
                    <span className="inline-flex items-center rounded-full bg-success/15 px-3 py-1 text-[11px] font-semibold text-success">
                      Approved
                    </span>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Pending Requests */}
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-text-muted">
                  Pending requests
                </p>
                <h2 className="text-lg font-semibold text-text-primary mt-1">
                  Waiting for admin review
                </h2>
              </div>
            </div>

            {pendingRequests.length === 0 ? (
              <div className="rounded-2xl bg-surface-card border border-surface-border px-6 py-6 text-center">
                <p className="text-sm font-medium text-text-primary mb-1">
                  No pending requests
                </p>
                <p className="text-xs text-text-secondary">
                  You can request new subjects from the pending screen before approval.
                </p>
              </div>
            ) : (
              <div className="rounded-2xl bg-surface-card border border-surface-border divide-y divide-surface-border">
                {pendingRequests.map((req) => (
                  <div key={req.requestId} className="px-4 py-3 flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-medium text-text-primary">
                        {req.courseTitle || 'Untitled Subject'}
                      </p>
                      <p className="text-xs text-text-muted">
                        Pending approval
                      </p>
                    </div>
                    <span className="inline-flex items-center rounded-full bg-warning/15 px-3 py-1 text-[11px] font-semibold text-warning">
                      Pending
                    </span>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Request Subjects */}
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-text-muted">
                  Request subjects
                </p>
                <h2 className="text-lg font-semibold text-text-primary mt-1">
                  Ask admin to map new subjects
                </h2>
              </div>
            </div>

            {requestError && (
              <div className="rounded-xl border border-danger/30 bg-danger/10 px-4 py-3">
                <p className="text-sm text-danger">{requestError}</p>
              </div>
            )}
            {requestSuccess && (
              <div className="rounded-xl border border-success/30 bg-success/10 px-4 py-3">
                <p className="text-sm text-success">{requestSuccess}</p>
              </div>
            )}

            {coursesLoading ? (
              <div className="rounded-2xl bg-surface-card border border-surface-border px-6 py-8 text-center">
                <p className="text-sm text-text-secondary">Loading available subjects...</p>
              </div>
            ) : requestableCourses.length === 0 ? (
              <div className="rounded-2xl bg-surface-card border border-surface-border px-6 py-8 text-center">
                <p className="text-sm font-medium text-text-primary mb-1">
                  No new subjects available to request
                </p>
                <p className="text-xs text-text-secondary">
                  You already have pending/approved requests for all current subjects.
                </p>
              </div>
            ) : (
              <div className="rounded-2xl bg-surface-card border border-surface-border divide-y divide-surface-border">
                {requestableCourses.map((course) => (
                  <div
                    key={course.id}
                    className="px-4 py-3 flex items-center justify-between gap-3"
                  >
                    <div>
                      <p className="text-sm font-medium text-text-primary">
                        {course.title || 'Untitled Subject'}
                      </p>
                      <p className="text-xs text-text-muted">
                        {(course.lessons || []).length} lessons
                      </p>
                    </div>
                    <button
                      onClick={() => handleSubjectRequest(course)}
                      disabled={submittingRequestFor === course.id}
                      className="rounded-lg px-3 py-1.5 text-xs font-semibold bg-brand-500 text-white disabled:opacity-60 hover:bg-brand-600"
                    >
                      {submittingRequestFor === course.id ? 'Requesting...' : 'Request Subject'}
                    </button>
                  </div>
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
      userId={userId}
    />
  );
};

export default Dashboard;
