import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth.js';
import UserAvatar from './UserAvatar.jsx';

function Navbar() {
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  async function handleLogout() {
    setIsLoggingOut(true);
    try {
      await logout();
      setMobileMenuOpen(false);
      navigate('/login', { replace: true });
    } finally {
      setIsLoggingOut(false);
    }
  }

  const navLinkClass = ({ isActive }) =>
    `navbar__link${isActive ? ' navbar__link--active' : ''}`;

  return (
    <header className="navbar">
      <div className="container navbar__inner">
        <Link to="/" className="navbar__brand">
          <span className="navbar__logo" aria-hidden="true">
            HS
          </span>
          <span className="navbar__brand-text">HackSpot</span>
        </Link>

        <nav className="navbar__nav navbar__nav--desktop" aria-label="Primary navigation">
          <NavLink to="/" end className={navLinkClass}>
            Home
          </NavLink>
          <NavLink to="/hackathons" className={navLinkClass}>
            Hackathons
          </NavLink>

          {!isLoading && isAuthenticated && (
            <>
              <NavLink to="/dashboard" className={navLinkClass}>
                Dashboard
              </NavLink>
              <NavLink to="/profile" className={navLinkClass}>
                Profile
              </NavLink>
              {user?.role === 'admin' && (
                <NavLink to="/admin/hackathons" className={navLinkClass}>
                  Admin
                </NavLink>
              )}
            </>
          )}
        </nav>

        <div className="navbar__actions navbar__actions--desktop">
          {!isLoading && isAuthenticated ? (
            <>
              <Link to="/profile" className="navbar__user" title={`View profile (${user.email})`}>
                <UserAvatar name={user.name} src={user.profileImage} size="sm" />
                <span className="navbar__user-name">{user.name}</span>
                <span className="role-pill">{user.role}</span>
              </Link>
              <button
                type="button"
                className="btn btn--secondary btn--sm"
                onClick={handleLogout}
                disabled={isLoggingOut}
              >
                {isLoggingOut ? 'Logging out...' : 'Log out'}
              </button>
            </>
          ) : (
            !isLoading && (
              <>
                <Link to="/login" className="btn btn--ghost btn--sm">
                  Log in
                </Link>
                <Link to="/register" className="btn btn--primary btn--sm">
                  Get Started
                </Link>
              </>
            )
          )}
        </div>

        <button
          type="button"
          className="navbar__toggle"
          onClick={() => setMobileMenuOpen((prev) => !prev)}
          aria-expanded={mobileMenuOpen}
          aria-controls="mobile-nav-menu"
          aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
        >
          <span className={`hamburger${mobileMenuOpen ? ' hamburger--open' : ''}`} aria-hidden="true" />
        </button>
      </div>

      {mobileMenuOpen && (
        <div id="mobile-nav-menu" className="mobile-drawer">
          <nav className="mobile-drawer__nav" aria-label="Mobile navigation">
            <NavLink to="/" end className={navLinkClass}>
              Home
            </NavLink>
            <NavLink to="/hackathons" className={navLinkClass}>
              Hackathons
            </NavLink>

            {!isLoading && isAuthenticated ? (
              <>
                <NavLink to="/dashboard" className={navLinkClass}>
                  Dashboard
                </NavLink>
                <NavLink to="/profile" className={navLinkClass}>
                  Profile
                </NavLink>
                {user?.role === 'admin' && (
                  <NavLink to="/admin/hackathons" className={navLinkClass}>
                    Admin Console
                  </NavLink>
                )}

                <div className="mobile-drawer__divider" />

                <div className="mobile-drawer__user">
                  <UserAvatar name={user.name} src={user.profileImage} size="sm" />
                  <div>
                    <div className="mobile-drawer__user-name">{user.name}</div>
                    <div className="mobile-drawer__user-email">{user.email}</div>
                  </div>
                </div>

                <button
                  type="button"
                  className="btn btn--secondary btn--full"
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                >
                  {isLoggingOut ? 'Logging out...' : 'Log out'}
                </button>
              </>
            ) : (
              !isLoading && (
                <>
                  <div className="mobile-drawer__divider" />
                  <div className="mobile-drawer__cta">
                    <Link to="/login" className="btn btn--secondary btn--full">
                      Log in
                    </Link>
                    <Link to="/register" className="btn btn--primary btn--full">
                      Create Student Account
                    </Link>
                  </div>
                </>
              )
            )}
          </nav>
        </div>
      )}
    </header>
  );
}

export default Navbar;
