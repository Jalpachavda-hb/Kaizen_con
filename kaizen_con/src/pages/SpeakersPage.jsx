import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import SpeakerCard from '../components/Home/SpeakerCard';
import { getSpeakers, getSchedules, getImageUrl } from '../Apipath';
import './SpeakersPage.css';

export default function SpeakersPage() {
  const [speakers, setSpeakers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeModalSpeaker, setActiveModalSpeaker] = useState(null);

  // Fetch dynamic speakers and schedules from API
  const fetchSpeakersData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const [speakersRes, schedulesRes] = await Promise.allSettled([
        getSpeakers(),
        getSchedules(),
      ]);

      const rawSpeakers =
        speakersRes.status === 'fulfilled'
          ? Array.isArray(speakersRes.value?.results)
            ? speakersRes.value.results
            : Array.isArray(speakersRes.value)
            ? speakersRes.value
            : []
          : [];

      const rawSchedules =
        schedulesRes.status === 'fulfilled'
          ? Array.isArray(schedulesRes.value?.results)
            ? schedulesRes.value.results
            : Array.isArray(schedulesRes.value)
            ? schedulesRes.value
            : []
          : [];

      // Filter active and non-deleted faculty
      const activeFaculty = rawSpeakers.filter(
        (spk) => spk.is_active !== false && !spk.is_deleted
      );

      const mappedList = activeFaculty.map((item, index) => {
        const firstName = item.first_name || '';
        const lastName = item.last_name || '';
        const fullName = `${firstName} ${lastName}`.trim() || 'Distinguished Faculty';

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
          'FC';

        const role = item.designation || 'Faculty Specialist';
        const institution = item.institution || item.institute || '';
        const speciality = item.speciality || '';
        const bio = item.bio || item.description || '';
        const imageUrl = item.profile_image_url ? getImageUrl(item.profile_image_url) : '';

        // Match real schedules for this faculty
        const speakerSchedules = rawSchedules.filter((sch) =>
          Array.isArray(sch.speakers) &&
          sch.speakers.some((s) => s.id === item.id || s.speaker_id === item.speaker_id)
        );

        const realTopic =
          speakerSchedules[0]?.title ||
          item.topic ||
          (speciality ? `${speciality} & Clinical Advances` : 'Clinical Excellence & Surgical Innovation');

        const sessionCount = speakerSchedules.length;
        const sessionsText = sessionCount > 0
          ? `${sessionCount} Session${sessionCount > 1 ? 's' : ''}`
          : '1 Session';

        const primarySchedule = speakerSchedules[0] || null;

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
          bio,
          topic: realTopic,
          image: imageUrl,
          initials,
          sessions: sessionsText,
          schedules: speakerSchedules,
          eventDate: primarySchedule?.event_date || item.event_date || '',
          startTime: primarySchedule?.start_time || item.start_time || '',
          endTime: primarySchedule?.end_time || item.end_time || '',
          venue: primarySchedule?.venue || (item.venue && item.venue !== 'string' ? item.venue : ''),
          room: primarySchedule?.room || (item.room && item.room !== 'string' ? item.room : ''),
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

  return (
    <div className="kz-speakers-page-root">
      {/* ----------------------------------------------------
          1. HERO SECTION
          ---------------------------------------------------- */}
      <section className="kz-spk-hero-section" aria-label="Conference Faculty Hero">
        <div className="kz-spk-hero-container">
          {/* Large Split-Color Headline */}
          <h1 className="kz-spk-hero-headline">
            <span className="kz-spk-hero-purple">Conference Faculty,</span>
            <span className="kz-spk-hero-magenta">now with intelligence.</span>
          </h1>

          {/* Subtitle */}
          <p className="kz-spk-hero-subtitle">
            Leading surgeons, clinicians, researchers, and technology experts
            united by a shared commitment to advancing surgical intelligence and clinical excellence.
          </p>
        </div>
      </section>

      {/* ----------------------------------------------------
          2. FEATURED FACULTY & CARDS GRID SECTION
          ---------------------------------------------------- */}
      <section className="kz-spk-main-section" aria-label="Keynote and Featured Faculty">
        <div className="kz-spk-main-container">
          {/* Section Header */}
          <div className="kz-spk-section-header">
            <div className="kz-spk-pill-badge-wrap">
              <span className="kz-spk-pill-badge">FACULTY</span>
            </div>
            <h2 className="kz-spk-section-title">Keynote &amp; featured faculty</h2>
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
                  Loading Conference Faculty...
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
                  No faculty found at this time.
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
                  topic={spk.topic}
                  sessions={spk.sessions}
                  bio={spk.bio}
                  onViewDetails={() => setActiveModalSpeaker(spk)}
                />
              ))
            )}
          </div>

          {/* Cross-page Navigation Banner */}
          <section className="kz-spk-bottom-cta-banner" aria-label="Connect with faculty and secretariat">
            <div className="kz-spk-cta-content">
              <span className="kz-spk-cta-badge">ACADEMIC &amp; CLINICAL COLLABORATION</span>
              <h3 className="kz-spk-cta-title">Want to engage with our global faculty?</h3>
              <p className="kz-spk-cta-desc">
                Submit session queries, propose panel discussions, or connect with our faculty relations team directly.
              </p>
              <div className="kz-spk-cta-actions">
                <Link to="/contact" className="kz-spk-cta-primary-btn">
                  <span>Contact Faculty Desk</span>
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
          6. SPEAKER DETAILS MODAL (Real dynamic faculty data)
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
                className="kz-faculty-avatar-ring"
                style={{ width: '70px', height: '70px', minWidth: '70px' }}
              >
                {activeModalSpeaker.image ? (
                  <img
                    src={activeModalSpeaker.image}
                    alt={activeModalSpeaker.name}
                    className="kz-faculty-avatar-img"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                ) : (
                  <div className="kz-faculty-avatar-fallback" style={{ fontSize: '1.4rem' }}>
                    {activeModalSpeaker.initials}
                  </div>
                )}
              </div>
              <div className="kz-spk-modal-title-wrap">
                <h3 id="modal-speaker-name" className="kz-spk-modal-name">
                  {activeModalSpeaker.name}
                </h3>
                <p className="kz-spk-modal-role">{activeModalSpeaker.role}</p>
                {activeModalSpeaker.institution && (
                  <p className="kz-spk-modal-institute">
                    {activeModalSpeaker.institution}
                  </p>
                )}
              </div>
            </div>

            <div className="kz-spk-modal-divider" />

            {/* Title / Topic */}
            {activeModalSpeaker.topic && (
              <div className="kz-spk-modal-section">
                <span className="kz-faculty-topic-label">SESSION TOPIC</span>
                <h4 className="kz-spk-modal-topic">{activeModalSpeaker.topic}</h4>
              </div>
            )}

            {/* Description / Bio */}
            {activeModalSpeaker.bio && (
              <div className="kz-spk-modal-section">
                <span className="kz-faculty-topic-label">FACULTY PROFILE</span>
                <p className="kz-spk-modal-bio">
                  {activeModalSpeaker.bio}
                </p>
              </div>
            )}

            {/* Session Info & Footer */}
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
                  Connect with Faculty Desk
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
