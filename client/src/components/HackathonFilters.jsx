const MODE_OPTIONS = [
  { value: '', label: 'All modes' },
  { value: 'online', label: 'Online' },
  { value: 'offline', label: 'In-Person' },
  { value: 'hybrid', label: 'Hybrid' },
];

const STATUS_OPTIONS = [
  { value: '', label: 'All statuses' },
  { value: 'upcoming', label: 'Upcoming' },
  { value: 'ongoing', label: 'Live Now' },
  { value: 'completed', label: 'Completed' },
];

const SORT_OPTIONS = [
  { value: 'upcoming', label: 'Upcoming Date' },
  { value: 'deadline', label: 'Registration Deadline' },
  { value: 'newest', label: 'Recently Added' },
];

function HackathonFilters({
  filters,
  categories = [],
  onFilterChange,
  onReset,
  hasActiveFilters = false,
}) {
  return (
    <div className="filter-bar">
      <div className="filter-bar__controls">
        <div className="filter-group">
          <label htmlFor="filter-category" className="filter-group__label">
            Category
          </label>
          <select
            id="filter-category"
            className="filter-select"
            value={filters.category}
            onChange={(event) => onFilterChange('category', event.target.value)}
          >
            <option value="">All categories</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label htmlFor="filter-mode" className="filter-group__label">
            Mode
          </label>
          <select
            id="filter-mode"
            className="filter-select"
            value={filters.mode}
            onChange={(event) => onFilterChange('mode', event.target.value)}
          >
            {MODE_OPTIONS.map((opt) => (
              <option key={opt.value || 'all'} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label htmlFor="filter-status" className="filter-group__label">
            Status
          </label>
          <select
            id="filter-status"
            className="filter-select"
            value={filters.status}
            onChange={(event) => onFilterChange('status', event.target.value)}
          >
            {STATUS_OPTIONS.map((opt) => (
              <option key={opt.value || 'all'} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label htmlFor="filter-skills" className="filter-group__label">
            Skill
          </label>
          <input
            id="filter-skills"
            type="text"
            className="filter-select"
            value={filters.skills}
            onChange={(event) => onFilterChange('skills', event.target.value)}
            placeholder="e.g. React, Python"
          />
        </div>

        <div className="filter-group">
          <label htmlFor="filter-sort" className="filter-group__label">
            Sort by
          </label>
          <select
            id="filter-sort"
            className="filter-select"
            value={filters.sort}
            onChange={(event) => onFilterChange('sort', event.target.value)}
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {hasActiveFilters && (
        <div className="filter-bar__actions">
          <button type="button" className="btn btn--ghost btn--sm" onClick={onReset}>
            Reset filters
          </button>
        </div>
      )}
    </div>
  );
}

export default HackathonFilters;
