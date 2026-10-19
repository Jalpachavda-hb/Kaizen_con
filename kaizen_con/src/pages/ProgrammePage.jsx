import React, { useState, useEffect } from 'react';
import './ProgrammePage.css';

// Clean SVG Icons for categories
const IconPodium = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2a3 3 0 1 0 0 6 3 3 0 0 0 0-6z" />
    <path d="M6 21v-4a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v4" />
    <rect x="4" y="21" width="16" height="2" rx="1" />
  </svg>
);

const IconClamp = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="6" cy="18" r="3" />
    <circle cx="18" cy="18" r="3" />
    <path d="M8.5 16.5L16 6" />
    <path d="M15.5 16.5L8 6" />
  </svg>
);

const IconBrain = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 4.44-5.04z" />
    <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-4.44-5.04z" />
  </svg>
);

const IconGlobe = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <line x1="2" y1="12" x2="22" y2="12" />
    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10z" />
  </svg>
);

const IconUsers = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

const IconChart = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
    <polyline points="16 7 22 7 22 13" />
  </svg>
);

const IconMonitor = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
    <line x1="8" y1="21" x2="16" y2="21" />
    <line x1="12" y1="17" x2="12" y2="21" />
  </svg>
);

const IconNetwork = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="18" cy="5" r="3" />
    <circle cx="6" cy="12" r="3" />
    <circle cx="18" cy="19" r="3" />
    <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
    <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
  </svg>
);

const IconCoffee = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 8h1a4 4 0 0 1 0 8h-1" />
    <path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z" />
    <line x1="6" y1="1" x2="6" y2="4" />
    <line x1="10" y1="1" x2="10" y2="4" />
    <line x1="14" y1="1" x2="14" y2="4" />
  </svg>
);

const IconSiren = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2v3" />
    <path d="M5.2 6.2l2.1 2.1" />
    <path d="M18.8 6.2l-2.1 2.1" />
    <path d="M6 14a6 6 0 0 1 12 0v5H6v-5z" />
    <rect x="4" y="19" width="16" height="3" rx="1" />
  </svg>
);

const IconImage = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
    <circle cx="8.5" cy="8.5" r="1.5" />
    <polyline points="21 15 16 10 5 21" />
  </svg>
);

const IconDoctor = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

const IconGear = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
  </svg>
);

const IconEndoscope = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 13a4 4 0 0 0 8 0V4" />
    <circle cx="11" cy="4" r="2" />
    <path d="M13 10c0 4.5 4 5 7 5" />
    <circle cx="20" cy="15" r="1.5" />
  </svg>
);

const IconDatabase = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <ellipse cx="12" cy="5" rx="9" ry="3" />
    <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" />
    <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
  </svg>
);

const IconBarChart = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="20" x2="18" y2="10" />
    <line x1="12" y1="20" x2="12" y2="4" />
    <line x1="6" y1="20" x2="6" y2="14" />
  </svg>
);

const IconStar = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
);

// Map icons helper
const renderSessionIcon = (iconName) => {
  switch (iconName) {
    case 'podium': return <IconPodium />;
    case 'clamp': return <IconClamp />;
    case 'brain': return <IconBrain />;
    case 'globe': return <IconGlobe />;
    case 'users': return <IconUsers />;
    case 'chart': return <IconChart />;
    case 'monitor': return <IconMonitor />;
    case 'network': return <IconNetwork />;
    case 'coffee': return <IconCoffee />;
    case 'siren': return <IconSiren />;
    case 'image': return <IconImage />;
    case 'doctor': return <IconDoctor />;
    case 'gear': return <IconGear />;
    case 'endoscope': return <IconEndoscope />;
    case 'database': return <IconDatabase />;
    case 'barchart': return <IconBarChart />;
    case 'star': return <IconStar />;
    default: return <IconPodium />;
  }
};

