import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import './FacultyDetailModal.css';

export default function FacultyDetailModal({ speaker, onClose }) {
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    if (!speaker) return undefined;

    const onKeyDown = (event) => {
      if (event.key === 'Escape') onCloseRef.current();
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [speaker]);

  if (!speaker) return null;

  return (
    <div
      className="kz-spk-modal-backdrop"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-speaker-name"
    >
      <div
        className="kz-spk-modal-card"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          className="kz-spk-modal-close"
          onClick={onClose}
          aria-label="Close modal"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        <div className="kz-spk-modal-header">
          <div
            className="kz-faculty-avatar-ring"
            style={{ width: '70px', height: '70px', minWidth: '70px' }}
          >
            {speaker.image ? (
              <img
                src={speaker.image}
                alt={speaker.name}
                className="kz-faculty-avatar-img"
                onError={(event) => {
                  event.currentTarget.style.display = 'none';
                }}
              />
            ) : (
              <div className="kz-faculty-avatar-fallback" style={{ fontSize: '1.4rem' }}>
                {speaker.initials}
              </div>
            )}
          </div>
          <div className="kz-spk-modal-title-wrap">
            <h3 id="modal-speaker-name" className="kz-spk-modal-name">
              {speaker.name}
            </h3>
            <p className="kz-spk-modal-role">{speaker.role}</p>
            {speaker.institution && (
              <p className="kz-spk-modal-institute">{speaker.institution}</p>
            )}
          </div>
        </div>

        <div className="kz-spk-modal-divider" />

        {speaker.topic && (
          <div className="kz-spk-modal-section">
            <span className="kz-faculty-topic-label">SESSION TOPIC</span>
            <h4 className="kz-spk-modal-topic">{speaker.topic}</h4>
          </div>
        )}

        {speaker.bio && (
          <div className="kz-spk-modal-section">
            <span className="kz-faculty-topic-label">FACULTY PROFILE</span>
            <p className="kz-spk-modal-bio">{speaker.bio}</p>
          </div>
        )}

        <div className="kz-spk-modal-footer">
          <div className="kz-faculty-sessions-row" style={{ margin: 0 }}>
            <svg
              className="kz-faculty-calendar-icon"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
            <span>
              {speaker.eventDate ? `${speaker.eventDate} • ` : ''}
              {speaker.sessions}
              {speaker.room ? ` • ${speaker.room}` : ''}
              {speaker.venue ? ` (${speaker.venue})` : ''}
            </span>
          </div>

          <div className="kz-spk-modal-actions">
            <Link
              to="/contact"
              className="kz-spk-modal-cta-btn"
              onClick={onClose}
            >
              Connect with Faculty Desk
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
