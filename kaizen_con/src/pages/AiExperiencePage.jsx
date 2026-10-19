import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './AiExperiencePage.css';

// Preset queries for Section 02 AI Assistant
const ASSISTANT_PRESETS = [
  {
    id: 'day2',
    label: 'What should I attend on Day 2?',
    userText: 'What should I attend on Day 2?',
    aiText:
      "For Day 2, based on your clinical profile, I recommend: 09:00 — 'AI Triage in Emergency Surgery' (Main Auditorium), 11:30 — 'Surgeon Training in the Age of AI' (Hall C), and 14:00 — 'ML Models for Surgical Complications' (Hall A).",
    sessions: [
      { time: 'Day 2 · 09:00', title: 'AI Triage in Emergency Surgery', venue: 'Main Auditorium' },
      { time: 'Day 2 · 11:30', title: 'Surgeon Training in the Age of AI', venue: 'Hall C' },
      { time: 'Day 2 · 14:00', title: 'ML Models for Surgical Complications', venue: 'Hall A' },
    ],
  },
  {
    id: 'ai-surgery',
    label: 'Who is discussing AI in surgery?',
    userText: 'Who is discussing AI in surgery?',
    aiText:
      "Multiple world-class faculty are presenting clinical applications of AI: Dr. Sofia Laurent presents ML complication models, Dr. Maya Chen demonstrates intraoperative imaging, and Dr. Arjun Mehta covers autonomous surgical robotics.",
    sessions: [
      { time: 'Day 1 · 09:00', title: 'The AI-Native Operating Theatre', venue: 'Main Auditorium · Dr. Laurent' },
      { time: 'Day 2 · 11:30', title: 'Computer Vision in Tissue Boundary Detection', venue: 'Hall B · Dr. Chen' },
      { time: 'Day 3 · 14:00', title: 'Robotics & Autonomous Trajectories', venue: 'Hall A · Dr. Mehta' },
    ],
  },
  {
    id: 'robotic-colorectal',
    label: 'Show robotic colorectal sessions',
    userText: 'Show robotic colorectal sessions',
    aiText:
      "Here are the top-rated colorectal robotic surgery tracks: 10-Year Clinical Evidence (Day 1 · Hall A), Robotic Total Mesorectal Excision Masterclass (Day 2 · Hall B), and Anastomotic Leak Prevention Workshop (Day 3 · Lab 1).",
    sessions: [
      { time: 'Day 1 · 10:30', title: 'Robotic Colorectal Resection: 10-Year Data', venue: 'Hall A' },
      { time: 'Day 2 · 15:00', title: 'Robotic TME in Narrow Pelvis', venue: 'Hall B' },
      { time: 'Day 3 · 09:30', title: 'Complication Mitigation in Robotic Resections', venue: 'Workshop Lab 1' },
    ],
  },
  {
    id: 'robotics-vs-lap',
    label: 'Which sessions compare robotics and laparoscopy?',
    userText: 'Which sessions compare robotics and laparoscopy?',
    aiText:
      "We have dedicated head-to-head tracks comparing clinical outcomes, complication rates, and ergonomic health. Don't miss Dr. Daniel Okafor's 10-year comparative analysis on Day 1 followed by the live consensus panel on Day 2.",
    sessions: [
      { time: 'Day 1 · 11:30', title: 'Robotics vs Laparoscopy: A 10-Year Analysis', venue: 'Hall A · Dr. Okafor' },
      { time: 'Day 2 · 14:00', title: 'Ergonomic Longevity & Conversion Rates', venue: 'Hall B' },
      { time: 'Day 3 · 11:00', title: 'Grand Debate: Cost vs Clinical Benefit', venue: 'Main Auditorium' },
    ],
  },
];

// Profile data for Section 01
const PROFILES = {
  sofia: {
    name: 'Dr. Sofia Laurent',
    title: 'Surgical Oncologist · Paris, France',
    status: 'Profile Active',
    interests: ['Machine Learning', 'Surgical AI', 'Oncology Outcomes'],
    recommendations: [
      {
        score: 99,
        title: 'ML Models for Surgical Complications',
        meta: 'Day 2 · 14:00 · Hall A',
      },
      {
        score: 94,
        title: 'The AI-Native Operating Theatre',
        meta: 'Day 1 · 09:00 · Main Auditorium',
      },
      {
        score: 89,
        title: 'Surgical Data Science',
        meta: 'Day 3 · 11:30 · Hall B',
      },
    ],
  },
  arjun: {
    name: 'Dr. Arjun Mehta',
    title: 'GI Surgeon · Global Institute of Surgical Innovation',
    status: 'Profile Active',
    interests: ['Robotic Colorectal', 'Autonomous Navigation', 'Surgeon Ergonomics'],
    recommendations: [
      {
        score: 98,
        title: 'Robotic Colorectal Resection: Current Evidence',
        meta: 'Day 1 · 10:30 · Hall A',
      },
      {
        score: 95,
        title: 'Robotics vs Laparoscopy: A 10-Year Analysis',
        meta: 'Day 1 · 11:30 · Hall A',
      },
      {
        score: 91,
        title: 'Precision TME within Narrow Pelvis',
        meta: 'Day 2 · 15:30 · Hall B',
      },
    ],
  },
};