// Complete Conference Programme Dataset Structured by Day
const CONFERENCE_DAYS_DATA = [
  {
    dayId: 'D1',
    dayNumber: 1,
    title: 'Day 1 — January 1, 2027',
    badgeMonth: 'JAN',
    badgeDate: '01',
    badgeYear: '2027',
    sessionsCount: '8 Sessions',
    sessions: [
      {
        id: 'd1-1',
        time: '09:00 - 10:00',
        duration: '60 min',
        icon: 'podium',
        title: 'Opening Keynote: The AI-Native Operating Room',
        desc: 'Exploring how AI is transforming surgical precision, decision-making, and patient outcomes in modern healthcare.',
        tags: [
          { label: 'ORAL', type: 'oral' },
          { label: 'AI IN HEALTHCARE', type: 'ai' }
        ],
        speaker: 'Dr. James Carter',
        venue: 'Main Auditorium'
      },
      {
        id: 'd1-2',
        time: '10:30 - 11:15',
        duration: '45 min',
        icon: 'clamp',
        title: 'Robotic Colorectal Surgery: Current Trends and Future Directions',
        desc: 'Latest advancements in robotic colorectal surgery with insights from global experts and live case examples.',
        tags: [
          { label: 'ORAL', type: 'oral' },
          { label: 'ROBOTIC SURGERY', type: 'robotic' }
        ],
        speaker: 'Dr. Maya Chen',
        venue: 'Hall A — Surgical Sciences'
      },
      {
        id: 'd1-3',
        time: '11:30 - 12:15',
        duration: '45 min',
        icon: 'brain',
        title: 'AI in Surgical Decision Making',
        desc: 'Understanding how AI models assist surgeons in real-time decision making with clinical use cases and validation studies.',
        tags: [
          { label: 'ORAL', type: 'oral' },
          { label: 'AI IN HEALTHCARE', type: 'ai' }
        ],
        speaker: 'Dr. Arjun Mehta',
        venue: 'Hall B — Technology & Innovation'
      },
      {
        id: 'd1-4',
        time: '14:00 - 14:45',
        duration: '45 min',
        icon: 'globe',
        title: 'Global Access to Advanced Surgery',
        desc: 'Discussion on democratizing access to advanced surgical care through AI, robotics and tele-mentoring.',
        tags: [
          { label: 'ORAL', type: 'oral' },
          { label: 'FUTURE OF HEALTHCARE', type: 'future' }
        ],
        speaker: 'Dr. Sofia Laurent',
        venue: 'Main Auditorium'
      },
      {
        id: 'd1-5',
        time: '15:00 - 15:45',
        duration: '45 min',
        icon: 'users',
        title: 'Panel Discussion: The Next Era of Surgical Innovation',
        desc: 'Industry leaders and clinicians discuss how AI and robotics will shape the next decade of surgery.',
        tags: [
          { label: 'PANEL', type: 'panel' }
        ],
        speaker: 'Dr. Daniel Okafor',
        venue: 'Hall A — Surgical Sciences'
      },
      {
        id: 'd1-6',
        time: '16:00 - 17:00',
        duration: '60 min',
        icon: 'chart',
        title: 'Future of Surgical Education in the AI Era',
        desc: 'How AI is reshaping training, simulation and competency assessment for the next generation of surgeons.',
        tags: [
          { label: 'ORAL', type: 'oral' },
          { label: 'DIGITAL HEALTH', type: 'digital' }
        ],
        speaker: 'Dr. Aisha Rahman',
        venue: 'Hall C — Digital Health'
      },
      {
        id: 'd1-7',
        time: '17:00 - 17:45',
        duration: '45 min',
        icon: 'monitor',
        title: 'Closing Session: Humanity in the Age of AI',
        desc: 'A thought-provoking discussion on ethics, human touch and the future of patient care in an AI-driven world.',
        tags: [
          { label: 'KEYNOTE', type: 'keynote' },
          { label: 'FUTURE OF HEALTHCARE', type: 'future' }
        ],
        speaker: 'Dr. Thomas Weber',
        venue: 'Main Auditorium'
      },
      {
        id: 'd1-8',
        time: '18:00 - 18:30',
        duration: '30 min',
        icon: 'network',
        title: 'Networking Reception',
        desc: 'An opportunity to connect with global experts, speakers and delegates over light refreshments.',
        tags: [
          { label: 'NETWORKING', type: 'networking' }
        ],
        speaker: 'Conference Hosts',
        venue: 'Exhibition Area'
      }
    ]
  },
  {
    dayId: 'D2',
    dayNumber: 2,
    title: 'Day 2 — January 2, 2027',
    badgeMonth: 'JAN',
    badgeDate: '02',
    badgeYear: '2027',
    sessionsCount: '7 Sessions',
    sessions: [
      {
        id: 'd2-1',
        time: '08:00 - 09:00',
        duration: '60 min',
        icon: 'coffee',
        title: 'Morning Networking & Coffee',
        desc: 'Join fellow delegates for an informal networking session over fresh morning coffee and breakfast.',
        tags: [
          { label: 'NETWORKING', type: 'networking' }
        ],
        speaker: 'Delegates & Faculty',
        venue: 'Main Lobby'
      },
      {
        id: 'd2-2',
        time: '09:00 - 10:00',
        duration: '60 min',
        icon: 'siren',
        title: 'AI Triage in Trauma Surgery',
        desc: 'How AI-assisted triage systems improve accuracy, workflow and patient outcomes in trauma care.',
        tags: [
          { label: 'ORAL', type: 'oral' },
          { label: 'AI IN HEALTHCARE', type: 'ai' }
        ],
        speaker: 'Dr. Maya Chen',
        venue: 'Main Auditorium'
      },
      {
        id: 'd2-3',
        time: '10:30 - 11:15',
        duration: '45 min',
        icon: 'image',
        title: 'Real-Time AI Imaging',
        desc: 'Live demonstration and clinical review of AI-augmented imaging systems used intraoperatively.',
        tags: [
          { label: 'ORAL', type: 'oral' },
          { label: 'MEDICAL IMAGING', type: 'imaging' }
        ],
        speaker: 'Dr. James Carter',
        venue: 'Hall B — Technology & Innovation'
      },
      {
        id: 'd2-4',
        time: '11:30 - 12:15',
        duration: '45 min',
        icon: 'doctor',
        title: 'Surgeon Training in the AI Era',
        desc: 'Simulation, data and certification models for next-generation surgical education programs.',
        tags: [
          { label: 'ORAL', type: 'oral' },
          { label: 'DIGITAL HEALTH', type: 'digital' }
        ],
        speaker: 'Dr. Aisha Rahman',
        venue: 'Hall C — Digital Health'
      },
      {
        id: 'd2-5',
        time: '14:00 - 14:45',
        duration: '45 min',
        icon: 'chart',
        title: 'Machine Learning for Surgical Outcomes',
        desc: 'Validated deep learning models for complication forecasting and risk-adjusted postoperative milestones.',
        tags: [
          { label: 'ORAL', type: 'oral' },
          { label: 'AI IN HEALTHCARE', type: 'ai' }
        ],
        speaker: 'Dr. Sofia Laurent',
        venue: 'Hall A — Surgical Sciences'
      },
      {
        id: 'd2-6',
        time: '15:00 - 15:45',
        duration: '45 min',
        icon: 'clamp',
        title: 'Robotic Low Anterior Resection: Live Case Session',
        desc: 'High-definition live case transmission featuring autonomic nerve preservation and intracorporeal anastomosis.',
        tags: [
          { label: 'ORAL', type: 'oral' },
          { label: 'ROBOTIC SURGERY', type: 'robotic' }
        ],
        speaker: 'Dr. Arjun Mehta',
        venue: 'Hall A — Surgical Sciences'
      },
      {
        id: 'd2-7',
        time: '16:00 - 17:00',
        duration: '60 min',
        icon: 'gear',
        title: 'Next-Generation Robotic Systems',
        desc: 'Comparative evaluation of emerging flexible platforms, open-architecture consoles, and telesurgery performance.',
        tags: [
          { label: 'ORAL', type: 'oral' },
          { label: 'ROBOTIC SURGERY', type: 'robotic' }
        ],
        speaker: 'Dr. Thomas Weber',
        venue: 'Hall B — Technology & Innovation'
      }
    ]
  },
  {
    dayId: 'D3',
    dayNumber: 3,
    title: 'Day 3 — January 3, 2027',
    badgeMonth: 'JAN',
    badgeDate: '03',
    badgeYear: '2027',
    sessionsCount: '6 Sessions',
    sessions: [
      {
        id: 'd3-1',
        time: '08:00 - 09:00',
        duration: '60 min',
        icon: 'coffee',
        title: 'Breakfast & Networking',
        desc: 'Final morning fellowship, research discussion roundtables, and international partnership meetings.',
        tags: [
          { label: 'NETWORKING', type: 'networking' }
        ],
        speaker: 'Delegates & Faculty',
        venue: 'Main Lobby'
      },
      {
        id: 'd3-2',
        time: '09:00 - 10:00',
        duration: '60 min',
        icon: 'monitor',
        title: 'The Autonomous Surgical Suite',
        desc: 'Exploring supervisory autonomy, human-in-the-loop safeguards, and algorithmic precision control paradigms.',
        tags: [
          { label: 'KEYNOTE', type: 'keynote' },
          { label: 'FUTURE OF HEALTHCARE', type: 'future' }
        ],
        speaker: 'Dr. Arjun Mehta',
        venue: 'Main Auditorium'
      },
      {
        id: 'd3-3',
        time: '10:30 - 11:15',
        duration: '45 min',
        icon: 'endoscope',
        title: 'AI-Assisted Endoscopy and Early Detection',
        desc: 'Computer vision diagnostics for mucosal neoplasia, microvascular characterization, and polyp detection.',
        tags: [
          { label: 'ORAL', type: 'oral' },
          { label: 'AI IN HEALTHCARE', type: 'ai' }
        ],
        speaker: 'Dr. Maya Chen',
        venue: 'Hall A — Surgical Sciences'
      },
      {
        id: 'd3-4',
        time: '11:30 - 12:15',
        duration: '45 min',
        icon: 'database',
        title: 'Surgical Data Science and Predictive Analytics',
        desc: 'Federated clinical learning, video telemetry analytics, and multi-center registry insights.',
        tags: [
          { label: 'ORAL', type: 'oral' },
          { label: 'TECHNOLOGY & INNOVATION', type: 'tech' }
        ],
        speaker: 'Dr. Marcus Vance',
        venue: 'Hall B — Technology & Innovation'
      },
      {
        id: 'd3-5',
        time: '14:00 - 14:45',
        duration: '45 min',
        icon: 'barchart',
        title: 'Healthcare Economics in the AI Era',
        desc: 'Value-based procurement, hospital ROI modeling, reimbursement shifts, and robotic investment feasibility.',
        tags: [
          { label: 'ORAL', type: 'oral' },
          { label: 'HEALTHCARE ECONOMICS', type: 'economics' }
        ],
        speaker: 'Dr. Daniel Okafor',
        venue: 'Hall C — Digital Health'
      },
      {
        id: 'd3-6',
        time: '16:00 - 17:00',
        duration: '60 min',
        icon: 'star',
        title: 'Closing Keynote & Valedictory Session',
        desc: 'Closing remarks, ethical mandates for medical AI, and KaizenCon 2027 clinical summary.',
        tags: [
          { label: 'KEYNOTE', type: 'keynote' },
          { label: 'FUTURE OF HEALTHCARE', type: 'future' }
        ],
        speaker: 'Dr. Sofia Laurent & Panel',
        venue: 'Main Auditorium'
      }
    ]
  }
];

