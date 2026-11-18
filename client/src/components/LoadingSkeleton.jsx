function LoadingSkeleton({ count = 6, variant = 'cards' }) {
  if (variant === 'detail') {
    return (
      <div className="skeleton-detail" aria-busy="true" aria-label="Loading hackathon details">
        <div className="skeleton-box skeleton-detail__banner" />
        <div className="skeleton-detail__body">
          <div className="skeleton-line skeleton-line--sm" />
          <div className="skeleton-line skeleton-line--lg" />
          <div className="skeleton-line skeleton-line--md" />
          <div className="skeleton-line skeleton-line--full" />
          <div className="skeleton-line skeleton-line--full" />
        </div>
      </div>
    );
  }

  return (
    <div className="hackathon-grid" aria-busy="true" aria-label="Loading hackathons">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="skeleton-card">
          <div className="skeleton-box skeleton-card__banner" />
          <div className="skeleton-card__content">
            <div className="skeleton-line skeleton-line--sm" />
            <div className="skeleton-line skeleton-line--lg" />
            <div className="skeleton-line skeleton-line--full" />
            <div className="skeleton-line skeleton-line--md" />
            <div className="skeleton-card__footer">
              <div className="skeleton-line skeleton-line--sm" />
              <div className="skeleton-box skeleton-card__btn" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default LoadingSkeleton;
