import { Link } from 'react-router-dom';
import { formatDateRange, getDeadlineSummary } from '../utils/formatters.js';
import HackathonBanner from './HackathonBanner.jsx';
import StatusBadge from './StatusBadge.jsx';

function HackathonCard({ hackathon }) {
  const visibleSkills = (hackathon.requiredSkills || []).slice(0, 4);
  const remainingSkills = Math.max(0, (hackathon.requiredSkills || []).length - visibleSkills.length);

  return (
    <article className="hack-card">
      <HackathonBanner
        title={hackathon.title}
        categories={hackathon.categories}
        bannerImage={hackathon.bannerImage}
        organizerName={hackathon.organizerName}
        variant="card"
      >
        <div className="hack-card__badges-left">
          <StatusBadge status={hackathon.status} />
          <StatusBadge mode={hackathon.mode} />
        </div>
        {hackathon.isDemo && <StatusBadge isDemo />}
      </HackathonBanner>

      <div className="hack-card__body">
        <div className="hack-card__organizer">
          <span className="hack-card__org-name">{hackathon.organizerName}</span>
          {hackathon.categories?.[0] && (
            <span className="hack-card__category-pill">{hackathon.categories[0]}</span>
          )}
        </div>

        <h3 className="hack-card__title">
          <Link to={`/hackathons/${hackathon.slug}`} className="hack-card__title-link">
            {hackathon.title}
          </Link>
        </h3>

        <p className="hack-card__desc">{hackathon.shortDescription}</p>

        <dl className="hack-card__meta">
          <div className="hack-card__meta-item">
            <dt>Event Dates</dt>
            <dd>{formatDateRange(hackathon.startDate, hackathon.endDate)}</dd>
          </div>
          <div className="hack-card__meta-item">
            <dt>Registration</dt>
            <dd>{getDeadlineSummary(hackathon.registrationDeadline)}</dd>
          </div>
          <div className="hack-card__meta-item hack-card__meta-item--full">
            <dt>Prize Pool</dt>
            <dd className="hack-card__prize">{hackathon.prizePool}</dd>
          </div>
        </dl>

        {visibleSkills.length > 0 && (
          <div className="hack-card__skills" aria-label="Required skills">
            {visibleSkills.map((skill) => (
              <span key={skill} className="skill-pill">
                {skill}
              </span>
            ))}
            {remainingSkills > 0 && (
              <span className="skill-pill skill-pill--more">+{remainingSkills}</span>
            )}
          </div>
        )}
      </div>

      <div className="hack-card__footer">
        <span className="hack-card__location" title={hackathon.location}>
          {hackathon.location}
        </span>
        <Link to={`/hackathons/${hackathon.slug}`} className="btn btn--primary btn--sm">
          View Details
        </Link>
      </div>
    </article>
  );
}

export default HackathonCard;
