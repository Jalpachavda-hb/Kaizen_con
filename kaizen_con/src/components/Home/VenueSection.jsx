import React from 'react';
import { Link } from 'react-router-dom';
import './HomeSections.css';

export default function VenueSection() {
  return (
    <section className="kz-venue-section" id="venue">
      <span id="registration" style={{ display: 'block', position: 'relative', top: '-90px', visibility: 'hidden' }} aria-hidden="true" />
      <div className="kz-section-container">
        <div className="kz-venue-banner">
          <div className="kz-venue-content">
            <span className="kz-nextgen-tagline">KAIZENCON 2027</span>

            <h2 className="kz-venue-title kz-nextgen-title">
              <span className="kz-title-line">THE NEXT GENERATION</span>
              <span className="kz-title-line">OF MEDICAL CONFERENCES</span>
              <span className="kz-title-line kz-starts-here-gradient">STARTS HERE.</span>
            </h2>

            <p className="kz-venue-desc kz-nextgen-desc">
              1–3 January 2027 | Ahmedabad, India. International Conference Centre.
              <br />
              Where 150+ experts and AI come together to shape the future of surgery.
            </p>

            <div className="kz-venue-cta-row kz-nextgen-actions">
              <a href="#programme" className="kz-nextgen-btn kz-nextgen-btn-primary">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="kz-nextgen-icon"
                  aria-hidden="true"
                >
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                  <line x1="16" y1="2" x2="16" y2="6" />
                  <line x1="8" y1="2" x2="8" y2="6" />
                  <line x1="3" y1="10" x2="21" y2="10" />
                </svg>
                <span>Explore the Programme</span>
              </a>

              <Link to="/contact" className="kz-nextgen-btn kz-nextgen-btn-secondary">
                <span>Contact &amp; Registration</span>
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="kz-nextgen-arrow"
                  aria-hidden="true"
                >
                  <line x1="5" y1="12" x2="19" y2="12" />
                  <polyline points="12 5 19 12 12 19" />
                </svg>
              </Link>
            </div>

            <p className="kz-nextgen-disclaimer">
              All speakers, sessions, and institutions shown on this demo website are fictional and created for presentation purposes only.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
