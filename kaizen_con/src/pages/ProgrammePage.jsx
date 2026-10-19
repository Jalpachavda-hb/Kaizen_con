import React, { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  LuCoffee,
  LuUser,
  LuScissors,
  LuBrain,
  LuGlobe,
  LuUsers,
  LuBell,
  LuImage,
  LuTrendingUp,
  LuSettings,
  LuMonitor,
  LuActivity,
  LuDatabase,
  LuChartBar,
  LuStar,
  LuPresentation,
  LuNetwork,
  LuCalendar,
  LuMapPin,
  LuClock,
  LuChevronRight,
  LuArrowRight,
  LuSearch,
  LuFilter,
  LuTag,
  LuMic,
  LuCompass,
  LuX,
  LuLayoutGrid,
  LuList
} from 'react-icons/lu';
import './ProgrammePage.css';

// Helper function to render React Icons dynamically
const renderReactIcon = (iconName, size = 20) => {
  switch (iconName) {
    case 'coffee': return <LuCoffee size={size} />;
    case 'doctor': return <LuUser size={size} />;
    case 'clamp': return <LuScissors size={size} />;
    case 'brain': return <LuBrain size={size} />;
    case 'globe': return <LuGlobe size={size} />;
    case 'users': return <LuUsers size={size} />;
    case 'siren': return <LuBell size={size} />;
    case 'image': return <LuImage size={size} />;
    case 'chart': return <LuTrendingUp size={size} />;
    case 'gear': return <LuSettings size={size} />;
    case 'monitor': return <LuMonitor size={size} />;
    case 'endoscope': return <LuActivity size={size} />;
    case 'database': return <LuDatabase size={size} />;
    case 'barchart': return <LuChartBar size={size} />;
    case 'star': return <LuStar size={size} />;
    case 'podium': return <LuPresentation size={size} />;
    case 'network': return <LuNetwork size={size} />;
    default: return <LuPresentation size={size} />;
  }
};

