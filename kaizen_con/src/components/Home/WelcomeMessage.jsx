import React from 'react';
import './WelcomeMessage.css';
import doctorImg from '../../assets/drsanjivharibhakti_clean.jpg';

export default function WelcomeMessage() {
  return (
    <section className="kz-welcome-section" id="welcome-message" aria-label="Welcome Message">
      <div className="kz-welcome-container">
        {/* Top Header: Subtitle & Title */}
        <div className="kz-welcome-header">
          <div className="kz-welcome-eyebrow-wrap">
            <span className="kz-welcome-eyebrow-line"></span>
            <span className="kz-welcome-eyebrow-text">KAIZENCON 2027</span>
            <span className="kz-welcome-eyebrow-line"></span>
          </div>

          <h2 className="kz-welcome-title">Welcome Message</h2>
          <div className="kz-welcome-title-bar"></div>
        </div>

        {/* Main White Content Card */}
        <div className="kz-welcome-card">
          {/* Left Column: Doctor Portrait with Anchored Plum Badge */}
          <div className="kz-welcome-left">
            <div className="kz-welcome-photo-wrap">
              <img
                src={doctorImg}
                alt="Dr. Sanjiv Haribhakti - Congress President, KAIZENCON 2027"
                className="kz-welcome-photo"
                loading="eager"
              />

              {/* Dark plum info badge pinned to bottom of photo with zero gap */}
              <div className="kz-welcome-badge">
                <div className="kz-welcome-badge-body">
                  <h3 className="kz-welcome-badge-name">Dr. Sanjiv Haribhakti</h3>
                  <div className="kz-welcome-badge-sub">
                    <p className="kz-welcome-badge-role">Congress President,</p>
                    <p className="kz-welcome-badge-role">KAIZENCON 2027</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Full Letter Content */}
          <div className="kz-welcome-right">
            <h3 className="kz-welcome-salutation">Dear Friends and Colleagues,</h3>

            {/* Highlighted Welcome Statement */}
            <div className="kz-welcome-highlight">
              It is my privilege to welcome you to <strong>KAIZENCON 2027, Robotics &amp; AI: Shaping the Future of GI Surgery</strong>, at the Hyatt Regency, Ashram Road, Ahmedabad, from 1 to 3 January 2027.
            </div>

            {/* Paragraph 1 */}
            <p className="kz-welcome-para">
              Robotic surgery in India stands at an inflection point. Newer, cost-effective robotic platforms are bringing this technology within reach of many more hospitals and surgeons, yet it is not routine in our country. At the same time, artificial intelligence is beginning to change how we learn, plan and operate. The surgeons who act now will shape how these tools serve our patients.
            </p>

            {/* Paragraph 2 */}
            <p className="kz-welcome-para">
              KAIZENCON 2027 is a unique AI native meeting, the first of its kind, created to help Indian surgeons adapt to the future. It is designed for general and GI surgeons who perform laparoscopic or robotic surgery, whether you are starting your laparoscopic or robotic journey, or already established in it. Our aim is practical: clear evidence, honest discussion, and skills you can take back to your own operating room.
            </p>

            {/* Paragraph 3 */}
            <p className="kz-welcome-para">
              I thank our endorsing associations, academic partners and distinguished national and international faculty for their support. I warmly invite young surgeons to share their work through video abstracts.
            </p>

            {/* Early-Bird Deadline Alert Card */}
            <div className="kz-welcome-notice">
              <div className="kz-welcome-notice-icon" aria-hidden="true">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  {/* Calendar Outline */}
                  <rect x="3" y="4" width="18" height="17" rx="3" stroke="#ffffff" strokeWidth="2" />
                  <line x1="3" y1="9" x2="21" y2="9" stroke="#ffffff" strokeWidth="1.8" />
                  {/* Calendar Top Rings */}
                  <line x1="7.5" y1="2" x2="7.5" y2="5" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" />
                  <line x1="16.5" y1="2" x2="16.5" y2="5" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" />
                  {/* Calendar Grid Dots */}
                  <rect x="7" y="12" width="2" height="2" rx="0.5" fill="#ffffff" />
                  <rect x="11" y="12" width="2" height="2" rx="0.5" fill="#ffffff" />
                  <rect x="15" y="12" width="2" height="2" rx="0.5" fill="#ffffff" />
                  <rect x="7" y="15.5" width="2" height="2" rx="0.5" fill="#ffffff" />
                  <rect x="11" y="15.5" width="2" height="2" rx="0.5" fill="#ffffff" />
                  <rect x="15" y="15.5" width="2" height="2" rx="0.5" fill="#ffffff" />
                </svg>
              </div>
              <div className="kz-welcome-notice-text">
                <div className="kz-welcome-notice-title">
                  Early-bird registration and video abstract submissions close on 15th November 2026.
                </div>
                <div className="kz-welcome-notice-desc">
                  Come to Ahmedabad, welcome the New Year with us, and be part of the change.
                </div>
              </div>
            </div>

            {/* Closing with horizontal accent underline */}
            <div className="kz-welcome-closing">
              <p className="kz-welcome-closing-text">With warm regards,</p>
              <div className="kz-welcome-closing-bar"></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
