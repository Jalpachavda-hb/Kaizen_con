import React from 'react';
import './HomeSections.css';

const capabilities = [
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="kz-track-icon">
        <circle cx="12" cy="8" r="4" />
        <path d="M6 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2" />
      </svg>
    ),
    title: 'Personalized',
    description:
      'AI maps your clinical speciality and interests to a tailored programme — recommended sessions, curated speakers, and relevant topics surfaced before you arrive.'
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="kz-track-icon">
        <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 4.44-5.04z" />
        <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-4.44-5.04z" />
      </svg>
    ),
    title: 'Intelligent',
    description:
      'A conference-trained AI assistant answers questions about sessions, speakers, and clinical topics in real time — grounded entirely in approved KaizenCon content.'
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="kz-track-icon">
        <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
      </svg>
    ),
    title: 'Interactive',
    description:
      'Live Q&A intelligence clusters audience questions by theme, surfaces the most clinically relevant, and creates a structured discussion rather than a queue.'
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="kz-track-icon">
        <ellipse cx="12" cy="5" rx="9" ry="3" />
        <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" />
        <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
      </svg>
    ),
    title: 'Connected',
    description:
      'Every session becomes a searchable knowledge asset — AI-generated summaries, transcripts, and a queryable knowledge base that outlasts the conference itself.'
  }
];

export default function TracksSection() {
  return (
    <section className="kz-tracks-section" id="about">
      <div className="kz-section-container">
        {/* Left-aligned header matching screenshot */}
        <div className="kz-tracks-header">
          <div className="kz-tracks-badge-wrapper">
            <span className="kz-tracks-pill">AI-NATIVE CONFERENCE</span>
          </div>

          <h2 className="kz-tracks-title">
            Intelligence <span className="kz-gradient-text">at every layer</span>
          </h2>

          <p className="kz-tracks-desc">
            Four interlocking AI capabilities that transform how medical knowledge is shared, discovered, and retained.
          </p>
        </div>

        {/* 4-Card Grid */}
        <div className="kz-tracks-grid">
          {capabilities.map((item, idx) => (
            <div key={idx} className="kz-track-card">
              <div className="kz-track-icon-wrapper">
                {item.icon}
              </div>
              <div className="kz-track-content">
                <h3 className="kz-track-title">{item.title}</h3>
                <p className="kz-track-desc">{item.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