// =========================================================================
// DATASET 1: "AT A GLANCE" 3-COLUMN VIEW (Exact Match to User's Screenshot 2)
// =========================================================================
const GLANCE_DAYS_DATA = [
  {
    dayNumber: 1,
    dayTitle: 'Day 1',
    dayOfWeek: 'Friday, January 1, 2027',
    stats: {
      sessionsCount: '8',
      sessionsLabel: 'Sessions',
      speakersCount: '12',
      speakersLabel: 'Speakers',
      tracksCount: '4',
      tracksLabel: 'Tracks'
    },
    sessions: [
      {
        id: 'glance-d1-1',
        timeStart: '08:00',
        timeEnd: '09:00',
        title: 'Registration & Welcome Tea',
        hall: 'Main Auditorium',
        category: 'welcome',
        categoryLabel: 'WELCOME & REGISTRATION',
        cardColor: '#3b82f6',
        cardBg: '#ffffff',
        badgeBg: '#eff6ff',
        badgeColor: '#3b82f6',
        tagBg: '#f8fafc',
        tagColor: '#64748b',
        tagBorder: '#e2e8f0',
        icon: 'coffee',
        speaker: 'Registration & Hospitality Committee',
        description: 'Collection of registration materials, AI delegate pass sync, digital badge issuance, and morning welcome tea.'
      },
      {
        id: 'glance-d1-2',
        timeStart: '09:00',
        timeEnd: '10:00',
        title: 'Opening Keynote: The AI-Native Operating Room',
        hall: 'Main Auditorium',
        category: 'ai',
        categoryLabel: 'AI IN HEALTHCARE',
        cardColor: '#f43f5e',
        cardBg: '#fffbfb',
        badgeBg: '#fff1f2',
        badgeColor: '#f43f5e',
        tagBg: '#fff1f2',
        tagColor: '#f43f5e',
        tagBorder: '#ffe4e6',
        icon: 'doctor',
        speaker: 'Dr. James Carter',
        description: 'Pioneering lecture on how intraoperative machine learning, autonomous tissue tracking, and ambient clinical intelligence transform surgical suites.'
      },
      {
        id: 'glance-d1-3',
        timeStart: '10:30',
        timeEnd: '11:15',
        title: 'Robotic Colorectal Surgery: Current Trends and Future Directions',
        hall: 'Hall A — Surgical Sciences',
        category: 'robotic',
        categoryLabel: 'ROBOTIC SURGERY',
        cardColor: '#3b82f6',
        cardBg: '#f8faff',
        badgeBg: '#eff6ff',
        badgeColor: '#3b82f6',
        tagBg: '#eff6ff',
        tagColor: '#3b82f6',
        tagBorder: '#dbeafe',
        icon: 'clamp',
        speaker: 'Dr. Maya Chen',
        description: 'Clinical comparative analysis of single-port versus multi-arm robotic platforms, oncological lymph node harvests, and ergonomic surgeon longevity.'
      },
      {
        id: 'glance-d1-4',
        timeStart: '11:30',
        timeEnd: '12:15',
        title: 'AI in Surgical Decision Making',
        hall: 'Hall B — Technology & Innovation',
        category: 'ai',
        categoryLabel: 'AI IN HEALTHCARE',
        cardColor: '#a855f7',
        cardBg: '#faf7fd',
        badgeBg: '#faf5ff',
        badgeColor: '#a855f7',
        tagBg: '#fff1f2',
        tagColor: '#f43f5e',
        tagBorder: '#ffe4e6',
        icon: 'brain',
        speaker: 'Dr. Arjun Mehta',
        description: 'Real-time machine learning risk calculators, microvascular perfusion indicators, and algorithmic safeguards against intraoperative adverse events.'
      },
      {
        id: 'glance-d1-5',
        timeStart: '14:00',
        timeEnd: '14:45',
        title: 'Global Access to Advanced Surgery',
        hall: 'Main Auditorium',
        category: 'future',
        categoryLabel: 'FUTURE OF HEALTHCARE',
        cardColor: '#10b981',
        cardBg: '#f7fbf8',
        badgeBg: '#ecfdf5',
        badgeColor: '#10b981',
        tagBg: '#ecfdf5',
        tagColor: '#10b981',
        tagBorder: '#a7f3d0',
        icon: 'globe',
        speaker: 'Dr. Sofia Laurent',
        description: 'Overcoming geographic and economic surgical disparities through telerobotics, decentralized simulation hubs, and low-latency satellite clinical links.'
      },
      {
        id: 'glance-d1-6',
        timeStart: '16:00',
        timeEnd: '17:00',
        title: 'Panel Discussion: The Next Era of Surgical Innovation',
        hall: 'Main Auditorium',
        category: 'panel',
        categoryLabel: 'PANEL',
        cardColor: '#f97316',
        cardBg: '#fefaf6',
        badgeBg: '#fff7ed',
        badgeColor: '#f97316',
        tagBg: '#fff7ed',
        tagColor: '#f97316',
        tagBorder: '#fed7aa',
        icon: 'users',
        speaker: 'Dr. Daniel Okafor & Panel',
        description: 'Multidisciplinary consensus panel discussing regulatory horizons, surgeon autonomy in automated procedures, and patient-centered robotics.'
      }
    ]
  },
  {
    dayNumber: 2,
    dayTitle: 'Day 2',
    dayOfWeek: 'Saturday, January 2, 2027',
    stats: {
      sessionsCount: '7',
      sessionsLabel: 'Sessions',
      speakersCount: '10',
      speakersLabel: 'Speakers',
      tracksCount: '4',
      tracksLabel: 'Tracks'
    },
    sessions: [
      {
        id: 'glance-d2-1',
        timeStart: '08:00',
        timeEnd: '09:00',
        title: 'Morning Networking & Coffee',
        hall: 'Main Lobby',
        category: 'welcome',
        categoryLabel: 'NETWORKING',
        cardColor: '#3b82f6',
        cardBg: '#f8faff',
        badgeBg: '#eff6ff',
        badgeColor: '#3b82f6',
        tagBg: '#f8fafc',
        tagColor: '#64748b',
        tagBorder: '#e2e8f0',
        icon: 'coffee',
        speaker: 'Conference Hosts',
        description: 'Join fellow delegates for an informal morning networking session and preview of Day 2 surgical breakout tracks over coffee.'
      },
      {
        id: 'glance-d2-2',
        timeStart: '09:00',
        timeEnd: '10:00',
        title: 'AI Triage in Trauma Surgery',
        hall: 'Main Auditorium',
        category: 'ai',
        categoryLabel: 'AI IN HEALTHCARE',
        cardColor: '#f43f5e',
        cardBg: '#fffbfb',
        badgeBg: '#fff1f2',
        badgeColor: '#f43f5e',
        tagBg: '#fff1f2',
        tagColor: '#f43f5e',
        tagBorder: '#ffe4e6',
        icon: 'siren',
        speaker: 'Dr. Maya Chen',
        description: 'How AI-assisted triage systems improve accuracy, prioritize polytrauma workflow, and optimize patient outcomes in emergency care.'
      },
      {
        id: 'glance-d2-3',
        timeStart: '10:30',
        timeEnd: '11:15',
        title: 'Real-Time AI in Medical Imaging',
        hall: 'Hall B — Technology & Innovation',
        category: 'imaging',
        categoryLabel: 'MEDICAL IMAGING',
        cardColor: '#0ea5e9',
        cardBg: '#f8faff',
        badgeBg: '#f0f9ff',
        badgeColor: '#0ea5e9',
        tagBg: '#f0f9ff',
        tagColor: '#0ea5e9',
        tagBorder: '#bae6fd',
        icon: 'image',
        speaker: 'Dr. James Carter',
        description: 'Live demonstration and clinical review of AI-augmented intraoperative imaging systems used intraoperatively for cancer margins.'
      },
      {
        id: 'glance-d2-4',
        timeStart: '11:30',
        timeEnd: '12:15',
        title: 'Surgeon Training in the AI Era',
        hall: 'Hall C — Digital Health',
        category: 'digital',
        categoryLabel: 'DIGITAL HEALTH',
        cardColor: '#22c55e',
        cardBg: '#f7fbf8',
        badgeBg: '#f0fdf4',
        badgeColor: '#22c55e',
        tagBg: '#f0fdf4',
        tagColor: '#22c55e',
        tagBorder: '#bbf7d0',
        icon: 'doctor',
        speaker: 'Dr. Aisha Rahman',
        description: 'Simulation, data and certification for next-generation surgical education, haptic feedback models, and telemetry evaluation.'
      },
      {
        id: 'glance-d2-5',
        timeStart: '14:00',
        timeEnd: '14:45',
        title: 'Machine Learning for Surgical Outcomes',
        hall: 'Hall A — Surgical Sciences',
        category: 'ai',
        categoryLabel: 'AI IN HEALTHCARE',
        cardColor: '#a855f7',
        cardBg: '#faf7fd',
        badgeBg: '#faf5ff',
        badgeColor: '#a855f7',
        tagBg: '#fff1f2',
        tagColor: '#f43f5e',
        tagBorder: '#ffe4e6',
        icon: 'chart',
        speaker: 'Dr. Arjun Mehta',
        description: 'Validated predictive algorithms predicting post-operative recovery, complication risks, and personalized clinical intervention paths.'
      },
      {
        id: 'glance-d2-6',
        timeStart: '15:00',
        timeEnd: '15:45',
        title: 'Robotic Low Anterior Resection: Live Case Session',
        hall: 'Hall A — Surgical Sciences',
        category: 'robotic',
        categoryLabel: 'ROBOTIC SURGERY',
        cardColor: '#3b82f6',
        cardBg: '#f8faff',
        badgeBg: '#eff6ff',
        badgeColor: '#3b82f6',
        tagBg: '#eff6ff',
        tagColor: '#3b82f6',
        tagBorder: '#dbeafe',
        icon: 'clamp',
        speaker: 'Dr. Maya Chen',
        description: 'Live broadcast of robotic deep pelvic dissection with real-time nerve mapping, autonomic preservation, and robotic endostapling.'
      },
      {
        id: 'glance-d2-7',
        timeStart: '16:00',
        timeEnd: '17:00',
        title: 'Next-Generation Robotic Systems',
        hall: 'Hall B — Technology & Innovation',
        category: 'robotic',
        categoryLabel: 'ROBOTIC SURGERY',
        cardColor: '#3b82f6',
        cardBg: '#f8faff',
        badgeBg: '#eff6ff',
        badgeColor: '#3b82f6',
        tagBg: '#eff6ff',
        tagColor: '#3b82f6',
        tagBorder: '#dbeafe',
        icon: 'gear',
        speaker: 'Dr. Sofia Laurent',
        description: 'Hands-on review of modular arm robotics, flexible endoluminal instrumentation, and tele-surgery performance over 5G networks.'
      }
    ]
  },
  {
    dayNumber: 3,
    dayTitle: 'Day 3',
    dayOfWeek: 'Sunday, January 3, 2027',
    stats: {
      sessionsCount: '6',
      sessionsLabel: 'Sessions',
      speakersCount: '9',
      speakersLabel: 'Speakers',
      tracksCount: '3',
      tracksLabel: 'Tracks'
    },
    sessions: [
      {
        id: 'glance-d3-1',
        timeStart: '08:00',
        timeEnd: '09:00',
        title: 'Breakfast & Networking',
        hall: 'Main Lobby',
        category: 'welcome',
        categoryLabel: 'NETWORKING',
        cardColor: '#3b82f6',
        cardBg: '#f8faff',
        badgeBg: '#eff6ff',
        badgeColor: '#3b82f6',
        tagBg: '#f8fafc',
        tagColor: '#64748b',
        tagBorder: '#e2e8f0',
        icon: 'coffee',
        speaker: 'Conference Hosts',
        description: 'Morning fellowship, research abstract viewing, and inter-institutional collaboration meetings.'
      },
      {
        id: 'glance-d3-2',
        timeStart: '09:00',
        timeEnd: '10:00',
        title: 'The Autonomous Surgical Suite',
        hall: 'Main Auditorium',
        category: 'future',
        categoryLabel: 'FUTURE OF HEALTHCARE',
        cardColor: '#10b981',
        cardBg: '#f7fbf8',
        badgeBg: '#ecfdf5',
        badgeColor: '#10b981',
        tagBg: '#ecfdf5',
        tagColor: '#10b981',
        tagBorder: '#a7f3d0',
        icon: 'monitor',
        speaker: 'Dr. Daniel Okafor',
        description: 'Exploring supervisory surgical automation: suturing algorithms, tension sensing, and safety architectures.'
      },
      {
        id: 'glance-d3-3',
        timeStart: '10:30',
        timeEnd: '11:15',
        title: 'AI-Assisted Endoscopy and Early Detection',
        hall: 'Hall A — Surgical Sciences',
        category: 'ai',
        categoryLabel: 'AI IN HEALTHCARE',
        cardColor: '#f43f5e',
        cardBg: '#fffbfb',
        badgeBg: '#fff1f2',
        badgeColor: '#f43f5e',
        tagBg: '#fff1f2',
        tagColor: '#f43f5e',
        tagBorder: '#ffe4e6',
        icon: 'endoscope',
        speaker: 'Dr. Arjun Mehta',
        description: 'Real-time computer vision detection of flat adenomas, Barrett esophagus dysplastic surveillance, and microvascular pattern characterization.'
      },
      {
        id: 'glance-d3-4',
        timeStart: '11:30',
        timeEnd: '12:15',
        title: 'Surgical Data Science and Predictive Analytics',
        hall: 'Hall B — Technology & Innovation',
        category: 'tech',
        categoryLabel: 'TECHNOLOGY & INNOVATION',
        cardColor: '#3b82f6',
        cardBg: '#f8faff',
        badgeBg: '#eff6ff',
        badgeColor: '#3b82f6',
        tagBg: '#eff6ff',
        tagColor: '#3b82f6',
        tagBorder: '#dbeafe',
        icon: 'database',
        speaker: 'Dr. Sofia Laurent',
        description: 'Large registry models, federated learning, and intraoperative risk estimation from structured metadata.'
      },
      {
        id: 'glance-d3-5',
        timeStart: '14:00',
        timeEnd: '14:45',
        title: 'Healthcare Economics in the AI Era',
        hall: 'Hall C — Digital Health',
        category: 'economics',
        categoryLabel: 'HEALTHCARE ECONOMICS',
        cardColor: '#eab308',
        cardBg: '#fefaf6',
        badgeBg: '#fefce8',
        badgeColor: '#eab308',
        tagBg: '#fefce8',
        tagColor: '#eab308',
        tagBorder: '#fef08a',
        icon: 'barchart',
        speaker: 'Dr. James Carter',
        description: 'Cost-utility analysis, hospital procurement benchmarks, and reimbursement pathways for AI diagnostic pipelines.'
      },
      {
        id: 'glance-d3-6',
        timeStart: '16:00',
        timeEnd: '17:00',
        title: 'Closing Keynote: Humanity in the Age of AI',
        hall: 'Main Auditorium',
        category: 'future',
        categoryLabel: 'FUTURE OF HEALTHCARE',
        cardColor: '#a855f7',
        cardBg: '#faf7fd',
        badgeBg: '#faf5ff',
        badgeColor: '#a855f7',
        tagBg: '#ecfdf5',
        tagColor: '#10b981',
        tagBorder: '#a7f3d0',
        icon: 'star',
        speaker: 'Dr. Thomas Weber',
        description: 'Conference summary, best scientific awards, and roadmap for robotic AI surgery through 2030.'
      }
    ]
  }
];

