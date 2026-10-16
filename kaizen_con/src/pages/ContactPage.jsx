import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaHandshake } from 'react-icons/fa6';
import connectBg from '../assets/home/connect_bg.jpg';
import './ContactPage.css';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    affiliation: '',
    category: 'General Inquiry',
    message: '',
    agreed: false
  });

  const [formSubmitted, setFormSubmitted] = useState(false);
  const [activeFaq, setActiveFaq] = useState(null);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const selectCategoryAndScroll = (category) => {
    setFormData(prev => ({ ...prev, category }));
    const formEl = document.querySelector('.kz-contact-form-wrapper');
    if (formEl) {
      formEl.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.firstName || !formData.email || !formData.message) {
      alert('Please fill out all required fields.');
      return;
    }
    setFormSubmitted(true);
  };

  const resetForm = () => {
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      affiliation: '',
      category: 'General Inquiry',
      message: '',
      agreed: false
    });
    setFormSubmitted(false);
  };

  const toggleFaq = (index) => {
    setActiveFaq(activeFaq === index ? null : index);
  };

  const faqs = [
    {
      q: 'How do I register for KaizenCon 2027 and the AI Hands-on Workshop?',
      a: 'Registrations are open online through the portal. Early bird registration gives you priority access to specialized AI simulation labs and robotic surgery masterclasses.'
    },
    {
      q: 'Can I submit an abstract or case study for the scientific tracks?',
      a: 'Yes, call for abstracts is currently open. Selected papers will be presented during the main scientific sessions and published in the conference proceedings.'
    },
    {
      q: 'Is accommodation provided at Hyatt Regency Ahmedabad?',
      a: 'Special discounted delegate rates are available at Hyatt Regency Ahmedabad and partner hotels along Ashram Road. Please contact our hospitality desk for reservations.'
    },
    {
      q: 'Will CME credit points be awarded to delegates?',
      a: 'Yes, KaizenCon 2027 is accredited by national and international surgical boards. CME credit certificates will be issued upon attendance verification.'
    }
  ];

  return (
    <div className="kz-contact-page">
      {/* 1. HERO SECTION WITH MATCHING TYPOGRAPHY */}
      <section className="kz-contact-hero-simple">
        <div className="kz-contact-container">
          {/* Breadcrumb Navigation */}
          <nav className="kz-contact-breadcrumb" aria-label="Breadcrumb">
            <Link to="/" className="kz-contact-crumb-link">Home</Link>
            <span className="kz-contact-crumb-sep">/</span>
            <span className="kz-contact-crumb-current">Contact Us</span>
          </nav>

          <div className="kz-hero-simple-content">
            <div className="kz-contact-eyebrow-wrap">
              <span className="kz-hero-simple-badge">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: '6px' }}>
                  <path d="M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5L12 2Z" fill="currentColor" />
                </svg>
                GET IN TOUCH · KAIZENCON 2027
              </span>
            </div>

            <h1 className="kz-contact-hero-headline">
              <span className="kz-contact-hero-dark">Connect With Us,</span>
              <span className="kz-contact-hero-magenta">now with intelligence.</span>
            </h1>

            {/* Event Details Pills Row matching About Page exactly */}
            <div className="kz-contact-pills-row" aria-label="Event Details">
              <div className="kz-contact-pill">
                <span className="kz-contact-pill-dot" />
                <span>1–3 January 2027</span>
              </div>
              <div className="kz-contact-pill">
                <span className="kz-contact-pill-dot" />
                <span>Ahmedabad, India</span>
              </div>
              <div className="kz-contact-pill">
                <span className="kz-contact-pill-dot" />
                <span>International Conference Centre</span>
              </div>
            </div>

            <p className="kz-hero-simple-desc">
              An international AI-native conference on the future of surgery &amp; intelligent healthcare. For registrations, sponsorships, faculty queries, or media relations.
            </p>

            {/* Quick cross-page router navigation pills */}
            <div className="kz-contact-quick-links" aria-label="Quick navigation to other pages">
              <Link to="/about" className="kz-contact-quick-link">
                <span>About KaizenCon</span>
                <span aria-hidden="true">→</span>
              </Link>
              <Link to="/speakers" className="kz-contact-quick-link">
                <span>Conference Faculty</span>
                <span aria-hidden="true">→</span>
              </Link>
              <Link to="/knowledge" className="kz-contact-quick-link">
                <span>Search Knowledge Base</span>
                <span aria-hidden="true">→</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 3. MAIN FORM & DETAILS SECTION */}
      <section className="kz-contact-main-section">
        <div className="kz-contact-container">
          <div className="kz-contact-main-grid">
            
            {/* Left: Interactive Form */}
            <div className="kz-contact-form-column">
              <div className="kz-contact-form-wrapper">
                <div className="kz-contact-form-header">
                  <span className="kz-contact-form-badge">Send a Message</span>
                  <h2 className="kz-contact-form-title">
                    Send Your <span className="kz-gradient-text">Inquiry</span>
                  </h2>
                  <p className="kz-contact-form-desc">
                    Fill out the form below. A member of the KaizenCon Organizing Committee will respond within 24 business hours.
                  </p>
                </div>

                {formSubmitted ? (
                  <div className="kz-contact-success-box">
                    <div className="kz-success-icon-box">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    </div>
                    <h3 className="kz-success-title">Message Sent Successfully!</h3>
                    <p className="kz-success-desc">
                      Thank you, <strong>{formData.firstName}</strong>. Your inquiry regarding <strong>{formData.category}</strong> has been registered with KaizenCon 2027 Secretariat. A confirmation has been logged.
                    </p>
                    <button type="button" className="kz-contact-btn-reset" onClick={resetForm}>
                      Send Another Message
                    </button>
                  </div>
                ) : (
                  <form className="kz-contact-form" onSubmit={handleSubmit}>
                    <div className="kz-form-row">
                      <div className="kz-form-group">
                        <label htmlFor="firstName">First Name <span className="req">*</span></label>
                        <input
                          type="text"
                          id="firstName"
                          name="firstName"
                          placeholder="e.g. Dr. Rajesh"
                          value={formData.firstName}
                          onChange={handleChange}
                          required
                        />
                      </div>
                      <div className="kz-form-group">
                        <label htmlFor="lastName">Last Name</label>
                        <input
                          type="text"
                          id="lastName"
                          name="lastName"
                          placeholder="e.g. Patel"
                          value={formData.lastName}
                          onChange={handleChange}
                        />
                      </div>
                    </div>

                    <div className="kz-form-row">
                      <div className="kz-form-group">
                        <label htmlFor="email">Email Address <span className="req">*</span></label>
                        <input
                          type="email"
                          id="email"
                          name="email"
                          placeholder="rajesh.patel@hospital.org"
                          value={formData.email}
                          onChange={handleChange}
                          required
                        />
                      </div>
                      <div className="kz-form-group">
                        <label htmlFor="phone">Phone / WhatsApp</label>
                        <input
                          type="tel"
                          id="phone"
                          name="phone"
                          placeholder="+91 98765 00000"
                          value={formData.phone}
                          onChange={handleChange}
                        />
                      </div>
                    </div>

                    <div className="kz-form-row">
                      <div className="kz-form-group">
                        <label htmlFor="affiliation">Hospital / Institution / University</label>
                        <input
                          type="text"
                          id="affiliation"
                          name="affiliation"
                          placeholder="e.g. AIIMS / Apollo / Kaizen Hospital"
                          value={formData.affiliation}
                          onChange={handleChange}
                        />
                      </div>
                      <div className="kz-form-group">
                        <label htmlFor="category">Inquiry Subject <span className="req">*</span></label>
                        <select
                          id="category"
                          name="category"
                          value={formData.category}
                          onChange={handleChange}
                        >
                          <option value="Registration & Badges">Registration &amp; Delegate Badges</option>
                          <option value="Abstracts & Papers">Abstract Submissions &amp; Posters</option>
                          <option value="Faculty & Speakers">Faculty, Speakers &amp; Panellists</option>
                          <option value="AI Workshop & Demos">AI Experience &amp; Live Demos</option>
                          <option value="Sponsorship & Exhibits">Sponsorship, Stalls &amp; Industry</option>
                          <option value="Accommodation & Travel">Accommodation &amp; Transport</option>
                          <option value="General Inquiry">General / Other Inquiries</option>
                        </select>
                      </div>
                    </div>

                    <div className="kz-form-group">
                      <label htmlFor="message">Your Message / Query <span className="req">*</span></label>
                      <textarea
                        id="message"
                        name="message"
                        rows="5"
                        placeholder="Please describe your query, registration reference number (if applicable), or question..."
                        value={formData.message}
                        onChange={handleChange}
                        required
                      ></textarea>
                    </div>

                    <div className="kz-form-checkbox-group">
                      <label className="kz-checkbox-label">
                        <input
                          type="checkbox"
                          name="agreed"
                          checked={formData.agreed}
                          onChange={handleChange}
                        />
                        <span>I consent to receiving official conference updates and notifications via email / WhatsApp.</span>
                      </label>
                    </div>

                    <button type="submit" className="kz-contact-btn-submit">
                      <span>Send Message</span>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="22" y1="2" x2="11" y2="13" />
                        <polygon points="22 2 15 22 11 13 2 9 22 2" />
                      </svg>
                    </button>
                  </form>
                )}
              </div>
            </div>

            {/* Right: LET'S Connect Card */}
            <div className="kz-contact-sidebar-column">
              <div className="kz-connect-sidebar-card">
                {/* Background Office Plant Image */}
                <div 
                  className="kz-connect-bg-img"
                  style={{ backgroundImage: `url(${connectBg})` }}
                  aria-hidden="true"
                />

                {/* Decorative Top-Right Ribbon */}
                <div className="kz-connect-ribbon" aria-hidden="true">
                  <svg viewBox="0 0 120 120" preserveAspectRatio="none">
                    <polygon points="35,0 120,0 120,85" fill="url(#kzConnectRibbonGrad)" />
                    <defs>
                      <linearGradient id="kzConnectRibbonGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#AA2D7B" />
                        <stop offset="100%" stopColor="#55355E" />
                      </linearGradient>
                    </defs>
                  </svg>
                </div>

                <div className="kz-connect-card-header">
                  <span className="kz-connect-eyebrow">LET&apos;S</span>
                  <h3 className="kz-connect-title">Connect</h3>
                  <p className="kz-connect-desc">
                    Have a question or need assistance? Our team is here to support you.
                  </p>
                </div>

                <div className="kz-connect-features-list">
                  {/* Feature 1: Quick Response */}
                  <div className="kz-connect-feature-item">
                    <div className="kz-connect-icon-circle">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="9" />
                        <polyline points="12 7 12 12 15.5 13.5" />
                      </svg>
                    </div>
                    <div className="kz-connect-feature-text">
                      <h4 className="kz-connect-feature-title">Quick Response</h4>
                      <p className="kz-connect-feature-subtitle">We typically reply within 24 hours</p>
                    </div>
                  </div>

                  {/* Feature 2: Expert Guidance */}
                  <div className="kz-connect-feature-item">
                    <div className="kz-connect-icon-circle">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z" />
                      </svg>
                    </div>
                    <div className="kz-connect-feature-text">
                      <h4 className="kz-connect-feature-title">Expert Guidance</h4>
                      <p className="kz-connect-feature-subtitle">Get help from our dedicated team</p>
                    </div>
                  </div>

                  {/* Feature 3: Event Information */}
                  <div className="kz-connect-feature-item">
                    <div className="kz-connect-icon-circle">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h2v2H7zm4 0h2v2h-2zm4 0h2v2h-2zm-8 4h2v2H7zm4 0h2v2h-2zm4 0h2v2h-2z" />
                      </svg>
                    </div>
                    <div className="kz-connect-feature-text">
                      <h4 className="kz-connect-feature-title">Event Information</h4>
                      <p className="kz-connect-feature-subtitle">Registration, schedule and venue details</p>
                    </div>
                  </div>

                  {/* Feature 4: Partnership Opportunities (FaHandshake) */}
                  <div className="kz-connect-feature-item">
                    <div className="kz-connect-icon-circle">
                      <FaHandshake size={24} />
                    </div>
                    <div className="kz-connect-feature-text">
                      <h4 className="kz-connect-feature-title">Partnership Opportunities</h4>
                      <p className="kz-connect-feature-subtitle">Sponsorship and exhibition enquiries</p>
                    </div>
                  </div>
                </div>

                {/* Venue Details Section (Matching User Reference) */}
                <div className="kz-connect-venue-block">
                  <div className="kz-connect-venue-header">
                    <div className="kz-connect-venue-icon-circle">
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                        <circle cx="12" cy="10" r="3" />
                      </svg>
                    </div>
                    <div className="kz-connect-venue-heading-text">
                      <h4 className="kz-connect-venue-title">Venue</h4>
                      <p className="kz-connect-venue-center">International Conference Centre</p>
                    </div>
                  </div>
                  <div className="kz-connect-venue-address">
                    <p>1 Conference Boulevard</p>
                    <p>International Medical District</p>
                    <p>1–3 January 2027 | Ahmedabad, India</p>
                  </div>
                </div>

              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3.5 VENUE & LOCATION SECTION - 2 MAPS */}
      <section className="kz-contact-venue-section" id="map-section">
        <div className="kz-contact-container">
          <div className="kz-venue-section-header">
            <span className="kz-contact-badge">LOCATIONS &amp; VENUES</span>
            <h2 className="kz-venue-section-title">
              Conference &amp; Clinical Center <span className="kz-gradient-text">Locations</span>
            </h2>
            <p className="kz-venue-section-desc">
              Explore interactive maps and transit access for the official conference sessions at Hyatt Regency and our organizing clinical center at Kaizen Hospital.
            </p>
          </div>

          <div className="kz-dual-venue-grid">
            
            {/* Map 1: Hyatt Regency Ahmedabad */}
            <div className="kz-venue-card">
              <div className="kz-venue-card-header">
                <span className="kz-sidebar-mini-badge">CONFERENCE VENUE</span>
                <h3 className="kz-venue-card-title">Hyatt Regency Ahmedabad</h3>
                <p className="kz-venue-card-addr">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                  <span>Ashram Road, Usmanpura, Ahmedabad, Gujarat 380014</span>
                </p>
              </div>

              <div className="kz-venue-map-container">
                <iframe
                  title="Hyatt Regency Ahmedabad Map"
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3671.6979606821217!2d72.56942917591873!3d23.034873715873955!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x395e84f55f6df8c7%3A0xe54e24efea586119!2sHyatt%20Regency%20Ahmedabad!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin"
                  width="100%"
                  height="210"
                  style={{ border: 0 }}
                  allowFullScreen=""
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                ></iframe>
              </div>

              <div className="kz-venue-card-footer">
                <a
                  href="https://maps.google.com/?q=Hyatt+Regency+Ahmedabad"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="kz-btn-directions"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="3 11 22 2 13 21 11 13 3 11" />
                  </svg>
                  <span>Open Hyatt Regency in Google Maps</span>
                </a>
              </div>
            </div>

            {/* Map 2: Kaizen Hospital */}
            <div className="kz-venue-card">
              <div className="kz-venue-card-header">
                <span className="kz-sidebar-mini-badge">ORGANIZING CLINICAL CENTER</span>
                <h3 className="kz-venue-card-title">Kaizen Hospital</h3>
                <p className="kz-venue-card-addr">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                  <span>132ft. Ring Road, Helmet Circle, Memnagar, Ahmedabad 380052</span>
                </p>
              </div>

              <div className="kz-venue-map-container">
                <iframe
                  title="Kaizen Hospital Ahmedabad Map"
                  src="https://maps.google.com/maps?q=Kaizen+Hospital,+132+Feet+Ring+Road,+Near+Helmet+Cross+Roads,+Memnagar,+Ahmedabad,+Gujarat+380052&t=&z=15&ie=UTF8&iwloc=&output=embed"
                  width="100%"
                  height="210"
                  style={{ border: 0 }}
                  allowFullScreen=""
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                ></iframe>
              </div>

              <div className="kz-venue-card-footer">
                <a
                  href="https://maps.google.com/?q=Kaizen+Hospital+Helmet+Circle+Memnagar+Ahmedabad"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="kz-btn-directions"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="3 11 22 2 13 21 11 13 3 11" />
                  </svg>
                  <span>Open Kaizen Hospital in Google Maps</span>
                </a>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 4. FAQ SECTION */}
      <section className="kz-contact-faq-section">
        <div className="kz-contact-container">
          <div className="kz-faq-header">
            <span className="kz-contact-badge">FREQUENTLY ASKED QUESTIONS</span>
            <h2 className="kz-faq-title">
              Quick Answers to <span className="kz-gradient-text">Common Queries</span>
            </h2>
            <p className="kz-faq-subtitle">Everything you need to know about registering, attending, and connecting at KaizenCon 2027.</p>
          </div>

          <div className="kz-faq-list">
            {faqs.map((faq, idx) => (
              <div
                key={idx}
                className={`kz-faq-item ${activeFaq === idx ? 'is-active' : ''}`}
                onClick={() => toggleFaq(idx)}
              >
                <button
                  type="button"
                  className="kz-faq-question-btn"
                  aria-expanded={activeFaq === idx}
                >
                  <span className="kz-faq-q-text">{faq.q}</span>
                  <span className="kz-faq-toggle-icon" aria-hidden="true">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="6 9 12 15 18 9" />
                    </svg>
                  </span>
                </button>
                {activeFaq === idx && (
                  <div className="kz-faq-answer">
                    <p>{faq.a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
