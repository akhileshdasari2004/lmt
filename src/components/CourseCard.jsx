import { Link } from 'react-router-dom';

const gradients = [
  'from-violet-600 to-indigo-600',
  'from-cyan-500 to-blue-600',
  'from-emerald-500 to-teal-600',
  'from-orange-500 to-rose-500',
  'from-pink-500 to-fuchsia-600',
];

const CourseCard = ({ course, progress = 0, loading = false, index = 0, userId }) => {
  const lessonCount = course.lessons?.length || 0;
  const gradientClass = gradients[index % gradients.length];
  const safeProgress = Number.isFinite(progress) ? Math.min(Math.max(progress, 0), 100) : 0;

  return (
    <Link
      to={`/course/${course.id}`}
      className="group flex flex-col overflow-hidden rounded-2xl bg-surface-card border border-surface-border shadow-[0_4px_24px_rgba(0,0,0,0.4)] hover:shadow-[0_8px_32px_rgba(79,110,247,0.25)] hover:-translate-y-1 transition-all duration-200"
    >
      <div className={`h-24 w-full bg-gradient-to-tr ${gradientClass} relative`}>
        <div className="absolute inset-0 opacity-30 mix-blend-soft-light bg-[radial-gradient(circle_at_20%_20%,white,transparent_50%),radial-gradient(circle_at_80%_0,white,transparent_50%)]" />
        <div className="relative h-full w-full flex items-end justify-between px-4 pb-3">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-widest text-white/70">
              {course.category || 'Course'}
            </p>
            <p className="text-xs text-white/80">
              {lessonCount} {lessonCount === 1 ? 'lesson' : 'lessons'}
            </p>
          </div>
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-black/25 text-white text-lg font-semibold">
            📘
          </div>
        </div>
      </div>

      <div className="flex flex-1 flex-col px-4 pt-4 pb-4">
        <h3 className="text-sm font-semibold text-text-primary line-clamp-2 mb-2">
          {course.title}
        </h3>

        <p className="text-xs text-text-secondary mb-4 line-clamp-2">
          {course.description || 'No description provided yet.'}
        </p>

        <div className="mt-auto space-y-2">
          <div className="flex items-center justify-between text-[11px] text-text-muted">
            <span>{loading ? 'Calculating progress…' : 'Progress'}</span>
            <span className="font-semibold text-text-secondary">
              {loading ? (
                <span className="inline-flex items-center gap-1">
                  <span className="h-3 w-3 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
                  <span>Loading</span>
                </span>
              ) : (
                `${safeProgress}%`
              )}
            </span>
          </div>

          <div className="h-1.5 w-full rounded-full bg-surface-muted overflow-hidden">
            <div
              className="h-full rounded-full bg-brand-500 transition-all duration-300"
              style={{
                width: `${safeProgress}%`,
                opacity: loading ? 0.6 : 1,
              }}
            />
          </div>

          <div className="mt-2 flex items-center justify-between">
            <button
              type="button"
              className="inline-flex items-center gap-1 rounded-lg bg-brand-500 px-3 py-1 text-[11px] font-semibold text-white shadow-sm group-hover:bg-brand-600 transition-colors"
            >
              Continue
              <span className="text-xs">→</span>
            </button>
            <span className="text-[11px] text-text-muted">
              {lessonCount === 0 ? 'No lessons yet' : 'Jump back in'}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default CourseCard;
