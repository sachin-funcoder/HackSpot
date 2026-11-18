function EmptyState({
  title = 'No results found',
  description = 'Try adjusting your search or filter criteria.',
  actionLabel = '',
  onAction = null,
}) {
  return (
    <div className="empty-state" role="status">
      <div className="empty-state__icon" aria-hidden="true">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
          <circle cx="11" cy="11" r="7" />
          <path d="M20 20l-3.5-3.5" strokeLinecap="round" />
        </svg>
      </div>
      <h3 className="empty-state__title">{title}</h3>
      <p className="empty-state__desc">{description}</p>
      {actionLabel && onAction && (
        <button type="button" className="btn btn--secondary" onClick={onAction}>
          {actionLabel}
        </button>
      )}
    </div>
  );
}

export default EmptyState;
