import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import EmptyState from '../components/EmptyState.jsx';
import HackathonCard from '../components/HackathonCard.jsx';
import LoadingSkeleton from '../components/LoadingSkeleton.jsx';
import useAuth from '../hooks/useAuth.js';
import { fetchHackathons } from '../services/hackathonService.js';

function HomePage() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [featured, setFeatured] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    upcoming: 0,
    ongoing: 0,
    categories: 0,
  });
  const [isLoadingEvents, setIsLoadingEvents] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function loadFeatured() {
      try {
        const response = await fetchHackathons({
          status: 'upcoming',
          sort: 'upcoming',
          limit: 3,
        });
        const payload = response?.data || {};
        if (mounted) {
          setFeatured(payload.hackathons || []);
          setStats({
            total: payload.meta?.counts?.total || 0,
            upcoming: payload.meta?.counts?.upcoming || 0,
            ongoing: payload.meta?.counts?.ongoing || 0,
            categories: payload.meta?.availableCategories?.length || 0,
          });
        }
      } catch {
        if (mounted) {
          setFeatured([]);
        }
      } finally {
        if (mounted) {
          setIsLoadingEvents(false);
        }
      }
    }

    loadFeatured();

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-section__glow" aria-hidden="true" />
        <div className="container hero-section__inner">
          <div className="hero-section__content">
            <span className="hero-eyebrow">Built for Student Builders &amp; Campus Innovators</span>
            <h1 className="hero-section__title">
              Discover High-Impact Hackathons.{' '}
              <span className="text-gradient">Build Without Borders.</span>
            </h1>
            <p className="hero-section__subtitle">
              HackSpot brings upcoming online, offline, and hybrid student hackathons into one
              curated workspace—so you spend less time hunting links and more time shipping.
            </p>

            <div className="hero-section__actions">
              <Link to="/hackathons" className="btn btn--primary btn--lg">
                Explore Hackathons
              </Link>
              {!authLoading &&
                (isAuthenticated ? (
                  <Link to="/dashboard" className="btn btn--hero-secondary btn--lg">
                    Open Dashboard
                  </Link>
                ) : (
                  <Link to="/register" className="btn btn--hero-secondary btn--lg">
                    Create Student Account
                  </Link>
                ))}
            </div>
          </div>

          <div className="hero-stats-grid" aria-label="Platform statistics">
            <div className="hero-stat-card">
              <span className="hero-stat-card__value">{stats.total}</span>
              <span className="hero-stat-card__label">Curated Hackathons</span>
            </div>
            <div className="hero-stat-card">
              <span className="hero-stat-card__value">{stats.upcoming}</span>
              <span className="hero-stat-card__label">Upcoming Events</span>
            </div>
            <div className="hero-stat-card">
              <span className="hero-stat-card__value">{stats.ongoing}</span>
              <span className="hero-stat-card__label">Live Right Now</span>
            </div>
            <div className="hero-stat-card">
              <span className="hero-stat-card__value">{stats.categories}</span>
              <span className="hero-stat-card__label">Tech Domains</span>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Upcoming Hackathons */}
      <section className="container section-block">
        <div className="section-header">
          <div>
            <span className="section-kicker">Featured Opportunities</span>
            <h2 className="section-title">Upcoming Hackathons</h2>
            <p className="section-desc">
              Fresh build weekends sorted by upcoming start dates. Filter by mode, tech stack, or
              domain to find your fit.
            </p>
          </div>
          <Link to="/hackathons" className="btn btn--secondary">
            View all hackathons &rarr;
          </Link>
        </div>

        {isLoadingEvents ? (
          <LoadingSkeleton count={3} variant="cards" />
        ) : featured.length === 0 ? (
          <EmptyState
            title="No upcoming hackathons published yet"
            description="Check back soon or browse all hackathons including ongoing and past showcases."
          />
        ) : (
          <div className="hackathon-grid">
            {featured.map((hackathon) => (
              <HackathonCard key={hackathon.id} hackathon={hackathon} />
            ))}
          </div>
        )}
      </section>

      {/* How HackSpot Works */}
      <section className="band-subtle">
        <div className="container section-block">
          <div className="section-header section-header--centered">
            <span className="section-kicker">Workflow</span>
            <h2 className="section-title">How HackSpot Works</h2>
            <p className="section-desc">
              A focused, zero-clutter workflow built around how college developers actually prepare
              for hackathons.
            </p>
          </div>

          <div className="steps-grid">
            <article className="step-card">
              <span className="step-card__num">01</span>
              <h3 className="step-card__title">Build Your Student Profile</h3>
              <p className="step-card__desc">
                Highlight your college, core technical skills, and domain interests so your profile
                is ready for upcoming hackathons and cross-college collaboration.
              </p>
            </article>

            <article className="step-card">
              <span className="step-card__num">02</span>
              <h3 className="step-card__title">Filter Hackathons by Stack &amp; Mode</h3>
              <p className="step-card__desc">
                Search by title, organizer, skill, category, or online/hybrid/in-person format with
                clear registration deadlines and eligibility upfront.
              </p>
            </article>

            <article className="step-card">
              <span className="step-card__num">03</span>
              <h3 className="step-card__title">Register &amp; Ship Together</h3>
              <p className="step-card__desc">
                Jump directly to verified event registration links with team size requirements,
                prize details, and required skills organized in one place.
              </p>
            </article>
          </div>
        </div>
      </section>

      {/* Benefits for Students & Organizers */}
      <section className="container section-block">
        <div className="section-header section-header--centered">
          <span className="section-kicker">Built for Both Sides</span>
          <h2 className="section-title">Value for Students &amp; Organizers</h2>
        </div>

        <div className="benefits-grid">
          <article className="benefit-card">
            <span className="benefit-card__pill">For Students</span>
            <h3 className="benefit-card__title">Stop Missing Great Hackathons</h3>
            <ul className="benefit-list">
              <li>Unified calendar of online, in-person, and hybrid student hackathons.</li>
              <li>Instant filtering by AI/ML, Web Dev, FinTech, Cybersecurity, IoT, and more.</li>
              <li>Clear eligibility, team sizes, deadlines, and prize pools at a glance.</li>
              <li>Structured developer profile ready for skill-based team discovery.</li>
            </ul>
          </article>

          <article className="benefit-card benefit-card--dark">
            <span className="benefit-card__pill benefit-card__pill--dark">For Organizers &amp; Admins</span>
            <h3 className="benefit-card__title">Publish Structured, High-Trust Listings</h3>
            <ul className="benefit-list">
              <li>Role-protected Admin Console to create, update, and manage hackathon listings.</li>
              <li>Automatic server-computed event status so listings never go stale.</li>
              <li>Strict date, URL, and team-size validation keeps every event accurate.</li>
              <li>Reach motivated student builders from colleges across regions.</li>
            </ul>
          </article>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="container section-block">
        <div className="cta-banner">
          <div>
            <h2 className="cta-banner__title">Ready to find your next hackathon?</h2>
            <p className="cta-banner__desc">
              Browse live listings now or create your free HackSpot student profile in under a
              minute.
            </p>
          </div>
          <div className="cta-banner__actions">
            <Link to="/hackathons" className="btn btn--primary btn--lg">
              Browse Hackathons
            </Link>
            {!authLoading && !isAuthenticated && (
              <Link to="/register" className="btn btn--hero-secondary btn--lg">
                Sign Up Free
              </Link>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

export default HomePage;
