import React, { useState, useEffect, useMemo, useRef } from "react";
import { useNavigate } from "react-router";
import PageMeta from "../../components/common/PageMeta";
import { AdminPageContainer } from "../../components/common/AdminPageContainer";
import {
  createCampaign,
  getEmailAgentContacts,
  getTemplates,
} from "../../api/ApiPath";
import Swal from "sweetalert2";

export interface ContactOption {
  id: string;
  email: string;
  name: string | null;
  type?: string | null;
  status: string;
  unsubscribed: boolean;
}

export interface TemplateOption {
  id: string;
  name: string;
  purpose?: string;
  subject?: string;
  active?: boolean;
  version?: number;
  [key: string]: any;
}

const MAX_ATTACHMENTS = 5;
const MAX_TOTAL_SIZE = 15 * 1024 * 1024; // 15 MB
const ALLOWED_EXTENSIONS = [".pdf", ".jpg", ".jpeg", ".png", ".docx", ".pptx", ".xlsx"];

const formatFileSize = (bytes?: number) => {
  if (!bytes || bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
};

const getFileIconColor = (filename: string) => {
  const ext = "." + filename.split(".").pop()?.toLowerCase();
  switch (ext) {
    case ".pdf":
      return { bg: "bg-red-50 dark:bg-red-950/40", text: "text-red-600 dark:text-red-400", border: "border-red-200 dark:border-red-850", label: "PDF" };
    case ".jpg":
    case ".jpeg":
    case ".png":
      return { bg: "bg-purple-50 dark:bg-purple-950/40", text: "text-purple-600 dark:text-purple-400", border: "border-purple-200 dark:border-purple-850", label: "IMG" };
    case ".docx":
      return { bg: "bg-blue-50 dark:bg-blue-950/40", text: "text-blue-600 dark:text-blue-400", border: "border-blue-200 dark:border-blue-850", label: "DOC" };
    case ".pptx":
      return { bg: "bg-amber-50 dark:bg-amber-950/40", text: "text-amber-600 dark:text-amber-400", border: "border-amber-200 dark:border-amber-850", label: "PPT" };
    case ".xlsx":
      return { bg: "bg-emerald-50 dark:bg-emerald-950/40", text: "text-emerald-600 dark:text-emerald-400", border: "border-emerald-200 dark:border-emerald-850", label: "XLS" };
    default:
      return { bg: "bg-gray-50 dark:bg-gray-800", text: "text-gray-600 dark:text-gray-400", border: "border-gray-200 dark:border-gray-700", label: "FILE" };
  }
};

export default function CreateCampaignPage() {
  const navigate = useNavigate();

  // Templates State
  const [availableTemplates, setAvailableTemplates] = useState<TemplateOption[]>([]);
  const [loadingTemplates, setLoadingTemplates] = useState<boolean>(true);

  // Contacts State
  const [availableContacts, setAvailableContacts] = useState<ContactOption[]>([]);
  const [loadingContacts, setLoadingContacts] = useState<boolean>(true);
  const [selectedContactType, setSelectedContactType] = useState<string>("All");

  // Attachments State
  const [attachments, setAttachments] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Submission State
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Form Data
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    goal: "registration",
    template_ids: [] as string[],
    registration_url: "https://example.com/",
    followup_interval_days: 1,
    followup_delay_minutes: "" as string | number,
    sending_delay_seconds: 30,
    max_followups: 1,
    max_sends_per_day: 100,
    re_mail: true,
    contact_ids: [] as string[],
  });

  // Template Dropdown State
  const [isTemplateDropdownOpen, setIsTemplateDropdownOpen] = useState<boolean>(false);
  const [templateSearch, setTemplateSearch] = useState<string>("");
  const templateDropdownRef = useRef<HTMLDivElement>(null);

  // Close template dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        templateDropdownRef.current &&
        !templateDropdownRef.current.contains(event.target as Node)
      ) {
        setIsTemplateDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Load Contacts and Templates on Mount
  useEffect(() => {
    let isMounted = true;

    const loadInitialData = async () => {
      setLoadingContacts(true);
      setLoadingTemplates(true);

      try {
        const [contactsRes, templatesRes] = await Promise.allSettled([
          getEmailAgentContacts(0, 100),
          getTemplates(),
        ]);

        if (!isMounted) return;

        // Process Contacts
        if (contactsRes.status === "fulfilled" && Array.isArray(contactsRes.value)) {
          const contacts = contactsRes.value;
          setAvailableContacts(contacts);

          // Pre-select eligible contacts by default
          const eligibleIds = contacts
            .filter((c: ContactOption) => c.status === "eligible" && !c.unsubscribed)
            .map((c: ContactOption) => c.id);

          setFormData((prev) => ({
            ...prev,
            contact_ids: prev.contact_ids.length > 0 ? prev.contact_ids : eligibleIds,
          }));
        } else {
          console.warn("Failed to load contacts:", contactsRes);
        }

        // Process Templates
        if (templatesRes.status === "fulfilled" && Array.isArray(templatesRes.value)) {
          const tpls = templatesRes.value;
          setAvailableTemplates(tpls);

          // Auto-select first active template if available
          const firstActive = tpls.find((t: TemplateOption) => t.active);
          if (firstActive) {
            setFormData((prev) => ({
              ...prev,
              template_ids: prev.template_ids.length > 0 ? prev.template_ids : [firstActive.id],
            }));
          }
        } else {
          console.warn("Failed to load templates:", templatesRes);
        }
      } catch (err) {
        console.error("Error loading initial data:", err);
      } finally {
        if (isMounted) {
          setLoadingContacts(false);
          setLoadingTemplates(false);
        }
      }
    };

    loadInitialData();

    return () => {
      isMounted = false;
    };
  }, []);

  // Dynamically extract unique contact types from availableContacts
  const availableTypes = useMemo(() => {
    const typesSet = new Set<string>();
    availableContacts.forEach((c) => {
      if (c.type && c.type.trim()) {
        typesSet.add(c.type.trim());
      }
    });
    return Array.from(typesSet).sort();
  }, [availableContacts]);

  // Filter contacts by type filter
  const filteredContacts = useMemo(() => {
    if (selectedContactType === "All") return availableContacts;
    return availableContacts.filter((c) => {
      if (selectedContactType === "Unspecified") {
        return !c.type || !c.type.trim();
      }
      return (c.type || "").trim().toLowerCase() === selectedContactType.toLowerCase();
    });
  }, [availableContacts, selectedContactType]);

  // Contact Selection Handlers
  const handleToggleContact = (id: string) => {
    setFormData((prev) => {
      const exists = prev.contact_ids.includes(id);
      return {
        ...prev,
        contact_ids: exists
          ? prev.contact_ids.filter((cid) => cid !== id)
          : [...prev.contact_ids, id],
      };
    });
  };

  const handleSelectAllContacts = () => {
    setFormData((prev) => ({
      ...prev,
      contact_ids: availableContacts.map((c) => c.id),
    }));
  };

  const handleSelectEligibleOnly = () => {
    const eligibleIds = availableContacts
      .filter((c) => c.status === "eligible" && !c.unsubscribed)
      .map((c) => c.id);
    setFormData((prev) => ({
      ...prev,
      contact_ids: eligibleIds,
    }));
  };

  const handleClearSelectedContacts = () => {
    setFormData((prev) => ({
      ...prev,
      contact_ids: [],
    }));
  };

  // Filter templates by name, purpose, or subject
  const filteredTemplates = useMemo(() => {
    const q = templateSearch.trim().toLowerCase();
    if (!q) return availableTemplates;
    return availableTemplates.filter((t) => {
      const name = (t.name || "").toLowerCase();
      const purpose = (t.purpose || "").toLowerCase();
      const subject = (t.subject || "").toLowerCase();
      return name.includes(q) || purpose.includes(q) || subject.includes(q);
    });
  }, [availableTemplates, templateSearch]);

  const handleToggleTemplate = (id: string) => {
    setFormData((prev) => {
      const exists = prev.template_ids.includes(id);
      return {
        ...prev,
        template_ids: exists
          ? prev.template_ids.filter((tid) => tid !== id)
          : [...prev.template_ids, id],
      };
    });
  };

  const handleClearSelectedTemplates = () => {
    setFormData((prev) => ({
      ...prev,
      template_ids: [],
    }));
  };

  const selectedTemplates = useMemo(() => {
    return availableTemplates.filter((t) => formData.template_ids.includes(t.id));
  }, [availableTemplates, formData.template_ids]);

  // Attachment Management
  const handleAddFiles = (filesToAdd: FileList | File[]) => {
    const fileArray = Array.from(filesToAdd);
    if (fileArray.length === 0) return;

    const validFiles: File[] = [];
    const invalidNames: string[] = [];

    for (const file of fileArray) {
      const ext = "." + file.name.split(".").pop()?.toLowerCase();
      if (ALLOWED_EXTENSIONS.includes(ext)) {
        validFiles.push(file);
      } else {
        invalidNames.push(file.name);
      }
    }

    if (invalidNames.length > 0) {
      Swal.fire({
        title: "Unsupported File Format",
        text: `The following file(s) are not supported: ${invalidNames.join(", ")}. Allowed formats: PDF, JPG, PNG, DOCX, PPTX, XLSX.`,
        icon: "warning",
        confirmButtonColor: "#AA2D7B",
      });
    }

    if (attachments.length + validFiles.length > MAX_ATTACHMENTS) {
      Swal.fire({
        title: "File Limit Exceeded",
        text: `You can upload at most ${MAX_ATTACHMENTS} attachments per campaign.`,
        icon: "warning",
        confirmButtonColor: "#AA2D7B",
      });
      return;
    }

    const currentTotalSize = attachments.reduce((sum, f) => sum + f.size, 0);
    const newTotalSize = validFiles.reduce((sum, f) => sum + f.size, currentTotalSize);

    if (newTotalSize > MAX_TOTAL_SIZE) {
      Swal.fire({
        title: "Total Size Limit Exceeded",
        text: `Total attachment size exceeds the 15 MB limit. Currently at ${formatFileSize(newTotalSize)}.`,
        icon: "warning",
        confirmButtonColor: "#AA2D7B",
      });
      return;
    }

    setAttachments((prev) => [...prev, ...validFiles]);
  };

  const handleRemoveAttachment = (index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  const totalAttachmentSize = useMemo(() => {
    return attachments.reduce((sum, f) => sum + f.size, 0);
  }, [attachments]);

  // Drag and Drop Events
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleAddFiles(e.dataTransfer.files);
    }
  };

  // Submit Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      Swal.fire({
        title: "Missing Name",
        text: "Please provide a name for this campaign.",
        icon: "warning",
        confirmButtonColor: "#AA2D7B",
      });
      return;
    }

    if (formData.template_ids.length === 0) {
      Swal.fire({
        title: "Missing Email Template",
        text: "Please select at least one email template for this campaign.",
        icon: "warning",
        confirmButtonColor: "#AA2D7B",
      });
      return;
    }

    if (!formData.registration_url.trim()) {
      Swal.fire({
        title: "Missing Registration URL",
        text: "Please provide a valid registration URL.",
        icon: "warning",
        confirmButtonColor: "#AA2D7B",
      });
      return;
    }

    const isDark = document.documentElement.classList.contains("dark");

    if (formData.contact_ids.length === 0) {
      const confirmNoContacts = await Swal.fire({
        title: "No Contacts Selected",
        text: "You haven't selected any recipient contacts for this campaign. Do you still want to proceed?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#AA2D7B",
        cancelButtonColor: "#6B7280",
        confirmButtonText: "Yes, create without contacts",
        cancelButtonText: "Back to select contacts",
        background: isDark ? "#111827" : "#FFFFFF",
        color: isDark ? "#F9FAFB" : "#111827",
      });
      if (!confirmNoContacts.isConfirmed) return;
    }

    setIsSubmitting(true);

    try {
      const response = await createCampaign({
        name: formData.name.trim(),
        description: formData.description.trim() || undefined,
        goal: formData.goal,
        template_id: formData.template_ids,
        contact_ids: formData.contact_ids,
        registration_url: formData.registration_url.trim(),
        followup_interval_days: Number(formData.followup_interval_days) || 1,
        followup_delay_minutes: formData.followup_delay_minutes !== "" ? Number(formData.followup_delay_minutes) : undefined,
        sending_delay_seconds: Number(formData.sending_delay_seconds) || 0,
        max_followups: Number(formData.max_followups) || 0,
        max_sends_per_day: Number(formData.max_sends_per_day) || 10,
        re_mail: Boolean(formData.re_mail),
        attachments: attachments,
      });

      setIsSubmitting(false);

      await Swal.fire({
        title: "Campaign Created!",
        html: `
          <div style="text-align: left; font-size: 13.5px; line-height: 1.6; padding: 4px 8px;">
            <p style="color: #10b981; font-weight: 600; margin-bottom: 8px;">
              ✓ Campaign "${response?.name || formData.name}" has been created successfully.
            </p>
            <p style="color: #6b7280; margin-bottom: 4px;"><b>Campaign ID:</b> <code style="background: rgba(170,45,123,0.1); padding: 2px 6px; border-radius: 4px; font-family: monospace;">${response?.id || "N/A"}</code></p>
            <p style="color: #6b7280; margin-bottom: 4px;"><b>Goal:</b> <span style="font-weight: 600; text-transform: uppercase;">${formData.goal}</span></p>
            <p style="color: #6b7280; margin-bottom: 4px;"><b>Status:</b> <span style="font-weight: 600; text-transform: uppercase;">${response?.status || "pending"}</span></p>
            <p style="color: #6b7280; margin-bottom: 4px;"><b>Target Contacts:</b> ${formData.contact_ids.length} recipients</p>
            <p style="color: #6b7280; margin-bottom: 4px;"><b>Templates:</b> ${formData.template_ids.length} selected</p>
            ${attachments.length > 0 ? `<p style="color: #6b7280; margin-bottom: 4px;"><b>Attachments:</b> ${attachments.length} file(s) (${formatFileSize(totalAttachmentSize)})</p>` : ""}
          </div>
        `,
        icon: "success",
        confirmButtonColor: "#AA2D7B",
        background: isDark ? "#111827" : "#FFFFFF",
        color: isDark ? "#F9FAFB" : "#111827",
      });

      // Redirect back to campaigns list
      navigate("/campaigns");
    } catch (err: any) {
      setIsSubmitting(false);
      await Swal.fire({
        title: "Failed to Create Campaign",
        text: err?.message || "An unexpected error occurred while communicating with the Email Agent API.",
        icon: "error",
        confirmButtonColor: "#AA2D7B",
        background: isDark ? "#111827" : "#FFFFFF",
        color: isDark ? "#F9FAFB" : "#111827",
      });
    }
  };

  return (
    <>
      <PageMeta
        title="Create Campaign | Kaizen Con 2027"
        description="Configure automated email outreach campaign sequences, attachments, delivery throttling, and recipient lists."
      />

      <AdminPageContainer
        title="Create New Campaign"
        subtitle="Configure automated email outreach sequences, template parameters, attachments, throttling quotas, and recipient lists via Email Agent API."
        actionButton={
          <button
            type="button"
            onClick={() => navigate("/campaigns")}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/60 rounded-lg shadow-xs transition-colors cursor-pointer"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            <span>Back to Campaigns</span>
          </button>
        }
      >
        <form onSubmit={handleSubmit} className="w-full space-y-7">
          {/* Section 1: Campaign Details */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-lg bg-pink-50 dark:bg-pink-950/40 text-[#AA2D7B]">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </span>
              <div>
                <h2 className="text-sm font-bold text-gray-900 dark:text-white">
                  Campaign Information
                </h2>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Core identity, campaign goal, registration link, and linked email outreach templates
                </p>
              </div>
            </div>

            {/* Side-by-side grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Left Column: Name, Goal, & Template */}
              <div className="space-y-4">
                {/* Campaign Name */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Campaign Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. KAIZENCON INVITATION attachments"
                    className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-[#AA2D7B]"
                  />
                </div>

                {/* Campaign Goal */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Campaign Goal <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={formData.goal}
                    onChange={(e) => setFormData({ ...formData, goal: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-[#AA2D7B] cursor-pointer"
                  >
                    <option value="registration">Registration (Default outreach sequence)</option>
                    <option value="participation">Participation (Delegate & faculty invitation)</option>
                    <option value="sponsorship">Sponsorship (Sponsor & exhibitor partnership)</option>
                  </select>
                </div>

                {/* Email Template (Multi-select) */}
                <div ref={templateDropdownRef} className="relative">
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300">
                      Email Template <span className="text-gray-400 font-normal">(Multi-select templates)</span>{" "}
                      <span className="text-[#AA2D7B] font-bold">
                        ({formData.template_ids.length} selected)
                      </span>
                    </label>
                    {loadingTemplates && (
                      <span className="text-[11px] text-[#AA2D7B] flex items-center gap-1 font-medium">
                        <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <circle cx="12" cy="12" r="10" strokeOpacity="0.25" />
                          <path d="M12 2a10 10 0 0 1 10 10" />
                        </svg>
                        Loading templates...
                      </span>
                    )}
                  </div>

                  {/* Multi-select trigger */}
                  <div
                    onClick={() => setIsTemplateDropdownOpen((prev) => !prev)}
                    className="w-full min-h-[42px] px-3.5 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus-within:ring-2 focus-within:ring-[#AA2D7B] cursor-pointer flex items-center justify-between gap-2 shadow-xs transition"
                  >
                    <div className="flex flex-wrap items-center gap-1.5 min-w-0 flex-1">
                      {formData.template_ids.length === 0 ? (
                        <span className="text-gray-400 text-xs">-- Choose Email Template(s) --</span>
                      ) : (
                        selectedTemplates.slice(0, 2).map((tpl) => (
                          <span
                            key={tpl.id}
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium bg-[#AA2D7B]/10 text-[#AA2D7B] border border-[#AA2D7B]/20 max-w-[200px]"
                          >
                            <span className="truncate">{tpl.name}</span>
                            <span
                              onClick={(e) => {
                                e.stopPropagation();
                                handleToggleTemplate(tpl.id);
                              }}
                              className="hover:bg-[#AA2D7B]/20 rounded p-0.5 cursor-pointer ml-0.5"
                              title="Remove"
                            >
                              ✕
                            </span>
                          </span>
                        ))
                      )}
                      {formData.template_ids.length > 2 && (
                        <span className="px-2 py-0.5 rounded-md text-[11px] font-semibold bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
                          +{formData.template_ids.length - 2} more
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0 text-gray-400">
                      {formData.template_ids.length > 0 && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleClearSelectedTemplates();
                          }}
                          title="Clear all selected templates"
                          className="p-1 hover:text-rose-500 rounded text-xs transition-colors cursor-pointer"
                        >
                          ✕
                        </button>
                      )}
                      <svg
                        className={`w-4 h-4 transition-transform duration-200 ${
                          isTemplateDropdownOpen ? "rotate-180" : ""
                        }`}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>

                  {/* Dropdown Menu Popup */}
                  {isTemplateDropdownOpen && (
                    <div className="absolute z-50 left-0 right-0 mt-1 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                      {/* Search Bar & Actions */}
                      <div className="p-2.5 border-b border-gray-100 dark:border-gray-700/60 space-y-2 bg-gray-50/70 dark:bg-gray-800/80">
                        <div className="relative">
                          <input
                            type="text"
                            value={templateSearch}
                            onChange={(e) => setTemplateSearch(e.target.value)}
                            placeholder="Filter templates by name, purpose, or subject..."
                            className="w-full pl-8 pr-7 py-1.5 text-xs rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-hidden focus:ring-1 focus:ring-[#AA2D7B]"
                            autoFocus
                            onClick={(e) => e.stopPropagation()}
                          />
                          <svg
                            className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <circle cx="11" cy="11" r="8" strokeWidth="2" />
                            <path d="M21 21l-4.35-4.35" strokeWidth="2" />
                          </svg>
                          {templateSearch && (
                            <button
                              type="button"
                              onClick={() => setTemplateSearch("")}
                              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xs"
                            >
                              ✕
                            </button>
                          )}
                        </div>

                        <div className="flex items-center justify-between text-[11px] text-gray-500 dark:text-gray-400 px-0.5">
                          <span>
                            {filteredTemplates.length} template{filteredTemplates.length !== 1 ? "s" : ""} available
                          </span>
                          {formData.template_ids.length > 0 && (
                            <button
                              type="button"
                              onClick={handleClearSelectedTemplates}
                              className="text-rose-500 hover:text-rose-600 font-medium cursor-pointer"
                            >
                              Deselect All
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Options List */}
                      <div className="max-h-60 overflow-y-auto divide-y divide-gray-100 dark:divide-gray-700/60">
                        {loadingTemplates ? (
                          <div className="p-4 text-center text-xs text-gray-400">Loading templates...</div>
                        ) : filteredTemplates.length === 0 ? (
                          <div className="p-4 text-center text-xs text-gray-400">No matching templates found</div>
                        ) : (
                          filteredTemplates.map((tpl) => {
                            const isSelected = formData.template_ids.includes(tpl.id);
                            return (
                              <div
                                key={tpl.id}
                                onClick={() => handleToggleTemplate(tpl.id)}
                                className={`p-2.5 flex items-start gap-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors ${
                                  isSelected ? "bg-[#AA2D7B]/5 dark:bg-[#AA2D7B]/15" : ""
                                }`}
                              >
                                <input
                                  type="checkbox"
                                  checked={isSelected}
                                  onChange={() => {}}
                                  className="mt-0.5 w-4 h-4 rounded text-[#AA2D7B] focus:ring-[#AA2D7B] cursor-pointer"
                                />
                                <div className="min-w-0 flex-1">
                                  <div className="flex items-center gap-1.5 flex-wrap">
                                    <span className="text-xs font-semibold text-gray-900 dark:text-gray-100">
                                      {tpl.name}
                                    </span>
                                    {tpl.purpose && (
                                      <span className="px-1.5 py-0.2 rounded text-[9px] font-bold uppercase tracking-wider bg-purple-100 dark:bg-purple-900/60 text-purple-700 dark:text-purple-300">
                                        {tpl.purpose}
                                      </span>
                                    )}
                                  </div>
                                  {tpl.subject && (
                                    <p className="text-[11px] text-gray-500 dark:text-gray-400 truncate mt-0.5">
                                      {tpl.subject}
                                    </p>
                                  )}
                                </div>
                              </div>
                            );
                          })
                        )}
                      </div>
                    </div>
                  )}

                  {/* Selected Templates Cards List below */}
                  {selectedTemplates.length > 0 && (
                    <div className="mt-2.5 space-y-1.5 max-h-44 overflow-y-auto pr-1">
                      {selectedTemplates.map((tpl) => (
                        <div
                          key={tpl.id}
                          className="p-2.5 rounded-lg bg-purple-50/70 dark:bg-purple-950/30 border border-purple-100 dark:border-purple-900/40 text-xs flex items-center justify-between gap-2"
                        >
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-1.5">
                              <span className="font-semibold text-purple-900 dark:text-purple-300 truncate">
                                {tpl.name}
                              </span>
                              {tpl.purpose && (
                                <span className="px-1.5 py-0.2 rounded text-[9px] font-semibold uppercase bg-purple-200/70 dark:bg-purple-800/60 text-purple-800 dark:text-purple-200 shrink-0">
                                  {tpl.purpose}
                                </span>
                              )}
                            </div>
                            {tpl.subject && (
                              <p className="text-[11px] text-gray-600 dark:text-gray-400 truncate mt-0.5">
                                <span className="text-gray-400">Subject:</span> {tpl.subject}
                              </p>
                            )}
                          </div>
                          <button
                            type="button"
                            onClick={() => handleToggleTemplate(tpl.id)}
                            className="p-1 rounded text-gray-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition shrink-0 cursor-pointer"
                            title="Remove template"
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Right Column: Registration URL & Description */}
              <div className="space-y-4">
                {/* Registration URL */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Registration URL <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="url"
                    required
                    value={formData.registration_url}
                    onChange={(e) => setFormData({ ...formData, registration_url: e.target.value })}
                    placeholder="https://example.com/register"
                    className="w-full px-3.5 py-2.5 text-sm font-mono rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-[#AA2D7B]"
                  />
                </div>

                {/* Campaign Description */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Description <span className="text-gray-400 font-normal">(Optional)</span>
                  </label>
                  <textarea
                    rows={selectedTemplates.length > 0 ? 5 : 4}
                    maxLength={2000}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Brief overview of the campaign objective, target audience, or workflow notes..."
                    className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-[#AA2D7B] resize-none"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Email Attachments */}
          <div className="border-t border-gray-100 dark:border-gray-800 pt-6 space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-lg bg-pink-50 dark:bg-pink-950/40 text-[#AA2D7B]">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                  </svg>
                </span>
                <div>
                  <h2 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <span>Campaign Attachments</span>
                    <span className="text-xs font-normal text-gray-400">(Optional)</span>
                  </h2>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Attach announcement brochures, event schedules, or documents to outbound emails
                  </p>
                </div>
              </div>

              {attachments.length > 0 && (
                <div className="flex items-center gap-3">
                  <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                    {attachments.length} of {MAX_ATTACHMENTS} files &bull; {formatFileSize(totalAttachmentSize)} / 15 MB
                  </span>
                  <button
                    type="button"
                    onClick={() => setAttachments([])}
                    className="text-xs font-semibold text-rose-600 dark:text-rose-400 hover:underline cursor-pointer"
                  >
                    Clear All
                  </button>
                </div>
              )}
            </div>

            {/* Hidden File Input */}
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept=".pdf,.jpg,.jpeg,.png,.docx,.pptx,.xlsx"
              className="hidden"
              onChange={(e) => {
                if (e.target.files && e.target.files.length > 0) {
                  handleAddFiles(e.target.files);
                  e.target.value = "";
                }
              }}
            />

            {/* Drag & Drop Zone */}
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`p-6 border-2 border-dashed rounded-xl flex flex-col items-center justify-center text-center cursor-pointer transition-all ${
                isDragging
                  ? "border-[#AA2D7B] bg-[#AA2D7B]/5 dark:bg-[#AA2D7B]/10 scale-[1.005]"
                  : "border-gray-300 dark:border-gray-700 bg-gray-50/60 dark:bg-gray-800/40 hover:bg-gray-100/60 dark:hover:bg-gray-800/80 hover:border-gray-400"
              }`}
            >
              <div className="w-12 h-12 rounded-full bg-pink-100/80 dark:bg-pink-950/60 text-[#AA2D7B] flex items-center justify-center mb-2.5">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
              </div>
              <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                Click to browse or drag & drop campaign attachments here
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Supported formats: <span className="font-semibold text-gray-700 dark:text-gray-300">PDF, JPG, PNG, DOCX, PPTX, XLSX</span> (Max {MAX_ATTACHMENTS} files, up to 15 MB total)
              </p>
            </div>

            {/* Attachments List */}
            {attachments.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 pt-1">
                {attachments.map((file, idx) => {
                  const style = getFileIconColor(file.name);
                  return (
                    <div
                      key={idx}
                      className={`p-3 rounded-xl border ${style.border} ${style.bg} flex items-center justify-between gap-3 shadow-2xs`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0 flex-1">
                        <span className={`px-2 py-1 rounded text-[10px] font-black tracking-wider ${style.text} bg-white dark:bg-gray-900 border ${style.border}`}>
                          {style.label}
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-semibold text-gray-900 dark:text-white truncate" title={file.name}>
                            {file.name}
                          </p>
                          <p className="text-[11px] text-gray-500 dark:text-gray-400 font-mono mt-0.5">
                            {formatFileSize(file.size)}
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveAttachment(idx);
                        }}
                        className="p-1 rounded text-gray-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition cursor-pointer"
                        title="Remove file"
                      >
                        ✕
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Section 3: Automation & Delivery Settings */}
          <div className="border-t border-gray-100 dark:border-gray-800 pt-6 space-y-4">
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-lg bg-pink-50 dark:bg-pink-950/40 text-[#AA2D7B]">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </span>
              <div>
                <h2 className="text-sm font-bold text-gray-900 dark:text-white">
                  Automation & Timing Settings
                </h2>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Delay intervals, followup sequences, and daily send limits
                </p>
              </div>
            </div>

            {/* 6 timing & automation inputs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Sending Delay */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Sending Delay (seconds)
                </label>
                <input
                  type="number"
                  min="0"
                  max="3600"
                  value={formData.sending_delay_seconds}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      sending_delay_seconds: Number(e.target.value) || 0,
                    })
                  }
                  className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-[#AA2D7B]"
                />
                <p className="text-[11px] text-gray-400 mt-1">
                  Interval between outbound messages (e.g. 30 seconds)
                </p>
              </div>

              {/* Followup Delay (minutes) */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Followup Delay (minutes) <span className="text-gray-400 font-normal">(Optional)</span>
                </label>
                <input
                  type="number"
                  min="1"
                  max="525600"
                  placeholder="e.g. 1440 (1 day) or leave empty"
                  value={formData.followup_delay_minutes}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      followup_delay_minutes: e.target.value === "" ? "" : Number(e.target.value),
                    })
                  }
                  className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-[#AA2D7B]"
                />
                <p className="text-[11px] text-gray-400 mt-1">
                  Initial delay in minutes before automatic follow-up sequence
                </p>
              </div>

              {/* Followup Interval */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Followup Interval (days)
                </label>
                <input
                  type="number"
                  min="1"
                  max="365"
                  value={formData.followup_interval_days}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      followup_interval_days: Number(e.target.value) || 1,
                    })
                  }
                  className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-[#AA2D7B]"
                />
                <p className="text-[11px] text-gray-400 mt-1">
                  Interval in days between follow-up rounds (e.g. 1 day)
                </p>
              </div>

              {/* Max Followups */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Max Followups
                </label>
                <input
                  type="number"
                  min="0"
                  max="10"
                  value={formData.max_followups}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      max_followups: Number(e.target.value) || 0,
                    })
                  }
                  className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-[#AA2D7B]"
                />
                <p className="text-[11px] text-gray-400 mt-1">
                  Maximum number of automatic follow-up reminders (0–10)
                </p>
              </div>

              {/* Max Sends Per Day */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Max Sends Per Day
                </label>
                <input
                  type="number"
                  min="1"
                  max="10000"
                  value={formData.max_sends_per_day}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      max_sends_per_day: Number(e.target.value) || 10,
                    })
                  }
                  className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-[#AA2D7B]"
                />
                <p className="text-[11px] text-gray-400 mt-1">
                  Daily throttle quota for this campaign (e.g. 100)
                </p>
              </div>

              {/* Re-mail Checkbox */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Re-mail Configuration
                </label>
                <div
                  onClick={() => setFormData((prev) => ({ ...prev, re_mail: !prev.re_mail }))}
                  className={`flex items-start justify-between p-3 rounded-lg border transition-all cursor-pointer ${
                    formData.re_mail
                      ? "border-[#AA2D7B]/40 bg-[#AA2D7B]/5 dark:bg-[#AA2D7B]/10 dark:border-[#AA2D7B]/40"
                      : "border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800"
                  }`}
                >
                  <div className="pr-2 select-none">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-semibold text-gray-900 dark:text-white">
                        Enable Re-mail
                      </span>
                      {formData.re_mail && (
                        <span className="px-1.5 py-0.2 rounded text-[10px] font-semibold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300">
                          Active
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-gray-400 mt-1">
                      Allow resending outreach messages to previous recipients
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={formData.re_mail}
                    onChange={(e) => {
                      e.stopPropagation();
                      setFormData({ ...formData, re_mail: e.target.checked });
                    }}
                    className="mt-0.5 w-4 h-4 rounded text-[#AA2D7B] focus:ring-[#AA2D7B] cursor-pointer accent-[#AA2D7B]"
                  />
                </div>
                <p className="text-[11px] text-gray-400 mt-1">
                  re_mail: {formData.re_mail ? "true" : "false"}
                </p>
              </div>
            </div>
          </div>

          {/* Section 4: Target Recipients / Contacts */}
          <div className="border-t border-gray-100 dark:border-gray-800 pt-6 space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-lg bg-pink-50 dark:bg-pink-950/40 text-[#AA2D7B]">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </span>
                <div>
                  <h2 className="text-sm font-bold text-gray-900 dark:text-white">
                    Target Contacts ({formData.contact_ids.length} selected)
                  </h2>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Select recipient contacts to include in this campaign sequence
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1.5 flex-wrap">
                {/* Type Filter Select */}
                {availableTypes.length > 0 && (
                  <div className="flex items-center gap-1.5 mr-1">
                    <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 whitespace-nowrap">
                      Type:
                    </span>
                    <select
                      value={selectedContactType}
                      onChange={(e) => setSelectedContactType(e.target.value)}
                      className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-750 focus:outline-hidden focus:ring-1 focus:ring-[#AA2D7B] cursor-pointer shadow-2xs"
                    >
                      <option value="All">All Types ({availableContacts.length})</option>
                      {availableTypes.map((t) => {
                        const count = availableContacts.filter(
                          (c) => (c.type || "").trim().toLowerCase() === t.toLowerCase()
                        ).length;
                        return (
                          <option key={t} value={t}>
                            {t} ({count})
                          </option>
                        );
                      })}
                      {availableContacts.some((c) => !c.type || !c.type.trim()) && (
                        <option value="Unspecified">
                          Unspecified ({availableContacts.filter((c) => !c.type || !c.type.trim()).length})
                        </option>
                      )}
                    </select>
                  </div>
                )}

                <button
                  type="button"
                  onClick={handleSelectEligibleOnly}
                  className="px-3 py-1.5 text-xs font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 rounded-lg border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100 transition cursor-pointer"
                >
                  Eligible Only
                </button>
                <button
                  type="button"
                  onClick={handleSelectAllContacts}
                  className="px-3 py-1.5 text-xs font-semibold text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition cursor-pointer"
                >
                  All ({availableContacts.length})
                </button>
                <button
                  type="button"
                  onClick={handleClearSelectedContacts}
                  className="px-3 py-1.5 text-xs font-semibold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/30 rounded-lg hover:bg-rose-100 transition cursor-pointer"
                >
                  Clear
                </button>
              </div>
            </div>

            {/* Contacts List Box */}
            <div className="max-h-80 overflow-y-auto rounded-lg border border-gray-200 dark:border-gray-800 divide-y divide-gray-100 dark:divide-gray-800 bg-white dark:bg-gray-800/40">
              {loadingContacts ? (
                <div className="py-12 text-center text-xs text-gray-400 flex flex-col items-center justify-center gap-2">
                  <svg className="w-5 h-5 animate-spin text-[#AA2D7B]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <circle cx="12" cy="12" r="10" strokeOpacity="0.25" />
                    <path d="M12 2a10 10 0 0 1 10 10" />
                  </svg>
                  <span>Loading available contacts...</span>
                </div>
              ) : filteredContacts.length === 0 ? (
                <div className="py-10 text-center text-xs text-gray-400">
                  No matching contacts found.
                </div>
              ) : (
                filteredContacts.map((c) => {
                  const isSelected = formData.contact_ids.includes(c.id);
                  return (
                    <div
                      key={c.id}
                      onClick={() => handleToggleContact(c.id)}
                      className={`p-3 flex items-center justify-between gap-3 cursor-pointer hover:bg-gray-50/80 dark:hover:bg-gray-700/40 transition-colors ${
                        isSelected ? "bg-[#AA2D7B]/5 dark:bg-[#AA2D7B]/10" : ""
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => {}}
                          className="w-4 h-4 rounded text-[#AA2D7B] focus:ring-[#AA2D7B] cursor-pointer"
                        />
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-gray-900 dark:text-gray-100 truncate">
                            {c.name || "Unnamed Contact"}
                          </p>
                          <p className="text-[11px] text-gray-500 dark:text-gray-400 font-mono truncate">
                            {c.email}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2.5 shrink-0">
                        {/* Type badge */}
                        {c.type ? (
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold capitalize ${
                              c.type.toLowerCase().includes("doctor")
                                ? "bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800"
                                : c.type.toLowerCase().includes("sponser") ||
                                  c.type.toLowerCase().includes("sponsor")
                                ? "bg-purple-50 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800"
                                : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700"
                            }`}
                          >
                            {c.type}
                          </span>
                        ) : (
                          <span className="text-xs text-gray-400 font-mono">—</span>
                        )}

                        {/* Status badge */}
                        <span
                          className={`shrink-0 text-[10px] font-semibold px-2.5 py-0.5 rounded-full capitalize ${
                            c.status === "eligible" && !c.unsubscribed
                              ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60"
                              : "bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800/60"
                          }`}
                        >
                          {c.unsubscribed ? "Unsubscribed" : c.status}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Form Action Buttons Bar */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100 dark:border-gray-800">
            <button
              type="button"
              onClick={() => navigate("/campaigns")}
              disabled={isSubmitting}
              className="px-5 py-2.5 text-xs font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors cursor-pointer disabled:opacity-40"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 px-6 py-2.5 text-xs font-semibold text-white bg-[#AA2D7B] hover:bg-[#8F2266] rounded-lg shadow-sm transition-colors cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" strokeOpacity="0.25" />
                    <path d="M12 2a10 10 0 0 1 10 10" />
                  </svg>
                  <span>Creating Campaign...</span>
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <line x1="12" y1="5" x2="12" y2="19" />
                    <line x1="5" y1="12" x2="19" y2="12" />
                  </svg>
                  <span>Create Campaign</span>
                </>
              )}
            </button>
          </div>
        </form>
      </AdminPageContainer>
    </>
  );
}
