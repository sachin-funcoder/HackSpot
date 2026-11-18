import { Link } from 'react-router-dom';
import useAuth from '../hooks/useAuth.js';

function Footer() {
  const { isAuthenticated, user } = useAuth();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="site-footer">
      <div className="container site-footer__grid">
        <div className="site-footer__brand">
          <Link to="/" className="footer-brand-link">
            <span className="navbar__logo" aria-hidden="true">
              HS
            </span>
            <span className="footer-brand-name">HackSpot</span>
          </Link>
          <p className="site-footer__tagline">
            A centralized hackathon discovery and cross-college collaboration platform built for
            student builders, designers, and innovators.
          </p>
        </div>

        <div className="site-footer__col">
          <h3 className="site-footer__heading">Platform</h3>
          <ul className="site-footer__list">
            <li>
              <Link to="/hackathons">Explore Hackathons</Link>
            </li>
            <li>
              <Link to="/hackathons?status=upcoming">Upcoming Events</Link>
            </li>
            <li>
              <Link to="/hackathons?mode=online">Online Hackathons</Link>
            </li>
          </ul>
        </div>

        <div className="site-footer__col">
          <h3 className="site-footer__heading">Account</h3>
          <ul className="site-footer__list">
            {isAuthenticated ? (
              <>
                <li>
                  <Link to="/dashboard">Student Dashboard</Link>
                </li>
                <li>
                  <Link to="/profile">My Profile</Link>
                </li>
                {user?.role === 'admin' && (
                  <li>
                    <Link to="/admin/hackathons">Admin Console</Link>
                  </li>
                )}
              </>
            ) : (
              <>
                <li>
                  <Link to="/register">Create Student Account</Link>
                </li>
                <li>
                  <Link to="/login">Sign In</Link>
                </li>
              </>
            )}
          </ul>
        </div>
      </div>

      <div className="container site-footer__bottom">
        <p>&copy; {currentYear} HackSpot. Built for student developer communities.</p>
        <p className="site-footer__note">
          Events marked <strong>DEMO</strong> are fictional sample listings for previewing the
          platform.
        </p>
      </div>
    </footer>
  );
}

export default Footer;
