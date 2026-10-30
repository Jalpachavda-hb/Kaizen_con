import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiEye, FiTarget } from 'react-icons/fi';
import { GiStomach } from 'react-icons/gi';
import './AboutPage.css';
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

  const pillars = [
    {
      num: '01',
      title: 'AI-Native Clinical Architecture',
      tag: 'REAL-TIME DATA',
      desc: 'Moving beyond theoretical machine learning into real-time intraoperative intelligence, surgical computer vision, and structured multimodal data capture.',
      highlights: ['Sub-second latency computer vision', 'Intraoperative tissue characterization', 'Automated procedural event logging']
    },
    {
      num: '02',
      title: 'Robotic Surgery & Precision',
      tag: 'OPERATIVE EXCELLENCE',
      desc: 'Highlighting multi-port and single-port robotic platforms, autonomous tissue manipulation prototypes, haptic tele-presence, and augmented visualization.',
      highlights: ['Next-generation surgical consoles', 'Comparative outcomes vs. laparoscopy', 'Precision pelvic & GI oncologic resections']
    },
    {
      num: '03',
      title: 'Continuous Improvement (Kaizen)',
      tag: 'CLINICAL EVOLUTION',
      desc: 'Grounding every algorithm in verified clinical efficacy, rigorous patient safety, ethical AI governance, and verifiable surgical outcomes.',
      highlights: ['Peer-reviewed validation cohorts', 'Ethical AI decision frameworks', 'Zero-hallucination surgical assistant models']
    },
    {
      num: '04',
      title: 'Global Mentorship & Democratization',
      tag: 'GLOBAL REACH',
      desc: 'Bridging the divide between premier academic centers and community healthcare institutions worldwide through AI-guided remote surgical training.',
      highlights: ['Telesurgery & cross-border mentoring', 'Open-access surgical knowledge bases', 'Resident and fellow AI fellowship tracks']
    }
  ];

  const comparisonData = [
    {
      aspect: 'Conference Structure',
      traditional: 'Static slide presentations with isolated Q&A microphones',
      kaizen: 'Live AI-synthesized sessions, semantic questioning & dynamic speaker dialogue'
    },
    {
      aspect: 'Knowledge Retention',
      traditional: 'Notes forgotten after departing; unindexed slide PDFs',
      kaizen: 'Full conversational AI Knowledge Base queryable long after the event concludes'
    },
    {
      aspect: 'Session Personalization',
      traditional: 'One-size-fits-all generic auditorium schedule',
      kaizen: 'AI-driven agenda curation tailored to your sub-specialty & clinical goals'
    },
    {
      aspect: 'Surgical Focus',
      traditional: 'Broad retrospective literature reviews',
      kaizen: 'Live operative case dissections with real-time AI computer vision overlays'
    }
  ];

  const leadershipPreviews = [
    {
      name: 'Dr. Arjun Mehta',
      role: 'GI & Robotic Surgeon',
      inst: 'Global Institute of Surgical Innovation',
      country: 'India 🇮🇳',
      badge: 'Scientific Co-Chair'
    },
    {
      name: 'Dr. Sofia Laurent',
      role: 'Surgical Oncologist & AI Researcher',
      inst: 'International Centre for Robotic Surgery',
      country: 'France 🇫🇷',
      badge: 'Program Director'
    },
    {
      name: 'Dr. Daniel Okafor',
      role: 'Laparoscopic & Colorectal Surgeon',
      inst: 'Future Health Research Institute',
      country: 'Nigeria 🇳🇬',
      badge: 'Clinical Trials Lead'
    },
    {
      name: 'Dr. Maya Chen',
      role: 'Computational Surgeon & Vision Specialist',
      inst: 'Centre for Intelligent Surgery',
      country: 'Singapore 🇸🇬',
      badge: 'AI Technology Lead'
    }
  ];

  const faqs = [
    {
      q: 'What is the core theme of KaizenCon 2027?',
      a: 'KaizenCon 2027 is an international, AI-native medical technology conference dedicated to the convergence of advanced robotic surgery and artificial intelligence. Our motto is "Continuous improvement, now with intelligence," uniting surgeons, engineers, and clinical leaders.'
    },
    {
      q: 'Who should attend KaizenCon 2027?',
      a: 'The summit is designed for gastrointestinal surgeons, oncologists, minimally invasive & robotic surgeons, biomedical engineers, medical AI researchers, hospital directors, and surgical trainees eager to master next-generation operative technology.'
    },
    {
      q: 'Where and when does the conference take place?',
      a: 'KaizenCon 2027 takes place from 1–3 January 2027 at the International Conference Centre, Hyatt Regency, Ashram Road, Ahmedabad, India.'
    },
    {
      q: 'How does KaizenCon incorporate AI into the attendee experience?',
      a: 'Attendees receive personalized agenda curation, an intelligent AI conference companion trained on all sessions, instant semantic Q&A clustering during keynotes, and lifetime access to the searchable KaizenCon Knowledge Base.'
    }
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
      <section className="kz-about-hero-section" aria-label="About KaizenCon 2027">
        <div className="kz-about-hero-ambient" aria-hidden="true" />

        <div className="kz-about-container kz-about-hero-inner">
          {/* Breadcrumb Navigation */}
          <nav className="kz-about-breadcrumb" aria-label="Breadcrumb">
            <Link to="/" className="kz-about-crumb-link">Home</Link>
            <span className="kz-about-crumb-sep">/</span>
            <span className="kz-about-crumb-current">About Us</span>
          </nav>

          {/* Top Eyebrow Badge: ABOUT KAIZENCON 2027 */}
          <div className="kz-about-eyebrow-wrap">
            <span className="kz-about-eyebrow-badge">
              <svg className="kz-about-badge-sparkle" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5L12 2Z" fill="currentColor" />
              </svg>
              ABOUT KAIZENCON 2027
            </span>
          </div>

          {/* Main Headline in 2 lines with distinct font colors */}
          <h1 className="kz-about-hero-headline">
            <span className="kz-about-hero-dark">Continuous Improvement,</span>
            <span className="kz-about-hero-magenta">now with intelligence.</span>
          </h1>

          {/* Capsule Pills Row */}
          <div className="kz-about-pills-row" aria-label="Event Details">
            <div className="kz-about-pill">
              <span className="kz-about-pill-dot" />
              <span>1–3 January 2027</span>
            </div>
            <div className="kz-about-pill">
              <span className="kz-about-pill-dot" />
              <span>Ahmedabad, India</span>
            </div>
            <div className="kz-about-pill">
              <span className="kz-about-pill-dot" />
              <span>International Conference Centre</span>
            </div>
          </div>

          {/* Shortened Subtitle / Lead Paragraph */}
          <p className="kz-about-hero-description">
            An international AI-native conference on the future of surgery &amp; intelligent healthcare.
          </p>
        </div>
      </section>

      {/* ====================================================
          3. OUR STORY: WHY KAIZENCON EXISTS
          ==================================================== */}
      <section className="kz-story-section" id="our-story">
        <div className="kz-about-container">
          <div className="kz-story-grid">
            {/* Left Column: Why KaizenCon Exists + Kaizen Definition */}
            <div className="kz-story-left-col">
              <div className="kz-story-eyebrow-wrap">
                <span className="kz-story-badge">OUR STORY</span>
              </div>

              <h2 className="kz-story-heading">
                Why KaizenCon <br />
                <span className="kz-story-heading-accent">exists</span>
              </h2>

              <div className="kz-story-accent-bar" aria-hidden="true" />

              <p className="kz-story-lead">
                Medical conferences are packed with knowledge, yet delegates often face too many sessions, little personalisation, and insights that vanish once the event ends.
              </p>

              <p className="kz-story-body">
                KaizenCon 2027 answers with a conference that thinks with you. Intelligence is woven into every layer, from the moment you register to the knowledge you carry home. It is built to augment clinicians, never replace them.
              </p>

              {/* Kaizen (改善) Concept Card */}
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

            {/* Right Column: Vision & Mission Cards */}
            <div className="kz-story-right-col">
              {/* VISION CARD */}
              <div className="kz-story-card kz-vision-card">
                <div className="kz-card-left-stripe kz-stripe-pink" aria-hidden="true" />

                <div className="kz-card-inner">
                  {/* Left Icon Badge using React Icon FiEye */}
                  <div className="kz-card-icon-badge kz-badge-pink">
                    <div className="kz-badge-ring">
                      <FiEye className="kz-card-react-icon" />
                    </div>
                  </div>

                  {/* Card Content */}
                  <div className="kz-card-text-block">
                    <span className="kz-card-tag kz-tag-pink">VISION</span>
                    <h3 className="kz-card-heading">A new standard for medical conferences.</h3>
                    <p className="kz-card-desc">
                      A place where human expertise and artificial intelligence work together, and where knowledge outlasts the event.
                    </p>
                  </div>
                </div>
              </div>

              {/* MISSION CARD */}
              <div className="kz-story-card kz-mission-card">
                <div className="kz-card-left-stripe kz-stripe-teal" aria-hidden="true" />

                <div className="kz-card-inner">
                  {/* Left Icon Badge using React Icon FiTarget */}
                  <div className="kz-card-icon-badge kz-badge-teal">
                    <div className="kz-badge-ring">
                      <FiTarget className="kz-card-react-icon" />
                    </div>
                  </div>

                  {/* Card Content */}
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
      </section>

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

      {/* ====================================================
          4. WHAT MAKES IT DIFFERENT: 4 PILLARS & STATS
          ==================================================== */}
      <section className="kz-diff-pillars-section" id="four-pillars">
        <div className="kz-about-container">
          {/* Section Header */}
          <div className="kz-pillars-header">
            <div className="kz-pillars-badge-wrap">
              <span className="kz-pillars-badge">CORE CAPABILITIES</span>
            </div>
            <h2 className="kz-pillars-main-title">
              An AI-native conference, built <br />
              <span className="kz-pillars-title-gradient">on four pillars</span>
            </h2>
            <div className="kz-pillars-accent-bar" aria-hidden="true" />
            <p className="kz-pillars-header-desc">
              From real-time clinical personalisation to lasting post-event intelligence, every touchpoint is architected to empower surgical leaders and clinicians.
            </p>
          </div>

          {/* 4 Pillars Cards - Elevated Creative Architectural UI */}
          <div className="kz-pillars-grid">
            {/* Pillar 01: Personalized */}
            <div className="kz-pillar-card kz-pillar-card-01">
              <div className="kz-pillar-top-stripe kz-stripe-pink" aria-hidden="true" />
              <div className="kz-pillar-watermark" aria-hidden="true">01</div>

              <div className="kz-pillar-header-row">
                <div className="kz-pillar-badge kz-badge-pink">
                  <span className="kz-pillar-badge-dot kz-dot-pink" />
                  <span>PILLAR 01</span>
                </div>
                <div className="kz-pillar-icon-box kz-icon-box-pink">
                  <svg className="kz-pillar-svg" viewBox="0 0 36 36" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="5" y="7" width="26" height="24" rx="4" />
                    <line x1="11" y1="3.5" x2="11" y2="8" />
                    <line x1="25" y1="3.5" x2="25" y2="8" />
                    <line x1="5" y1="14" x2="31" y2="14" />
                    <circle cx="23.5" cy="23.5" r="6.5" fill="#C0266A" stroke="#C0266A" strokeWidth="1" />
                    <path d="M23.5 19.8l1 2 2.2.3-1.6 1.6.4 2.2-2-1-2 1 .4-2.2-1.6-1.6 2.2-.3z" fill="#FFFFFF" stroke="#FFFFFF" strokeWidth="0.5" strokeLinejoin="round" />
                  </svg>
                </div>
              </div>

              <div className="kz-pillar-content">
                <h3 className="kz-pillar-title">Personalized</h3>
                <p className="kz-pillar-desc">
                  A tailored programme based on your speciality and interests, ready before you arrive.
                </p>
                <div className="kz-pillar-chips">
                  <span className="kz-pillar-chip">Agenda AI</span>
                  <span className="kz-pillar-chip">Clinical Focus</span>
                </div>
              </div>

            
            </div>

            {/* Pillar 02: Intelligent */}
            <div className="kz-pillar-card kz-pillar-card-02">
              <div className="kz-pillar-top-stripe kz-stripe-purple" aria-hidden="true" />
              <div className="kz-pillar-watermark" aria-hidden="true">02</div>

              <div className="kz-pillar-header-row">
                <div className="kz-pillar-badge kz-badge-purple">
                  <span className="kz-pillar-badge-dot kz-dot-purple" />
                  <span>PILLAR 02</span>
                </div>
                <div className="kz-pillar-icon-box kz-icon-box-purple">
                  <svg className="kz-pillar-svg" viewBox="0 0 36 36" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="3" x2="18" y2="7.5" />
                    <circle cx="18" cy="3.5" r="1.8" fill="currentColor" stroke="none" />
                    <rect x="7.5" y="7.5" width="21" height="17" rx="6" />
                    <line x1="4.5" y1="16" x2="7.5" y2="16" strokeWidth="3" strokeLinecap="round" />
                    <line x1="28.5" y1="16" x2="31.5" y2="16" strokeWidth="3" strokeLinecap="round" />
                    <circle cx="13.5" cy="14.5" r="1.8" fill="currentColor" stroke="none" />
                    <circle cx="22.5" cy="14.5" r="1.8" fill="currentColor" stroke="none" />
                    <line x1="14" y1="19.5" x2="22" y2="19.5" strokeWidth="2" strokeLinecap="round" />
                    <path d="M12 24.5v2.5c0 2 2.5 3.5 6 3.5s6-1.5 6-3.5v-2.5" />
                  </svg>
                </div>
              </div>

              <div className="kz-pillar-content">
                <h3 className="kz-pillar-title">Intelligent</h3>
                <p className="kz-pillar-desc">
                  A conference AI assistant that answers questions using approved KaizenCon content only.
                </p>
                <div className="kz-pillar-chips">
                  <span className="kz-pillar-chip">Grounded AI</span>
                  <span className="kz-pillar-chip">Verified Corpus</span>
                </div>
              </div>

              
            </div>

            {/* Pillar 03: Interactive */}
            <div className="kz-pillar-card kz-pillar-card-03">
              <div className="kz-pillar-top-stripe kz-stripe-rose" aria-hidden="true" />
              <div className="kz-pillar-watermark" aria-hidden="true">03</div>

              <div className="kz-pillar-header-row">
                <div className="kz-pillar-badge kz-badge-rose">
                  <span className="kz-pillar-badge-dot kz-dot-rose" />
                  <span>PILLAR 03</span>
                </div>
                <div className="kz-pillar-icon-box kz-icon-box-rose">
                  <svg className="kz-pillar-svg" viewBox="0 0 36 36" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="9" y="4" width="18" height="12" rx="3.5" />
                    <path d="M15 16v3.5l4-3.5" />
                    <circle cx="13.5" cy="10" r="1" fill="currentColor" stroke="none" />
                    <circle cx="18" cy="10" r="1" fill="currentColor" stroke="none" />
                    <circle cx="22.5" cy="10" r="1" fill="currentColor" stroke="none" />
                    <circle cx="9.5" cy="23.5" r="2.4" />
                    <path d="M5.5 31c0-2.2 1.8-3.6 4-3.6s4 1.4 4 3.6" />
                    <circle cx="26.5" cy="23.5" r="2.4" />
                    <path d="M22.5 31c0-2.2 1.8-3.6 4-3.6s4 1.4 4 3.6" />
                    <circle cx="18" cy="22" r="2.8" />
                    <path d="M13.5 31c0-2.5 2-4.2 4.5-4.2s4.5 1.7 4.5 4.2" />
                  </svg>
                </div>
              </div>

              <div className="kz-pillar-content">
                <h3 className="kz-pillar-title">Interactive</h3>
                <p className="kz-pillar-desc">
                  Live polls and Q&amp;A clustering turn a queue of questions into structured discussion.
                </p>
                <div className="kz-pillar-chips">
                  <span className="kz-pillar-chip">Semantic Q&amp;A</span>
                  <span className="kz-pillar-chip">Live Clustering</span>
                </div>
              </div>

             
            </div>

            {/* Pillar 04: Connected */}
            <div className="kz-pillar-card kz-pillar-card-04">
              <div className="kz-pillar-top-stripe kz-stripe-indigo" aria-hidden="true" />
              <div className="kz-pillar-watermark" aria-hidden="true">04</div>

              <div className="kz-pillar-header-row">
                <div className="kz-pillar-badge kz-badge-indigo">
                  <span className="kz-pillar-badge-dot kz-dot-indigo" />
                  <span>PILLAR 04</span>
                </div>
                <div className="kz-pillar-icon-box kz-icon-box-indigo">
                  <svg className="kz-pillar-svg" viewBox="0 0 36 36" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 17c.5-3.3-2-6-5.5-6-2.5 0-4.6 1.4-5.4 3.5-1-.5-2.2-.7-3.4-.3-2.6.9-4.2 3.6-3.7 6.3.5 2.7 2.8 4.5 5.5 4.5h6" />
                    <circle cx="23.5" cy="22.5" r="5" />
                    <line x1="27.2" y1="26.2" x2="31.5" y2="30.5" strokeWidth="2.8" />
                  </svg>
                </div>
              </div>

              <div className="kz-pillar-content">
                <h3 className="kz-pillar-title">Connected</h3>
                <p className="kz-pillar-desc">
                  Every session becomes a searchable knowledge asset that lives on after the event.
                </p>
                <div className="kz-pillar-chips">
                  <span className="kz-pillar-chip">Searchable Corpus</span>
                  <span className="kz-pillar-chip">Lifetime Access</span>
                </div>
              </div>

              
            </div>
          </div>

          {/* Elevated Impact Metrics Strip (Directly below 4 pillars) */}
          <div className="kz-impact-stats-banner">
            <div className="kz-impact-stats-mesh" aria-hidden="true" />
            <div className="kz-impact-stats-inner">
              {/* Stat 1: 3 Days */}
              <div className="kz-impact-stat-pod">
                <div className="kz-impact-icon-circle">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                    <line x1="16" y1="2" x2="16" y2="6" />
                    <line x1="8" y1="2" x2="8" y2="6" />
                    <line x1="3" y1="10" x2="21" y2="10" />
                  </svg>
                </div>
                <div className="kz-impact-stat-num">3</div>
                <div className="kz-impact-stat-title">Days</div>
                <div className="kz-impact-stat-detail">Intensive surgical &amp; AI immersion</div>
              </div>

              <div className="kz-impact-pod-sep" aria-hidden="true" />

              {/* Stat 2: 100+ Sessions */}
              <div className="kz-impact-stat-pod">
                <div className="kz-impact-icon-circle">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
                    <line x1="9" y1="7" x2="16" y2="7" />
                    <line x1="9" y1="11" x2="14" y2="11" />
                  </svg>
                </div>
                <div className="kz-impact-stat-num">100+</div>
                <div className="kz-impact-stat-title">Scientific sessions</div>
                <div className="kz-impact-stat-detail">Across 4 dedicated halls</div>
              </div>

              <div className="kz-impact-pod-sep" aria-hidden="true" />

              {/* Stat 3: 150+ Speakers */}
              <div className="kz-impact-stat-pod">
                <div className="kz-impact-icon-circle">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
                    <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                    <line x1="12" y1="19" x2="12" y2="22" />
                  </svg>
                </div>
                <div className="kz-impact-stat-num">150+</div>
                <div className="kz-impact-stat-title">Expert speakers</div>
                <div className="kz-impact-stat-detail">From 40+ countries worldwide</div>
              </div>

              <div className="kz-impact-pod-sep" aria-hidden="true" />

              {/* Stat 4: 2,500+ Delegates */}
              <div className="kz-impact-stat-pod">
                <div className="kz-impact-icon-circle">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                  </svg>
                </div>
                <div className="kz-impact-stat-num">2,500+</div>
                <div className="kz-impact-stat-title">International delegates</div>
                <div className="kz-impact-stat-detail">Surgeons, engineers &amp; leaders</div>
              </div>
            </div>
          </div>
        </div>
      </section>


   

    </div>
  );
}
