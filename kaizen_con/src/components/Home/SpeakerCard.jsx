import React from 'react';
import './SpeakerCard.css';

/**
 * Reusable SpeakerCard Component
 * Matches KaizenCon Featured Speaker Card UI exactly.
 *
 * @param {Object} props
 * @param {string} props.name - Speaker's full name (e.g., 'Dr. Arjun Mehta')
 * @param {string} props.role - Speaker's medical role/specialty (e.g., 'Gastrointestinal & Robotic Surgeon')
 * @param {string} props.institute - Institution or Hospital name
 * @param {string} [props.initials] - 2-letter initials if no photo is available (e.g., 'AM')
 * @param {string} [props.image] - Optional profile photo URL
 * @param {'light'|'magenta'|'purple'} [props.theme='light'] - Theme variant ('light' for lilac/plum, 'magenta' for vibrant pink)
 * @param {string} [props.link] - Optional link destination
 * @param {function} [props.onViewDetails] - Optional click handler for details
 * @param {string} [props.className] - Optional additional CSS class
 */
export default function SpeakerCard({
  name,
  role,
  institute,
  initials,
  image,
  theme = 'light',
  link = '#speaker-details',
  onViewDetails,
  className = '',
}) {
  // Normalize theme variant ('purple' aliases to 'light' to match AM/DO lilac disc)
  const isMagenta = theme === 'magenta';
  const themeClass = isMagenta ? 'kz-card-theme-magenta' : 'kz-card-theme-light';

  // Fallback initials from name if not explicitly passed
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

  const handleClick = (e) => {
    if (onViewDetails) {
      e.preventDefault();
      onViewDetails({ name, role, institute });
    }
  };

  return (
    <article className={`kz-speaker-card ${themeClass} ${className}`}>
      {/* Top Row: Circular Avatar Monogram / Photo */}
      <div className="kz-speaker-avatar-wrap">
        {image ? (
          <img src={image} alt={name} className="kz-speaker-avatar-img" />
        ) : (
          <div className="kz-speaker-avatar-disc" aria-hidden="true">
            <span>{displayInitials}</span>
          </div>
        )}
      </div>

      {/* Card Details */}
      <div className="kz-speaker-card-content">
        <h3 className="kz-speaker-name">{name}</h3>
        <p className="kz-speaker-role">{role}</p>

        {/* Brand Accent Divider Bar */}
        <div className="kz-speaker-accent-bar" aria-hidden="true" />

        <p className="kz-speaker-institute">{institute}</p>
      </div>

      {/* Card Bottom Row: "View details →" link and circular arrow button */}
      <div className="kz-speaker-card-footer">
        <a
          href={link}
          className="kz-speaker-details-link"
          onClick={handleClick}
          aria-label={`View details for ${name}`}
        >
          <span>View details</span>
          <svg
            className="kz-link-arrow"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <line x1="5" y1="12" x2="19" y2="12" />
            <polyline points="12 5 19 12 12 19" />
          </svg>
        </a>

        <button
          type="button"
          className="kz-speaker-circle-btn"
          onClick={handleClick}
          aria-label={`View profile of ${name}`}
        >
          <svg
            width="17"
            height="17"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <line x1="5" y1="12" x2="19" y2="12" />
            <polyline points="12 5 19 12 12 19" />
          </svg>
        </button>
      </div>
    </article>
  );
}
