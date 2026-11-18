import { useState } from 'react';
import { extractApiError } from '../services/authService.js';
import { toDateInputValue } from '../utils/formatters.js';
import FormField from './FormField.jsx';
import TagListEditor from './TagListEditor.jsx';

function isValidHttpUrl(value) {
  try {
    const parsed = new URL(value);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

function validateHackathonForm(values) {
  const errors = {};

  if (!values.title.trim() || values.title.trim().length < 3) {
    errors.title = 'Title must be at least 3 characters.';
  }

  if (!values.organizerName.trim() || values.organizerName.trim().length < 2) {
    errors.organizerName = 'Organizer name is required.';
  }

  if (!values.shortDescription.trim() || values.shortDescription.trim().length < 10) {
    errors.shortDescription = 'Short description must be at least 10 characters.';
  }

  if (!values.description.trim() || values.description.trim().length < 20) {
    errors.description = 'Full description must be at least 20 characters.';
  }

  if (!values.location.trim() || values.location.trim().length < 2) {
    errors.location = 'Location is required (e.g., Virtual or City).';
  }

  if (!values.startDate) {
    errors.startDate = 'Start date is required.';
  }

  if (!values.endDate) {
    errors.endDate = 'End date is required.';
  }

  if (!values.registrationDeadline) {
    errors.registrationDeadline = 'Registration deadline is required.';
  }

  if (values.startDate && values.endDate && new Date(values.endDate) <= new Date(values.startDate)) {
    errors.endDate = 'End date must be after start date.';
  }

  if (
    values.endDate &&
    values.registrationDeadline &&
    new Date(values.registrationDeadline) > new Date(values.endDate)
  ) {
    errors.registrationDeadline = 'Registration deadline cannot be after the event end date.';
  }

  if (!values.registrationLink.trim() || !isValidHttpUrl(values.registrationLink.trim())) {
    errors.registrationLink = 'Provide a valid http:// or https:// registration URL.';
  }

  if (values.bannerImage.trim() && !isValidHttpUrl(values.bannerImage.trim())) {
    errors.bannerImage = 'Banner image must be a valid http:// or https:// URL.';
  }

  if (values.organizerLogo.trim() && !isValidHttpUrl(values.organizerLogo.trim())) {
    errors.organizerLogo = 'Organizer logo must be a valid http:// or https:// URL.';
  }

  if (!values.eligibility.trim() || values.eligibility.trim().length < 3) {
    errors.eligibility = 'Eligibility criteria is required.';
  }

  if (!values.prizePool.trim()) {
    errors.prizePool = 'Prize pool information is required.';
  }

  const minSize = Number(values.teamSizeMin);
  const maxSize = Number(values.teamSizeMax);
  if (!Number.isInteger(minSize) || minSize < 1 || minSize > 10) {
    errors.teamSizeMin = 'Min team size must be between 1 and 10.';
  }
  if (!Number.isInteger(maxSize) || maxSize < 1 || maxSize > 10) {
    errors.teamSizeMax = 'Max team size must be between 1 and 10.';
  } else if (Number.isInteger(minSize) && maxSize < minSize) {
    errors.teamSizeMax = 'Max team size must be >= min team size.';
  }

  if (!values.categories || values.categories.length === 0) {
    errors.categories = 'Add at least one category.';
  }

  return errors;
}

function HackathonForm({ initialData = null, onSubmit, onCancel }) {
  const isEditing = Boolean(initialData);

  const [values, setValues] = useState({
    title: initialData?.title || '',
    organizerName: initialData?.organizerName || '',
    shortDescription: initialData?.shortDescription || '',
    description: initialData?.description || '',
    mode: initialData?.mode || 'online',
    location: initialData?.location || 'Virtual (Global)',
    startDate: toDateInputValue(initialData?.startDate),
    endDate: toDateInputValue(initialData?.endDate),
    registrationDeadline: toDateInputValue(initialData?.registrationDeadline),
    registrationLink: initialData?.registrationLink || '',
    bannerImage: initialData?.bannerImage || '',
    organizerLogo: initialData?.organizerLogo || '',
    eligibility: initialData?.eligibility || 'Open to undergraduate and graduate students',
    prizePool: initialData?.prizePool || '',
    teamSizeMin: initialData?.teamSizeMin ?? 1,
    teamSizeMax: initialData?.teamSizeMax ?? 4,
    requiredSkills: initialData?.requiredSkills ? [...initialData.requiredSkills] : [],
    categories: initialData?.categories ? [...initialData.categories] : [],
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

  async function handleFormSubmit(event) {
    event.preventDefault();
    setFormError('');

    const validationErrors = validateHackathonForm(values);
    if (Object.keys(validationErrors).length > 0) {
      setFieldErrors(validationErrors);
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit({
        title: values.title.trim(),
        organizerName: values.organizerName.trim(),
        shortDescription: values.shortDescription.trim(),
        description: values.description.trim(),
        mode: values.mode,
        location: values.location.trim(),
        startDate: new Date(`${values.startDate}T09:00:00.000Z`).toISOString(),
        endDate: new Date(`${values.endDate}T18:00:00.000Z`).toISOString(),
        registrationDeadline: new Date(`${values.registrationDeadline}T23:59:00.000Z`).toISOString(),
        registrationLink: values.registrationLink.trim(),
        bannerImage: values.bannerImage.trim(),
        organizerLogo: values.organizerLogo.trim(),
        eligibility: values.eligibility.trim(),
        prizePool: values.prizePool.trim(),
        teamSizeMin: Number(values.teamSizeMin),
        teamSizeMax: Number(values.teamSizeMax),
        requiredSkills: values.requiredSkills,
        categories: values.categories,
      });
    } catch (error) {
      const parsed = extractApiError(error, 'Failed to save hackathon.');
      setFormError(parsed.message);
      setFieldErrors(parsed.fieldErrors);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form className="admin-form" onSubmit={handleFormSubmit} noValidate>
      <div className="admin-form__header">
        <div>
          <h2 className="section-subtitle">{isEditing ? 'Edit Hackathon' : 'Create New Hackathon'}</h2>
          <p className="muted-text">
            Event status (Upcoming, Live Now, Completed) is automatically calculated from event dates.
          </p>
        </div>
      </div>

      {formError && (
        <div className="alert alert--error" role="alert">
          {formError}
        </div>
      )}

      <div className="form-grid-2">
        <FormField
          id="hack-title"
          name="title"
          label="Hackathon title"
          value={values.title}
          onChange={handleChange}
          placeholder="e.g. Campus AI Builders Challenge"
          error={fieldErrors.title}
          required
          disabled={isSubmitting}
        />

        <FormField
          id="hack-organizer"
          name="organizerName"
          label="Organizer name"
          value={values.organizerName}
          onChange={handleChange}
          placeholder="e.g. University Developer Society"
          error={fieldErrors.organizerName}
          required
          disabled={isSubmitting}
        />
      </div>

      <FormField
        id="hack-short-desc"
        name="shortDescription"
        label="Short description"
        value={values.shortDescription}
        onChange={handleChange}
        placeholder="Concise one-to-two sentence overview shown on listing cards"
        error={fieldErrors.shortDescription}
        required
        disabled={isSubmitting}
      />

      <div className="form-field">
        <label className="form-field__label" htmlFor="hack-description">
          Full description
          <span className="form-field__required" aria-hidden="true">
            *
          </span>
        </label>
        <textarea
          id="hack-description"
          name="description"
          rows={5}
          value={values.description}
          onChange={handleChange}
          placeholder="Detailed overview, tracks, judging criteria, and schedule highlights..."
          disabled={isSubmitting}
          aria-invalid={Boolean(fieldErrors.description)}
          className={`form-field__input form-field__textarea${
            fieldErrors.description ? ' form-field__input--error' : ''
          }`}
        />
        {fieldErrors.description && (
          <p className="form-field__error" role="alert">
            {fieldErrors.description}
          </p>
        )}
      </div>

      <div className="form-grid-3">
        <div className="form-field">
          <label className="form-field__label" htmlFor="hack-mode">
            Mode
            <span className="form-field__required" aria-hidden="true">
              *
            </span>
          </label>
          <select
            id="hack-mode"
            name="mode"
            value={values.mode}
            onChange={handleChange}
            disabled={isSubmitting}
            className="form-field__input"
          >
            <option value="online">Online</option>
            <option value="offline">In-Person (Offline)</option>
            <option value="hybrid">Hybrid</option>
          </select>
        </div>

        <FormField
          id="hack-location"
          name="location"
          label="Location"
          value={values.location}
          onChange={handleChange}
          placeholder="Virtual or City / Venue"
          error={fieldErrors.location}
          required
          disabled={isSubmitting}
        />

        <FormField
          id="hack-prize"
          name="prizePool"
          label="Prize pool"
          value={values.prizePool}
          onChange={handleChange}
          placeholder="e.g. $10,000 + Cloud Credits"
          error={fieldErrors.prizePool}
          required
          disabled={isSubmitting}
        />
      </div>

      <div className="form-grid-3">
        <FormField
          id="hack-start"
          name="startDate"
          label="Start date"
          type="date"
          value={values.startDate}
          onChange={handleChange}
          error={fieldErrors.startDate}
          required
          disabled={isSubmitting}
        />

        <FormField
          id="hack-end"
          name="endDate"
          label="End date"
          type="date"
          value={values.endDate}
          onChange={handleChange}
          error={fieldErrors.endDate}
          required
          disabled={isSubmitting}
        />

        <FormField
          id="hack-deadline"
          name="registrationDeadline"
          label="Registration deadline"
          type="date"
          value={values.registrationDeadline}
          onChange={handleChange}
          error={fieldErrors.registrationDeadline}
          required
          disabled={isSubmitting}
        />
      </div>

      <div className="form-grid-3">
        <FormField
          id="hack-min-team"
          name="teamSizeMin"
          label="Min team size"
          type="number"
          value={values.teamSizeMin}
          onChange={handleChange}
          error={fieldErrors.teamSizeMin}
          required
          disabled={isSubmitting}
        />

        <FormField
          id="hack-max-team"
          name="teamSizeMax"
          label="Max team size"
          type="number"
          value={values.teamSizeMax}
          onChange={handleChange}
          error={fieldErrors.teamSizeMax}
          required
          disabled={isSubmitting}
        />

        <FormField
          id="hack-eligibility"
          name="eligibility"
          label="Eligibility"
          value={values.eligibility}
          onChange={handleChange}
          placeholder="Who can participate?"
          error={fieldErrors.eligibility}
          required
          disabled={isSubmitting}
        />
      </div>

      <div className="form-grid-2">
        <FormField
          id="hack-reg-link"
          name="registrationLink"
          label="External registration URL"
          type="url"
          value={values.registrationLink}
          onChange={handleChange}
          placeholder="https://example.com/register"
          error={fieldErrors.registrationLink}
          required
          disabled={isSubmitting}
        />

        <FormField
          id="hack-banner"
          name="bannerImage"
          label="Banner image URL (optional)"
          type="url"
          value={values.bannerImage}
          onChange={handleChange}
          placeholder="https://example.com/banner.jpg"
          helperText="Leave blank to use HackSpot's themed event banner."
          error={fieldErrors.bannerImage}
          disabled={isSubmitting}
        />
      </div>

      <div className="form-grid-2">
        <TagListEditor
          id="hack-categories-input"
          label="Categories"
          items={values.categories}
          onChange={(next) => {
            setValues((prev) => ({ ...prev, categories: next }));
            setFieldErrors((prev) => ({ ...prev, categories: '' }));
          }}
          placeholder="e.g. Artificial Intelligence, FinTech"
          helperText="Required — add at least one category."
          error={fieldErrors.categories}
          disabled={isSubmitting}
        />

        <TagListEditor
          id="hack-skills-input"
          label="Required skills"
          items={values.requiredSkills}
          onChange={(next) => {
            setValues((prev) => ({ ...prev, requiredSkills: next }));
            setFieldErrors((prev) => ({ ...prev, requiredSkills: '' }));
          }}
          placeholder="e.g. React, Python, Node.js"
          helperText="Optional — helps students match their stack."
          error={fieldErrors.requiredSkills}
          disabled={isSubmitting}
        />
      </div>

      <div className="admin-form__actions">
        <button type="button" className="btn btn--secondary" onClick={onCancel} disabled={isSubmitting}>
          Cancel
        </button>
        <button type="submit" className="btn btn--primary" disabled={isSubmitting}>
          {isSubmitting
            ? isEditing
              ? 'Saving changes...'
              : 'Publishing hackathon...'
            : isEditing
              ? 'Save changes'
              : 'Create Hackathon'}
        </button>
      </div>
    </form>
  );
}

export default HackathonForm;