// =========================================================================
// DATASET 2: "SESSIONS" (4-COLUMN CARD GRID DESIGN)
// =========================================================================
const SESSIONS_GRID_DAYS = [
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
        id: 'grid-d1-1',
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
        id: 'grid-d1-2',
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
        id: 'grid-d1-3',
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
        id: 'grid-d1-4',
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
        id: 'grid-d1-5',
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
        id: 'grid-d1-6',
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
        id: 'grid-d1-7',
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
        id: 'grid-d1-8',
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
        id: 'grid-d2-1',
        time: '08:00 - 09:00',
        duration: '60 min',
        icon: 'coffee',
        title: 'Morning Networking & Coffee',
        desc: 'Join fellow delegates for an informal networking session over coffee before surgical breakout sessions.',
        tags: [
          { label: 'NETWORKING', type: 'networking' }
        ],
        speaker: 'Conference Hosts',
        venue: 'Main Lobby'
      },
      {
        id: 'grid-d2-2',
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
        id: 'grid-d2-3',
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
        id: 'grid-d2-4',
        time: '11:30 - 12:15',
        duration: '45 min',
        icon: 'doctor',
        title: 'Surgeon Training in the AI Era',
        desc: 'Simulation, data and certification for next-generation surgical education and VR tactile models.',
        tags: [
          { label: 'ORAL', type: 'oral' },
          { label: 'DIGITAL HEALTH', type: 'digital' }
        ],
        speaker: 'Dr. Aisha Rahman',
        venue: 'Hall C — Digital Health'
      },
      {
        id: 'grid-d2-5',
        time: '14:00 - 14:45',
        duration: '45 min',
        icon: 'chart',
        title: 'Machine Learning for Surgical Outcomes',
        desc: 'Predictive algorithms predicting post-operative recovery, complication risks, and personalized interventions.',
        tags: [
          { label: 'ORAL', type: 'oral' },
          { label: 'AI IN HEALTHCARE', type: 'ai' }
        ],
        speaker: 'Dr. Arjun Mehta',
        venue: 'Hall A — Surgical Sciences'
      },
      {
        id: 'grid-d2-6',
        time: '15:00 - 15:45',
        duration: '45 min',
        icon: 'clamp',
        title: 'Robotic Low Anterior Resection: Live Case',
        desc: 'High-definition 3D live surgical transmission featuring pelvic dissection and robotic endoluminal stapling.',
        tags: [
          { label: 'LIVE SURGERY', type: 'robotic' },
          { label: 'ROBOTIC SURGERY', type: 'robotic' }
        ],
        speaker: 'Dr. Maya Chen',
        venue: 'Hall A — Surgical Sciences'
      },
      {
        id: 'grid-d2-7',
        time: '16:00 - 17:00',
        duration: '60 min',
        icon: 'gear',
        title: 'Next-Generation Robotic Systems',
        desc: 'Hands-on review of modular arm robotics, flexible instrumentation, and tele-surgery performance over 5G.',
        tags: [
          { label: 'ORAL', type: 'oral' },
          { label: 'ROBOTIC SURGERY', type: 'robotic' }
        ],
        speaker: 'Dr. Sofia Laurent',
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
        id: 'grid-d3-1',
        time: '08:00 - 09:00',
        duration: '60 min',
        icon: 'coffee',
        title: 'Breakfast & Networking',
        desc: 'Morning fellowship, research abstract viewing, and inter-institutional collaboration meetings.',
        tags: [
          { label: 'NETWORKING', type: 'networking' }
        ],
        speaker: 'Conference Hosts',
        venue: 'Main Lobby'
      },
      {
        id: 'grid-d3-2',
        time: '09:00 - 10:00',
        duration: '60 min',
        icon: 'monitor',
        title: 'The Autonomous Surgical Suite',
        desc: 'Exploring supervisory surgical automation: suturing algorithms, tension sensing, and safety architectures.',
        tags: [
          { label: 'ORAL', type: 'oral' },
          { label: 'FUTURE OF HEALTHCARE', type: 'future' }
        ],
        speaker: 'Dr. Daniel Okafor',
        venue: 'Main Auditorium'
      },
      {
        id: 'grid-d3-3',
        time: '10:30 - 11:15',
        duration: '45 min',
        icon: 'endoscope',
        title: 'AI-Assisted Endoscopy and Early Detection',
        desc: 'Real-time computer vision detection of flat adenomas, dysplastic surveillance, and microvascular pattern recognition.',
        tags: [
          { label: 'ORAL', type: 'oral' },
          { label: 'AI IN HEALTHCARE', type: 'ai' }
        ],
        speaker: 'Dr. Arjun Mehta',
        venue: 'Hall A — Surgical Sciences'
      },
      {
        id: 'grid-d3-4',
        time: '11:30 - 12:15',
        duration: '45 min',
        icon: 'database',
        title: 'Surgical Data Science and Predictive Analytics',
        desc: 'Large registry models, federated learning, and intraoperative risk estimation from clinical metadata.',
        tags: [
          { label: 'ORAL', type: 'oral' },
          { label: 'TECHNOLOGY & INNOVATION', type: 'future' }
        ],
        speaker: 'Dr. Sofia Laurent',
        venue: 'Hall B — Technology & Innovation'
      },
      {
        id: 'grid-d3-5',
        time: '14:00 - 14:45',
        duration: '45 min',
        icon: 'barchart',
        title: 'Healthcare Economics in the AI Era',
        desc: 'Cost-utility analysis, hospital procurement benchmarks, and reimbursement pathways for AI diagnostic pipelines.',
        tags: [
          { label: 'HEALTHCARE ECONOMICS', type: 'future' }
        ],
        speaker: 'Dr. James Carter',
        venue: 'Hall C — Digital Health'
      },
      {
        id: 'grid-d3-6',
        time: '16:00 - 17:00',
        duration: '60 min',
        icon: 'star',
        title: 'Closing Keynote: Humanity in the Age of AI',
        desc: 'Conference summary, best scientific awards, and roadmap for robotic AI surgery through 2030.',
        tags: [
          { label: 'KEYNOTE', type: 'keynote' },
          { label: 'FUTURE OF HEALTHCARE', type: 'future' }
        ],
        speaker: 'Dr. Thomas Weber',
        venue: 'Main Auditorium'
      }
    ]
  }
];

