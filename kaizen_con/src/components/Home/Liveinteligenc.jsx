import React, { useState } from 'react';
import './Liveinteligenc.css';
import bgAi from '../../assets/home/bgai.png';

// Poll options initial data matching the user specification
const INITIAL_POLL_DATA = [
  {
    id: 'robotic',
    name: 'Robotic Surgery',
    votes: 203,
    iconType: 'robotic',
    colorClass: 'kz-fill-robotic',
    iconClass: 'kz-icon-robotic',
  },
  {
    id: 'laparoscopic',
    name: 'Laparoscopic',
    votes: 82,
    iconType: 'laparoscopic',
    colorClass: 'kz-fill-laparoscopic',
    iconClass: 'kz-icon-laparoscopic',
  },
  {
    id: 'both',
    name: 'Both Equally',
    votes: 42,
    iconType: 'both',
    colorClass: 'kz-fill-both',
    iconClass: 'kz-icon-both',
  },
  {
    id: 'open',
    name: 'Open Surgery',
    votes: 16,
    iconType: 'open',
    colorClass: 'kz-fill-open',
    iconClass: 'kz-icon-open',
  },
];

// AI Q&A Clusters data matching the user specification
const QA_CLUSTERS = [
  {
    number: '01',
    numColor: 'kz-num-pink',
    title: 'Outcomes & Evidence',
    questionCount: '8 questions',
    question: '“What does the long-term data show for anastomotic leak rates comparing the two platforms?”',
  },
  {
    number: '02',
    numColor: 'kz-num-purple',
    title: 'Cost & Access',
    questionCount: '6 questions',
    question: '“How do you justify robotic adoption in resource-limited settings when outcomes are comparable?”',
  },
  {
    number: '03',
    numColor: 'kz-num-pink',
    title: 'Learning Curve',
    questionCount: '5 questions',
    question: '“What is the typical case load required to achieve proficiency in robotic colorectal surgery?”',
  },
  {
    number: '04',
    numColor: 'kz-num-purple',
    title: 'Haptic Feedback',
    questionCount: '3 questions',
    question: '“Does the lack of haptic feedback in current robotic systems represent a genuine clinical risk?”',
  },
];

