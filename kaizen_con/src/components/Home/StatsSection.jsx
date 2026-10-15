import React from 'react';
import './HomeSections.css';

export default function StatsSection() {
  return (
    <section className="kz-stats-section" id="highlights">
      <div className="kz-section-container">
        <div className="kz-metrics-split-layout">
          {/* Left Column: Content Block */}
          <div className="kz-metrics-header-block">
            <div className="kz-metrics-eyebrow">
              <span className="kz-metrics-eyebrow-text">KEY METRICS</span>
              <span className="kz-metrics-eyebrow-line" />
            </div>

            <h2 className="kz-metrics-title">
              A Global Platform <br />
              for Innovation in <br />
              <span className="kz-metrics-title-highlight">Surgical Excellence</span>
            </h2>

            <p className="kz-metrics-desc">
              Bringing together leading minds, cutting-edge research and advanced technology to shape the future of surgery and healthcare.
            </p>
          </div>

          {/* Right Column: 4 Cards in 2x2 Grid (2 cards per row) */}
          <div className="kz-metrics-cards-2x2">
            {/* Card 1: 3 Days */}
            <div className="kz-metric-grid-card">
              <div className="kz-metric-icon-circle">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="kz-metric-icon">
                  <rect x="3" y="4" width="18" height="18" rx="3" ry="3" />
                  <line x1="16" y1="2" x2="16" y2="6" />
                  <line x1="8" y1="2" x2="8" y2="6" />
                  <line x1="3" y1="10" x2="21" y2="10" />
                  <circle cx="8" cy="14" r="1" fill="currentColor" />
                  <circle cx="12" cy="14" r="1" fill="currentColor" />
                  <circle cx="16" cy="14" r="1" fill="currentColor" />
                  <circle cx="8" cy="18" r="1" fill="currentColor" />
                  <circle cx="12" cy="18" r="1" fill="currentColor" />
                </svg>
              </div>
              <div className="kz-metric-card-body">
                <div className="kz-metric-number">3</div>
                <div className="kz-metric-label">Days</div>
                <div className="kz-metric-divider" />
                <div className="kz-metric-detail">
                  1–3 January 2027 <br />
                  Ahmedabad, India
                </div>
              </div>
            </div>

            {/* Card 2: 100+ Scientific Sessions */}
            <div className="kz-metric-grid-card">
              <div className="kz-metric-icon-circle">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="kz-metric-icon">
                  <path d="M2 4h20" />
                  <path d="M20 4v11a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4" />
                  <path d="m8 20 4-3 4 3" />
                  <circle cx="9" cy="9" r="1.5" />
                  <path d="M8 13h4" />
                </svg>
              </div>
              <div className="kz-metric-card-body">
                <div className="kz-metric-number">100+</div>
                <div className="kz-metric-label">Scientific Sessions</div>
                <div className="kz-metric-divider" />
                <div className="kz-metric-detail">Across 4 halls</div>
              </div>
            </div>

            {/* Card 3: 150+ Expert Speakers */}
            <div className="kz-metric-grid-card">
              <div className="kz-metric-icon-circle">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="kz-metric-icon">
                  <rect x="9" y="2" width="6" height="12" rx="3" />
                  <path d="M5 10a7 7 0 0 0 14 0" />
                  <line x1="12" y1="17" x2="12" y2="22" />
                  <line x1="8" y1="22" x2="16" y2="22" />
                </svg>
              </div>
              <div className="kz-metric-card-body">
                <div className="kz-metric-number">150+</div>
                <div className="kz-metric-label">Expert Speakers</div>
                <div className="kz-metric-divider" />
                <div className="kz-metric-detail">From 40+ countries</div>
              </div>
            </div>

            {/* Card 4: 2,500+ Delegates */}
            <div className="kz-metric-grid-card">
              <div className="kz-metric-icon-circle">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="kz-metric-icon">
                  <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                  <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
              </div>
              <div className="kz-metric-card-body">
                <div className="kz-metric-number">250+</div>
                <div className="kz-metric-label">Delegates</div>
                <div className="kz-metric-divider" />
                <div className="kz-metric-detail">International audience</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
