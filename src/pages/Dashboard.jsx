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
      <div className="min-h-screen flex items-center justify-center bg-violet-25">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-violet-900 mb-2">
            Please log in
          </h2>
          <p className="text-violet-400">
            You need to be logged in to view your dashboard.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-violet-25">
      <Sidebar />

      <main className="flex-1 px-8 py-6 overflow-y-auto">
        {/* Top bar */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-violet-900">
              My Dashboard
            </h1>
            <p className="text-sm text-violet-400 mt-0.5">
              Good to see you, {user.email?.split('@')[0] || 'student'}
            </p>
          </div>

          <div className="w-full md:w-72">
            <div className="relative">
              <input
                type="text"
                placeholder="Search courses (UI only)…"
                className="s-input"
              />
              <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-xs text-violet-300">
                ⌘K
              </span>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="space-y-8">
          {/* Stats row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            <div className="s-stat-card">
              <p className="text-2xl font-bold text-violet-700">{stats.totalCourses}</p>
              <p className="text-xs text-violet-400 mt-1">Courses</p>
            </div>

            <div className="s-stat-card">
              <p className="text-2xl font-bold text-violet-700">{stats.totalLessons}</p>
              <p className="text-xs text-violet-400 mt-1">Lessons assigned</p>
            </div>

            <div className="s-stat-card">
              <p className="text-2xl font-bold text-violet-700">—</p>
              <p className="text-xs text-violet-400 mt-1">Progress</p>
            </div>
          </div>

          {/* Courses */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-violet-400">
                  My courses
                </p>
                <h2 className="text-base font-semibold text-violet-900 mt-1">
                  Continue where you left off
                </h2>
              </div>
            </div>

            {coursesLoading ? (
              <div className="flex items-center justify-center py-16">
                <div className="flex flex-col items-center gap-3">
                  <span className="h-8 w-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" />
                  <p className="text-violet-400 text-sm">
                    Loading courses…
                  </p>
                </div>
              </div>
            ) : courses.length === 0 ? (
              <div className="s-card text-center">
                <p className="text-sm font-medium text-violet-900 mb-1">
                  No lessons assigned yet
                </p>
                <p className="text-xs text-violet-400">
                  Once an admin assigns lessons, they will appear here automatically.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
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
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-violet-400">
                  Approved requests
                </p>
                <h2 className="text-base font-semibold text-violet-900 mt-1">
                  Subjects approved by admin
                </h2>
              </div>
            </div>

            {approvedRequests.length === 0 ? (
              <div className="s-card text-center">
                <p className="text-sm font-medium text-violet-900 mb-1">
                  No approved requests yet
                </p>
                <p className="text-xs text-violet-400">
                  Once an admin approves your subject requests, they will show up here.
                </p>
              </div>
            ) : (
              <div className="s-card divide-y divide-violet-100">
                {approvedRequests.map((req) => (
                  <div key={req.requestId} className="px-4 py-3 flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-medium text-violet-900">
                        {req.courseTitle || 'Untitled Subject'}
                      </p>
                      <p className="text-xs text-violet-400">
                        Approved request
                      </p>
                    </div>
                    <span className="s-badge-approved">
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
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-violet-400">
                  Pending requests
                </p>
                <h2 className="text-base font-semibold text-violet-900 mt-1">
                  Waiting for admin review
                </h2>
              </div>
            </div>

            {pendingRequests.length === 0 ? (
              <div className="s-card text-center">
                <p className="text-sm font-medium text-violet-900 mb-1">
                  No pending requests
                </p>
                <p className="text-xs text-violet-400">
                  You can request new subjects from the pending screen before approval.
                </p>
              </div>
            ) : (
              <div className="s-card divide-y divide-violet-100">
                {pendingRequests.map((req) => (
                  <div key={req.requestId} className="px-4 py-3 flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-medium text-violet-900">
                        {req.courseTitle || 'Untitled Subject'}
                      </p>
                      <p className="text-xs text-violet-400">
                        Pending approval
                      </p>
                    </div>
                    <span className="s-badge-pending">
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
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-violet-400">
                  Request subjects
                </p>
                <h2 className="text-base font-semibold text-violet-900 mt-1">
                  Ask admin to map new subjects
                </h2>
              </div>
            </div>

            {requestError && (
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3">
                <p className="text-sm text-red-600">{requestError}</p>
              </div>
            )}
            {requestSuccess && (
              <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3">
                <p className="text-sm text-emerald-700">{requestSuccess}</p>
              </div>
            )}

            {coursesLoading ? (
              <div className="s-card text-center">
                <p className="text-sm text-violet-400">Loading available subjects...</p>
              </div>
            ) : requestableCourses.length === 0 ? (
              <div className="s-card text-center">
                <p className="text-sm font-medium text-violet-900 mb-1">
                  No new subjects available to request
                </p>
                <p className="text-xs text-violet-400">
                  You already have pending/approved requests for all current subjects.
                </p>
              </div>
            ) : (
              <div className="s-card divide-y divide-violet-100">
                {requestableCourses.map((course) => (
                  <div
                    key={course.id}
                    className="px-4 py-3 flex items-center justify-between gap-3"
                  >
                    <div>
                      <p className="text-sm font-medium text-violet-900">
                        {course.title || 'Untitled Subject'}
                      </p>
                      <p className="text-xs text-violet-400">
                        {(course.lessons || []).length} lessons
                      </p>
                    </div>
                    <button
                      onClick={() => handleSubjectRequest(course)}
                      disabled={submittingRequestFor === course.id}
                      className="s-button text-xs px-3 py-1.5 disabled:opacity-60"
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
