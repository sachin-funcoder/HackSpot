import { useState } from 'react';
import { extractApiError } from '../services/authService.js';
import FormField from './FormField.jsx';
import TagListEditor from './TagListEditor.jsx';
import UserAvatar from './UserAvatar.jsx';

const MAX_PROFILE_IMAGE_URL_LENGTH = 500;

function isValidOptionalHttpUrl(value) {
  if (!value) {
    return true;
  }

  try {
    const parsed = new URL(value);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

function validateProfileForm(values) {
  const errors = {};
  const name = values.name.trim();
  const college = values.college.trim();
  const profileImage = values.profileImage.trim();

  if (!name) {
    errors.name = 'Full name is required.';
  } else if (name.length < 2 || name.length > 100) {
    errors.name = 'Name must be between 2 and 100 characters.';
  }

  if (!college) {
    errors.college = 'College or university name is required.';
  } else if (college.length < 2 || college.length > 150) {
    errors.college = 'College name must be between 2 and 150 characters.';
  }

  if (profileImage.length > MAX_PROFILE_IMAGE_URL_LENGTH) {
    errors.profileImage = `Profile image URL cannot exceed ${MAX_PROFILE_IMAGE_URL_LENGTH} characters.`;
  } else if (profileImage && !isValidOptionalHttpUrl(profileImage)) {
    errors.profileImage = 'Please enter a valid http:// or https:// image URL.';
  }

  return errors;
}

function ProfileEditForm({ profile, onSave, onCancel }) {
  const [values, setValues] = useState({
    name: profile.name || '',
    college: profile.college || '',
    profileImage: profile.profileImage || '',
    skills: Array.isArray(profile.skills) ? [...profile.skills] : [],
    interests: Array.isArray(profile.interests) ? [...profile.interests] : [],
  });
  const [fieldErrors, setFieldErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  function handleInputChange(event) {
    const { name, value } = event.target;
    setValues((prev) => ({ ...prev, [name]: value }));
    setFieldErrors((prev) => ({ ...prev, [name]: '' }));
    if (formError) {
      setFormError('');
    }
  }

  function handleSkillsChange(nextSkills) {
    setValues((prev) => ({ ...prev, skills: nextSkills }));
    setFieldErrors((prev) => ({ ...prev, skills: '' }));
  }

  function handleInterestsChange(nextInterests) {
    setValues((prev) => ({ ...prev, interests: nextInterests }));
    setFieldErrors((prev) => ({ ...prev, interests: '' }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setFormError('');

    const validationErrors = validateProfileForm(values);
    if (Object.keys(validationErrors).length > 0) {
      setFieldErrors(validationErrors);
      return;
    }

    setIsSaving(true);
    try {
      await onSave({
        name: values.name.trim(),
        college: values.college.trim(),
        profileImage: values.profileImage.trim(),
        skills: values.skills,
        interests: values.interests,
      });
    } catch (error) {
      const parsed = extractApiError(error, 'Failed to update profile. Please try again.');
      setFormError(parsed.message);
      setFieldErrors(parsed.fieldErrors);
    } finally {
      setIsSaving(false);
    }
  }

  const previewSrc = isValidOptionalHttpUrl(values.profileImage.trim())
    ? values.profileImage.trim()
    : '';

  return (
    <form className="profile-edit-form" onSubmit={handleSubmit} noValidate>
      <div className="profile-edit-form__header">
        <div>
          <h2 className="profile-section__title">Edit Student Profile</h2>
          <p className="muted-text">
            Update your name, college, skills, interests, and avatar image URL.
          </p>
        </div>
      </div>

      {formError && (
        <div className="alert alert--error" role="alert">
          {formError}
        </div>
      )}

      <div className="profile-avatar-preview">
        <UserAvatar name={values.name || profile.name} src={previewSrc} size="lg" />
        <div className="profile-avatar-preview__fields">
          <FormField
            id="profile-image-url"
            name="profileImage"
            label="Profile image URL"
            type="url"
            value={values.profileImage}
            onChange={handleInputChange}
            placeholder="https://example.com/your-photo.jpg"
            helperText="Leave blank to use your initials avatar. Supports http:// and https:// URLs."
            error={fieldErrors.profileImage}
            disabled={isSaving}
          />
        </div>
      </div>

      <div className="form-grid-2">
        <FormField
          id="profile-name"
          name="name"
          label="Full name"
          value={values.name}
          onChange={handleInputChange}
          placeholder="Your full name"
          autoComplete="name"
          error={fieldErrors.name}
          required
          disabled={isSaving}
        />

        <FormField
          id="profile-college"
          name="college"
          label="College / University"
          value={values.college}
          onChange={handleInputChange}
          placeholder="Your college or university"
          autoComplete="organization"
          error={fieldErrors.college}
          required
          disabled={isSaving}
        />
      </div>

      <div className="form-field">
        <label className="form-field__label" htmlFor="profile-email-readonly">
          Email address <span className="readonly-badge">Read-only</span>
        </label>
        <input
          id="profile-email-readonly"
          type="email"
          value={profile.email || ''}
          disabled
          readOnly
          className="form-field__input form-field__input--readonly"
        />
        <p className="form-field__helper">
          Your account email cannot be changed from profile settings.
        </p>
      </div>

      <TagListEditor
        id="profile-skills-input"
        label="Skills"
        items={values.skills}
        onChange={handleSkillsChange}
        placeholder="e.g. React, Node.js, Python, UI/UX"
        helperText="Press Enter or click Add to include a skill."
        error={fieldErrors.skills}
        disabled={isSaving}
      />

      <TagListEditor
        id="profile-interests-input"
        label="Interests"
        items={values.interests}
        onChange={handleInterestsChange}
        placeholder="e.g. AI/ML, Web3, FinTech, HealthTech"
        helperText="Press Enter or click Add to include a hackathon topic or interest."
        error={fieldErrors.interests}
        disabled={isSaving}
      />

      <div className="profile-edit-form__actions">
        <button
          type="button"
          className="btn btn--secondary"
          onClick={onCancel}
          disabled={isSaving}
        >
          Cancel
        </button>
        <button type="submit" className="btn btn--primary" disabled={isSaving}>
          {isSaving ? 'Saving changes...' : 'Save changes'}
        </button>
      </div>
    </form>
  );
}

export default ProfileEditForm;
