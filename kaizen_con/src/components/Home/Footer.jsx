import React from 'react';
import './Footer.css';
import logoImg from '../../assets/home/logokaizecon.png';
import hospitalImg from '../../assets/home/footerimg.png';

export default function Footer() {
  return (
    <footer className="kz-footer-main" id="contact">
      {/* Top Main Section */}
      <div className="kz-footer-wrapper">
        <div className="kz-footer-content-area">
          {/* 1. Left Brand & Conference Meta Column */}
          <div className="kz-footer-brand-col">
            <a href="/" className="kz-footer-brand-logo-link" aria-label="KaizenCon 2027 Home">
              <img
                src={logoImg}
                alt="KaizenCon 2027 International Medical Conference"
                className="kz-footer-brand-logo-img"
              />
            </a>
            <p className="kz-footer-brand-desc">
              Where Human Expertise Meets Artificial Intelligence.
            </p>

            <div className="kz-footer-event-details">
              <p className="kz-footer-event-text">1–3 January 2027 | Ahmedabad, India</p>
              <p className="kz-footer-event-text">International Conference Centre</p>
            </div>

      
        
          </div>

          {/* 2. Three Navigation Columns */}
          <div className="kz-footer-nav-columns">
            {/* Column 1: Conference */}
            <div className="kz-footer-nav-col">
              <h3 className="kz-footer-nav-heading">Conference</h3>
              <div className="kz-footer-nav-bar" aria-hidden="true"></div>
              <ul className="kz-footer-nav-list">
                <li><a href="/#about">About KaizenCon</a></li>
                <li><a href="/#programme">Programme</a></li>
                <li><a href="/#speakers">Speakers</a></li>
                <li><a href="/#venue">Venue &amp; Travel</a></li>
                <li><a href="/contact">Contact Us</a></li>
              </ul>
            </div>

            {/* Column 2: AI Experience */}
            <div className="kz-footer-nav-col">
              <h3 className="kz-footer-nav-heading">AI Experience</h3>
              <div className="kz-footer-nav-bar" aria-hidden="true"></div>
              <ul className="kz-footer-nav-list">
                <li><a href="/#ai-layer">AI Personalization</a></li>
                <li><a href="/#ai-assistant">Conference Assistant</a></li>
                <li><a href="/#live-intelligence">Live Intelligence</a></li>
                <li><a href="/#knowledge">Knowledge Base</a></li>
              </ul>
            </div>

            {/* Column 3: Get in Touch (Contact details with icons) */}
            <div className="kz-footer-nav-col">
              <h3 className="kz-footer-nav-heading">Get in Touch</h3>
              <div className="kz-footer-nav-bar" aria-hidden="true"></div>
              <ul className="kz-footer-contact-list">
                <li className="kz-footer-contact-item">
                  <span className="kz-footer-contact-icon" aria-hidden="true">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="2" y="4" width="20" height="16" rx="2" />
                      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                    </svg>
                  </span>
                  <a href="mailto:hello@kaizencon.demo">hello@kaizencon.demo</a>
                </li>
                <li className="kz-footer-contact-item">
                  <span className="kz-footer-contact-icon" aria-hidden="true">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                      <circle cx="12" cy="10" r="3" />
                    </svg>
                  </span>
                  <span>International Conference Centre</span>
                </li>
                <li className="kz-footer-contact-item">
                  <span className="kz-footer-contact-icon" aria-hidden="true">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                      <line x1="16" y1="2" x2="16" y2="6" />
                      <line x1="8" y1="2" x2="8" y2="6" />
                      <line x1="3" y1="10" x2="21" y2="10" />
                    </svg>
                  </span>
                  <span>1–3 January 2027 | Ahmedabad, India</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* 3. Right Side Hospital Image - Clean full image display with no ribbons */}
        <div className="kz-footer-hospital-section">
          <img
            src={hospitalImg}
            alt="Kaizen Hospital Ahmedabad"
            className="kz-footer-hospital-img"
            loading="lazy"
          />
        </div>
      </div>

      {/* 4. Bottom Copyright & Legal Bar */}
      <div className="kz-footer-bottom-bar">
        <div className="kz-footer-bottom-container">
          <div className="kz-footer-copyright-group">
            <p className="kz-footer-copyright-text">
              © 2027 KaizenCon International Medical Conference. All rights reserved.
            </p>
            <p className="kz-footer-disclaimer-text">
              All speakers, sessions, and institutions on this website are fictional and created for demonstration purposes only.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
