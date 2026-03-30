import { Link } from 'react-router-dom';

const CourseCard = ({ course, progress = 0 }) => {
  const lessonCount = course.lessons?.length || 0;

  return (
    <Link
      to={`/course/${course.id}`}
      className="course-card"
    >
      <h3 className="course-card-title">{course.title}</h3>

      <div className="course-card-info">
        <span>{lessonCount} {lessonCount === 1 ? 'lesson' : 'lessons'}</span>
        <span className="course-card-progress-label">{progress}%</span>
      </div>

      {/* Progress Bar */}
      <div className="course-card-progress-bar">
        <div
          className="course-card-progress-fill"
          style={{ width: `${progress}%` }}
        ></div>
      </div>
    </Link>
  );
};

export default CourseCard;
