const SkeletonText = ({ className = '' }) => (
  <div className={`space-y-3 ${className}`}>
    <div className="h-4 w-3/4 rounded skeleton-shimmer" />
    <div className="h-4 w-full rounded skeleton-shimmer" />
    <div className="h-4 w-5/6 rounded skeleton-shimmer" />
  </div>
);

const SkeletonCard = ({ className = '' }) => (
  <div className={`bg-white rounded-2xl border border-surface-200 p-6 space-y-4 ${className}`}>
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 rounded-lg skeleton-shimmer" />
      <div className="flex-1 space-y-2">
        <div className="h-4 w-1/3 rounded skeleton-shimmer" />
        <div className="h-3 w-1/2 rounded skeleton-shimmer" />
      </div>
    </div>
    <div className="space-y-2">
      <div className="h-3 w-full rounded skeleton-shimmer" />
      <div className="h-3 w-4/5 rounded skeleton-shimmer" />
    </div>
  </div>
);

const SkeletonTableRow = ({ columns = 4, className = '' }) => (
  <div className={`flex items-center gap-4 px-5 py-4 border-b border-surface-100 ${className}`}>
    {Array.from({ length: columns }).map((_, i) => (
      <div
        key={i}
        className="h-4 rounded skeleton-shimmer"
        style={{ width: `${20 + Math.random() * 15}%` }}
      />
    ))}
  </div>
);

const SkeletonCircle = ({ className = '' }) => (
  <div className={`flex items-center gap-3 ${className}`}>
    <div className="w-12 h-12 rounded-full skeleton-shimmer flex-shrink-0" />
    <div className="flex-1 space-y-2">
      <div className="h-4 w-2/5 rounded skeleton-shimmer" />
      <div className="h-3 w-3/5 rounded skeleton-shimmer" />
    </div>
  </div>
);

const SkeletonStats = ({ className = '' }) => (
  <div className={`bg-white rounded-2xl border border-surface-200 p-5 ${className}`}>
    <div className="flex items-start justify-between mb-3">
      <div className="w-10 h-10 rounded-lg skeleton-shimmer" />
      <div className="w-14 h-5 rounded-full skeleton-shimmer" />
    </div>
    <div className="space-y-2">
      <div className="h-3 w-1/2 rounded skeleton-shimmer" />
      <div className="h-6 w-1/3 rounded skeleton-shimmer" />
    </div>
  </div>
);

const variantMap = {
  text: SkeletonText,
  card: SkeletonCard,
  'table-row': SkeletonTableRow,
  circle: SkeletonCircle,
  stats: SkeletonStats,
};

const Skeleton = ({ variant = 'text', count = 1, className = '' }) => {
  const Component = variantMap[variant] || SkeletonText;

  return (
    <div className={`space-y-3 ${className}`}>
      {Array.from({ length: count }).map((_, i) => (
        <Component key={i} />
      ))}
    </div>
  );
};

Skeleton.displayName = 'Skeleton';
export default Skeleton;
