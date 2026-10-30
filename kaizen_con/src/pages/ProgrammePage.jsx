import { useState, useMemo, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { getSchedules, getSpeakers } from '../Apipath';
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



// Helper function to calculate duration from HH:MM(:SS) strings
const calculateDuration = (start, end) => {
  if (!start || !end) return '45 min';
  const [sh, sm] = start.split(':').map(Number);
  const [eh, em] = end.split(':').map(Number);
  if (isNaN(sh) || isNaN(sm) || isNaN(eh) || isNaN(em)) return '45 min';
  const diff = (eh * 60 + em) - (sh * 60 + sm);
  return diff > 0 ? `${diff} min` : '45 min';
};

// Category visual styling helper
const getCategoryStyle = (category = '') => {
  const cat = (category || '').toLowerCase();

  if (cat.includes('break') || cat.includes('tea') || cat.includes('coffee') || cat.includes('lunch') || cat.includes('foyer')) {
    return {
      cardColor: '#f59e0b',
      cardBg: '#fffdfa',
      badgeBg: '#fef3c7',
      badgeColor: '#d97706',
      tagBg: '#fef3c7',
      tagColor: '#b45309',
      tagBorder: '#fde68a',
      icon: 'coffee',
      tagType: 'networking'
    };
  }

  if (cat.includes('cardio') || cat.includes('heart')) {
    return {
      cardColor: '#ef4444',
      cardBg: '#fffbfb',
      badgeBg: '#fee2e2',
      badgeColor: '#ef4444',
      tagBg: '#fee2e2',
      tagColor: '#dc2626',
      tagBorder: '#fecaca',
      icon: 'monitor',
      tagType: 'ai'
    };
  }

  if (cat.includes('maternal') || cat.includes('gynec') || cat.includes('obstetric')) {
    return {
      cardColor: '#ec4899',
      cardBg: '#fffbfd',
      badgeBg: '#fdf2f8',
      badgeColor: '#ec4899',
      tagBg: '#fdf2f8',
      tagColor: '#db2777',
      tagBorder: '#fbcfe8',
      icon: 'doctor',
      tagType: 'robotic'
    };
  }

  if (cat.includes('neuro') || cat.includes('stroke') || cat.includes('brain')) {
    return {
      cardColor: '#a855f7',
      cardBg: '#faf7fd',
      badgeBg: '#faf5ff',
      badgeColor: '#a855f7',
      tagBg: '#faf5ff',
      tagColor: '#9333ea',
      tagBorder: '#e9d5ff',
      icon: 'brain',
      tagType: 'ai'
    };
  }

  if (cat.includes('pediatric') || cat.includes('child')) {
    return {
      cardColor: '#06b6d4',
      cardBg: '#f6fdfe',
      badgeBg: '#ecfeff',
      badgeColor: '#06b6d4',
      tagBg: '#ecfeff',
      tagColor: '#0891b2',
      tagBorder: '#cffafe',
      icon: 'users',
      tagType: 'future'
    };
  }

  if (cat.includes('ortho') || cat.includes('joint') || cat.includes('surg')) {
    return {
      cardColor: '#3b82f6',
      cardBg: '#f8faff',
      badgeBg: '#eff6ff',
      badgeColor: '#3b82f6',
      tagBg: '#eff6ff',
      tagColor: '#2563eb',
      tagBorder: '#dbeafe',
      icon: 'clamp',
      tagType: 'robotic'
    };
  }

  if (cat.includes('derma') || cat.includes('skin')) {
    return {
      cardColor: '#10b981',
      cardBg: '#f7fbf8',
      badgeBg: '#ecfdf5',
      badgeColor: '#10b981',
      tagBg: '#ecfdf5',
      tagColor: '#059669',
      tagBorder: '#a7f3d0',
      icon: 'star',
      tagType: 'imaging'
    };
  }

  if (cat.includes('robot')) {
    return {
      cardColor: '#3b82f6',
      cardBg: '#f8faff',
      badgeBg: '#eff6ff',
      badgeColor: '#3b82f6',
      tagBg: '#eff6ff',
      tagColor: '#2563eb',
      tagBorder: '#dbeafe',
      icon: 'gear',
      tagType: 'robotic'
    };
  }

  if (cat.includes('ai') || cat.includes('tech') || cat.includes('data')) {
    return {
      cardColor: '#a855f7',
      cardBg: '#faf7fd',
      badgeBg: '#faf5ff',
      badgeColor: '#a855f7',
      tagBg: '#faf5ff',
      tagColor: '#9333ea',
      tagBorder: '#e9d5ff',
      icon: 'database',
      tagType: 'ai'
    };
  }

  return {
    cardColor: '#6366f1',
    cardBg: '#fbfbfe',
    badgeBg: '#eef2ff',
    badgeColor: '#6366f1',
    tagBg: '#eef2ff',
    tagColor: '#4f46e5',
    tagBorder: '#c7d2fe',
    icon: 'podium',
    tagType: 'oral'
  };
};

// Fallback topics
const DEFAULT_TOPICS = [
  { id: 'ALL', label: 'All' },
  { id: 'cardiology', label: 'Cardiology' },
  { id: 'obstetrics and gynecology', label: 'Maternal & Gynecology' },
  { id: 'neurology', label: 'Neurology' },
  { id: 'pediatrics', label: 'Pediatrics' },
  { id: 'orthopedic surgery', label: 'Orthopedic Surgery' },
  { id: 'dermatology', label: 'Dermatology' },
  { id: 'break', label: 'Refreshment Breaks' }
];

// Fallback tracks
const DEFAULT_TRACKS = [
  { id: 'ALL', label: 'All Tracks' },
  { id: 'cardiology', label: 'Cardiology' },
  { id: 'obstetrics and gynecology', label: 'Obstetrics & Gynecology' },
  { id: 'neurology', label: 'Neurology' },
  { id: 'pediatrics', label: 'Pediatrics' },
  { id: 'orthopedic surgery', label: 'Orthopedic Surgery' },
  { id: 'dermatology', label: 'Dermatology' },
  { id: 'break', label: 'Breaks & Networking' }
];

// Transform raw API schedule list into day groups for Glance and Grid views
const transformApiSchedules = (rawList, speakerMap = {}) => {
  if (!Array.isArray(rawList) || rawList.length === 0) {
    return { activeGlanceDays: [], activeGridDays: [] };
  }

  const grouped = {};
  rawList.forEach((item) => {
    const dateKey = item.event_date || '2027-01-01';
    if (!grouped[dateKey]) grouped[dateKey] = [];
    grouped[dateKey].push(item);
  });

  const sortedDates = Object.keys(grouped).sort();

  const activeGlanceDays = sortedDates.map((dateStr, idx) => {
    const dayNumber = idx + 1;
    const [year, month, day] = dateStr.split('-').map(Number);
    const dateObj = new Date(year, (month || 1) - 1, day || 1);

    const dayOfWeek = dateObj.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });

    const badgeMonth = dateObj.toLocaleDateString('en-US', { month: 'short' }).toUpperCase();
    const badgeDate = String(day).padStart(2, '0');
    const badgeYear = String(year);

    const items = grouped[dateStr] || [];

    const sessions = items.map((s, sIdx) => {
      const timeStart = s.start_time ? s.start_time.slice(0, 5) : '09:00';
      const timeEnd = s.end_time ? s.end_time.slice(0, 5) : '10:00';
      const duration = calculateDuration(timeStart, timeEnd);
      const style = getCategoryStyle(s.category);

      let speakerName;
      if (s.speaker_id) {
        speakerName = speakerMap[s.speaker_id] || `Speaker #${s.speaker_id}`;
      } else if (s.category && s.category.toLowerCase().includes('break')) {
        speakerName = 'Hospitality & Refreshments';
      } else {
        speakerName = 'Organizing Committee';
      }

      const venueName = s.room && s.venue ? `${s.room} — ${s.venue}` : (s.room || s.venue || 'Main Hall');

      return {
        id: `api-glance-${s.id || sIdx}`,
        rawId: s.id,
        timeStart,
        timeEnd,
        duration,
        title: s.title || 'Scientific Session',
        hall: venueName,
        category: (s.category || 'general').toLowerCase(),
        rawCategory: s.category || 'General',
        categoryLabel: (s.category || 'GENERAL').toUpperCase(),
        cardColor: style.cardColor,
        cardBg: style.cardBg,
        badgeBg: style.badgeBg,
        badgeColor: style.badgeColor,
        tagBg: style.tagBg,
        tagColor: style.tagColor,
        tagBorder: style.tagBorder,
        icon: style.icon,
        speaker: speakerName,
        description: s.description || ''
      };
    });

    const uniqueSpeakers = new Set(
      sessions
        .map((s) => s.speaker)
        .filter((spk) => spk && !spk.includes('Hospitality') && !spk.includes('Committee'))
    ).size;

    const uniqueCategories = new Set(sessions.map((s) => s.rawCategory)).size;

    return {
      dayNumber,
      dayTitle: `Day ${dayNumber}`,
      dayOfWeek,
      badgeMonth,
      badgeDate,
      badgeYear,
      stats: {
        sessionsCount: String(sessions.length),
        sessionsLabel: 'Sessions',
        speakersCount: String(uniqueSpeakers || sessions.length),
        speakersLabel: 'Speakers',
        tracksCount: String(uniqueCategories || 1),
        tracksLabel: 'Tracks'
      },
      sessions
    };
  });

  const activeGridDays = sortedDates.map((dateStr, idx) => {
    const dayNumber = idx + 1;
    const [year, month, day] = dateStr.split('-').map(Number);
    const dateObj = new Date(year, (month || 1) - 1, day || 1);

    const badgeMonth = dateObj.toLocaleDateString('en-US', { month: 'short' }).toUpperCase();
    const badgeDate = String(day).padStart(2, '0');
    const badgeYear = String(year);
    const dayId = `D${dayNumber}`;

    const items = grouped[dateStr] || [];

    const sessions = items.map((s, sIdx) => {
      const timeStart = s.start_time ? s.start_time.slice(0, 5) : '09:00';
      const timeEnd = s.end_time ? s.end_time.slice(0, 5) : '10:00';
      const duration = calculateDuration(timeStart, timeEnd);
      const style = getCategoryStyle(s.category);

      let speakerName;
      if (s.speaker_id) {
        speakerName = speakerMap[s.speaker_id] || `Speaker #${s.speaker_id}`;
      } else if (s.category && s.category.toLowerCase().includes('break')) {
        speakerName = 'Hospitality & Refreshments';
      } else {
        speakerName = 'Organizing Committee';
      }

      const venueName = s.room && s.venue ? `${s.room} — ${s.venue}` : (s.room || s.venue || 'Main Hall');

      return {
        id: `api-grid-${s.id || sIdx}`,
        rawId: s.id,
        time: `${timeStart} - ${timeEnd}`,
        duration,
        icon: style.icon,
        title: s.title || 'Scientific Session',
        desc: s.description || '',
        rawCategory: s.category || 'General',
        tags: [
          { label: s.category && s.category.toLowerCase().includes('break') ? 'BREAK' : 'ORAL', type: style.tagType },
          ...(s.category ? [{ label: s.category.toUpperCase(), type: style.tagType }] : [])
        ],
        speaker: speakerName,
        venue: venueName,
        hall: venueName
      };
    });

    return {
      dayId,
      dayNumber,
      title: `Day ${dayNumber} — ${dateObj.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}`,
      badgeMonth,
      badgeDate,
      badgeYear,
      sessionsCount: `${sessions.length} Session${sessions.length > 1 ? 's' : ''}`,
      sessions
    };
  });

  return { activeGlanceDays, activeGridDays };
};

