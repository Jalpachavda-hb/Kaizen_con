import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './AiConAssisten.css';
import { askKnowledgeChat } from '../../Apipath';

// Preset conversation data matching the theme & conference intelligence
const PRESET_CONVERSATIONS = {
  day2: {
    id: 'day2',
    label: 'What should I attend on Day 2?',
    iconType: 'calendar',
    userText: 'What should I attend on Day 2?',
    userTime: '10:28',
    aiText:
      "On Day 2, I'd recommend starting with Dr. James Carter's keynote on AI Triage in Emergency Surgery at 09:00 in the Main Auditorium. From there, Dr. Maya Chen's live demonstration of Real-time AI Imaging at 11:30 in Hall B is one of the most anticipated sessions of the conference. If surgical data science interests you, Dr. Arjun Mehta's session on Surgeon Training in the Age of AI at 11:30 in Hall C is a strong choice.",
    aiTime: '10:29',
    sessions: [
      {
        time: '09:00 – 10:00',
        title: 'AI Triage in Emergency Surgery',
        venue: 'Main Auditorium',
      },
      {
        time: '11:30 – 12:30',
        title: 'Real-time AI Imaging (Live Demonstration)',
        venue: 'Hall B',
      },
      {
        time: '11:30 – 12:30',
        title: 'Surgeon Training in the Age of AI',
        venue: 'Hall C',
      },
    ],
  },
  aiSurgery: {
    id: 'aiSurgery',
    label: 'Who is discussing AI in surgery?',
    iconType: 'user',
    userText: 'Who is discussing AI in surgery?',
    userTime: '10:32',
    aiText:
      "Multiple world-class faculty are presenting clinical applications of AI in surgery. Dr. James Carter explores emergency surgery triage models, Dr. Arjun Mehta demonstrates AI surgical simulation in training, and Dr. Maya Chen will present live intraoperative tissue classification.",
    aiTime: '10:33',
    sessions: [
      {
        time: 'Day 1 · 14:00 – 15:00',
        title: 'AI in General & Colorectal Surgery',
        venue: 'Hall A',
      },
      {
        time: 'Day 2 · 09:00 – 10:00',
        title: 'AI Triage in Emergency Surgery',
        venue: 'Main Auditorium',
      },
      {
        time: 'Day 2 · 11:30 – 12:30',
        title: 'Surgeon Training in the Age of AI',
        venue: 'Hall C',
      },
    ],
  },
  robotics: {
    id: 'robotics',
    label: 'Robotics vs laparoscopy sessions',
    iconType: 'document',
    userText: 'Robotics vs laparoscopy sessions',
    userTime: '11:05',
    aiText:
      "We have dedicated head-to-head tracks comparing clinical outcomes, complication rates, and ergonomic health. Don't miss Dr. Nkechi Okafor's 10-year comparative analysis on Day 1 followed by the hands-on robotic console comparison.",
    aiTime: '11:06',
    sessions: [
      {
        time: 'Day 1 · 11:30 – 12:30',
        title: 'Robotics vs Laparoscopy: A 10-Year Analysis',
        venue: 'Hall A',
      },
      {
        time: 'Day 2 · 14:00 – 15:00',
        title: 'Ergonomic Longevity in Minimally Invasive Surgery',
        venue: 'Hall B',
      },
      {
        time: 'Day 3 · 10:00 – 11:00',
        title: 'Cost-Benefit Economics of Robotic Adoption',
        venue: 'Main Auditorium',
      },
    ],
  },
  drMaya: {
    id: 'drMaya',
    label: 'Tell me about Dr. Maya Chen',
    iconType: 'user',
    userText: 'Tell me about Dr. Maya Chen',
    userTime: '11:15',
    aiText:
      "Dr. Maya Chen is an internationally recognized leader in surgical computer vision and intraoperative imaging. She serves as Chair of Surgical Informatics and is presenting her groundbreaking work on real-time sub-millimeter tumor boundary detection.",
    aiTime: '11:16',
    sessions: [
      {
        time: 'Day 2 · 11:30 – 12:30',
        title: 'Real-time AI Imaging (Live Demonstration)',
        venue: 'Hall B',
      },
      {
        time: 'Day 2 · 15:30 – 16:30',
        title: 'Workshop: Training Computer Vision Models',
        venue: 'Workshop Lab 1',
      },
      {
        time: 'Day 3 · 11:00 – 12:00',
        title: 'Grand Faculty Panel on Autonomous Surgery',
        venue: 'Main Auditorium',
      },
    ],
  },
};

