import { useEffect, useState } from 'react';

function getInitials(name = '') {
  const parts = name
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (parts.length === 0) {
    return 'HS';
  }

  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }

  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

function UserAvatar({ name = '', src = '', size = 'md' }) {
  const [imageFailed, setImageFailed] = useState(false);

  useEffect(() => {
    setImageFailed(false);
  }, [src]);

  const trimmedSrc = typeof src === 'string' ? src.trim() : '';
  const showImage = Boolean(trimmedSrc) && !imageFailed;

  if (showImage) {
    return (
      <img
        src={trimmedSrc}
        alt={`${name || 'Student'} profile avatar`}
        className={`avatar avatar--${size} avatar--img`}
        onError={() => setImageFailed(true)}
      />
    );
  }

  return (
    <div
      className={`avatar avatar--${size} avatar--fallback`}
      aria-label={`${name || 'Student'} avatar`}
      role="img"
    >
      {getInitials(name)}
    </div>
  );
}

export default UserAvatar;
