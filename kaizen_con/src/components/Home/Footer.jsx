import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './Footer.css';
import logoImg from '../../assets/home/logokaizecon.png';

export default function Footer() {
  const navigate = useNavigate();
  const location = useLocation();

  const handleFooterNav = (e, path) => {
    e.preventDefault();
    if (path.startsWith('/#')) {
      const hash = path.substring(1);
      if (location.pathname === '/') {
        const el = document.querySelector(hash);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth' });
        }
      } else {
        navigate(path);
      }
    } else if (path.includes('#')) {
      const [route, hash] = path.split('#');
      if (location.pathname === route) {
        const el = document.getElementById(hash);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth' });
        }
      } else {
        navigate(path);
      }
    } else {
      navigate(path);
      window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
    }
  };

  const handleLogoClick = (e) => {
    e.preventDefault();
    if (location.pathname !== '/') {
      navigate('/');
    } else {
      window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
    }
  };

  return (
    <footer className="kz-footer-main">
      {/* Main 4-Column Grid */}
      <div className="kz-footer-container">
        {/* Column 1: Brand & Conference Meta */}
        <div className="kz-footer-brand-col">
          <a href="/" className="kz-footer-brand-logo-link" onClick={handleLogoClick} aria-label="KaizenCon 2027 Home">
            <img
              src={logoImg}
              alt="KaizenCon 2027 International Medical Conference"
              className="kz-footer-brand-logo-img"
            />
          </a>

          <p className="kz-footer-brand-desc">
            Where Human Expertise Meets Artificial Intelligence.
          </p>
     
          <div className="kz-footer-meta-list">
            {/* Event Dates */}
            <div className="kz-footer-meta-item">
              <div className="kz-footer-meta-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                  <line x1="16" y1="2" x2="16" y2="6" />
                  <line x1="8" y1="2" x2="8" y2="6" />
                  <line x1="3" y1="10" x2="21" y2="10" />
                </svg>
              </div>
              <div className="kz-footer-meta-text">
                <span className="kz-footer-meta-primary">1 – 3 January 2027</span>
                <span className="kz-footer-meta-secondary">Ahmedabad, India</span>
              </div>
            </div>

            {/* Event Location */}
            <div className="kz-footer-meta-item">
              <div className="kz-footer-meta-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
              </div>
              <div className="kz-footer-meta-text">
                <span className="kz-footer-meta-primary">International Conference Centre</span>
                <span className="kz-footer-meta-secondary">Ahmedabad, India</span>
              </div>
            </div>
          </div>
        </div>

        {/* Column 2: Conference Links */}
        <div className="kz-footer-nav-col">
          <h3 className="kz-footer-nav-heading">Conference</h3>
          <div className="kz-footer-heading-bar" aria-hidden="true"></div>
          <ul className="kz-footer-nav-list">
            <li><a href="/about" onClick={(e) => handleFooterNav(e, '/about')}>About KaizenCon</a></li>
            <li><a href="/programme" onClick={(e) => handleFooterNav(e, '/programme')}>Programme</a></li>
            <li><a href="/speakers" onClick={(e) => handleFooterNav(e, '/speakers')}>Speakers</a></li>
            <li><a href="/#venue" onClick={(e) => handleFooterNav(e, '/#venue')}>Venue &amp; Travel</a></li>
            <li><a href="/#registration" onClick={(e) => handleFooterNav(e, '/#registration')}>Registration</a></li>
            <li><a href="/contact" onClick={(e) => handleFooterNav(e, '/contact')}>Contact Us</a></li>
          </ul>
        </div>

        {/* Column 3: AI Experience Links */}
        <div className="kz-footer-nav-col">
          <h3 className="kz-footer-nav-heading">AI Experience</h3>
          <div className="kz-footer-heading-bar" aria-hidden="true"></div>
          <ul className="kz-footer-nav-list">
            <li><a href="/ai-experience" onClick={(e) => handleFooterNav(e, '/ai-experience')}>The AI Experience</a></li>
            <li><a href="/ai-experience#personalization" onClick={(e) => handleFooterNav(e, '/ai-experience#personalization')}>AI Personalization</a></li>
            <li><a href="/ai-experience#assistant" onClick={(e) => handleFooterNav(e, '/ai-experience#assistant')}>Conference Assistant</a></li>
            <li><a href="/ai-experience#live-qa" onClick={(e) => handleFooterNav(e, '/ai-experience#live-qa')}>Live Q&amp;A Intelligence</a></li>
            <li><a href="/ai-experience#perspectives" onClick={(e) => handleFooterNav(e, '/ai-experience#perspectives')}>AI Perspectives</a></li>
            <li><a href="/ai-experience#knowledge" onClick={(e) => handleFooterNav(e, '/ai-experience#knowledge')}> Conference Knowledge</a></li>
          </ul>
        </div>

        {/* Column 4: Get in Touch */}
        <div className="kz-footer-contact-col">
          <h3 className="kz-footer-nav-heading">Get in Touch</h3>
          <div className="kz-footer-heading-bar" aria-hidden="true"></div>
          <ul className="kz-footer-contact-list">
            {/* Email */}
            <li className="kz-footer-contact-item">
              <span className="kz-footer-contact-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="4" width="20" height="16" rx="2" />
                  <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                </svg>
              </span>
              <a href="mailto:hello@kaizencon.demo" className="kz-footer-contact-link">
                hello@kaizencon.demo
              </a>
            </li>

            {/* Phone */}
            <li className="kz-footer-contact-item">
              <span className="kz-footer-contact-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                </svg>
              </span>
              <a href="tel:+917912345678" className="kz-footer-contact-link">
                +91 79 1234 5678
              </a>
            </li>

            {/* Address */}
            <li className="kz-footer-contact-item kz-footer-contact-address">
              <span className="kz-footer-contact-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
              </span>
              <div className="kz-footer-contact-multiline">
                <span>International Conference Centre</span>
                <span>Ahmedabad, India</span>
              </div>
            </li>

            {/* Website */}
            <li className="kz-footer-contact-item">
              <span className="kz-footer-contact-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="2" y1="12" x2="22" y2="12" />
                  <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                </svg>
              </span>
              <a href="https://www.kaizencon.demo" target="_blank" rel="noopener noreferrer" className="kz-footer-contact-link">
                www.kaizencon.demo
              </a>
            </li>
          </ul>
        </div>
      </div>

      {/* Bottom Copyright & Legal Bar */}
      <div className="kz-footer-bottom-bar">
        <div className="kz-footer-bottom-container">
          <p className="kz-footer-copyright-text">
            &copy; 2027 KaizenCon International Medical Conference. All rights reserved.
          </p>
          <p className="kz-footer-disclaimer-text">
            All speakers, sessions, and institutions on this website are fictional and created for demonstration purposes only.
          </p>
        </div>
      </div>
    </footer>
  );
}