export default function AiConAssisten() {
  const [activePreset, setActivePreset] = useState('day2');
  const [currentChat, setCurrentChat] = useState(PRESET_CONVERSATIONS.day2);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const chatFeedRef = React.useRef(null);

  // Switch preset conversation
  const handleSelectPreset = (key) => {
    setActivePreset(key);
    setIsTyping(true);
    setTimeout(() => {
      setCurrentChat(PRESET_CONVERSATIONS[key]);
      setIsTyping(false);
      if (chatFeedRef.current) {
        chatFeedRef.current.scrollTop = 0;
      }
    }, 240);
  };

  // Handle custom query submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!inputValue.trim() || isTyping) return;

    const userQuery = inputValue.trim();
    setInputValue('');
    setActivePreset('');
    setIsTyping(true);

    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    setCurrentChat({
      userText: userQuery,
      userTime: now,
      aiText: '',
      aiTime: '',
      sources: [],
      sessions: [],
    });

    try {
      const data = await askKnowledgeChat(userQuery);
      const reply = data?.answer || "I couldn't find this information in the available knowledge base.";
      const sources = Array.isArray(data?.sources) ? data.sources : [];

      setCurrentChat({
        userText: userQuery,
        userTime: now,
        aiText: reply,
        aiTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        sources: sources,
        sessions: [],
      });
    } catch (error) {
      console.error('Error in chatbot API call:', error);
      setCurrentChat({
        userText: userQuery,
        userTime: now,
        aiText: "I'm having trouble connecting to the conference intelligence assistant right now. Please try again shortly.",
        aiTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        sources: [],
        sessions: [],
      });
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <section className="kz-assistant-section" id="ai-assistant">
      {/* Background Decorative Art - Themed */}
      <div className="kz-assistant-bg-decor" aria-hidden="true">
        <div className="kz-assistant-dot-grid" />
        <svg
          className="kz-assistant-waves"
          viewBox="0 0 550 320"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M30 300 C 180 230, 280 340, 440 210 C 490 170, 520 100, 560 30"
            stroke="#55355E"
            strokeWidth="1.5"
            strokeOpacity="0.3"
          />
          <path
            d="M5 315 C 160 245, 270 355, 455 225 C 505 185, 535 110, 575 40"
            stroke="#70477C"
            strokeWidth="1.2"
            strokeOpacity="0.22"
          />
          <path
            d="M70 330 C 210 260, 310 370, 480 240 C 525 200, 550 130, 590 60"
            stroke="#55355E"
            strokeWidth="1"
            strokeOpacity="0.18"
          />
        </svg>
      </div>

      <div className="kz-assistant-container">
        {/* ====================================================
            HEADER: AI CONFERENCE ASSISTANT — & 2-LINE TITLE
            ==================================================== */}
        <div className="kz-assistant-header">
          <div className="kz-assistant-tag-wrap">
            <span className="kz-assistant-badge-title">AI CONFERENCE ASSISTANT</span>
            <span className="kz-assistant-tag-line" aria-hidden="true" />
          </div>

          {/* 2-Line Headline with Theme Colors */}
          <h2 className="kz-assistant-title">
            <span className="kz-title-line-dark">Get instant answers</span>
            <span className="kz-title-line-magenta">about KaizenCon 2027</span>
          </h2>

          {/* Quick Prompt Filter Buttons Row */}
          <div className="kz-assistant-pills-row" role="tablist" aria-label="Sample questions">
            {/* Pill 1 */}
            <button
              type="button"
              className={`kz-assistant-pill-btn ${activePreset === 'day2' ? 'active' : ''}`}
              onClick={() => handleSelectPreset('day2')}
              role="tab"
              aria-selected={activePreset === 'day2'}
            >
              <svg
                className="kz-assistant-pill-icon"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
              <span>What should I attend on Day 2?</span>
            </button>

            {/* Pill 2 */}
            <button
              type="button"
              className={`kz-assistant-pill-btn ${activePreset === 'aiSurgery' ? 'active' : ''}`}
              onClick={() => handleSelectPreset('aiSurgery')}
              role="tab"
              aria-selected={activePreset === 'aiSurgery'}
            >
              <svg
                className="kz-assistant-pill-icon"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
              <span>Who is discussing AI in surgery?</span>
            </button>

            {/* Pill 3 */}
            <button
              type="button"
              className={`kz-assistant-pill-btn ${activePreset === 'robotics' ? 'active' : ''}`}
              onClick={() => handleSelectPreset('robotics')}
              role="tab"
              aria-selected={activePreset === 'robotics'}
            >
              <svg
                className="kz-assistant-pill-icon"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
                <polyline points="10 9 9 9 8 9" />
              </svg>
              <span>Robotics vs laparoscopy sessions</span>
            </button>

            {/* Pill 4 */}
            <button
              type="button"
              className={`kz-assistant-pill-btn ${activePreset === 'drMaya' ? 'active' : ''}`}
              onClick={() => handleSelectPreset('drMaya')}
              role="tab"
              aria-selected={activePreset === 'drMaya'}
            >
              <svg
                className="kz-assistant-pill-icon"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
              <span>Tell me about Dr. Maya Chen</span>
            </button>
          </div>
        </div>

        {/* ====================================================
            MAIN WORKSPACE: CHAT SIMULATOR + CONTINUOUS TIMELINE
            ==================================================== */}
        <div className="kz-assistant-workspace">
          {/* LEFT COLUMN: CHAT SIMULATOR CARD */}
          <div className="kz-chat-wrapper">
            {/* Chat Top Header */}
            <div className="kz-chat-header">
              <div className="kz-chat-header-left">
                {/* AI Sparkle Icon Avatar */}
                <div className="kz-chat-ai-badge" aria-hidden="true">
                  <svg
                    width="22"
                    height="22"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M10 2C10 5.866 6.866 9 3 9C6.866 9 10 12.134 10 16C10 12.134 13.134 9 17 9C13.134 9 10 5.866 10 2Z" />
                    <path d="M18 15C18 16.657 16.657 18 15 18C16.657 18 18 19.343 18 21C18 19.343 19.343 18 21 18C19.343 18 18 16.657 18 15Z" />
                  </svg>
                </div>
                <div className="kz-chat-ai-info">
                  <span className="kz-chat-ai-name">KaizenCon AI</span>
                  <span className="kz-chat-ai-status">
                    <span className="kz-chat-status-dot" />
                    Conference Assistant · Online
                  </span>
                </div>
              </div>

              <div className="kz-chat-header-right">
                {/* Audio Waveform Equalizer Animation - Light & Luminous */}
                <div className="kz-chat-soundwaves" aria-label="AI Audio Waveform">
                  <span /><span /><span /><span /><span />
                  <span /><span /><span /><span /><span />
                  <span /><span /><span /><span /><span />
                </div>
                <button
                  type="button"
                  className="kz-chat-menu-btn"
                  aria-label="More options"
                >
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <circle cx="12" cy="5" r="2" />
                    <circle cx="12" cy="12" r="2" />
                    <circle cx="12" cy="19" r="2" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Chat Conversation Feed */}
            <div className="kz-chat-feed" ref={chatFeedRef}>
              {/* User Bubble (Right) */}
              <div className="kz-user-msg-group">
                <div className="kz-user-bubble">
                  <p className="kz-user-text">{currentChat.userText}</p>
                  <div className="kz-user-meta">
                    <span>{currentChat.userTime}</span>
                    <svg
                      className="kz-user-checks"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M18 6L7 17l-5-5" />
                      <path d="M22 10l-7.5 7.5L13 16" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* AI Bubble (Left) */}
              <div className="kz-ai-msg-group">
                <div className="kz-ai-avatar" aria-hidden="true">
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M10 2C10 5.866 6.866 9 3 9C6.866 9 10 12.134 10 16C10 12.134 13.134 9 17 9C13.134 9 10 5.866 10 2Z" />
                    <path d="M18 15C18 16.657 16.657 18 15 18C16.657 18 18 19.343 18 21C18 19.343 19.343 18 21 18C19.343 18 18 16.657 18 15Z" />
                  </svg>
                </div>

                <div className="kz-ai-bubble-box">
                  {isTyping ? (
                    <div className="kz-typing-indicator" aria-label="KaizenCon AI is typing">
                      <span /><span /><span />
                    </div>
                  ) : (
                    <>
                      <p className="kz-ai-text">{currentChat.aiText}</p>
                      {currentChat.sources && currentChat.sources.length > 0 && (
                        <div className="kz-chat-sources-container">
                          <span className="kz-chat-sources-label">Sources:</span>
                          <div className="kz-chat-sources-pills">
                            {currentChat.sources.map((src, sIdx) => (
                              <span key={sIdx} className="kz-chat-source-item">
                                {src.document || 'Document'}
                                {src.section ? ` · ${src.section}` : ''}
                                {src.page !== undefined && src.page !== null ? ` (p. ${src.page})` : ''}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                      <span className="kz-ai-time">{currentChat.aiTime}</span>

                      {/* 3 Recommended Session Cards - 3 Horizontal Rows */}
                      {currentChat.sessions && currentChat.sessions.length > 0 && (
                        <div className="kz-session-cards-grid">
                          {currentChat.sessions.map((session, index) => (
                            <Link
                              key={index}
                              to="/programme"
                              className="kz-session-card"
                              title={`View ${session.title} in Programme`}
                            >
                              <div className="kz-session-card-left">
                                <div className="kz-session-icon-box" aria-hidden="true">
                                  <svg
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                  >
                                    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                                    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
                                  </svg>
                                </div>
                                <div className="kz-session-main">
                                  <h4 className="kz-session-title">{session.title}</h4>
                                  <div className="kz-session-meta">
                                    <span className="kz-session-time">
                                      <svg
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                      >
                                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                                        <line x1="16" y1="2" x2="16" y2="6" />
                                        <line x1="8" y1="2" x2="8" y2="6" />
                                        <line x1="3" y1="10" x2="21" y2="10" />
                                      </svg>
                                      <span>{session.time}</span>
                                    </span>
                                    <span className="kz-session-divider" aria-hidden="true">•</span>
                                    <span className="kz-session-venue">
                                      <svg
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                      >
                                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                                        <circle cx="12" cy="10" r="3" />
                                      </svg>
                                      <span>{session.venue}</span>
                                    </span>
                                  </div>
                                </div>
                              </div>
                              <div className="kz-session-action">
                                <span className="kz-session-arrow" aria-hidden="true">
                                  <svg
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                  >
                                    <line x1="5" y1="12" x2="19" y2="12" />
                                    <polyline points="12 5 19 12 12 19" />
                                  </svg>
                                </span>
                              </div>
                            </Link>
                          ))}
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Chat Bottom Input Bar */}
            <div className="kz-chat-input-bar">
              <form className="kz-chat-input-form" onSubmit={handleSubmit}>
                <button
                  type="button"
                  className="kz-chat-attach-btn"
                  title="Attach session context"
                  aria-label="Attach file"
                >
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" />
                  </svg>
                </button>

                <input
                  type="text"
                  className="kz-chat-text-input"
                  placeholder="Ask about sessions, speakers, topics..."
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  aria-label="Ask about sessions, speakers, topics"
                />

                <button
                  type="submit"
                  className="kz-chat-send-btn"
                  title="Send message"
                  aria-label="Send message"
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
                  </svg>
                </button>
              </form>
            </div>
          </div>

          {/* RIGHT COLUMN: CONTINUOUS UNBROKEN TIMELINE & INTELLIGENCE */}
          <div className="kz-intel-layout">
            {/* Top AI Microchip Node */}
            <div className="kz-timeline-chip-node" aria-hidden="true" title="AI Core">
              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="4" y="4" width="16" height="16" rx="2" />
                <rect x="9" y="9" width="6" height="6" />
                <line x1="9" y1="1" x2="9" y2="4" />
                <line x1="15" y1="1" x2="15" y2="4" />
                <line x1="9" y1="20" x2="9" y2="23" />
                <line x1="15" y1="20" x2="15" y2="23" />
                <line x1="20" y1="9" x2="23" y2="9" />
                <line x1="20" y1="14" x2="23" y2="14" />
                <line x1="1" y1="9" x2="4" y2="9" />
                <line x1="1" y1="14" x2="4" y2="14" />
              </svg>
            </div>

            {/* ONE CONTINUOUS UNBROKEN VERTICAL LINE DIRECTLY CONNECTED */}
            <div className="kz-timeline-continuous-track" aria-hidden="true" />

            {/* Header Content */}
            <div className="kz-intel-header-content">
              <span className="kz-intel-badge">POWERED BY AI</span>

              <h3 className="kz-intel-title">
                <span className="kz-title-line-dark">Ask anything.</span>
                <span className="kz-title-line-magenta">Get conference intelligence.</span>
              </h3>

              <p className="kz-intel-desc">
                The KaizenCon AI is trained on the complete programme — every session, speaker
                biography, abstract, and topic. It helps you navigate 100+ sessions, find the right
                speaker, and make the most of three days.
              </p>
            </div>

            {/* 3 Action Cards with Perfectly Centered Horizontal Dots */}
            <div className="kz-intel-cards-list">
              {/* Card 1: Session discovery */}
              <div className="kz-intel-card-wrapper">
                <div className="kz-card-timeline-dot" aria-hidden="true" />
                <div
                  className="kz-intel-card"
                  onClick={() => handleSelectPreset('day2')}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => e.key === 'Enter' && handleSelectPreset('day2')}
                >
                  <div className="kz-intel-card-left">
                    <div className="kz-intel-icon-box">
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.4"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <circle cx="11" cy="11" r="8" />
                        <line x1="21" y1="21" x2="16.65" y2="16.65" />
                      </svg>
                    </div>
                    <div className="kz-intel-card-content">
                      <h4 className="kz-intel-card-heading">Session discovery</h4>
                      <p className="kz-intel-card-sub">Find sessions by topic, speaker, or day</p>
                    </div>
                  </div>
                  <div className="kz-intel-arrow" aria-hidden="true">
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <line x1="5" y1="12" x2="19" y2="12" />
                      <polyline points="12 5 19 12 12 19" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Card 2: Speaker profiles */}
              <div className="kz-intel-card-wrapper">
                <div className="kz-card-timeline-dot" aria-hidden="true" />
                <div
                  className="kz-intel-card"
                  onClick={() => handleSelectPreset('drMaya')}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => e.key === 'Enter' && handleSelectPreset('drMaya')}
                >
                  <div className="kz-intel-card-left">
                    <div className="kz-intel-icon-box">
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                        <circle cx="9" cy="7" r="4" />
                        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                      </svg>
                    </div>
                    <div className="kz-intel-card-content">
                      <h4 className="kz-intel-card-heading">Speaker profiles</h4>
                      <p className="kz-intel-card-sub">Learn about expertise, histories, and sessions</p>
                    </div>
                  </div>
                  <div className="kz-intel-arrow" aria-hidden="true">
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <line x1="5" y1="12" x2="19" y2="12" />
                      <polyline points="12 5 19 12 12 19" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Card 3: Day planning */}
              <div className="kz-intel-card-wrapper">
                <div className="kz-card-timeline-dot" aria-hidden="true" />
                <div
                  className="kz-intel-card"
                  onClick={() => handleSelectPreset('day2')}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => e.key === 'Enter' && handleSelectPreset('day2')}
                >
                  <div className="kz-intel-card-left">
                    <div className="kz-intel-icon-box">
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                        <line x1="16" y1="2" x2="16" y2="6" />
                        <line x1="8" y1="2" x2="8" y2="6" />
                        <line x1="3" y1="10" x2="21" y2="10" />
                        <path d="M9 16l2 2 4-4" />
                      </svg>
                    </div>
                    <div className="kz-intel-card-content">
                      <h4 className="kz-intel-card-heading">Day planning</h4>
                      <p className="kz-intel-card-sub">Build your ideal schedule from recommendations</p>
                    </div>
                  </div>
                  <div className="kz-intel-arrow" aria-hidden="true">
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <line x1="5" y1="12" x2="19" y2="12" />
                      <polyline points="12 5 19 12 12 19" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            {/* Disclaimer text */}
            <p className="kz-intel-disclaimer">
              All responses are based on approved KaizenCon conference content and do not
              constitute clinical advice.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
