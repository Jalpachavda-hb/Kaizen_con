import { useState } from 'react';
import './SpeakerCard.css';

/**
 * Reusable Faculty / Speaker Card Component
 * Pixel-accurate implementation matching KaizenCon design:
 * - Rounded white card with soft shadow and subtle border
 * - Circular avatar with rich purple border ring
 * - Vertical divider line between avatar and name/role
 * - Faculty name in bold purple and designation in neutral slate
 * - Horizontal dividers
 * - "SESSION TOPIC" section with vertical purple accent bar and right arrow
 * - Outline calendar icon with real session count
 * - Real bio text paragraph
 */
export default function SpeakerCard({
  id,
  initials,
  image,
  name,
  role,
  topic = 'Clinical Excellence & Surgical Innovation',
  sessions = '1 Session',
  bio,
  onViewDetails,
  className = '',
}) {
  const [imgError, setImgError] = useState(false);

  // Fallback initials from name
  const displayInitials =
    initials ||
    (name
      ? name
          .replace(/^Dr\.\s*/i, '')
          .split(' ')
          .map((n) => n[0])
          .slice(0, 2)
          .join('')
          .toUpperCase()
      : 'FC');

  const handleCardClick = () => {
    if (onViewDetails) {
      onViewDetails();
    }
  };

  return (
    <article
      data-speaker-id={id}
      className={`kz-faculty-card ${className}`}
      onClick={handleCardClick}
    >
      {/* 1. TOP ROW: AVATAR + VERTICAL DIVIDER + NAME & DESIGNATION */}
      <div className="kz-faculty-header">
        <div className="kz-faculty-avatar-ring">
          {image && !imgError ? (
            <img
              src={image}
              alt={name}
              className="kz-faculty-avatar-img"
              onError={() => setImgError(true)}
            />
          ) : (
            <div className="kz-faculty-avatar-fallback">{displayInitials}</div>
          )}
        </div>

        <div className="kz-faculty-vertical-divider" aria-hidden="true" />

        <div className="kz-faculty-identity">
          <h3 className="kz-faculty-name" title={name}>
            {name}
          </h3>
          <p className="kz-faculty-role" title={role}>
            {role}
          </p>
        </div>
      </div>

      {/* Horizontal Divider */}
      <div className="kz-faculty-divider" aria-hidden="true" />

      {/* 2. SESSION TOPIC ROW WITH VERTICAL ACCENT BAR & ARROW */}
      <div className="kz-faculty-topic-section">
        <div className="kz-faculty-topic-content">
          <span className="kz-faculty-topic-bar" aria-hidden="true" />
          <div className="kz-faculty-topic-text">
            <span className="kz-faculty-topic-label">SESSION TOPIC</span>
            <h4 className="kz-faculty-topic-title" title={topic}>
              {topic}
            </h4>
          </div>
        </div>

        <span className="kz-faculty-arrow-wrap" aria-hidden="true">
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="5" y1="12" x2="19" y2="12" />
            <polyline points="12 5 19 12 12 19" />
          </svg>
        </span>
      </div>

      {/* Horizontal Divider */}
      <div className="kz-faculty-divider" aria-hidden="true" />

      {/* 3. SESSIONS COUNT */}
      <div className="kz-faculty-sessions-row">
        <svg
          className="kz-faculty-calendar-icon"
          width="17"
          height="17"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
          <line x1="16" y1="2" x2="16" y2="6" />
          <line x1="8" y1="2" x2="8" y2="6" />
          <line x1="3" y1="10" x2="21" y2="10" />
        </svg>
        <span>{sessions}</span>
      </div>

      {/* 4. BIO PARAGRAPH */}
      {bio && (
        <p className="kz-faculty-bio" title={bio}>
          {bio}
        </p>
      )}
    </article>
  );
}
