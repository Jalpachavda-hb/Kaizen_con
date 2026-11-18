import React, { useState, useEffect } from 'react';
import './Hero.css';
import CountdownCard from './CountdownCard';

export default function Hero() {
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setIsAiModalOpen(false);
      }
    };

    if (isAiModalOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isAiModalOpen]);

  return (
    <>
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

            {/* 4. Action Buttons */}
            <div className="kz-hero-actions">
              <a
                href="https://rxregistrations.com/kaizencon2027/"
                target="_blank"
                rel="noopener noreferrer"
                className="kz-btn kz-btn-primary"
                aria-label="Register Now for KaizenCon 2027"
              >
                <span>Register Now</span>
                <svg className="kz-btn-arrow" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                  <path d="M3 8H13M13 8L9 4M13 8L9 12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </a>

              <button
                type="button"
                onClick={() => setIsAiModalOpen(true)}
                className="kz-btn kz-btn-ai-course"
                aria-label="Register AI Course - View details and options"
              >
                <span>Register AI Course</span>
                <svg className="kz-btn-arrow" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                  <path d="M3 8H13M13 8L9 4M13 8L9 12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Redesigned Overlapping Countdown Card */}
      <CountdownCard />

      {/* AI Course Registration Clarification Modal */}
      {isAiModalOpen && (
        <div
          className="kz-regmodal-overlay"
          role="dialog"
          aria-modal="true"
          aria-labelledby="kz-regmodal-title"
          onClick={() => setIsAiModalOpen(false)}
        >
          <div
            className="kz-regmodal-container"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              type="button"
              className="kz-regmodal-close-btn"
              onClick={() => setIsAiModalOpen(false)}
              aria-label="Close dialog"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>

            {/* Modal Header */}
            <div className="kz-regmodal-header">
              <div className="kz-regmodal-badge">
                <span className="kz-regmodal-badge-dot" />
                <span>Registration Notice</span>
              </div>
              <h3 id="kz-regmodal-title" className="kz-regmodal-title">
                Course &amp; Conference Inclusions
              </h3>
              <p className="kz-regmodal-subtitle">
                Please check the registration details below before completing your booking:
              </p>
            </div>

            {/* Two Option Cards Grid */}
            <div className="kz-regmodal-grid">
              {/* Option 1: AI Course Only */}
              <div className="kz-regmodal-card kz-regmodal-card-course">
                <div className="kz-regmodal-card-top">
                  <span className="kz-regmodal-tag kz-regmodal-tag-course">Course Only</span>
                  <h4 className="kz-regmodal-card-title">Register for AI Course</h4>
                  <p className="kz-regmodal-card-desc">
                    Specialized masterclass covering Artificial Intelligence applications in clinical practice and healthcare.
                  </p>

                  <div className="kz-regmodal-callout kz-callout-warning">
                    <div className="kz-callout-icon-wrap" aria-hidden="true">
                      <svg viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="kz-callout-text">
                      <strong>Event NOT Included:</strong> Registering for this course alone <u>does not</u> include access to the main KaizenCon 2027 conference event.
                    </div>
                  </div>

                  <ul className="kz-regmodal-list">
                    <li>
                      <span className="kz-list-bullet kz-bullet-check">✓</span>
                      <span>Full access to AI Course Masterclass</span>
                    </li>
                    <li>
                      <span className="kz-list-bullet kz-bullet-cross">✕</span>
                      <span>Main conference sessions &amp; workshops not included</span>
                    </li>
                  </ul>
                </div>

                <div className="kz-regmodal-card-bottom">
                  <a
                    href="https://rxregistrations.com/kaizencon2027/aicourse.php"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="kz-regmodal-btn kz-regmodal-btn-course"
                    onClick={() => setIsAiModalOpen(false)}
                  >
                    <span>Proceed to AI Course Only</span>
                    <svg className="kz-btn-arrow" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                      <path d="M3 8H13M13 8L9 4M13 8L9 12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </a>
                </div>
              </div>

              {/* Option 2: Full Conference (Includes AI Course) */}
              <div className="kz-regmodal-card kz-regmodal-card-full">
                <div className="kz-regmodal-card-top">
                  <span className="kz-regmodal-tag kz-regmodal-tag-recommended">Full Pass • Recommended</span>
                  <h4 className="kz-regmodal-card-title">Register for Full Event</h4>
                  <p className="kz-regmodal-card-desc">
                    Complete 3-day access to all conference sessions, live surgical broadcasts, keynotes, panels &amp; networking.
                  </p>

                  <div className="kz-regmodal-callout kz-callout-success">
                    <div className="kz-callout-icon-wrap" aria-hidden="true">
                      <svg viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="kz-callout-text">
                      <strong>AI Course INCLUDED:</strong> When you register for the full conference event, the <u>AI Course is already included</u>!
                    </div>
                  </div>

                  <ul className="kz-regmodal-list">
                    <li>
                      <span className="kz-list-bullet kz-bullet-check">✓</span>
                      <span><strong>AI Course fully included</strong> at no extra cost</span>
                    </li>
                    <li>
                      <span className="kz-list-bullet kz-bullet-check">✓</span>
                      <span>3-day full conference pass &amp; live surgeries</span>
                    </li>
                  </ul>
                </div>

                <div className="kz-regmodal-card-bottom">
                  <a
                    href="https://rxregistrations.com/kaizencon2027/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="kz-regmodal-btn kz-regmodal-btn-event"
                    onClick={() => setIsAiModalOpen(false)}
                  >
                    <span>Register for Full Conference</span>
                    <svg className="kz-btn-arrow" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                      <path d="M3 8H13M13 8L9 4M13 8L9 12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
