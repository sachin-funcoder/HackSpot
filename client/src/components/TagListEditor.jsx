import { useState } from 'react';

const MAX_TAG_COUNT = 25;
const MAX_TAG_LENGTH = 50;

function TagListEditor({
  id,
  label,
  items = [],
  onChange,
  placeholder = 'Type an entry and click Add',
  helperText = '',
  error = '',
  disabled = false,
}) {
  const [draft, setDraft] = useState('');
  const [inputError, setInputError] = useState('');

  function handleAdd() {
    const trimmed = draft.trim();
    setInputError('');

    if (!trimmed) {
      setInputError(`Enter a ${label.toLowerCase().replace(/s$/, '')} before adding.`);
      return;
    }

    if (trimmed.length > MAX_TAG_LENGTH) {
      setInputError(`Each entry must be ${MAX_TAG_LENGTH} characters or fewer.`);
      return;
    }

    if (items.length >= MAX_TAG_COUNT) {
      setInputError(`You can add at most ${MAX_TAG_COUNT} entries.`);
      return;
    }

    const exists = items.some((item) => item.toLowerCase() === trimmed.toLowerCase());
    if (exists) {
      setInputError(`"${trimmed}" is already added.`);
      return;
    }

    onChange([...items, trimmed]);
    setDraft('');
  }

  function handleKeyDown(event) {
    if (event.key === 'Enter') {
      event.preventDefault();
      handleAdd();
    }
  }

  function handleRemove(itemToRemove) {
    setInputError('');
    onChange(items.filter((item) => item !== itemToRemove));
  }

  const displayedError = inputError || error;

  return (
    <div className="form-field">
      <label className="form-field__label" htmlFor={id}>
        {label}
        <span className="tag-editor__count">
          ({items.length}/{MAX_TAG_COUNT})
        </span>
      </label>

      <div className="tag-editor__input-row">
        <input
          id={id}
          type="text"
          value={draft}
          onChange={(event) => {
            setDraft(event.target.value);
            if (inputError) {
              setInputError('');
            }
          }}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          aria-invalid={Boolean(displayedError)}
          className={`form-field__input${displayedError ? ' form-field__input--error' : ''}`}
        />
        <button
          type="button"
          className="btn btn--secondary"
          onClick={handleAdd}
          disabled={disabled}
        >
          Add
        </button>
      </div>

      {displayedError ? (
        <p className="form-field__error" role="alert">
          {displayedError}
        </p>
      ) : (
        helperText && <p className="form-field__helper">{helperText}</p>
      )}

      {items.length > 0 ? (
        <div className="tag-list tag-list--editable">
          {items.map((item) => (
            <span key={item} className="tag-chip tag-chip--removable">
              <span>{item}</span>
              <button
                type="button"
                className="tag-chip__remove"
                onClick={() => handleRemove(item)}
                disabled={disabled}
                aria-label={`Remove ${item}`}
                title={`Remove ${item}`}
              >
                &times;
              </button>
            </span>
          ))}
        </div>
      ) : (
        <p className="muted-text">No {label.toLowerCase()} added yet.</p>
      )}
    </div>
  );
}

export default TagListEditor;
