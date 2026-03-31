import { Link } from 'react-router-dom';

const CourseCard = ({ course, progress = 0, loading = false }) => {
  const lessonCount = course.lessons?.length || 0;
  const safeProgress = Number.isFinite(progress) ? Math.min(Math.max(progress, 0), 100) : 0;

  return (
    <Link
      to={`/course/${course.id}`}
      className="s-card cursor-pointer group"
    >
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-violet-100 flex items-center justify-center flex-shrink-0">
          <span className="text-violet-600 font-bold">
            {(course.title || 'C')[0]}
          </span>
        </div>
        <div>
          <h3 className="text-sm font-semibold text-violet-900 group-hover:text-violet-600 transition-colors">
            {course.title}
          </h3>
          <p className="text-xs text-violet-400 mt-0.5">
            {lessonCount} lessons assigned
          </p>
        </div>
      </div>

      <div className="s-progress-track">
        <div
          className="s-progress-fill"
          style={{
            width: `${safeProgress}%`,
            opacity: loading ? 0.6 : 1,
          }}
        />
      </div>
      <div className="flex justify-between mt-1.5">
        <span className="text-xs text-violet-400">
          {loading ? 'Calculating...' : `${Math.round((safeProgress * lessonCount) / 100)} of ${lessonCount} done`}
        </span>
        <span className="text-xs font-medium text-violet-600">
          {safeProgress}%
        </span>
      </div>
      {course.description && (
        <p className="text-xs text-violet-400 mt-3 line-clamp-2">
          {course.description}
        </p>
      )}
      <div className="mt-3">
        <span className="inline-flex items-center text-xs text-violet-600 font-medium">
          Continue →
        </span>
      </div>
    </Link>
  );
};

export default CourseCard;
