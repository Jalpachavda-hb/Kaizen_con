import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import '../Global.css';
import logoImg from '../../assets/home/logokaizecon.png';
import navbarLeftImg from '../../assets/home/navbarleft_bg.png';
import navbarRightImg from '../../assets/home/navbarright.png';

const navItems = [
  { id: 'home', label: 'Home', href: '/' },
  { id: 'about', label: 'About', href: '/about' },
  { id: 'programme', label: 'Programme', href: '/programme' },
  { id: 'speakers', label: 'Speakers', href: '/speakers' },
  { id: 'ai-experience', label: 'AI Experience', href: '/ai-experience' },
  { id: 'knowledge', label: 'Knowledge', href: '/knowledge' },
  { id: 'contact', label: 'Contact Us', href: '/contact' },
];

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeItem, setActiveItem] = useState('Home');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Sync active nav item with current route and hash
  useEffect(() => {
    if (location.pathname === '/programme' || location.pathname === '/program') {
      setActiveItem('Programme');
    } else if (location.pathname === '/contact' || location.pathname === '/contact-us') {
      setActiveItem('Contact Us');
    } else if (location.pathname === '/about' || location.pathname === '/about-us') {
      setActiveItem('About');
    } else if (location.pathname === '/speakers' || location.pathname === '/speaker') {
      setActiveItem('Speakers');
    } else if (location.pathname === '/ai-experience' || location.pathname === '/ai') {
      setActiveItem('AI Experience');
    } else if (location.pathname === '/knowledge' || location.pathname === '/knowledge-base') {
      setActiveItem('Knowledge');
    } else if (location.hash) {
      if (location.hash === '#programme' || location.hash === '#tracks') {
        setActiveItem('Programme');
      } else if (location.hash === '#ai-experience' || location.hash === '#ai-layer') {
        setActiveItem('AI Experience');
      } else {
        const match = navItems.find(item => item.href.endsWith(location.hash));
        if (match) {
          setActiveItem(match.label);
        }
      }
    } else if (location.pathname === '/') {
      setActiveItem('Home');
    }
  }, [location.pathname, location.hash]);

  // Close drawer on ESC key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isDrawerOpen) {
        setIsDrawerOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isDrawerOpen]);

  // Lock body scroll when mobile drawer is open
  useEffect(() => {
    if (isDrawerOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isDrawerOpen]);

  const handleNavClick = (label, href) => {
    setActiveItem(label);
    setIsDrawerOpen(false);

    if (href === '/') {
      if (location.pathname !== '/') {
        navigate('/');
      } else {
        window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
      }
      return;
    }

    if (href === '/about' || href === '/about-us') {
      navigate('/about');
      return;
    }

    if (href === '/programme' || href === '/program') {
      navigate('/programme');
      return;
    }

    if (href === '/contact' || href === '/contact-us') {
      navigate('/contact');
      return;
    }

    if (href === '/speakers' || href === '/speaker') {
      navigate('/speakers');
      return;
    }

    if (href === '/ai-experience' || href === '/ai') {
      navigate('/ai-experience');
      return;
    }

    if (href === '/knowledge' || href === '/knowledge-base') {
      navigate('/knowledge');
      return;
    }

    if (href && href.startsWith('/#')) {
      const hash = href.substring(1); // e.g. '#programme'
      if (location.pathname !== '/') {
        navigate(href);
      } else {
        const el = document.querySelector(hash);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth' });
        }
      }
      return;
    }

    if (href && href.startsWith('#')) {
      if (location.pathname !== '/') {
        // If on another page, navigate to home with the hash
        navigate('/' + href);
      } else {
        const el = document.querySelector(href);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth' });
        }
      }
    }
  };

  const handleLogoClick = (e) => {
    e.preventDefault();
    setIsDrawerOpen(false);
    if (location.pathname !== '/') {
      navigate('/');
    } else {
      window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
    }
  };

  return (
    <header className="kaizen-navbar-wrapper">
      {/* 1. TOP INFORMATION RIBBON (PINNED TO TOP-RIGHT OVERLAYING NAVBAR) */}
      <div className="kaizen-topbar-wrapper">
        <div className="kaizen-topbar-track">
          {/* Smooth borderless S-curve connector */}
          <svg
            className="kaizen-topbar-swoop-svg"
            viewBox="0 0 54 38"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <defs>
              <linearGradient id="kzSwoopFill" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#7e4a87" />
                <stop offset="100%" stopColor="#73437b" />
              </linearGradient>
            </defs>
            <path d="M 0 0 C 26 0, 36 38, 54 38 L 55 38 L 55 0 Z" fill="url(#kzSwoopFill)" />
          </svg>

          {/* Topbar Ribbon Body */}
          <div className="kaizen-topbar-body">
            <div className="kaizen-topbar-content">
              {/* 1. Date */}
              <div className="kaizen-topbar-item">
                <span className="kaizen-topbar-icon" aria-hidden="true">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                    <line x1="16" y1="2" x2="16" y2="6" />
                    <line x1="8" y1="2" x2="8" y2="6" />
                    <line x1="3" y1="10" x2="21" y2="10" />
                  </svg>
                </span>
                <span className="kaizen-topbar-text">1–3 January 2027</span>
              </div>

              <span className="kaizen-topbar-divider" aria-hidden="true" />

              {/* 2. Venue & Location */}
              <div className="kaizen-topbar-item">
                <span className="kaizen-topbar-icon" aria-hidden="true">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                </span>
                <div className="kaizen-topbar-venue-text">
                  <span className="kaizen-topbar-venue-title">Hyatt Regency</span>
                  <span className="kaizen-topbar-venue-subtitle">Ashram Road, Ahmedabad, India</span>
                </div>
              </div>

              <span className="kaizen-topbar-divider" aria-hidden="true" />

              {/* 3. Conference */}
              <div className="kaizen-topbar-item">
                <span className="kaizen-topbar-icon" aria-hidden="true">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="2" y1="12" x2="22" y2="12" />
                    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                  </svg>
                </span>
                <span className="kaizen-topbar-text">International Conference</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. MAIN NAVBAR */}
      <nav className="kaizen-navbar" aria-label="Main Navigation">
        {/* Subtle AI background graphics */}
        <div
          className="kaizen-navbar-bg-left"
          style={{ backgroundImage: `url(${navbarLeftImg})` }}
          aria-hidden="true"
        />
        <div
          className="kaizen-navbar-bg-right"
          style={{ backgroundImage: `url(${navbarRightImg})` }}
          aria-hidden="true"
        />

        <div className="kaizen-navbar-inner">
          {/* Logo on Left in Dedicated Container (Uses top empty space with exactly 1px space top and bottom) */}
          <div className="kaizen-logo-container">
            <a href="/" className="kaizen-logo-link" onClick={handleLogoClick} aria-label="KaizenCon 2027 Home">
              <img
                src={logoImg}
                alt="KaizenCon 2027 Robotics & AI Conference Logo"
                className="kaizen-logo-img"
              />
            </a>
          </div>

          {/* Desktop Navigation Menu (Positioned toward right side below topbar) */}
          <ul className="kaizen-nav-menu">
            {navItems.map((item) => (
              <li key={item.id} className="kaizen-nav-item">
                <a
                  href={item.href}
                  className={`kaizen-nav-link ${activeItem === item.label ? 'active' : ''}`}
                  onClick={(e) => {
                    e.preventDefault();
                    handleNavClick(item.label, item.href);
                  }}
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>

          {/* Mobile Hamburger Toggle Button */}
          <button
            type="button"
            className={`kaizen-hamburger-btn ${isDrawerOpen ? 'is-active' : ''}`}
            onClick={() => setIsDrawerOpen(!isDrawerOpen)}
            aria-label={isDrawerOpen ? 'Close Menu' : 'Open Menu'}
            aria-expanded={isDrawerOpen}
          >
            <span className="kaizen-hamburger-line"></span>
            <span className="kaizen-hamburger-line"></span>
            <span className="kaizen-hamburger-line"></span>
          </button>
        </div>
      </nav>

      {/* MOBILE BACKDROP OVERLAY */}
      <div
        className={`kaizen-drawer-backdrop ${isDrawerOpen ? 'is-open' : ''}`}
        onClick={() => setIsDrawerOpen(false)}
        aria-hidden="true"
      />

      {/* MOBILE SIDE DRAWER (SLIDES IN FROM RIGHT) */}
      <aside
        className={`kaizen-side-drawer ${isDrawerOpen ? 'is-open' : ''}`}
        aria-label="Mobile Navigation"
      >
        {/* Drawer Header */}
        <div className="kaizen-drawer-header">
          <a href="/" onClick={handleLogoClick} className="kaizen-drawer-logo-link" aria-label="KaizenCon 2027 Home">
            <img
              src={logoImg}
              alt="KaizenCon 2027 Logo"
              className="kaizen-drawer-logo"
            />
          </a>
          <button
            type="button"
            className="kaizen-drawer-close-btn"
            onClick={() => setIsDrawerOpen(false)}
            aria-label="Close menu"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Drawer Body */}
        <div className="kaizen-drawer-body">
          <ul className="kaizen-drawer-menu">
            {navItems.map((item) => (
              <li key={item.id} className="kaizen-drawer-item">
                <a
                  href={item.href}
                  className={`kaizen-drawer-link ${activeItem === item.label ? 'active' : ''}`}
                  onClick={(e) => {
                    e.preventDefault();
                    handleNavClick(item.label, item.href);
                  }}
                >
                  <span>{item.label}</span>
                  <span className="kaizen-drawer-chevron">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="9 18 15 12 9 6" />
                    </svg>
                  </span>
                </a>
              </li>
            ))}
          </ul>

          {/* Conference Details Card in Drawer */}
          <div className="kaizen-drawer-info-card">
            <span className="kaizen-drawer-info-title">Conference Details</span>

            <div className="kaizen-drawer-info-item">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
              <span>1–3 January 2027</span>
            </div>

            <div className="kaizen-drawer-info-item">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
              <span>Hyatt Regency, Ashram Road, Ahmedabad, India</span>
            </div>

            <div className="kaizen-drawer-info-item">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <line x1="2" y1="12" x2="22" y2="12" />
                <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
              </svg>
              <span>Robotics & AI in GI Surgery</span>
            </div>
          </div>
        </div>
      </aside>
    </header>
  );
}
