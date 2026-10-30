import { useState, useEffect, useMemo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import SpeakerCard from '../components/Home/SpeakerCard';
import { getSpeakers, getImageUrl } from '../Apipath';
import './SpeakersPage.css';

// Default fallback institutions if dynamic data is empty
const DEFAULT_INSTITUTIONS = [
  { name: 'Global Institute of Surgical Innovation', country: 'India', count: '4 speakers' },
  { name: 'International Centre for Robotic Surgery', country: 'France', count: '3 speakers' },
  { name: 'Future Health Research Institute', country: 'Nigeria', count: '2 speakers' },
  { name: 'Centre for Intelligent Surgery', country: 'Singapore', count: '2 speakers' },
];

export default function SpeakersPage() {
  const [speakers, setSpeakers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeModalSpeaker, setActiveModalSpeaker] = useState(null);

  // Fetch dynamic speakers from API
  const fetchSpeakersData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await getSpeakers();

      // Support either { results: [...] } or direct array
      const rawList = Array.isArray(res) ? res : (res?.results || []);

      const mappedList = rawList.map((item, index) => {
        const firstName = item.first_name || '';
        const lastName = item.last_name || '';
        const fullName = `${firstName} ${lastName}`.trim() || 'Distinguished Speaker';

        // Initials fallback
        const initials =
          `${firstName[0] || ''}${lastName[0] || ''}`.toUpperCase() ||
          fullName
            .replace(/^Dr\.\s*/i, '')
            .split(' ')
            .map((n) => n[0])
            .slice(0, 2)
            .join('')
            .toUpperCase() ||
          'SC';

        const role = item.designation || 'Surgeon / Specialist';
        const institution = item.institution || item.institute || '';
        const speciality = item.speciality || '';
        const bio = item.bio || '';
        const description = item.description || item.bio || '';
        const title = item.title || item.topic || 'Clinical Excellence & Surgical Innovation';
        const imageUrl = item.profile_image_url ? getImageUrl(item.profile_image_url) : '';

        // Format session timing
        let sessions = '1 session';
        if (item.start_time && item.end_time) {
          const start = item.start_time.slice(0, 5);
          const end = item.end_time.slice(0, 5);
          sessions = `${start} - ${end}`;
        }

        return {
          id: item.id || item.speaker_id || `spk-${index + 1}`,
          speakerId: item.speaker_id,
          name: fullName,
          firstName,
          lastName,
          role,
          designation: role,
          institute: institution,
          institution,
          speciality,
          tags: speciality ? [speciality] : [],
          bio,
          description,
          fullBio: description,
          title,
          topic: title,
          image: imageUrl,
          profile_image_url: imageUrl,
          initials,
          sessions,
          tag: item.session_status === 'scheduled' ? 'FEATURED' : 'SPEAKER',
          eventDate: item.event_date || '',
          startTime: item.start_time || '',
          endTime: item.end_time || '',
          venue: item.venue && item.venue !== 'string' ? item.venue : '',
          room: item.room && item.room !== 'string' ? item.room : '',
          country: item.venue && item.venue !== 'string' ? item.venue : 'International',
          isHighlighted: index === 0,
        };
      });

      setSpeakers(mappedList);
    } catch (err) {
      console.error('Failed to load speakers:', err);
      setError(err?.message || 'Failed to load speakers. Please verify your connection.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSpeakersData();
  }, [fetchSpeakersData]);

  // Derived dynamic institutions from speakers list
  const dynamicInstitutions = useMemo(() => {
    if (!speakers || speakers.length === 0) return DEFAULT_INSTITUTIONS;
    const map = new Map();
    speakers.forEach((s) => {
      const inst = s.institution?.trim();
      if (inst && inst.toLowerCase() !== 'string') {
        map.set(inst, (map.get(inst) || 0) + 1);
      }
    });

    if (map.size === 0) return DEFAULT_INSTITUTIONS;  

    return Array.from(map.entries()).map(([name, count]) => ({
      name,
      country: 'Partner Institution',
      count: `${count} speaker${count > 1 ? 's' : ''}`,
    }));
  }, [speakers]);

  return (
    <div className="kz-speakers-page-root">
      {/* ----------------------------------------------------
          1. HERO SECTION
          ---------------------------------------------------- */}
      <section className="kz-spk-hero-section" aria-label="Conference Speakers Hero">
        <div className="kz-spk-hero-container">
          {/* Breadcrumb Navigation */}
          <nav className="kz-spk-breadcrumb" aria-label="Breadcrumb">
            <Link to="/" className="kz-spk-crumb-link">Home</Link>
            <span className="kz-spk-crumb-sep">/</span>
            <span className="kz-spk-crumb-current">Speakers</span>
          </nav>

          {/* Pill Badge */}
          <div className="kz-spk-pill-badge-wrap">
            <span className="kz-spk-pill-badge">EXPERT FACULTY</span>
          </div>

          {/* Large Split-Color Headline */}
          <h1 className="kz-spk-hero-headline">
            <span className="kz-spk-hero-purple">Conference Speakers,</span>
            <span className="kz-spk-hero-magenta">now with intelligence.</span>
          </h1>

          {/* Subtitle */}
          <p className="kz-spk-hero-subtitle">
            Leading surgeons, clinicians, researchers, and technology experts
            united by a shared commitment to advancing surgical intelligence and clinical excellence.
          </p>

          {/* Faculty Key Metrics Pill Strip */}
          <div className="kz-spk-metrics-strip">
            <div className="kz-spk-metric-pill">
              <span className="kz-spk-metric-num">
                {speakers.length > 0 ? `${speakers.length}+` : '150+'}
              </span>
              <span className="kz-spk-metric-label">Global Faculty</span>
            </div>
            <div className="kz-spk-metric-pill">
              <span className="kz-spk-metric-num">40+</span>
              <span className="kz-spk-metric-label">Countries Represented</span>
            </div>
            <div className="kz-spk-metric-pill">
              <span className="kz-spk-metric-num">32</span>
              <span className="kz-spk-metric-label">Scientific Sessions</span>
            </div>
            <div className="kz-spk-metric-pill">
              <span className="kz-spk-metric-num">100%</span>
              <span className="kz-spk-metric-label">CME Accredited</span>
            </div>
          </div>
        </div>
      </section>

      {/* ----------------------------------------------------
          2. FEATURED FACULTY & CARDS GRID SECTION
          ---------------------------------------------------- */}
      <section className="kz-spk-main-section" aria-label="Keynote and Featured Speakers">
        <div className="kz-spk-main-container">
          {/* Section Header */}
          <div className="kz-spk-section-header">
            <div className="kz-spk-pill-badge-wrap">
              <span className="kz-spk-pill-badge">FEATURED FACULTY</span>
            </div>
            <h2 className="kz-spk-section-title">Keynote &amp; featured speakers</h2>
          </div>

          {/* ----------------------------------------------------
              3. SPEAKERS GRID (Dynamic Data from API)
              ---------------------------------------------------- */}
          <div className="kz-spk-grid">
            {loading ? (
              <div
                className="kz-spk-state-box"
                style={{
                  gridColumn: '1 / -1',
                  textAlign: 'center',
                  padding: '70px 20px',
                  background: '#FFFFFF',
                  borderRadius: '20px',
                  border: '1px solid #ECE7EF',
                }}
              >
                <div
                  className="kz-spk-spinner"
                  style={{
                    width: '42px',
                    height: '42px',
                    border: '3px solid rgba(182, 52, 115, 0.18)',
                    borderTopColor: '#B63473',
                    borderRadius: '50%',
                    animation: 'kzSpin 0.8s linear infinite',
                    margin: '0 auto 16px',
                  }}
                />
                <p style={{ color: '#42264C', fontSize: '1.05rem', fontWeight: 600, margin: '0 0 6px 0' }}>
                  Loading Conference Speakers...
                </p>
                <p style={{ color: '#7A6C82', fontSize: '0.9rem', margin: 0 }}>
                  Fetching verified faculty profiles from server
                </p>
              </div>
            ) : error ? (
              <div
                className="kz-spk-state-box"
                style={{
                  gridColumn: '1 / -1',
                  textAlign: 'center',
                  padding: '50px 24px',
                  background: '#FFF5F8',
                  borderRadius: '20px',
                  border: '1px solid #F3CFDE',
                }}
              >
                <div style={{ fontSize: '2rem', marginBottom: '10px' }}>⚠️</div>
                <h3 style={{ color: '#881F54', fontSize: '1.15rem', fontWeight: 700, margin: '0 0 8px 0' }}>
                  Unable to load faculty list
                </h3>
                <p style={{ color: '#6A5672', fontSize: '0.92rem', maxWidth: '460px', margin: '0 auto 18px auto' }}>
                  {error}
                </p>
                <button
                  type="button"
                  onClick={fetchSpeakersData}
                  style={{
                    background: '#B63473',
                    color: '#FFFFFF',
                    border: 'none',
                    padding: '10px 24px',
                    borderRadius: '30px',
                    fontWeight: 650,
                    cursor: 'pointer',
                    fontSize: '0.92rem',
                    boxShadow: '0 4px 14px rgba(182, 52, 115, 0.28)',
                  }}
                >
                  Retry Connection
                </button>
              </div>
            ) : speakers.length === 0 ? (
              <div
                className="kz-spk-state-box"
                style={{
                  gridColumn: '1 / -1',
                  textAlign: 'center',
                  padding: '60px 20px',
                  background: '#FFFFFF',
                  borderRadius: '20px',
                  border: '1px solid #ECE7EF',
                }}
              >
                <p style={{ color: '#42264C', fontSize: '1.05rem', fontWeight: 600 }}>
                  No speakers found at this time.
                </p>
              </div>
            ) : (
              speakers.map((spk) => (
                <SpeakerCard
                  key={spk.id}
                  id={spk.id}
                  initials={spk.initials}
                  image={spk.image}
                  name={spk.name}
                  role={spk.role}
                  institute={spk.institution}
                  country={spk.country}
                  tags={spk.tags}
                  topic={spk.title}
                  sessions={spk.sessions}
                  tag={spk.tag}
                  bio={spk.bio}
                  isHighlighted={spk.isHighlighted}
                  onViewDetails={() => setActiveModalSpeaker(spk)}
                />
              ))
            )}
          </div>

          {/* ----------------------------------------------------
              4. CONFERENCE STATS RIBBON
              ---------------------------------------------------- */}
          <section className="kz-spk-stats-ribbon" aria-label="Conference Key Statistics">
            <div className="kz-spk-stat-col">
              <div className="kz-spk-stat-icon-wrap" aria-hidden="true">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#B63473" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="2" y1="12" x2="22" y2="12" />
                  <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                </svg>
              </div>
              <div className="kz-spk-stat-text-wrap">
                <span className="kz-spk-stat-value">40+</span>
                <span className="kz-spk-stat-label">Countries represented</span>
              </div>
            </div>

            <div className="kz-spk-stat-col">
              <div className="kz-spk-stat-icon-wrap" aria-hidden="true">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#B63473" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                  <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
              </div>
              <div className="kz-spk-stat-text-wrap">
                <span className="kz-spk-stat-value">
                  {speakers.length > 0 ? `${speakers.length}+` : '150+'}
                </span>
                <span className="kz-spk-stat-label">Expert speakers</span>
              </div>
            </div>

            <div className="kz-spk-stat-col">
              <div className="kz-spk-stat-icon-wrap" aria-hidden="true">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#B63473" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
                  <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                  <line x1="12" y1="19" x2="12" y2="23" />
                  <line x1="8" y1="23" x2="16" y2="23" />
                </svg>
              </div>
              <div className="kz-spk-stat-text-wrap">
                <span className="kz-spk-stat-value">
                  {speakers.length > 0 ? speakers.length : 8}
                </span>
                <span className="kz-spk-stat-label">Keynote speakers</span>
              </div>
            </div>

            <div className="kz-spk-stat-col">
              <div className="kz-spk-stat-icon-wrap" aria-hidden="true">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#B63473" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
              </div>
              <div className="kz-spk-stat-text-wrap">
                <span className="kz-spk-stat-value">6</span>
                <span className="kz-spk-stat-label">Panel discussions</span>
              </div>
            </div>
          </section>

          {/* ----------------------------------------------------
              5. REPRESENTED INSTITUTIONS SECTION
              ---------------------------------------------------- */}
          <section className="kz-spk-institutions-section" aria-label="Represented institutions">
            <div className="kz-spk-institutions-header">
              <div className="kz-spk-pill-badge-wrap">
                <span className="kz-spk-pill-badge">INSTITUTIONS</span>
              </div>
              <h2 className="kz-spk-institutions-title">Represented institutions</h2>
              <div className="kz-spk-institutions-accent-line" aria-hidden="true" />
            </div>

            <div className="kz-spk-institutions-grid">
              {dynamicInstitutions.slice(0, 4).map((inst, idx) => (
                <div key={idx} className="kz-spk-institution-card">
                  <div className="kz-spk-inst-icon-wrap" aria-hidden="true">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#B63473" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M3 21h18" />
                      <path d="M5 21V10l7-5 7 5v11" />
                      <path d="M9 21v-4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v4" />
                      <line x1="9" y1="10" x2="9" y2="12" />
                      <line x1="15" y1="10" x2="15" y2="12" />
                    </svg>
                  </div>
                  <h3 className="kz-spk-inst-name">{inst.name}</h3>
                  <p className="kz-spk-inst-country">{inst.country || 'International'}</p>
                  <div className="kz-spk-inst-divider" aria-hidden="true" />
                  <span className="kz-spk-inst-count">{inst.count}</span>
                </div>
              ))}
            </div>
          </section>

          {/* Cross-page Navigation Banner */}
          <section className="kz-spk-bottom-cta-banner" aria-label="Connect with speakers and secretariat">
            <div className="kz-spk-cta-content">
              <span className="kz-spk-cta-badge">ACADEMIC &amp; CLINICAL COLLABORATION</span>
              <h3 className="kz-spk-cta-title">Want to engage with our global faculty?</h3>
              <p className="kz-spk-cta-desc">
                Submit session queries, propose panel discussions, or connect with our speaker relations team directly.
              </p>
              <div className="kz-spk-cta-actions">
                <Link to="/contact" className="kz-spk-cta-primary-btn">
                  <span>Contact Speaker Desk</span>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <line x1="5" y1="12" x2="19" y2="12" />
                    <polyline points="12 5 19 12 12 19" />
                  </svg>
                </Link>
                
              </div>
            </div>
          </section>
        </div>
      </section>

      {/* ----------------------------------------------------
          6. SPEAKER DETAILS MODAL (Full dynamic speaker data)
          ---------------------------------------------------- */}
      {activeModalSpeaker && (
        <div
          className="kz-spk-modal-backdrop"
          onClick={() => setActiveModalSpeaker(null)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-speaker-name"
        >
          <div
            className="kz-spk-modal-card"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Close Button */}
            <button
              type="button"
              className="kz-spk-modal-close"
              onClick={() => setActiveModalSpeaker(null)}
              aria-label="Close modal"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>

            {/* Modal Header */}
            <div className="kz-spk-modal-header">
              <div
                className="kz-card-avatar-ring"
                style={{ width: '68px', height: '68px', flexShrink: 0 }}
              >
                <div
                  className="kz-card-avatar-disc"
                  style={{ fontSize: '1.4rem', width: '68px', height: '68px', overflow: 'hidden' }}
                >
                  {activeModalSpeaker.image ? (
                    <img
                      src={activeModalSpeaker.image}
                      alt={activeModalSpeaker.name}
                      style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }}
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  ) : (
                    <span>{activeModalSpeaker.initials}</span>
                  )}
                </div>
              </div>
              <div className="kz-spk-modal-title-wrap">
                <div className="kz-spk-modal-tags">
                  {activeModalSpeaker.speciality && (
                    <span className="kz-card-country-badge" style={{ backgroundColor: '#FDF2F8', color: '#B63473' }}>
                      🔬 {activeModalSpeaker.speciality}
                    </span>
                  )}
                  <span className="kz-card-featured-tag">
                    ★ {activeModalSpeaker.tag}
                  </span>
                </div>
                <h3 id="modal-speaker-name" className="kz-spk-modal-name">
                  {activeModalSpeaker.name}
                </h3>
                <p className="kz-spk-modal-role">{activeModalSpeaker.role}</p>
                <p className="kz-spk-modal-institute">
                  {activeModalSpeaker.institution || activeModalSpeaker.institute}
                </p>
              </div>
            </div>

            {/* Specialty / Tags */}
            {activeModalSpeaker.tags && activeModalSpeaker.tags.length > 0 && (
              <div className="kz-card-tags-row" style={{ marginTop: '8px' }}>
                {activeModalSpeaker.tags.map((t, idx) => (
                  <span key={idx} className="kz-card-specialty-pill">
                    {t}
                  </span>
                ))}
              </div>
            )}

            <div className="kz-spk-modal-divider" />

            {/* Title / Topic */}
            {activeModalSpeaker.title && (
              <div className="kz-spk-modal-section">
                <span className="kz-card-topic-label">SPEAKING TOPIC</span>
                <h4 className="kz-spk-modal-topic">{activeModalSpeaker.title}</h4>
              </div>
            )}

            {/* Description / Bio */}
            {(activeModalSpeaker.description || activeModalSpeaker.bio) && (
              <div className="kz-spk-modal-section">
                <span className="kz-card-topic-label">FACULTY PROFILE &amp; CLINICAL FOCUS</span>
                <p className="kz-spk-modal-bio">
                  {activeModalSpeaker.description || activeModalSpeaker.bio}
                </p>
              </div>
            )}

            {/* Session Info & Footer */}
            <div className="kz-spk-modal-footer">
              <div className="kz-card-sessions-item">
                <svg
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
                  {activeModalSpeaker.eventDate ? `${activeModalSpeaker.eventDate} • ` : ''}
                  {activeModalSpeaker.sessions}
                  {activeModalSpeaker.room ? ` • ${activeModalSpeaker.room}` : ''}
                  {activeModalSpeaker.venue ? ` (${activeModalSpeaker.venue})` : ''}
                </span>
              </div>

              <div className="kz-spk-modal-actions">
                <Link
                  to="/contact"
                  className="kz-spk-modal-cta-btn"
                  onClick={() => setActiveModalSpeaker(null)}
                >
                  Connect with Speaker Desk
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
