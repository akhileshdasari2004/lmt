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
    <div className="min-h-screen bg-surface text-text-primary px-4 md:px-8 lg:px-12 py-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="bg-surface-card border border-surface-border rounded-2xl p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-widest font-semibold text-text-muted mb-2">
                Account status
              </p>
              <h1 className="text-2xl font-bold tracking-tight text-text-primary">
                Waiting for admin approval
              </h1>
              <p className="text-sm text-text-secondary mt-2">
                Your account is pending approval. You can request lessons now and an admin
                will assign them once your account is approved.
              </p>
            </div>
            <button
              onClick={logOut}
              className="rounded-xl px-4 py-2 text-sm font-semibold bg-surface border border-surface-border hover:bg-surface-muted/30"
            >
              Logout
            </button>
          </div>
          {error && <p className="mt-4 text-sm text-danger">{error}</p>}
          {success && <p className="mt-4 text-sm text-success">{success}</p>}
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <section className="xl:col-span-2 bg-surface-card border border-surface-border rounded-2xl p-6">
            <h2 className="text-lg font-semibold text-text-primary mb-4">Browse subjects and request access</h2>
            {loadingCourses ? (
              <div className="py-12 flex items-center justify-center">
                <div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : (
              <div className="space-y-5">
                {courses.map((course) => (
                  <div key={course.id} className="rounded-xl border border-surface-border p-4">
                    <h3 className="font-semibold text-text-primary">{course.title}</h3>
                    <p className="text-xs text-text-muted mt-1">
                      {(course.lessons || []).length} lessons
                    </p>
                    <div className="mt-3 rounded-lg bg-surface px-3 py-3 flex items-center justify-between">
                      <span className="text-sm text-text-secondary">
                        Request this subject to unlock it on your dashboard
                      </span>
                      <button
                        onClick={() => handleRequest(course)}
                        disabled={requestedKeys.has(course.id) || submitting === course.id}
                        className="rounded-lg px-3 py-1.5 text-xs font-semibold bg-brand-500 text-white disabled:opacity-60 hover:bg-brand-600"
                      >
                        {requestedKeys.has(course.id)
                          ? 'Requested'
                          : submitting === course.id
                          ? 'Requesting...'
                          : 'Request Subject'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          <aside className="bg-surface-card border border-surface-border rounded-2xl p-6">
            <h2 className="text-lg font-semibold text-text-primary mb-4">Your requests</h2>
            <div className="space-y-2">
              {requests.length === 0 ? (
                <p className="text-sm text-text-secondary">No requests yet.</p>
              ) : (
                requests.map((request) => (
                  <div key={request.requestId} className="rounded-lg border border-surface-border p-3">
                    <p className="text-sm text-text-primary font-medium">
                      {request.courseTitle}
                    </p>
                    <p className="text-xs text-text-muted">{request.courseTitle}</p>
                    <p className="text-xs mt-1 text-warning capitalize">{request.status}</p>
                  </div>
                ))
              )}
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default PendingApproval;

