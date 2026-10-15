import React from 'react';
import './HomeSections.css';
import aiIcon from '../../assets/home/ai.png';

const ideaSteps = [
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="kz-step-icon">
        <circle cx="12" cy="8" r="4" />
        <path d="M6 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2" />
      </svg>
    ),
    title: 'Delegate',
    subtitle: 'Interests & goals',
    isHighlight: false
  },
  {
    icon: (
      <img
        src={aiIcon}
        alt="AI Layer"
        className="kz-step-icon kz-step-img-ai"
      />
    ),
    title: 'AI Layer',
    subtitle: 'Personalisation',
    isHighlight: true
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="kz-step-icon">
        <rect x="3" y="4" width="18" height="18" rx="3" ry="3" />
        <line x1="16" y1="2" x2="16" y2="6" />
        <line x1="8" y1="2" x2="8" y2="6" />
        <line x1="3" y1="10" x2="21" y2="10" />
        <circle cx="8" cy="14" r="1.1" fill="currentColor" />
        <circle cx="12" cy="14" r="1.1" fill="currentColor" />
        <circle cx="16" cy="14" r="1.1" fill="currentColor" />
        <circle cx="8" cy="17.5" r="1.1" fill="currentColor" />
        <circle cx="12" cy="17.5" r="1.1" fill="currentColor" />
        <circle cx="16" cy="17.5" r="1.1" fill="currentColor" />
      </svg>
    ),
    title: 'Programme',
    subtitle: '100+ sessions',
    isHighlight: false
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="kz-step-icon">
        <path d="M21 14a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      </svg>
    ),
    title: 'Live Interaction',
    subtitle: 'Q&A Intelligence',
    isHighlight: false
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="kz-step-icon">
        <ellipse cx="12" cy="5" rx="9" ry="3" />
        <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" />
        <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
      </svg>
    ),
    title: 'Knowledge',
    subtitle: 'Permanent base',
    isHighlight: false
  }
];

export default function IdeaSection() {
  return (
    <section className="kz-idea-section" id="idea">
      <div className="kz-section-container">
        <div className="kz-idea-inner">
          {/* Badge: Kept intact as requested */}
          <div className="kz-idea-badge-wrapper">
            <span className="kz-idea-pill">THE IDEA</span>
          </div>

          {/* Title: Kept intact as requested */}
          <h2 className="kz-idea-title">
            What if a medical conference <br />
            could think <span className="kz-gradient-text">with you?</span>
          </h2>

          {/* Subtitle description */}
          <p className="kz-idea-desc">
            KaizenCon 2027 is not a conference about AI. It is an AI-native conference — one where
            intelligence is woven into every layer of the experience, from the moment you register to
            the knowledge you carry home.
          </p>

          {/* Below Icon Line / Timeline Stepper */}
          <div className="kz-idea-stepper-wrap">
            <div className="kz-idea-stepper">
              {ideaSteps.map((step, idx) => (
                <React.Fragment key={idx}>
                  <div className={`kz-step-item ${step.isHighlight ? 'kz-step-item-active' : ''}`}>
                    <div className="kz-step-circle">
                      {step.icon}
                    </div>
                    <div className="kz-step-info">
                      <div className="kz-step-title">{step.title}</div>
                      <div className="kz-step-subtitle">{step.subtitle}</div>
                    </div>
                  </div>

                  {/* Connecting Line Segment with Dot between circles */}
                  {idx < ideaSteps.length - 1 && (
                    <div className="kz-step-connector">
                      <span className="kz-step-connector-dot" />
                    </div>
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
