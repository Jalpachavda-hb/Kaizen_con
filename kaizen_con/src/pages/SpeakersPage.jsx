import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import SpeakerCard from '../components/Home/SpeakerCard';
import './SpeakersPage.css';

// Complete dataset for KaizenCon 2027 Keynote & Featured Speakers with flags and specialty tags
const SPEAKERS_DATA = [
  {
    id: 'spk-01',
    initials: 'AM',
    name: 'Dr. Arjun Mehta',
    role: 'Gastrointestinal & Robotic Surgeon',
    institute: 'Global Institute of Surgical Innovation',
    country: 'India',
    flag: '🇮🇳',
    tags: ['Robotic Surgery', 'GI Oncology', 'Minimally Invasive Surgery'],
    topic: 'AI-Guided Robotic Colorectal Surgery',
    sessions: '3 sessions',
    tag: 'FEATURED',
    bio: 'Dr. Arjun Mehta is a leading gastrointestinal and robotic surgeon with over 18 years of experience in minimally invasive surgery, robotic techniques, and colorectal oncology...',
    fullBio: 'Dr. Arjun Mehta is a leading gastrointestinal and robotic surgeon with over 18 years of clinical experience in minimally invasive and robotic colorectal resection. He heads the Surgical Technology Innovation Group at the Global Institute of Surgical Innovation.',
    theme: 'dark',
    category: 'Robotics',
    isHighlighted: false,
  },
  {
    id: 'spk-02',
    initials: 'SL',
    name: 'Dr. Sofia Laurent',
    role: 'Surgical Oncologist & AI Researcher',
    institute: 'International Centre for Robotic Surgery',
    country: 'France',
    flag: '🇫🇷',
    tags: ['Surgical Oncology', 'Predictive AI', 'Clinical Trials'],
    topic: 'Machine Learning in Surgical Decision-Making',
    sessions: '3 sessions',
    tag: 'FEATURED',
    bio: 'Dr. Sofia Laurent combines her clinical practice in surgical oncology with cutting-edge AI research. Based at the International Centre for Robotic Surgery...',
    fullBio: 'Dr. Sofia Laurent combines her clinical practice in surgical oncology with cutting-edge AI research. Based at the International Centre for Robotic Surgery, she pioneered algorithmic predictive margins for complex pelvic malignancies.',
    theme: 'magenta',
    category: 'AI & Data',
    isHighlighted: true,
  },
  {
    id: 'spk-03',
    initials: 'DO',
    name: 'Dr. Daniel Okafor',
    role: 'Laparoscopic & Colorectal Surgeon',
    institute: 'Future Health Research Institute',
    country: 'Nigeria',
    flag: '🇳🇬',
    tags: ['Colorectal Surgery', 'Laparoscopy', 'Comparative Trials'],
    topic: 'Robotics vs Laparoscopy: A Clinical Comparison',
    sessions: '3 sessions',
    tag: 'FEATURED',
    bio: "Dr. Daniel Okafor is one of Africa's most respected colorectal surgeons, renowned for his evidence-based approach to surgical training, laparoscopic innovation...",
    fullBio: "Dr. Daniel Okafor is one of Africa's most respected colorectal surgeons, renowned for his evidence-based approach to comparative clinical trials between conventional laparoscopy and robotic-assisted surgical platforms.",
    theme: 'dark',
    category: 'Robotics',
    isHighlighted: false,
  },
  {
    id: 'spk-04',
    initials: 'MC',
    name: 'Dr. Maya Chen',
    role: 'Computational Surgeon & Imaging Specialist',
    institute: 'Centre for Intelligent Surgery',
    country: 'Singapore',
    flag: '🇸🇬',
    tags: ['Computational Surgery', 'Medical Imaging', 'Computer Vision'],
    topic: 'AI-Enhanced Intraoperative Imaging',
    sessions: '3 sessions',
    tag: 'FEATURED',
    bio: 'Dr. Maya Chen is a pioneer at the intersection of computational surgery and medical imaging. Her laboratory at the Centre for Intelligent Surgery...',
    fullBio: 'Dr. Maya Chen is a pioneer at the intersection of computational surgery and medical imaging. Her laboratory at the Centre for Intelligent Surgery invents real-time hyper-spectral overlay systems for intraoperative vascular guidance.',
    theme: 'magenta',
    category: 'AI & Data',
    isHighlighted: false,
  },
  {
    id: 'spk-05',
    initials: 'ER',
    name: 'Dr. Elena Rossi',
    role: 'Digital Health Strategist & Surgeon',
    institute: 'Global Institute of Surgical Innovation',
    country: 'Italy',
    flag: '🇮🇹',
    tags: ['Digital Health', 'Clinical Workflows', 'Smart OR Integration'],
    topic: 'Digital Transformation of Surgical Workflows',
    sessions: '2 sessions',
    tag: 'FEATURED',
    bio: 'Dr. Elena Rossi bridges the worlds of clinical surgery and digital health strategy. As Director of Digital Innovation at the Global Institute...',
    fullBio: 'Dr. Elena Rossi bridges the worlds of clinical surgery and digital health strategy. As Director of Digital Innovation at the Global Institute, she oversees the enterprise implementation of connected operating theaters.',
    theme: 'dark',
    category: 'Strategy & Policy',
    isHighlighted: false,
  },
  {
    id: 'spk-06',
    initials: 'TW',
    name: 'Dr. Thomas Weber',
    role: 'Surgical Robotics Engineer & Surgeon',
    institute: 'International Centre for Robotic Surgery',
    country: 'Germany',
    flag: '🇩🇪',
    tags: ['Robotics Engineering', 'Haptic Systems', 'Tissue Telemetry'],
    topic: 'Next-Generation Robotic Surgical Platforms',
    sessions: '2 sessions',
    tag: 'FEATURED',
    bio: 'Dr. Thomas Weber occupies a rare dual role as both a practising surgeon and a robotics engineer. His research group at the International Centre...',
    fullBio: 'Dr. Thomas Weber occupies a rare dual role as both a practising surgeon and a robotics engineer. His research group at the International Centre focuses on next-generation haptic telemetry and autonomous tissue approximation.',
    theme: 'magenta',
    category: 'Robotics',
    isHighlighted: false,
  },
  {
    id: 'spk-07',
    initials: 'AR',
    name: 'Dr. Aisha Rahman',
    role: 'Health Economist & Healthcare Policy Expert',
    institute: 'Future Health Research Institute',
    country: 'United Kingdom',
    flag: '🇬🇧',
    tags: ['Health Economics', 'Technology Policy', 'Value-Based Care'],
    topic: 'The Economics of Robotic Surgery Adoption',
    sessions: '2 sessions',
    tag: 'FEATURED',
    bio: 'Dr. Aisha Rahman is a health economist whose research examines the cost-effectiveness and systemic impact of high-technology surgical equipment...',
    fullBio: 'Dr. Aisha Rahman is a leading health economist whose research examines the long-term economic models, capital expenditure, and value-based healthcare frameworks of surgical robotics adoption in international healthcare systems.',
    theme: 'dark',
    category: 'Strategy & Policy',
    isHighlighted: false,
  },
  {
    id: 'spk-08',
    initials: 'JC',
    name: 'Dr. James Carter',
    role: 'Trauma & Emergency Surgeon',
    institute: 'Centre for Intelligent Surgery',
    country: 'United States',
    flag: '🇺🇸',
    tags: ['Trauma Surgery', 'Emergency AI', 'Acute Care Triage'],
    topic: 'AI Triage and Emergency Surgical Planning',
    sessions: '1 session',
    tag: 'FEATURED',
    bio: 'Dr. James Carter is a trauma and emergency surgeon known for applying AI tools in high-pressure, time-critical surgical decision environments...',
    fullBio: 'Dr. James Carter is a senior trauma and emergency surgeon known for pioneering algorithmic triage pipelines and machine learning decision-support algorithms in high-pressure surgical critical care.',
    theme: 'magenta',
    category: 'AI & Data',
    isHighlighted: false,
  },
];

