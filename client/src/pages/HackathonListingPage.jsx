import { useCallback, useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import EmptyState from '../components/EmptyState.jsx';
import HackathonCard from '../components/HackathonCard.jsx';
import HackathonFilters from '../components/HackathonFilters.jsx';
import LoadingSkeleton from '../components/LoadingSkeleton.jsx';
import SearchBar from '../components/SearchBar.jsx';
import useAuth from '../hooks/useAuth.js';
import { extractApiError } from '../services/authService.js';
import { fetchHackathons } from '../services/hackathonService.js';

const PAGE_LIMIT = 9;

function HackathonListingPage() {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  const [searchInput, setSearchInput] = useState(searchParams.get('search') || '');
  const [skillInput, setSkillInput] = useState(searchParams.get('skills') || '');
  const [hackathons, setHackathons] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: PAGE_LIMIT,
    total: 0,
    totalPages: 1,
    hasNextPage: false,
    hasPrevPage: false,
  });
  const [categories, setCategories] = useState([]);
  const [counts, setCounts] = useState({ total: 0, upcoming: 0, ongoing: 0, completed: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const activeFilters = {
    search: searchParams.get('search') || '',
    mode: searchParams.get('mode') || '',
    category: searchParams.get('category') || '',
    status: searchParams.get('status') || '',
    skills: searchParams.get('skills') || '',
    sort: searchParams.get('sort') || 'upcoming',
    page: Number.parseInt(searchParams.get('page') || '1', 10) || 1,
  };

  useEffect(() => {
    setSearchInput(activeFilters.search);
    setSkillInput(activeFilters.skills);
  }, [activeFilters.search, activeFilters.skills]);

  // Debounce skill filter input into URL params
  useEffect(() => {
    if (skillInput === activeFilters.skills) {
      return undefined;
    }

    const timer = setTimeout(() => {
      const next = new URLSearchParams(searchParams);
      if (skillInput.trim()) {
        next.set('skills', skillInput.trim());
      } else {
        next.delete('skills');
      }
      next.delete('page');
      setSearchParams(next, { replace: true });
    }, 350);

    return () => clearTimeout(timer);
  }, [skillInput, activeFilters.skills, searchParams, setSearchParams]);

  const loadHackathons = useCallback(async () => {
    setIsLoading(true);
    setError('');

    try {
      const response = await fetchHackathons({
        search: activeFilters.search,
        mode: activeFilters.mode,
        category: activeFilters.category,
        status: activeFilters.status,
        skills: activeFilters.skills,
        sort: activeFilters.sort,
        page: activeFilters.page,
        limit: PAGE_LIMIT,
      });

      const payload = response?.data || {};
      setHackathons(payload.hackathons || []);
      if (payload.pagination) {
        setPagination(payload.pagination);
      }
      if (payload.meta?.availableCategories) {
        setCategories(payload.meta.availableCategories);
      }
      if (payload.meta?.counts) {
        setCounts(payload.meta.counts);
      }
    } catch (err) {
      const parsed = extractApiError(err, 'Unable to load hackathons right now.');
      setError(parsed.message);
    } finally {
      setIsLoading(false);
    }
  }, [
    activeFilters.search,
    activeFilters.mode,
    activeFilters.category,
    activeFilters.status,
    activeFilters.skills,
    activeFilters.sort,
    activeFilters.page,
  ]);

  useEffect(() => {
    loadHackathons();
  }, [loadHackathons]);

  function updateParam(key, value) {
    const next = new URLSearchParams(searchParams);
    if (value) {
      next.set(key, value);
    } else {
      next.delete(key);
    }
    if (key !== 'page') {
      next.delete('page');
    }
    setSearchParams(next);
  }

  function handleSearchSubmit(query) {
    updateParam('search', query.trim());
  }

  function handleClearSearch() {
    setSearchInput('');
    updateParam('search', '');
  }

  function handleFilterChange(key, value) {
    if (key === 'skills') {
      setSkillInput(value);
      return;
    }
    updateParam(key, value);
  }

  function handleResetFilters() {
    setSearchInput('');
    setSkillInput('');
    setSearchParams({});
  }

  const hasActiveFilters = Boolean(
    activeFilters.search ||
      activeFilters.mode ||
      activeFilters.category ||
      activeFilters.status ||
      activeFilters.skills ||
      activeFilters.sort !== 'upcoming',
  );

  return (
    <div className="page-wrapper">
      <section className="page-hero">
        <div className="container page-hero__inner">
          <div className="page-hero__text">
            <span className="hero-eyebrow">Hackathon Discovery</span>
            <h1 className="page-hero__title">Discover Hackathons Worth Building For</h1>
            <p className="page-hero__subtitle">
              Browse curated online, offline, and hybrid student hackathons. Filter by stack,
              category, and registration deadlines to find your next build weekend.
            </p>
          </div>

          <div className="page-hero__stats">
            <div className="hero-stat-pill">
              <strong>{counts.total}</strong>
              <span>Listed</span>
            </div>
            <div className="hero-stat-pill">
              <strong>{counts.upcoming}</strong>
              <span>Upcoming</span>
            </div>
            <div className="hero-stat-pill">
              <strong>{counts.ongoing}</strong>
              <span>Live Now</span>
            </div>
          </div>
        </div>
      </section>

      <section className="container section-block">
        <div className="discovery-toolbar">
          <div className="discovery-toolbar__top">
            <SearchBar
              value={searchInput}
              onChange={setSearchInput}
              onSubmit={handleSearchSubmit}
              onClear={handleClearSearch}
            />
            {user?.role === 'admin' && (
              <Link to="/admin/hackathons" className="btn btn--secondary">
                Manage Hackathons
              </Link>
            )}
          </div>

          <HackathonFilters
            filters={{ ...activeFilters, skills: skillInput }}
            categories={categories}
            onFilterChange={handleFilterChange}
            onReset={handleResetFilters}
            hasActiveFilters={hasActiveFilters}
          />
        </div>

        <div className="results-bar">
          <p className="results-bar__count">
            {isLoading
              ? 'Loading hackathons...'
              : `Showing ${hackathons.length} of ${pagination.total} hackathon${
                  pagination.total === 1 ? '' : 's'
                }`}
          </p>
          {pagination.totalPages > 1 && !isLoading && (
            <span className="results-bar__page">
              Page {pagination.page} of {pagination.totalPages}
            </span>
          )}
        </div>

        {error && (
          <div className="alert alert--error" role="alert">
            <span>{error}</span>
            <button type="button" className="inline-retry-btn" onClick={loadHackathons}>
              Retry
            </button>
          </div>
        )}

        {isLoading ? (
          <LoadingSkeleton count={6} variant="cards" />
        ) : hackathons.length === 0 ? (
          <EmptyState
            title="No hackathons match your filters"
            description="Try broadening your search keywords, switching event mode, or clearing active filters."
            actionLabel={hasActiveFilters ? 'Reset all filters' : ''}
            onAction={hasActiveFilters ? handleResetFilters : null}
          />
        ) : (
          <>
            <div className="hackathon-grid">
              {hackathons.map((hackathon) => (
                <HackathonCard key={hackathon.id} hackathon={hackathon} />
              ))}
            </div>

            {pagination.totalPages > 1 && (
              <nav className="pagination" aria-label="Hackathons pagination">
                <button
                  type="button"
                  className="btn btn--secondary btn--sm"
                  disabled={!pagination.hasPrevPage}
                  onClick={() => updateParam('page', String(pagination.page - 1))}
                >
                  &larr; Previous
                </button>

                <span className="pagination__info">
                  Page <strong>{pagination.page}</strong> of <strong>{pagination.totalPages}</strong>
                </span>

                <button
                  type="button"
                  className="btn btn--secondary btn--sm"
                  disabled={!pagination.hasNextPage}
                  onClick={() => updateParam('page', String(pagination.page + 1))}
                >
                  Next &rarr;
                </button>
              </nav>
            )}
          </>
        )}
      </section>
    </div>
  );
}

export default HackathonListingPage;
