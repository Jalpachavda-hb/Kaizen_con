import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import SpeakerCard from './SpeakerCard';
import './SpeakersSection.css';
import { getSpeakers, getSchedules, getImageUrl } from '../../Apipath';

export default function SpeakersSection() {
  const navigate = useNavigate();
  const [speakers, setSpeakers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const fetchFeaturedFaculty = async () => {
      try {
        setLoading(true);

        // Fetch speakers and schedules simultaneously to map real session topics
        const [speakersRes, schedulesRes] = await Promise.allSettled([
          getSpeakers(),
          getSchedules(),
        ]);

        const rawSpeakers =
          speakersRes.status === 'fulfilled'
            ? Array.isArray(speakersRes.value?.results)
              ? speakersRes.value.results
              : Array.isArray(speakersRes.value)
              ? speakersRes.value
              : []
            : [];

        const rawSchedules =
          schedulesRes.status === 'fulfilled'
            ? Array.isArray(schedulesRes.value?.results)
              ? schedulesRes.value.results
              : Array.isArray(schedulesRes.value)
              ? schedulesRes.value
              : []
            : [];

        // Filter active faculty
        const activeFaculty = rawSpeakers.filter(
          (spk) => spk.is_active !== false && !spk.is_deleted
        );

        const mapped = activeFaculty.map((spk, idx) => {
          const fullName = `${spk.first_name || ''} ${spk.last_name || ''}`.trim() || 'Distinguished Faculty';
          const initials = fullName
            .replace(/^Dr\.\s*/i, '')
            .split(' ')
            .map((n) => n[0])
            .slice(0, 2)
            .join('')
            .toUpperCase() || 'FC';

          // Match schedules assigned to this faculty member
          const speakerSchedules = rawSchedules.filter((sch) =>
            Array.isArray(sch.speakers) &&
            sch.speakers.some((s) => s.id === spk.id || s.speaker_id === spk.speaker_id)
          );

          // Real topic from schedule, or speaker topic/speciality
          const topic =
            speakerSchedules[0]?.title ||
            spk.topic ||
            (spk.speciality ? `${spk.speciality} & Clinical Advances` : 'Clinical Excellence & Surgical Innovation');

          // Real session count
          const sessionCount = speakerSchedules.length;
          const sessions = sessionCount > 0
            ? `${sessionCount} Session${sessionCount > 1 ? 's' : ''}`
            : '1 Session';

          return {
            id: spk.id || spk.speaker_id || `spk-${idx}`,
            initials,
            image: spk.profile_image_url ? getImageUrl(spk.profile_image_url) : '',
            name: fullName,
            role: spk.designation || 'Faculty Specialist',
            topic,
            sessions,
            bio: spk.bio || '',
          };
        });

        if (isMounted) {
          // Display top 3 featured faculty members
          setSpeakers(mapped.slice(0, 3));
        }
      } catch (error) {
        console.error('Error fetching featured faculty:', error);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchFeaturedFaculty();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <section className="kz-featured-speakers-section" id="faculty" aria-label="Featured Faculty">
      <div className="kz-featured-speakers-container">
        {/* Header Bar */}
        <div className="kz-speakers-top-bar">
          <div className="kz-speakers-header-left">
            <div className="kz-speakers-pill-tag">
              <span className="kz-speakers-tag-label">FACULTY</span>
            </div>

            <h2 className="kz-speakers-main-title">
              Featured <span className="kz-speakers-title-magenta">Faculty</span>
            </h2>

            <div className="kz-speakers-title-underline" aria-hidden="true" />
          </div>

          <Link to="/faculty" className="kz-speakers-all-link" aria-label="View all conference faculty">
            <span>All faculty</span>
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

        {/* Dynamic Featured Faculty Grid */}
        {loading ? (
          <div className="kz-featured-speakers-loading" style={{ textAlign: 'center', padding: '40px 0', color: '#6b7280' }}>
            Loading faculty profiles...
          </div>
        ) : speakers.length > 0 ? (
          <div className="kz-featured-speakers-grid">
            {speakers.map((spk) => (
              <SpeakerCard
                key={spk.id}
                id={spk.id}
                initials={spk.initials}
                image={spk.image}
                name={spk.name}
                role={spk.role}
                topic={spk.topic}
                sessions={spk.sessions}
                bio={spk.bio}
                onViewDetails={() => navigate('/faculty')}
              />
            ))}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '40px 0', color: '#6b7280' }}>
            Faculty schedule will be updated shortly.
          </div>
        )}
      </div>
    </section>
  );
}
