import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import FormField from '../components/FormField.jsx';
import useAuth from '../hooks/useAuth.js';
import { extractApiError } from '../services/authService.js';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validateLoginForm(values) {
  const errors = {};
  const trimmedEmail = values.email.trim();

  if (!trimmedEmail) {
    errors.email = 'Email address is required.';
  } else if (!EMAIL_REGEX.test(trimmedEmail)) {
    errors.email = 'Please enter a valid email address.';
  }

  if (!values.password) {
    errors.password = 'Password is required.';
  }

  return errors;
}

function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [values, setValues] = useState({
    email: '',
    password: '',
  });
  const [fieldErrors, setFieldErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const redirectTo = location.state?.from?.pathname || '/dashboard';

  function handleChange(event) {
    const { name, value } = event.target;
    setValues((prev) => ({ ...prev, [name]: value }));
    setFieldErrors((prev) => ({ ...prev, [name]: '' }));
    if (formError) {
      setFormError('');
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setFormError('');

    const validationErrors = validateLoginForm(values);
    if (Object.keys(validationErrors).length > 0) {
      setFieldErrors(validationErrors);
      return;
    }

    setIsSubmitting(true);
    try {
      await login({
        email: values.email.trim().toLowerCase(),
        password: values.password,
      });
      navigate(redirectTo, { replace: true });
    } catch (error) {
      const parsed = extractApiError(error, 'Unable to sign in. Please check your credentials.');
      setFormError(parsed.message);
      setFieldErrors(parsed.fieldErrors);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="auth-shell">
      <div className="container auth-split">
        <aside className="auth-aside">
          <span className="hero-eyebrow">HackSpot Platform</span>
          <h2 className="auth-aside__title">Welcome back to your builder hub.</h2>
          <p className="auth-aside__desc">
            Pick up right where you left off—track upcoming registration deadlines, keep your
            technical profile updated, and discover new hackathons across colleges.
          </p>
          <ul className="auth-aside__list">
            <li>HTTP-only JWT session protection</li>
            <li>Live hackathon discovery across 8+ domains</li>
            <li>Manage your skills, interests, and campus profile</li>
          </ul>
        </aside>

        <div className="auth-card">
          <div className="auth-card__header">
            <span className="section-kicker">Sign In</span>
            <h1 className="auth-card__title">Log in to HackSpot</h1>
            <p className="auth-card__subtitle">
              Enter your student email and password to access your dashboard.
            </p>
          </div>

          {formError && (
            <div className="alert alert--error" role="alert">
              {formError}
            </div>
          )}

          <form className="auth-form" onSubmit={handleSubmit} noValidate>
            <FormField
              id="login-email"
              name="email"
              label="Email address"
              type="email"
              value={values.email}
              onChange={handleChange}
              placeholder="you@college.edu"
              autoComplete="email"
              error={fieldErrors.email}
              required
              disabled={isSubmitting}
            />

            <FormField
              id="login-password"
              name="password"
              label="Password"
              type="password"
              value={values.password}
              onChange={handleChange}
              placeholder="Enter your password"
              autoComplete="current-password"
              error={fieldErrors.password}
              required
              disabled={isSubmitting}
            />

            <button
              type="submit"
              className="btn btn--primary btn--full btn--lg"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Signing in...' : 'Log in'}
            </button>
          </form>

          <p className="auth-card__footer">
            New to HackSpot?{' '}
            <Link to="/register" className="text-link">
              Create a student account
            </Link>
          </p>
        </div>
      </div>
    </section>
  );
}

export default LoginPage;
