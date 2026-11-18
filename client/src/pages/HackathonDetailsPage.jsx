import { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import EmptyState from '../components/EmptyState.jsx';
import HackathonBanner from '../components/HackathonBanner.jsx';
import LoadingSkeleton from '../components/LoadingSkeleton.jsx';
import StatusBadge from '../components/StatusBadge.jsx';
import { extractApiError } from '../services/authService.js';
import { fetchHackathonBySlug } from '../services/hackathonService.js';
import { formatDateRange, formatShortDate, getDeadlineSummary } from '../utils/formatters.js';

function HackathonDetailsPage() {
  const { slug } = useParams();
  const [hackathon, setHackathon] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [notFound, setNotFound] = useState(false);

  const loadDetails = useCallback(async () => {
    setIsLoading(true);
    setError('');
    setNotFound(false);

    try {
      const response = await fetchHackathonBySlug(slug);
      setHackathon(response?.data?.hackathon || null);
    } catch (err) {
      const parsed = extractApiError(err, 'Unable to load hackathon details.');
      if (parsed.statusCode === 404) {
        setNotFound(true);
      } else {
        setError(parsed.message);
      }
    } finally {
      setIsLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    loadDetails();
  }, [loadDetails]);

  if (isLoading) {
    return (
      <div className="container section-block">
        <LoadingSkeleton variant="detail" />
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="container section-block">
        <EmptyState
          title="Hackathon not found"
          description="This hackathon may have been removed or the link may be incorrect."
        />
        <div className="center-actions">
          <Link to="/hackathons" className="btn btn--primary">
            Back to all hackathons
          </Link>
        </div>
      </div>
    );
  }

  if (error || !hackathon) {
    return (
      <div className="container section-block">
        <div className="alert alert--error" role="alert">
          <span>{error || 'Unable to display hackathon details.'}</span>
          <button type="button" className="inline-retry-btn" onClick={loadDetails}>
            Retry
          </button>
        </div>
        <Link to="/hackathons" className="btn btn--secondary">
          &larr; Back to Hackathons
        </Link>
      </div>
    );
  }

  const teamSizeLabel =
    hackathon.teamSizeMin === hackathon.teamSizeMax
      ? `${hackathon.teamSizeMin} member${hackathon.teamSizeMin === 1 ? '' : 's'}`
      : `${hackathon.teamSizeMin}–${hackathon.teamSizeMax} members`;

  return (
    <div className="container section-block detail-page">
      <div className="detail-breadcrumb">
        <Link to="/hackathons" className="text-link">
          &larr; Back to Hackathons
        </Link>
      </div>

      {hackathon.isDemo && (
        <div className="alert alert--demo" role="note">
          <strong>Demo Listing:</strong> This is a fictional sample hackathon seeded for platform
          demonstration. External registration links point to example placeholder pages.
        </div>
      )}

      <div className="detail-hero-card">
        <HackathonBanner
          title={hackathon.title}
          categories={hackathon.categories}
          bannerImage={hackathon.bannerImage}
          organizerName={hackathon.organizerName}
          variant="detail"
        >
          <div className="hack-card__badges-left">
            <StatusBadge status={hackathon.status} />
            <StatusBadge mode={hackathon.mode} />
          </div>
          {hackathon.isDemo && <StatusBadge isDemo />}
        </HackathonBanner>

        <div className="detail-hero-card__header">
          <div>
            <p className="detail-organizer">Organized by {hackathon.organizerName}</p>
            <h1 className="detail-title">{hackathon.title}</h1>
            <p className="detail-lead">{hackathon.shortDescription}</p>
          </div>
        </div>
      </div>

      <div className="detail-layout">
        <div className="detail-main">
          <section className="surface-card detail-section">
            <h2 className="detail-section__title">About This Hackathon</h2>
            <p className="detail-description">{hackathon.description}</p>
          </section>

          <section className="surface-card detail-section">
            <h2 className="detail-section__title">Eligibility</h2>
            <p className="detail-copy">{hackathon.eligibility}</p>
          </section>

          <div className="detail-tags-grid">
            <section className="surface-card detail-section">
              <h2 className="detail-section__title">Required Skills</h2>
              {hackathon.requiredSkills && hackathon.requiredSkills.length > 0 ? (
                <div className="tag-list">
                  {hackathon.requiredSkills.map((skill) => (
                    <span key={skill} className="tag-chip">
                      {skill}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="muted-text">Open to all skill backgrounds.</p>
              )}
            </section>

            <section className="surface-card detail-section">
              <h2 className="detail-section__title">Categories</h2>
              <div className="tag-list">
                {(hackathon.categories || []).map((category) => (
                  <Link
                    key={category}
                    to={`/hackathons?category=${encodeURIComponent(category)}`}
                    className="tag-chip tag-chip--interest"
                  >
                    {category}
                  </Link>
                ))}
              </div>
            </section>
          </div>
        </div>

        <aside className="detail-sidebar">
          <div className="surface-card detail-summary-card">
            <div className="detail-prize-block">
              <span className="detail-meta-label">Prize Pool</span>
              <strong className="detail-prize-value">{hackathon.prizePool}</strong>
            </div>

            <dl className="detail-facts">
              <div className="detail-fact">
                <dt>Event Dates</dt>
                <dd>{formatDateRange(hackathon.startDate, hackathon.endDate)}</dd>
              </div>
              <div className="detail-fact">
                <dt>Registration Deadline</dt>
                <dd>
                  {formatShortDate(hackathon.registrationDeadline)}
                  <span className="detail-fact__sub">
                    {getDeadlineSummary(hackathon.registrationDeadline)}
                  </span>
                </dd>
              </div>
              <div className="detail-fact">
                <dt>Mode &amp; Location</dt>
                <dd>
                  <span className="capitalize">{hackathon.mode}</span> &middot; {hackathon.location}
                </dd>
              </div>
              <div className="detail-fact">
                <dt>Team Size</dt>
                <dd>{teamSizeLabel}</dd>
              </div>
            </dl>

            <a
              href={hackathon.registrationLink}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn--primary btn--full detail-register-btn"
            >
              Register Externally &nearr;
            </a>
            <p className="detail-register-note">
              Opens the organizer&rsquo;s external registration page in a new tab.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}

export default HackathonDetailsPage;
