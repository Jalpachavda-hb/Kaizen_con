import React from 'react';
import './PresidentWelcome.css';
import doctorPhoto from '../../assets/drsanjiv_president.png';
import roboticsIcon from '../../assets/icon_robotics_arm.png';
import aiIcon from '../../assets/icon_ai_chip.png';

export default function PresidentWelcome() {
  const highlights = [
    {
      id: 'robotics',
      line1: 'Robotics in',
      line2: 'GI Surgery',
      icon: (
        <img
          src={roboticsIcon}
          alt="Robotics in GI Surgery"
          className="kz-pw-highlight-custom-icon"
        />
      )
    },
    {
      id: 'ai-clinical',
      line1: 'AI in',
      line2: 'Clinical Practice',
      icon: (
        <img
          src={aiIcon}
          alt="AI in Clinical Practice"
          className="kz-pw-highlight-custom-icon"
        />
      )
    },
    {
      id: 'guidance',
      line1: 'Expert',
      line2: 'Guidance',
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="3.5" />
          <path d="M22 21v-2a3.5 3.5 0 0 0-2.5-3.3" />
          <path d="M15.5 3.7a3.5 3.5 0 0 1 0 6.6" />
        </svg>
      )
    },
    {
      id: 'learning',
      line1: 'Practical',
      line2: 'Learning',
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
          <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
          <path d="M6 12v5c3 3 9 3 12 0v-5" />
        </svg>
      )
    }
  ];

  return (
    <section className="kz-pw-section" id="welcome-message" aria-label="KaizenCon 2027 Welcome Message">
      <div className="kz-pw-container">
        {/* ========================================================
            Top Eyebrow & Title Header - OUTSIDE the Box Card
            ======================================================== */}
        <div className="kz-pw-header">
          <div className="kz-pw-eyebrow-wrap">
            <span className="kz-pw-eyebrow-line" aria-hidden="true" />
            <span className="kz-pw-eyebrow-text">KAIZENCON 2027</span>
            <span className="kz-pw-eyebrow-line" aria-hidden="true" />
          </div>
          <h2 className="kz-pw-title">
            Welcome <span className="kz-pw-highlight-word">Message</span>
          </h2>
          <div className="kz-pw-title-bar" aria-hidden="true" />
        </div>

        {/* ========================================================
            Main Framed Presentation Card
            ======================================================== */}
        <div className="kz-pw-card">
          {/* Left Column: Doctor Portrait */}
          <div className="kz-pw-left-col">
            <div className="kz-pw-photo-wrapper">
              <img
                src={doctorPhoto}
                alt="Dr. Sanjiv Haribhakti - Congress President, KaizenCon 2027"
                className="kz-pw-doctor-img"
                loading="eager"
              />
            </div>
          </div>

          {/* Vertical Divider Line between Left & Right Columns */}
          <div className="kz-pw-vertical-divider" aria-hidden="true" />

          {/* Right Column: Letter Content */}
          <div className="kz-pw-right-col">
            {/* Salutation Greeting */}
            <h3 className="kz-pw-greeting">Dear Friends and Colleagues,</h3>

            {/* Highlighted Lead Event Pill Box with Calendar Icon */}
            <div className="kz-pw-event-pill">
              <div className="kz-pw-event-pill-icon" aria-hidden="true">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#aa2d7b" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="4" width="18" height="18" rx="3" />
                  <line x1="16" y1="2" x2="16" y2="6" />
                  <line x1="8" y1="2" x2="8" y2="6" />
                  <line x1="3" y1="10" x2="21" y2="10" />
                  <circle cx="8" cy="14" r="1" fill="#aa2d7b" />
                  <circle cx="12" cy="14" r="1" fill="#aa2d7b" />
                  <circle cx="16" cy="14" r="1" fill="#aa2d7b" />
                  <circle cx="8" cy="18" r="1" fill="#aa2d7b" />
                  <circle cx="12" cy="18" r="1" fill="#aa2d7b" />
                  <circle cx="16" cy="18" r="1" fill="#aa2d7b" />
                </svg>
              </div>
              <p className="kz-pw-event-pill-text">
                It gives me immense pleasure to welcome you to{' '}
                <strong className="kz-pw-highlight-detail">
                  KaizenCon 2027 – Robotics &amp; AI: Shaping the Future of GI Surgery, from 1 – 3 January 2027 at Hyatt Regency, Ahmedabad.
                </strong>
              </p>
            </div>

            {/* Body Paragraphs */}
            <div className="kz-pw-paragraphs">
              <p className="kz-pw-para">
                As robotic surgery and Artificial Intelligence transform the landscape of modern surgery, KaizenCon 2027 aims to empower surgeons with the knowledge, skills, and vision to embrace this exciting evolution.
              </p>

              <p className="kz-pw-para">
                Designed as a unique AI-native academic platform, the conference promises insightful discussions, practical learning, expert guidance, and meaningful collaboration.
              </p>

              <p className="kz-pw-para">
                I warmly invite surgeons, especially young and aspiring professionals, to participate, share their innovations through video abstracts, and be part of this transformative journey.
              </p>
            </div>

            {/* 4 Feature Highlights Strip */}
            <div className="kz-pw-highlights-strip">
              {highlights.map((item, index) => (
                <React.Fragment key={item.id}>
                  <div className="kz-pw-highlight-item">
                    <div className="kz-pw-highlight-icon-box" aria-hidden="true">
                      {item.icon}
                    </div>
                    <div className="kz-pw-highlight-label">
                      <span>{item.line1}</span>
                      <span>{item.line2}</span>
                    </div>
                  </div>
                  {index < highlights.length - 1 && (
                    <div className="kz-pw-highlight-divider" aria-hidden="true" />
                  )}
                </React.Fragment>
              ))}
            </div>

            {/* Highlight Quote Banner */}
            <div className="kz-pw-quote-banner">
              <div className="kz-pw-quote-icon-wrap" aria-hidden="true">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
                </svg>
              </div>
              <p className="kz-pw-quote-text">
                &ldquo;Let&apos;s welcome the New Year by shaping the future of GI Surgery together!&rdquo;
              </p>
            </div>

            {/* Doctor Signature Block */}
            <div className="kz-pw-signature-section">
              <p className="kz-pw-see-you">See you in Ahmedabad!</p>

              <div className="kz-pw-sig-block">
                <div className="kz-pw-sig-line" aria-hidden="true" />
                <h4 className="kz-pw-doctor-name">Dr. Sanjiv Haribhakti</h4>
                <p className="kz-pw-doctor-desig">Congress President,</p>
                <p className="kz-pw-doctor-desig">KaizenCon 2027</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
