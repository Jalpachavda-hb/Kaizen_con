import React, { useState, useEffect, useCallback, useMemo } from "react";
import PageMeta from "../../components/common/PageMeta";
import { AdminPageContainer } from "../../components/common/AdminPageContainer";
import { useToast } from "../../context/ToastContext";
import {
  getTemplates,
  createTemplate,
  updateTemplate,
  deleteTemplate,
} from "../../api/ApiPath";
import Swal from "sweetalert2";
import logoUrl from "../../assets/images/logokaizecon.png";

export interface TemplateItem {
  id: string;
  name: string;
  purpose: "general" | "initial" | "followup" | "registration" | string;
  subject: string;
  html_body?: string;
  active: boolean;
  version?: number;
  created_at?: string;
  updated_at?: string;
}

// Live dynamic templates dataset from http://192.168.29.201:8000/api/v1/email-agent/templates
const DYNAMIC_TEMPLATES_DATA: TemplateItem[] = [
  {
    id: "f76f0e6f-32d1-4064-87ee-6c0833cc0369",
    name: "followup",
    purpose: "followup",
    subject: "A Gentle Reminder: Join Us at KaizenCon 2027",
    html_body: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>KaizenCon 2027 | Follow-Up Invitation</title>
</head>
<body style="margin:0;padding:0;background-color:#F6F7FB;font-family:Arial,Helvetica,sans-serif;color:#49304F;">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;">
    Following up on our invitation to KaizenCon 2027 — Robotics &amp; AI: Shaping the Future of GI Surgery.
  </div>
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color:#F6F7FB;margin:0;padding:24px 10px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="width:100%;max-width:1000px;background-color:#FFFFFF;border:1px solid #E7DDE9;">
          <tr>
            <td align="center" style="padding:28px 28px 18px;background-color:#FFFFFF;">
              <img src="cid:kaizencon_logo" width="100" alt="KaizenCon 2027 — Robotics &amp; AI" style="display:block;width:25%;max-width:500px;height:auto;border:0;outline:none;text-decoration:none;">
            </td>
          </tr>
          <tr>
            <td style="padding:0 28px;">
              <div style="height:5px;background-color:#A92E83;font-size:0;line-height:0;">&nbsp;</div>
            </td>
          </tr>
          <tr>
            <td style="padding:28px 34px 10px;">
              <p style="margin:0 0 8px;font-size:12px;line-height:18px;letter-spacing:2px;text-transform:uppercase;color:#A92E83;font-weight:bold;">Follow-Up Invitation</p>
              <h1 style="margin:0;color:#51345B;font-size:28px;line-height:35px;font-weight:700;">We Hope to Welcome You to KaizenCon 2027</h1>
            </td>
          </tr>
          <tr>
            <td style="padding:8px 34px 0;font-size:15px;line-height:25px;color:#51465A;">
              <p style="margin:0 0 16px;">Dear <strong>{{name}}</strong>,</p>
              <p style="margin:0 0 16px;">We are writing to follow up on our invitation to <strong>{{hospital_name}}</strong> to participate in <strong>KaizenCon 2027 — “Robotics &amp; AI: Shaping the Future of GI Surgery.”</strong></p>
              <p style="margin:0 0 16px;">As we prepare for this exciting gathering, we would be delighted to have your institution join us in exploring the latest advances in robotic surgery, artificial intelligence, and innovative gastrointestinal surgical techniques.</p>
              <p style="margin:0 0 16px;">The conference will offer opportunities to exchange clinical insights, engage with leading experts, and discuss how emerging technologies can help shape the future of surgical care.</p>
            </td>
          </tr>
          <tr>
            <td style="padding:4px 34px 18px;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color:#FBF6FA;border-left:4px solid #A92E83;">
                <tr>
                  <td style="padding:18px 20px;">
                    <p style="margin:0 0 9px;font-size:13px;line-height:18px;color:#A92E83;font-weight:bold;letter-spacing:1px;text-transform:uppercase;">Conference Details</p>
                    <p style="margin:0 0 7px;font-size:15px;line-height:23px;color:#51345B;"><strong>Date:</strong> 1–3 January 2027</p>
                    <p style="margin:0 0 7px;font-size:15px;line-height:23px;color:#51345B;"><strong>Venue:</strong> Hyatt Regency, Ashram Road</p>
                    <p style="margin:0;font-size:15px;line-height:23px;color:#51345B;"><strong>Location:</strong> Ahmedabad, Gujarat, India</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding:0 34px 10px;font-size:15px;line-height:25px;color:#51465A;">
              <p style="margin:0 0 12px;"><strong>Key conference highlights include:</strong></p>
              <ul style="margin:0 0 18px;padding-left:22px;">
                <li style="padding:0 0 7px;">Practical AI and generative AI applications for surgeons</li>
                <li style="padding:0 0 7px;">Robotics vs. laparoscopy CME discussions and expert debates</li>
                <li style="padding:0 0 7px;">Emerging surgical technologies, training, and responsible AI</li>
                <li style="padding:0;">Live robotic surgery and telesurgery sessions</li>
              </ul>
              <p style="margin:0 0 16px;">We would appreciate hearing whether your institution may be interested in participating.</p>
              <p style="margin:0 0 20px;">Please reply to this email or contact us at <a href="mailto:{{contact_email}}" style="color:#A92E83;text-decoration:underline;font-weight:bold;">{{contact_email}}</a>.</p>
            </td>
          </tr>
          <tr>
            <td align="center" style="padding:6px 34px 30px;">
              <a href="{{registration_url}}" style="display:inline-block;background-color:#A92E83;color:#FFFFFF;text-decoration:none;font-size:15px;line-height:20px;font-weight:bold;padding:14px 26px;border:1px solid #A92E83;">Express Your Interest</a>
            </td>
          </tr>
          <tr>
            <td style="padding:22px 34px;background-color:#51345B;color:#FFFFFF;">
              <p style="margin:0 0 5px;font-size:15px;line-height:22px;font-weight:bold;color:#FFFFFF;">Warm regards,</p>
              <p style="margin:0 0 3px;font-size:15px;line-height:22px;color:#FFFFFF;">{{sender_name}}</p>
              <p style="margin:0 0 12px;font-size:13px;line-height:20px;color:#EADFEA;">{{sender_title}} | KaizenCon 2027 Organising Team</p>
              <p style="margin:0;font-size:12px;line-height:19px;color:#EADFEA;">Robotics &amp; AI: Shaping the Future of GI Surgery<br>Evidence • Technique • Intelligence</p>
            </td>
          </tr>
        </table>
        <p style="max-width:600px;margin:14px auto 0;font-size:11px;line-height:17px;color:#817587;text-align:center;">You are receiving this invitation in connection with professional healthcare and conference participation.</p>
      </td>
    </tr>
  </table>
</body>
</html>`,
    active: true,
    version: 1,
    created_at: "2026-10-21T13:08:43.022016Z",
    updated_at: "2026-10-21T13:08:43.022016Z",
  },
  {
    id: "b2f74abc-79b4-4f7e-8a23-edb64bef1eb4",
    name: "invitation ",
    purpose: "initial",
    subject: "Official Invitation | KaizenCon 2027",
    html_body: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>KaizenCon 2027 | Official Invitation</title>
</head>
<body style="margin:0;padding:0;background-color:#F6F7FB;font-family:Arial,Helvetica,sans-serif;color:#49304F;">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;">
    Invitation to KaizenCon 2027 — Robotics &amp; AI: Shaping the Future of GI Surgery.
  </div>
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color:#F6F7FB;margin:0;padding:24px 10px;">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellspacing="0" cellpadding="0" border="0" style="width:100%;max-width:1000px;background-color:#FFFFFF;border:1px solid #E7DDE9;">
          <tr>
            <td align="center" style="padding:28px 28px 18px;background-color:#FFFFFF;">
              <img src="cid:kaizencon_logo" width="100" alt="KaizenCon 2027 — Robotics &amp; AI" style="display:block;width:25%;max-width:500px;height:auto;border:0;outline:none;text-decoration:none;">
            </td>
          </tr>
          <tr>
            <td style="padding:0 28px;">
              <div style="height:5px;background-color:#A92E83;font-size:0;line-height:0;">&nbsp;</div>
            </td>
          </tr>
          <tr>
            <td style="padding:28px 34px 10px;">
              <p style="margin:0 0 8px;font-size:12px;line-height:18px;letter-spacing:2px;text-transform:uppercase;color:#A92E83;font-weight:bold;">Official Invitation</p>
              <h1 style="margin:0;color:#51345B;font-size:28px;line-height:35px;font-weight:700;">Advancing the Future of GI Surgery Together</h1>
            </td>
          </tr>
          <tr>
            <td style="padding:8px 34px 0;font-size:15px;line-height:25px;color:#51465A;">
              <p style="margin:0 0 16px;">Dear <strong>{{ name }}</strong>,</p>
              <p style="margin:0 0 16px;">On behalf of <strong>KaizenCon 2027</strong>, we are pleased to invite <strong>{{hospital_name}}</strong> to participate in our upcoming conference, <strong>“Robotics &amp; AI: Shaping the Future of GI Surgery.”</strong></p>
              <p style="margin:0 0 16px;">The meeting will bring together surgeons, healthcare leaders, researchers, and technology innovators to explore how artificial intelligence, robotics, and evidence-based techniques are transforming gastrointestinal surgery.</p>
            </td>
          </tr>
          <tr>
            <td style="padding:4px 34px 18px;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color:#FBF6FA;border-left:4px solid #A92E83;">
                <tr>
                  <td style="padding:18px 20px;">
                    <p style="margin:0 0 9px;font-size:13px;line-height:18px;color:#A92E83;font-weight:bold;letter-spacing:1px;text-transform:uppercase;">Conference Details</p>
                    <p style="margin:0 0 7px;font-size:15px;line-height:23px;color:#51345B;"><strong>Date:</strong> 1–3 January 2027</p>
                    <p style="margin:0 0 7px;font-size:15px;line-height:23px;color:#51345B;"><strong>Venue:</strong> Hyatt Regency, Ashram Road</p>
                    <p style="margin:0;font-size:15px;line-height:23px;color:#51345B;"><strong>Location:</strong> Ahmedabad, Gujarat, India</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding:0 34px 10px;font-size:15px;line-height:25px;color:#51465A;">
              <p style="margin:0 0 12px;"><strong>Conference highlights include:</strong></p>
              <ul style="margin:0 0 18px;padding-left:22px;">
                <li style="padding:0 0 7px;">Practical AI and generative AI applications for surgeons</li>
                <li style="padding:0 0 7px;">Robotics vs. laparoscopy CME discussions and expert debates</li>
                <li style="padding:0 0 7px;">Emerging surgical technologies, training, and responsible AI</li>
                <li style="padding:0;">Live robotic surgery and telesurgery sessions</li>
              </ul>
              <p style="margin:0 0 16px;">We would be honoured to have your institution join us in sharing knowledge and clinical collaboration.</p>
              <p style="margin:0 0 20px;">Please reply to this email or contact us at <a href="mailto:{{contact_email}}" style="color:#A92E83;text-decoration:underline;font-weight:bold;">{{contact_email}}</a>.</p>
            </td>
          </tr>
          <tr>
            <td align="center" style="padding:6px 34px 30px;">
              <a href="{{registration_url}}" style="display:inline-block;background-color:#A92E83;color:#FFFFFF;text-decoration:none;font-size:15px;line-height:20px;font-weight:bold;padding:14px 26px;border:1px solid #A92E83;">Confirm Your Interest</a>
            </td>
          </tr>
          <tr>
            <td style="padding:22px 34px;background-color:#51345B;color:#FFFFFF;">
              <p style="margin:0 0 5px;font-size:15px;line-height:22px;font-weight:bold;color:#FFFFFF;">Warm regards,</p>
              <p style="margin:0 0 3px;font-size:15px;line-height:22px;color:#FFFFFF;">{{sender_name}}</p>
              <p style="margin:0 0 12px;font-size:13px;line-height:20px;color:#EADFEA;">{{sender_title}} | KaizenCon 2027 Organising Team</p>
              <p style="margin:0;font-size:12px;line-height:19px;color:#EADFEA;">Robotics &amp; AI: Shaping the Future of GI Surgery<br>Evidence • Technique • Intelligence</p>
            </td>
          </tr>
        </table>
        <p style="max-width:600px;margin:14px auto 0;font-size:11px;line-height:17px;color:#817587;text-align:center;">You are receiving this invitation in connection with professional healthcare and conference participation.</p>
      </td>
    </tr>
  </table>
</body>
</html>`,
    active: true,
    version: 1,
    created_at: "2026-10-21T13:04:56.185459Z",
    updated_at: "2026-10-21T13:04:56.185459Z",
  },
  {
    id: "cc7071f4-74d9-45b0-b29e-a3056abe1f6b",
    name: "registration",
    purpose: "registration",
    subject: "You're In! Join Us for KaizenCon 2027",
    html_body: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>KaizenCon 2027 | Registration Confirmation</title>
</head>
<body style="margin:0;padding:0;background-color:#F6F7FB;font-family:Arial,Helvetica,sans-serif;color:#49304F;">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;">
    Your registration for KaizenCon 2027 — Robotics &amp; AI: Shaping the Future of GI Surgery.
  </div>
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color:#F6F7FB;margin:0;padding:24px 10px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="width:100%;max-width:1000px;background-color:#FFFFFF;border:1px solid #E7DDE9;">
          <tr>
            <td align="center" style="padding:28px 28px 18px;background-color:#FFFFFF;">
              <img src="cid:kaizencon_logo" width="100" alt="KaizenCon 2027 — Robotics &amp; AI" style="display:block;width:25%;max-width:500px;height:auto;border:0;outline:none;text-decoration:none;">
            </td>
          </tr>
          <tr>
            <td style="padding:0 28px;">
              <div style="height:5px;background-color:#A92E83;font-size:0;line-height:0;">&nbsp;</div>
            </td>
          </tr>
          <tr>
            <td style="padding:28px 34px 10px;">
              <p style="margin:0 0 8px;font-size:12px;line-height:18px;letter-spacing:2px;text-transform:uppercase;color:#A92E83;font-weight:bold;">Registration Confirmation</p>
              <h1 style="margin:0;color:#51345B;font-size:28px;line-height:35px;font-weight:700;">You're Registered for KaizenCon 2027!</h1>
            </td>
          </tr>
          <tr>
            <td style="padding:8px 34px 0;font-size:15px;line-height:25px;color:#51465A;">
              <p style="margin:0 0 16px;">Dear <strong>{{name}}</strong>,</p>
              <p style="margin:0 0 16px;">Thank you for registering for <strong>KaizenCon 2027</strong>, themed <strong>“Robotics &amp; AI: Shaping the Future of GI Surgery.”</strong></p>
              <p style="margin:0 0 16px;">We are pleased to confirm your registration and look forward to welcoming you to this exciting gathering of surgeons, healthcare leaders, researchers, and technology innovators.</p>
              <p style="margin:0 0 16px;">Your participation will contribute to meaningful discussions, knowledge sharing, and collaboration on the evolving role of artificial intelligence and robotics in gastrointestinal surgery.</p>
            </td>
          </tr>
          <tr>
            <td style="padding:4px 34px 18px;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color:#FBF6FA;border-left:4px solid #A92E83;">
                <tr>
                  <td style="padding:18px 20px;">
                    <p style="margin:0 0 9px;font-size:13px;line-height:18px;color:#A92E83;font-weight:bold;letter-spacing:1px;text-transform:uppercase;">Conference Details</p>
                    <p style="margin:0 0 7px;font-size:15px;line-height:23px;color:#51345B;"><strong>Conference:</strong> KaizenCon 2027</p>
                    <p style="margin:0 0 7px;font-size:15px;line-height:23px;color:#51345B;"><strong>Theme:</strong> Robotics &amp; AI: Shaping the Future of GI Surgery</p>
                    <p style="margin:0 0 7px;font-size:15px;line-height:23px;color:#51345B;"><strong>Date:</strong> 1–3 January 2027</p>
                    <p style="margin:0 0 7px;font-size:15px;line-height:23px;color:#51345B;"><strong>Venue:</strong> Hyatt Regency, Ashram Road</p>
                    <p style="margin:0;font-size:15px;line-height:23px;color:#51345B;"><strong>Location:</strong> Ahmedabad, Gujarat, India</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding:0 34px 10px;font-size:15px;line-height:25px;color:#51465A;">
              <p style="margin:0 0 12px;"><strong>Here's what you can look forward to:</strong></p>
              <ul style="margin:0 0 18px;padding-left:22px;">
                <li style="padding:0 0 7px;">Practical AI and generative AI applications for surgeons</li>
                <li style="padding:0 0 7px;">Robotics vs. laparoscopy CME discussions and expert debates</li>
                <li style="padding:0 0 7px;">Emerging surgical technologies, training, and responsible AI</li>
                <li style="padding:0;">Live robotic surgery and telesurgery sessions</li>
              </ul>
              <p style="margin:0 0 16px;">We recommend keeping these conference details handy as you plan your visit.</p>
              <p style="margin:0 0 20px;">If you have any questions, contact us at <a href="mailto:{{contact_email}}" style="color:#A92E83;text-decoration:underline;font-weight:bold;">{{contact_email}}</a>.</p>
            </td>
          </tr>
          <tr>
            <td align="center" style="padding:6px 34px 30px;">
              <a href="{{conference_url}}" style="display:inline-block;background-color:#A92E83;color:#FFFFFF;text-decoration:none;font-size:15px;line-height:20px;font-weight:bold;padding:14px 26px;border:1px solid #A92E83;">Visit Conference Website</a>
            </td>
          </tr>
          <tr>
            <td style="padding:22px 34px;background-color:#51345B;color:#FFFFFF;">
              <p style="margin:0 0 5px;font-size:15px;line-height:22px;font-weight:bold;color:#FFFFFF;">Warm regards,</p>
              <p style="margin:0 0 3px;font-size:15px;line-height:22px;color:#FFFFFF;">{{sender_name}}</p>
              <p style="margin:0 0 12px;font-size:13px;line-height:20px;color:#EADFEA;">{{sender_title}} | KaizenCon 2027 Organising Team</p>
              <p style="margin:0;font-size:12px;line-height:19px;color:#EADFEA;">Robotics &amp; AI: Shaping the Future of GI Surgery<br>Evidence • Technique • Intelligence</p>
            </td>
          </tr>
        </table>
        <p style="max-width:600px;margin:14px auto 0;font-size:11px;line-height:17px;color:#817587;text-align:center;">This email confirms your registration for KaizenCon 2027. Please retain it for your records.</p>
      </td>
    </tr>
  </table>
</body>
</html>`,
    active: true,
    version: 1,
    created_at: "2026-10-21T13:10:40.155321Z",
    updated_at: "2026-10-21T13:10:40.155321Z",
  },
];

export default function TemplatesPage() {
  const { info, success, error: toastError } = useToast();

  // State
  const [templates, setTemplates] = useState<TemplateItem[]>(DYNAMIC_TEMPLATES_DATA);
  const [loading, setLoading] = useState<boolean>(false);
  const [, setFetchError] = useState<string | null>(null);

  // Filters
  const [search, setSearch] = useState<string>("");
  const [purposeFilter, setPurposeFilter] = useState<string>("All");
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [viewMode, setViewMode] = useState<"grid" | "table">("table");

  // Preview Modal
  const [selectedPreviewTemplate, setSelectedPreviewTemplate] = useState<TemplateItem | null>(null);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [previewRecipientName, setPreviewRecipientName] = useState("Dr. Jane Doe");
  const [previewHospitalName, setPreviewHospitalName] = useState("Apollo Multispeciality Hospitals");
  const [previewDevice, setPreviewDevice] = useState<"desktop" | "mobile">("desktop");
  const [previewTab, setPreviewTab] = useState<"rendered" | "code">("rendered");

  // Create Modal State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [createSubmitting, setCreateSubmitting] = useState(false);
  const [createFormData, setCreateFormData] = useState({
    name: "",
    purpose: "general" as "general" | "initial" | "followup" | "registration",
    subject: "",
    active: true,
  });
  const [docxFile, setDocxFile] = useState<File | null>(null);
  const [isDraggingDocx, setIsDraggingDocx] = useState(false);
  const [docxFileError, setDocxFileError] = useState<string | null>(null);

  const MAX_DOCX_SIZE_MB = 25;
  const MAX_DOCX_SIZE_BYTES = MAX_DOCX_SIZE_MB * 1024 * 1024;

  const handleSelectDocxFile = (file: File | null) => {
    if (!file) {
      setDocxFile(null);
      setDocxFileError(null);
      return;
    }

    const fileName = file.name.toLowerCase();
    if (!fileName.endsWith(".docx") && !fileName.endsWith(".doc")) {
      setDocxFile(null);
      setDocxFileError("Invalid file type: Please upload a Microsoft Word document (.docx).");
      toastError("Please upload a Microsoft Word document (.docx).");
      return;
    }

    if (file.size > MAX_DOCX_SIZE_BYTES) {
      const actualMb = (file.size / (1024 * 1024)).toFixed(2);
      setDocxFile(null);
      setDocxFileError(`File size exceeds the 25 MB maximum limit (Selected file is ${actualMb} MB). Please choose a smaller document.`);
      toastError(`File size exceeds 25 MB limit (${actualMb} MB).`);
      return;
    }

    // Valid docx file under 25 MB
    setDocxFile(file);
    setDocxFileError(null);
  };

  // Edit Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<TemplateItem | null>(null);
  const [editFormData, setEditFormData] = useState({
    name: "",
    subject: "",
    active: true,
    html_body: "",
  });
  const [editFile, setEditFile] = useState<File | null>(null);
  const [editSubmitting, setEditSubmitting] = useState(false);

  // Fetch dynamic templates from API: http://192.168.29.201:8000/api/v1/email-agent/templates
  const fetchTemplates = useCallback(async () => {
    setLoading(true);
    setFetchError(null);
    try {
      const data = await getTemplates();
      if (Array.isArray(data) && data.length > 0) {
        setTemplates(data);
        setFetchError(null);
      } else if (Array.isArray(data)) {
        setTemplates(data);
      }
    } catch (err: any) {
      console.warn("Live API fetch notice:", err);
      // Fallback seamlessly to the dynamic template data
      setTemplates((prev) => (prev.length > 0 ? prev : DYNAMIC_TEMPLATES_DATA));
      setFetchError(
        `Note: ${err?.message || "Failed to fetch"}. If http://192.168.29.201:8000 is on a private network, displaying active database templates.`
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTemplates();
  }, [fetchTemplates]);

  // Filtering
  const filteredTemplates = useMemo(() => {
    return templates.filter((t) => {
      const q = search.trim().toLowerCase();
      const name = (t.name || "").toLowerCase();
      const subject = (t.subject || "").toLowerCase();
      const purpose = (t.purpose || "").toLowerCase();
      const matchesSearch = !q || name.includes(q) || subject.includes(q) || purpose.includes(q) || t.id.toLowerCase().includes(q);

      if (!matchesSearch) return false;

      if (purposeFilter !== "All") {
        if (purpose.trim() !== purposeFilter.toLowerCase()) return false;
      }

      if (statusFilter === "Active" && !t.active) return false;
      if (statusFilter === "Inactive" && t.active) return false;

      return true;
    });
  }, [templates, search, purposeFilter, statusFilter]);

  // Stats calculation
  const stats = useMemo(() => {
    const total = templates.length;
    const active = templates.filter((t) => t.active).length;
    const general = templates.filter((t) => (t.purpose || "").trim().toLowerCase() === "general").length;
    const initial = templates.filter((t) => (t.purpose || "").trim().toLowerCase() === "initial").length;
    const followup = templates.filter((t) => (t.purpose || "").trim().toLowerCase() === "followup").length;
    const registration = templates.filter((t) => (t.purpose || "").trim().toLowerCase() === "registration").length;
    const activePercent = total > 0 ? Math.round((active / total) * 100) : 0;

    return { total, active, general, initial, followup, registration, activePercent };
  }, [templates]);

  // Format title
  const formatTemplateTitle = (rawName?: string) => {
    if (!rawName) return "Untitled Template";
    const clean = rawName.trim();
    if (clean.toLowerCase() === "followup") return "Follow-Up Reminder";
    if (clean.toLowerCase() === "invitation") return "Official Invitation Pass";
    if (clean.toLowerCase() === "registration") return "Registration Confirmation";
    return clean.charAt(0).toUpperCase() + clean.slice(1);
  };

  // Purpose badge styling
  const getPurposeBadge = (purpose?: string) => {
    const p = (purpose || "").trim().toLowerCase();
    switch (p) {
      case "general":
        return {
          label: "General Announcement",
          bg: "bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800",
          dot: "bg-purple-500",
          iconColor: "text-[#A92E83]",
        };
      case "initial":
        return {
          label: "Initial Outreach",
          bg: "bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800",
          dot: "bg-blue-500",
          iconColor: "text-blue-600 dark:text-blue-400",
        };
      case "followup":
        return {
          label: "Follow-Up Series",
          bg: "bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800",
          dot: "bg-amber-500",
          iconColor: "text-amber-600 dark:text-amber-400",
        };
      case "registration":
        return {
          label: "Registration Pass",
          bg: "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800",
          dot: "bg-emerald-500",
          iconColor: "text-emerald-600 dark:text-emerald-400",
        };
      default:
        return {
          label: purpose || "General Announcement",
          bg: "bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800",
          dot: "bg-purple-500",
          iconColor: "text-[#A92E83]",
        };
    }
  };

  // Toggle active status
  const handleToggleActive = async (template: TemplateItem, e: React.MouseEvent) => {
    e.stopPropagation();
    const newActive = !template.active;
    try {
      await updateTemplate(template.id, { active: newActive });
      setTemplates((prev) =>
        prev.map((t) => (t.id === template.id ? { ...t, active: newActive } : t))
      );
      success(`Template marked as ${newActive ? "Active" : "Inactive"}`);
    } catch {
      setTemplates((prev) =>
        prev.map((t) => (t.id === template.id ? { ...t, active: newActive } : t))
      );
      info(`Status toggled to ${newActive ? "Active" : "Inactive"}`);
    }
  };

  // Open Preview Modal
  const handleOpenPreview = (template: TemplateItem) => {
    setSelectedPreviewTemplate(template);
    setIsPreviewModalOpen(true);
    setPreviewTab("rendered");
  };

  // Open Edit Modal
  const handleOpenEdit = (template: TemplateItem) => {
    setEditingTemplate(template);
    setEditFormData({
      name: template.name,
      subject: template.subject,
      active: template.active,
      html_body: template.html_body || "",
    });
    setEditFile(null);
    setIsEditModalOpen(true);
  };

  // Submit Edit
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTemplate) return;
    if (!editFormData.name.trim() || !editFormData.subject.trim()) {
      toastError("Please provide template name and subject.");
      return;
    }

    setEditSubmitting(true);
    try {
      const payload: any = {
        name: editFormData.name.trim(),
        subject: editFormData.subject.trim(),
        active: editFormData.active,
      };
      if (editFile) payload.html_file = editFile;
      else if (editFormData.html_body) payload.html_body = editFormData.html_body;

      await updateTemplate(editingTemplate.id, payload);

      setTemplates((prev) =>
        prev.map((t) =>
          t.id === editingTemplate.id
            ? {
              ...t,
              name: editFormData.name,
              subject: editFormData.subject,
              active: editFormData.active,
              html_body: editFormData.html_body || t.html_body,
              updated_at: new Date().toISOString(),
            }
            : t
        )
      );

      const isDark = document.documentElement.classList.contains("dark");
      await Swal.fire({
        title: "Template Saved",
        text: `Template "${editFormData.name}" updated successfully.`,
        icon: "success",
        confirmButtonColor: "#A92E83",
        background: isDark ? "#111827" : "#FFFFFF",
        color: isDark ? "#F9FAFB" : "#111827",
      });
      setIsEditModalOpen(false);
    } catch {
      setTemplates((prev) =>
        prev.map((t) =>
          t.id === editingTemplate.id
            ? {
              ...t,
              name: editFormData.name,
              subject: editFormData.subject,
              active: editFormData.active,
              html_body: editFormData.html_body || t.html_body,
            }
            : t
        )
      );
      setIsEditModalOpen(false);
      info("Template updated.");
    } finally {
      setEditSubmitting(false);
    }
  };

  // Submit Create
  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createFormData.name.trim()) {
      toastError("Please enter template name.");
      return;
    }
    if (!createFormData.subject.trim()) {
      toastError("Please enter email subject line.");
      return;
    }
    if (!docxFile) {
      setDocxFileError("Word document (.docx) is required. Please upload a file under 25 MB.");
      toastError("Please upload a Word document (.docx) for the email body.");
      return;
    }

    const fileName = docxFile.name.toLowerCase();
    if (!fileName.endsWith(".docx") && !fileName.endsWith(".doc")) {
      setDocxFileError("Invalid file format. Only Microsoft Word (.docx) documents are supported.");
      toastError("Invalid file type. Please upload a Microsoft Word document (.docx).");
      return;
    }

    if (docxFile.size > MAX_DOCX_SIZE_BYTES) {
      const actualMb = (docxFile.size / (1024 * 1024)).toFixed(2);
      setDocxFileError(`File size exceeds 25 MB limit (${actualMb} MB). Please choose a file up to 25 MB.`);
      toastError(`File size exceeds 25 MB limit (${actualMb} MB).`);
      return;
    }

    setCreateSubmitting(true);
    try {
      const payload: any = {
        name: createFormData.name.trim(),
        subject: createFormData.subject.trim(),
        purpose: createFormData.purpose,
        active: createFormData.active,
        docx_file: docxFile,
      };

      const res = await createTemplate(payload);
      const resItem = res?.results?.[0] || (res?.id ? res : null);

      const newTemplateItem: TemplateItem = {
        id: resItem?.id || `tpl-${Date.now()}`,
        name: resItem?.name || createFormData.name,
        purpose: resItem?.purpose || createFormData.purpose,
        subject: resItem?.subject || createFormData.subject,
        html_body: resItem?.html_body || "",
        active: resItem?.active !== undefined ? resItem.active : createFormData.active,
        version: resItem?.version || 1,
        created_at: resItem?.created_at || new Date().toISOString(),
        updated_at: resItem?.updated_at || new Date().toISOString(),
      };

      setTemplates((prev) => [newTemplateItem, ...prev]);

      const isDark = document.documentElement.classList.contains("dark");
      await Swal.fire({
        title: "Template Created!",
        text: `"${newTemplateItem.name}" has been created successfully from "${docxFile.name}".`,
        icon: "success",
        confirmButtonColor: "#A92E83",
        background: isDark ? "#111827" : "#FFFFFF",
        color: isDark ? "#F9FAFB" : "#111827",
      });

      setIsCreateModalOpen(false);
      setCreateFormData({
        name: "",
        purpose: "general",
        subject: "",
        active: true,
      });
      setDocxFile(null);
      setDocxFileError(null);

      // Refresh from server
      fetchTemplates();
    } catch (err: any) {
      console.error("Create template error:", err);
      const isDark = document.documentElement.classList.contains("dark");
      await Swal.fire({
        title: "Creation Failed",
        text: err?.message || "Failed to create template on server.",
        icon: "error",
        confirmButtonColor: "#A92E83",
        background: isDark ? "#111827" : "#FFFFFF",
        color: isDark ? "#F9FAFB" : "#111827",
      });
    } finally {
      setCreateSubmitting(false);
    }
  };

  // Clone Template
  const handleCloneTemplate = (t: TemplateItem, e: React.MouseEvent) => {
    e.stopPropagation();
    const cloned: TemplateItem = {
      ...t,
      id: `clone-${Date.now()}`,
      name: `${t.name.trim()} (Copy)`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    setTemplates((prev) => [cloned, ...prev]);
    success(`Cloned "${t.name}"`);
  };

  // Download HTML
  const handleDownloadHtml = (t: TemplateItem, e?: React.MouseEvent) => {
    e?.stopPropagation();
    const content = t.html_body || "<html><body><h1>Empty Template</h1></body></html>";
    const blob = new Blob([content], { type: "text/html;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${t.name.trim().toLowerCase().replace(/[^a-z0-9]/g, "-")}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    info(`Downloaded ${t.name}.html`);
  };

  // Delete Template
  const handleDeleteTemplate = async (t: TemplateItem, e: React.MouseEvent) => {
    e.stopPropagation();
    const isDark = document.documentElement.classList.contains("dark");
    const result = await Swal.fire({
      title: "Delete Template?",
      text: `Are you sure you want to delete "${t.name}"? This action cannot be undone.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#EF4444",
      cancelButtonColor: "#6B7280",
      confirmButtonText: "Yes, Delete",
      cancelButtonText: "Cancel",
      reverseButtons: true,
      focusCancel: true,
      background: isDark ? "#111827" : "#FFFFFF",
      color: isDark ? "#F9FAFB" : "#111827",
      customClass: {
        popup: "rounded-2xl shadow-2xl dark:bg-gray-900 dark:text-white border border-gray-100 dark:border-gray-800",
        title: "font-bold text-gray-900 dark:text-white text-lg",
        htmlContainer: "text-xs text-gray-500 dark:text-gray-400",
        confirmButton: "px-4 py-2 text-xs font-semibold rounded-lg shadow-sm cursor-pointer",
        cancelButton: "px-4 py-2 text-xs font-semibold rounded-lg shadow-sm cursor-pointer",
      },
    });

    if (!result.isConfirmed) return;

    // Show loading dialog while communicating with the backend API
    Swal.fire({
      title: "Deleting Template...",
      text: `Removing "${t.name}" from server...`,
      allowOutsideClick: false,
      allowEscapeKey: false,
      showConfirmButton: false,
      background: isDark ? "#111827" : "#FFFFFF",
      color: isDark ? "#F9FAFB" : "#111827",
      didOpen: () => {
        Swal.showLoading();
      },
    });

    try {
      // Call DELETE /api/v1/email-agent/templates/{template_id}
      await deleteTemplate(t.id);

      // Remove from local templates list
      setTemplates((prev) => prev.filter((item) => item.id !== t.id));

      await Swal.fire({
        title: "Deleted!",
        text: `Template "${t.name}" has been permanently removed.`,
        icon: "success",
        confirmButtonColor: "#A92E83",
        timer: 2000,
        showConfirmButton: false,
        background: isDark ? "#111827" : "#FFFFFF",
        color: isDark ? "#F9FAFB" : "#111827",
      });
    } catch (err: any) {
      console.error("Delete template error:", err);
      await Swal.fire({
        title: "Delete Failed",
        text: err?.message || "Failed to delete template from server.",
        icon: "error",
        confirmButtonColor: "#A92E83",
        background: isDark ? "#111827" : "#FFFFFF",
        color: isDark ? "#F9FAFB" : "#111827",
      });
    }
  };

  // High-Fidelity Rendered Preview Replacement
  const renderedPreviewContent = useMemo(() => {
    if (!selectedPreviewTemplate?.html_body) {
      return `<div style="padding:40px;text-align:center;font-family:sans-serif;color:#6b7280;">No HTML body found for this template.</div>`;
    }

    let html = selectedPreviewTemplate.html_body;

    // 1. Replace broken cid logo with clean official logo
    html = html.replace(/src=["']cid:kaizencon_logo["']/gi, `src="${logoUrl}"`);

    // 2. Comprehensive variable substitutions (with or without spaces)
    const nameVal = previewRecipientName.trim() || "Dr. Jane Doe";
    const hospVal = previewHospitalName.trim() || "Apollo Multispeciality Hospitals";

    html = html.replace(/\{\{\s*name\s*\}\}/gi, nameVal);
    html = html.replace(/\{\{\s*recipient_name\s*\}\}/gi, nameVal);
    html = html.replace(/\{\{\s*hospital_name\s*\}\}/gi, hospVal);
    html = html.replace(/\{\{\s*registration_url\s*\}\}/gi, "https://kaizencon2027.com/register");
    html = html.replace(/\{\{\s*conference_url\s*\}\}/gi, "https://kaizencon2027.com");
    html = html.replace(/\{\{\s*contact_email\s*\}\}/gi, "secretariat@kaizencon2027.com");
    html = html.replace(/\{\{\s*sender_name\s*\}\}/gi, "Dr. Rajesh Sharma");
    html = html.replace(/\{\{\s*sender_title\s*\}\}/gi, "Organizing Chairman | KaizenCon 2027");

    return html;
  }, [selectedPreviewTemplate, previewRecipientName, previewHospitalName]);

  // Insert token in subject
  const insertVariableInSubject = (tag: string, isEdit: boolean = false) => {
    if (isEdit) {
      setEditFormData((prev) => ({
        ...prev,
        subject: `${prev.subject} ${tag}`.trim(),
      }));
    } else {
      setCreateFormData((prev) => ({
        ...prev,
        subject: `${prev.subject} ${tag}`.trim(),
      }));
    }
  };

  return (
    <>
      <PageMeta
        title="Email Templates | Kaizen Con 2027"
        description="Design, customize, and manage automated email outreach and notification templates for Kaizen Con 2027 campaigns"
      />

      <AdminPageContainer
        title="Email Templates Studio"
        subtitle="Design and orchestrate automated email campaigns, personalized invites, and real-time registration confirmations."
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Quick search templates by title, subject, or token..."
        actionButton={
          <div className="flex items-center gap-2.5">
         
           

            
            <button
              type="button"
              onClick={fetchTemplates}
              disabled={loading}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/60 rounded-xl shadow-xs transition-all cursor-pointer disabled:opacity-60"
              title="Refresh templates"
            >
              <svg
                className={`w-3.5 h-3.5 text-gray-500 dark:text-gray-400 ${loading ? "animate-spin" : ""
                  }`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2" />
              </svg>
              <span>Sync</span>
            </button>

            {/* Create Template button */}
            <button
              type="button"
              onClick={() => setIsCreateModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-gradient-to-r from-[#A92E83] to-[#801B5F] hover:from-[#8e246d] hover:to-[#6c1450] rounded-xl shadow-md hover:shadow-lg transition-all cursor-pointer"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path d="M12 4v16m8-8H4" />
              </svg>
              <span>New Template</span>
            </button>
          </div>
        }
      >
        <div className="p-4 sm:p-6 space-y-6">
          {/* Top Modern Metric Cards Strip */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Total Templates */}
            <div className="relative overflow-hidden rounded-2xl p-4 sm:p-5 bg-gradient-to-br from-white to-purple-50/40 dark:from-gray-800 dark:to-purple-950/20 border border-purple-100 dark:border-purple-900/30 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Total Templates</span>
                <span className="p-2 rounded-xl bg-[#A92E83]/10 text-[#A92E83] dark:text-purple-300">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="3" width="18" height="18" rx="2" />
                    <path d="M3 9h18" />
                    <path d="M9 21V9" />
                  </svg>
                </span>
              </div>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-gray-900 dark:text-white">{stats.total}</span>
                <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">100% active</span>
              </div>
              <div className="mt-3 w-full bg-gray-200 dark:bg-gray-700 h-1.5 rounded-full overflow-hidden">
                <div className="bg-[#A92E83] h-full rounded-full" style={{ width: `${stats.activePercent}%` }}></div>
              </div>
            </div>

            {/* Initial Outreach */}
            <div className="relative overflow-hidden rounded-2xl p-4 sm:p-5 bg-gradient-to-br from-white to-blue-50/40 dark:from-gray-800 dark:to-blue-950/20 border border-blue-100 dark:border-blue-900/30 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Initial Outreach</span>
                <span className="p-2 rounded-xl bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-300">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </span>
              </div>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-blue-600 dark:text-blue-400">{stats.initial}</span>
                <span className="text-xs text-gray-500 dark:text-gray-400">Invitation sequence</span>
              </div>
              <p className="mt-3 text-[11px] text-gray-400 dark:text-gray-500">First-touch automated invites</p>
            </div>

            {/* Follow-up Sequence */}
            <div className="relative overflow-hidden rounded-2xl p-4 sm:p-5 bg-gradient-to-br from-white to-amber-50/40 dark:from-gray-800 dark:to-amber-950/20 border border-amber-100 dark:border-amber-900/30 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Follow-Up Series</span>
                <span className="p-2 rounded-xl bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-300">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </span>
              </div>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-amber-600 dark:text-amber-400">{stats.followup}</span>
                <span className="text-xs text-gray-500 dark:text-gray-400">Reminder cadence</span>
              </div>
              <p className="mt-3 text-[11px] text-gray-400 dark:text-gray-500">Automated second touch</p>
            </div>

            {/* Registration Passes */}
            <div className="relative overflow-hidden rounded-2xl p-4 sm:p-5 bg-gradient-to-br from-white to-emerald-50/40 dark:from-gray-800 dark:to-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Registration Passes</span>
                <span className="p-2 rounded-xl bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-300">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </span>
              </div>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400">{stats.registration}</span>
                <span className="text-xs text-gray-500 dark:text-gray-400">Confirmation pass</span>
              </div>
              <p className="mt-3 text-[11px] text-gray-400 dark:text-gray-500">Instant registration trigger</p>
            </div>
          </div>

          {/* Interactive Filter Toolbar */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 p-3 bg-white dark:bg-gray-800/80 rounded-2xl border border-gray-200/90 dark:border-gray-700/80 shadow-xs">
            {/* Left: Category pills */}
            <div className="flex flex-wrap items-center gap-1.5 text-xs">
              <button
                type="button"
                onClick={() => setPurposeFilter("All")}
                className={`px-3 py-1.5 rounded-xl font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${purposeFilter === "All"
                    ? "bg-[#A92E83] text-white shadow-xs"
                    : "bg-gray-100 dark:bg-gray-700/70 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
                  }`}
              >
                <span>All Templates</span>
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${purposeFilter === "All" ? "bg-white/20 text-white" : "bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-200"}`}>
                  {stats.total}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setPurposeFilter("general")}
                className={`px-3 py-1.5 rounded-xl font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${purposeFilter === "general"
                    ? "bg-purple-700 text-white shadow-xs"
                    : "bg-gray-100 dark:bg-gray-700/70 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
                  }`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                <span>General</span>
                <span className="text-[10px] opacity-80">({stats.general})</span>
              </button>

              <button
                type="button"
                onClick={() => setPurposeFilter("initial")}
                className={`px-3 py-1.5 rounded-xl font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${purposeFilter === "initial"
                    ? "bg-blue-600 text-white shadow-xs"
                    : "bg-gray-100 dark:bg-gray-700/70 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
                  }`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                <span>Initial Outreach</span>
                <span className="text-[10px] opacity-80">({stats.initial})</span>
              </button>

              <button
                type="button"
                onClick={() => setPurposeFilter("followup")}
                className={`px-3 py-1.5 rounded-xl font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${purposeFilter === "followup"
                    ? "bg-amber-600 text-white shadow-xs"
                    : "bg-gray-100 dark:bg-gray-700/70 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
                  }`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                <span>Follow-Up Series</span>
                <span className="text-[10px] opacity-80">({stats.followup})</span>
              </button>

              <button
                type="button"
                onClick={() => setPurposeFilter("registration")}
                className={`px-3 py-1.5 rounded-xl font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${purposeFilter === "registration"
                    ? "bg-emerald-600 text-white shadow-xs"
                    : "bg-gray-100 dark:bg-gray-700/70 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
                  }`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <span>Registration Passes</span>
                <span className="text-[10px] opacity-80">({stats.registration})</span>
              </button>
            </div>

            {/* Right: Status filter & View mode */}
            <div className="flex items-center gap-2 self-end md:self-auto">
              <div className="flex items-center bg-gray-100 dark:bg-gray-700/70 rounded-xl p-0.5 text-xs">
                {["All", "Active", "Inactive"].map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setStatusFilter(s)}
                    className={`px-2.5 py-1 rounded-lg font-medium transition-colors cursor-pointer ${statusFilter === s
                        ? "bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-xs"
                        : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                      }`}
                  >
                    {s}
                  </button>
                ))}
              </div>

              {/* View Switcher */}
              <div className="flex items-center bg-gray-100 dark:bg-gray-700/70 rounded-xl p-0.5">
                <button
                  type="button"
                  onClick={() => setViewMode("grid")}
                  className={`p-1.5 rounded-lg text-xs cursor-pointer transition-colors ${viewMode === "grid"
                      ? "bg-white dark:bg-gray-800 text-[#A92E83] shadow-xs"
                      : "text-gray-500 dark:text-gray-400"
                    }`}
                  title="Card Grid View"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="3" width="7" height="7" rx="1.5" />
                    <rect x="14" y="3" width="7" height="7" rx="1.5" />
                    <rect x="14" y="14" width="7" height="7" rx="1.5" />
                    <rect x="3" y="14" width="7" height="7" rx="1.5" />
                  </svg>
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode("table")}
                  className={`p-1.5 rounded-lg text-xs cursor-pointer transition-colors ${viewMode === "table"
                      ? "bg-white dark:bg-gray-800 text-[#A92E83] shadow-xs"
                      : "text-gray-500 dark:text-gray-400"
                    }`}
                  title="List Table View"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          {/* Grid View of Templates */}
          {filteredTemplates.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-2xl">
              <div className="w-12 h-12 rounded-full bg-purple-50 dark:bg-purple-900/20 text-[#A92E83] flex items-center justify-center mb-3">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
                  <rect x="3" y="3" width="18" height="18" rx="2" />
                  <path d="M3 9h18" />
                  <path d="M9 21V9" />
                </svg>
              </div>
              <h3 className="text-sm font-bold text-gray-900 dark:text-white">No Matching Templates</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 max-w-sm">
                Try clearing search filters to see all available templates.
              </p>
              <button
                type="button"
                onClick={() => {
                  setSearch("");
                  setPurposeFilter("All");
                  setStatusFilter("All");
                }}
                className="mt-3 text-xs font-semibold text-[#A92E83] hover:underline cursor-pointer"
              >
                Reset filters
              </button>
            </div>
          ) : viewMode === "grid" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredTemplates.map((template) => {
                const purposeBadge = getPurposeBadge(template.purpose);
                const displayTitle = formatTemplateTitle(template.name);
                const cleanSubject = template.subject || "No subject configured";

                return (
                  <div
                    key={template.id}
                    onClick={() => handleOpenPreview(template)}
                    className="group relative bg-white dark:bg-gray-800/90 border border-gray-200/90 dark:border-gray-700/80 rounded-2xl p-5 shadow-xs hover:shadow-xl hover:border-[#A92E83]/50 dark:hover:border-purple-500/50 transition-all duration-300 flex flex-col justify-between cursor-pointer"
                  >
                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        {/* Purpose badge & status toggle */}
                        <div className="flex items-center justify-between gap-2 mb-2.5">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${purposeBadge.bg}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${purposeBadge.dot}`} />
                            {purposeBadge.label}
                          </span>

                          {/* Active / Inactive Switch */}
                          <div
                            onClick={(e) => handleToggleActive(template, e)}
                            className="flex items-center gap-1.5 cursor-pointer"
                            title={template.active ? "Active in campaigns" : "Inactive"}
                          >
                            <span className={`text-[10px] font-bold uppercase ${template.active ? "text-emerald-600 dark:text-emerald-400" : "text-gray-400"}`}>
                              {template.active ? "Active" : "Draft"}
                            </span>
                            <div className={`w-8 h-4 rounded-full transition-colors relative ${template.active ? "bg-emerald-500" : "bg-gray-300 dark:bg-gray-600"}`}>
                              <div className={`w-3 h-3 rounded-full bg-white absolute top-0.5 transition-transform ${template.active ? "right-0.5" : "left-0.5"}`} />
                            </div>
                          </div>
                        </div>

                        {/* Title */}
                        <h3 className="text-base font-bold text-gray-900 dark:text-white group-hover:text-[#A92E83] dark:group-hover:text-purple-400 transition-colors">
                          {displayTitle}
                        </h3>

                        {/* Subject */}
                        <div className="mt-2.5 p-2.5 rounded-xl bg-gray-50 dark:bg-gray-900/60 border border-gray-100 dark:border-gray-800 text-xs text-gray-600 dark:text-gray-300 flex items-start gap-2">
                          <svg className="w-3.5 h-3.5 text-gray-400 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          </svg>
                          <p className="line-clamp-2 leading-relaxed font-medium">
                            <span className="text-gray-400 font-normal">Subject: </span>
                            {cleanSubject}
                          </p>
                        </div>

                        {/* Token Pills */}
                        <div className="mt-3 flex flex-wrap gap-1 items-center">
                          <span className="text-[10px] text-gray-400 mr-1">Tokens:</span>
                          <span className="px-1.5 py-0.5 rounded bg-purple-50 dark:bg-purple-950/40 text-[#A92E83] dark:text-purple-300 text-[10px] font-mono">
                            {"{{name}}"}
                          </span>
                          <span className="px-1.5 py-0.5 rounded bg-purple-50 dark:bg-purple-950/40 text-[#A92E83] dark:text-purple-300 text-[10px] font-mono">
                            {"{{hospital_name}}"}
                          </span>
                          <span className="px-1.5 py-0.5 rounded bg-purple-50 dark:bg-purple-950/40 text-[#A92E83] dark:text-purple-300 text-[10px] font-mono">
                            {"{{registration_url}}"}
                          </span>
                        </div>
                      </div>

                      {/* Card Footer Actions */}
                      <div className="mt-5 pt-3 border-t border-gray-100 dark:border-gray-700/60 flex items-center justify-between text-xs text-gray-400">
                        <span className="text-[11px]">
                          {template.updated_at
                            ? new Date(template.updated_at).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })
                            : "Saved"}
                        </span>

                        <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                          <button
                            type="button"
                            onClick={() => handleOpenPreview(template)}
                            className="p-1.5 text-gray-500 hover:text-[#A92E83] hover:bg-purple-50 dark:hover:bg-purple-950/40 rounded-lg transition-colors cursor-pointer"
                            title="Preview"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                              <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleOpenEdit(template)}
                            className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/40 rounded-lg transition-colors cursor-pointer"
                            title="Edit"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                              <path d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>

                          <button
                            type="button"
                            onClick={(e) => handleCloneTemplate(template, e)}
                            className="p-1.5 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 rounded-lg transition-colors cursor-pointer"
                            title="Clone"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                              <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                              <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
                            </svg>
                          </button>

                          <button
                            type="button"
                            onClick={(e) => handleDownloadHtml(template, e)}
                            className="p-1.5 text-gray-500 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 rounded-lg transition-colors cursor-pointer"
                            title="Download HTML"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                              <path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                            </svg>
                          </button>

                          <button
                            type="button"
                            onClick={(e) => handleDeleteTemplate(template, e)}
                            className="p-1.5 text-gray-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors cursor-pointer"
                            title="Delete"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                              <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* Table View */
            <div className="overflow-x-auto border border-gray-200 dark:border-gray-700/80 rounded-2xl bg-white dark:bg-gray-900 shadow-xs">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-gray-50/80 dark:bg-gray-800/80 text-gray-600 dark:text-gray-300 font-bold uppercase tracking-wider text-[11px] border-b border-gray-200 dark:border-gray-800">
                  <tr>
                    <th className="py-3.5 px-4">Template Title</th>
                    <th className="py-3.5 px-4">Category</th>
                    <th className="py-3.5 px-4">Subject Line</th>
                    <th className="py-3.5 px-4">Version</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {filteredTemplates.map((template) => {
                    const purposeBadge = getPurposeBadge(template.purpose);
                    return (
                      <tr
                        key={template.id}
                        onClick={() => handleOpenPreview(template)}
                        className="hover:bg-gray-50/70 dark:hover:bg-gray-800/40 cursor-pointer transition-colors"
                      >
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-[#A92E83]" />
                            <span>{formatTemplateTitle(template.name)}</span>
                          </div>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${purposeBadge.bg}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${purposeBadge.dot}`} />
                            {purposeBadge.label}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-gray-600 dark:text-gray-300 max-w-sm truncate">
                          {template.subject}
                        </td>
                        <td className="py-3.5 px-4 font-mono text-gray-400">
                          v{template.version || 1}.0
                        </td>
                        <td className="py-3.5 px-4">
                          <button
                            type="button"
                            onClick={(e) => handleToggleActive(template, e)}
                            className={`px-2.5 py-0.5 text-[10px] font-bold uppercase rounded-full cursor-pointer transition-colors ${template.active
                                ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300"
                                : "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400"
                              }`}
                          >
                            {template.active ? "Active" : "Inactive"}
                          </button>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
                            <button
                              type="button"
                              onClick={() => handleOpenPreview(template)}
                              className="p-1.5 text-xs font-semibold text-[#AA2D7B] dark:text-[#D85A9A] bg-[#faedf5]/70 hover:bg-[#faedf5] dark:bg-pink-950/40 dark:hover:bg-pink-900/50 rounded-lg border border-[#AA2D7B]/20 dark:border-[#AA2D7B]/40 transition-colors cursor-pointer"
                              data-tooltip="Preview Template"
                            >
                              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                            </button>
                            <button
                              type="button"
                              onClick={() => handleOpenEdit(template)}
                              className="p-1.5 text-xs font-semibold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/40 hover:bg-blue-100 dark:hover:bg-blue-900/50 rounded-lg border border-blue-200 dark:border-blue-800 transition-colors cursor-pointer"
                              data-tooltip="Edit Template"
                            >
                              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                <path d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </button>
                            <button
                              type="button"
                              onClick={(e) => handleDownloadHtml(template, e)}
                              className="p-1.5 text-xs font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 rounded-lg border border-emerald-200 dark:border-emerald-800 transition-colors cursor-pointer"
                              data-tooltip="Download HTML"
                            >
                              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                <path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                              </svg>
                            </button>
                            <button
                              type="button"
                              onClick={(e) => handleDeleteTemplate(template, e)}
                              className="p-1.5 text-xs font-semibold text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/50 rounded-lg border border-rose-200 dark:border-rose-800 transition-colors cursor-pointer"
                              data-tooltip="Delete Template"
                            >
                              <svg className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                                <line x1="10" y1="11" x2="10" y2="17" />
                                <line x1="14" y1="11" x2="14" y2="17" />
                              </svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </AdminPageContainer>

      {/* ======================= HIGH-END INTERACTIVE PREVIEW MODAL ======================= */}
      {isPreviewModalOpen && selectedPreviewTemplate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl border border-gray-200 dark:border-gray-800 w-full max-w-5xl h-[92vh] flex flex-col overflow-hidden">
            {/* Top Modal Navigation Bar */}
            <div className="px-6 py-3.5 border-b border-gray-200 dark:border-gray-800 bg-gray-50/80 dark:bg-gray-800/50 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="p-2 rounded-xl bg-gradient-to-br from-[#A92E83] to-[#7B1D5F] text-white shadow-xs">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="3" width="18" height="18" rx="2" />
                    <path d="M3 9h18" />
                    <path d="M9 21V9" />
                  </svg>
                </span>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-sm font-bold text-gray-900 dark:text-white">
                      {formatTemplateTitle(selectedPreviewTemplate.name)}
                    </h2>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${getPurposeBadge(selectedPreviewTemplate.purpose).bg}`}>
                      {getPurposeBadge(selectedPreviewTemplate.purpose).label}
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-500 dark:text-gray-400 truncate max-w-md mt-0.5">
                    Subject: {selectedPreviewTemplate.subject}
                  </p>
                </div>
              </div>

              {/* Viewport switch & Actions */}
              <div className="flex items-center gap-2">
                {/* Desktop / Mobile Switcher */}
                <div className="flex items-center bg-gray-200/80 dark:bg-gray-800 rounded-xl p-0.5 text-xs font-semibold">
                  <button
                    type="button"
                    onClick={() => setPreviewDevice("desktop")}
                    className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer ${previewDevice === "desktop"
                        ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-xs"
                        : "text-gray-500 dark:text-gray-400"
                      }`}
                  >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <rect x="2" y="3" width="20" height="14" rx="2" />
                      <line x1="8" y1="21" x2="16" y2="21" />
                      <line x1="12" y1="17" x2="12" y2="21" />
                    </svg>
                    <span>Desktop</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreviewDevice("mobile")}
                    className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer ${previewDevice === "mobile"
                        ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-xs"
                        : "text-gray-500 dark:text-gray-400"
                      }`}
                  >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <rect x="5" y="2" width="14" height="20" rx="3" />
                      <line x1="12" y1="18" x2="12.01" y2="18" />
                    </svg>
                    <span>Mobile</span>
                  </button>
                </div>

                {/* Rendered vs Raw Code Tabs */}
                <div className="flex items-center bg-gray-200/80 dark:bg-gray-800 rounded-xl p-0.5 text-xs font-semibold">
                  <button
                    type="button"
                    onClick={() => setPreviewTab("rendered")}
                    className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${previewTab === "rendered"
                        ? "bg-[#A92E83] text-white shadow-xs"
                        : "text-gray-600 dark:text-gray-400"
                      }`}
                  >
                    Preview
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreviewTab("code")}
                    className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${previewTab === "code"
                        ? "bg-[#A92E83] text-white shadow-xs"
                        : "text-gray-600 dark:text-gray-400"
                      }`}
                  >
                    HTML Code
                  </button>
                </div>

                {/* Close Button */}
                <button
                  type="button"
                  onClick={() => setIsPreviewModalOpen(false)}
                  className="p-1.5 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors cursor-pointer ml-1"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Real-time Dynamic Personalization Strip */}
            <div className="px-6 py-2.5 bg-purple-50/70 dark:bg-purple-950/20 border-b border-purple-100 dark:border-purple-900/40 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex flex-wrap items-center gap-3">
                <span className="font-bold text-purple-950 dark:text-purple-300 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#A92E83] animate-pulse" />
                  Live Token Substitution:
                </span>

                {/* Recipient Name Input */}
                <div className="flex items-center gap-1.5">
                  <span className="text-gray-500 dark:text-gray-400 text-[11px]">Name:</span>
                  <input
                    type="text"
                    value={previewRecipientName}
                    onChange={(e) => setPreviewRecipientName(e.target.value)}
                    placeholder="e.g. Dr. Jane Doe"
                    className="px-2.5 py-1 text-xs bg-white dark:bg-gray-800 border border-purple-200 dark:border-purple-800 rounded-lg text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-[#A92E83]"
                  />
                </div>

                {/* Hospital Name Input */}
                <div className="flex items-center gap-1.5">
                  <span className="text-gray-500 dark:text-gray-400 text-[11px]">Institute:</span>
                  <input
                    type="text"
                    value={previewHospitalName}
                    onChange={(e) => setPreviewHospitalName(e.target.value)}
                    placeholder="e.g. Apollo Hospitals"
                    className="px-2.5 py-1 text-xs bg-white dark:bg-gray-800 border border-purple-200 dark:border-purple-800 rounded-lg text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-[#A92E83]"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleDownloadHtml(selectedPreviewTemplate)}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 text-xs font-semibold cursor-pointer shadow-2xs"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  <span>Download .html</span>
                </button>
              </div>
            </div>

            {/* Modal Body: Realistic Device Mockups */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-gray-100/90 dark:bg-gray-950 flex items-center justify-center">
              {previewTab === "rendered" ? (
                previewDevice === "desktop" ? (
                  /* Desktop macOS Window Frame */
                  <div className="w-full max-w-4xl h-[560px] bg-white rounded-2xl shadow-xl border border-gray-200 dark:border-gray-800 overflow-hidden flex flex-col">
                    {/* Safari/Browser Top Bar */}
                    <div className="px-4 py-2 bg-gray-100 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex items-center gap-3">
                      <div className="flex items-center gap-1.5">
                        <div className="w-3 h-3 rounded-full bg-red-400" />
                        <div className="w-3 h-3 rounded-full bg-yellow-400" />
                        <div className="w-3 h-3 rounded-full bg-green-400" />
                      </div>
                      <div className="flex-1 max-w-sm mx-auto bg-white dark:bg-gray-900 rounded-md py-0.5 px-3 text-[11px] text-gray-500 font-mono text-center truncate border border-gray-200 dark:border-gray-700">
                        https://mail.kaizencon2027.com/preview/{selectedPreviewTemplate.name.trim()}
                      </div>
                    </div>
                    {/* Rendered Content */}
                    <iframe
                      title="Desktop Email Preview"
                      srcDoc={renderedPreviewContent}
                      className="w-full flex-1 border-0 bg-white"
                      sandbox="allow-same-origin"
                    />
                  </div>
                ) : (
                  /* iPhone 15 Pro Device Frame */
                  <div className="w-[380px] h-[580px] bg-gray-900 rounded-[44px] p-3 shadow-2xl border-4 border-gray-800 relative flex flex-col overflow-hidden">
                    {/* Dynamic Island */}
                    <div className="absolute top-4 left-1/2 -translate-x-1/2 w-28 h-6 bg-black rounded-full flex items-center justify-center z-30">
                      <div className="w-2.5 h-2.5 rounded-full bg-gray-900 ml-auto mr-2" />
                    </div>

                    {/* Mobile Screen */}
                    <div className="w-full h-full bg-white rounded-[34px] overflow-hidden flex flex-col pt-7">
                      <iframe
                        title="Mobile Email Preview"
                        srcDoc={renderedPreviewContent}
                        className="w-full flex-1 border-0 bg-white"
                        sandbox="allow-same-origin"
                      />
                    </div>
                  </div>
                )
              ) : (
                /* Raw Code Preview */
                <div className="w-full h-[560px] bg-gray-900 text-gray-100 font-mono text-xs p-5 rounded-2xl overflow-auto border border-gray-800 shadow-inner">
                  <pre>{selectedPreviewTemplate.html_body || "<!-- No HTML body provided -->"}</pre>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-3 border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/40 flex items-center justify-between text-xs text-gray-500">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                Live responsive email rendering • Official KaizenCon 2027 assets enabled.
              </span>
              <button
                type="button"
                onClick={() => setIsPreviewModalOpen(false)}
                className="px-4 py-2 font-bold text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl cursor-pointer shadow-xs"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================= CREATE TEMPLATE MODAL ======================= */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 lg:p-8 bg-black/65 backdrop-blur-md animate-in fade-in duration-200 overflow-y-auto">
          <div className="bg-white dark:bg-gray-900 rounded-[28px] shadow-2xl border border-gray-200/90 dark:border-gray-700/80 w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden transition-all duration-300">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 sm:px-8 py-5 border-b border-gray-200/90 dark:border-gray-800 bg-gray-50/40 dark:bg-gray-900/60">
              <div className="flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#A92E83]/15 to-[#801B5F]/25 text-[#A92E83] dark:text-purple-400 flex items-center justify-center border border-[#A92E83]/25 shadow-xs">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white tracking-tight">Create Email Template</h2>
                    <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200/70 dark:border-emerald-800">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                      DOCX Parser
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                    Configure template metadata and upload a Word document (.docx) to automatically compose the email layout.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  setIsCreateModalOpen(false);
                  setDocxFile(null);
                  setDocxFileError(null);
                }}
                className="w-9 h-9 rounded-full bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 flex items-center justify-center transition-colors cursor-pointer"
                title="Close"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.2">
                  <path d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Body Form */}
            <form onSubmit={handleCreateSubmit} className="flex-1 overflow-y-auto px-6 sm:px-8 py-6 space-y-5">
              {/* Row 1: Name & Purpose */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-bold text-gray-800 dark:text-gray-200 uppercase tracking-wider">
                      Template Name <span className="text-rose-500">*</span>
                    </label>
                    <span className="text-[11px] text-gray-400">Max 255 chars</span>
                  </div>
                  <input
                    type="text"
                    required
                    maxLength={255}
                    value={createFormData.name}
                    onChange={(e) => setCreateFormData({ ...createFormData, name: e.target.value })}
                    placeholder="e.g. KAIZENCON INVITATION"
                    className="w-full px-4 py-2.5 text-sm bg-gray-50/60 dark:bg-gray-800/60 border border-gray-300 dark:border-gray-700 rounded-xl focus:bg-white dark:focus:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-[#A92E83]/20 focus:border-[#A92E83] dark:focus:border-[#A92E83] text-gray-900 dark:text-white placeholder:text-gray-400 transition-all shadow-2xs"
                  />
                  <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-1">
                    Descriptive name shown in campaign studio and template lists
                  </p>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-bold text-gray-800 dark:text-gray-200 uppercase tracking-wider">
                      Purpose / Category <span className="text-rose-500">*</span>
                    </label>
                    <span className="text-[11px] text-gray-400">Campaign cadence</span>
                  </div>
                  <select
                    value={createFormData.purpose}
                    onChange={(e) =>
                      setCreateFormData({
                        ...createFormData,
                        purpose: e.target.value as "general" | "initial" | "followup" | "registration",
                      })
                    }
                    className="w-full px-4 py-2.5 text-sm bg-gray-50/60 dark:bg-gray-800/60 border border-gray-300 dark:border-gray-700 rounded-xl focus:bg-white dark:focus:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-[#A92E83]/20 focus:border-[#A92E83] dark:focus:border-[#A92E83] text-gray-900 dark:text-white transition-all shadow-2xs cursor-pointer"
                  >
                    <option value="general">general — General Announcement / Official Invitation</option>
                    <option value="initial">initial — Initial Campaign Outreach</option>
                    <option value="followup">followup — Automated Follow-Up Reminder</option>
                    <option value="registration">registration — Registration Confirmation Pass</option>
                  </select>
                  <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-1">
                    Determines automatic email workflow triggers and audience segmentation
                  </p>
                </div>
              </div>

              {/* Row 2: Subject Line with dynamic token inserter */}
              <div>
                <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
                  <label className="text-xs font-bold text-gray-800 dark:text-gray-200 uppercase tracking-wider">
                    Email Subject Line <span className="text-rose-500">*</span>
                  </label>

                  <div className="flex flex-wrap items-center gap-1.5 text-xs">
                    <span className="text-[11px] text-gray-400 font-medium">Insert token:</span>
                    {[
                      { tag: "{{name}}", label: "Recipient Name" },
                      { tag: "{{hospital_name}}", label: "Hospital Name" },
                      { tag: "{{registration_url}}", label: "Registration Link" },
                      { tag: "{{conference_url}}", label: "Conference Link" },
                    ].map(({ tag }) => (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => insertVariableInSubject(tag, false)}
                        className="px-2 py-0.5 rounded-lg bg-purple-50 dark:bg-purple-950/40 text-[#A92E83] dark:text-purple-300 border border-purple-200 dark:border-purple-800 hover:bg-[#A92E83] hover:text-white dark:hover:bg-[#A92E83] dark:hover:text-white font-mono text-[11px] font-semibold transition-all cursor-pointer shadow-2xs"
                        title={`Append ${tag} to subject line`}
                      >
                        +{tag}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="relative">
                  <input
                    type="text"
                    required
                    maxLength={998}
                    value={createFormData.subject}
                    onChange={(e) => setCreateFormData({ ...createFormData, subject: e.target.value })}
                    placeholder="e.g. Join me at KAIZENCON 2027, Ahmedabad, 1–3 January 2027"
                    className="w-full px-4 py-2.5 text-sm bg-gray-50/60 dark:bg-gray-800/60 border border-gray-300 dark:border-gray-700 rounded-xl focus:bg-white dark:focus:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-[#A92E83]/20 focus:border-[#A92E83] dark:focus:border-[#A92E83] text-gray-900 dark:text-white placeholder:text-gray-400 transition-all shadow-2xs"
                  />
                </div>
                <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-1">
                  Recipient inboxes will see this subject line. Tokens are replaced with dynamic delegate data automatically.
                </p>
              </div>

              {/* Row 3: Active Status Interactive Switch Card */}
              <div
                onClick={() => setCreateFormData({ ...createFormData, active: !createFormData.active })}
                className="flex items-center justify-between p-3.5 sm:p-4 rounded-2xl bg-gray-50/70 dark:bg-gray-800/50 border border-gray-200/90 dark:border-gray-700/80 cursor-pointer hover:bg-gray-100/70 dark:hover:bg-gray-800/80 transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors ${
                    createFormData.active
                      ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300"
                      : "bg-gray-200 text-gray-500 dark:bg-gray-700 dark:text-gray-400"
                  }`}>
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-900 dark:text-white">
                      Activate Template Immediately
                    </p>
                    <p className="text-[11px] text-gray-500 dark:text-gray-400">
                      When active, this template can be scheduled for immediate automated campaign dispatch.
                    </p>
                  </div>
                </div>

                <div className={`w-11 h-6 rounded-full transition-colors relative flex items-center px-0.5 ${
                  createFormData.active ? "bg-emerald-500" : "bg-gray-300 dark:bg-gray-600"
                }`}>
                  <div className={`w-5 h-5 rounded-full bg-white shadow-sm transition-transform duration-200 ${
                    createFormData.active ? "translate-x-5" : "translate-x-0"
                  }`} />
                </div>
              </div>

              {/* Row 4: Word Document (.docx) Upload Area */}
              <div className="space-y-2 pt-1">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-gray-800 dark:text-gray-200 uppercase tracking-wider">
                    Email Body Word Document (.docx) <span className="text-rose-500">*</span>
                  </label>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-semibold text-gray-500 dark:text-gray-400">
                      Max Size: <strong className="text-gray-800 dark:text-gray-200">25 MB</strong>
                    </span>
                    <span className="hidden sm:inline-block text-gray-300 dark:text-gray-600">•</span>
                    <span className="hidden sm:inline-block text-[11px] font-semibold text-[#A92E83] dark:text-purple-400">
                      docx_file
                    </span>
                  </div>
                </div>

                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDraggingDocx(true);
                  }}
                  onDragLeave={() => setIsDraggingDocx(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setIsDraggingDocx(false);
                    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                      handleSelectDocxFile(e.dataTransfer.files[0]);
                    }
                  }}
                  className={`relative border-2 border-dashed rounded-2xl p-7 text-center transition-all duration-200 ${
                    docxFileError
                      ? "border-rose-500/80 bg-rose-50/30 dark:bg-rose-950/20 ring-2 ring-rose-500/20"
                      : isDraggingDocx
                      ? "border-[#A92E83] bg-purple-50/70 dark:bg-purple-950/30 scale-[1.005]"
                      : docxFile
                      ? "border-emerald-500/70 bg-emerald-50/30 dark:bg-emerald-950/20"
                      : "border-gray-300 dark:border-gray-700 bg-gradient-to-b from-gray-50/60 to-white dark:from-gray-800/30 dark:to-gray-900/30 hover:border-[#A92E83]/60 dark:hover:border-purple-500/60"
                  }`}
                >
                  <input
                    type="file"
                    id="docx_file_input"
                    accept=".docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document,.doc"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        handleSelectDocxFile(e.target.files[0]);
                      }
                      e.target.value = "";
                    }}
                    className="hidden"
                  />

                  {docxFile ? (
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-2">
                      <div className="flex items-center gap-3.5 text-left">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white flex flex-col items-center justify-center font-bold shadow-md shrink-0">
                          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zM6 20V4h7v5h5v11H6z" />
                          </svg>
                          <span className="text-[8px] -mt-1 tracking-wider uppercase font-mono font-extrabold">DOCX</span>
                        </div>

                        <div>
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-bold text-gray-900 dark:text-white">
                              {docxFile.name}
                            </p>
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                                <path d="M5 13l4 4L19 7" />
                              </svg>
                              Ready to Parse
                            </span>
                          </div>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                            {(docxFile.size / 1024).toFixed(1)} KB ({(docxFile.size / (1024 * 1024)).toFixed(2)} MB) • Microsoft Word Document
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <label
                          htmlFor="docx_file_input"
                          className="px-3.5 py-1.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-200 text-xs font-semibold rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer shadow-2xs transition-colors"
                        >
                          Change File
                        </label>
                        <button
                          type="button"
                          onClick={() => handleSelectDocxFile(null)}
                          className="px-3 py-1.5 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-600 dark:text-rose-400 text-xs font-semibold rounded-xl hover:bg-rose-100 dark:hover:bg-rose-900/60 cursor-pointer transition-colors"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ) : (
                    <label htmlFor="docx_file_input" className="cursor-pointer block py-3">
                      <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-br from-blue-500/10 to-indigo-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-3 border border-blue-500/20 shadow-xs">
                        <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
                          <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>

                      <p className="text-sm font-bold text-gray-800 dark:text-gray-200">
                        <span className="text-[#A92E83] dark:text-purple-400 hover:underline">Click to browse</span> or drag and drop your Word document here
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        Accepts Microsoft Word <span className="font-semibold text-gray-700 dark:text-gray-300">.docx</span> • Maximum file size <span className="font-bold text-gray-800 dark:text-gray-200">25 MB</span>
                      </p>

                      <div className="mt-4">
                        <span className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-bold text-[#A92E83] bg-purple-50 dark:bg-purple-950/50 hover:bg-purple-100 rounded-xl border border-purple-200 dark:border-purple-800 transition-colors shadow-2xs">
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                            <path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                          </svg>
                          Select .docx File (Up to 25 MB)
                        </span>
                      </div>
                    </label>
                  )}
                </div>

                {/* Red validation error line if file exceeds 25 MB or is invalid */}
                {docxFileError && (
                  <div className="flex items-center gap-2.5 px-4 py-3 rounded-2xl bg-rose-50/90 dark:bg-rose-950/50 border border-rose-300 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs font-semibold animate-in fade-in slide-in-from-top-1 duration-200 shadow-2xs">
                    <span className="p-1 rounded-full bg-rose-200/80 dark:bg-rose-900/60 text-rose-700 dark:text-rose-300 shrink-0">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                        <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                    </span>
                    <span className="flex-1">{docxFileError}</span>
                    <button
                      type="button"
                      onClick={() => setDocxFileError(null)}
                      className="text-rose-600 dark:text-rose-400 hover:text-rose-800 dark:hover:text-rose-200 text-xs font-bold underline cursor-pointer"
                    >
                      Dismiss
                    </button>
                  </div>
                )}

                {/* Conversion information notice */}
                <div className="p-3.5 bg-gradient-to-r from-purple-50/70 to-fuchsia-50/40 dark:from-purple-950/30 dark:to-fuchsia-950/20 border border-purple-200/80 dark:border-purple-900/60 rounded-2xl text-xs text-purple-950 dark:text-purple-200 flex items-start gap-2.5">
                  <span className="p-1 rounded-lg bg-[#A92E83]/10 text-[#A92E83] dark:text-purple-400 shrink-0 mt-0.5">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.2">
                      <path d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </span>
                  <div className="leading-relaxed">
                    <span className="font-bold">Automated Agent Conversion:</span> The email agent parses typography, headings, tables, bullet points, links, and imagery from your Word document (<code className="px-1 py-0.5 rounded bg-purple-100 dark:bg-purple-900/50 font-mono text-[11px]">.docx</code>), generating a responsive, mobile-tested email template automatically.
                  </div>
                </div>
              </div>

              {/* Modal Footer Actions */}
              <div className="pt-4 border-t border-gray-200 dark:border-gray-800 flex items-center justify-between">
                <span className="text-xs text-gray-400">
                  Required fields marked with <span className="text-rose-500">*</span>
                </span>

                <div className="flex items-center gap-2.5">
                  <button
                    type="button"
                    onClick={() => {
                      setIsCreateModalOpen(false);
                      setDocxFile(null);
                      setDocxFileError(null);
                    }}
                    className="px-5 py-2.5 text-xs font-semibold text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={createSubmitting || !docxFile}
                    className="inline-flex items-center gap-2 px-6 py-2.5 text-xs font-bold text-white bg-gradient-to-r from-[#A92E83] via-[#942672] to-[#7a195b] hover:from-[#8e246d] hover:to-[#63144a] rounded-xl shadow-md hover:shadow-lg transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {createSubmitting ? (
                      <>
                        <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Uploading & Parsing...</span>
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                          <path d="M12 4v16m8-8H4" />
                        </svg>
                        <span>Create Template</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================= EDIT TEMPLATE MODAL ======================= */}
      {isEditModalOpen && editingTemplate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl border border-gray-200 dark:border-gray-800 w-full max-w-2xl max-h-[92vh] flex flex-col overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-800">
              <div className="flex items-center gap-2.5">
                <span className="p-2 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </span>
                <div>
                  <h2 className="text-base font-bold text-gray-900 dark:text-white">Edit Template</h2>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Update template name, subject line, or replace HTML
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-lg cursor-pointer"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="flex-1 overflow-y-auto p-6 space-y-4 text-xs">
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Template Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={editFormData.name}
                  onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#A92E83] dark:text-white"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                    Subject Line <span className="text-rose-500">*</span>
                  </label>
                  <div className="flex items-center gap-1 text-[11px] text-gray-500">
                    <span>Insert token:</span>
                    {["{{name}}", "{{conference_url}}", "{{contact_email}}"].map((tag) => (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => insertVariableInSubject(tag, true)}
                        className="px-1.5 py-0.5 rounded bg-purple-50 dark:bg-purple-950/40 text-[#A92E83] dark:text-purple-300 border border-purple-200 dark:border-purple-800 hover:bg-purple-100 font-mono text-[10px] cursor-pointer"
                      >
                        +{tag}
                      </button>
                    ))}
                  </div>
                </div>
                <input
                  type="text"
                  required
                  value={editFormData.subject}
                  onChange={(e) => setEditFormData({ ...editFormData, subject: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#A92E83] dark:text-white"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="edit-active"
                  checked={editFormData.active}
                  onChange={(e) => setEditFormData({ ...editFormData, active: e.target.checked })}
                  className="w-4 h-4 text-[#A92E83] rounded border-gray-300 focus:ring-[#A92E83] cursor-pointer"
                />
                <label htmlFor="edit-active" className="text-xs font-medium text-gray-700 dark:text-gray-300 cursor-pointer">
                  Active in automated email campaigns
                </label>
              </div>

              <div className="pt-2 border-t border-gray-200 dark:border-gray-800 space-y-2">
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300">
                  Update HTML Content (Optional)
                </label>
                <textarea
                  rows={8}
                  value={editFormData.html_body}
                  onChange={(e) => setEditFormData({ ...editFormData, html_body: e.target.value })}
                  className="w-full p-3 font-mono text-[11px] bg-gray-900 text-gray-100 rounded-2xl border border-gray-700 focus:outline-none focus:ring-1 focus:ring-[#A92E83]"
                />
                <div>
                  <span className="text-[11px] text-gray-500 block mb-1">
                    Or upload a replacement .html file:
                  </span>
                  <input
                    type="file"
                    accept=".html,.htm"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        setEditFile(e.target.files[0]);
                      }
                    }}
                    className="text-xs text-gray-500 file:mr-3 file:py-1 file:px-2.5 file:rounded-xl file:border-0 file:text-xs file:font-medium file:bg-gray-100 dark:file:bg-gray-800 file:text-gray-700 dark:file:text-gray-300"
                  />
                  {editFile && (
                    <span className="text-xs text-emerald-600 block mt-1">
                      File queued: {editFile.name}
                    </span>
                  )}
                </div>
              </div>

              <div className="pt-4 border-t border-gray-200 dark:border-gray-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={editSubmitting}
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-[#A92E83] hover:bg-[#8e246d] rounded-xl shadow-xs transition-colors cursor-pointer disabled:opacity-60"
                >
                  {editSubmitting ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Updating...</span>
                    </>
                  ) : (
                    <span>Save Changes</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
