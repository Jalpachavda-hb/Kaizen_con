import React from 'react';
import SpeakerCard from './SpeakerCard';
import './SpeakersSection.css';

const SPEAKERS = [
  {
    id: '01',
    initials: 'AM',
    name: 'Dr. Arjun Mehta',
    role: 'Gastrointestinal & Robotic Surgeon',
    institute: 'Global Institute of Surgical Innovation',
    theme: 'light',
  },
  {
    id: '02',
    initials: 'SL',
    name: 'Dr. Sofia Laurent',
    role: 'Surgical Oncologist & AI Researcher',
    institute: 'International Centre for Robotic Surgery',
    theme: 'magenta',
  },
  {
    id: '03',
    initials: 'DO',
    name: 'Dr. Daniel Okafor',
    role: 'Laparoscopic & Colorectal Surgeon',
    institute: 'Future Health Research Institute',
    theme: 'light',
  },
  {
    id: '04',
    initials: 'MC',
    name: 'Dr. Maya Chen',
    role: 'Computational Surgeon & Imaging Specialist',
    institute: 'Centre for Intelligent Surgery',
    theme: 'magenta',
  },
];

export default function SpeakersSection() {
  return (
    <section className="kz-featured-speakers-section" id="speakers" aria-label="Featured Speakers">
      <div className="kz-featured-speakers-container">
        {/* Header Bar */}
        <div className="kz-speakers-top-bar">
          <div className="kz-speakers-header-left">
            {/* Tag: | SPEAKERS */}
            <div className="kz-speakers-pill-tag">
              <span className="kz-speakers-bar-accent" aria-hidden="true" />
              <span className="kz-speakers-tag-label">SPEAKERS</span>
            </div>

            {/* Headline: Featured speakers */}
            <h2 className="kz-speakers-main-title">
              Featured<span className="kz-speakers-title-magenta">speakers</span>
            </h2>

            {/* Underline accent beneath Featured */}
            <div className="kz-speakers-title-underline" aria-hidden="true" />
          </div>

          {/* Right link: All speakers → */}
          <a href="#programme" className="kz-speakers-all-link">
            <span>All speakers</span>
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="12 5 19 12 12 19" />
            </svg>
          </a>
        </div>

        {/* 4 Featured Speakers Grid using the reusable SpeakerCard component */}
        <div className="kz-featured-speakers-grid">
          {SPEAKERS.map((spk) => (
            <SpeakerCard
              key={spk.id}
              initials={spk.initials}
              name={spk.name}
              role={spk.role}
              institute={spk.institute}
              theme={spk.theme}
              link="#speaker-details"
            />
          ))}
        </div>
      </div>
    </section>
  );
}
