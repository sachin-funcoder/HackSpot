import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import FormField from '../components/FormField.jsx';
import useAuth from '../hooks/useAuth.js';
import { extractApiError } from '../services/authService.js';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function parseTagInput(value) {
  return value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

function validateRegistrationForm(values) {
  const errors = {};
  const name = values.name.trim();
  const email = values.email.trim();
  const college = values.college.trim();

  if (!name) {
    errors.name = 'Full name is required.';
  } else if (name.length < 2) {
    errors.name = 'Name must be at least 2 characters.';
  }

  if (!email) {
    errors.email = 'Email address is required.';
  } else if (!EMAIL_REGEX.test(email)) {
    errors.email = 'Please enter a valid email address.';
  }

  if (!college) {
    errors.college = 'College or university name is required.';
  } else if (college.length < 2) {
    errors.college = 'College name must be at least 2 characters.';
  }

  if (!values.password) {
    errors.password = 'Password is required.';
  } else if (values.password.length < 8) {
    errors.password = 'Password must be at least 8 characters long.';
  }

  if (!values.confirmPassword) {
    errors.confirmPassword = 'Please confirm your password.';
  } else if (values.confirmPassword !== values.password) {
    errors.confirmPassword = 'Passwords do not match.';
  }

  return errors;
}

function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [values, setValues] = useState({
    name: '',
    email: '',
    college: '',
    skills: '',
    password: '',
    confirmPassword: '',
  });
  const [fieldErrors, setFieldErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

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

    const validationErrors = validateRegistrationForm(values);
    if (Object.keys(validationErrors).length > 0) {
      setFieldErrors(validationErrors);
      return;
    }

    setIsSubmitting(true);
    try {
      await register({
        name: values.name.trim(),
        email: values.email.trim().toLowerCase(),
        college: values.college.trim(),
        skills: parseTagInput(values.skills),
        password: values.password,
      });
      navigate('/dashboard', { replace: true });
    } catch (error) {
      const parsed = extractApiError(error, 'Registration failed. Please review your details.');
      setFormError(parsed.message);
      setFieldErrors(parsed.fieldErrors);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="auth-shell">
      <div className="container auth-split auth-split--wide">
        <aside className="auth-aside">
          <span className="hero-eyebrow">Student Onboarding</span>
          <h2 className="auth-aside__title">Join a cross-college community of builders.</h2>
          <p className="auth-aside__desc">
            Create your free HackSpot student profile to showcase your technical skills and discover
            hackathons tailored to what you want to build.
          </p>
          <ul className="auth-aside__list">
            <li>Showcase your stack &amp; hackathon interests</li>
            <li>Track upcoming online, offline, and hybrid events</li>
            <li>One profile across all future team features</li>
          </ul>
        </aside>

        <div className="auth-card auth-card--wide">
          <div className="auth-card__header">
            <span className="section-kicker">Create Account</span>
            <h1 className="auth-card__title">Create your student account</h1>
            <p className="auth-card__subtitle">
              Fill in your details below to get started on HackSpot.
            </p>
          </div>

          {formError && (
            <div className="alert alert--error" role="alert">
              {formError}
            </div>
          )}

          <form className="auth-form" onSubmit={handleSubmit} noValidate>
            <div className="form-grid-2">
              <FormField
                id="register-name"
                name="name"
                label="Full name"
                value={values.name}
                onChange={handleChange}
                placeholder="Aarav Sharma"
                autoComplete="name"
                error={fieldErrors.name}
                required
                disabled={isSubmitting}
              />

              <FormField
                id="register-email"
                name="email"
                label="Email address"
                type="email"
                value={values.email}
                onChange={handleChange}
                placeholder="aarav@college.edu"
                autoComplete="email"
                error={fieldErrors.email}
                required
                disabled={isSubmitting}
              />
            </div>

            <FormField
              id="register-college"
              name="college"
              label="College / University"
              value={values.college}
              onChange={handleChange}
              placeholder="National Institute of Technology"
              autoComplete="organization"
              error={fieldErrors.college}
              required
              disabled={isSubmitting}
            />

            <FormField
              id="register-skills"
              name="skills"
              label="Technical skills (optional)"
              value={values.skills}
              onChange={handleChange}
              placeholder="React, Node.js, Python, UI/UX"
              helperText="Separate multiple skills with commas. You can update them anytime in Profile."
              error={fieldErrors.skills}
              disabled={isSubmitting}
            />

            <div className="form-grid-2">
              <FormField
                id="register-password"
                name="password"
                label="Password"
                type="password"
                value={values.password}
                onChange={handleChange}
                placeholder="Minimum 8 characters"
                autoComplete="new-password"
                error={fieldErrors.password}
                required
                disabled={isSubmitting}
              />

              <FormField
                id="register-confirm-password"
                name="confirmPassword"
                label="Confirm password"
                type="password"
                value={values.confirmPassword}
                onChange={handleChange}
                placeholder="Re-enter your password"
                autoComplete="new-password"
                error={fieldErrors.confirmPassword}
                required
                disabled={isSubmitting}
              />
            </div>

            <button
              type="submit"
              className="btn btn--primary btn--full btn--lg"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Creating account...' : 'Create student account'}
            </button>
          </form>

          <p className="auth-card__footer">
            Already have an account?{' '}
            <Link to="/login" className="text-link">
              Log in here
            </Link>
          </p>
        </div>
      </div>
    </section>
  );
}

export default RegisterPage;