export default function ProgrammePage() {
  const [activeTab, setActiveTab] = useState('glance');
  const [selectedTopic, setSelectedTopic] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTrack, setSelectedTrack] = useState('ALL');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [selectedSession, setSelectedSession] = useState(null);
  const [activeMobileDay, setActiveMobileDay] = useState(1);

  // Close modal and dropdown on Escape
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setSelectedSession(null);
        setIsFilterOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Topic bar pills exactly matching Screenshot 2
  const topicsBarItems = [
    { id: 'ALL', label: 'All' },
    { id: 'robotic', label: 'Robotic Surgery' },
    { id: 'ai', label: 'AI in Healthcare' },
    { id: 'colorectal', label: 'Colorectal Surgery' },
    { id: 'innovation', label: 'Surgical Innovation' },
    { id: 'future', label: 'Future of Healthcare' },
    { id: 'digital', label: 'Digital Health' },
    { id: 'imaging', label: 'Medical Imaging' },
    { id: 'economics', label: 'Healthcare Economics' }
  ];

  // Track filter dropdown items
  const allTracks = [
    { id: 'ALL', label: 'All Tracks' },
    { id: 'ai', label: 'AI in Healthcare' },
    { id: 'robotic', label: 'Robotic Surgery' },
    { id: 'future', label: 'Future of Healthcare' },
    { id: 'imaging', label: 'Medical Imaging' },
    { id: 'digital', label: 'Digital Health' },
    { id: 'panel', label: 'Panels & Debates' },
    { id: 'welcome', label: 'Networking & Welcome' }
  ];

  // Filtered dataset for Glance view
  const filteredGlanceProgramme = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return GLANCE_DAYS_DATA.map((day) => {
      const filteredSessions = day.sessions.filter((session) => {
        if (selectedTopic !== 'ALL') {
          const matchCat = session.category.toLowerCase().includes(selectedTopic.toLowerCase());
          const matchLabel = session.categoryLabel.toLowerCase().includes(selectedTopic.toLowerCase());
          const matchTitle = session.title.toLowerCase().includes(selectedTopic.toLowerCase());
          if (!matchCat && !matchLabel && !matchTitle) return false;
        }

        if (selectedTrack !== 'ALL') {
          if (!session.category.toLowerCase().includes(selectedTrack.toLowerCase())) return false;
        }

        if (!query) return true;
        const inTitle = session.title.toLowerCase().includes(query);
        const inHall = session.hall.toLowerCase().includes(query);
        const inTag = session.categoryLabel.toLowerCase().includes(query);
        const inSpeaker = session.speaker.toLowerCase().includes(query);
        const inDesc = session.description.toLowerCase().includes(query);

        return inTitle || inHall || inTag || inSpeaker || inDesc;
      });

      return {
        ...day,
        sessions: filteredSessions
      };
    });
  }, [searchQuery, selectedTrack, selectedTopic]);

  // Filtered dataset for Sessions view
  const filteredSessionsGrid = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return SESSIONS_GRID_DAYS.map((day) => {
      const filtered = day.sessions.filter((s) => {
        if (selectedTopic !== 'ALL') {
          const inTags = s.tags.some(t => t.label.toLowerCase().includes(selectedTopic.toLowerCase()) || t.type.toLowerCase().includes(selectedTopic.toLowerCase()));
          const inTitle = s.title.toLowerCase().includes(selectedTopic.toLowerCase());
          if (!inTags && !inTitle) return false;
        }

        if (!query) return true;
        const inTitle = s.title.toLowerCase().includes(query);
        const inVenue = s.venue.toLowerCase().includes(query);
        const inSpeaker = s.speaker.toLowerCase().includes(query);
        const inDesc = s.desc.toLowerCase().includes(query);
        const inTags = s.tags.some(t => t.label.toLowerCase().includes(query));

        return inTitle || inVenue || inSpeaker || inDesc || inTags;
      });

      return {
        ...day,
        sessions: filtered
      };
    });
  }, [searchQuery, selectedTopic]);

  return (
    <div className="kz-programme-page-wrapper">
      <div className="kz-programme-container">

        {/* ====================================================
            1. PAGE HEADER
           ==================================================== */}
        <header className="kz-programme-header">
          <div className="kz-programme-header-left">
            <div className="kz-schedule-badge-row">
              <span className="kz-schedule-dash" aria-hidden="true" />
              <span className="kz-schedule-pill">SCHEDULE</span>
            </div>

            <h1 className="kz-programme-main-title">Programme at a Glance</h1>

            <p className="kz-programme-subtitle">
              Three days of groundbreaking talks, live surgeries, AI innovations and expert discussions.
            </p>
          </div>

          {/* Right Info Meta (Calendar & Location with React Icons) */}
          <div className="kz-programme-header-right">
            <div className="kz-header-meta-item">
              <span className="kz-header-meta-icon" aria-hidden="true">
                <LuCalendar size={20} />
              </span>
              <div className="kz-header-meta-text">
                <span className="kz-header-meta-primary">1 – 3 January 2027</span>
              </div>
            </div>

            <span className="kz-header-meta-divider" aria-hidden="true" />

            <div className="kz-header-meta-item">
              <span className="kz-header-meta-icon" aria-hidden="true">
                <LuMapPin size={20} />
              </span>
              <div className="kz-header-meta-text">
                <span className="kz-header-meta-primary">International Conference Centre</span>
                <span className="kz-header-meta-secondary">Ahmedabad, India &rarr;</span>
              </div>
            </div>
          </div>
        </header>

        {/* ====================================================
            2. TOP CONTROLS BAR (AT A GLANCE / SESSIONS TABS, SEARCH, FILTER)
           ==================================================== */}
        <section className="kz-programme-controls-bar" aria-label="Programme Navigation and Filters">

          <div className="kz-programme-tabs-group" role="tablist">
            {/* 1. At a Glance Button */}
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'glance'}
              className={`kz-view-tab-btn ${activeTab === 'glance' ? 'is-active' : ''}`}
              onClick={() => setActiveTab('glance')}
            >
              <LuLayoutGrid size={16} />
              <span>At a Glance</span>
            </button>

            {/* 2. Sessions Button */}
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'sessions'}
              className={`kz-view-tab-btn ${activeTab === 'sessions' ? 'is-active' : ''}`}
              onClick={() => setActiveTab('sessions')}
            >
              <LuList size={16} />
              <span>Sessions</span>
            </button>

            {/* 3. Topics Button */}
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'topics'}
              className={`kz-view-tab-btn ${activeTab === 'topics' ? 'is-active' : ''}`}
              onClick={() => setActiveTab('topics')}
            >
              <LuTag size={16} />
              <span>Topics</span>
            </button>

            {/* 4. Speakers Button */}
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'speakers'}
              className={`kz-view-tab-btn ${activeTab === 'speakers' ? 'is-active' : ''}`}
              onClick={() => setActiveTab('speakers')}
            >
              <LuUsers size={16} />
              <span>Speakers</span>
            </button>

            {/* 5. Conference Website Link */}
            <Link to="/" className="kz-view-tab-btn kz-external-link-btn" title="Back to Conference Home">
              <LuGlobe size={16} />
              <span>Conference Website</span>
            </Link>
          </div>

          {/* Search Input & Filter Button */}
          <div className="kz-programme-search-filter-group">
            <div className="kz-search-input-wrapper">
              <span className="kz-search-icon" aria-hidden="true">
                <LuSearch size={16} />
              </span>
              <input
                type="text"
                className="kz-search-input"
                placeholder="Search sessions, topics, speakers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                aria-label="Search programme"
              />
              {searchQuery && (
                <button
                  type="button"
                  className="kz-search-clear-btn"
                  onClick={() => setSearchQuery('')}
                  aria-label="Clear search"
                >
                  <LuX size={16} />
                </button>
              )}
            </div>

            <div className="kz-filter-wrapper">
              <button
                type="button"
                className={`kz-filter-toggle-btn ${selectedTrack !== 'ALL' || isFilterOpen ? 'is-filtering' : ''}`}
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                aria-label="Filter programme options"
                aria-expanded={isFilterOpen}
              >
                <LuFilter size={17} />
                {selectedTrack !== 'ALL' && <span className="kz-filter-active-dot" />}
              </button>

              {isFilterOpen && (
                <div className="kz-filter-dropdown-menu">
                  <div className="kz-filter-dropdown-header">
                    <span>Filter by Track</span>
                    {selectedTrack !== 'ALL' && (
                      <button
                        type="button"
                        className="kz-filter-reset-link"
                        onClick={() => {
                          setSelectedTrack('ALL');
                          setIsFilterOpen(false);
                        }}
                      >
                        Reset
                      </button>
                    )}
                  </div>
                  <ul className="kz-filter-dropdown-list">
                    {allTracks.map((tr) => (
                      <li key={tr.id}>
                        <button
                          type="button"
                          className={`kz-filter-option-btn ${selectedTrack === tr.id ? 'is-selected' : ''}`}
                          onClick={() => {
                            setSelectedTrack(tr.id);
                            setIsFilterOpen(false);
                          }}
                        >
                          <span>{tr.label}</span>
                          {selectedTrack === tr.id && (
                            <LuChevronRight size={14} />
                          )}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* ====================================================
            3. TOPICS HORIZONTAL FILTER BAR (Matches User's Screenshot 2)
           ==================================================== */}
        <section className="kz-topics-horizontal-bar" aria-label="Topic Filter Pills">
          <span className="kz-topics-bar-label">TOPICS</span>
          <div className="kz-topics-pills-row">
            {topicsBarItems.map((topicItem) => {
              const isActive = selectedTopic === topicItem.id;
              return (
                <button
                  key={topicItem.id}
                  type="button"
                  className={`kz-topic-pill-chip ${isActive ? 'is-active' : ''}`}
                  onClick={() => setSelectedTopic(topicItem.id)}
                >
                  {topicItem.label}
                </button>
              );
            })}
          </div>
        </section>

        {/* Mobile Day Selector Pill Tabs */}
        <div className="kz-mobile-day-tabs" aria-label="Select conference day">
          <button
            type="button"
            className={`kz-mobile-day-btn ${activeMobileDay === 1 ? 'is-active' : ''}`}
            onClick={() => setActiveMobileDay(1)}
          >
            Day 1 (Jan 1)
          </button>
          <button
            type="button"
            className={`kz-mobile-day-btn ${activeMobileDay === 2 ? 'is-active' : ''}`}
            onClick={() => setActiveMobileDay(2)}
          >
            Day 2 (Jan 2)
          </button>
          <button
            type="button"
            className={`kz-mobile-day-btn ${activeMobileDay === 3 ? 'is-active' : ''}`}
            onClick={() => setActiveMobileDay(3)}
          >
            Day 3 (Jan 3)
          </button>
        </div>

        {/* ====================================================
            4. VIEW 1: "AT A GLANCE" 3-COLUMN TIMELINE (DEFAULT VIEW)
               Pixel-perfect match to User's Screenshot 2!
           ==================================================== */}
        {activeTab === 'glance' && (
          <main className="kz-programme-columns-grid">
            {filteredGlanceProgramme.map((dayCol) => {
              const isHiddenOnMobile = activeMobileDay !== dayCol.dayNumber;

              return (
                <div
                  key={dayCol.dayNumber}
                  className={`kz-day-column-card ${isHiddenOnMobile ? 'kz-hide-on-mobile' : ''}`}
                >
                  {/* Column Header */}
                  <div className="kz-day-column-header">
                    <div className="kz-day-header-left">
                      <h2 className="kz-day-title">{dayCol.dayTitle}</h2>
                      <span className="kz-day-date-label">{dayCol.dayOfWeek}</span>
                    </div>

                    {/* Stats Counters on Top Right */}
                    <div className="kz-day-stats-counters">
                      <div className="kz-stat-counter-box">
                        <span className="kz-stat-icon" aria-hidden="true">
                          <LuMic size={15} />
                        </span>
                        <span className="kz-stat-number">{dayCol.stats.sessionsCount}</span>
                        <span className="kz-stat-label">{dayCol.stats.sessionsLabel}</span>
                      </div>

                      <div className="kz-stat-counter-box">
                        <span className="kz-stat-icon" aria-hidden="true">
                          <LuUsers size={15} />
                        </span>
                        <span className="kz-stat-number">{dayCol.stats.speakersCount}</span>
                        <span className="kz-stat-label">{dayCol.stats.speakersLabel}</span>
                      </div>

                      <div className="kz-stat-counter-box">
                        <span className="kz-stat-icon" aria-hidden="true">
                          <LuCompass size={15} />
                        </span>
                        <span className="kz-stat-number">{dayCol.stats.tracksCount}</span>
                        <span className="kz-stat-label">{dayCol.stats.tracksLabel}</span>
                      </div>
                    </div>
                  </div>

                  {/* Sessions Timeline Track - Fits 6 events, scrolls if more than 6 */}
                  <div className="kz-day-timeline-body">
                    {dayCol.sessions.length === 0 ? (
                      <div className="kz-no-sessions-found">
                        <span>No sessions match the current search or topic filter.</span>
                      </div>
                    ) : (
                      dayCol.sessions.map((session, idx) => (
                        <div
                          key={session.id}
                          className="kz-glance-item-wrapper"
                          onClick={() => setSelectedSession({
                            title: session.title,
                            time: `${session.timeStart} – ${session.timeEnd}`,
                            duration: '45-60 min',
                            venue: session.hall,
                            speaker: session.speaker,
                            desc: session.description,
                            tags: session.categoryLabel ? [{ label: session.categoryLabel, type: session.category }] : []
                          })}
                        >
                          {/* Left Timeline Rail */}
                          <div className="kz-glance-timeline-rail" aria-hidden="true">
                            <span className="kz-glance-timeline-dot" />
                            {idx < dayCol.sessions.length - 1 && (
                              <span className="kz-glance-timeline-line" />
                            )}
                          </div>

                          {/* Time Block (08:00 / 09:00) */}
                          <div className="kz-glance-time-block">
                            <span className="kz-glance-time-start">{session.timeStart}</span>
                            <span className="kz-glance-time-end">{session.timeEnd}</span>
                          </div>

                          {/* Sleek Horizontal Card matching Screenshot 2 */}
                          <article
                            className="kz-glance-card"
                            style={{
                              borderLeft: `4px solid ${session.cardColor || '#aa2d7b'}`,
                              backgroundColor: session.cardBg || '#ffffff'
                            }}
                          >
                            {/* Left Icon Badge with React Icon */}
                            <div
                              className="kz-glance-icon-badge"
                              style={{
                                backgroundColor: session.badgeBg || '#f1f5f9',
                                color: session.badgeColor || '#1e293b'
                              }}
                              aria-hidden="true"
                            >
                              {renderReactIcon(session.icon, 20)}
                            </div>

                            {/* Middle Content Stack */}
                            <div className="kz-glance-card-content">
                              {session.categoryLabel && (
                                <span
                                  className="kz-glance-tag-pill"
                                  style={{
                                    backgroundColor: session.tagBg || '#f8fafc',
                                    color: session.tagColor || '#64748b',
                                    borderColor: session.tagBorder || '#e2e8f0'
                                  }}
                                >
                                  {session.categoryLabel}
                                </span>
                              )}
                              <h3 className="kz-glance-session-title">{session.title}</h3>
                            </div>

                            {/* Right Chevron Arrow */}
                            <div className="kz-glance-chevron" aria-hidden="true">
                              <LuChevronRight size={18} />
                            </div>
                          </article>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </main>
        )}

        {/* ====================================================
            5. VIEW 2: "SESSIONS" (4-COLUMN CARD GRID DESIGN)
               Triggered when clicking the [Sessions] tab!
           ==================================================== */}
        {activeTab === 'sessions' && (
          <main className="kz-programme-days-stack">
            {filteredSessionsGrid.map((dayData) => (
              <section key={dayData.dayId} className="kz-day-section-row">

                {/* Left Timeline Rail Column with D1 / D2 / D3 Badge and Dots */}
                <div className="kz-timeline-date-column" aria-hidden="true">
                  <div className="kz-date-badge-box">
                    <div className="kz-date-badge-top">{dayData.dayId}</div>
                    <div className="kz-date-badge-bottom">
                      <span className="kz-badge-month">{dayData.badgeMonth}</span>
                      <span className="kz-badge-date">{dayData.badgeDate}</span>
                      <span className="kz-badge-year">{dayData.badgeYear}</span>
                    </div>
                  </div>

                  <div className="kz-timeline-vertical-line">
                    <span className="kz-timeline-track-dot dot-1" />
                    <span className="kz-timeline-track-dot dot-2" />
                  </div>
                </div>

                {/* Right Content Column */}
                <div className="kz-day-content-column">
                  <div className="kz-day-section-header">
                    <span className="kz-mobile-day-indicator">{dayData.dayId}</span>
                    <h2 className="kz-day-section-title">{dayData.title}</h2>
                    <span className="kz-day-sessions-badge">
                      <LuCalendar size={14} />
                      <span>{dayData.sessionsCount}</span>
                    </span>
                  </div>

                  <div className="kz-sessions-responsive-grid">
                    {dayData.sessions.map((session) => (
                      <article
                        key={session.id}
                        className="kz-session-card-block"
                        onClick={() => setSelectedSession(session)}
                      >
                        <div className="kz-card-top-row">
                          <div className="kz-card-icon-badge" aria-hidden="true">
                            {renderReactIcon(session.icon, 18)}
                          </div>

                          <div className="kz-card-time-wrap">
                            <span className="kz-card-time-text">{session.time}</span>
                            <span className="kz-card-duration-chip">
                              <LuClock size={12} />
                              <span>{session.duration}</span>
                            </span>
                          </div>
                        </div>

                        <h3 className="kz-card-title">{session.title}</h3>
                        <p className="kz-card-description">{session.desc}</p>

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

                        <div className="kz-card-bottom-row">
                          <div className="kz-card-speaker-venue-meta">
                            {session.speaker && (
                              <span className="kz-card-speaker-name">{session.speaker}</span>
                            )}
                            <div className="kz-card-venue-row">
                              <LuMapPin size={13} />
                              <span>{session.venue}</span>
                            </div>
                          </div>

                          <button
                            type="button"
                            className="kz-card-arrow-btn"
                            aria-label={`View details for ${session.title}`}
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedSession(session);
                            }}
                          >
                            <LuArrowRight size={16} />
                          </button>
                        </div>
                      </article>
                    ))}
                  </div>
                </div>
              </section>
            ))}
          </main>
        )}

        {/* ====================================================
            6. VIEW 3: "TOPICS" TRACKS VIEW
           ==================================================== */}
        {activeTab === 'topics' && (
          <div className="kz-topics-overview-section">
            <div className="kz-topics-overview-header">
              <h2 className="kz-topics-overview-title">Conference Thematic Tracks</h2>
              <p className="kz-topics-overview-subtitle">
                Explore specialized surgical innovation tracks and jump straight into curated scientific discussions.
              </p>
            </div>

            <div className="kz-topics-cards-grid">
              {topicsBarItems.filter(t => t.id !== 'ALL').map((topicItem) => (
                <div
                  key={topicItem.id}
                  className="kz-topic-showcase-card"
                  onClick={() => {
                    setSelectedTopic(topicItem.id);
                    setActiveTab('glance');
                  }}
                >
                  <div className="kz-topic-showcase-badge">
                    <LuTag size={24} />
                  </div>
                  <h3 className="kz-topic-showcase-name">{topicItem.label}</h3>
                  <p className="kz-topic-showcase-desc">
                    Comprehensive presentations, expert panels, and live multi-arm demonstrations dedicated to {topicItem.label}.
                  </p>
                  <span className="kz-topic-showcase-cta">
                    View Track Sessions &rarr;
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ====================================================
            7. VIEW 4: "SPEAKERS" OVERVIEW
           ==================================================== */}
        {activeTab === 'speakers' && (
          <div className="kz-topics-overview-section">
            <div className="kz-topics-overview-header">
              <h2 className="kz-topics-overview-title">Keynote Faculty & Speakers</h2>
              <p className="kz-topics-overview-subtitle">
                World-renowned clinical surgeons, robotic pioneers, and AI researchers leading the scientific programme.
              </p>
            </div>

            <div className="kz-speakers-list-grid">
              {[
                { name: 'Dr. James Carter', role: 'Surgical Oncologist & Operating Lead', sessions: 'Opening Keynote, HPB Reconstruction' },
                { name: 'Dr. Maya Chen', role: 'Robotic GI & Colorectal Surgeon', sessions: 'Robotic Colorectal Surgery, Live Case' },
                { name: 'Dr. Arjun Mehta', role: 'Director of Advanced Surgical Tech', sessions: 'AI in Surgical Decision Making, Endoscopy' },
                { name: 'Dr. Sofia Laurent', role: 'Global Surgical Innovation Chair', sessions: 'Global Access, Next-Gen Robotics' },
                { name: 'Dr. Daniel Okafor', role: 'Laparoscopic & Robotic Specialist', sessions: 'Next Era Panel, Autonomous Suite' },
                { name: 'Dr. Aisha Rahman', role: 'Surgical VR & AI Simulation Chair', sessions: 'Surgeon Training, Education in AI' },
                { name: 'Dr. Thomas Weber', role: 'KaizenCon Scientific Committee President', sessions: 'Humanity in AI, Valedictory Keynote' }
              ].map((spk, idx) => (
                <div key={idx} className="kz-speaker-faculty-card">
                  <div className="kz-speaker-initials-badge">
                    {spk.name.split(' ').map(n => n[0]).join('').replace('D', '')}
                  </div>
                  <div className="kz-speaker-info-col">
                    <h3 className="kz-speaker-card-name">{spk.name}</h3>
                    <span className="kz-speaker-card-role">{spk.role}</span>
                    <span className="kz-speaker-card-sessions">
                      <strong>Sessions:</strong> {spk.sessions}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ====================================================
          8. SESSION DETAIL MODAL DIALOG
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
            <div className="kz-modal-header">
              <div className="kz-modal-tag-row">
                {selectedSession.tags && selectedSession.tags.map((tagItem, idx) => (
                  <span key={idx} className={`kz-card-pill kz-pill-${tagItem.type || 'oral'}`}>
                    {tagItem.label}
                  </span>
                ))}
                {selectedSession.time && (
                  <span className="kz-modal-time-badge">
                    {selectedSession.time} {selectedSession.duration ? `(${selectedSession.duration})` : ''}
                  </span>
                )}
              </div>

              <button
                type="button"
                className="kz-modal-close-btn"
                onClick={() => setSelectedSession(null)}
                aria-label="Close dialog"
              >
                <LuX size={20} />
              </button>
            </div>

            <div className="kz-modal-body">
              <h2 id="kz-modal-session-title" className="kz-modal-title">
                {selectedSession.title}
              </h2>

              <div className="kz-modal-meta-grid">
                <div className="kz-modal-meta-cell">
                  <span className="kz-modal-meta-label">
                    <LuMapPin size={13} style={{ marginRight: 5, verticalAlign: 'text-bottom' }} />
                    Venue / Hall
                  </span>
                  <span className="kz-modal-meta-val">{selectedSession.venue || selectedSession.hall}</span>
                </div>

                <div className="kz-modal-meta-cell">
                  <span className="kz-modal-meta-label">
                    <LuUser size={13} style={{ marginRight: 5, verticalAlign: 'text-bottom' }} />
                    Faculty / Speaker
                  </span>
                  <span className="kz-modal-meta-val">{selectedSession.speaker}</span>
                </div>
              </div>

              <div className="kz-modal-section">
                <h4 className="kz-modal-section-heading">Overview</h4>
                <p className="kz-modal-desc-text">{selectedSession.desc || selectedSession.description}</p>
              </div>

              <div className="kz-modal-section">
                <h4 className="kz-modal-section-heading">Key Learning Objectives</h4>
                <ul className="kz-modal-bullets">
                  <li>Review clinical evidence, indications, and workflow integration paradigms.</li>
                  <li>Identify patient safety guidelines and risk stratification strategies.</li>
                  <li>Interactive Q&A discussion with operating faculty and clinical researchers.</li>
                </ul>
              </div>
            </div>

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
