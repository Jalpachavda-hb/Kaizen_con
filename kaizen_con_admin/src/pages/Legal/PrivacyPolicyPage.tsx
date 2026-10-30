import React, { useState } from "react";
import PageMeta from "../../components/common/PageMeta";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import { ShieldCheckIcon } from "../../icons/conferenceIcons";

interface PolicySection {
  id: string;
  title: string;
  category: string;
  summary: string;
  content: React.ReactNode;
}

export default function PrivacyPolicyPage() {
  const [activeTab, setActiveTab] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const handlePrint = () => {
    window.print();
  };

  const policySections: PolicySection[] = [
    {
      id: "admin-governance",
      title: "1. Administrative Data Governance & Scope",
      category: "Governance",
      summary: "Operational boundaries and legal compliance protocols for Kaizen Con 2027 administrators.",
      content: (
        <div className="space-y-3 text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
          <p>
            This Administrative Privacy &amp; Data Governance Policy applies to all organizers, system administrators, scientific committee liaisons, and authorized technical operators accessing the <strong>Kaizen Con 2027 Administration Portal</strong>.
          </p>
          <p>
            As stewards of medical conference data involving international faculty, delegates, robotic surgery innovators, and CME accreditation records, administrators are bound by confidentiality covenants under the <strong>Digital Personal Data Protection (DPDP) Act 2023</strong> (India), <strong>GDPR</strong> (EU/UK), and medical ethics standards.
          </p>
          <div className="p-3.5 rounded-lg bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 text-xs text-gray-700 dark:text-gray-300">
            <strong>Scope of Authority:</strong> Administrator privileges are granted strictly on a need-to-know basis. Unauthorized exporting, sharing, or processing of attendee databases outside the authorized scope is strictly prohibited and subject to immediate credential revocation and statutory reporting.
          </div>
        </div>
      ),
    },
    {
      id: "delegate-pii",
      title: "2. Delegate & Faculty PII Protection",
      category: "Data Handling",
      summary: "Handling personally identifiable information, medical council numbers, and CME certifications.",
      content: (
        <div className="space-y-3 text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
          <p>
            The portal stores confidential delegate profiles, including full legal names, hospital affiliations, state medical registration IDs, contact email addresses, mobile numbers, and dietary/accessibility accommodations.
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-xs sm:text-sm">
            <li><strong>Medical Council Registrations:</strong> Used solely for CME credit verification and transmission to certifying medical accreditation boards.</li>
            <li><strong>Financial &amp; Transaction Tokens:</strong> Payment gateway tokens are stored with third-party PCI-DSS Level 1 processors; no full credit card data is ever visible or retained in the admin portal.</li>
            <li><strong>Export Controls:</strong> Any CSV/Excel export of delegate data must be encrypted, password-protected, and purged within 30 days of conference conclusion.</li>
          </ul>
        </div>
      ),
    },
    {
      id: "rbac-controls",
      title: "3. Role-Based Access Controls (RBAC) & Least Privilege",
      category: "Security",
      summary: "Hierarchical permissions, multi-tier admin roles, and credential isolation.",
      content: (
        <div className="space-y-3 text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
          <p>
            The portal enforces strict Role-Based Access Control (RBAC) to ensure staff only access datasets relevant to their operational responsibilities:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 my-2">
            <div className="p-3 rounded-lg border border-purple-100 dark:border-purple-900/40 bg-purple-50/50 dark:bg-purple-950/20">
              <span className="text-xs font-bold text-[#AA2D7B] uppercase tracking-wider block mb-1">
                Super Administrator
              </span>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Full platform governance, role assignment, user creation, API configurations, and audit review.
              </p>
            </div>
            <div className="p-3 rounded-lg border border-blue-100 dark:border-blue-900/40 bg-blue-50/50 dark:bg-blue-950/20">
              <span className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider block mb-1">
                Scientific Committee
              </span>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Faculty profiles, session timetables, hall allocations, and abstract review workflows.
              </p>
            </div>
            <div className="p-3 rounded-lg border border-emerald-100 dark:border-emerald-900/40 bg-emerald-50/50 dark:bg-emerald-950/20">
              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider block mb-1">
                Hospitality &amp; Helpdesk
              </span>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Delegate check-in validation, badge printing, and on-site support assistance.
              </p>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: "audit-trails",
      title: "4. Immutable Audit Trails & Activity Logging",
      category: "Governance",
      summary: "Automated logging of logins, profile modifications, data exports, and deletions.",
      content: (
        <div className="space-y-3 text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
          <p>
            For accountability and forensic compliance, all critical administrative operations are logged automatically with immutable timestamps, originating IP addresses, and user identifiers:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-xs sm:text-sm">
            <li>Administrator authentication attempts (successful logins, failures, and session timeouts).</li>
            <li>Creations, updates, and removals of speakers, sessions, topics, and delegate records.</li>
            <li>Bulk email campaigns dispatched through the Agent Settings pipeline.</li>
            <li>Changes to user permissions, role reassignments, and security settings.</li>
          </ul>
          <p className="text-xs text-gray-500 dark:text-gray-400 italic">
            Audit logs are preserved in write-once append-only storage for a minimum statutory period of 12 months.
          </p>
        </div>
      ),
    },
    {
      id: "campaign-privacy",
      title: "5. Email & Notification Campaign Compliance",
      category: "Data Handling",
      summary: "Anti-spam regulations, unsubscribe handling, and transactional communications.",
      content: (
        <div className="space-y-3 text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
          <p>
            When utilizing the <strong>Agent Settings &rarr; Campaigns</strong> and <strong>Send To Email</strong> tools, administrators must strictly observe anti-spam standards (CAN-SPAM Act, GDPR Article 7, and DPDP consent mandates):
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-xs sm:text-sm">
            <li><strong>Transactional vs. Marketing:</strong> Badging info, schedule updates, and emergency hall changes are legitimate transactional notices. Promotional mailings require active delegate opt-in.</li>
            <li><strong>One-Click Opt-Out:</strong> All dispatched template emails automatically include an authenticated unsubscribe link. Unsubscribed recipients are automatically quarantined in the suppression list.</li>
            <li><strong>Suppression Enforcement:</strong> The system automatically blocks campaign deliveries to bounced or opted-out addresses.</li>
          </ul>
        </div>
      ),
    },
    {
      id: "ai-moderation",
      title: "6. AI Assistant Queries & Live Q&A Moderation",
      category: "AI & Interactive",
      summary: "Confidentiality of audience inquiries, live polling records, and automated moderation.",
      content: (
        <div className="space-y-3 text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
          <p>
            The portal provides administration for <strong>Live Polls</strong> and <strong>Audience Q&amp;A</strong>. In handling live audience participation data:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-xs sm:text-sm">
            <li><strong>Anonymous Questions:</strong> Questions submitted by attendees with the "Anonymous" toggle selected must have their user IDs permanently masked from public display screens and export summaries.</li>
            <li><strong>Moderation Content:</strong> Moderated or rejected questions containing sensitive medical clinical disclosures or proprietary surgical data must not be archived or broadcast.</li>
            <li><strong>AI Synthesis Confidentiality:</strong> Live Q&amp;A summarization utilizes dedicated secure API endpoints and is not shared with public learning models.</li>
          </ul>
        </div>
      ),
    },
    {
      id: "session-security",
      title: "7. Session Security & 2-Hour Auto-Timeout Policy",
      category: "Security",
      summary: "Session duration limits, token invalidation, and inactive workstation protection.",
      content: (
        <div className="space-y-3 text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
          <p>
            To protect sensitive conference databases against unauthorized access at shared kiosks or unattended organizer laptops, the admin portal enforces:
          </p>
          <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 text-amber-900 dark:text-amber-200 text-xs space-y-1.5">
            <div className="font-bold flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
              Automated 2-Hour Session Expiry
            </div>
            <p>
              Administrative sessions expire automatically after 2 hours of issuance. Stored tokens are invalidated, and users are safely redirected to the sign-in portal with session expiration notices.
            </p>
          </div>
          <p className="text-xs text-gray-600 dark:text-gray-400">
            Administrators are reminded to manually click <strong>Sign Out</strong> whenever stepping away from administrative terminals.
          </p>
        </div>
      ),
    },
    {
      id: "breach-protocol",
      title: "8. Security Incident & Breach Notification Protocol",
      category: "Security",
      summary: "Rapid response procedures in the event of suspected credential compromise or data leakage.",
      content: (
        <div className="space-y-3 text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
          <p>
            In the event of a suspected credential compromise, unauthorized database query, or security incident:
          </p>
          <ol className="list-decimal pl-5 space-y-1.5 text-xs sm:text-sm">
            <li>Immediately report the event to <strong>security@kaizencon.demo</strong> or the Lead Systems Administrator.</li>
            <li>The security team will revoke compromised API tokens and terminate active sessions within 15 minutes.</li>
            <li>If personal delegate data has been compromised, affected parties and statutory regulators will be notified within mandatory legal windows (72 hours under GDPR / DPDP Act).</li>
          </ol>
        </div>
      ),
    },
    {
      id: "admin-contacts",
      title: "9. Administrative Contacts & Compliance Officer",
      category: "Governance",
      summary: "Escalation pathways and support contacts for admin compliance.",
      content: (
        <div className="space-y-3 text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
          <p>For questions regarding administrator privileges, data protection audits, or compliance clarification:</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/40">
              <span className="font-bold text-gray-900 dark:text-white block mb-0.5">Data Protection Officer (DPO)</span>
              <span className="text-gray-500 dark:text-gray-400 block mb-1">Kaizen Con 2027 Secretariat</span>
              <a href="mailto:privacy@kaizencon.demo" className="text-[#AA2D7B] dark:text-[#f5d8e9] font-medium hover:underline">
                privacy@kaizencon.demo
              </a>
            </div>
            <div className="p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/40">
              <span className="font-bold text-gray-900 dark:text-white block mb-0.5">Systems &amp; Security Desk</span>
              <span className="text-gray-500 dark:text-gray-400 block mb-1">Technical Infrastructure Team</span>
              <a href="mailto:admin-support@kaizencon.demo" className="text-[#AA2D7B] dark:text-[#f5d8e9] font-medium hover:underline">
                admin-support@kaizencon.demo
              </a>
            </div>
          </div>
        </div>
      ),
    },
  ];

  const categories = ["all", "Governance", "Data Handling", "Security", "AI & Interactive"];

  const filteredSections = policySections.filter((sec) => {
    const matchesTab = activeTab === "all" || sec.category === activeTab;
    const matchesSearch =
      searchQuery === "" ||
      sec.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sec.summary.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  return (
    <>
      <PageMeta
        title="Admin Privacy & Compliance Policy | Kaizen Con 2027"
        description="Comprehensive administrative data governance, security policies, and delegate privacy protocols for Kaizen Con 2027 Management Portal."
      />

      <div className="w-full">
        <PageBreadcrumb pageTitle="Privacy &amp; Compliance Policy" />

        {/* Top Header Card */}
        <div className="mb-6 rounded-2xl bg-gradient-to-r from-[#55355E] via-[#7B3B70] to-[#AA2D7B] p-6 sm:p-8 text-white shadow-md relative overflow-hidden">
          <div className="relative z-10 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md border border-white/20 text-xs font-semibold mb-3">
              <ShieldCheckIcon className="w-4 h-4 text-emerald-300" />
              <span>Kaizen Con 2027 Management Portal · Official Data Policy</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white mb-2">
              Administrative Privacy &amp; Data Governance
            </h1>
            <p className="text-sm text-white/90 leading-relaxed max-w-2xl">
              Guidelines, security standards, and statutory compliance protocols governing the access, handling, and protection of attendee, faculty, and clinical scientific datasets.
            </p>

            <div className="flex flex-wrap items-center gap-2 mt-4 pt-3 border-t border-white/15 text-xs text-white/80">
              <span className="px-2.5 py-0.5 rounded-md bg-white/10 font-mono">Policy v2.4</span>
              <span>•</span>
              <span>Effective: Jan 1, 2027</span>
              <span>•</span>
              <span className="text-emerald-300 font-medium">DPDP 2023 &amp; GDPR Compliant</span>
            </div>
          </div>

          <div className="mt-5 sm:mt-0 sm:absolute sm:bottom-6 sm:right-6 flex items-center gap-2 z-10">
            <button
              onClick={handlePrint}
              type="button"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white text-gray-800 text-xs font-semibold shadow-xs hover:bg-gray-100 transition-all cursor-pointer"
            >
              <svg className="w-4 h-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
              </svg>
              <span>Print Policy</span>
            </button>
          </div>

          {/* Background Decorative Rings */}
          <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute top-0 right-1/4 w-32 h-32 bg-[#D85A9A]/20 rounded-full blur-xl pointer-events-none" />
        </div>

        {/* Filter and Search Bar */}
        <div className="mb-6 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white dark:bg-gray-900 p-3 rounded-xl border border-gray-200 dark:border-gray-800 shadow-xs">
          {/* Category Tabs */}
          <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setActiveTab(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  activeTab === cat
                    ? "bg-[#55355E] text-white shadow-xs"
                    : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
                }`}
              >
                {cat === "all" ? "All Sections" : cat}
              </button>
            ))}
          </div>

          {/* Search Input */}
          <div className="relative sm:w-64 shrink-0">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter policy sections..."
              className="w-full h-9 pl-8 pr-3 text-xs rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-[#AA2D7B]"
            />
            <svg
              className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-1/2 -translate-y-1/2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>

        {/* Policy Grid / List */}
        <div className="space-y-4">
          {filteredSections.map((sec) => (
            <div
              key={sec.id}
              id={sec.id}
              className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-5 sm:p-6 shadow-xs transition-all hover:border-gray-300 dark:hover:border-gray-700"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3 pb-3 border-b border-gray-100 dark:border-gray-800">
                <div className="flex items-center gap-2.5">
                  <span className="p-1.5 rounded-lg bg-[#faedf5] dark:bg-[#55355E]/30 text-[#AA2D7B] dark:text-[#f5d8e9]">
                    <ShieldCheckIcon className="w-4 h-4" />
                  </span>
                  <h2 className="text-base font-bold text-gray-900 dark:text-white">
                    {sec.title}
                  </h2>
                </div>
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 self-start sm:self-center">
                  {sec.category}
                </span>
              </div>

              <p className="text-xs text-gray-500 dark:text-gray-400 mb-3 font-medium">
                {sec.summary}
              </p>

              <div>{sec.content}</div>
            </div>
          ))}

          {filteredSections.length === 0 && (
            <div className="p-10 text-center bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 text-sm text-gray-500">
              No policy sections matched "{searchQuery}".
            </div>
          )}
        </div>


      </div>
    </>
  );
}
