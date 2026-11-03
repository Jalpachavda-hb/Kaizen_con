import './ConferenceVenue.css';
import venueShapeImg from '../../assets/venue_shape.png';
import { HiOutlineUserGroup } from 'react-icons/hi';
import { IoBedOutline } from 'react-icons/io5';
import { LuUtensils, LuMapPin } from 'react-icons/lu';
import { FaLocationDot } from 'react-icons/fa6';

export default function ConferenceVenue() {
  const googleMapsUrl =
    'https://www.google.com/maps/search/?api=1&query=Hyatt+Regency+Ahmedabad+Ashram+Road+Gujarat';

  return (
    <section className="kz-venue-section" aria-label="Conference Venue">
      <div className="kz-venue-container">
        {/* Section Header */}
        <div className="kz-venue-header">
          <div className="kz-venue-eyebrow-wrap">
            <span className="kz-venue-eyebrow-line"></span>
            <span className="kz-venue-eyebrow-text">KAIZENCON 2027</span>
            <span className="kz-venue-eyebrow-line"></span>
          </div>
          <h2 className="kz-venue-title">Conference Venue</h2>
        </div>

        {/* Presentation Grid */}
        <div className="kz-venue-grid">
          {/* Left: Complete Unclipped Shaped Image (Shows FIRST on mobile) */}
          <div className="kz-venue-image-col">
            <img
              src={venueShapeImg}
              alt="Hyatt Regency Ahmedabad"
              className="kz-venue-shape-img"
              loading="lazy"
            />
          </div>

          {/* Right: Venue Content (Shows AFTER on mobile) */}
          <div className="kz-venue-content-col">
            {/* Hotel Name & Location Header */}
            <div className="kz-venue-location-header">
              <div className="kz-venue-loc-icon-box" aria-hidden="true">
                <FaLocationDot className="kz-venue-loc-icon" />
              </div>
              <div className="kz-venue-loc-info">
                <h3 className="kz-venue-hotel-name">Hyatt Regency Ahmedabad</h3>
                <p className="kz-venue-hotel-address">
                  Ashram Road, Ahmedabad, Gujarat – 380009, India
                </p>
              </div>
            </div>

            {/* Description */}
            <p className="kz-venue-description">
              KaizenCon 2027 will be hosted at the Hyatt Regency Ahmedabad, a premier
              5-star venue offering world-class conference facilities, modern amenities,
              and a comfortable stay for our delegates.
            </p>

            {/* 4 Feature Highlights matching mockup */}
            <div className="kz-venue-features-row">
              {/* Feature 1: Conference Halls */}
              <div className="kz-venue-feature-item">
                <div className="kz-venue-feature-icon-box" aria-hidden="true">
                  <HiOutlineUserGroup className="kz-venue-feature-icon" />
                </div>
                <span className="kz-venue-feature-text">
                  State-of-the-art<br />Conference Halls
                </span>
              </div>

              <div className="kz-venue-feature-divider" aria-hidden="true"></div>

              {/* Feature 2: Accommodation */}
              <div className="kz-venue-feature-item">
                <div className="kz-venue-feature-icon-box" aria-hidden="true">
                  <IoBedOutline className="kz-venue-feature-icon" />
                </div>
                <span className="kz-venue-feature-text">
                  Premium<br />Accommodation
                </span>
              </div>

              <div className="kz-venue-feature-divider" aria-hidden="true"></div>

              {/* Feature 3: Dining */}
              <div className="kz-venue-feature-item">
                <div className="kz-venue-feature-icon-box" aria-hidden="true">
                  <LuUtensils className="kz-venue-feature-icon" />
                </div>
                <span className="kz-venue-feature-text">
                  Multiple Dining<br />Options
                </span>
              </div>

              <div className="kz-venue-feature-divider" aria-hidden="true"></div>

              {/* Feature 4: Central Location & Easy Access (Pin + Route Access) */}
              <div className="kz-venue-feature-item">
                <div className="kz-venue-feature-icon-box" aria-hidden="true">
                  {/* Clean SVG matching pin + route access outline */}
                  <svg
                    className="kz-venue-feature-icon"
                    width="22"
                    height="22"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.9"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M16.5 2.5a3.5 3.5 0 0 1 3.5 3.5c0 2.8-3.5 6.5-3.5 6.5s-3.5-3.7-3.5-6.5a3.5 3.5 0 0 1 3.5-3.5z" />
                    <circle cx="16.5" cy="6" r="1.2" />
                    <path d="M3 18.5c3.5-1.2 6.5-.5 9.5.5s6 0 8.5-1" />
                    <path d="M4 17l1.5-2.5h3L10 17H4z" />
                    <circle cx="5.5" cy="18.5" r="0.8" />
                    <circle cx="8.5" cy="18.5" r="0.8" />
                  </svg>
                </div>
                <span className="kz-venue-feature-text">
                  Central Location<br />&amp; Easy Access
                </span>
              </div>
            </div>

            {/* Centered View on Map CTA Button */}
            <div className="kz-venue-btn-wrapper">
              <a
                href={googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="kz-venue-map-btn"
                aria-label="View Hyatt Regency Ahmedabad on Google Maps"
              >
                <span>View on Map</span>
                <svg
                  className="kz-venue-btn-arrow"
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <line x1="7" y1="17" x2="17" y2="7"></line>
                  <polyline points="7 7 17 7 17 17"></polyline>
                </svg>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
