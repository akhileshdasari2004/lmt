import { useCourses } from '../hooks/useCourses';
import { useProgress } from '../hooks/useProgress';
import { useAuth } from '../hooks/useAuth';
import CourseCard from '../components/CourseCard';
import { useEffect } from 'react';

const Dashboard = () => {
  const { user } = useAuth();
  const { courses, loading: coursesLoading } = useCourses();

  useEffect(() => {
    console.log('Dashboard mounted/updated. User:', user?.uid);
  }, [user?.uid, courses.length]);

  if (coursesLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-gray-600">Loading courses...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Please log in</h2>
          <p className="text-gray-600">You need to be logged in to view courses.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1">
      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-900">Your Courses</h2>
          <p className="text-sm text-gray-600">
            {courses.length} {courses.length === 1 ? 'course' : 'courses'} available
          </p>
        </div>

        {courses.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
              />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No courses</h3>
            <p className="mt-1 text-sm text-gray-500">Get started by adding courses to your Firestore database.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course) => (
              <CourseCardWithProgress
                key={course.id}
                course={course}
                userId={user.uid}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

// Wrapper component to get progress for each course
const CourseCardWithProgress = ({ course, userId }) => {
  const { calculateProgress, loading, error } = useProgress(userId, course.id);
  const progress = calculateProgress(course.lessons || []);

  if (error) {
    console.error('Progress error for course', course.id, error);
  }

  return <CourseCard course={course} progress={progress} loading={loading} />;
};

export default Dashboard;
