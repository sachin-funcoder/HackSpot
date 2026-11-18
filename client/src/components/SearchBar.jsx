function SearchBar({
  id = 'hackathon-search',
  value,
  onChange,
  onSubmit,
  onClear,
  placeholder = 'Search by title, organizer, skill, or topic...',
}) {
  function handleFormSubmit(event) {
    event.preventDefault();
    if (onSubmit) {
      onSubmit(value);
    }
  }

  return (
    <form className="search-bar" onSubmit={handleFormSubmit} role="search">
      <label htmlFor={id} className="sr-only">
        Search hackathons
      </label>
      <span className="search-bar__icon" aria-hidden="true">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="11" cy="11" r="7" />
          <path d="M20 20l-3.5-3.5" strokeLinecap="round" />
        </svg>
      </span>
      <input
        id={id}
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="search-bar__input"
      />
      {value && onClear && (
        <button
          type="button"
          className="search-bar__clear"
          onClick={onClear}
          aria-label="Clear search"
        >
          &times;
        </button>
      )}
      <button type="submit" className="btn btn--primary btn--sm search-bar__submit">
        Search
      </button>
    </form>
  );
}

export default SearchBar;
