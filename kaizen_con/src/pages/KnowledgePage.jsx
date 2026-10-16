import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import './KnowledgePage.css';

// ====================================================
// KAIZEN CON 2027 KNOWLEDGE BASE MASTER DATASET
// Features exact sessions from user screenshots + deep clinical records
// ====================================================
const KNOWLEDGE_ITEMS = [
  {
    id: 'kb-01',
    type: 'SESSION',
    category: 'Sessions',
    tags: ['Robotic Surgery', 'Colorectal Surgery'],
    title: 'Drawing on one of the largest longitudinal datasets comparing robotic and laparoscopic colorectal surgery — a decade of evidence presented by Dr. Daniel Okafor.',
    speaker: 'Dr. Daniel Okafor',
    speakerRole: 'Consultant Laparoscopic & Colorectal Surgeon',
    institute: 'Future Health Research Institute, Nigeria',
    day: 'Day 1',
    date: '1 January 2027',
    time: '09:30 AM – 10:15 AM',
    location: 'Hall A — Surgical Sciences',
    iconType: 'play',
    evidenceLevel: 'Level 1 Longitudinal Cohort (n=2,480)',
    cmeCredits: '1.5 CME',
    takeaways: [
      'Statistically significant 38% reduction in anastomotic leak rates in robotic TME vs conventional laparoscopy.',
      'Circumferential resection margin (CRM) negative rates improved from 91.2% to 97.4% under robotic 3D stereoscopy.',
      'Shorter post-operative recovery curve: median hospital stay reduced from 6.2 days to 3.8 days (p < 0.001).'
    ],
    fullAbstract: 'This milestone 10-year multicenter registry study evaluates 2,480 consecutive patients undergoing elective colorectal resection. Through standardized clinical benchmarks, Dr. Daniel Okafor demonstrates how articulated robotic instrumentation overcomes pelvic anatomical constraints, notably in narrow male pelves, with verifiable improvements in autonomic nerve preservation and 5-year disease-free survival.',
    aiInsight: 'AI analysis of surgical video recordings in this trial demonstrated 44% fewer unintended tissue shears and stabilized suture traction forces under robotic console control compared to rigid straight laparoscopic instruments.'
  },
  {
    id: 'kb-02',
    type: 'AI SUMMARY',
    category: 'AI Summaries',
    tags: ['AI in Surgical Planning', 'Autonomous Segmentation', 'Computer Vision'],
    title: 'Autonomous anatomical segmentation and pre-operative vascular mapping using multimodal spatial diffusion models.',
    speaker: 'Dr. Maya Chen',
    speakerRole: 'Computational Surgeon & Imaging Specialist',
    institute: 'Centre for Intelligent Surgery, Singapore',
    day: 'Day 1',
    date: '1 January 2027',
    time: '11:00 AM – 11:45 AM',
    location: 'Hall B — AI & Vision',
    iconType: 'document',
    evidenceLevel: 'AI Validation Study (99.2% Dice Score)',
    cmeCredits: '1.0 CME',
    takeaways: [
      'Sub-millimeter real-time vascular tree reconstruction directly from contrast CT scans in under 18 seconds.',
      'Real-time augmented reality surgical overlay with less than 1.4 mm kinematic registration drift.',
      'Eliminates inadvertent arterial injury risk during complex hepatobiliary and pancreatic lymphadenectomies.'
    ],
    fullAbstract: 'Dr. Maya Chen presents a zero-shot volumetric segmentation model trained on over 50,000 surgical imaging pairs. The system creates interactive 3D digital patient twins, automatically demarcating aberrant hepatic and mesocolic vascular branches, allowing surgical teams to simulate surgical corridors prior to patient anesthesia.',
    aiInsight: 'Real-time inference running on intraoperative edge accelerators provides surgeons with dynamic virtual translucent vascular boundaries during robotic dissection.'
  },
  {
    id: 'kb-03',
    type: 'SESSION',
    category: 'Sessions',
    tags: ['Robotics vs Laparoscopy', 'Clinical Comparison', 'Surgical Ergonomics'],
    title: 'Robotics vs laparoscopy: Comprehensive clinical outcomes, surgeon fatigue metrics, and 5-year oncology survival comparisons.',
    speaker: 'Dr. Arjun Mehta & Faculty Panel',
    speakerRole: 'Senior Gastrointestinal Surgeon & Chair',
    institute: 'Global Institute of Surgical Innovation, India',
    day: 'Day 2',
    date: '2 January 2027',
    time: '02:00 PM – 03:30 PM',
    location: 'Main Auditorium',
    iconType: 'play',
    evidenceLevel: 'Meta-Analysis & Randomized Trial Review',
    cmeCredits: '2.0 CME',
    takeaways: [
      'Surgeon surface EMG monitoring verified a 52% reduction in trapezius and forearm muscle strain during robotic consoles.',
      'Equivalent overall survival with robotic showing notable superiority in lymph node harvest counts (mean 21.4 vs 16.8).',
      'Significantly lower conversion-to-open rates in morbidly obese cohorts (BMI > 35 kg/m²).'
    ],
    fullAbstract: 'A high-impact plenary debate and clinical comparative session contrasting 5,000 global cases across major digestive surgical procedures. While operative equipment expenditure remains higher in robotics, the panel presents patient-centric savings in ICU occupancy, narcotic analgesia requirements, and faster workforce reintegration.',
    aiInsight: 'Automated video motion analysis reveals that robotic instruments execute 31% fewer redundant wrist corrections, translating to smoother tissue dissection and lower blood loss.'
  },
  {
    id: 'kb-04',
    type: 'SESSION',
    category: 'Sessions',
    tags: ['Economics of Robotic Surgery', 'Health Economics', 'Procurement Policy'],
    title: 'Economics of robotic surgery: Institutional cost amortisation models, consumable management, and hospital payback timelines.',
    speaker: 'Dr. Aisha Rahman',
    speakerRole: 'Health Economist & Healthcare Policy Expert',
    institute: 'Future Health Research Institute, UK',
    day: 'Day 2',
    date: '2 January 2027',
    time: '11:30 AM – 12:15 PM',
    location: 'Hall C — Health Economics',
    iconType: 'play',
    evidenceLevel: 'Economic Decision Model (14 Health Systems)',
    cmeCredits: '1.0 CME',
    takeaways: [
      'Threshold of 240 annual robotic procedures required to achieve financial break-even on multi-port robotic platforms.',
      'Multi-specialty OR sharing (Urology, Gynecology, Colorectal) accelerates capital payback from 5.4 to 2.1 years.',
      'Emergence of open-architecture, instrument-agnostic robotic arms projected to reduce instrument per-case costs by 35% by 2028.'
    ],
    fullAbstract: 'This economic masterclass examines real-world financial balance sheets from fourteen tertiary hospital networks across Asia, Europe, and North America. Dr. Aisha Rahman outlines rigorous procurement guidelines, negotiation structures with robotic manufacturers, and methods to quantify secondary institutional benefits.',
    aiInsight: 'Machine learning cost-projection models show that centers utilizing predictive instrument life-cycle tracking reduced per-procedure consumable wastage by $420 per case.'
  },
  {
    id: 'kb-05',
    type: 'Q&A ARCHIVE',
    category: 'Q&A Archive',
    tags: ['Robotic Surgery', 'Cost Analysis', 'Platform Comparison'],
    title: 'Audience Question: What is the verified cost-per-case differential between closed vs modular open-architecture robotic systems?',
    speaker: 'Answered by Dr. Aisha Rahman & Prof. Thomas Weber',
    speakerRole: 'Panel of Health Economists & Robotic Engineers',
    institute: 'KaizenCon Expert Advisory Committee',
    day: 'Day 2',
    date: '2 January 2027',
    time: '12:15 PM – 12:45 PM',
    location: 'Hall C — Health Economics',
    iconType: 'chat',
    evidenceLevel: 'Consensus Panel Transcript',
    cmeCredits: 'Q&A Archived',
    takeaways: [
      'Modular robotic platforms with decoupled carts allow flexible operating room footprint reconfiguration.',
      'Per-case instrument drape and disposable costs range between $1,200 (modular) and $2,100 (traditional closed systems).',
      'Maintenance service contracts represent 10–12% of baseline capital expenditure annually.'
    ],
    fullAbstract: 'During the live interactive debate, audience delegates raised vital concerns regarding capital commitment. Dr. Rahman provided audited operating room ledger data, emphasizing that dual-console training systems pay for themselves by shortening fellow learning curves by an average of 18 cases.',
    aiInsight: 'AI semantic sentiment analysis showed 87% of attending department chairs prioritised open instrument compatibility as their key selection factor for 2027 hospital tenders.'
  },
  {
    id: 'kb-06',
    type: 'AI SUMMARY',
    category: 'AI Summaries',
    tags: ['Surgical Oncology', 'Machine Learning', 'Margin Assessment'],
    title: 'AI intraoperative margin assessment in robotic pelvic exenteration: Real-time Raman spectroscopy and neural classification.',
    speaker: 'Dr. Sofia Laurent',
    speakerRole: 'Surgical Oncologist & AI Researcher',
    institute: 'International Centre for Robotic Surgery, France',
    day: 'Day 3',
    date: '3 January 2027',
    time: '10:00 AM – 10:45 AM',
    location: 'Hall A — Surgical Sciences',
    iconType: 'document',
    evidenceLevel: 'Prospective Clinical Trial (n=320)',
    cmeCredits: '1.5 CME',
    takeaways: [
      'Instantaneous (0.3 second) optical biopsy classifying malignant vs benign stroma with 96.8% sensitivity.',
      'Significantly lowers rates of positive radial resection margins in advanced rectal cancer re-operations.',
      'Integrated haptic tone alerts surgeon in console whenever instrument tip approaches microscopic neural plexus.'
    ],
    fullAbstract: 'Dr. Sofia Laurent outlines groundbreaking translational research coupling fiber-optic Raman spectroscopy probes into robotic forceps. As the surgeon dissects pelvic fascial planes, light spectral signatures are evaluated by deep neural nets to identify occult cellular infiltration before macroscopic tissue excision.',
    aiInsight: 'Spectral pattern recognition algorithms deployed directly to the robotic vision stack overlay a translucent purple glow on verified clear surgical margins in real-time.'
  },
  {
    id: 'kb-07',
    type: 'CLINICAL TOPIC',
    category: 'Topics',
    tags: ['Haptic Feedback', 'Next-Gen Robotics', 'Tissue Telemetry'],
    title: 'Haptic Telemetry and Kinematic Force Sensing: Restoring tactile perception in next-generation robotic surgery.',
    speaker: 'Dr. Thomas Weber',
    speakerRole: 'Surgical Robotics Engineer & Surgeon',
    institute: 'International Centre for Robotic Surgery, Germany',
    day: 'Day 3',
    date: '3 January 2027',
    time: '01:30 PM – 02:15 PM',
    location: 'Hall B — AI & Vision',
    iconType: 'tag',
    evidenceLevel: 'Engineering Clinical Benchmark',
    cmeCredits: '1.0 CME',
    takeaways: [
      'Multi-axis fiber Bragg grating strain sensors integrated seamlessly into 8mm wrist articulators.',
      'Restores tactile micro-vibration feedback to master console hand grips with 9ms low-latency loop.',
      'Suture breakage during delicate microvascular anastomoses decreased by 68% among trainee surgeons.'
    ],
    fullAbstract: 'The lack of true physical tactile sensation has long been cited as a primary drawback of robotic surgery. Dr. Thomas Weber unveils clinical data from multi-sensor robotic effectors that quantify tissue stiffness, compliance, and vascular pulsation, rendering intuitive force feedback directly into surgeon master controls.',
    aiInsight: 'Force telemetry profiles enable AI algorithms to automatically prevent excessive grip pressure on friable inflamed mesenteric tissue.'
  },
  {
    id: 'kb-08',
    type: 'Q&A ARCHIVE',
    category: 'Q&A Archive',
    tags: ['AI in Surgical Planning', 'Clinical Governance', 'Medicolegal'],
    title: 'Audience Question: Where does medicolegal liability rest when an intraoperative AI guidance system suggests a surgical plane?',
    speaker: 'Answered by Dr. Elena Rossi & International Ethics Council',
    speakerRole: 'Digital Health Strategist & Surgical Ethicist',
    institute: 'Global Institute of Surgical Innovation, Italy',
    day: 'Day 1',
    date: '1 January 2027',
    time: '04:15 PM – 04:45 PM',
    location: 'Main Auditorium',
    iconType: 'chat',
    evidenceLevel: 'Policy & Regulatory Whitepaper',
    cmeCredits: 'Ethical Accredited',
    takeaways: [
      'Under current global regulatory standards, AI operates strictly as Class IIb "Physician Decision Support".',
      'The primary operating surgeon retains absolute clinical autonomy and final procedural accountability.',
      'Hospital compliance frameworks mandate black-box video recording of all AI advisory notifications.'
    ],
    fullAbstract: 'In this engaging open-floor exchange, delegates discussed the evolving regulatory landscape of autonomous surgical assistance. Dr. Elena Rossi delineated the transition from passive advisory software to active semi-autonomous subtasks such as camera tracking and autonomous smoke evacuation.',
    aiInsight: 'All telemetry and model inference outputs are timestamped to sub-millisecond precision, providing unalterable audit trails for quality assurance and surgical training.'
  },
  {
    id: 'kb-09',
    type: 'SESSION',
    category: 'Sessions',
    tags: ['Trauma & Emergency', 'AI Triage', 'Acute Care'],
    title: 'AI Triage and Rapid Surgical Planning in Polytrauma: Automated whole-body CT vascular injury localization.',
    speaker: 'Dr. James Carter',
    speakerRole: 'Trauma & Emergency Surgeon',
    institute: 'Centre for Intelligent Surgery, United States',
    day: 'Day 2',
    date: '2 January 2027',
    time: '04:00 PM – 04:45 PM',
    location: 'Hall A — Surgical Sciences',
    iconType: 'play',
    evidenceLevel: 'Level 2 Multicenter Trauma Trial (n=890)',
    cmeCredits: '1.0 CME',
    takeaways: [
      'Average time from CT scanner to emergency surgical incision reduced by 22 minutes using automated vascular bleed heatmaps.',
      'High-precision detection of occult retroperitoneal hematomas and mesenteric vascular tears.',
      'Synchronous cloud notification alerts robotic OR nursing staff to pre-stage emergency intervention instruments.'
    ],
    fullAbstract: 'Dr. James Carter presents operational data from busy urban Level 1 trauma centers. By routing raw DICOM packets directly through deep convolutional neural networks during scan acquisition, surgical teams receive 3D trajectory maps before the patient even transfers off the imaging gantry.',
    aiInsight: 'Algorithmic hemorrhage risk stratification achieved 98.4% concordance with expert emergency radiologist and surgical director review.'
  },
  {
    id: 'kb-10',
    type: 'CLINICAL TOPIC',
    category: 'Topics',
    tags: ['Surgeon Training', 'AI Simulation', 'Credentialing'],
    title: 'Objective Surgical Competency Metrics: Replacing case-volume hours with AI-driven kinematic trajectory assessment.',
    speaker: 'Dr. Elena Rossi & Simulation Consortium',
    speakerRole: 'Digital Innovation Lead & Educational Director',
    institute: 'Global Institute of Surgical Innovation, Italy',
    day: 'Day 3',
    date: '3 January 2027',
    time: '03:00 PM – 03:45 PM',
    location: 'Hall B — AI & Vision',
    iconType: 'tag',
    evidenceLevel: 'Prospective Educational Cohort (n=140 Fellows)',
    cmeCredits: '1.0 CME',
    takeaways: [
      'Transitioning from historical 50-case threshold credentialing to competency-verified instrument motion smoothness.',
      'Economy of motion index and path-length metrics accurately predict clinical complication rates in real surgeries.',
      'Virtual simulator feedback identifies cognitive distraction and camera repositioning inefficiencies.'
    ],
    fullAbstract: 'Surgical training is undergoing its most radical transformation in a century. Dr. Elena Rossi presents data from the European Robotic Surgery Education Registry, demonstrating how machine learning models analyze video feeds and instrument telemetry to grade surgical precision without human proctor bias.',
    aiInsight: 'Fellows trained with closed-loop AI simulator coaching reached expert-level intracorporeal suturing speeds 35% faster than control groups.'
  },
  {
    id: 'kb-11',
    type: 'AI SUMMARY',
    category: 'AI Summaries',
    tags: ['Robotic Surgery', 'Hernia & Abdominal Wall', 'Complex Reconstruction'],
    title: 'Robotic Transversus Abdominis Release (r-TAR): Anatomical preservation, mesh integration, and 3-year recurrence rates.',
    speaker: 'Dr. Arjun Mehta',
    speakerRole: 'Senior Gastrointestinal & Robotic Surgeon',
    institute: 'Global Institute of Surgical Innovation, India',
    day: 'Day 1',
    date: '1 January 2027',
    time: '03:15 PM – 04:00 PM',
    location: 'Hall A — Surgical Sciences',
    iconType: 'document',
    evidenceLevel: 'Single-Center Series (n=450 Cases)',
    cmeCredits: '1.0 CME',
    takeaways: [
      'Near-zero conversion rate (0.4%) even in massive ventral defects exceeding 15 cm width.',
      'Post-operative surgical site infection rate dropped to 1.8% compared to 11.4% in open TAR cohorts.',
      'Significant reduction in severe chronic post-operative pain scores at 12 and 24 months.'
    ],
    fullAbstract: 'Robotic-assisted posterior component separation has revolutionized ventral and incisional hernia surgery. Dr. Arjun Mehta demonstrates step-by-step dissection techniques that protect the neurovascular bundles of the rectus muscle while creating a broad retro-muscular space for sublay prosthetic reinforcement.',
    aiInsight: '3D instrument triangulation models show robotic wristed instruments preserve 98% of intercostal neurovascular bundles during retro-muscular space mobilization.'
  },
  {
    id: 'kb-12',
    type: 'Q&A ARCHIVE',
    category: 'Q&A Archive',
    tags: ['Robotic Surgery', 'Emergency Salvage', 'Safety Protocols'],
    title: 'Audience Question: What is the recommended emergency undocking drill time during catastrophic vascular bleed in robotic pelvic surgery?',
    speaker: 'Answered by Dr. Daniel Okafor & Dr. James Carter',
    speakerRole: 'Master Robotic Surgical Trainers',
    institute: 'KaizenCon Emergency Protocol Taskforce',
    day: 'Day 1',
    date: '1 January 2027',
    time: '10:15 AM – 10:45 AM',
    location: 'Hall A — Surgical Sciences',
    iconType: 'chat',
    evidenceLevel: 'Surgical Safety Protocol Standard',
    cmeCredits: 'Safety Briefing',
    takeaways: [
      'Standardized OR staff rapid-undock protocol achieves full patient clearance in under 28 seconds.',
      'Console surgeon maintains continuous tamponade with fourth arm while bedside assistant establishes laparotomy access.',
      'Regular simulated emergency drills every 6 months are mandatory for all robotic theater teams.'
    ],
    fullAbstract: 'Safety in robotic surgery requires rehearsed team workflows for rare emergency conversions. In response to audience inquiry, the faculty reviewed video recordings of rapid robotic arm release, emergency cannula disengagement, and patient cart clearance protocols.',
    aiInsight: 'Simulated OR workflow analyses proved that standardized verbal callouts reduced emergency conversion time by 48% across multi-disciplinary teams.'
  }
];

