import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  FiUserCheck,
  FiFileText,
  FiEdit3,
  FiShield,
  FiFilter,
  FiFlag,
  FiUserX,
  FiClock,
  FiXCircle,
  FiLock,
  FiAlertCircle,
  FiMinusCircle,
  FiSmartphone,
  FiRefreshCw,
  FiGlobe,
  FiMail,
  FiArrowUpRight
} from 'react-icons/fi';
import './PrivacyPolicyPage.css';
import './TermsPage.css';

const SECTIONS = [
  { id: 'eligibility', title: '1. Eligibility', icon: FiUserCheck },
  { id: 'license', title: '2. License to Use the App', icon: FiFileText },
  { id: 'user-content', title: '3. User-Generated Content', icon: FiEdit3 },
  { id: 'zero-tolerance', title: '4. Zero Tolerance Policy', icon: FiShield },
  { id: 'filtering', title: '5. Content Filtering', icon: FiFilter },
  { id: 'reporting', title: '6. Reporting Objectionable Content', icon: FiFlag },
  { id: 'blocking', title: '7. Blocking Abusive Users', icon: FiUserX },
  { id: 'action-24h', title: '8. Action Within 24 Hours', icon: FiClock },
  { id: 'suspension', title: '9. Account Suspension and Termination', icon: FiXCircle },
  { id: 'privacy', title: '10. Privacy', icon: FiLock },
  { id: 'disclaimer', title: '11. Disclaimer', icon: FiAlertCircle },
  { id: 'liability', title: '12. Limitation of Liability', icon: FiMinusCircle },
  { id: 'apple', title: '13. Apple-Specific Terms', icon: FiSmartphone },
  { id: 'changes', title: '14. Changes to These Terms', icon: FiRefreshCw },
  { id: 'governing-law', title: '15. Governing Law', icon: FiGlobe },
  { id: 'contact', title: '16. Contact Us', icon: FiMail },
];

