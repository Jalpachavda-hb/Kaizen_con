import React, { useState } from 'react';
import './Hero.css';
import { downloadBrochure } from '../../services/brochureService';

export default function Hero() {
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState(null);

  const handleDownloadBrochure = async () => {
    if (isDownloading) return;

    setIsDownloading(true);
    setDownloadError(null);

    try {
      await downloadBrochure();
    } catch (err) {
      console.error('Download error:', err);
      const msg =
        err.status === 404
          ? 'The conference brochure is currently being updated. Please check back shortly.'
          : err.message || 'Failed to download brochure. Please try again.';
      setDownloadError(msg);

      setTimeout(() => {
        setDownloadError(null);
      }, 6000);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <section className="kz-hero-section" id="home" aria-label="KaizenCon 2027 Hero">
      {/* Blueprint Grid Overlay */}
      <div className="kz-hero-bg-grid" aria-hidden="true" />

      {/* Pink Overlay on top of banner image */}
      <div className="kz-hero-overlay-pink" aria-hidden="true" />

      {/* Main Hero Container */}
      <div className="kz-hero-container">
        <div className="kz-hero-content">
          {/* 1. Top Pill Badge: KAIZENCON 2027 • 1-3 JANUARY • INTERNATIONAL CONFERENCE */}
          <div className="kz-hero-badge-wrapper">
            <div className="kz-hero-badge">
              <svg
                className="kz-hero-badge-icon"
                viewBox="0 0 16 16"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
              >
                <rect x="2.5" y="2" width="11" height="12" rx="2.2" stroke="currentColor" strokeWidth="1.3" />
                <path d="M5.5 1.5V3M10.5 1.5V3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
                <path d="M2.5 5.5H13.5" stroke="currentColor" strokeWidth="1.2" />
                <circle cx="5.5" cy="8.5" r="0.8" fill="currentColor" />
                <circle cx="8" cy="8.5" r="0.8" fill="currentColor" />
                <circle cx="10.5" cy="8.5" r="0.8" fill="currentColor" />
                <circle cx="5.5" cy="11" r="0.8" fill="currentColor" />
                <circle cx="8" cy="11" r="0.8" fill="currentColor" />
              </svg>
              <span className="kz-hero-badge-text">
                KAIZENCON 2027 • 1–3 JANUARY • INTERNATIONAL CONFERENCE
              </span>
            </div>
          </div>

          {/* 2. 3-Line Headline matching exact reference image */}
          <h1 className="kz-hero-title">
            <span className="kz-hero-title-line title-line-1">Where Human Expertise</span>
            <span className="kz-hero-title-line title-line-2">Meets Artificial Intelligence</span>
          </h1>

          {/* 3. Subtitle / Description */}
          <p className="kz-hero-description">
            The Future of Surgery, Technology &amp; Intelligent Healthcare. Three days. 150+ expert faculty. One shared vision: augmenting clinical excellence with AI.
          </p>

          {/* 4. Action Buttons */}
          <div className="kz-hero-actions">
            <button
              type="button"
              onClick={handleDownloadBrochure}
              disabled={isDownloading}
              className="kz-btn kz-btn-primary"
              aria-label="Download Brochure"
            >
              {isDownloading ? (
                <>
                  <svg
                    className="kz-btn-spinner"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    aria-hidden="true"
                  >
                    <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2.5" strokeDasharray="36" strokeLinecap="round" />
                  </svg>
                  <span>Downloading...</span>
                </>
              ) : (
                <>
                  <span>Download Brochure</span>
                  <svg className="kz-btn-arrow" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                    <path d="M3 8H13M13 8L9 4M13 8L9 12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </>
              )}
            </button>

            {downloadError && (
              <div
                className="kz-hero-download-error"
                role="alert"
                style={{
                  marginTop: '12px',
                  fontSize: '0.85rem',
                  color: '#AA2D7B',
                  background: 'rgba(255, 255, 255, 0.95)',
                  padding: '7px 14px',
                  borderRadius: '10px',
                  border: '1px solid rgba(170, 45, 123, 0.3)',
                  boxShadow: '0 2px 10px rgba(0, 0, 0, 0.06)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  maxWidth: '100%',
                }}
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                <span>{downloadError}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