// Live Q&A Simulation clusters
const INITIAL_QA_CLUSTERS = [
  {
    id: 'outcomes',
    theme: 'Outcomes & Evidence',
    count: 9,
    representativeQuestion: 'What does the long-term anastomotic leak data show?',
    subtopics: 'Leak rates · 5-year overall survival · Resection margins',
    badgeColor: 'pink',
  },
  {
    id: 'cost',
    theme: 'Cost & Access',
    count: 7,
    representativeQuestion: 'How do you justify robotic adoption in resource-limited settings?',
    subtopics: 'Per-case instrumentation · Capital amortisation · Cross-subsidies',
    badgeColor: 'purple',
  },
  {
    id: 'learning',
    theme: 'Learning Curve',
    count: 5,
    representativeQuestion: 'At what volume does robotic performance plateau?',
    subtopics: 'Console hours · Proctorship models · Simulation transfer',
    badgeColor: 'amber',
  },
];

// Structured comparison table data
const COMPARISON_DATA = [
  {
    dimension: 'Oncological outcomes',
    aiConsensus: 'Broadly comparable in RCTs',
    keyConsideration: 'Longer follow-up needed',
  },
  {
    dimension: 'Surgical precision',
    aiConsensus: 'Robotic advantage in pelvis',
    keyConsideration: 'Anatomy-dependent benefit',
  },
  {
    dimension: 'Cost-effectiveness',
    aiConsensus: 'Laparoscopy remains lower cost',
    keyConsideration: 'Robotics costs declining',
  },
  {
    dimension: 'Learning curve',
    aiConsensus: 'Robotics shorter at high volume',
    keyConsideration: 'Simulator training accelerates',
  },
];

