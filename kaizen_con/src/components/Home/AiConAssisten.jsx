import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import './AiConAssisten.css';
import { askKnowledgeChat } from '../../Apipath';

// Prompt suggestion chips that trigger live API queries
const QUICK_QUESTIONS = [
  {
    id: 'day2',
    label: 'What should I attend on Day 2?',
    query: 'What sessions should I attend on Day 2 of KAIZENCON 2027?',
  },
  {
    id: 'aiSurgery',
    label: 'Who is discussing AI in surgery?',
    query: 'Who are the faculty discussing AI and machine learning in surgery?',
  },
  {
    id: 'robotics',
    label: 'Robotics vs laparoscopy sessions',
    query: 'Which sessions compare robotic surgery and laparoscopy?',
  },
  {
    id: 'faculty',
    label: 'Key faculty and keynote speakers',
    query: 'Tell me about the distinguished faculty, chairs, and keynote speakers at KAIZENCON 2027.',
  },
];

export default function AiConAssisten() {
  const [activePromptId, setActivePromptId] = useState('');
  const [currentChat, setCurrentChat] = useState({
    userText: 'Hello! How can the KAIZENCON AI Assistant help me?',
    userTime: '10:00 AM',
    aiText:
      'Welcome to the KAIZENCON 2027 Intelligence Assistant! I am trained on the complete scientific programme, faculty profiles, and schedule timings. Choose any suggested question above or type your question below.',
    aiTime: '10:00 AM',
    sources: [],
    sessions: [],
  });
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const chatFeedRef = useRef(null);

  // Execute a live query against the API
  const executeChatQuery = async (userQuery, promptId = '') => {
    if (!userQuery || !userQuery.trim() || isTyping) return;

    const trimmedQuery = userQuery.trim();
    setActivePromptId(promptId);
    setInputValue('');
    setIsTyping(true);

    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    setCurrentChat({
      userText: trimmedQuery,
      userTime: now,
      aiText: '',
      aiTime: '',
      sources: [],
      sessions: [],
    });

    try {
      const data = await askKnowledgeChat(trimmedQuery);
      const reply =
        data?.answer ||
        (Array.isArray(data?.results) &&
          (data.results[0]?.answer || data.results[0]?.text || data.results[0]?.response)) ||
        data?.result?.answer ||
        "I couldn't find this information in the available knowledge base. Please try another question.";

      const sources = Array.isArray(data?.sources)
        ? data.sources
        : Array.isArray(data?.results?.[0]?.sources)
        ? data.results[0].sources
        : [];

      const sessions = Array.isArray(data?.sessions)
        ? data.sessions
        : Array.isArray(data?.results?.[0]?.sessions)
        ? data.results[0].sessions
        : [];

      setCurrentChat({
        userText: trimmedQuery,
        userTime: now,
        aiText: reply,
        aiTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        sources,
        sessions,
      });

      if (chatFeedRef.current) {
        chatFeedRef.current.scrollTop = chatFeedRef.current.scrollHeight;
      }
    } catch (error) {
      console.error('Error in chatbot API call:', error);
      setCurrentChat({
        userText: trimmedQuery,
        userTime: now,
        aiText:
          "I'm having trouble connecting to the conference intelligence assistant right now. Please try again shortly.",
        aiTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        sources: [],
        sessions: [],
      });
    } finally {
      setIsTyping(false);
    }
  };

  // Handle custom query submission from text input
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!inputValue.trim()) return;
    executeChatQuery(inputValue, '');
  };

  return (
    <section className="kz-assistant-section" id="ai-assistant">
      {/* Background Decorative Art */}
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
        {/* HEADER: AI CONFERENCE ASSISTANT */}
        <div className="kz-assistant-header">
          <div className="kz-assistant-tag-wrap">
            <span className="kz-assistant-badge-title">AI CONFERENCE ASSISTANT</span>
            <span className="kz-assistant-tag-line" aria-hidden="true" />
          </div>

          <h2 className="kz-assistant-title">
            <span className="kz-title-line-dark">Get instant answers </span>
            <span className="kz-title-line-magenta">about KAIZENCON 2027</span>
          </h2>

          {/* Quick Prompt Filter Buttons Row - Triggers Live API */}
          <div className="kz-assistant-pills-row" role="tablist" aria-label="Sample questions">
            {QUICK_QUESTIONS.map((q) => (
              <button
                key={q.id}
                type="button"
                className={`kz-assistant-pill-btn ${activePromptId === q.id ? 'active' : ''}`}
                onClick={() => executeChatQuery(q.query, q.id)}
                role="tab"
                aria-selected={activePromptId === q.id}
                disabled={isTyping}
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
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="16" x2="12" y2="12" />
                  <line x1="12" y1="8" x2="12.01" y2="8" />
                </svg>
                <span>{q.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* MAIN WORKSPACE: CHAT SIMULATOR + CONTINUOUS TIMELINE */}
        <div className="kz-assistant-workspace">
          {/* LEFT COLUMN: CHAT SIMULATOR CARD */}
          <div className="kz-chat-wrapper">
            {/* Chat Top Header */}
            <div className="kz-chat-header">
              <div className="kz-chat-header-left">
                <div className="kz-chat-ai-badge" aria-hidden="true">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M10 2C10 5.866 6.866 9 3 9C6.866 9 10 12.134 10 16C10 12.134 13.134 9 17 9C13.134 9 10 5.866 10 2Z" />
                    <path d="M18 15C18 16.657 16.657 18 15 18C16.657 18 18 19.343 18 21C18 19.343 19.343 18 21 18C19.343 18 18 16.657 18 15Z" />
                  </svg>
                </div>
                <div className="kz-chat-ai-info">
                  <span className="kz-chat-ai-name">KAI Assistant</span>
                </div>
              </div>

              <div className="kz-chat-header-right">
                <div className="kz-chat-soundwaves" aria-label="AI Audio Waveform">
                  <span /><span /><span /><span /><span />
                  <span /><span /><span /><span /><span />
                  <span /><span /><span /><span /><span />
                </div>
              </div>
            </div>

            {/* Chat Conversation Feed */}
            <div className="kz-chat-feed" ref={chatFeedRef}>
              {/* User Bubble (Right) */}
              {currentChat.userText && (
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
              )}

              {/* AI Bubble (Left) */}
              <div className="kz-ai-msg-group">
                <div className="kz-ai-avatar" aria-hidden="true">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
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

                      {/* Dynamic Recommended Session Cards from Live API */}
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
                                    {session.time && (
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
                                    )}
                                    {session.venue && (
                                      <>
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
                                      </>
                                    )}
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
                <input
                  type="text"
                  className="kz-chat-text-input"
                  placeholder="Ask about sessions, faculty, topics..."
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  aria-label="Ask about sessions, faculty, topics"
                  disabled={isTyping}
                />

                <button
                  type="submit"
                  className="kz-chat-send-btn"
                  title="Send message"
                  aria-label="Send message"
                  disabled={isTyping || !inputValue.trim()}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
                  </svg>
                </button>
              </form>
            </div>
          </div>

          {/* RIGHT COLUMN: CONTINUOUS UNBROKEN TIMELINE & INTELLIGENCE */}
          <div className="kz-intel-layout">
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

            <div className="kz-timeline-continuous-track" aria-hidden="true" />

            <div className="kz-intel-header-content">
              <span className="kz-intel-badge">POWERED BY AI</span>

              <h3 className="kz-intel-title">
                <span className="kz-title-line-dark">Ask anything. </span>
                <span className="kz-title-line-magenta">Get conference intelligence.</span>
              </h3>

              <p className="kz-intel-desc">
                The KAIZENCON AI is trained on the complete programme — every session, faculty
                biography, abstract, and topic. It helps you navigate, find the right faculty, and
                make the most of three days.
              </p>
            </div>

            {/* 3 Action Cards - Trigger Live AI Assistant Queries */}
            <div className="kz-intel-cards-list">
              {/* Card 1: Session discovery */}
              <div className="kz-intel-card-wrapper">
                <div className="kz-card-timeline-dot" aria-hidden="true" />
                <div
                  className="kz-intel-card"
                  onClick={() =>
                    executeChatQuery(
                      'What are the key scientific sessions and tracks across the 3 days of KAIZENCON 2027?',
                      'discovery'
                    )
                  }
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) =>
                    e.key === 'Enter' &&
                    executeChatQuery(
                      'What are the key scientific sessions and tracks across the 3 days of KAIZENCON 2027?',
                      'discovery'
                    )
                  }
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
                      <p className="kz-intel-card-sub">Find sessions by topic, faculty, or day</p>
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

              {/* Card 2: Faculty profiles */}
              <div className="kz-intel-card-wrapper">
                <div className="kz-card-timeline-dot" aria-hidden="true" />
                <div
                  className="kz-intel-card"
                  onClick={() =>
                    executeChatQuery(
                      'Who are the distinguished faculty members, their backgrounds, and what sessions are they leading?',
                      'faculty'
                    )
                  }
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) =>
                    e.key === 'Enter' &&
                    executeChatQuery(
                      'Who are the distinguished faculty members, their backgrounds, and what sessions are they leading?',
                      'faculty'
                    )
                  }
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
                      <h4 className="kz-intel-card-heading">Faculty profiles</h4>
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
                  onClick={() =>
                    executeChatQuery(
                      'Recommend a comprehensive schedule itinerary for Day 2 of KAIZENCON 2027.',
                      'day2'
                    )
                  }
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) =>
                    e.key === 'Enter' &&
                    executeChatQuery(
                      'Recommend a comprehensive schedule itinerary for Day 2 of KAIZENCON 2027.',
                      'day2'
                    )
                  }
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

            <p className="kz-intel-disclaimer">
              All responses are based on approved KAIZENCON conference content and do not
              constitute clinical advice.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
