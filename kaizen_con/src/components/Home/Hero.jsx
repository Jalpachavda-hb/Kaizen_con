import React from 'react';
import './Hero.css';
import brochurePdf from '../../assets/home/Kaizencon_2027_Second_Annoucement.pdf';

export default function Hero() {
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
            {/* <span className="kz-hero-title-line title-line-3">Artificial Intelligence</span> */}
          </h1>

          {/* 3. Subtitle / Description */}
          <p className="kz-hero-description">
            The Future of Surgery, Technology &amp; Intelligent Healthcare. Three days. 150+ expert speakers. One shared vision: augmenting clinical excellence with AI.
          </p>

          {/* 4. Action Buttons */}
          <div className="kz-hero-actions">
            <a
              href={brochurePdf}
              download="Kaizencon_2027_Second_Announcement.pdf"
              className="kz-btn kz-btn-primary"
              aria-label="Download Brochure"
            >
              <span>Download Brochure</span>
              <svg className="kz-btn-arrow" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                <path d="M3 8H13M13 8L9 4M13 8L9 12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