export default function ProgrammePage() {
  const [selectedSession, setSelectedSession] = useState(null);

  // Close modal on Escape
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setSelectedSession(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="kz-programme-page-wrapper">
      <div className="kz-programme-container">

        {/* ====================================================
            1. PAGE HEADER (Matches screenshot top section)
           ==================================================== */}
        <header className="kz-programme-header">
          <div className="kz-programme-header-left">
            {/* Red / Magenta Schedule Tag with Red Accent Dash */}
            <div className="kz-schedule-badge-row">
              <span className="kz-schedule-dash" aria-hidden="true" />
              <span className="kz-schedule-pill">SCHEDULE</span>
            </div>

            {/* Main Title */}
            <h1 className="kz-programme-main-title">Programme at a Glance</h1>

            {/* Subtitle */}
            <p className="kz-programme-subtitle">
              Three days of groundbreaking talks, live surgeries, AI innovations and expert discussions.
            </p>
          </div>

          {/* Right Info Meta (Calendar & Location with direct links) */}
          <div className="kz-programme-header-right">
            {/* Calendar Meta */}
            <div className="kz-header-meta-item">
              <span className="kz-header-meta-icon" aria-hidden="true">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                  <line x1="16" y1="2" x2="16" y2="6" />
                  <line x1="8" y1="2" x2="8" y2="6" />
                  <line x1="3" y1="10" x2="21" y2="10" />
                </svg>
              </span>
              <div className="kz-header-meta-text">
                <span className="kz-header-meta-primary">1 – 3 January 2027</span>
              </div>
            </div>

            <span className="kz-header-meta-divider" aria-hidden="true" />

            {/* Location Meta */}
            <div className="kz-header-meta-item">
              <span className="kz-header-meta-icon" aria-hidden="true">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
              </span>
              <div className="kz-header-meta-text">
                <span className="kz-header-meta-primary">International Conference Centre</span>
                <span className="kz-header-meta-secondary">Ahmedabad, India &rarr;</span>
              </div>
            </div>
          </div>
        </header>

        {/* ====================================================
            2. DAY-BY-DAY ROW SECTIONS WITH TIMELINE RAIL
           ==================================================== */}
        <main className="kz-programme-days-stack" id="schedule">
          {CONFERENCE_DAYS_DATA.map((dayData, dayIdx) => (
            <section key={dayData.dayId} className="kz-day-section-row">
              
              {/* Left Timeline Rail Column with D1 / D2 / D3 Badge and Dots */}
              <div className="kz-timeline-date-column" aria-hidden="true">
                {/* Square Date Box */}
                <div className="kz-date-badge-box">
                  <div className="kz-date-badge-top">{dayData.dayId}</div>
                  <div className="kz-date-badge-bottom">
                    <span className="kz-badge-month">{dayData.badgeMonth}</span>
                    <span className="kz-badge-date">{dayData.badgeDate}</span>
                    <span className="kz-badge-year">{dayData.badgeYear}</span>
                  </div>
                </div>

                {/* Vertical Timeline Track Line */}
                <div className="kz-timeline-vertical-line">
                  <span className="kz-timeline-track-dot dot-1" />
                  <span className="kz-timeline-track-dot dot-2" />
                </div>
              </div>

              {/* Right Content Column (Day Header & Cards Grid) */}
              <div className="kz-day-content-column">
                
                {/* Day Header Row */}
                <div className="kz-day-section-header">
                  <span className="kz-mobile-day-indicator">{dayData.dayId}</span>
                  <h2 className="kz-day-section-title">{dayData.title}</h2>
                  <span className="kz-day-sessions-badge">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <rect x="3" y="4" width="18" height="18" rx="2" />
                      <line x1="16" y1="2" x2="16" y2="6" />
                      <line x1="8" y1="2" x2="8" y2="6" />
                      <line x1="3" y1="10" x2="21" y2="10" />
                    </svg>
                    <span>{dayData.sessionsCount}</span>
                  </span>
                </div>

                {/* Cards Grid: 4 Cards per Row (Responsive) */}
                <div className="kz-sessions-responsive-grid">
                  {dayData.sessions.map((session) => (
                    <article
                      key={session.id}
                      className="kz-session-card-block"
                      onClick={() => setSelectedSession(session)}
                    >
                      {/* Top Meta Row (Icon + Time + Duration) */}
                      <div className="kz-card-top-row">
                        <div className="kz-card-icon-badge" aria-hidden="true">
                          {renderSessionIcon(session.icon)}
                        </div>

                        <div className="kz-card-time-wrap">
                          <span className="kz-card-time-text">{session.time}</span>
                          <span className="kz-card-duration-chip">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                              <circle cx="12" cy="12" r="10" />
                              <polyline points="12 6 12 12 16 14" />
                            </svg>
                            <span>{session.duration}</span>
                          </span>
                        </div>
                      </div>

                      {/* Session Title */}
                      <h3 className="kz-card-title">{session.title}</h3>

                      {/* Excerpt Description */}
                      <p className="kz-card-description">{session.desc}</p>

                      {/* Category Tag Pills */}
                      <div className="kz-card-tags-row">
                        {session.tags.map((tagItem, tIdx) => (
                          <span
                            key={tIdx}
                            className={`kz-card-pill kz-pill-${tagItem.type}`}
                          >
                            {tagItem.label}
                          </span>
                        ))}
                      </div>

                      {/* Bottom Row: Speaker Name & Venue (NO DOCTOR IMAGES) + Arrow Button */}
                      <div className="kz-card-bottom-row">
                        <div className="kz-card-speaker-venue-meta">
                          {session.speaker && (
                            <span className="kz-card-speaker-name">{session.speaker}</span>
                          )}
                          <div className="kz-card-venue-row">
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                              <circle cx="12" cy="10" r="3" />
                            </svg>
                            <span>{session.venue}</span>
                          </div>
                        </div>

                        {/* Arrow Action Button */}
                        <button
                          type="button"
                          className="kz-card-arrow-btn"
                          aria-label={`View details for ${session.title}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedSession(session);
                          }}
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="5" y1="12" x2="19" y2="12" />
                            <polyline points="12 5 19 12 12 19" />
                          </svg>
                        </button>
                      </div>
                    </article>
                  ))}
                </div>
              </div>
            </section>
          ))}
        </main>
      </div>

      {/* ====================================================
          SESSION DETAIL MODAL
         ==================================================== */}
      {selectedSession && (
        <div className="kz-session-modal-backdrop" onClick={() => setSelectedSession(null)}>
          <div
            className="kz-session-modal-container"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="kz-modal-session-title"
          >
            {/* Modal Header */}
            <div className="kz-modal-header">
              <div className="kz-modal-tag-row">
                {selectedSession.tags && selectedSession.tags.map((tagItem, idx) => (
                  <span key={idx} className={`kz-card-pill kz-pill-${tagItem.type}`}>
                    {tagItem.label}
                  </span>
                ))}
                <span className="kz-modal-time-badge">
                  {selectedSession.time} ({selectedSession.duration})
                </span>
              </div>

              <button
                type="button"
                className="kz-modal-close-btn"
                onClick={() => setSelectedSession(null)}
                aria-label="Close dialog"
              >
                &times;
              </button>
            </div>

            {/* Modal Body */}
            <div className="kz-modal-body">
              <h2 id="kz-modal-session-title" className="kz-modal-title">
                {selectedSession.title}
              </h2>

              <div className="kz-modal-meta-grid">
                <div className="kz-modal-meta-cell">
                  <span className="kz-modal-meta-label">Venue</span>
                  <span className="kz-modal-meta-val">{selectedSession.venue}</span>
                </div>

                <div className="kz-modal-meta-cell">
                  <span className="kz-modal-meta-label">Faculty / Speaker</span>
                  <span className="kz-modal-meta-val">{selectedSession.speaker}</span>
                </div>
              </div>

              <div className="kz-modal-section">
                <h4 className="kz-modal-section-heading">Overview</h4>
                <p className="kz-modal-desc-text">{selectedSession.desc}</p>
              </div>

              <div className="kz-modal-section">
                <h4 className="kz-modal-section-heading">Learning Objectives</h4>
                <ul className="kz-modal-bullets">
                  <li>Review clinical evidence, indications, and workflow integration paradigms.</li>
                  <li>Identify patient safety guidelines and risk stratification strategies.</li>
                  <li>Interactive discussion with operating faculty and researchers.</li>
                </ul>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="kz-modal-footer">
              <button
                type="button"
                className="kz-modal-dismiss-btn"
                onClick={() => setSelectedSession(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
