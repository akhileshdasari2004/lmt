import { Link } from 'react-router-dom';

const CourseCard = ({ course, progress = 0 }) => {
  const lessonCount = course.lessons?.length || 0;

  return (
    <Link
      to={`/course/${course.id}`}
      className="block bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-6 border border-gray-200"
    >
      <h3 className="text-xl font-bold text-gray-900 mb-2">{course.title}</h3>

      <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
        <span>{lessonCount} {lessonCount === 1 ? 'lesson' : 'lessons'}</span>
        <span className="font-medium">{progress}%</span>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-gray-200 rounded-full h-2.5">
        <div
          className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
          style={{ width: `${progress}%` }}
        ></div>
      </div>
    </Link>
  );
};

export default CourseCard;