export default function AiExperiencePage() {
  // Section 01 Profile state
  const [selectedProfileKey, setSelectedProfileKey] = useState('sofia');
  const currentProfile = PROFILES[selectedProfileKey];

  // Section 02 AI Assistant Chat state
  const [activeAssistantPreset, setActiveAssistantPreset] = useState('day2');
  const [chatMessages, setChatMessages] = useState([
    {
      sender: 'ai',
      text: "Hello. I'm the KaizenCon 2027 Conference Assistant. I'm trained on the full programme, all speaker profiles, and session content. What would you like to know?",
      time: '10:00 AM',
      sessions: null,
    },
    {
      sender: 'user',
      text: 'What should I attend on Day 2?',
      time: '10:01 AM',
    },
    {
      sender: 'ai',
      text: ASSISTANT_PRESETS[0].aiText,
      time: '10:01 AM',
      sessions: ASSISTANT_PRESETS[0].sessions,
    },
  ]);
  const [chatInput, setChatInput] = useState('');
  const [isAssistantTyping, setIsAssistantTyping] = useState(false);

  // Section 03 Live Q&A state
  const [qaClusters, setQaClusters] = useState(INITIAL_QA_CLUSTERS);
  const [userQuestion, setUserQuestion] = useState('');
  const [qaSubmittedAlert, setQaSubmittedAlert] = useState(false);
  const [activeClusterId, setActiveClusterId] = useState('outcomes');

  // Section 04 Perspective Comparison active tab
  const [activeAiPerspective, setActiveAiPerspective] = useState('all');

  // Section 05 Knowledge Query state
  const [knowledgeQuery, setKnowledgeQuery] = useState('');
  const [knowledgeResult, setKnowledgeResult] = useState(null);
  const [showFlowModal, setShowFlowModal] = useState(false);

  // Handle Preset Click in Assistant
  const handleAssistantPresetClick = (preset) => {
    setActiveAssistantPreset(preset.id);
    setIsAssistantTyping(true);

    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    setChatMessages((prev) => [
      ...prev,
      { sender: 'user', text: preset.userText, time: now },
    ]);

    setTimeout(() => {
      setChatMessages((prev) => [
        ...prev,
        {
          sender: 'ai',
          text: preset.aiText,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          sessions: preset.sessions,
        },
      ]);
      setIsAssistantTyping(false);
    }, 450);
  };

  // Handle Custom Question in Assistant
  const handleChatSubmit = (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const userText = chatInput.trim();
    setChatInput('');
    setActiveAssistantPreset('');
    setIsAssistantTyping(true);

    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    setChatMessages((prev) => [
      ...prev,
      { sender: 'user', text: userText, time: now },
    ]);

    setTimeout(() => {
      setChatMessages((prev) => [
        ...prev,
        {
          sender: 'ai',
          text: `Regarding "${userText}": KaizenCon 2027 covers this extensively. Our clinical indexing matches your query to 3 verified programme items:`,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          sessions: [
            {
              time: 'Day 1 · Keynote',
              title: `Clinical Perspectives: ${userText.slice(0, 32)}`,
              venue: 'Main Auditorium',
            },
            {
              time: 'Day 2 · Demonstration',
              title: 'Live Surgical Simulation & Data Validation',
              venue: 'Hall B',
            },
            {
              time: 'Day 3 · Panel',
              title: 'Expert Consensus & Technical Guidelines',
              venue: 'Hall C',
            },
          ],
        },
      ]);
      setIsAssistantTyping(false);
    }, 550);
  };

  // Handle Live Question Submit
  const handleLiveQuestionSubmit = (e) => {
    e.preventDefault();
    if (!userQuestion.trim()) return;

    // Simulate AI theme clustering
    const qLower = userQuestion.toLowerCase();
    let targetTheme = 'Outcomes & Evidence';
    if (qLower.includes('cost') || qLower.includes('price') || qLower.includes('money') || qLower.includes('access')) {
      targetTheme = 'Cost & Access';
    } else if (qLower.includes('curve') || qLower.includes('train') || qLower.includes('learn') || qLower.includes('volume')) {
      targetTheme = 'Learning Curve';
    }

    setQaClusters((prev) =>
      prev.map((c) => (c.theme === targetTheme ? { ...c, count: c.count + 1 } : c))
    );

    setUserQuestion('');
    setQaSubmittedAlert(true);
    setTimeout(() => setQaSubmittedAlert(false), 4500);
  };

  // Handle Knowledge Base Query
  const handleKnowledgeSearch = (query) => {
    setKnowledgeQuery(query);
    if (!query.trim()) {
      setKnowledgeResult(null);
      return;
    }

    // Mock search result generator
    setKnowledgeResult({
      query,
      summary: `Indexed from 4 verified scientific sessions: Robotic platforms demonstrate reduced open conversion (4.2% vs 9.8%) and superior visualization in pelvic dissection. Long-term oncological equivalence remains consistent across all multi-centre trials.`,
      sessions: [
        'Robotics vs Laparoscopy: A 10-Year Analysis (Day 1 · Hall A)',
        'ML Models for Complication Prediction (Day 2 · Hall A)',
      ],
      updated: '10 mins ago',
    });
  };

  // Smooth scroll helper
  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="kz-ai-page">
      {/* ====================================================
          1. HERO HEADER SECTION
          ==================================================== */}
      <section className="kz-ai-hero-section">
        <div className="kz-ai-container">
          {/* Breadcrumb Navigation */}
          <nav className="kz-ai-breadcrumb" aria-label="Breadcrumb">
            <Link to="/" className="kz-ai-crumb-link">Home</Link>
            <span className="kz-ai-crumb-sep">/</span>
            <span className="kz-ai-crumb-current">AI Experience</span>
          </nav>

          <div className="kz-ai-hero-content">
            <div className="kz-ai-eyebrow-wrap">
              <span className="kz-hero-simple-badge">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: '6px' }}>
                  <path d="M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5L12 2Z" fill="currentColor" />
                </svg>
                AI-NATIVE CONFERENCE · KAIZENCON 2027
              </span>
            </div>

            <h1 className="kz-ai-hero-headline">
              <span className="kz-ai-headline-dark">The AI Experience,</span>
              <span className="kz-ai-headline-gradient">now with intelligence.</span>
            </h1>

            {/* Event Details Pills Row matching other pages exactly */}
            <div className="kz-ai-pills-row" aria-label="Event Details">
              <div className="kz-ai-pill">
                <span className="kz-ai-pill-dot" />
                <span>1–3 January 2027</span>
              </div>
              <div className="kz-ai-pill">
                <span className="kz-ai-pill-dot" />
                <span>Ahmedabad, India</span>
              </div>
              <div className="kz-ai-pill">
                <span className="kz-ai-pill-dot" />
                <span>International Conference Centre</span>
              </div>
            </div>

            <p className="kz-ai-hero-desc">
              KaizenCon 2027 is built on an AI layer that personalises, assists, clusters, compares, and preserves knowledge — across every moment of the conference.
            </p>

            {/* Quick Section Navigation Pills */}
            <div className="kz-ai-quick-nav-row" aria-label="Quick jump to sections">
              <button type="button" onClick={() => scrollToSection('personalization')} className="kz-ai-nav-chip">
                <span>01 — Personalization</span>
                <span className="kz-chip-arrow">↓</span>
              </button>
              <button type="button" onClick={() => scrollToSection('assistant')} className="kz-ai-nav-chip">
                <span>02 — Conference Assistant</span>
                <span className="kz-chip-arrow">↓</span>
              </button>
              <button type="button" onClick={() => scrollToSection('live-qa')} className="kz-ai-nav-chip">
                <span>03 — Live Q&amp;A</span>
                <span className="kz-chip-arrow">↓</span>
              </button>
              <button type="button" onClick={() => scrollToSection('perspectives')} className="kz-ai-nav-chip">
                <span>04 — Perspective Comparison</span>
                <span className="kz-chip-arrow">↓</span>
              </button>
              <button type="button" onClick={() => scrollToSection('knowledge')} className="kz-ai-nav-chip">
                <span>05 — Conference Knowledge</span>
                <span className="kz-chip-arrow">↓</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ====================================================
          SECTION 01: AI PERSONALIZATION
          ==================================================== */}
      <section className="kz-ai-section kz-section-personalization" id="personalization">
        <div className="kz-ai-container">
          <div className="kz-ai-section-header">
            <span className="kz-section-badge">01 — AI PERSONALIZATION</span>
            <h2 className="kz-section-heading">
              <span className="kz-head-dark">Your programme,</span><br />
              <span className="kz-head-magenta">curated by AI</span>
            </h2>
            <p className="kz-section-lead">
              Before you arrive, KaizenCon AI builds a clinical profile from your speciality, interests, and session history. The result is a conference that feels designed for you — not for 2,500 people.
            </p>
          </div>

          <div className="kz-personalization-grid">
            {/* Left: 4 Core Capabilities */}
            <div className="kz-capabilities-col">
              <div className="kz-capability-card">
                <div className="kz-capability-icon-wrap icon-purple">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                </div>
                <div className="kz-capability-text">
                  <h3 className="kz-capability-title">Clinical profiling</h3>
                  <p className="kz-capability-desc">Speciality, sub-speciality, and research interests</p>
                </div>
              </div>

              <div className="kz-capability-card">
                <div className="kz-capability-icon-wrap icon-magenta">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                    <circle cx="12" cy="12" r="10" />
                    <path d="M12 6v6l4 2" />
                  </svg>
                </div>
                <div className="kz-capability-text">
                  <h3 className="kz-capability-title">Session scoring</h3>
                  <p className="kz-capability-desc">Each session receives a relevance score from 0–100</p>
                </div>
              </div>

              <div className="kz-capability-card">
                <div className="kz-capability-icon-wrap icon-purple">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                    <line x1="16" y1="2" x2="16" y2="6" />
                    <line x1="8" y1="2" x2="8" y2="6" />
                    <line x1="3" y1="10" x2="21" y2="10" />
                  </svg>
                </div>
                <div className="kz-capability-text">
                  <h3 className="kz-capability-title">Personalised schedule</h3>
                  <p className="kz-capability-desc">Conflict-free daily plan generated automatically</p>
                </div>
              </div>

              <div className="kz-capability-card">
                <div className="kz-capability-icon-wrap icon-magenta">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                  </svg>
                </div>
                <div className="kz-capability-text">
                  <h3 className="kz-capability-title">Live updates</h3>
                  <p className="kz-capability-desc">Reschedule alerts pushed to your device in real time</p>
                </div>
              </div>
            </div>

            {/* Right: Interactive Delegate Profile Demo Card */}
            <div className="kz-profile-demo-col">
              <div className="kz-profile-card">
                {/* Profile Selector Switcher */}
                <div className="kz-profile-switcher-row">
                  <button
                    type="button"
                    className={`kz-profile-switch-btn ${selectedProfileKey === 'sofia' ? 'is-active' : ''}`}
                    onClick={() => setSelectedProfileKey('sofia')}
                  >
                    Dr. Sofia Laurent
                  </button>
                  <button
                    type="button"
                    className={`kz-profile-switch-btn ${selectedProfileKey === 'arjun' ? 'is-active' : ''}`}
                    onClick={() => setSelectedProfileKey('arjun')}
                  >
                    Dr. Arjun Mehta
                  </button>
                </div>

                {/* Profile Header */}
                <div className="kz-profile-header">
                  <div className="kz-profile-avatar-group">
                    <div className="kz-profile-avatar-circle">
                      {selectedProfileKey === 'sofia' ? 'SL' : 'AM'}
                    </div>
                    <div>
                      <h4 className="kz-profile-name">{currentProfile.name}</h4>
                      <p className="kz-profile-role">{currentProfile.title}</p>
                    </div>
                  </div>
                  <div className="kz-profile-status-pill">
                    <span className="kz-status-pulse" />
                    <span>{currentProfile.status}</span>
                  </div>
                </div>

                {/* Interests */}
                <div className="kz-profile-block">
                  <span className="kz-block-label">Interests</span>
                  <div className="kz-interests-tags">
                    {currentProfile.interests.map((tag, idx) => (
                      <span key={idx} className="kz-interest-tag">{tag}</span>
                    ))}
                  </div>
                </div>

                {/* Top Recommendations */}
                <div className="kz-profile-block">
                  <span className="kz-block-label">Top Recommendations</span>
                  <div className="kz-recommendations-list">
                    {currentProfile.recommendations.map((rec, idx) => (
                      <div key={idx} className="kz-rec-item">
                        <div className="kz-rec-score-box">
                          <span className="kz-rec-score-num">{rec.score}</span>
                          <span className="kz-rec-score-lbl">MATCH</span>
                        </div>
                        <div className="kz-rec-details">
                          <h5 className="kz-rec-title">{rec.title}</h5>
                          <span className="kz-rec-meta">{rec.meta}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="kz-profile-card-footer">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="16" x2="12" y2="12" />
                    <line x1="12" y1="8" x2="12.01" y2="8" />
                  </svg>
                  <span>Simulated attendee profile. Generated by KaizenCon Clinical Neural Engine.</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ====================================================
          SECTION 02: AI CONFERENCE ASSISTANT
          ==================================================== */}
      <section className="kz-ai-section kz-section-assistant" id="assistant">
        <div className="kz-ai-container">
          <div className="kz-ai-section-header">
            <span className="kz-section-badge">02 — AI CONFERENCE ASSISTANT</span>
            <h2 className="kz-section-heading">
              <span className="kz-head-dark">Ask anything.</span><br />
              <span className="kz-head-magenta">Get conference intelligence.</span>
            </h2>
            <p className="kz-section-lead">
              The KaizenCon AI is trained on the complete programme. Ask about sessions, speakers, topics, or anything else — it knows the conference better than any printed guide.
            </p>
          </div>

          {/* Quick Preset Buttons */}
          <div className="kz-preset-pills-wrap" role="tablist" aria-label="Suggested prompt questions">
            {ASSISTANT_PRESETS.map((preset) => (
              <button
                key={preset.id}
                type="button"
                className={`kz-preset-pill-btn ${activeAssistantPreset === preset.id ? 'is-active' : ''}`}
                onClick={() => handleAssistantPresetClick(preset)}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
                <span>{preset.label}</span>
              </button>
            ))}
          </div>

          {/* Chat Simulator Interface */}
          <div className="kz-chat-card-container">
            {/* Header */}
            <div className="kz-chat-top-bar">
              <div className="kz-chat-bot-info">
                <div className="kz-chat-ai-logo">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5L12 2Z" />
                  </svg>
                </div>
                <div>
                  <h3 className="kz-chat-bot-title">KaizenCon AI</h3>
                  <div className="kz-chat-bot-status">
                    <span className="kz-status-online-dot" />
                    <span>Conference Assistant · Online</span>
                  </div>
                </div>
              </div>
              <span className="kz-chat-demo-badge">AI Experience Demo</span>
            </div>

            {/* Chat Body Messages */}
            <div className="kz-chat-scroll-area">
              {chatMessages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`kz-chat-msg-row ${msg.sender === 'user' ? 'is-user-msg' : 'is-ai-msg'}`}
                >
                  {msg.sender === 'ai' && (
                    <div className="kz-chat-msg-avatar" aria-hidden="true">
                      AI
                    </div>
                  )}

                  <div className="kz-chat-bubble">
                    <p className="kz-bubble-text">{msg.text}</p>

                    {/* Verified Session Cards if returned by AI */}
                    {msg.sessions && msg.sessions.length > 0 && (
                      <div className="kz-bubble-sessions-grid">
                        {msg.sessions.map((sess, sIdx) => (
                          <div key={sIdx} className="kz-bubble-session-item">
                            <span className="kz-session-time-pill">{sess.time}</span>
                            <strong className="kz-session-card-title">{sess.title}</strong>
                            <span className="kz-session-card-venue">{sess.venue}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    <span className="kz-bubble-time">{msg.time}</span>
                  </div>
                </div>
              ))}

              {isAssistantTyping && (
                <div className="kz-chat-msg-row is-ai-msg">
                  <div className="kz-chat-msg-avatar">AI</div>
                  <div className="kz-chat-bubble kz-typing-bubble">
                    <span className="kz-type-dot" /><span className="kz-type-dot" /><span className="kz-type-dot" />
                  </div>
                </div>
              )}
            </div>

            {/* Chat Input Form */}
            <form className="kz-chat-form" onSubmit={handleChatSubmit}>
              <div className="kz-chat-input-wrapper">
                <input
                  type="text"
                  className="kz-chat-input-field"
                  placeholder="Ask about sessions, speakers, or topics…"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  aria-label="Ask about sessions, speakers, or topics"
                />
                <button
                  type="submit"
                  className="kz-chat-send-action-btn"
                  aria-label="Send query"
                  title="Send query"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
                  </svg>
                </button>
              </div>
            </form>

            <div className="kz-chat-footer-disclaimer">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              <span>AI responses are based on approved KaizenCon conference content and do not constitute clinical advice.</span>
            </div>
          </div>
        </div>
      </section>

      {/* ====================================================
          SECTION 03: LIVE Q&A INTELLIGENCE
          ==================================================== */}
      <section className="kz-ai-section kz-section-live-qa" id="live-qa">
        <div className="kz-ai-container">
          <div className="kz-ai-section-header">
            <span className="kz-section-badge">03 — LIVE Q&amp;A INTELLIGENCE</span>
            <h2 className="kz-section-heading">
              <span className="kz-head-dark">The room,</span><br />
              <span className="kz-head-magenta">made intelligent</span>
            </h2>
            <p className="kz-section-lead">
              As audience questions arrive, KaizenCon AI clusters them by clinical theme, surfaces the most relevant, and presents a structured discussion — rather than a random queue.
            </p>
          </div>

          <div className="kz-live-qa-layout">
            {/* Left: 4 Feature Bullet points + Interactive Submission */}
            <div className="kz-qa-info-col">
              <div className="kz-qa-features-card">
                <h3 className="kz-qa-card-subtitle">Real-Time Processing Pipeline</h3>
                <ul className="kz-qa-features-list">
                  <li>
                    <span className="kz-check-circle">✓</span>
                    <span>Questions clustered by clinical theme in real time</span>
                  </li>
                  <li>
                    <span className="kz-check-circle">✓</span>
                    <span>Most-asked themes surfaced to the moderator</span>
                  </li>
                  <li>
                    <span className="kz-check-circle">✓</span>
                    <span>Questions anonymised and moderated automatically</span>
                  </li>
                  <li>
                    <span className="kz-check-circle">✓</span>
                    <span>All Q&amp;A archived to the knowledge base post-session</span>
                  </li>
                </ul>

                {/* Audience Interactive Submission Box */}
                <div className="kz-qa-interactive-submit-box">
                  <h4 className="kz-interactive-heading">Ask a Live Question to Cluster:</h4>
                  <form onSubmit={handleLiveQuestionSubmit} className="kz-interactive-form">
                    <input
                      type="text"
                      className="kz-interactive-input"
                      placeholder="e.g. How does cost compare for low anterior resection?"
                      value={userQuestion}
                      onChange={(e) => setUserQuestion(e.target.value)}
                    />
                    <button type="submit" className="kz-interactive-btn">
                      Submit Anonymously
                    </button>
                  </form>
                  {qaSubmittedAlert && (
                    <div className="kz-qa-success-toast">
                      ✓ Question anonymised and automatically clustered into the theme below!
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right: Live Simulation Display */}
            <div className="kz-qa-simulation-col">
              <div className="kz-simulation-card">
                {/* Simulation Top Header */}
                <div className="kz-sim-header">
                  <div>
                    <div className="kz-sim-badge">
                      <span className="kz-pulse-circle-red" />
                      <span>LIVE SIMULATION</span>
                    </div>
                    <h4 className="kz-sim-session-title">Robotics vs Laparoscopy</h4>
                    <p className="kz-sim-speaker">Dr. Daniel Okafor · Hall A</p>
                  </div>
                  <div className="kz-sim-attendees-box">
                    <span className="kz-sim-attendees-num">847</span>
                    <span className="kz-sim-attendees-lbl">attendees</span>
                  </div>
                </div>

                <div className="kz-sim-cluster-heading">
                  <span>AI-Clustered Questions</span>
                  <span className="kz-sim-updated-tag">Live Feed</span>
                </div>

                {/* 3 Clusters from User Prompt */}
                <div className="kz-clusters-list">
                  {qaClusters.map((cluster) => {
                    const isSelected = activeClusterId === cluster.id;
                    return (
                      <div
                        key={cluster.id}
                        className={`kz-cluster-item-card ${isSelected ? 'is-selected' : ''}`}
                        onClick={() => setActiveClusterId(cluster.id)}
                        role="button"
                        tabIndex={0}
                      >
                        <div className="kz-cluster-top-row">
                          <span className={`kz-cluster-theme-pill pill-${cluster.badgeColor}`}>
                            {cluster.theme}
                          </span>
                          <span className="kz-cluster-count-badge">
                            {cluster.count} questions
                          </span>
                        </div>

                        <blockquote className="kz-cluster-quote">
                          &ldquo;{cluster.representativeQuestion}&rdquo;
                        </blockquote>

                        <div className="kz-cluster-subtopics">
                          <span className="kz-subtopic-label">Themes:</span> {cluster.subtopics}
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="kz-sim-footer">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  </svg>
                  <span>Questions anonymised. Clusters updated every 60 seconds.</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ====================================================
          SECTION 04: AI PERSPECTIVE COMPARISON
          ==================================================== */}
      <section className="kz-ai-section kz-section-perspectives" id="perspectives">
        <div className="kz-ai-container">
          <div className="kz-ai-section-header">
            <span className="kz-section-badge">04 — AI PERSPECTIVE COMPARISON</span>
            <h2 className="kz-section-heading">
              <span className="kz-head-dark">Three AI perspectives.</span><br />
              <span className="kz-head-magenta">One human verdict.</span>
            </h2>
            <p className="kz-section-lead">
              On contested clinical questions, KaizenCon surfaces three independent AI perspectives alongside a human expert position — promoting structured, evidence-informed debate.
            </p>
            <div className="kz-perspectives-disclaimer-pill">
              AI perspectives are presented for educational discussion and do not constitute clinical advice.
            </div>
          </div>

          {/* Clinical Question Under Review Callout */}
          <div className="kz-clinical-question-box">
            <div className="kz-question-badge">CLINICAL QUESTION UNDER REVIEW</div>
            <h3 className="kz-question-text">
              &ldquo;Is robotic surgery clinically superior to laparoscopy for colorectal resection?&rdquo;
            </h3>
          </div>

          {/* 3 AI Perspectives Cards */}
          <div className="kz-ai-perspectives-grid">
            {/* AI 01 */}
            <div className="kz-perspective-card ai-01">
              <div className="kz-perspective-header">
                <span className="kz-ai-model-tag">AI 01</span>
                <h4 className="kz-perspective-name">Evidence-Driven</h4>
              </div>
              <p className="kz-perspective-body">
                Current RCT data shows no statistically significant difference in major oncological outcomes. Robotic platforms offer ergonomic advantages and may reduce conversion rates in complex cases, but superiority claims require larger datasets with longer follow-up.
              </p>
              <div className="kz-perspective-meta">
                <span>Focus: Trial Datasets &amp; Conversion</span>
              </div>
            </div>

            {/* AI 02 */}
            <div className="kz-perspective-card ai-02">
              <div className="kz-perspective-header">
                <span className="kz-ai-model-tag">AI 02</span>
                <h4 className="kz-perspective-name">Systems Perspective</h4>
              </div>
              <p className="kz-perspective-body">
                The framing of &ldquo;superiority&rdquo; misses the point. Robotics enables consistent performance across surgeons at varying experience levels — reducing variance rather than just improving the mean outcome. Health systems benefit from this standardisation.
              </p>
              <div className="kz-perspective-meta">
                <span>Focus: Surgical Variance &amp; Systems</span>
              </div>
            </div>

            {/* AI 03 */}
            <div className="kz-perspective-card ai-03">
              <div className="kz-perspective-header">
                <span className="kz-ai-model-tag">AI 03</span>
                <h4 className="kz-perspective-name">Emerging Data</h4>
              </div>
              <p className="kz-perspective-body">
                Longitudinal registry data from the past 3 years suggests robotic low anterior resection associates with lower anastomotic leak rates in high-volume centres. This emerging signal warrants prospective validation before broader adoption claims.
              </p>
              <div className="kz-perspective-meta">
                <span>Focus: High-Volume Registries &amp; Leaks</span>
              </div>
            </div>
          </div>

          {/* Human Expert Verdict Highlight Card */}
          <div className="kz-human-verdict-card">
            <div className="kz-verdict-icon-bubble">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                <path d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z" />
                <path d="M10 9a2 2 0 1 1 4 0c0 1.5-2 2-2 3" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
            </div>
            <div className="kz-verdict-content">
              <span className="kz-verdict-eyebrow">HUMAN EXPERT CLINICAL PERSPECTIVE</span>
              <blockquote className="kz-verdict-quote">
                &ldquo;In my hands, robotic platforms deliver measurably better precision in TME within the narrow pelvis. However, the right tool depends on the patient, the anatomy, and the surgeon&apos;s training — not the platform alone.&rdquo;
              </blockquote>
              <div className="kz-verdict-author">
                <strong>— Dr. Arjun Mehta</strong>, GI Surgeon, Global Institute of Surgical Innovation
              </div>
            </div>
          </div>

          {/* Structured Comparison Table */}
          <div className="kz-structured-table-wrapper">
            <div className="kz-table-title-bar">
              <h4 className="kz-table-title">Structured Comparison</h4>
              <span className="kz-table-badge">Multi-Dimensional Analysis</span>
            </div>

            <div className="kz-table-responsive">
              <table className="kz-comparison-table">
                <thead>
                  <tr>
                    <th>Dimension</th>
                    <th>AI Consensus</th>
                    <th>Key Consideration</th>
                  </tr>
                </thead>
                <tbody>
                  {COMPARISON_DATA.map((row, idx) => (
                    <tr key={idx}>
                      <td className="kz-td-dimension">
                        <strong>{row.dimension}</strong>
                      </td>
                      <td className="kz-td-consensus">
                        <span className="kz-consensus-dot" />
                        <span>{row.aiConsensus}</span>
                      </td>
                      <td className="kz-td-consideration">
                        <span className="kz-consideration-pill">{row.keyConsideration}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* ====================================================
          SECTION 05: CONFERENCE KNOWLEDGE
          ==================================================== */}
      <section className="kz-ai-section kz-section-knowledge" id="knowledge">
        <div className="kz-ai-container">
          <div className="kz-ai-section-header">
            <span className="kz-section-badge">05 — CONFERENCE KNOWLEDGE</span>
            <h2 className="kz-section-heading">
              <span className="kz-head-dark">Every session.</span><br />
              <span className="kz-head-magenta">Permanently searchable.</span>
            </h2>
            <p className="kz-section-lead">
              As sessions conclude, KaizenCon AI generates summaries, extracts key insights, and indexes all content into a searchable knowledge base. The conference does not end when the doors close.
            </p>

            <div className="kz-knowledge-cta-row">
              <Link to="/knowledge" className="kz-btn-gradient">
                <span>Open Knowledge Base</span>
                <span className="kz-btn-arrow">→</span>
              </Link>
              <button
                type="button"
                onClick={() => setShowFlowModal(true)}
                className="kz-btn-outline"
              >
                <span>See the Flow</span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <polygon points="10 8 16 12 10 16 10 8" />
                </svg>
              </button>
            </div>
          </div>

          <div className="kz-knowledge-cards-grid">
            {/* Left: AI Summary Example Card */}
            <div className="kz-knowledge-summary-card">
              <div className="kz-summary-header">
                <div className="kz-summary-tag">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                  </svg>
                  <span>AI SUMMARY · ROBOTICS VS LAPAROSCOPY · DAY 1</span>
                </div>
                <span className="kz-summary-badge">Automated Transcript</span>
              </div>

              <h4 className="kz-summary-title">Key Takeaways: 10-Year Outcomes Analysis</h4>

              <ul className="kz-summary-bullets">
                <li>
                  <span className="kz-bullet-dot" />
                  <span>Oncological outcomes broadly comparable across platforms in the reviewed dataset.</span>
                </li>
                <li>
                  <span className="kz-bullet-dot" />
                  <span>Robotic LAR associates with reduced open conversion (4.2% vs 9.8%) in high-volume centres.</span>
                </li>
                <li>
                  <span className="kz-bullet-dot" />
                  <span>Cost remains primary adoption barrier in resource-constrained systems.</span>
                </li>
              </ul>

              <div className="kz-summary-footer">
                <span className="kz-summary-disclaimer">AI-generated summary. Not clinical advice.</span>
                <Link to="/knowledge" className="kz-summary-link">View Full Session Index →</Link>
              </div>
            </div>

            {/* Right: Query the Knowledge Base Card */}
            <div className="kz-knowledge-query-card">
              <div className="kz-query-card-header">
                <div className="kz-query-icon-circle">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                    <circle cx="11" cy="11" r="8" />
                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                  </svg>
                </div>
                <div>
                  <h4 className="kz-query-title">Query the knowledge base</h4>
                  <p className="kz-query-desc">
                    After each session, the knowledge base becomes queryable. Ask the AI assistant about any session content, summary, or speaker topic.
                  </p>
                </div>
              </div>

              {/* Sample Quick Query Buttons */}
              <div className="kz-query-chips-row">
                <button
                  type="button"
                  className="kz-query-chip"
                  onClick={() => handleKnowledgeSearch('Anastomotic leak rates in robotic LAR')}
                >
                  &ldquo;Anastomotic leak rates in robotic LAR&rdquo;
                </button>
                <button
                  type="button"
                  className="kz-query-chip"
                  onClick={() => handleKnowledgeSearch('Robotic training conversion benchmarks')}
                >
                  &ldquo;Robotic training conversion benchmarks&rdquo;
                </button>
              </div>

              {/* Live search input */}
              <div className="kz-knowledge-search-input-box">
                <input
                  type="text"
                  className="kz-knowledge-input"
                  placeholder="Ask the knowledge base directly..."
                  value={knowledgeQuery}
                  onChange={(e) => handleKnowledgeSearch(e.target.value)}
                />
              </div>

              {/* Search Result Snippet */}
              {knowledgeResult && (
                <div className="kz-knowledge-result-box">
                  <div className="kz-result-header-row">
                    <span className="kz-result-tag">SYNTHESIZED INSIGHT</span>
                    <span className="kz-result-time">Indexed {knowledgeResult.updated}</span>
                  </div>
                  <p className="kz-result-text">{knowledgeResult.summary}</p>
                  <div className="kz-result-sources">
                    <span className="kz-source-label">Source Sessions:</span>
                    {knowledgeResult.sessions.map((s, i) => (
                      <div key={i} className="kz-source-item">• {s}</div>
                    ))}
                  </div>
                </div>
              )}

              {/* Buttons from User Specification */}
              <div className="kz-query-actions-row">
                <Link to="/knowledge" className="kz-btn-knowledge-primary">
                  <span>Explore Knowledge Base</span>
                  <span className="kz-btn-arrow">→</span>
                </Link>
                <button
                  type="button"
                  onClick={() => scrollToSection('assistant')}
                  className="kz-btn-knowledge-secondary"
                >
                  <span>Try the AI Assistant</span>
                  <span className="kz-btn-arrow">↑</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ====================================================
          MODAL: KNOWLEDGE PIPELINE FLOW
          ==================================================== */}
      {showFlowModal && (
        <div className="kz-flow-modal-backdrop" onClick={() => setShowFlowModal(false)}>
          <div className="kz-flow-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="kz-flow-modal-header">
              <div className="kz-flow-title-group">
                <span className="kz-section-badge">PIPELINE ARCHITECTURE</span>
                <h3 className="kz-flow-modal-title">How KaizenCon AI Processes Knowledge</h3>
              </div>
              <button
                type="button"
                className="kz-flow-close-btn"
                onClick={() => setShowFlowModal(false)}
                aria-label="Close modal"
              >
                ✕
              </button>
            </div>

            <div className="kz-flow-steps-grid">
              <div className="kz-flow-step">
                <div className="kz-flow-step-num">01</div>
                <h4>Live Capture</h4>
                <p>Intraoperative video, audio, slides, and delegate questions recorded with high fidelity.</p>
              </div>
              <div className="kz-flow-arrow-divider">→</div>
              <div className="kz-flow-step">
                <div className="kz-flow-step-num">02</div>
                <h4>Clinical Synthesis</h4>
                <p>Large language models summarize clinical takeaways and extract evidence metrics.</p>
              </div>
              <div className="kz-flow-arrow-divider">→</div>
              <div className="kz-flow-step">
                <div className="kz-flow-step-num">03</div>
                <h4>Semantic Vector Indexing</h4>
                <p>Content embedded into permanent vectors linked across sessions, speakers, and topics.</p>
              </div>
              <div className="kz-flow-arrow-divider">→</div>
              <div className="kz-flow-step">
                <div className="kz-flow-step-num">04</div>
                <h4>Instant Retrieval</h4>
                <p>Available on-demand to delegates worldwide through conversational AI and search.</p>
              </div>
            </div>

            <div className="kz-flow-modal-footer">
              <button
                type="button"
                className="kz-btn-gradient"
                onClick={() => setShowFlowModal(false)}
              >
                Close Architecture View
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
