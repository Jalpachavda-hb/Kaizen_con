import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  FiShield, 
  FiLock, 
  FiEye, 
  FiCpu, 
  FiDatabase, 
  FiFileText, 
  FiUserCheck, 
  FiMail, 
  FiCheckCircle, 
  FiPrinter,
  FiArrowUpRight
} from 'react-icons/fi';
import './PrivacyPolicyPage.css';

export default function PrivacyPolicyPage() {
  const [activeSection, setActiveSection] = useState('intro');

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, []);

  const scrollToSection = (id) => {
    setActiveSection(id);
    const element = document.getElementById(id);
    if (element) {
      const yOffset = -90; // offset for sticky navbar
      const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const navigationSections = [
    { id: 'intro', title: '1. Introduction & Overview', icon: FiShield },
    { id: 'collection', title: '2. Information We Collect', icon: FiDatabase },
    { id: 'ai-processing', title: '3. AI Features & Clinical Privacy', icon: FiCpu },
    { id: 'usage', title: '4. How We Use Your Data', icon: FiFileText },
    { id: 'sharing', title: '5. Sharing & Disclosure', icon: FiEye },
    { id: 'security', title: '6. Data Security & Storage', icon: FiLock },
    { id: 'rights', title: '7. Your Rights & Choices', icon: FiUserCheck },
    { id: 'contact', title: '8. DPO & Contact Information', icon: FiMail },
  ];

  return (
    <div className="kz-privacy-page">
      {/* HERO SECTION */}
    

      {/* MAIN CONTENT WITH STICKY SIDEBAR */}
      <section className="kz-privacy-body-section">
        <div className="kz-privacy-container kz-privacy-layout-grid">
          
          {/* LEFT SIDEBAR: Table of Contents */}
          <aside className="kz-privacy-sidebar" aria-label="Table of Contents">
            <div className="kz-privacy-sidebar-inner">
              <h3 className="kz-privacy-sidebar-title">
                Table of Contents
              </h3>
              <p className="kz-privacy-sidebar-subtitle">
                Quick jump to sections
              </p>

              <nav className="kz-privacy-toc-nav">
                {navigationSections.map((sec) => {
                  const Icon = sec.icon;
                  const isActive = activeSection === sec.id;
                  return (
                    <button
                      key={sec.id}
                      onClick={() => scrollToSection(sec.id)}
                      className={`kz-privacy-toc-link ${isActive ? 'active' : ''}`}
                    >
                      <Icon className="kz-privacy-toc-icon" />
                      <span>{sec.title}</span>
                    </button>
                  );
                })}
              </nav>

              <div className="kz-privacy-sidebar-card">
                <div className="kz-privacy-sidebar-card-badge">NEED ASSISTANCE?</div>
                <h4>Privacy Questions?</h4>
                <p>Our Data Protection Officer and compliance team are available to assist you.</p>
                <a href="mailto:privacy@kaizencon.demo" className="kz-privacy-sidebar-card-link">
                  privacy@kaizencon.demo
                  <FiArrowUpRight />
                </a>
              </div>
            </div>
          </aside>

          {/* RIGHT COLUMN: Detailed Policy Sections */}
          <main className="kz-privacy-content-main">
            
            {/* Quick Summary Banner */}
            <div className="kz-privacy-summary-banner">
              <div className="kz-privacy-summary-icon">
                <FiCheckCircle />
              </div>
              <div className="kz-privacy-summary-text">
                <h4>Privacy Highlights at a Glance</h4>
                <ul>
                  <li>We collect only necessary information to facilitate conference registration, ticketing, CME credits, and personalized experience.</li>
                  <li>Our AI Assistant and Live Q&amp;A features process data in real time and <strong>do not train public AI models</strong> on confidential clinical questions or attendee discussions.</li>
                  <li>We never sell or rent your personal information to third parties or commercial sponsors.</li>
                  <li>You maintain full rights to access, update, export, or request deletion of your information at any time.</li>
                </ul>
              </div>
            </div>

            {/* Section 1: Intro */}
            <section id="intro" className="kz-privacy-policy-block">
              <div className="kz-privacy-block-header">
                <div className="kz-privacy-block-num">01</div>
                <div>
                  <h2 className="kz-privacy-block-title">Introduction &amp; Scope</h2>
                  <span className="kz-privacy-block-subtitle">Our ethical foundation for medical and AI conference data</span>
                </div>
              </div>
              <div className="kz-privacy-block-body">
                <p>
                  Welcome to <strong>KaizenCon 2027</strong> ("KaizenCon", "we", "our", or "us"). KaizenCon 2027 is a premier international medical and AI surgical conference convening world-leading surgeons, clinical researchers, robotic engineering teams, and healthcare professionals from 1–3 January 2027 in Ahmedabad, India.
                </p>
                <p>
                  This Privacy Policy applies to all personal data collected through:
                </p>
                <ul className="kz-privacy-bullet-list">
                  <li>Our primary conference website (<strong>kaizencon.demo</strong>) and subdomains.</li>
                  <li>Conference registration, badge issuance, and CME accreditation portals.</li>
                  <li>On-site interactive kiosks, Live Q&amp;A systems, and interactive AI experience terminals.</li>
                  <li>Communications via email, customer support, and abstract submission workflows.</li>
                </ul>
                <p>
                  We comply with all relevant international and domestic privacy regulations, including the <strong>Digital Personal Data Protection (DPDP) Act 2023</strong> (India), the <strong>General Data Protection Regulation (GDPR)</strong> (EU/UK), and standard healthcare ethical guidelines.
                </p>
              </div>
            </section>

            {/* Section 2: Collection */}
            <section id="collection" className="kz-privacy-policy-block">
              <div className="kz-privacy-block-header">
                <div className="kz-privacy-block-num">02</div>
                <div>
                  <h2 className="kz-privacy-block-title">Information We Collect</h2>
                  <span className="kz-privacy-block-subtitle">Categories of personal and professional information</span>
                </div>
              </div>
              <div className="kz-privacy-block-body">
                <p>
                  Depending on how you interact with KaizenCon 2027, we collect the following types of information:
                </p>

                <div className="kz-privacy-card-grid">
                  <div className="kz-privacy-info-card">
                    <div className="kz-privacy-card-icon-wrap">
                      <FiUserCheck />
                    </div>
                    <h4>Delegate &amp; Speaker Profile</h4>
                    <p>Full name, title, medical specialty, institutional or hospital affiliation, professional designation, country of practice, and medical council registration number (for CME accreditation).</p>
                  </div>

                  <div className="kz-privacy-info-card">
                    <div className="kz-privacy-card-icon-wrap">
                      <FiMail />
                    </div>
                    <h4>Contact &amp; Logistics</h4>
                    <p>Professional email address, telephone contact, emergency contact details, dietary requirements, accessibility accommodations, and hotel reservation preferences.</p>
                  </div>

                  <div className="kz-privacy-info-card">
                    <div className="kz-privacy-card-icon-wrap">
                      <FiFileText />
                    </div>
                    <h4>Abstracts &amp; Scientific Data</h4>
                    <p>Submitted abstracts, video surgical case presentations, author lists, disclosures of conflict of interest, and presentation slide decks.</p>
                  </div>

                  <div className="kz-privacy-info-card">
                    <div className="kz-privacy-card-icon-wrap">
                      <FiCpu />
                    </div>
                    <h4>Interactions &amp; AI Queries</h4>
                    <p>Audience questions submitted during Live Q&amp;A sessions, queries posed to the KaizenCon AI Conference Assistant, session bookmarks, and personalized agenda preferences.</p>
                  </div>
                </div>

                <div className="kz-privacy-callout">
                  <strong>Note on De-Identified Medical Case Studies:</strong> All surgical videos, radiological images, and clinical abstracts submitted for scientific sessions must be rigorously de-identified in full adherence to international patient privacy standards. No identifiable Protected Health Information (PHI) of any patient may be uploaded.
                </div>
              </div>
            </section>

            {/* Section 3: AI Features */}
            <section id="ai-processing" className="kz-privacy-policy-block">
              <div className="kz-privacy-block-header">
                <div className="kz-privacy-block-num">03</div>
                <div>
                  <h2 className="kz-privacy-block-title">AI Features &amp; Clinical Privacy</h2>
                  <span className="kz-privacy-block-subtitle">Zero unauthorized training and strict prompt confidentiality</span>
                </div>
              </div>
              <div className="kz-privacy-block-body">
                <p>
                  KaizenCon 2027 integrates state-of-the-art conversational AI assistants, semantic search, and real-time session synthesis. Because our attendees include clinical surgeons and academic researchers, our AI system incorporates stringent privacy safeguards:
                </p>

                <div className="kz-privacy-ai-commitments">
                  <div className="kz-privacy-ai-item">
                    <div className="kz-privacy-ai-check">&#10003;</div>
                    <div>
                      <strong>Zero Model Training:</strong> Your chat messages, surgical queries, and Q&amp;A prompts are processed via enterprise private endpoints. They are <strong>never</strong> used to train public foundation models or shared with commercial LLM providers for model optimization.
                    </div>
                  </div>

                  <div className="kz-privacy-ai-item">
                    <div className="kz-privacy-ai-check">&#10003;</div>
                    <div>
                      <strong>Ephemeral Processing &amp; Anonymization:</strong> Prompts submitted to the AI assistant are scrubbed of personal identifiers before contextual synthesis. Audience questions displayed on hall screens are shown with your selected privacy preference (public name or anonymous).
                    </div>
                  </div>

                  <div className="kz-privacy-ai-item">
                    <div className="kz-privacy-ai-check">&#10003;</div>
                    <div>
                      <strong>Verified Medical Knowledge Retrieval:</strong> Answers provided by the KaizenCon AI are grounded in peer-reviewed scientific literature and vetted conference proceedings, preventing hallucinations and preserving medical integrity.
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Section 4: Usage */}
            <section id="usage" className="kz-privacy-policy-block">
              <div className="kz-privacy-block-header">
                <div className="kz-privacy-block-num">04</div>
                <div>
                  <h2 className="kz-privacy-block-title">How We Use Your Data</h2>
                  <span className="kz-privacy-block-subtitle">Legitimate purposes supporting your conference experience</span>
                </div>
              </div>
              <div className="kz-privacy-block-body">
                <p>We process your personal information only for the following legitimate purposes:</p>
                <ul className="kz-privacy-bullet-list">
                  <li><strong>Registration &amp; Access Control:</strong> Processing registrations, issuing RFID/QR delegate badges, validating workshop admissions, and managing hall capacity.</li>
                  <li><strong>Continuing Medical Education (CME):</strong> Verifying session attendance hours and reporting verified participation to medical councils to issue official credit certificates.</li>
                  <li><strong>Scientific Programme Delivery:</strong> Coordinating speaker schedules, publishing faculty bios, facilitating poster sessions, and streaming live surgical demonstrations.</li>
                  <li><strong>Attendee Communications:</strong> Sending essential logistical notifications, emergency alerts, scheduling changes, and post-conference proceeding downloads.</li>
                  <li><strong>Security &amp; Fraud Prevention:</strong> Protecting our infrastructure, preventing unauthorized portal access, and maintaining cybersecurity monitoring.</li>
                </ul>
              </div>
            </section>

            {/* Section 5: Sharing */}
            <section id="sharing" className="kz-privacy-policy-block">
              <div className="kz-privacy-block-header">
                <div className="kz-privacy-block-num">05</div>
                <div>
                  <h2 className="kz-privacy-block-title">Sharing &amp; Third-Party Disclosures</h2>
                  <span className="kz-privacy-block-subtitle">Strict confidentiality with trusted conference partners</span>
                </div>
              </div>
              <div className="kz-privacy-block-body">
                <p>
                  <strong>We do not sell, rent, or trade your personal information.</strong> We only share information with third parties under strict data processing agreements and confidentiality covenants:
                </p>
                <ul className="kz-privacy-bullet-list">
                  <li><strong>Accreditation Bodies:</strong> State Medical Councils and International Surgical Boards for granting CME credits.</li>
                  <li><strong>Venue &amp; Security Services:</strong> International Conference Centre security personnel for entry validation and emergency safety rosters.</li>
                  <li><strong>Technology &amp; Cloud Partners:</strong> Certified ISO 27001 / SOC 2 Type II data centers and encrypted email dispatch services hosting our conference platform.</li>
                  <li><strong>Badge Scanning at Exhibitor Booths:</strong> Your badge QR code contains contact information. Scanning your badge at commercial exhibition booths is completely voluntary and constitutes your explicit consent to share your contact details with that specific exhibitor.</li>
                </ul>
              </div>
            </section>

            {/* Section 6: Security */}
            <section id="security" className="kz-privacy-policy-block">
              <div className="kz-privacy-block-header">
                <div className="kz-privacy-block-num">06</div>
                <div>
                  <h2 className="kz-privacy-block-title">Data Security &amp; Storage</h2>
                  <span className="kz-privacy-block-subtitle">Enterprise-grade cryptographic protection</span>
                </div>
              </div>
              <div className="kz-privacy-block-body">
                <p>
                  We implement robust technical and organizational measures to safeguard your information against unauthorized access, alteration, disclosure, or destruction:
                </p>
                <div className="kz-privacy-security-grid">
                  <div className="kz-privacy-sec-card">
                    <FiLock className="kz-privacy-sec-icon" />
                    <h5>256-Bit TLS &amp; AES Encryption</h5>
                    <p>All data in transit is protected using TLS 1.3 encryption, and data at rest is secured via AES-256 standard encryption.</p>
                  </div>
                  <div className="kz-privacy-sec-card">
                    <FiShield className="kz-privacy-sec-icon" />
                    <h5>Role-Based Access Control</h5>
                    <p>Internal access is restricted strictly to authorized organizing personnel based on minimal necessity and audit logging.</p>
                  </div>
                  <div className="kz-privacy-sec-card">
                    <FiDatabase className="kz-privacy-sec-icon" />
                    <h5>Retention &amp; Scheduled Purging</h5>
                    <p>Delegate administrative records are retained only as long as required for tax compliance, CME audit trails, and legal requirements.</p>
                  </div>
                </div>
              </div>
            </section>

            {/* Section 7: Rights */}
            <section id="rights" className="kz-privacy-policy-block">
              <div className="kz-privacy-block-header">
                <div className="kz-privacy-block-num">07</div>
                <div>
                  <h2 className="kz-privacy-block-title">Your Rights &amp; Choices</h2>
                  <span className="kz-privacy-block-subtitle">Full control over your personal data</span>
                </div>
              </div>
              <div className="kz-privacy-block-body">
                <p>Under applicable data privacy laws, you possess fundamental rights regarding your personal information:</p>
                <ul className="kz-privacy-bullet-list">
                  <li><strong>Right to Access &amp; Portability:</strong> Request a full copy of the personal data we hold about you in a structured, machine-readable format.</li>
                  <li><strong>Right to Rectification:</strong> Request correction of inaccurate, outdated, or incomplete delegate records.</li>
                  <li><strong>Right to Erasure ("Right to be Forgotten"):</strong> Request deletion of your personal data where retention is no longer necessary, subject to statutory CME record retention obligations.</li>
                  <li><strong>Right to Restrict or Object:</strong> Object to processing of your data for marketing announcements or non-essential communications.</li>
                  <li><strong>Withdrawal of Consent:</strong> Withdraw previously given consent for optional services at any time without affecting past lawful processing.</li>
                </ul>
                <p>
                  To exercise any of these rights, simply email our Data Protection Office at <strong>privacy@kaizencon.demo</strong>. We respond to all verified requests within 14 business days.
                </p>
              </div>
            </section>

            {/* Section 8: Contact */}
            <section id="contact" className="kz-privacy-policy-block">
              <div className="kz-privacy-block-header">
                <div className="kz-privacy-block-num">08</div>
                <div>
                  <h2 className="kz-privacy-block-title">DPO &amp; Contact Information</h2>
                  <span className="kz-privacy-block-subtitle">Direct channels to reach our compliance secretariat</span>
                </div>
              </div>
              <div className="kz-privacy-block-body">
                <p>
                  If you have inquiries, complaints, or suggestions regarding this Privacy Policy or KaizenCon 2027’s data governance practices, please contact our designated Data Protection Officer:
                </p>

                <div className="kz-privacy-contact-box">
                  <div className="kz-privacy-contact-head">
                    <FiShield className="kz-privacy-contact-icon" />
                    <div>
                      <h3>Data Protection Secretariat</h3>
                      <span>KaizenCon 2027 International Organizing Committee</span>
                    </div>
                  </div>

                  <div className="kz-privacy-contact-details">
                    <div className="kz-privacy-contact-row">
                      <span className="kz-privacy-contact-label">Official Email:</span>
                      <a href="mailto:privacy@kaizencon.demo" className="kz-privacy-contact-val">privacy@kaizencon.demo</a>
                    </div>
                    <div className="kz-privacy-contact-row">
                      <span className="kz-privacy-contact-label">General Support:</span>
                      <a href="mailto:hello@kaizencon.demo" className="kz-privacy-contact-val">hello@kaizencon.demo</a>
                    </div>
                    <div className="kz-privacy-contact-row">
                      <span className="kz-privacy-contact-label">Venue Location:</span>
                      <span className="kz-privacy-contact-val">International Conference Centre, Ahmedabad, Gujarat, India</span>
                    </div>
                    <div className="kz-privacy-contact-row">
                      <span className="kz-privacy-contact-label">Telephone:</span>
                      <a href="tel:+917912345678" className="kz-privacy-contact-val">+91 79 1234 5678 (Ext. 402)</a>
                    </div>
                  </div>
                </div>

                <div className="kz-privacy-updates-note">
                  <em>
                    We may periodically update this policy to reflect enhancements in our conference platform, AI features, or regulatory standards. The most recent version will always be published on this page with an updated effective date.
                  </em>
                </div>
              </div>
            </section>

          </main>
        </div>
      </section>
    </div>
  );
}
