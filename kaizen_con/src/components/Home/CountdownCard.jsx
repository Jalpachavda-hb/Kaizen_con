import React, { useState, useEffect } from 'react';
import './CountdownCard.css';
import timerBgImg from '../../assets/home/confrence.png';

const calculateTimeLeft = () => {
  // Target: 1 January 2027 00:00:00 local time
  const targetDate = new Date(2027, 0, 1, 0, 0, 0);
  const now = new Date();
  const diff = targetDate.getTime() - now.getTime();

  if (diff <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, isPast: true };
  }

  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
    isPast: false
  };
};

export default function CountdownCard() {
  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatNumber = (num) => String(num).padStart(2, '0');

  return (
    <div className="countdown-wrapper" aria-label="KaizenCon 2027 Countdown">
      <div className="countdown-card">
        {/* Conference microphone and floral table background on the right */}
        <div
          className="countdown-bg-image"
          style={{ backgroundImage: `url(${timerBgImg})` }}
          aria-hidden="true"
        />
        <div className="countdown-bg-overlay" aria-hidden="true" />

        {/* Main Countdown Row */}
        <div className="countdown-main">
          {/* Left: Starts In Title Stack */}
          <div className="countdown-headline-group">
            <div className="countdown-icon-calendar" aria-hidden="true">
              <svg viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="4.5" y="8.5" width="35" height="31" rx="8" stroke="#D81B72" strokeWidth="2.8" />
                <path d="M13.5 4.5V10.5M30.5 4.5V10.5" stroke="#D81B72" strokeWidth="2.8" strokeLinecap="round" />
                <path d="M4.5 17.5H39.5" stroke="#D81B72" strokeWidth="2.4" />
                <circle cx="14" cy="24.5" r="2.2" fill="#D81B72" />
                <circle cx="22" cy="24.5" r="2.2" fill="#D81B72" />
                <circle cx="30" cy="24.5" r="2.2" fill="#D81B72" />
                <circle cx="14" cy="32" r="2.2" fill="#D81B72" />
                <circle cx="22" cy="32" r="2.2" fill="#D81B72" />
                <circle cx="30" cy="32" r="2.2" fill="#D81B72" />
              </svg>
            </div>
            <div className="countdown-title-stack">
              <span className="countdown-conf-title">KaizenCon 2027</span>
              <span className="countdown-starts-in">Starts In</span>
            </div>
          </div>

          <div className="countdown-main-divider" aria-hidden="true" />

          {/* 4 Separate Countdown Tiles */}
          <div className="countdown-timer" role="timer" aria-live="polite">
            <div className="countdown-tile">
              <span className="countdown-number">{formatNumber(timeLeft.days)}</span>
              <span className="countdown-unit">Days</span>
            </div>

            <div className="countdown-tile-sep" aria-hidden="true" />

            <div className="countdown-tile">
              <span className="countdown-number">{formatNumber(timeLeft.hours)}</span>
              <span className="countdown-unit">Hours</span>
            </div>

            <div className="countdown-tile-sep" aria-hidden="true" />

            <div className="countdown-tile">
              <span className="countdown-number">{formatNumber(timeLeft.minutes)}</span>
              <span className="countdown-unit">Minutes</span>
            </div>

            <div className="countdown-tile-sep" aria-hidden="true" />

            <div className="countdown-tile">
              <span className="countdown-number">{formatNumber(timeLeft.seconds)}</span>
              <span className="countdown-unit">Seconds</span>
            </div>
          </div>
        </div>

        {/* Subtle Horizontal Divider */}
        <div className="countdown-h-divider" aria-hidden="true" />

        {/* Event Information Row */}
        <div className="countdown-event-info">
          <div className="countdown-info-item">
            <svg
              className="countdown-info-icon"
              viewBox="0 0 20 20"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <rect x="2.5" y="3.5" width="15" height="14" rx="3" />
              <path d="M6 1.5V4M14 1.5V4M2.5 7.5H17.5" />
              <circle cx="6.5" cy="11" r="0.9" fill="currentColor" />
              <circle cx="10" cy="11" r="0.9" fill="currentColor" />
              <circle cx="13.5" cy="11" r="0.9" fill="currentColor" />
              <circle cx="6.5" cy="14" r="0.9" fill="currentColor" />
              <circle cx="10" cy="14" r="0.9" fill="currentColor" />
            </svg>
            <span className="countdown-info-text">1 – 3 January 2027</span>
          </div>

          <div className="countdown-info-sep" aria-hidden="true" />

          <div className="countdown-info-item">
            <svg
              className="countdown-info-icon"
              viewBox="0 0 20 20"
              fill="currentColor"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M10 2a6 6 0 00-6 6c0 4.25 5.25 10.1 5.48 10.35a.7.7 0 001.04 0C10.75 18.1 16 12.25 16 8a6 6 0 00-6-6zm0 8.5a2.5 2.5 0 110-5 2.5 2.5 0 010 5z"
                clipRule="evenodd"
              />
            </svg>
            <span className="countdown-info-text">Hyatt Regency, Ahmedabad</span>
          </div>

          <div className="countdown-info-sep" aria-hidden="true" />

          <div className="countdown-info-item">
            <svg
              className="countdown-info-icon"
              viewBox="0 0 20 20"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <circle cx="10" cy="10" r="7.5" />
              <path d="M2.5 10H17.5M10 2.5C12 5 13 7.5 13 10C13 12.5 12 15 10 17.5M10 2.5C8 5 7 7.5 7 10C7 12.5 8 15 10 17.5" />
            </svg>
            <span className="countdown-info-text">International Conference</span>
          </div>
        </div>
      </div>
    </div>
  );
}

