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

  
    </section>
  );
}