export default function Liveinteligenc() {
  const [pollData, setPollData] = useState(INITIAL_POLL_DATA);
  const [selectedOption, setSelectedOption] = useState(null);
  const [activeCluster, setActiveCluster] = useState(null);

  // Total votes calculation
  const totalVotes = pollData.reduce((acc, curr) => acc + curr.votes, 0);

  // Handle interactive vote
  const handleVote = (optionId) => {
    if (selectedOption === optionId) return;

    setPollData((prev) =>
      prev.map((item) => {
        if (item.id === optionId) {
          return { ...item, votes: item.votes + 1 };
        }
        if (selectedOption && item.id === selectedOption) {
          return { ...item, votes: Math.max(0, item.votes - 1) };
        }
        return item;
      })
    );
    setSelectedOption(optionId);
  };

  return (
    <section 
      className="kz-live-intel-section" 
      id="live-intelligence"
      aria-label="Live Intelligence Section"
    >
      {/* Background Image Layer with isolated opacity confined only to this section */}
      <div 
        className="kz-live-intel-bg-layer" 
        style={{ backgroundImage: `url(${bgAi})` }} 
        aria-hidden="true" 
      />

      <div className="kz-live-intel-container">
        {/* Section Header */}
        <div className="kz-live-intel-header">
          <div className="kz-live-intel-pill">
            <span className="kz-live-intel-pill-dot" aria-hidden="true" />
            <span>LIVE INTELLIGENCE</span>
          </div>

          <h2 className="kz-live-intel-title">
            <span className="kz-title-dark-theme">The room, made </span>
            <span className="kz-title-magenta-theme">intelligent</span>
          </h2>

          <p className="kz-live-intel-desc">
            AI clusters live audience questions by theme and surfaces the most clinically relevant — turning a queue into structured clinical discourse.
          </p>
        </div>

        {/* Two Columns Grid */}
        <div className="kz-live-intel-grid">
          {/* ================= LEFT CARD: Live Audience Poll ================= */}
          <div className="kz-live-card kz-poll-card">
            <div>
              {/* Header */}
              <div className="kz-card-header">
                <div className="kz-card-title-group">
                  <div className="kz-card-icon-badge" aria-hidden="true">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="18" y1="20" x2="18" y2="10" />
                      <line x1="12" y1="20" x2="12" y2="4" />
                      <line x1="6" y1="20" x2="6" y2="14" />
                    </svg>
                  </div>
                  <h3 className="kz-card-title">Live Audience Poll</h3>
                </div>

                <div className="kz-poll-header-right">
                  <div className="kz-poll-live-status">
                    <span className="kz-pulse-circle" aria-hidden="true" />
                    <span>LIVE NOW</span>
                  </div>
                  <div className="kz-poll-timer-box">
                    <div className="kz-poll-time-now">14:32</div>
                    <div className="kz-poll-time-total">of 45:00</div>
                  </div>
                </div>
              </div>

              {/* Question */}
              <h4 className="kz-poll-prompt">
                Which platform do you use most for colorectal surgery?
              </h4>

              {/* Poll Options */}
              <div className="kz-poll-options-list" role="radiogroup" aria-label="Colorectal surgery platform poll">
                {pollData.map((item) => {
                  const percentage = totalVotes > 0 ? Math.round((item.votes / totalVotes) * 100) : 0;
                  const isSelected = selectedOption === item.id;

                  return (
                    <div
                      key={item.id}
                      className={`kz-poll-option-row ${isSelected ? 'kz-poll-selected' : ''}`}
                      onClick={() => handleVote(item.id)}
                      role="radio"
                      aria-checked={isSelected}
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          handleVote(item.id);
                        }
                      }}
                    >
                      {/* Option Icon */}
                      <div className={`kz-poll-option-icon ${item.iconClass}`} aria-hidden="true">
                        {item.iconType === 'robotic' && (
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="3" y="16" width="6" height="5" rx="1" />
                            <path d="M6 16v-4" />
                            <path d="M6 12l6-6" />
                            <circle cx="12" cy="6" r="2" />
                            <path d="M12 6l5 4" />
                            <path d="M17 10l3-1" />
                            <circle cx="18" cy="11" r="1.5" />
                          </svg>
                        )}
                        {item.iconType === 'laparoscopic' && (
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="6" cy="6" r="3" />
                            <circle cx="6" cy="18" r="3" />
                            <line x1="20" y1="4" x2="8.12" y2="15.88" />
                            <line x1="14.47" y1="14.48" x2="20" y2="20" />
                            <line x1="8.12" y1="8.12" x2="12" y2="12" />
                          </svg>
                        )}
                        {item.iconType === 'both' && (
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M12 3v18" />
                            <path d="M5 6l7-3 7 3" />
                            <path d="M2 13l3-7 3 7a3 3 0 0 1-6 0z" />
                            <path d="M16 13l3-7 3 7a3 3 0 0 1-6 0z" />
                          </svg>
                        )}
                        {item.iconType === 'open' && (
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                            <polyline points="14 2 14 8 20 8" />
                            <line x1="9" y1="13" x2="15" y2="13" />
                            <line x1="9" y1="17" x2="13" y2="17" />
                          </svg>
                        )}
                      </div>

                      {/* Option Progress & Title */}
                      <div className="kz-poll-bar-wrapper">
                        <div className="kz-poll-option-title">
                          <span>{item.name}</span>
                          {isSelected && <span className="kz-poll-selected-tag">Your Vote</span>}
                        </div>
                        <div className="kz-poll-track">
                          <div
                            className={`kz-poll-fill ${item.colorClass}`}
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>

                      {/* Percentage & Vote Count */}
                      <div className="kz-poll-meta">
                        <div className="kz-poll-percentage">{percentage}%</div>
                        <div className="kz-poll-votes-count">{item.votes} votes</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Poll Card Footer */}
            <div className="kz-card-footer">
              <svg className="kz-footer-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
              <span>{totalVotes} responses · Updated live</span>
            </div>
          </div>

          {/* ================= RIGHT CARD: AI Q&A Clustering ================= */}
          <div className="kz-live-card kz-qa-card">
            <div>
              {/* Header */}
              <div className="kz-card-header">
                <div className="kz-card-title-group">
                  <div className="kz-card-icon-badge" aria-hidden="true">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                      <line x1="8" y1="9" x2="16" y2="9" />
                      <line x1="8" y1="13" x2="13" y2="13" />
                    </svg>
                  </div>
                  <h3 className="kz-card-title">AI Q&A Clustering</h3>
                </div>

                <div className="kz-qa-count-badge">
                  24 QUESTIONS
                </div>
              </div>

              {/* Clusters List */}
              <div className="kz-qa-list" role="list" aria-label="AI Q&A Question Clusters">
                {QA_CLUSTERS.map((cluster, index) => (
                  <div
                    key={index}
                    className="kz-qa-item-card"
                    role="listitem"
                    tabIndex={0}
                    onClick={() => setActiveCluster(index === activeCluster ? null : index)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        setActiveCluster(index === activeCluster ? null : index);
                      }
                    }}
                  >
                    {/* Number Circle Badge */}
                    <div className={`kz-qa-number-circle ${cluster.numColor}`}>
                      {cluster.number}
                    </div>

                    {/* Middle Content */}
                    <div className="kz-qa-content">
                      <div className="kz-qa-header-row">
                        <span className="kz-qa-topic-title">{cluster.title}</span>
                        <span className="kz-qa-topic-badge">{cluster.questionCount}</span>
                      </div>
                      <p className="kz-qa-question-text">
                        {cluster.question}
                      </p>
                    </div>

                    {/* Right Chevron */}
                    <div className="kz-qa-arrow-btn" aria-hidden="true">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="9 18 15 12 9 6" />
                      </svg>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Q&A Card Footer */}
            <div className="kz-card-footer">
              <svg className="kz-footer-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
              </svg>
              <span>AI clusters updated every 60 seconds. Questions are anonymised.</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