export default function ProgrammePage() {
  const [activeTab, setActiveTab] = useState('sessions');
  const [selectedTopic, setSelectedTopic] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTrack, setSelectedTrack] = useState('ALL');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [selectedSession, setSelectedSession] = useState(null);
  const [activeMobileDay, setActiveMobileDay] = useState(1);

  // Dynamic API state
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [apiSchedules, setApiSchedules] = useState([]);
  const [speakersList, setSpeakersList] = useState([]);

  // Fetch schedules and speakers from API (for manual retry)
  const fetchProgrammeData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const [schedRes, spkRes] = await Promise.allSettled([
        getSchedules(),
        getSpeakers()
      ]);

      if (spkRes.status === 'fulfilled') {
        const rawSpeakers = Array.isArray(spkRes.value) ? spkRes.value : (spkRes.value?.results || []);
        setSpeakersList(rawSpeakers);
      }

      if (schedRes.status === 'fulfilled') {
        const rawSchedules = Array.isArray(schedRes.value) ? schedRes.value : (schedRes.value?.results || []);
        setApiSchedules(rawSchedules);
      } else {
        throw new Error(schedRes.reason?.message || 'Failed to fetch schedules');
      }
    } catch (err) {
      console.error('Error fetching programme API:', err);
      setError(err.message || 'Unable to load schedule data');
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    let isCurrent = true;

    async function loadInitialData() {
      try {
        const [schedRes, spkRes] = await Promise.allSettled([
          getSchedules(),
          getSpeakers()
        ]);

        if (!isCurrent) return;

        if (spkRes.status === 'fulfilled') {
          const rawSpeakers = Array.isArray(spkRes.value) ? spkRes.value : (spkRes.value?.results || []);
          setSpeakersList(rawSpeakers);
        }

        if (schedRes.status === 'fulfilled') {
          const rawSchedules = Array.isArray(schedRes.value) ? schedRes.value : (schedRes.value?.results || []);
          setApiSchedules(rawSchedules);
        } else {
          throw new Error(schedRes.reason?.message || 'Failed to fetch schedules');
        }
      } catch (err) {
        if (isCurrent) {
          console.error('Error fetching programme API:', err);
          setError(err.message || 'Unable to load schedule data');
        }
      } finally {
        if (isCurrent) {
          setLoading(false);
        }
      }
    }

    loadInitialData();

    return () => {
      isCurrent = false;
    };
  }, []);

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

  // Map of speaker_id -> Doctor's full name
  const speakerMap = useMemo(() => {
    const map = {};
    speakersList.forEach((spk) => {
      const id = spk.id ?? spk.speaker_id;
      if (id !== undefined && id !== null) {
        const firstName = spk.first_name || '';
        const lastName = spk.last_name || '';
        const fullName = `${firstName} ${lastName}`.trim();
        map[id] = fullName ? `Dr. ${fullName}` : 'Specialist Faculty';
      }
    });
    return map;
  }, [speakersList]);

  // Formatted datasets for both views
  const { activeGlanceDays, activeGridDays } = useMemo(() => {
    return transformApiSchedules(apiSchedules, speakerMap);
  }, [apiSchedules, speakerMap]);

  // Dynamic topics extracted from API categories
  const topicsBarItems = useMemo(() => {
    if (!apiSchedules || apiSchedules.length === 0) {
      return DEFAULT_TOPICS;
    }
    const categorySet = new Set();
    apiSchedules.forEach((item) => {
      if (item.category) categorySet.add(item.category);
    });
    return [
      { id: 'ALL', label: 'All' },
      ...Array.from(categorySet).map((cat) => ({
        id: cat.toLowerCase(),
        label: cat
      }))
    ];
  }, [apiSchedules]);

  // Dynamic tracks filter dropdown
  const allTracks = useMemo(() => {
    if (!apiSchedules || apiSchedules.length === 0) {
      return DEFAULT_TRACKS;
    }
    const categorySet = new Set();
    apiSchedules.forEach((item) => {
      if (item.category) categorySet.add(item.category);
    });
    return [
      { id: 'ALL', label: 'All Tracks' },
      ...Array.from(categorySet).map((cat) => ({
        id: cat.toLowerCase(),
        label: cat
      }))
    ];
  }, [apiSchedules]);

  // Header meta derived from active data
  const activeVenueName = useMemo(() => {
    if (apiSchedules && apiSchedules.length > 0) {
      const found = apiSchedules.find((s) => s.venue);
      if (found) return found.venue;
    }
    return 'RK Hospital Conference Hall';
  }, [apiSchedules]);

  const activeDateRange = useMemo(() => {
    if (activeGlanceDays && activeGlanceDays.length > 0) {
      const first = activeGlanceDays[0];
      const last = activeGlanceDays[activeGlanceDays.length - 1];
      if (first?.badgeDate && last?.badgeDate) {
        return `${parseInt(first.badgeDate, 10)} – ${parseInt(last.badgeDate, 10)} January 2027`;
      }
    }
    return '1 – 3 January 2027';
  }, [activeGlanceDays]);

  // Filtered dataset for Glance view
  const filteredGlanceProgramme = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return activeGlanceDays.map((day) => {
      const filteredSessions = day.sessions.filter((session) => {
        if (selectedTopic !== 'ALL') {
          const matchCat = (session.category || '').toLowerCase().includes(selectedTopic.toLowerCase());
          const matchLabel = (session.categoryLabel || '').toLowerCase().includes(selectedTopic.toLowerCase());
          const matchTitle = (session.title || '').toLowerCase().includes(selectedTopic.toLowerCase());
          if (!matchCat && !matchLabel && !matchTitle) return false;
        }

        if (selectedTrack !== 'ALL') {
          const matchCat = (session.category || '').toLowerCase().includes(selectedTrack.toLowerCase());
          const matchLabel = (session.categoryLabel || '').toLowerCase().includes(selectedTrack.toLowerCase());
          if (!matchCat && !matchLabel) return false;
        }

        if (!query) return true;
        const inTitle = (session.title || '').toLowerCase().includes(query);
        const inHall = (session.hall || '').toLowerCase().includes(query);
        const inTag = (session.categoryLabel || '').toLowerCase().includes(query);
        const inSpeaker = (session.speaker || '').toLowerCase().includes(query);
        const inDesc = (session.description || '').toLowerCase().includes(query);

        return inTitle || inHall || inTag || inSpeaker || inDesc;
      });

      return {
        ...day,
        sessions: filteredSessions
      };
    });
  }, [activeGlanceDays, searchQuery, selectedTrack, selectedTopic]);

  // Filtered dataset for Sessions view
  const filteredSessionsGrid = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return activeGridDays.map((day) => {
      const filtered = day.sessions.filter((s) => {
        if (selectedTopic !== 'ALL') {
          const inTags = s.tags && s.tags.some(t => t.label.toLowerCase().includes(selectedTopic.toLowerCase()) || (t.type && t.type.toLowerCase().includes(selectedTopic.toLowerCase())));
          const inTitle = (s.title || '').toLowerCase().includes(selectedTopic.toLowerCase());
          const inCat = (s.rawCategory || '').toLowerCase().includes(selectedTopic.toLowerCase());
          if (!inTags && !inTitle && !inCat) return false;
        }

        if (!query) return true;
        const inTitle = (s.title || '').toLowerCase().includes(query);
        const inVenue = (s.venue || '').toLowerCase().includes(query);
        const inSpeaker = (s.speaker || '').toLowerCase().includes(query);
        const inDesc = (s.desc || '').toLowerCase().includes(query);
        const inTags = s.tags && s.tags.some(t => t.label.toLowerCase().includes(query));

        return inTitle || inVenue || inSpeaker || inDesc || inTags;
      });

      return {
        ...day,
        sessions: filtered
      };
    });
  }, [activeGridDays, searchQuery, selectedTopic]);

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
                <span className="kz-header-meta-primary">{activeDateRange}</span>
              </div>
            </div>

            <span className="kz-header-meta-divider" aria-hidden="true" />

            <div className="kz-header-meta-item">
              <span className="kz-header-meta-icon" aria-hidden="true">
                <LuMapPin size={20} />
              </span>
              <div className="kz-header-meta-text">
                <span className="kz-header-meta-primary">{activeVenueName}</span>
                <span className="kz-header-meta-secondary">Ahmedabad, India &rarr;</span>
              </div>
            </div>
          </div>
        </header>

        {/* Loading and Error Feedback */}
        {loading && (
          <div
            style={{
              padding: '14px 20px',
              margin: '0 0 20px 0',
              borderRadius: '12px',
              background: '#fdf2f8',
              border: '1px solid rgba(170, 45, 123, 0.2)',
              color: '#aa2d7b',
              fontSize: '0.92rem',
              fontWeight: 500,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px'
            }}
          >
            <LuClock size={16} />
            <span>Loading conference schedule from server...</span>
          </div>
        )}

        {error && (
          <div
            style={{
              padding: '14px 20px',
              margin: '0 0 20px 0',
              borderRadius: '12px',
              background: '#fff1f2',
              border: '1px solid #fecdd3',
              color: '#be123c',
              fontSize: '0.9rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '12px'
            }}
          >
            <span>Unable to load schedules from server ({error}).</span>
            <button
              type="button"
              onClick={fetchProgrammeData}
              style={{
                background: '#be123c',
                color: '#ffffff',
                border: 'none',
                padding: '6px 14px',
                borderRadius: '6px',
                fontSize: '0.82rem',
                fontWeight: 650,
                cursor: 'pointer'
              }}
            >
              Retry
            </button>
          </div>
        )}

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
          {activeGlanceDays.map((d) => (
            <button
              key={d.dayNumber}
              type="button"
              className={`kz-mobile-day-btn ${activeMobileDay === d.dayNumber ? 'is-active' : ''}`}
              onClick={() => setActiveMobileDay(d.dayNumber)}
            >
              Day {d.dayNumber} ({d.badgeMonth || 'Jan'} {d.badgeDate || d.dayNumber})
            </button>
          ))}
        </div>

      
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
                    setActiveTab('sessions');
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
