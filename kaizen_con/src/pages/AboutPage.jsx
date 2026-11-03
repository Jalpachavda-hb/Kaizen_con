import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiEye, FiTarget } from 'react-icons/fi';
import { GiStomach } from 'react-icons/gi';
import './AboutPage.css';
import WelcomeMessage from '../components/Home/WelcomeMessage';
import logokaizecon from '../assets/home/logokaizecon.png';
import connectBg from '../assets/home/connect_bg.jpg';
import bgai from '../assets/home/bgai.png';

export default function AboutPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('philosophy');
  const [openFaq, setOpenFaq] = useState(0);

  const stats = [
    { value: '150+', label: 'Global Surgical Faculty', detail: 'Leading innovators from 25+ countries' },
    { value: '3,000+', label: 'Attending Clinicians', detail: 'Surgeons, fellows, engineers & leaders' },
    { value: '40+', label: 'AI Demonstrations & Labs', detail: 'Hands-on surgical robotics consoles' },
    { value: '3 Days', label: 'Immersive Convergence', detail: '1–3 January 2027 in Ahmedabad' }
  ];




  const attendeesList = [
    {
      id: 'surgeons',
      title: 'Surgeons',
      bg: '#F0EBF9',
      color: '#6B3FA0',
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="7" r="4" />
          <path d="M5.5 21v-2a6.5 6.5 0 0 1 13 0v2" />
          <path d="M9 7h6" />
          <line x1="12" y1="4" x2="12" y2="7" />
        </svg>
      )
    },
    {
      id: 'surgical-oncologists',
      title: 'Surgical oncologists',
      bg: '#FCEBF3',
      color: '#D13B7E',
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 3c-2.2 0-4 1.8-4 4 0 1.8 1.2 3.4 2.8 4.3L6 21h3.5l3.5-6.5 3.5 6.5H20l-4.8-9.7C16.8 10.4 18 8.8 18 7c0-2.2-1.8-4-4-4z" />
        </svg>
      )
    },
    {
      id: 'researchers',
      title: 'Researchers',
      bg: '#E5F6FA',
      color: '#107C9A',
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
          <path d="M10 2v7.3L5.2 18.5A2 2 0 0 0 7 21.5h10a2 2 0 0 0 1.8-3L14 9.3V2" />
          <line x1="8.5" y1="2" x2="15.5" y2="2" />
          <line x1="7.5" y1="16" x2="16.5" y2="16" />
        </svg>
      )
    },
    {
      id: 'ai-healthtech',
      title: 'AI & health-tech specialists',
      bg: '#FCEEF5',
      color: '#D13B7E',
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="3" />
          <path d="M12 2v2.5M12 19.5V22M2 12h2.5M19.5 12H22M4.93 4.93l1.77 1.77M17.3 17.3l1.77 1.77M4.93 19.07l1.77-1.77M17.3 6.7l1.77-1.77" />
          <circle cx="12" cy="12" r="7" strokeDasharray="3 3" />
        </svg>
      )
    },
    {
      id: 'residents-trainees',
      title: 'Residents & trainees',
      bg: '#F0EBF9',
      color: '#6B3FA0',
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
          <path d="M16 21v-2a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v2" />
          <circle cx="9.5" cy="7" r="3.5" />
          <path d="M21 21v-2a3.5 3.5 0 0 0-2.5-3.3" />
          <path d="M15.5 3.7a3.5 3.5 0 0 1 0 6.6" />
        </svg>
      )
    },
    {
      id: 'hospital-leaders',
      title: 'Hospital leaders',
      bg: '#FCEEF5',
      color: '#D13B7E',
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
          <rect x="4" y="3" width="16" height="18" rx="2" />
          <line x1="9" y1="7" x2="9" y2="7.01" />
          <line x1="15" y1="7" x2="15" y2="7.01" />
          <line x1="9" y1="11" x2="9" y2="11.01" />
          <line x1="15" y1="11" x2="15" y2="11.01" />
          <line x1="12" y1="15" x2="12" y2="19" />
          <line x1="10" y1="17" x2="14" y2="17" />
        </svg>
      )
    },
    {
      id: 'medtech-companies',
      title: 'Medtech companies',
      bg: '#F0EBF9',
      color: '#6B3FA0',
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="4" width="18" height="12" rx="2" />
          <path d="M2 19h20" />
        </svg>
      )
    }
  ];

  const exploreTopicsList = [
    {
      id: 'robotic-laparoscopic',
      title: 'Robotic & laparoscopic surgery',
      bg: '#E5F6FA',
      color: '#107C9A',
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
          <rect x="5" y="19" width="14" height="3" rx="1" />
          <circle cx="12" cy="14" r="2" />
          <line x1="12" y1="14" x2="12" y2="19" />
          <line x1="12" y1="12" x2="8" y2="7" />
          <circle cx="8" cy="7" r="1.5" />
          <line x1="8" y1="7" x2="14" y2="4" />
          <line x1="14" y1="4" x2="16" y2="7" />
        </svg>
      )
    },
    {
      id: 'ai-surgical-planning',
      title: 'AI in surgical planning',
      bg: '#FCEEF5',
      color: '#D13B7E',
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
          <path d="M9.5 3a2.5 2.5 0 0 1 2.5 2.5v13a2.5 2.5 0 0 1-5 0 2.5 2.5 0 0 1-2.5-2.5 3 3 0 0 1 .5-5.5 2.5 2.5 0 0 1 1-4.5 2.5 2.5 0 0 1 3.5-3z" />
          <path d="M14.5 3a2.5 2.5 0 0 0-2.5 2.5v13a2.5 2.5 0 0 0 5 0 2.5 2.5 0 0 0 2.5-2.5 3 3 0 0 0-.5-5.5 2.5 2.5 0 0 0-1-4.5 2.5 2.5 0 0 0-3.5-3z" />
        </svg>
      )
    },
    {
      id: 'surgical-training',
      title: 'Surgical training',
      bg: '#F0EBF9',
      color: '#6B3FA0',
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
          <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
          <path d="M6 12v5c3 3 9 3 12 0v-5" />
        </svg>
      )
    },
    {
      id: 'outcomes-research',
      title: 'Outcomes research',
      bg: '#E5F6FA',
      color: '#107C9A',
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
          <line x1="18" y1="20" x2="18" y2="10" />
          <line x1="12" y1="20" x2="12" y2="4" />
          <line x1="6" y1="20" x2="6" y2="14" />
          <path d="M3 20h18" />
          <path d="M7 8l5-4 5 4" />
        </svg>
      )
    },
    {
      id: 'economics-access',
      title: 'Economics & access',
      bg: '#FCEEF5',
      color: '#D13B7E',
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
          <ellipse cx="12" cy="7" rx="7" ry="2.5" />
          <path d="M5 7v5c0 1.38 3.13 2.5 7 2.5s7-1.12 7-2.5V7" />
          <path d="M5 12v5c0 1.38 3.13 2.5 7 2.5s7-1.12 7-2.5v-5" />
        </svg>
      )
    }
  ];

  return (
    <div className="kz-about-page-root">
      {/* ====================================================
          1. HERO SECTION (Light Theme matching Contact & Knowledge page)
          ==================================================== */}
      <section className="kz-about-hero-section" aria-label="About KAIZENCON 2027">
        <div className="kz-about-hero-ambient" aria-hidden="true" />

        <div className="kz-about-container kz-about-hero-inner">
          {/* Main Headline in 2 lines with distinct font colors */}
          <h1 className="kz-about-hero-headline">
            <span className="kz-about-hero-dark">Continuous Improvement,</span>
            <span className="kz-about-hero-magenta">now with intelligence.</span>
          </h1>

 

          {/* Shortened Subtitle / Lead Paragraph */}
          <p className="kz-about-hero-description">
            An international AI-native conference on the future of surgery &amp; intelligent healthcare.
          </p>
        </div>
      </section>

      {/* ====================================================
          2. WELCOME MESSAGE SECTION (First Section After Banner)
          ==================================================== */}
      <WelcomeMessage />

      {/* ====================================================
          3. OUR STORY: WHY KAIZENCON EXISTS
          ==================================================== */}
      {/* <section className="kz-story-section" id="our-story">
        <div className="kz-about-container">
          <div className="kz-story-grid">
          
            <div className="kz-story-left-col">
              <div className="kz-story-eyebrow-wrap">
                <span className="kz-story-badge">OUR STORY</span>
              </div>

              <h2 className="kz-story-heading">
                Why KAIZENCON <br />
                <span className="kz-story-heading-accent">exists</span>
              </h2>

              <div className="kz-story-accent-bar" aria-hidden="true" />

              <p className="kz-story-lead">
                Medical conferences are packed with knowledge, yet delegates often face too many sessions, little personalisation, and insights that vanish once the event ends.
              </p>

              <p className="kz-story-body">
                KAIZENCON 2027 answers with a conference that thinks with you. Intelligence is woven into every layer, from the moment you register to the knowledge you carry home. It is built to augment clinicians, never replace them.
              </p>

             
              <div className="kz-story-kaizen-card">
                <div className="kz-kaizen-badge-visual">
                  <div className="kz-kaizen-icon-circle">
                    <GiStomach className="kz-kaizen-gastro-icon" />
                  </div>
                </div>

                <div className="kz-kaizen-divider" aria-hidden="true" />

                <div className="kz-kaizen-info">
                  <h4 className="kz-kaizen-title">Kaizen</h4>
                  <p className="kz-kaizen-text">
                    A Japanese principle meaning continuous improvement: small, steady steps toward clinical excellence.
                  </p>
                </div>
              </div>
            </div>

          
            <div className="kz-story-right-col">
              
              <div className="kz-story-card kz-vision-card">
                <div className="kz-card-left-stripe kz-stripe-pink" aria-hidden="true" />

                <div className="kz-card-inner">
             
                  <div className="kz-card-icon-badge kz-badge-pink">
                    <div className="kz-badge-ring">
                      <FiEye className="kz-card-react-icon" />
                    </div>
                  </div>

                  <div className="kz-card-text-block">
                    <span className="kz-card-tag kz-tag-pink">VISION</span>
                    <h3 className="kz-card-heading">A new standard for medical conferences.</h3>
                    <p className="kz-card-desc">
                      A place where human expertise and artificial intelligence work together, and where knowledge outlasts the event.
                    </p>
                  </div>
                </div>
              </div>

            
              <div className="kz-story-card kz-mission-card">
                <div className="kz-card-left-stripe kz-stripe-teal" aria-hidden="true" />

                <div className="kz-card-inner">
       
                  <div className="kz-card-icon-badge kz-badge-teal">
                    <div className="kz-badge-ring">
                      <FiTarget className="kz-card-react-icon" />
                    </div>
                  </div>

                
                  <div className="kz-card-text-block">
                    <span className="kz-card-tag kz-tag-teal">MISSION</span>
                    <h3 className="kz-card-heading">Augment clinical excellence with AI.</h3>
                    <p className="kz-card-desc">
                      Give every delegate a conference shaped around their speciality, their questions, and their goals.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section> */}

      {/* ====================================================
          4. DUAL SHOWCASE: WHO SHOULD ATTEND & WHAT WE WILL EXPLORE
          ==================================================== */}
      <section className="kz-ecosystem-section" id="community-topics">
        <div className="kz-about-container">
          <div className="kz-ecosystem-split">
            {/* Left Side: Who Should Attend */}
            <div className="kz-ecosystem-col kz-attend-col">
              <div className="kz-col-eyebrow-wrap">
                <span className="kz-col-eyebrow kz-eyebrow-pink">WHO SHOULD ATTEND</span>
                <span className="kz-col-eyebrow-bar kz-bar-pink" />
              </div>

              <h2 className="kz-col-title">
                Built for people <br />
                <span className="kz-title-gradient-accent">shaping surgery</span>
              </h2>

              <div className="kz-attendee-grid">
                {attendeesList.map((item) => (
                  <div key={item.id} className="kz-compact-pill-card">
                    <div className="kz-pill-main">
                      <div className="kz-pill-icon-circle" style={{ backgroundColor: item.bg, color: item.color }}>
                        {item.icon}
                      </div>
                      <span className="kz-pill-name">{item.title}</span>
                    </div>
                   
                  </div>
                ))}
              </div>
            </div>

            {/* Subtle Vertical Divider */}
            <div className="kz-ecosystem-divider" aria-hidden="true" />

            {/* Right Side: What We Will Explore */}
            <div className="kz-ecosystem-col kz-explore-col">
              <div className="kz-col-eyebrow-wrap">
                <span className="kz-col-eyebrow kz-eyebrow-dark">THEMES &amp; TOPICS</span>
                <span className="kz-col-eyebrow-bar kz-bar-dark" />
              </div>

              <h2 className="kz-col-title">
                What we will <span className="kz-title-gradient-accent">explore</span>
              </h2>

              <div className="kz-explore-grid">
                {exploreTopicsList.map((item) => (
                  <div key={item.id} className="kz-compact-pill-card">
                    <div className="kz-pill-main">
                      <div className="kz-pill-icon-circle" style={{ backgroundColor: item.bg, color: item.color }}>
                        {item.icon}
                      </div>
                      <span className="kz-pill-name">{item.title}</span>
                    </div>
                    
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
