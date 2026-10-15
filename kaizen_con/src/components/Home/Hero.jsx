import React from 'react';
import './Hero.css';

export default function Hero() {
  const scrollToExplore = () => {
    const el = document.querySelector('#explore') || document.querySelector('#highlights');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const scrollToAi = () => {
    const el = document.querySelector('#ai-layer') || document.querySelector('#ai-experience');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="kz-hero-section" id="home">
      {/* High-Tech Background Grid Lines */}
      <div className="kz-hero-bg-grid" aria-hidden="true" />

      {/* Atmospheric Ambient Glows */}
      <div className="kz-hero-ambient-glow glow-top-left" aria-hidden="true" />
      <div className="kz-hero-ambient-glow glow-top-right" aria-hidden="true" />
      <div className="kz-hero-ambient-glow glow-center-ambient" aria-hidden="true" />

      {/* Ambient Tech Sparkles / Precision Coordinate Markers */}
      <div className="kz-hero-tech-dot dot-1" aria-hidden="true" />
      <div className="kz-hero-tech-dot dot-2" aria-hidden="true" />
      <div className="kz-hero-tech-dot dot-3" aria-hidden="true" />
      <div className="kz-hero-tech-dot dot-4" aria-hidden="true" />
      <div className="kz-hero-tech-dot dot-5" aria-hidden="true" />
      <div className="kz-hero-tech-dot dot-6" aria-hidden="true" />

      {/* Hero Inner Wrapper */}
      <div className="kz-hero-container">
        <div className="kz-hero-content">
          {/* 1. Top Pill Badge */}
          <div className="kz-hero-badge-wrapper">
            <div className="kz-hero-badge">
              <svg
                className="kz-hero-badge-icon"
                viewBox="0 0 16 16"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
              >
                <rect x="2.5" y="2" width="11" height="12" rx="2.2" stroke="currentColor" strokeWidth="1.3" />
                <path d="M5.5 1.5V3M10.5 1.5V3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
                <path d="M2.5 5.5H13.5" stroke="currentColor" strokeWidth="1.2" />
                <circle cx="5.5" cy="8.5" r="0.8" fill="currentColor" />
                <circle cx="8" cy="8.5" r="0.8" fill="currentColor" />
                <circle cx="10.5" cy="8.5" r="0.8" fill="currentColor" />
                <circle cx="5.5" cy="11" r="0.8" fill="currentColor" />
                <circle cx="8" cy="11" r="0.8" fill="currentColor" />
              </svg>
              <span className="kz-hero-badge-text">
                KAIZENCON 2027 &nbsp;·&nbsp; 1–3 JANUARY &nbsp;·&nbsp; INTERNATIONAL CONFERENCE
              </span>
            </div>
          </div>

          {/* 2. Massive 3-Line Headline (Exact match to screenshot) */}
          <h1 className="kz-hero-title">
            <span className="kz-hero-title-line title-dark">WHERE HUMAN EXPERTISE</span>
            <span className="kz-hero-title-line title-dark">MEETS</span>
            <span className="kz-hero-title-line title-magenta">ARTIFICIAL INTELLIGENCE</span>
          </h1>

          {/* 3. Subtitle / Description */}
          <p className="kz-hero-description">
            The Future of Surgery, Technology &amp; Intelligent Healthcare. Three days. 150+ expert speakers. One shared vision: augmenting clinical excellence with AI.
          </p>

          {/* 4. Action Buttons */}
          <div className="kz-hero-actions">
            <button
              type="button"
              className="kz-btn kz-btn-primary"
              onClick={scrollToExplore}
              aria-label="Explore the Experience"
            >
              {/* Sparkle Icon */}
           
              <span>Explore the Experience</span>
            </button>

            <button
              type="button"
              className="kz-btn kz-btn-secondary"
              onClick={scrollToAi}
              aria-label="Discover the AI Layer"
            >
              <span>Discover the AI Layer</span>
              {/* Arrow Right Icon */}
              <svg
                className="kz-btn-arrow"
                viewBox="0 0 16 16"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
              >
                <path
                  d="M3 8H13M13 8L9 4M13 8L9 12"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </div>

          {/* 5. Event Details / Meta Info Row */}
          <div className="kz-hero-meta-row">
            <div className="kz-hero-meta-item">
              <svg
                className="kz-hero-meta-icon"
                viewBox="0 0 18 18"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
              >
                <rect x="2.5" y="3.5" width="13" height="12" rx="2" stroke="currentColor" strokeWidth="1.4" />
                <path d="M5.5 1.8V4.2M12.5 1.8V4.2M2.5 7.2H15.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
              </svg>
              <span>1–3 January 2027 | Ahmedabad, India</span>
            </div>

            <div className="kz-hero-meta-item">
              <svg
                className="kz-hero-meta-icon"
                viewBox="0 0 18 18"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
              >
                <path
                  d="M9 2C6.24 2 4 4.24 4 7C4 10.75 9 15.5 9 15.5C9 15.5 14 10.75 14 7C14 4.24 11.76 2 9 2Z"
                  stroke="currentColor"
                  strokeWidth="1.4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <circle cx="9" cy="7" r="2" stroke="currentColor" strokeWidth="1.4" />
              </svg>
              <span>International Conference Centre</span>
            </div>

            <div className="kz-hero-meta-item">
              <svg
                className="kz-hero-meta-icon"
                viewBox="0 0 18 18"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
              >
                <circle cx="9" cy="9" r="6.8" stroke="currentColor" strokeWidth="1.4" />
                <path
                  d="M2.5 9H15.5M9 2.2C10.6 4.1 11.5 6.5 11.5 9C11.5 11.5 10.6 13.9 9 15.8C7.4 13.9 6.5 11.5 6.5 9C6.5 6.5 7.4 4.1 9 2.2Z"
                  stroke="currentColor"
                  strokeWidth="1.4"
                />
              </svg>
              <span>International Medical Conference</span>
            </div>
          </div>
        </div>

        {/* 6. Floating Status Badges (Right side matching screenshot exactly) */}
        <div className="kz-hero-floating-badges" aria-label="Conference Highlights">
          <div className="kz-floating-badge badge-live">          
            <span className="kz-floating-badge-text">Live Intelligence</span>
          </div>

          <div className="kz-floating-badge badge-knowledge">
            <span className="kz-status-dot dot-knowledge" aria-hidden="true" />
            <span className="kz-floating-badge-text">Conference Knowledge</span>
          </div>
        </div>
      </div>

      {/* 7. Bottom "SCROLL" Indicator */}
      <div className="kz-hero-scroll-wrapper" aria-hidden="true">
        <span className="kz-hero-scroll-label">SCROLL</span>
        <div className="kz-hero-scroll-line">
          <div className="kz-hero-scroll-runner" />
        </div>
      </div>
    </section>
  );
}