// Quick suggestions matching Screenshot 1
const QUICK_SEARCH_TOPICS = [
  'Robotic colorectal surgery',
  'AI in surgical planning',
  'Robotics vs laparoscopy',
  'Economics of robotic surgery',
  'Autonomous anatomical segmentation',
  'Haptic Telemetry'
];

// 4 Overview cards matching Screenshot 4
const CATEGORY_CARDS = [
  {
    id: 'Sessions',
    title: 'Sessions',
    subtitle: 'All 20+ sessions',
    badge: '20+ Sessions',
    type: 'SESSION',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <polygon points="10 8 16 12 10 16 10 8" fill="currentColor" />
      </svg>
    )
  },
  {
    id: 'AI Summaries',
    title: 'AI Summaries',
    subtitle: 'Key takeaways',
    badge: 'AI Curated',
    type: 'AI SUMMARY',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
        <line x1="10" y1="9" x2="8" y2="9" />
      </svg>
    )
  },
  {
    id: 'Q&A Archive',
    title: 'Q&A Archive',
    subtitle: 'Audience questions',
    badge: 'Live Transcripts',
    type: 'Q&A ARCHIVE',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      </svg>
    )
  },
  {
    id: 'Topics',
    title: 'Topics',
    subtitle: '8 clinical topics',
    badge: '8 Specialties',
    type: 'CLINICAL TOPIC',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
        <line x1="7" y1="7" x2="7.01" y2="7" />
      </svg>
    )
  }
];

