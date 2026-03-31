import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import {
  createSubjectRequest,
  getAllCourses,
  getStudentRequests,
} from '../services/firestoreService';

const PendingApproval = () => {
  const { user, logOut } = useAuth();
  const [courses, setCourses] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loadingCourses, setLoadingCourses] = useState(true);
  const [submitting, setSubmitting] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    let unsubscribe = null;

    const load = async () => {
      try {
        setLoadingCourses(true);
        setError('');
        const courseData = await getAllCourses();
        setCourses(courseData);
      } catch (err) {
        setError(err.message || 'Failed to load courses');
      } finally {
        setLoadingCourses(false);
      }
    };

    if (user?.uid) {
      load();
      unsubscribe = getStudentRequests(user.uid, setRequests);
    }

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [user?.uid]);

  const requestedKeys = useMemo(() => {
    const set = new Set();
    requests.forEach((r) => set.add(r.courseId));
    return set;
  }, [requests]);

  const handleRequest = async (course) => {
    if (!user?.uid) return;
    const key = course.id;
    if (requestedKeys.has(key)) return;

    try {
      setSubmitting(key);
      setError('');
      setSuccess('');
      await createSubjectRequest(
        user.uid,
        user.email || '',
        user.displayName || user.email || 'Student',
        course.id,
        course.title || 'Untitled Course',
      );
      setSuccess('Subject request sent successfully.');
    } catch (err) {
      setError(err.message || 'Failed to submit request');
    } finally {
      setSubmitting('');
    }
  };

  return (
    <div className="s-page">
      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="text-center mb-10">
          <div className="w-16 h-16 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">⏳</span>
          </div>
          <h1 className="text-2xl font-semibold text-violet-900">Awaiting Approval</h1>
          <p className="text-sm text-violet-400 mt-2 max-w-sm mx-auto">
            Your account is under review. Browse courses and request lessons below.
          </p>
          <button onClick={logOut} className="s-button-ghost mt-4">Logout</button>
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2 mb-8">
          {requests.map((request) => (
            <div key={request.requestId} className="flex-shrink-0 bg-white border border-violet-100 rounded-xl px-3 py-2 flex items-center gap-2">
              <span className="text-xs text-violet-700 font-medium">{request.courseTitle}</span>
              {request.status === 'approved' ? (
                <span className="s-badge-approved">Approved</span>
              ) : request.status === 'rejected' ? (
                <span className="s-badge-rejected">Rejected</span>
              ) : (
                <span className="s-badge-pending">Pending</span>
              )}
            </div>
          ))}
        </div>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-base font-semibold text-violet-900 mb-4 flex items-center gap-2">
            Available Courses
            <span className="w-5 h-0.5 bg-violet-200 rounded"></span>
          </h2>
          {error && <p className="text-sm text-red-600">{error}</p>}
          {success && <p className="text-sm text-emerald-700">{success}</p>}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {loadingCourses ? (
            <div className="col-span-full py-12 flex items-center justify-center">
              <div className="w-8 h-8 border-4 border-violet-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            courses.map((course) => (
              <div key={course.id} className="s-card cursor-pointer">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-violet-100 flex items-center justify-center">
                      <span className="text-violet-600 text-sm font-bold">
                        {(course.title || 'C')[0]}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-violet-900">{course.title}</p>
                      <p className="text-xs text-violet-400">
                        {(course.lessons || []).length} lessons
                      </p>
                    </div>
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t border-violet-100">
                  <div className="flex items-center justify-between py-1.5">
                    <span className="text-sm text-violet-700">Request this subject</span>
                    <button
                      onClick={() => handleRequest(course)}
                      disabled={requestedKeys.has(course.id) || submitting === course.id}
                      className="s-button-ghost text-xs px-3 py-1 disabled:opacity-60"
                    >
                      {requestedKeys.has(course.id)
                        ? 'Requested'
                        : submitting === course.id
                        ? 'Requesting...'
                        : 'Request'}
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default PendingApproval;

