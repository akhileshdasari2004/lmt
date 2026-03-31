import { Link } from 'react-router-dom';

const CourseCard = ({ course, progress = 0, loading = false }) => {
  const lessonCount = course.lessons?.length || 0;

  return (
    <Link
      to={`/course/${course.id}`}
      className="course-card"
    >
      <h3 className="course-card-title">{course.title}</h3>

      <div className="course-card-info">
        <span>{lessonCount} {lessonCount === 1 ? 'lesson' : 'lessons'}</span>
        <span className="course-card-progress-label">
          {loading ? (
            <span className="inline-flex items-center gap-1">
              <div className="w-3 h-3 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              <span>Loading...</span>
            </span>
          ) : (
            `${progress}%`
          )}
        </span>
      </div>

      {/* Progress Bar */}
      <div className="course-card-progress-bar">
        <div
          className="course-card-progress-fill"
          style={{ 
            width: `${progress}%`,
            opacity: loading ? 0.6 : 1,
          }}
        ></div>
      </div>
    </Link>
  );
};

export default CourseCard;
