import { useEffect, useState } from 'react';
import { getCategoryTheme } from '../utils/formatters.js';

function HackathonBanner({
  title = '',
  categories = [],
  bannerImage = '',
  organizerName = '',
  variant = 'card',
  children = null,
}) {
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    setImageError(false);
  }, [bannerImage]);

  const trimmedUrl = typeof bannerImage === 'string' ? bannerImage.trim() : '';
  const hasValidImage = Boolean(trimmedUrl) && !imageError;
  const theme = getCategoryTheme(categories);
  const primaryCategory = categories[0] || 'Hackathon';

  return (
    <div
      className={`hack-banner hack-banner--${variant} hack-banner--theme-${theme}`}
      aria-label={title ? `${title} banner` : 'Hackathon banner'}
    >
      {hasValidImage ? (
        <img
          src={trimmedUrl}
          alt={`${title} event banner`}
          className="hack-banner__img"
          loading="lazy"
          onError={() => setImageError(true)}
        />
      ) : (
        <div className="hack-banner__art" aria-hidden="true">
          <div className="hack-banner__grid-pattern" />
          <div className="hack-banner__orb" />
          <div className="hack-banner__art-caption">
            <span className="hack-banner__category-mark">{primaryCategory}</span>
            {variant === 'detail' && organizerName && (
              <span className="hack-banner__org-mark">{organizerName}</span>
            )}
          </div>
        </div>
      )}
      <div className="hack-banner__scrim" aria-hidden="true" />
      {children && <div className="hack-banner__overlay">{children}</div>}
    </div>
  );
}

export default HackathonBanner;