export default function TermsPage() {
  const [activeSection, setActiveSection] = useState('eligibility');

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });

    const previousTitle = document.title;
    document.title = 'Terms of Use | Kaizencon 2027';

    let meta = document.querySelector('meta[name="description"]');
    const createdMeta = !meta;
    if (!meta) {
      meta = document.createElement('meta');
      meta.setAttribute('name', 'description');
      document.head.appendChild(meta);
    }
    const previousDescription = meta.getAttribute('content');
    meta.setAttribute(
      'content',
      'Terms of Use (End User License Agreement) for the Kaizencon 2027 app, operated by Kaizen Hospital.'
    );

    return () => {
      document.title = previousTitle;
      if (createdMeta) {
        meta.remove();
      } else if (previousDescription != null) {
        meta.setAttribute('content', previousDescription);
      }
    };
  }, []);

  useEffect(() => {
    const nodes = SECTIONS
      .map((section) => document.getElementById(section.id))
      .filter(Boolean);

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (visible[0]) {
          setActiveSection(visible[0].target.id);
        }
      },
      { rootMargin: '-18% 0px -62% 0px', threshold: [0.15, 0.4] }
    );

    nodes.forEach((node) => observer.observe(node));
    return () => observer.disconnect();
  }, []);

  const scrollToSection = (id) => {
    setActiveSection(id);
    const element = document.getElementById(id);
    if (!element) return;
    const y = element.getBoundingClientRect().top + window.pageYOffset - 96;
    window.scrollTo({ top: y, behavior: 'smooth' });
  };

  return (
    <div className="kz-privacy-page kz-terms-page">
      <section className="kz-privacy-hero" aria-label="Terms of Use">
        <div className="kz-privacy-container">
          <div className="kz-privacy-hero-content">
            <h1 className="kz-privacy-hero-headline">
              <span className="kz-privacy-hero-dark">Terms of Use</span>
              <span className="kz-privacy-hero-magenta">End User License Agreement</span>
            </h1>
            <div className="kz-privacy-pills-row">
              <span className="kz-privacy-pill">
                <span className="kz-privacy-pill-dot" aria-hidden="true" />
                Kaizencon 2027
              </span>
              <span className="kz-privacy-pill kz-privacy-pill-highlight">
                Last updated: November 23, 2026
              </span>
            </div>
            <p className="kz-privacy-hero-desc">
              The agreement between you and Kaizen Hospital for using the Kaizencon 2027 app.
            </p>
          </div>
        </div>
      </section>

      <section className="kz-privacy-body-section">
        <div className="kz-privacy-container kz-privacy-layout-grid">
          <aside className="kz-privacy-sidebar" aria-label="Table of Contents">
            <div className="kz-privacy-sidebar-inner">
              <h3 className="kz-privacy-sidebar-title">Table of Contents</h3>
              <p className="kz-privacy-sidebar-subtitle">Quick jump to sections</p>
              <nav className="kz-privacy-toc-nav">
                {SECTIONS.map((section) => {
                  const Icon = section.icon;
                  const isActive = activeSection === section.id;
                  return (
                    <button
                      key={section.id}
                      type="button"
                      onClick={() => scrollToSection(section.id)}
                      className={`kz-privacy-toc-link ${isActive ? 'active' : ''}`}
                      aria-current={isActive ? 'true' : undefined}
                    >
                      <Icon className="kz-privacy-toc-icon" />
                      <span>{section.title}</span>
                    </button>
                  );
                })}
              </nav>
              <div className="kz-privacy-sidebar-card">
                <div className="kz-privacy-sidebar-card-badge">QUESTIONS?</div>
                <h4>Contact Kaizen Hospital</h4>
                <p>Write to us about these Terms, your account, or a content report.</p>
                <a href="mailto:kaizenconofficial@gmail.com" className="kz-privacy-sidebar-card-link">
                  kaizenconofficial@gmail.com
                  <FiArrowUpRight />
                </a>
              </div>
            </div>
          </aside>

          <main className="kz-privacy-content-main">
            <div className="kz-privacy-summary-banner kz-terms-intro-banner">
              <div className="kz-privacy-summary-icon" aria-hidden="true">
                <FiFileText />
              </div>
              <p className="kz-terms-intro-copy">
                Please read these Terms of Use (&quot;Terms&quot;) carefully before using Kaizencon 2027 (the &quot;App&quot;), operated by Kaizen Hospital (&quot;we&quot;, &quot;us&quot;, &quot;our&quot;). By creating an account, logging in, or using the App, you agree to be bound by these Terms. If you do not agree, do not use the App.
              </p>
            </div>

            <section id="eligibility" className="kz-privacy-policy-block">
              <div className="kz-privacy-block-header">
                <div className="kz-privacy-block-num">01</div>
                <div>
                  <h2 className="kz-privacy-block-title">Eligibility</h2>
                </div>
              </div>
              <div className="kz-privacy-block-body">
                <ul className="kz-privacy-bullet-list">
                  <li>You must be at least 18 years old to use the App.</li>
                  <li>You must provide accurate information when registering and keep your login details secure. You are responsible for all activity under your account.</li>
                </ul>
              </div>
            </section>

            <section id="license" className="kz-privacy-policy-block">
              <div className="kz-privacy-block-header">
                <div className="kz-privacy-block-num">02</div>
                <div>
                  <h2 className="kz-privacy-block-title">License to Use the App</h2>
                </div>
              </div>
              <div className="kz-privacy-block-body">
                <p>
                  We grant you a limited, non-exclusive, non-transferable, revocable license to use the App for your personal, non-commercial use, subject to these Terms. You may not copy, modify, reverse engineer, decompile, sell, or distribute the App or any part of it.
                </p>
              </div>
            </section>

            <section id="user-content" className="kz-privacy-policy-block">
              <div className="kz-privacy-block-header">
                <div className="kz-privacy-block-num">03</div>
                <div>
                  <h2 className="kz-privacy-block-title">User-Generated Content</h2>
                </div>
              </div>
              <div className="kz-privacy-block-body">
                <p>
                  The App allows users to post and share content, including discussion forum posts, comments, live Q&amp;A questions and answers, and other material (&quot;User Content&quot;). You are solely responsible for the User Content you submit. By posting User Content, you grant us a worldwide, non-exclusive, royalty-free license to host, store, display, and distribute it within the App for the purpose of operating the service. You confirm that you own, or have the right to share, everything you post.
                </p>
              </div>
            </section>

            <section id="zero-tolerance" className="kz-privacy-policy-block kz-terms-safety">
              <div className="kz-privacy-block-header">
                <div className="kz-privacy-block-num">04</div>
                <div>
                  <h2 className="kz-privacy-block-title">Zero Tolerance Policy</h2>
                </div>
              </div>
              <div className="kz-privacy-block-body">
                <p>
                  We have zero tolerance for objectionable content and abusive users. There is no place in the App for the following. You must not post, upload, or share content that:
                </p>
                <ul className="kz-privacy-bullet-list">
                  <li>Is hateful, discriminatory, or harassing toward any person or group (based on race, religion, caste, gender, sexual orientation, nationality, disability, or otherwise)</li>
                  <li>Is abusive, threatening, bullying, or intimidating</li>
                  <li>Contains nudity, sexually explicit or pornographic material, or sexual content involving minors (which will be reported to the authorities)</li>
                  <li>Promotes or glorifies violence, terrorism, self-harm, or illegal activity</li>
                  <li>Contains profanity or offensive language</li>
                  <li>Is spam, advertising, scams, or misleading or false information</li>
                  <li>Impersonates another person or organization</li>
                  <li>Shares someone&apos;s private or personal information without consent</li>
                  <li>Infringes copyright, trademarks, or other intellectual property rights</li>
                  <li>Contains viruses, malicious code, or anything that disrupts the App</li>
                </ul>
                <p>
                  Users who violate this policy will have their content removed and their accounts suspended or permanently terminated, without prior warning.
                </p>
              </div>
            </section>

            <section id="filtering" className="kz-privacy-policy-block kz-terms-safety">
              <div className="kz-privacy-block-header">
                <div className="kz-privacy-block-num">05</div>
                <div>
                  <h2 className="kz-privacy-block-title">Content Filtering</h2>
                </div>
              </div>
              <div className="kz-privacy-block-body">
                <p>
                  We use automated filters and moderation tools to detect and block objectionable content before or after it is posted. We may remove or edit any User Content at our sole discretion if it violates these Terms.
                </p>
              </div>
            </section>

            <section id="reporting" className="kz-privacy-policy-block kz-terms-safety">
              <div className="kz-privacy-block-header">
                <div className="kz-privacy-block-num">06</div>
                <div>
                  <h2 className="kz-privacy-block-title">Reporting Objectionable Content</h2>
                </div>
              </div>
              <div className="kz-privacy-block-body">
                <ul className="kz-privacy-bullet-list">
                  <li>Every post, comment, and question in the App has a &quot;Report&quot; option.</li>
                  <li>If you see content that violates these Terms, please report it by selecting the Report option and choosing a reason.</li>
                  <li>
                    You can also email us at{' '}
                    <a href="mailto:kaizenconofficial@gmail.com">kaizenconofficial@gmail.com</a>.
                  </li>
                </ul>
              </div>
            </section>

            <section id="blocking" className="kz-privacy-policy-block kz-terms-safety">
              <div className="kz-privacy-block-header">
                <div className="kz-privacy-block-num">07</div>
                <div>
                  <h2 className="kz-privacy-block-title">Blocking Abusive Users</h2>
                </div>
              </div>
              <div className="kz-privacy-block-body">
                <ul className="kz-privacy-bullet-list">
                  <li>You can block any user from their post or comment.</li>
                  <li>Once you block a user, their content is immediately removed from your feed.</li>
                  <li>Blocking a user also notifies our moderation team, so we can review the user and the content.</li>
                </ul>
              </div>
            </section>

            <section id="action-24h" className="kz-privacy-policy-block kz-terms-safety">
              <div className="kz-privacy-block-header">
                <div className="kz-privacy-block-num">08</div>
                <div>
                  <h2 className="kz-privacy-block-title">Our Commitment: Action Within 24 Hours</h2>
                </div>
              </div>
              <div className="kz-privacy-block-body">
                <p>
                  We review all reports of objectionable content and abusive behavior within 24 hours. If a report is valid, we will:
                </p>
                <ol className="kz-terms-ordered-list">
                  <li>Remove the offending content, and</li>
                  <li>Suspend or permanently remove the user who posted it.</li>
                </ol>
              </div>
            </section>

            <section id="suspension" className="kz-privacy-policy-block">
              <div className="kz-privacy-block-header">
                <div className="kz-privacy-block-num">09</div>
                <div>
                  <h2 className="kz-privacy-block-title">Account Suspension and Termination</h2>
                </div>
              </div>
              <div className="kz-privacy-block-body">
                <p>
                  We may suspend or terminate your account at any time, with or without notice, if you violate these Terms or if we believe your conduct harms other users or the App. You may request deletion of your account at any time by emailing{' '}
                  <a href="mailto:kaizenconofficial@gmail.com">kaizenconofficial@gmail.com</a>.
                </p>
              </div>
            </section>

            <section id="privacy" className="kz-privacy-policy-block">
              <div className="kz-privacy-block-header">
                <div className="kz-privacy-block-num">10</div>
                <div>
                  <h2 className="kz-privacy-block-title">Privacy</h2>
                </div>
              </div>
              <div className="kz-privacy-block-body">
                <p>
                  Your use of the App is also governed by our Privacy Policy:{' '}
                  <Link to="/privacy-policy">https://kaizencon.in/privacy-policy</Link>
                </p>
              </div>
            </section>

            <section id="disclaimer" className="kz-privacy-policy-block">
              <div className="kz-privacy-block-header">
                <div className="kz-privacy-block-num">11</div>
                <div>
                  <h2 className="kz-privacy-block-title">Disclaimer</h2>
                </div>
              </div>
              <div className="kz-privacy-block-body">
                <p>
                  The App and all content, including User Content, is provided &quot;as is&quot; and &quot;as available&quot; without warranties of any kind. We do not guarantee that User Content is accurate, safe, or appropriate, and we are not responsible for what users post. Information in the App, including Live Q&amp;A and forum discussions, is for general informational and educational purposes only and is not professional medical advice, diagnosis, or treatment.
                </p>
              </div>
            </section>

            <section id="liability" className="kz-privacy-policy-block">
              <div className="kz-privacy-block-header">
                <div className="kz-privacy-block-num">12</div>
                <div>
                  <h2 className="kz-privacy-block-title">Limitation of Liability</h2>
                </div>
              </div>
              <div className="kz-privacy-block-body">
                <p>
                  To the maximum extent permitted by law, Kaizen Hospital is not liable for any indirect, incidental, or consequential damages arising from your use of the App or from content posted by other users.
                </p>
              </div>
            </section>

            <section id="apple" className="kz-privacy-policy-block">
              <div className="kz-privacy-block-header">
                <div className="kz-privacy-block-num">13</div>
                <div>
                  <h2 className="kz-privacy-block-title">Apple-Specific Terms</h2>
                </div>
              </div>
              <div className="kz-privacy-block-body">
                <ul className="kz-privacy-bullet-list">
                  <li>These Terms are between you and Kaizen Hospital, not Apple Inc. Apple is not responsible for the App or its content.</li>
                  <li>Apple has no obligation to provide maintenance or support for the App.</li>
                  <li>If the App fails to meet any warranty, you may notify Apple for a refund of the purchase price (if any). Apple has no other warranty obligation.</li>
                  <li>Apple is not responsible for addressing any claims relating to the App, including product liability, legal compliance, or intellectual property claims.</li>
                  <li>Apple and its subsidiaries are third-party beneficiaries of these Terms and may enforce them against you.</li>
                </ul>
              </div>
            </section>

            <section id="changes" className="kz-privacy-policy-block">
              <div className="kz-privacy-block-header">
                <div className="kz-privacy-block-num">14</div>
                <div>
                  <h2 className="kz-privacy-block-title">Changes to These Terms</h2>
                </div>
              </div>
              <div className="kz-privacy-block-body">
                <p>
                  We may update these Terms from time to time. We will post the updated version with a new &quot;Last updated&quot; date. Continued use of the App means you accept the changes.
                </p>
              </div>
            </section>

            <section id="governing-law" className="kz-privacy-policy-block">
              <div className="kz-privacy-block-header">
                <div className="kz-privacy-block-num">15</div>
                <div>
                  <h2 className="kz-privacy-block-title">Governing Law</h2>
                </div>
              </div>
              <div className="kz-privacy-block-body">
                <p>
                  These Terms are governed by the laws of India. Any disputes will be subject to the exclusive jurisdiction of the courts of Ahmedabad, Gujarat.
                </p>
              </div>
            </section>

            <section id="contact" className="kz-privacy-policy-block">
              <div className="kz-privacy-block-header">
                <div className="kz-privacy-block-num">16</div>
                <div>
                  <h2 className="kz-privacy-block-title">Contact Us</h2>
                </div>
              </div>
              <div className="kz-privacy-block-body">
                <div className="kz-privacy-contact-box">
                  <div className="kz-privacy-contact-head">
                    <FiMail className="kz-privacy-contact-icon" />
                    <div>
                      <h3>Kaizen Hospital</h3>
                      <span>Operator of the Kaizencon 2027 app</span>
                    </div>
                  </div>
                  <div className="kz-privacy-contact-details">
                    <div className="kz-privacy-contact-row">
                      <span className="kz-privacy-contact-label">Email:</span>
                      <a href="mailto:kaizenconofficial@gmail.com" className="kz-privacy-contact-val">
                        kaizenconofficial@gmail.com
                      </a>
                    </div>
                    <div className="kz-privacy-contact-row">
                      <span className="kz-privacy-contact-label">Address:</span>
                      <span className="kz-privacy-contact-val">
                        132 Feet Ring Rd, near Helmet Circle, Memnagar, Ahmedabad, Gujarat 380052
                      </span>
                    </div>
                    <div className="kz-privacy-contact-row">
                      <span className="kz-privacy-contact-label">Website:</span>
                      <a
                        href="https://kaizencon.in"
                        className="kz-privacy-contact-val"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        https://kaizencon.in
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </main>
        </div>
      </section>
    </div>
  );
}
