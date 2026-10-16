import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import SpeakerCard from './SpeakerCard';
import './SpeakersSection.css';

// Show exactly 3 featured speakers on the home page as requested
const HOME_FEATURED_SPEAKERS = [
  {
    id: '01',
    initials: 'AM',
    name: 'Dr. Arjun Mehta',
    role: 'Gastrointestinal & Robotic Surgeon',
    institute: 'Global Institute of Surgical Innovation',
    country: 'India',
    flag: '🇮🇳',
    tags: ['Robotic Surgery', 'GI Oncology', 'Minimally Invasive Surgery'],
    topic: 'AI-Guided Robotic Colorectal Surgery',
    sessions: '3 sessions',
    tag: 'FEATURED',
    bio: 'Dr. Arjun Mehta is a leading gastrointestinal and robotic surgeon with over 18 years of experience in minimally invasive surgery, robotic techniques, and colorectal oncology...',
    isHighlighted: false,
  },
  {
    id: '02',
    initials: 'SL',
    name: 'Dr. Sofia Laurent',
    role: 'Surgical Oncologist & AI Researcher',
    institute: 'International Centre for Robotic Surgery',
    country: 'France',
    flag: '🇫🇷',
    tags: ['Surgical Oncology', 'Predictive AI', 'Clinical Trials'],
    topic: 'Machine Learning in Surgical Decision-Making',
    sessions: '3 sessions',
    tag: 'FEATURED',
    bio: 'Dr. Sofia Laurent combines her clinical practice in surgical oncology with cutting-edge AI research. Based at the International Centre for Robotic Surgery...',
    isHighlighted: true,
  },
  {
    id: '03',
    initials: 'DO',
    name: 'Dr. Daniel Okafor',
    role: 'Laparoscopic & Colorectal Surgeon',
    institute: 'Future Health Research Institute',
    country: 'Nigeria',
    flag: '🇳🇬',
    tags: ['Colorectal Surgery', 'Laparoscopy', 'Comparative Trials'],
    topic: 'Robotics vs Laparoscopy: A Clinical Comparison',
    sessions: '3 sessions',
    tag: 'FEATURED',
    bio: "Dr. Daniel Okafor is one of Africa's most respected colorectal surgeons, renowned for his evidence-based approach to surgical training, laparoscopic innovation...",
    isHighlighted: false,
  },
];

export default function SpeakersSection() {
  const navigate = useNavigate();

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

          {/* Right link: All speakers → (Navigates directly to dedicated /speakers page) */}
          <Link to="/speakers" className="kz-speakers-all-link" aria-label="View all conference speakers">
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
          </Link>
        </div>

        {/* 3 Featured Speakers Grid using the reusable SpeakerCard component */}
        <div className="kz-featured-speakers-grid">
          {HOME_FEATURED_SPEAKERS.map((spk) => (
            <SpeakerCard
              key={spk.id}
              initials={spk.initials}
              name={spk.name}
              role={spk.role}
              institute={spk.institute}
              country={spk.country}
              flag={spk.flag}
              tags={spk.tags}
              topic={spk.topic}
              sessions={spk.sessions}
              tag={spk.tag}
              bio={spk.bio}
              isHighlighted={spk.isHighlighted}
              onViewDetails={() => navigate('/speakers')}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
