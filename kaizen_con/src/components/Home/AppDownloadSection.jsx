import React from 'react';
import './AppDownloadSection.css';
import bgPattern from '../../assets/bg.svg';
import mascotKai from '../../assets/kai.png';
import phoneMockup from '../../assets/mockup.png';
import playStoreBadge from '../../assets/playstore.png';
import appStoreBadge from '../../assets/appstore.png';

export default function AppDownloadSection() {
  return (
    <section className="kz-app-download-section" aria-label="Download Our App">
      <div className="kz-app-download-container">
        <div className="kz-app-banner-card">
          {/* Background constellation pattern touching borders with 10% opacity */}
          <img
            src={bgPattern}
            alt=""
            className="kz-app-bg-pattern kz-app-bg-pattern-left"
            aria-hidden="true"
          />
          <img
            src={bgPattern}
            alt=""
            className="kz-app-bg-pattern kz-app-bg-pattern-right"
            aria-hidden="true"
          />

          <div className="kz-app-content-row">
            {/* Left Column: Heading, Subtext & Store Badges */}
            <div className="kz-app-text-col">
              <h2 className="kz-app-heading">Download Our App</h2>
              <p className="kz-app-subtext">
                Get the complete KAIZENCON 2027 experience on the go. Access sessions, abstracts, live Q&amp;A, event updates and more.
              </p>

              <div className="kz-app-buttons-group">
                <a
                  href="https://play.google.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="kz-app-store-btn"
                  aria-label="Get it soon on Google Play"
                >
                  <img
                    src={playStoreBadge}
                    alt="Get It Soon On Google Play"
                    className="kz-app-badge-img"
                    loading="lazy"
                  />
                </a>

                <a
                  href="https://www.apple.com/app-store/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="kz-app-store-btn"
                  aria-label="Get it soon on App Store"
                >
                  <img
                    src={appStoreBadge}
                    alt="Get It Soon On App Store"
                    className="kz-app-badge-img"
                    loading="lazy"
                  />
                </a>
              </div>
            </div>

            {/* Right Column: Kai Mascot & Mockup with Proper Space Between Them */}
            <div className="kz-app-visuals-col">
              <div className="kz-app-visuals-stage">
                <div className="kz-app-mascot-wrap">
                  <img
                    src={mascotKai}
                    alt="KaizenCon Robot Assistant Mascot"
                    className="kz-app-mascot-img"
                    loading="lazy"
                  />
                </div>
                <div className="kz-app-mockup-wrap">
                  <img
                    src={phoneMockup}
                    alt="KaizenCon Mobile App Screen Mockups"
                    className="kz-app-mockup-img"
                    loading="lazy"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
