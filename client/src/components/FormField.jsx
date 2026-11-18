function FormField({
  id,
  name,
  label,
  type = 'text',
  value,
  onChange,
  placeholder = '',
  autoComplete,
  error = '',
  helperText = '',
  required = false,
  disabled = false,
}) {
  return (
    <div className="form-field">
      <label className="form-field__label" htmlFor={id}>
        {label}
        {required && (
          <span className="form-field__required" aria-hidden="true">
            *
          </span>
        )}
      </label>
      <input
        id={id}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        autoComplete={autoComplete}
        disabled={disabled}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${id}-error` : helperText ? `${id}-help` : undefined}
        className={`form-field__input${error ? ' form-field__input--error' : ''}`}
      />
      {error ? (
        <p id={`${id}-error`} className="form-field__error" role="alert">
          {error}
        </p>
      ) : (
        helperText && (
          <p id={`${id}-help`} className="form-field__helper">
            {helperText}
          </p>
        )
      )}
    </div>
  );
}

export default FormField;
