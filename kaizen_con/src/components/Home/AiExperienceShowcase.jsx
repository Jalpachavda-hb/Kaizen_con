import React from 'react';
import './HomeSections.css';

const AI_FEATURES = [
  'AI-scored session recommendations based on your speciality',
  'Personalised daily schedule across all three days',
  'Speaker matching based on research alignment',
  'Live updates if schedule changes affect your plan',
];

const USER_INTERESTS = [
  'Robotic Colorectal',
  'AI in Surgery',
  'Surgical Training',
  'Outcomes Research',
];

const RECOMMENDED_SESSIONS = [
  {
    score: 98,
    title: 'Robotic Colorectal Resection: Current Evidence',
    meta: 'Day 1 · 10:30 · Hall A · Dr. Mehta',
  },
  {
    score: 95,
    title: 'Robotics vs Laparoscopy: A 10-Year Analysis',
    meta: 'Day 1 · 11:30 · Hall A · Dr. Okafor',
  },
  {
    score: 91,
    title: 'ML Models for Predicting Surgical Complications',
    meta: 'Day 2 · 14:00 · Hall A · Dr. Laurent',
  },
  {
    score: 88,
    title: 'Surgeon Training in the Age of AI',
    meta: 'Day 2 · 11:30 · Hall C · Dr. Mehta',
  },
];

export default function AiExperienceShowcase() {
  return (
    <section className="kz-ai-showcase-section" id="ai-experience">
      <div className="kz-section-container">
        <div className="kz-ai-showcase-layout">
          {/* Left Column: AI Personalization Info */}
          <div className="kz-ai-showcase-left">
            <span className="kz-ai-pill-badge">AI PERSONALIZATION</span>
            <h2 className="kz-ai-showcase-title">
              Your conference,<br />
              <span className="kz-gradient-text">curated by AI</span>
            </h2>
            <p className="kz-ai-showcase-desc">
              Before KaizenCon begins, your AI profile is built from your speciality, interests, and clinical context. The result: a programme that feels like it was designed specifically for you.
            </p>

            <ul className="kz-ai-feature-list">
              {AI_FEATURES.map((feature, idx) => (
                <li key={idx} className="kz-ai-feature-item">
                  <svg
                    className="kz-ai-check-icon"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="9 12 11.5 14.5 15.5 9.5" />
                  </svg>
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Right Column: AI Profile Card */}
          <div className="kz-ai-showcase-right">
            <div className="kz-ai-profile-card">
              {/* Profile Header */}
              <div className="kz-ai-profile-header">
                <div className="kz-ai-profile-user">
                  <div className="kz-ai-avatar">AM</div>
                  <div className="kz-ai-user-info">
                    <h3 className="kz-ai-user-name">Dr. Arjun Mehta</h3>
                    <p className="kz-ai-user-role">GI Surgeon · Global Institute of Surgical Innovation</p>
                  </div>
                </div>
                <div className="kz-ai-status-pill">
                  AI PROFILE ACTIVE
                </div>
              </div>

              {/* Interests Section */}
              <div className="kz-ai-card-section">
                <span className="kz-ai-card-label">YOUR INTERESTS</span>
                <div className="kz-ai-interests-tags">
                  {USER_INTERESTS.map((interest, idx) => (
                    <span key={idx} className="kz-ai-tag">
                      {interest}
                    </span>
                  ))}
                </div>
              </div>

              {/* Recommended For You Section */}
              <div className="kz-ai-card-section">
                <span className="kz-ai-card-label">RECOMMENDED FOR YOU</span>
                <div className="kz-ai-sessions-list">
                  {RECOMMENDED_SESSIONS.map((session, idx) => (
                    <div key={idx} className="kz-ai-session-item">
                      <div className="kz-ai-score-badge">{session.score}</div>
                      <div className="kz-ai-session-details">
                        <h4 className="kz-ai-session-title">{session.title}</h4>
                        <p className="kz-ai-session-meta">{session.meta}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Disclaimer Footer */}
              <div className="kz-ai-card-footer">
                <p className="kz-ai-card-disclaimer">
                  AI recommendations are based on your profile and approved KaizenCon session data only.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
