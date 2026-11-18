import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import EmptyState from '../components/EmptyState.jsx';
import HackathonCard from '../components/HackathonCard.jsx';
import LoadingSkeleton from '../components/LoadingSkeleton.jsx';
import UserAvatar from '../components/UserAvatar.jsx';
import useAuth from '../hooks/useAuth.js';
import { fetchHackathons } from '../services/hackathonService.js';

function calculateProfileCompleteness(user) {
  let score = 0;
  if (user?.name) score += 20;
  if (user?.college) score += 20;
  if (user?.skills?.length > 0) score += 25;
  if (user?.interests?.length > 0) score += 25;
  if (user?.profileImage) score += 10;
  return score;
}

function DashboardPage() {
  const { user } = useAuth();
  const [upcomingHackathons, setUpcomingHackathons] = useState([]);
  const [upcomingTotal, setUpcomingTotal] = useState(0);
  const [isLoadingEvents, setIsLoadingEvents] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function loadUpcoming() {
      try {
        const res = await fetchHackathons({ status: 'upcoming', sort: 'upcoming', limit: 3 });
        const payload = res?.data || {};
        if (mounted) {
          setUpcomingHackathons(payload.hackathons || []);
          setUpcomingTotal(payload.meta?.counts?.upcoming || 0);
        }
      } catch {
        if (mounted) {
          setUpcomingHackathons([]);
        }
      } finally {
        if (mounted) {
          setIsLoadingEvents(false);
        }
      }
    }

    loadUpcoming();

    return () => {
      mounted = false;
    };
  }, []);

  const completeness = calculateProfileCompleteness(user);
  const skillsCount = user?.skills?.length || 0;
  const interestsCount = user?.interests?.length || 0;

  return (
    <div className="page-wrapper">
      <section className="page-hero page-hero--compact">
        <div className="container page-hero__inner">
          <div className="dashboard-hero__identity">
            <UserAvatar name={user.name} src={user.profileImage} size="lg" />
            <div>
              <span className="hero-eyebrow">Student Workspace</span>
              <h1 className="page-hero__title">Welcome back, {user.name}</h1>
              <p className="page-hero__subtitle">
                {user.college} &middot; Keep your skills sharp and explore upcoming hackathons.
              </p>
            </div>
          </div>

          <div className="page-hero__actions">
            <Link to="/hackathons" className="btn btn--primary">
              Explore Hackathons
            </Link>
            <Link to="/profile" className="btn btn--hero-secondary">
              Edit Profile
            </Link>
            {user?.role === 'admin' && (
              <Link to="/admin/hackathons" className="btn btn--hero-secondary">
                Admin Console
              </Link>
            )}
          </div>
        </div>
      </section>

      <section className="container section-block">
        <div className="stats-row">
          <div className="stat-card">
            <span className="stat-card__label">Profile Strength</span>
            <strong className="stat-card__value">{completeness}%</strong>
            <div className="progress-track" aria-hidden="true">
              <div className="progress-track__fill" style={{ width: `${completeness}%` }} />
            </div>
          </div>

          <div className="stat-card">
            <span className="stat-card__label">Skills Listed</span>
            <strong className="stat-card__value">{skillsCount}</strong>
            <span className="stat-card__hint">
              {skillsCount > 0 ? 'Visible on your profile' : 'Add skills to stand out'}
            </span>
          </div>

          <div className="stat-card">
            <span className="stat-card__label">Interests</span>
            <strong className="stat-card__value">{interestsCount}</strong>
            <span className="stat-card__hint">
              {interestsCount > 0 ? 'Hackathon domains saved' : 'Add topics you enjoy'}
            </span>
          </div>

          <div className="stat-card">
            <span className="stat-card__label">Upcoming Hackathons</span>
            <strong className="stat-card__value">{upcomingTotal}</strong>
            <Link to="/hackathons?status=upcoming" className="stat-card__link">
              Browse open events &rarr;
            </Link>
          </div>
        </div>

        {/* Profile Summary */}
        <div className="surface-card dashboard-summary">
          <div className="dashboard-summary__header">
            <div>
              <h2 className="section-subtitle">Your Profile Summary</h2>
              <p className="muted-text">
                {user.email} &middot; Role: <strong className="capitalize">{user.role}</strong>
              </p>
            </div>
            <Link to="/profile" className="btn btn--secondary btn--sm">
              Manage Profile
            </Link>
          </div>

          <div className="dashboard-summary__columns">
            <div>
              <span className="profile-item__label">Technical Skills</span>
              {skillsCount > 0 ? (
                <div className="tag-list">
                  {user.skills.map((skill) => (
                    <span key={skill} className="tag-chip">
                      {skill}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="muted-text">
                  No skills added yet.{' '}
                  <Link to="/profile" className="text-link">
                    Add your skills
                  </Link>
                  .
                </p>
              )}
            </div>

            <div>
              <span className="profile-item__label">Hackathon Interests</span>
              {interestsCount > 0 ? (
                <div className="tag-list">
                  {user.interests.map((interest) => (
                    <span key={interest} className="tag-chip tag-chip--interest">
                      {interest}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="muted-text">
                  No interests added yet.{' '}
                  <Link to="/profile" className="text-link">
                    Add your interests
                  </Link>
                  .
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Upcoming Hackathons */}
        <div className="dashboard-events">
          <div className="section-header">
            <div>
              <span className="section-kicker">Recommended Next Step</span>
              <h2 className="section-title">Upcoming Hackathons</h2>
            </div>
            <Link to="/hackathons" className="btn btn--secondary btn--sm">
              Explore all &rarr;
            </Link>
          </div>

          {isLoadingEvents ? (
            <LoadingSkeleton count={3} variant="cards" />
          ) : upcomingHackathons.length === 0 ? (
            <EmptyState
              title="No upcoming hackathons yet"
              description="Explore the full hackathons directory to view ongoing and past events."
            />
          ) : (
            <div className="hackathon-grid">
              {upcomingHackathons.map((hackathon) => (
                <HackathonCard key={hackathon.id} hackathon={hackathon} />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

export default DashboardPage;
