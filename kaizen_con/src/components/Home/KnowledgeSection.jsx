import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './KnowledgeSection.css';
import askImg from '../../assets/home/ask.png';

const QUICK_SEARCH_TOPICS = [
  'Robotic colorectal surgery',
  'AI in surgical planning',
  'Robotics vs laparoscopy',
  'Economics of robotic surgery',
];

const SEARCH_DATABASE = [
  {
    title: 'Robotic colorectal surgery: 10-Year Clinical Outcomes & Techniques',
    category: 'Sessions',
    speaker: 'Dr. Arjun Mehta',
    badge: 'Keynote · Day 1',
  },
  {
    title: 'AI in surgical planning and autonomous anatomical segmentation',
    category: 'Research',
    speaker: 'Dr. Maya Chen',
    badge: 'Paper · Hall B',
  },
  {
    title: 'Robotics vs laparoscopy: Safety, recovery times, and cost analysis',
    category: 'Topics',
    speaker: 'Dr. Okafor & Panel',
    badge: 'Debate · Day 2',
  },
  {
    title: 'Economics of robotic surgery and hospital implementation models',
    category: 'Q&A',
    speaker: 'Prof. David Vance',
    badge: 'Session · Hall A',
  },
  {
    title: 'Real-time neural tissue identification in live robotic surgery',
    category: 'Sessions',
    speaker: 'Dr. James Carter',
    badge: 'Live Demo · Day 2',
  },
  {
    title: 'Surgeon training pathways and AI simulation metrics',
    category: 'Topics',
    speaker: 'Dr. Elena Rostova',
    badge: 'Workshop · Day 3',
  },
];

export default function KnowledgeSection() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [activeTopic, setActiveTopic] = useState(null);

  const handleTopicClick = (topic) => {
    if (activeTopic === topic) {
      setActiveTopic(null);
      setSearchQuery('');
    } else {
      setActiveTopic(topic);
      setSearchQuery(topic);
    }
  };

  const handleClear = () => {
    setSearchQuery('');
    setActiveTopic(null);
  };

  // Filter results if query has length >= 2
  const results = searchQuery.trim().length >= 2
    ? SEARCH_DATABASE.filter((item) =>
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.speaker.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  return (
    <section className="kz-knowledge-section" id="knowledge">
      {/* Anchor alias for footer links */}
      <span id="knowledge-base" className="kz-knowledge-anchor-target" aria-hidden="true" />

      {/* Decorative background ambient circles */}
      <div className="kz-knowledge-bg-decor" aria-hidden="true">
        <div className="kz-knowledge-ambient-circle circle-1" />
        <div className="kz-knowledge-ambient-circle circle-2" />
      </div>

      <div className="kz-section-container">
        <div className="kz-knowledge-grid">
          {/* Left Column: Information & Search UI */}
          <div className="kz-knowledge-left">
            {/* 1. Category Pill Badge */}
            <div className="kz-knowledge-badge-wrapper">
              <span className="kz-knowledge-badge">CONFERENCE KNOWLEDGE</span>
            </div>

            {/* 2. Headline */}
            <h2 className="kz-knowledge-title">
              <span className="kz-knowledge-title-dark">Search the entire</span>{' '}
              <span className="kz-knowledge-title-highlight">conference</span>
            </h2>

            {/* 3. Subtitle / Description */}
            <p className="kz-knowledge-subtitle">
              Sessions, summaries, Q&amp;A, and topics — all searchable from one place.
            </p>

            {/* 4. Quick Suggested Topic Pills */}
            <div className="kz-knowledge-topics-row" role="group" aria-label="Quick search suggestions">
              {QUICK_SEARCH_TOPICS.map((topic, index) => {
                const isSelected = activeTopic === topic;
                return (
                  <button
                    key={index}
                    type="button"
                    className={`kz-knowledge-topic-pill ${isSelected ? 'is-active' : ''}`}
                    onClick={() => handleTopicClick(topic)}
                    aria-pressed={isSelected}
                  >
                    {topic}
                  </button>
                );
              })}
            </div>

            {/* 5. Search Bar Container */}
            <div className="kz-knowledge-search-wrapper">
              <div className={`kz-knowledge-search-box ${isFocused ? 'is-focused' : ''}`}>
                {/* Search Magnifying Glass Icon */}
                <div className="kz-search-icon-wrap" aria-hidden="true">
                  <svg
                    className="kz-search-icon"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <circle cx="11" cy="11" r="7.5" />
                    <line x1="16.5" y1="16.5" x2="22" y2="22" />
                  </svg>
                </div>

                {/* Search Input Field */}
                <input
                  type="text"
                  className="kz-search-input"
                  placeholder="Search sessions, summaries, Q&A, topics..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    if (activeTopic && e.target.value !== activeTopic) {
                      setActiveTopic(null);
                    }
                  }}
                  onFocus={() => setIsFocused(true)}
                  onBlur={() => {
                    // Small delay so click events on dropdown register
                    setTimeout(() => setIsFocused(false), 200);
                  }}
                  aria-label="Search conference sessions, summaries, Q&A, and topics"
                />

                {/* Clear Button if text present */}
                {searchQuery && (
                  <button
                    type="button"
                    className="kz-search-clear-btn"
                    onClick={handleClear}
                    aria-label="Clear search query"
                    title="Clear search"
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="18" y1="6" x2="6" y2="18" />
                      <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                  </button>
                )}

                {/* Right Action: Open knowledge base link */}
                <Link
                  to="/knowledge"
                  className="kz-knowledge-open-link"
                >
                  <span>Open knowledge base</span>
                  <span className="kz-knowledge-arrow" aria-hidden="true">→</span>
                </Link>
              </div>

              {/* Instant Search Results Dropdown Preview */}
              {isFocused && searchQuery.trim().length >= 2 && (
                <div className="kz-knowledge-results-dropdown" role="listbox">
                  <div className="kz-results-header">
                    <span>
                      {results.length > 0
                        ? `Found ${results.length} results for "${searchQuery}"`
                        : `No direct matches for "${searchQuery}"`}
                    </span>
                    <span className="kz-results-badge">Live Knowledge Base</span>
                  </div>

                  {results.map((item, idx) => (
                    <div
                      key={idx}
                      className="kz-result-item"
                      role="option"
                      aria-selected="false"
                      onMouseDown={(e) => {
                        e.preventDefault();
                        setSearchQuery(item.title);
                      }}
                    >
                      <div className="kz-result-left">
                        <span className="kz-result-category">{item.category}</span>
                        <div className="kz-result-title">{item.title}</div>
                        <div className="kz-result-speaker">{item.speaker}</div>
                      </div>
                      <span className="kz-result-pill">{item.badge}</span>
                    </div>
                  ))}

                  {results.length === 0 && (
                    <div className="kz-result-empty">
                      Press enter or ask the AI Conference Assistant for detailed instant answers on this topic.
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Visual Diagram Image */}
          <div className="kz-knowledge-right">
            <div className="kz-knowledge-visual-wrapper">
              <img
                src={askImg}
                alt="KaizenCon Knowledge Network connecting Sessions, Speakers, Topics, Research, and Q&A to AI Brain"
                className="kz-knowledge-image"
                loading="lazy"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
