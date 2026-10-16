import React from 'react';
import './SpeakerCard.css';

/**
 * Reusable SpeakerCard Component
 * Ultra-clean, professional design for medical conference:
 * - Pure white card with single visible light shadow
 * - Clean avatar monogram
 * - Flag + country pill badge
 * - Name, role, institute
 * - Row of specialty tag pills
 * - "SPEAKING ON" topic block with microphone badge and arrow
 * - Session count, divider, and FEATURED tag
 * - Bio excerpt
 */
export default function SpeakerCard({
  id,
  initials,
  image,
  name,
  role,
  institute,
  country,
  flag = '',
  tags = [],
  topic,
  sessions = '3 sessions',
  tag = 'FEATURED',
  bio,
  isHighlighted = false,
  onViewDetails,
  className = '',
}) {
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
      : 'SC');

  const handleCardClick = () => {
    if (onViewDetails) {
      onViewDetails();
    }
  };

  return (
    <article
      className={`kz-speaker-card-v2 ${isHighlighted ? 'is-highlighted' : ''} ${className}`}
      onClick={handleCardClick}
    >
      {/* 1. TOP ROW: AVATAR & COUNTRY BADGE */}
      <div className="kz-card-top-row">
        {/* Avatar Monogram */}
        <div className="kz-card-avatar-wrap">
          <div className="kz-card-avatar-disc" aria-hidden="true">
            {image ? (
              <img src={image} alt={name} className="kz-card-avatar-img" />
            ) : (
              <span>{displayInitials}</span>
            )}
          </div>
        </div>

        {/* Flag + Country Badge */}
        {country && (
          <div className="kz-card-country-badge" title={`Country: ${country}`}>
            {flag && <span className="kz-card-flag">{flag}</span>}
            <span className="kz-card-country-name">{country}</span>
          </div>
        )}
      </div>

      {/* 2. SPEAKER IDENTITY: NAME, ROLE, INSTITUTION */}
      <div className="kz-card-identity">
        <h3 className="kz-card-name" title={name}>
          {name}
        </h3>
        <p className="kz-card-role">{role}</p>
        <p className="kz-card-institute">{institute}</p>
      </div>

      {/* 3. SPECIALTY TAG PILLS */}
      {tags && tags.length > 0 && (
        <div className="kz-card-tags-row">
          {tags.map((tagItem, idx) => (
            <span key={idx} className="kz-card-specialty-pill">
              {tagItem}
            </span>
          ))}
        </div>
      )}

      {/* Divider */}
      <div className="kz-card-soft-divider" aria-hidden="true" />

      {/* 4. "SPEAKING ON" TOPIC BLOCK */}
      {topic && (
        <div className="kz-card-topic-block">
          <span className="kz-card-topic-label">SPEAKING ON</span>
          <div className="kz-card-topic-row">
            <div className="kz-card-mic-icon-disc" aria-hidden="true">
              <svg
                width="15"
                height="15"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
                <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                <line x1="12" y1="19" x2="12" y2="23" />
                <line x1="8" y1="23" x2="16" y2="23" />
              </svg>
            </div>
            <h4 className="kz-card-topic-title">{topic}</h4>
            <span className="kz-card-topic-arrow" aria-hidden="true">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </span>
          </div>
        </div>
      )}

      {/* 5. SESSIONS & FEATURED ROW */}
      <div className="kz-card-meta-bar">
        {sessions && (
          <div className="kz-card-sessions-item">
            <svg
              className="kz-card-cal-icon"
              width="14"
              height="14"
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
        )}

        <span className="kz-card-meta-separator" aria-hidden="true">|</span>

        {tag && (
          <div className="kz-card-featured-tag">
            <span className="kz-card-star-icon" aria-hidden="true">★</span>
            <span>{tag}</span>
          </div>
        )}
      </div>

      {/* 6. BIO PARAGRAPH */}
      {bio && (
        <p className="kz-card-bio-paragraph">
          {bio}
        </p>
      )}
    </article>
  );
}
