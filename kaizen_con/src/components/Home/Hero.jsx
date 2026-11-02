import React, { useState, useEffect } from 'react';
import './Hero.css';

const calculateTimeLeft = () => {
  // Target: 1 January 2027 00:00:00 local time
  const targetDate = new Date(2027, 0, 1, 0, 0, 0);
  const now = new Date();
  const diff = targetDate.getTime() - now.getTime();

  if (diff <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, isPast: true };
  }

  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
    isPast: false
  };
};

export default function Hero() {
  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const brochureUrl = `${import.meta.env.BASE_URL}Kaizencon_2027_Brochure.pdf`;

  return (
    <section className="kz-hero-section" id="home" aria-label="KaizenCon 2027 Hero">
      {/* Blueprint Grid Overlay */}
      <div className="kz-hero-bg-grid" aria-hidden="true" />

      {/* Pink Overlay on top of banner image */}
      <div className="kz-hero-overlay-pink" aria-hidden="true" />

      {/* Main Hero Container */}
      <div className="kz-hero-container">
        <div className="kz-hero-content">
          {/* 1. Top Pill Badge: KAIZENCON 2027 • 1-3 JANUARY • INTERNATIONAL CONFERENCE */}
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
                KAIZENCON 2027 • 1–3 JANUARY • INTERNATIONAL CONFERENCE
              </span>
            </div>
          </div>

          {/* 2. 3-Line Headline matching exact reference image */}
          <h1 className="kz-hero-title">
            <span className="kz-hero-title-line title-line-1">Where Human Expertise</span>
            <span className="kz-hero-title-line title-line-2">Meets Artificial Intelligence</span>
          </h1>

          {/* 3. Subtitle / Description */}
          <p className="kz-hero-description">
            The Future of Surgery, Technology &amp; Intelligent Healthcare. Three days. 150+ expert faculty. One shared vision: augmenting clinical excellence with AI.
          </p>

          {/* 4. Action Buttons & Floating Countdown Card */}
          <div className="kz-hero-actions">
            <a
              href={brochureUrl}
              download="Kaizencon_2027_Brochure.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="kz-btn kz-btn-primary"
              aria-label="Download Brochure"
            >
              <span>Download Brochure</span>
              <svg className="kz-btn-arrow" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                <path d="M3 8H13M13 8L9 4M13 8L9 12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </a>

            {/* Premium Floating Countdown Card */}
            <div className="kz-hero-countdown-card" aria-label="KaizenCon 2027 Countdown">
              <div className="kz-countdown-icon-box">
                <svg
                  className="kz-countdown-cal-icon"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <rect x="3" y="4" width="18" height="18" rx="3" ry="3" />
                  <line x1="16" y1="2" x2="16" y2="6" />
                  <line x1="8" y1="2" x2="8" y2="6" />
                  <line x1="3" y1="10" x2="21" y2="10" />
                  <circle cx="8" cy="14" r="1.2" fill="currentColor" />
                  <circle cx="12" cy="14" r="1.2" fill="currentColor" />
                  <circle cx="16" cy="14" r="1.2" fill="currentColor" />
                  <circle cx="8" cy="18" r="1.2" fill="currentColor" />
                  <circle cx="12" cy="18" r="1.2" fill="currentColor" />
                </svg>
                <span className="kz-countdown-pulse-dot" aria-hidden="true" />
              </div>

              <div className="kz-countdown-content">
                <div className="kz-countdown-headline">
                  <span className="kz-countdown-days-val">{timeLeft.days}</span>
                  <div className="kz-countdown-title-stack">
                    <span className="kz-countdown-label">DAYS TO GO</span>
                    <span className="kz-countdown-meta">
                      {timeLeft.isPast ? (
                        'Conference Started'
                      ) : (
                        <>
                          Starts 1 Jan 2027 •{' '}
                          <span className="kz-countdown-ticker">
                            {String(timeLeft.hours).padStart(2, '0')}h {String(timeLeft.minutes).padStart(2, '0')}m {String(timeLeft.seconds).padStart(2, '0')}s
                          </span>
                        </>
                      )}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