export default function SpeakersPage() {
  const [activeModalSpeaker, setActiveModalSpeaker] = useState(null);

  return (
    <div className="kz-speakers-page-root">
      {/* ----------------------------------------------------
          1. HERO SECTION (Matches Image 1)
          - Pill Tag: EXPERT FACULTY
          - Title: Conference (Dark Plum) Speakers (Magenta)
          - Subtitle: 150+ leading surgeons...
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

          {/* Large Split-Color Headline with precise brand colors */}
          <h1 className="kz-spk-hero-headline">
            <span className="kz-spk-hero-purple">Conference Speakers,</span>
            <span className="kz-spk-hero-magenta">now with intelligence.</span>
          </h1>

          {/* Subtitle / Paragraph */}
          <p className="kz-spk-hero-subtitle">
            150+ leading surgeons, clinicians, researchers, and technology experts from over 40
            countries — united by a shared commitment to advancing surgical intelligence.
          </p>

          {/* Faculty Key Metrics Pill Strip */}
          <div className="kz-spk-metrics-strip">
            <div className="kz-spk-metric-pill">
              <span className="kz-spk-metric-num">150+</span>
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
          2. FEATURED FACULTY & CARDS GRID SECTION (Image 2 & 3)
          ---------------------------------------------------- */}
      <section className="kz-spk-main-section" aria-label="Keynote and Featured Speakers">
        <div className="kz-spk-main-container">
          {/* Section Header (Matches Image 2) */}
          <div className="kz-spk-section-header">
            <div className="kz-spk-pill-badge-wrap">
              <span className="kz-spk-pill-badge">FEATURED FACULTY</span>
            </div>
            <h2 className="kz-spk-section-title">Keynote &amp; featured speakers</h2>
          </div>

          {/* ----------------------------------------------------
              3. 8 SPEAKERS GRID (Light Pink Shade Cards)
              ---------------------------------------------------- */}
          <div className="kz-spk-grid">
            {SPEAKERS_DATA.map((spk) => (
              <SpeakerCard
                key={spk.id}
                id={spk.id}
                initials={spk.initials}
                name={spk.name}
                role={spk.role}
                institute={spk.institute}
                country={spk.country}
                flag={spk.flag}
                tags={spk.tags}
                topic={spk.topic}
                sessions={spk.sessions}
                tag={spk.tag}
                bio={spk.bio}
                isHighlighted={spk.isHighlighted}
                onViewDetails={() => setActiveModalSpeaker(spk)}
              />
            ))}
          </div>

          {/* ----------------------------------------------------
              4. CONFERENCE STATS RIBBON (Image 2 - Top Section)
              - 40+ Countries represented
              - 150+ Expert speakers
              - 8 Keynote speakers
              - 6 Panel discussions
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
                <span className="kz-spk-stat-value">150+</span>
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
                <span className="kz-spk-stat-value">8</span>
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
              5. REPRESENTED INSTITUTIONS SECTION (Image 2 - Lower Section)
              - Pill Badge: INSTITUTIONS
              - Title: Represented institutions
              - Underline accent
              - 4 Institution Cards
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
              {/* Institution 1 */}
              <div className="kz-spk-institution-card">
                <div className="kz-spk-inst-icon-wrap" aria-hidden="true">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#B63473" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 21h18" />
                    <path d="M5 21V10l7-5 7 5v11" />
                    <path d="M9 21v-4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v4" />
                    <line x1="9" y1="10" x2="9" y2="12" />
                    <line x1="15" y1="10" x2="15" y2="12" />
                  </svg>
                </div>
                <h3 className="kz-spk-inst-name">Global Institute of Surgical Innovation</h3>
                <p className="kz-spk-inst-country">India</p>
                <div className="kz-spk-inst-divider" aria-hidden="true" />
                <span className="kz-spk-inst-count">2 speakers</span>
              </div>

              {/* Institution 2 */}
              <div className="kz-spk-institution-card">
                <div className="kz-spk-inst-icon-wrap" aria-hidden="true">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#B63473" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
                    <path d="M6 12v5c3 3 9 3 12 0v-5" />
                  </svg>
                </div>
                <h3 className="kz-spk-inst-name">International Centre for Robotic Surgery</h3>
                <p className="kz-spk-inst-country">France</p>
                <div className="kz-spk-inst-divider" aria-hidden="true" />
                <span className="kz-spk-inst-count">2 speakers</span>
              </div>

              {/* Institution 3 */}
              <div className="kz-spk-institution-card">
                <div className="kz-spk-inst-icon-wrap" aria-hidden="true">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#B63473" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                    <line x1="16" y1="13" x2="8" y2="13" />
                    <line x1="16" y1="17" x2="8" y2="17" />
                    <line x1="10" y1="9" x2="8" y2="9" />
                  </svg>
                </div>
                <h3 className="kz-spk-inst-name">Future Health Research Institute</h3>
                <p className="kz-spk-inst-country">Nigeria</p>
                <div className="kz-spk-inst-divider" aria-hidden="true" />
                <span className="kz-spk-inst-count">2 speakers</span>
              </div>

              {/* Institution 4 */}
              <div className="kz-spk-institution-card">
                <div className="kz-spk-inst-icon-wrap" aria-hidden="true">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#B63473" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="18" cy="5" r="3" />
                    <circle cx="6" cy="12" r="3" />
                    <circle cx="18" cy="19" r="3" />
                    <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
                    <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
                  </svg>
                </div>
                <h3 className="kz-spk-inst-name">Centre for Intelligent Surgery</h3>
                <p className="kz-spk-inst-country">Singapore</p>
                <div className="kz-spk-inst-divider" aria-hidden="true" />
                <span className="kz-spk-inst-count">2 speakers</span>
              </div>
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
                <Link to="/knowledge" className="kz-spk-cta-secondary-btn">
                  <span>Search Faculty Topics &amp; Sessions</span>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <circle cx="11" cy="11" r="8" />
                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                  </svg>
                </Link>
              </div>
            </div>
          </section>
        </div>
      </section>

      {/* ----------------------------------------------------
          4. SPEAKER DETAILS MODAL
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
                  style={{ fontSize: '1.4rem' }}
                >
                  <span>{activeModalSpeaker.initials}</span>
                </div>
              </div>
              <div className="kz-spk-modal-title-wrap">
                <div className="kz-spk-modal-tags">
                  <span className="kz-card-country-badge">
                    {activeModalSpeaker.flag} {activeModalSpeaker.country}
                  </span>
                  <span className="kz-card-featured-tag">
                    ★ {activeModalSpeaker.tag}
                  </span>
                </div>
                <h3 id="modal-speaker-name" className="kz-spk-modal-name">
                  {activeModalSpeaker.name}
                </h3>
                <p className="kz-spk-modal-role">{activeModalSpeaker.role}</p>
                <p className="kz-spk-modal-institute">{activeModalSpeaker.institute}</p>
              </div>
            </div>

            {/* Specialty Tags */}
            {activeModalSpeaker.tags && (
              <div className="kz-card-tags-row" style={{ marginTop: '8px' }}>
                {activeModalSpeaker.tags.map((t, idx) => (
                  <span key={idx} className="kz-card-specialty-pill">
                    {t}
                  </span>
                ))}
              </div>
            )}

            <div className="kz-spk-modal-divider" />

            {/* Speaking On */}
            <div className="kz-spk-modal-section">
              <span className="kz-card-topic-label">SPEAKING TOPIC</span>
              <h4 className="kz-spk-modal-topic">{activeModalSpeaker.topic}</h4>
            </div>

            {/* Full Biography */}
            <div className="kz-spk-modal-section">
              <span className="kz-card-topic-label">FACULTY PROFILE &amp; CLINICAL FOCUS</span>
              <p className="kz-spk-modal-bio">
                {activeModalSpeaker.fullBio || activeModalSpeaker.bio}
              </p>
            </div>

            {/* Session info & CTA */}
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
                <span>{activeModalSpeaker.sessions} scheduled at KaizenCon 2027</span>
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