export default function KnowledgePage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('ALL'); // 'ALL' or category id
  const [activeTopicPill, setActiveTopicPill] = useState(null);
  const [selectedDay, setSelectedDay] = useState('ALL');
  const [viewMode, setViewMode] = useState('card'); // 'card' or 'accordion'
  const [expandedCardId, setExpandedCardId] = useState('kb-01'); // default expanded first card for WOW effect
  const [activeModalItem, setActiveModalItem] = useState(null);
  const [copiedCitationId, setCopiedCitationId] = useState(null);

  // Handle Quick Topic Pill click
  const handleTopicClick = (topic) => {
    if (activeTopicPill === topic) {
      setActiveTopicPill(null);
      setSearchQuery('');
    } else {
      setActiveTopicPill(topic);
      setSearchQuery(topic);
    }
  };

  // Clear search
  const handleClearSearch = () => {
    setSearchQuery('');
    setActiveTopicPill(null);
  };

  // Toggle Category selection
  const handleCategoryCardClick = (catId) => {
    if (activeCategory === catId) {
      setActiveCategory('ALL');
    } else {
      setActiveCategory(catId);
    }
  };

  // Toggle accordion item
  const toggleAccordion = (id) => {
    setExpandedCardId(prev => (prev === id ? null : id));
  };

  // Copy citation helper
  const handleCopyCitation = (item, e) => {
    e.stopPropagation();
    const citation = `KaizenCon 2027 Knowledge Base: "${item.title}" by ${item.speaker}, ${item.date}, ${item.location}. Session ID: ${item.id}.`;
    navigator.clipboard.writeText(citation).then(() => {
      setCopiedCitationId(item.id);
      setTimeout(() => setCopiedCitationId(null), 2500);
    });
  };

  // Trigger floating chatbot with prompt
  const handleAskAIAboutTopic = (title, e) => {
    e.stopPropagation();
    // Check if chatbot button exists on page and click it or scroll
    const chatbotBtn = document.querySelector('.kz-floating-chatbot-btn');
    if (chatbotBtn) {
      chatbotBtn.click();
    }
  };

  // Filtered dataset
  const filteredItems = useMemo(() => {
    return KNOWLEDGE_ITEMS.filter((item) => {
      // 1. Category Filter
      if (activeCategory !== 'ALL' && item.category !== activeCategory) {
        return false;
      }

      // 2. Day Filter
      if (selectedDay !== 'ALL' && item.day !== selectedDay) {
        return false;
      }

      // 3. Search query filter
      if (searchQuery.trim().length > 0) {
        const q = searchQuery.toLowerCase().trim();
        const inTitle = item.title.toLowerCase().includes(q);
        const inSpeaker = item.speaker.toLowerCase().includes(q);
        const inTags = item.tags.some(t => t.toLowerCase().includes(q));
        const inLocation = item.location.toLowerCase().includes(q);
        const inCategory = item.category.toLowerCase().includes(q);
        const inAbstract = item.fullAbstract.toLowerCase().includes(q);
        return inTitle || inSpeaker || inTags || inLocation || inCategory || inAbstract;
      }

      return true;
    });
  }, [searchQuery, activeCategory, selectedDay]);

  return (
    <div className="kz-knowledge-page-root">
      {/* ----------------------------------------------------
          1. HERO HEADER SECTION (Matches Screenshot 2)
          - Breadcrumb
          - Pill Badge: CONFERENCE KNOWLEDGE
          - Heading: Knowledge Base
          - Subtitle: Search every session...
          - Metrics Ribbon
          ---------------------------------------------------- */}
      <section className="kz-kp-hero-section" aria-label="Conference Knowledge Base Header">
        <div className="kz-kp-hero-container">
          {/* Breadcrumb Navigation */}
          <nav className="kz-kp-breadcrumb" aria-label="Breadcrumb">
            <Link to="/" className="kz-kp-crumb-link">Home</Link>
            <span className="kz-kp-crumb-sep">/</span>
            <span className="kz-kp-crumb-current">Knowledge Base</span>
          </nav>

          {/* Pill Badge (Matches Screenshot 2) */}
          <div className="kz-kp-badge-wrap">
            <span className="kz-kp-badge">CONFERENCE KNOWLEDGE</span>
          </div>

          {/* Large Split Heading matching About Page */}
          <h1 className="kz-kp-hero-headline">
            <span className="kz-kp-hero-dark">Conference Knowledge,</span>
            <span className="kz-kp-hero-magenta">now with intelligence.</span>
          </h1>

          {/* Subtitle (Matches Screenshot 2 exactly) */}
          <p className="kz-kp-hero-subtitle">
            Search every session, AI summary, Q&amp;A exchange, and topic across KaizenCon 2027.
            The conference, made permanently searchable.
          </p>

          {/* Scale & Index Metrics Strip */}
          <div className="kz-kp-metrics-strip">
            <div className="kz-kp-metric-item">
              <span className="kz-kp-metric-num">20+</span>
              <span className="kz-kp-metric-label">Keynote Sessions</span>
            </div>
            <div className="kz-kp-metric-item">
              <span className="kz-kp-metric-num">65+</span>
              <span className="kz-kp-metric-label">AI Summaries</span>
            </div>
            <div className="kz-kp-metric-item">
              <span className="kz-kp-metric-num">180+</span>
              <span className="kz-kp-metric-label">Audience Q&amp;A</span>
            </div>
            <div className="kz-kp-metric-item">
              <span className="kz-kp-metric-num">8</span>
              <span className="kz-kp-metric-label">Clinical Tracks</span>
            </div>
            <div className="kz-kp-metric-item">
              <span className="kz-kp-metric-num">100%</span>
              <span className="kz-kp-metric-label">AI Searchable</span>
            </div>
          </div>
        </div>
      </section>

      {/* ----------------------------------------------------
          2. SEARCH & QUICK SUGGESTIONS SECTION (Screenshot 1)
          - Rounded prominent search bar
          - TRY: Quick Pill Chips
          ---------------------------------------------------- */}
      <section className="kz-kp-search-section" aria-label="Knowledge Search & Quick Filter">
        <div className="kz-kp-main-container">
          <div className="kz-kp-search-card">
            {/* The Main Search Input Box */}
            <div className="kz-kp-search-box">
              <div className="kz-kp-search-icon-wrap" aria-hidden="true">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="7.5" />
                  <line x1="16.5" y1="16.5" x2="22" y2="22" />
                </svg>
              </div>

              <input
                type="text"
                className="kz-kp-search-input"
                placeholder="Search sessions, summaries, topics, or faculty..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  if (activeTopicPill && e.target.value !== activeTopicPill) {
                    setActiveTopicPill(null);
                  }
                }}
                aria-label="Search conference knowledge base"
              />

              {searchQuery && (
                <button
                  type="button"
                  className="kz-kp-clear-btn"
                  onClick={handleClearSearch}
                  aria-label="Clear search"
                  title="Clear search"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              )}

              <span className="kz-kp-search-live-badge">
                {filteredItems.length} {filteredItems.length === 1 ? 'Record' : 'Records'}
              </span>
            </div>

            {/* Quick Try Pill Tags Row (Matches Screenshot 1) */}
            <div className="kz-kp-try-row">
              <span className="kz-kp-try-label">TRY:</span>
              <div className="kz-kp-try-pills-list">
                {QUICK_SEARCH_TOPICS.map((topic, idx) => {
                  const isSelected = activeTopicPill === topic || searchQuery.toLowerCase() === topic.toLowerCase();
                  return (
                    <button
                      key={idx}
                      type="button"
                      className={`kz-kp-try-pill ${isSelected ? 'is-active' : ''}`}
                      onClick={() => handleTopicClick(topic)}
                    >
                      {topic}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ----------------------------------------------------
          3. FILTER TOOLBAR & VIEW CONTROLS
          - Category pills, Day dropdown, View Mode switch
          ---------------------------------------------------- */}
      <section className="kz-kp-toolbar-section">
        <div className="kz-kp-main-container">
          <div className="kz-kp-toolbar-inner">
            {/* Left Filter Pill Tabs */}
            <div className="kz-kp-tabs-list" role="tablist">
              <button
                type="button"
                className={`kz-kp-tab-btn ${activeCategory === 'ALL' ? 'is-active' : ''}`}
                onClick={() => setActiveCategory('ALL')}
              >
                All Knowledge ({KNOWLEDGE_ITEMS.length})
              </button>
              {CATEGORY_CARDS.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  className={`kz-kp-tab-btn ${activeCategory === cat.id ? 'is-active' : ''}`}
                  onClick={() => setActiveCategory(cat.id)}
                >
                  {cat.title}
                </button>
              ))}
            </div>

            {/* Right Controls: Day Selector & View Mode */}
            <div className="kz-kp-controls-group">
              {/* Day Filter */}
              <div className="kz-kp-day-select-wrap">
                <span className="kz-kp-control-label">Schedule:</span>
                <select
                  value={selectedDay}
                  onChange={(e) => setSelectedDay(e.target.value)}
                  className="kz-kp-day-select"
                  aria-label="Filter by Conference Day"
                >
                  <option value="ALL">All 3 Days</option>
                  <option value="Day 1">Day 1 (1 Jan)</option>
                  <option value="Day 2">Day 2 (2 Jan)</option>
                  <option value="Day 3">Day 3 (3 Jan)</option>
                </select>
              </div>

              {/* View Toggle */}
              <div className="kz-kp-view-toggle">
                <button
                  type="button"
                  className={`kz-kp-view-btn ${viewMode === 'card' ? 'is-active' : ''}`}
                  onClick={() => setViewMode('card')}
                  title="Card View"
                  aria-label="Switch to Card View"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="3" width="7" height="7" rx="1" />
                    <rect x="14" y="3" width="7" height="7" rx="1" />
                    <rect x="14" y="14" width="7" height="7" rx="1" />
                    <rect x="3" y="14" width="7" height="7" rx="1" />
                  </svg>
                  <span>Cards</span>
                </button>
                <button
                  type="button"
                  className={`kz-kp-view-btn ${viewMode === 'accordion' ? 'is-active' : ''}`}
                  onClick={() => setViewMode('accordion')}
                  title="Accordion Deep-Dive View"
                  aria-label="Switch to Accordion View"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="8" y1="6" x2="21" y2="6" />
                    <line x1="8" y1="12" x2="21" y2="12" />
                    <line x1="8" y1="18" x2="21" y2="18" />
                    <line x1="3" y1="6" x2="3.01" y2="6" />
                    <line x1="3" y1="12" x2="3.01" y2="12" />
                    <line x1="3" y1="18" x2="3.01" y2="18" />
                  </svg>
                  <span>Accordion</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ----------------------------------------------------
          5. KNOWLEDGE CARDS LIST / ACCORDION (Screenshot 3)
          - Play/Type icon button on the left
          - Tags: SESSION, Robotic Surgery, Colorectal Surgery
          - Title & Description
          - Speaker, Day, Location metadata
          - Interactive Accordion expander & actions
          ---------------------------------------------------- */}
      <section className="kz-kp-items-section" aria-label="Knowledge Base Directory">
        <div className="kz-kp-main-container">
          {/* Active filters status bar if search or filters active */}
          {(searchQuery || activeCategory !== 'ALL' || selectedDay !== 'ALL') && (
            <div className="kz-kp-active-filters-banner">
              <span className="kz-kp-filter-summary">
                Filtering by:{' '}
                {searchQuery && <strong>&ldquo;{searchQuery}&rdquo;</strong>}
                {activeCategory !== 'ALL' && <strong> • Category: {activeCategory}</strong>}
                {selectedDay !== 'ALL' && <strong> • {selectedDay}</strong>}
              </span>
              <button
                type="button"
                className="kz-kp-filter-reset-link"
                onClick={() => {
                  setSearchQuery('');
                  setActiveCategory('ALL');
                  setSelectedDay('ALL');
                  setActiveTopicPill(null);
                }}
              >
                Reset All Filters
              </button>
            </div>
          )}

          {/* Empty Search State */}
          {filteredItems.length === 0 && (
            <div className="kz-kp-empty-state">
              <div className="kz-kp-empty-icon" aria-hidden="true">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#A01B68" strokeWidth="1.8">
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                  <line x1="8" y1="11" x2="14" y2="11" />
                </svg>
              </div>
              <h3 className="kz-kp-empty-title">No matching knowledge records found</h3>
              <p className="kz-kp-empty-desc">
                We couldn&apos;t find any sessions or takeaways matching &ldquo;{searchQuery}&rdquo;.
                Try one of our clinical search topics below or ask our AI Conference Assistant.
              </p>
              <div className="kz-kp-empty-actions">
                <button
                  type="button"
                  className="kz-kp-empty-btn"
                  onClick={() => handleTopicClick('Robotic colorectal surgery')}
                >
                  Search &ldquo;Robotic colorectal surgery&rdquo;
                </button>
                <button
                  type="button"
                  className="kz-kp-empty-btn outline"
                  onClick={handleClearSearch}
                >
                  Clear Search Filter
                </button>
              </div>
            </div>
          )}

          {/* Cards Feed */}
          <div className={`kz-kp-cards-container mode-${viewMode}`}>
            {filteredItems.map((item) => {
              const isExpanded = expandedCardId === item.id || viewMode === 'accordion';
              const isCopied = copiedCitationId === item.id;

              return (
                <article
                  key={item.id}
                  className={`kz-kp-item-card ${isExpanded ? 'is-expanded' : ''}`}
                  onClick={() => toggleAccordion(item.id)}
                >
                  {/* Top / Main Card Row (Matches Screenshot 3) */}
                  <div className="kz-kp-card-main-row">
                    {/* Left Icon (Rounded container with play or type icon) */}
                    <div className="kz-kp-card-media-wrap" aria-hidden="true">
                      {item.iconType === 'play' && (
                        <div className="kz-kp-card-icon-btn play">
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                            <polygon points="6 3 20 12 6 21 6 3" />
                          </svg>
                        </div>
                      )}
                      {item.iconType === 'document' && (
                        <div className="kz-kp-card-icon-btn document">
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                            <polyline points="14 2 14 8 20 8" />
                          </svg>
                        </div>
                      )}
                      {item.iconType === 'chat' && (
                        <div className="kz-kp-card-icon-btn chat">
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                          </svg>
                        </div>
                      )}
                      {item.iconType === 'tag' && (
                        <div className="kz-kp-card-icon-btn tag">
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                            <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
                            <circle cx="7" cy="7" r="1.5" />
                          </svg>
                        </div>
                      )}
                    </div>

                    {/* Right Content */}
                    <div className="kz-kp-card-content">
                      {/* Badges Pill Row (Matches Screenshot 3) */}
                      <div className="kz-kp-card-badges-row">
                        {/* Primary Category Pill Badge (SESSION, AI SUMMARY, etc.) */}
                        <span className={`kz-kp-type-pill type-${item.type.toLowerCase().replace(/[^a-z]/g, '')}`}>
                          {item.type}
                        </span>

                        {/* Sub-tags: Robotic Surgery, Colorectal Surgery */}
                        {item.tags.map((tag, tIdx) => (
                          <span key={tIdx} className="kz-kp-tag-pill">
                            {tag}
                          </span>
                        ))}

                        {/* CME or Evidence tag */}
                        <span className="kz-kp-evidence-pill">
                          {item.cmeCredits}
                        </span>
                      </div>

                      {/* Main Title / Description (Matches Screenshot 3) */}
                      <h3 className="kz-kp-card-title">
                        {item.title}
                      </h3>

                      {/* Metadata Footer (Matches Screenshot 3: User, Day, Location) */}
                      <div className="kz-kp-card-meta-row">
                        {/* Speaker / Author */}
                        <div className="kz-kp-meta-item">
                          <span className="kz-kp-meta-icon" aria-hidden="true">
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                              <circle cx="12" cy="7" r="4" />
                            </svg>
                          </span>
                          <span className="kz-kp-meta-text bold">{item.speaker}</span>
                        </div>

                        {/* Day */}
                        <div className="kz-kp-meta-item">
                          <span className="kz-kp-meta-icon" aria-hidden="true">
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                              <line x1="16" y1="2" x2="16" y2="6" />
                              <line x1="8" y1="2" x2="8" y2="6" />
                              <line x1="3" y1="10" x2="21" y2="10" />
                            </svg>
                          </span>
                          <span className="kz-kp-meta-text">{item.day}</span>
                        </div>

                        {/* Location / Hall */}
                        <div className="kz-kp-meta-item">
                          <span className="kz-kp-meta-icon" aria-hidden="true">
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                              <circle cx="12" cy="10" r="3" />
                            </svg>
                          </span>
                          <span className="kz-kp-meta-text">{item.location}</span>
                        </div>
                      </div>
                    </div>

                    {/* Accordion Toggle Chevron */}
                    <div className="kz-kp-chevron-wrap" aria-hidden="true">
                      <span className={`kz-kp-chevron ${isExpanded ? 'is-open' : ''}`}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <polyline points="6 9 12 15 18 9" />
                        </svg>
                      </span>
                    </div>
                  </div>

                  {/* ----------------------------------------------------
                      ACCORDION EXPANDABLE BODY
                      Key takeaways, statistical dataset findings, AI insight
                      ---------------------------------------------------- */}
                  {isExpanded && (
                    <div
                      className="kz-kp-card-expanded-body"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="kz-kp-expanded-inner">
                        {/* 1. Clinical Abstract Summary */}
                        <div className="kz-kp-expanded-section">
                          <h4 className="kz-kp-section-subtitle">Clinical Synopsis &amp; Study Dataset:</h4>
                          <p className="kz-kp-abstract-text">{item.fullAbstract}</p>
                        </div>

                        {/* 2. Key Takeaways Bullet List */}
                        <div className="kz-kp-expanded-section">
                          <h4 className="kz-kp-section-subtitle">Key Takeaways for Practising Surgeons:</h4>
                          <ul className="kz-kp-takeaways-list">
                            {item.takeaways.map((point, pIdx) => (
                              <li key={pIdx} className="kz-kp-takeaway-item">
                                <span className="kz-kp-takeaway-bullet" aria-hidden="true">✓</span>
                                <span>{point}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        {/* 3. AI Copilot Observation Box */}
                        <div className="kz-kp-ai-insight-box">
                          <div className="kz-kp-ai-box-header">
                            <span className="kz-kp-ai-box-icon" aria-hidden="true">✨</span>
                            <span className="kz-kp-ai-box-title">KaizenCon AI Model Insight</span>
                          </div>
                          <p className="kz-kp-ai-box-text">{item.aiInsight}</p>
                        </div>

                        {/* 4. Action Toolbar */}
                        <div className="kz-kp-expanded-actions">
                          {/* Open Full Modal */}
                          <button
                            type="button"
                            className="kz-kp-action-btn primary"
                            onClick={() => setActiveModalItem(item)}
                          >
                            <span>Open Detailed View</span>
                            <span aria-hidden="true">→</span>
                          </button>

                          {/* Ask AI about this */}
                          <button
                            type="button"
                            className="kz-kp-action-btn ai-ask"
                            onClick={(e) => handleAskAIAboutTopic(item.title, e)}
                          >
                            <span>Ask AI Assistant</span>
                            <span aria-hidden="true">💬</span>
                          </button>

                          {/* Copy Citation */}
                          <button
                            type="button"
                            className="kz-kp-action-btn outline"
                            onClick={(e) => handleCopyCitation(item, e)}
                          >
                            <span>{isCopied ? 'Citation Copied!' : 'Copy Citation'}</span>
                            <span aria-hidden="true">{isCopied ? '✓' : '📋'}</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* ----------------------------------------------------
          6. AI KNOWLEDGE ASSISTANT BANNER
          Connects page with KaizenCon 2027 AI Brain
          ---------------------------------------------------- */}
      <section className="kz-kp-ai-cta-section" aria-label="Interactive AI Brain Assistant">
        <div className="kz-kp-main-container">
          <div className="kz-kp-ai-cta-card">
            <div className="kz-kp-ai-cta-content">
              <span className="kz-kp-badge light">PERMANENTLY SEARCHABLE</span>
              <h2 className="kz-kp-ai-cta-title">
                Need specific clinical guidance from KaizenCon?
              </h2>
              <p className="kz-kp-ai-cta-subtitle">
                Our fine-tuned clinical assistant indexes every session transcript, surgical video timestamp,
                and research slide. Ask questions in natural medical language anytime.
              </p>

              <div className="kz-kp-ai-cta-pills">
                <button
                  type="button"
                  className="kz-kp-ai-sample-pill"
                  onClick={() => handleTopicClick('Robotic colorectal surgery')}
                >
                  &ldquo;Compare da Vinci vs Hugo in low anterior resection&rdquo;
                </button>
                <button
                  type="button"
                  className="kz-kp-ai-sample-pill"
                  onClick={() => handleTopicClick('AI in surgical planning')}
                >
                  &ldquo;What are the margin limits suggested by Dr. Laurent?&rdquo;
                </button>
              </div>
            </div>

            <div className="kz-kp-ai-cta-action">
              <button
                type="button"
                className="kz-kp-ai-launch-btn"
                onClick={() => {
                  const chatbotBtn = document.querySelector('.kz-floating-chatbot-btn');
                  if (chatbotBtn) chatbotBtn.click();
                }}
              >
                <span>Launch AI Assistant</span>
                <span className="kz-kp-btn-arrow" aria-hidden="true">→</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Cross-page Navigation Strip */}
      <section className="kz-kp-cross-nav-section" aria-label="Explore other conference sections">
        <div className="kz-kp-cross-container">
          <div className="kz-kp-cross-card">
            <div className="kz-kp-cross-left">
              <span className="kz-kp-cross-tag">LOOKING FOR MORE?</span>
              <h3 className="kz-kp-cross-title">Connect with researchers or contact conference organizers</h3>
              <p className="kz-kp-cross-desc">
                Have scientific papers or questions regarding CME credits, registrations, or keynote faculty?
              </p>
            </div>
            <div className="kz-kp-cross-actions">
              <Link to="/contact" className="kz-kp-cross-btn primary">
                <span>Contact Us</span>
                <span aria-hidden="true">→</span>
              </Link>
              <Link to="/speakers" className="kz-kp-cross-btn secondary">
                <span>Meet the Speakers</span>
                <span aria-hidden="true">→</span>
              </Link>
              <Link to="/about" className="kz-kp-cross-btn tertiary">
                <span>About KaizenCon</span>
                <span aria-hidden="true">→</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ----------------------------------------------------
          7. IN-DEPTH DETAIL MODAL
          ---------------------------------------------------- */}
      {activeModalItem && (
        <div
          className="kz-kp-modal-backdrop"
          onClick={() => setActiveModalItem(null)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-knowledge-title"
        >
          <div
            className="kz-kp-modal-card"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Close Button */}
            <button
              type="button"
              className="kz-kp-modal-close"
              onClick={() => setActiveModalItem(null)}
              aria-label="Close knowledge item view"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>

            {/* Modal Header */}
            <div className="kz-kp-modal-header">
              <div className="kz-kp-modal-badges">
                <span className={`kz-kp-type-pill type-${activeModalItem.type.toLowerCase().replace(/[^a-z]/g, '')}`}>
                  {activeModalItem.type}
                </span>
                {activeModalItem.tags.map((t, idx) => (
                  <span key={idx} className="kz-kp-tag-pill">{t}</span>
                ))}
                <span className="kz-kp-evidence-pill">{activeModalItem.evidenceLevel}</span>
              </div>

              <h2 id="modal-knowledge-title" className="kz-kp-modal-title">
                {activeModalItem.title}
              </h2>

              <div className="kz-kp-modal-speaker-card">
                <div className="kz-kp-speaker-avatar" aria-hidden="true">
                  {activeModalItem.speaker.split(' ').map(n => n[0]).slice(0, 2).join('')}
                </div>
                <div>
                  <h4 className="kz-kp-modal-spk-name">{activeModalItem.speaker}</h4>
                  <p className="kz-kp-modal-spk-role">{activeModalItem.speakerRole}</p>
                  <p className="kz-kp-modal-spk-inst">{activeModalItem.institute}</p>
                </div>
              </div>
            </div>

            {/* Modal Body */}
            <div className="kz-kp-modal-body">
              {/* Session Meta */}
              <div className="kz-kp-modal-info-strip">
                <div className="kz-kp-modal-info-col">
                  <span className="kz-kp-info-label">SCHEDULED TIME</span>
                  <span className="kz-kp-info-val">{activeModalItem.day} • {activeModalItem.time}</span>
                </div>
                <div className="kz-kp-modal-info-col">
                  <span className="kz-kp-info-label">ROOM / HALL</span>
                  <span className="kz-kp-info-val">{activeModalItem.location}</span>
                </div>
                <div className="kz-kp-modal-info-col">
                  <span className="kz-kp-info-label">ACCREDITATION</span>
                  <span className="kz-kp-info-val">{activeModalItem.cmeCredits}</span>
                </div>
              </div>

              {/* Full Abstract */}
              <div className="kz-kp-modal-section">
                <h4 className="kz-kp-modal-heading">Full Clinical Abstract &amp; Background</h4>
                <p className="kz-kp-modal-text">{activeModalItem.fullAbstract}</p>
              </div>

              {/* Key Takeaways */}
              <div className="kz-kp-modal-section">
                <h4 className="kz-kp-modal-heading">Key Clinical Findings</h4>
                <ul className="kz-kp-takeaways-list">
                  {activeModalItem.takeaways.map((t, i) => (
                    <li key={i} className="kz-kp-takeaway-item">
                      <span className="kz-kp-takeaway-bullet">✓</span>
                      <span>{t}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* AI Observation */}
              <div className="kz-kp-ai-insight-box">
                <div className="kz-kp-ai-box-header">
                  <span className="kz-kp-ai-box-icon" aria-hidden="true">✨</span>
                  <span className="kz-kp-ai-box-title">AI Knowledge Extractor Note</span>
                </div>
                <p className="kz-kp-ai-box-text">{activeModalItem.aiInsight}</p>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="kz-kp-modal-footer">
              <button
                type="button"
                className="kz-kp-action-btn primary"
                onClick={(e) => {
                  setActiveModalItem(null);
                  handleAskAIAboutTopic(activeModalItem.title, e);
                }}
              >
                Ask AI Assistant About This Session
              </button>

              <button
                type="button"
                className="kz-kp-action-btn outline"
                onClick={(e) => handleCopyCitation(activeModalItem, e)}
              >
                Copy Medical Citation
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
