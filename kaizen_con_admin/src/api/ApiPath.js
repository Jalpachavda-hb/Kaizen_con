import { clearAuthSession } from "../services/sessionManager";

// Base API Configuration
// export const BASE_URL = 'https://34g3qd2p-8000.inc1.devtunnels.ms';
// export const BASE_URL = 'http://192.168.29.201:8000';
export const BASE_URL = 'https://api.kaizencon.in';
export const API_BASE_URL = `${BASE_URL}/api`;

/**
 * Same-origin path that forwards to `${API_BASE_URL}` (proxy in vite.config.ts for dev,
 * rewrite in vercel.json for production). Set VITE_MODERATION_API_BASE to
 * `https://api.kaizencon.in/api` to call the API directly once the backend allows
 * CORS preflights on the moderation routes.
 */
export const MODERATION_API_BASE =
  (import.meta.env?.VITE_MODERATION_API_BASE || '/moderation-api').replace(/\/$/, '');
//
// Compatibility aliases
export const Baase_url = `${API_BASE_URL}/`;
export const Base_url = `${API_BASE_URL}/`;

// API Endpoints
export const API_ENDPOINTS = {
  ADMIN_LOGIN: `${API_BASE_URL}/admin_login`,
  SPEAKERS: `${API_BASE_URL}/speakers`,
  SCHEDULES: `${API_BASE_URL}/schedules`,
  DELEGATES: `${API_BASE_URL}/delegates`,
  SESSIONS: `${API_BASE_URL}/sessions`,
  EMAIL_AGENT_CONTACTS: `${BASE_URL}/api/v1/email-agent/contacts`,
  EMAIL_AGENT_CAMPAIGNS: `${BASE_URL}/api/v1/email-agent/campaigns`,
  EMAIL_AGENT_TEMPLATES: `${BASE_URL}/api/v1/email-agent/templates`,
  POLLS_ADMIN: `${BASE_URL}/polling/api/admin/polls`,
  BROCHURE_UPLOAD: `${API_BASE_URL}/brochure/upload`,
  BROCHURE_DOWNLOAD: `${API_BASE_URL}/brochure/download`,
  BROCHURE_DELETE: `${API_BASE_URL}/brochure/delete`,
  KNOWLEDGE_CHAT: `${API_BASE_URL}/knowledge/chat`,
  KNOWLEDGE_SYNC_DB: `${API_BASE_URL}/knowledge/sync-db`,
  KNOWLEDGE_DOCUMENTS: `${API_BASE_URL}/knowledge/documents`,
  KNOWLEDGE_DOCUMENT_UPLOAD: `${API_BASE_URL}/knowledge/documents/upload`,
  CLINICAL_SUMMARY: `${API_BASE_URL}/clinical/summary`,
  NOTIFICATIONS: `${API_BASE_URL}/notifications`,
  // Moderation (see src/services/moderationService.ts)
  // Routed through a same-origin proxy (MODERATION_API_BASE below) so the browser sends no
  // CORS preflight; the backend currently rejects OPTIONS preflights on these routes with 401.
  MODERATION_ADMIN_REPORTS: `${MODERATION_API_BASE}/admin/reports`,
  MODERATION_ADMIN_BLOCKS: `${MODERATION_API_BASE}/admin/blocks`,
  MODERATION_ADMIN_DELEGATES: `${MODERATION_API_BASE}/admin/delegates`,
};

const AUTH_TOKEN_KEY = 'ignito_auth_token';

const isRealJwt = (value) => {
  const token = typeof value === 'string' ? value.trim() : '';
  return Boolean(token) && !token.startsWith('kaizen_auth_');
};

/** Pull `access_token` from the admin_login payload, including nested result objects. */
export const extractAccessToken = (data) => {
  if (!data || typeof data !== 'object') return '';
  const preferred = [
    data.access_token,
    data.accessToken,
    data.token,
    data.jwt,
    data?.data?.access_token,
    data?.data?.token,
  ];
  for (const candidate of preferred) {
    if (isRealJwt(candidate)) return String(candidate).trim();
  }
  const rows = Array.isArray(data.results)
    ? data.results
    : data.results && typeof data.results === 'object'
      ? [data.results]
      : [];
  for (const row of rows) {
    if (!row || typeof row !== 'object') continue;
    const nested = row.access_token || row.accessToken || row.token || row.jwt;
    if (isRealJwt(nested)) return String(nested).trim();
  }
  return '';
};

/** JWT saved from /api/admin_login `access_token`. Synthetic session placeholders are ignored. */
export const getAccessToken = () => {
  try {
    if (typeof localStorage === 'undefined') return '';
    const token = localStorage.getItem(AUTH_TOKEN_KEY) || '';
    if (isRealJwt(token)) return token.trim();
    const rawUser = localStorage.getItem('ignito_auth_user');
    if (!rawUser) return '';
    const user = JSON.parse(rawUser);
    const nested = user?.access_token || user?.accessToken || user?.token || '';
    return isRealJwt(nested) ? String(nested).trim() : '';
  } catch {
    return '';
  }
};

/** Merge headers with `Authorization: Bearer <access_token>` when a real JWT is stored. */
export const bearerHeaders = (extra = {}) => {
  const headers = { ...extra };
  const token = getAccessToken();
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  return headers;
};

/**
 * Browsers cannot set an Authorization header on a WebSocket handshake.
 * The same JWT is appended as `token` so the Q&A and polling sockets can authenticate.
 */
const appendAccessToken = (url) => {
  const token = getAccessToken();
  if (!token || !url) return url;
  try {
    const parsed = new URL(url);
    parsed.searchParams.set('token', token);
    return parsed.toString();
  } catch {
    const joiner = url.includes('?') ? '&' : '?';
    return `${url}${joiner}token=${encodeURIComponent(token)}`;
  }
};

/**
 * A 401 from a JWT-protected endpoint means the saved access token is missing,
 * expired or revoked. Clear the session and send the admin back to sign in so a
 * fresh token is issued by /api/admin_login.
 */
const handleUnauthorized = (response) => {
  if (response?.status !== 401) return;
  clearAuthSession();
  if (typeof window === 'undefined') return;
  const base = (import.meta.env?.BASE_URL || '/').replace(/\/$/, '');
  if (!window.location.pathname.startsWith(`${base}/signin`)) {
    window.location.assign(`${base}/signin?expired=true`);
  }
};


/**
 * Admin Login API
 * Endpoint: POST /api/admin_login
 *
 * Expected Request Body:
 * {
 *   "email": "admin@example.com",
 *   "password": "your_password"
 * }
 *
 * Expected Response Structure:
 * {
 *   code: 200,
 *   message: "Admin login successful.",
 *   results: [{ email, role }],
 *   isUser: true,
 *   access_token: "<jwt>",
 *   token_type: "bearer",
 *   expires_in: 86400
 * }
 *
 * @param {Object|string} credentials - Credentials object { email, password } or email string
 * @param {string} [optionalPassword] - Password if called as adminLogin(email, password)
 * @returns {Promise<any>} API response object { code, message, results }
 */
export const adminLogin = async (credentials, optionalPassword) => {
  try {
    const payload =
      typeof credentials === 'object' && credentials !== null
        ? {
            email: credentials.email || credentials.username || '',
            password: credentials.password || '',
          }
        : {
            email: credentials || '',
            password: optionalPassword || '',
          };

    const response = await fetch(API_ENDPOINTS.ADMIN_LOGIN, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      // Extract descriptive error message from FastAPI validation or custom responses
      let errorMessage = 'Login failed';
      if (data) {
        if (typeof data.detail === 'string') {
          errorMessage = data.detail;
        } else if (Array.isArray(data.detail) && data.detail[0]?.msg) {
          errorMessage = data.detail[0].msg;
        } else if (data.message) {
          errorMessage = data.message;
        }
      }
      const error = new Error(errorMessage);
      error.status = response.status;
      error.data = data;
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error in adminLogin API:', error);
    throw error;
  }
};

/**
 * Delegates API
 * Endpoint: GET http://192.168.29.201:8000/api/delegates
 *
 * @returns {Promise<any>} API response object { code, message, results }
 */
export const getDelegates = async () => {
  try {
    const response = await fetch(API_ENDPOINTS.DELEGATES, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      const error = new Error(data?.message || `Request failed with status ${response.status}`);
      error.status = response.status;
      error.data = data;
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error in getDelegates API:', error);
    throw error;
  }
};

/**
 * Create or Update Delegate API
 * Endpoint: POST /api/delegates
 *
 * Send `id` to update an existing delegate. Omit `id` to create a new one.
 * `password` is only included when a value is provided.
 *
 * @param {Object} delegateData
 * @returns {Promise<any>} API response object { code, message, results, isUser }
 */
export const saveDelegate = async (delegateData) => {
  try {
    const payload = {
      registration_id: delegateData.registration_id ?? '',
      salutation: delegateData.salutation ?? '',
      first_name: delegateData.first_name ?? '',
      last_name: delegateData.last_name ?? '',
      email: delegateData.email ?? '',
      phone: delegateData.phone ?? '',
      city: delegateData.city ?? '',
      state: delegateData.state ?? '',
      country: delegateData.country ?? '',
      reg_category: delegateData.reg_category ?? '',
      total_amount:
        delegateData.total_amount === '' ||
        delegateData.total_amount === undefined ||
        delegateData.total_amount === null
          ? 0
          : Number(delegateData.total_amount) || 0,
      transaction_id: delegateData.transaction_id ?? '',
      mci_no: delegateData.mci_no ?? '',
      registration_date: delegateData.registration_date || null,
      payment_date: delegateData.payment_date || null,
      payment_mode: delegateData.payment_mode ?? '',
      remarks: delegateData.remarks ?? '',
      from_link: delegateData.from_link ?? '',
    };

    const idNum = Number(delegateData?.id);
    if (delegateData?.id !== undefined && delegateData?.id !== null && delegateData?.id !== '' && idNum > 0) {
      payload.id = idNum;
    }

    if (delegateData?.password) {
      payload.password = String(delegateData.password);
    }

    const response = await fetch(API_ENDPOINTS.DELEGATES, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      let errorMessage = 'Failed to save delegate';
      if (data) {
        if (typeof data.detail === 'string') {
          errorMessage = data.detail;
        } else if (Array.isArray(data.detail)) {
          errorMessage = data.detail
            .map((d) => {
              const loc = Array.isArray(d.loc) ? d.loc.filter((p) => p !== 'body').join('.') : '';
              return `${loc ? loc + ': ' : ''}${d.msg || JSON.stringify(d)}`;
            })
            .join(', ');
        } else if (data.message) {
          errorMessage = data.message;
        }
      }
      const error = new Error(errorMessage);
      error.status = response.status;
      error.data = data;
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error in saveDelegate API:', error);
    throw error;
  }
};

/**
 * Delete Delegate API
 * Endpoint: DELETE /api/delegates/{delegate_id}
 *
 * @param {number|string} delegateId
 * @returns {Promise<any>}
 */
export const deleteDelegate = async (delegateId) => {
  try {
    if (delegateId === undefined || delegateId === null || delegateId === '') {
      throw new Error('Delegate ID is required to delete a delegate');
    }

    const response = await fetch(`${API_ENDPOINTS.DELEGATES}/${encodeURIComponent(delegateId)}`, {
      method: 'DELETE',
      headers: {
        'Accept': 'application/json',
      },
    });

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      let errorMessage = 'Failed to delete delegate';
      if (data) {
        if (typeof data.detail === 'string') {
          errorMessage = data.detail;
        } else if (Array.isArray(data.detail)) {
          errorMessage = data.detail
            .map((d) => {
              const loc = Array.isArray(d.loc) ? d.loc.filter((p) => p !== 'body').join('.') : '';
              return `${loc ? loc + ': ' : ''}${d.msg || JSON.stringify(d)}`;
            })
            .join(', ');
        } else if (data.message) {
          errorMessage = data.message;
        }
      }
      const error = new Error(errorMessage);
      error.status = response.status;
      error.data = data;
      throw error;
    }

    return data || { success: true };
  } catch (error) {
    console.error('Error in deleteDelegate API:', error);
    throw error;
  }
};

/**
 * Speakers API
 * Endpoint: GET http://192.168.29.201:8000/api/speakers
 * Optional query parameter: ?id=123
 *
 * @param {number|string} [id] - Optional speaker ID to fetch single speaker
 * @returns {Promise<any>} API response object { code, message, results, isUser }
 */
export const getSpeakers = async (id) => {
  try {
    const url = id !== undefined && id !== null ? `${API_ENDPOINTS.SPEAKERS}?id=${encodeURIComponent(id)}` : API_ENDPOINTS.SPEAKERS;
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      const error = new Error(data?.message || `Request failed with status ${response.status}`);
      error.status = response.status;
      error.data = data;
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error in getSpeakers API:', error);
    throw error;
  }
};

/**
 * Save Speaker (Create or Update) API
 * Endpoint: POST http://192.168.29.201:8000/api/speakers
 *
 * Accepts FormData (for multipart file uploads like profile_image) or standard object.
 * If 'id' is present, updates the existing speaker. If not, creates a new one.
 *
 * @param {FormData|object} speakerData
 * @returns {Promise<any>} API response object { code, message, results, isUser }
 */
export const saveSpeaker = async (speakerData) => {
  try {
    let body;
    if (speakerData instanceof FormData) {
      body = speakerData;
      // If id is empty, null, 'undefined', or '0', remove it so backend creates a new record
      if (body.has('id')) {
        const idVal = body.get('id');
        if (!idVal || idVal === 'null' || idVal === 'undefined' || idVal === '' || idVal === '0') {
          body.delete('id');
        }
      }
    } else {
      body = new FormData();
      Object.entries(speakerData).forEach(([key, value]) => {
        // Only append id if it's a valid ID
        if (key === 'id') {
          if (value !== undefined && value !== null && value !== '' && Number(value) > 0) {
            body.append('id', String(value));
          }
          return;
        }
        if (key === 'role') {
          if (value !== undefined && value !== null && value !== '') {
            body.append('role', String(Number(value)));
          }
          return;
        }
        if (value !== undefined && value !== null && value !== '') {
          if (typeof value === 'boolean') {
            body.append(key, value ? 'true' : 'false');
          } else {
            body.append(key, value);
          }
        }
      });
    }

    const response = await fetch(API_ENDPOINTS.SPEAKERS, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
      },
      body,
    });

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      let errorMessage = 'Failed to save speaker';
      if (data) {
        if (typeof data.detail === 'string') {
          errorMessage = data.detail;
        } else if (Array.isArray(data.detail)) {
          errorMessage = data.detail.map((d) => d.msg || JSON.stringify(d)).join(', ');
        } else if (data.message) {
          errorMessage = data.message;
        }
      }
      const error = new Error(errorMessage);
      error.status = response.status;
      error.data = data;
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error in saveSpeaker API:', error);
    throw error;
  }
};

/**
 * Delete Speaker API
 * Endpoint: DELETE http://192.168.29.201:8000/api/speakers/{speaker_id}
 *
 * @param {number|string} speakerId - The ID of the speaker to delete
 * @returns {Promise<any>} API response object
 */
export const deleteSpeaker = async (speakerId) => {
  try {
    const response = await fetch(`${API_ENDPOINTS.SPEAKERS}/${encodeURIComponent(speakerId)}`, {
      method: 'DELETE',
      headers: {
        'Accept': 'application/json',
      },
    });

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      const error = new Error(data?.message || `Request failed with status ${response.status}`);
      error.status = response.status;
      error.data = data;
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error in deleteSpeaker API:', error);
    throw error;
  }
};

/**
 * Sessions / Schedules API - Get All Sessions
 * Endpoint: GET http://192.168.29.201:8000/api/schedules
 * Optional query parameter: ?id=1
 *
 * Expected Response Structure:
 * {
 *   code: 200,
 *   message: "Request successful",
 *   results: [
 *     {
 *       id: 1,
 *       speaker_id: 2,
 *       category: "Cardiology",
 *       title: "Preventive Cardiology in Modern Practice",
 *       description: "...",
 *       event_date: "2027-01-01",
 *       start_time: "09:00:00",
 *       end_time: "10:00:00",
 *       venue: "RK Hospital Conference Hall",
 *       room: "Hall A"
 *     }
 *   ],
 *   isUser: true
 * }
 *
 * @param {string|number} [id] - Optional schedule ID to filter/retrieve single session
 * @returns {Promise<any>} Array of session schedules or single session
 */
export const getSessions = async (id) => {
  try {
    const url = id !== undefined && id !== null && id !== ''
      ? `${API_ENDPOINTS.SCHEDULES}?id=${encodeURIComponent(id)}`
      : API_ENDPOINTS.SCHEDULES;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      const errorMsg = data?.detail || data?.message || `Request failed with status ${response.status}`;
      const error = new Error(typeof errorMsg === 'string' ? errorMsg : JSON.stringify(errorMsg));
      error.status = response.status;
      error.data = data;
      throw error;
    }

    if (data && Array.isArray(data.results)) {
      if (id !== undefined && id !== null && id !== '') {
        return data.results.length > 0 ? data.results[0] : null;
      }
      return data.results;
    }

    if (Array.isArray(data)) {
      return data;
    }

    return data;
  } catch (error) {
    console.error('Error in getSessions API (schedules):', error);
    throw error;
  }
};

/**
 * Get Session / Schedule By ID API
 * Looks up schedule session details by ID
 * Endpoint: GET http://192.168.29.201:8000/api/schedules?id={id}
 *
 * @param {string|number} id - The schedule ID
 * @returns {Promise<any>} Session details object
 */
export const getSessionById = async (id) => {
  try {
    if (!id && id !== 0) {
      throw new Error('Session ID is required to fetch session details');
    }

    const response = await fetch(`${API_ENDPOINTS.SCHEDULES}?id=${encodeURIComponent(id)}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      throw new Error(data?.message || `Request failed with status ${response.status}`);
    }

    if (data && Array.isArray(data.results) && data.results.length > 0) {
      return data.results[0];
    }

    throw new Error(`Session with ID "${id}" was not found.`);
  } catch (error) {
    console.error('Error in getSessionById API:', error);
    throw error;
  }
};

/**
 * Create or Update Session Schedule API
 * Endpoint: POST http://192.168.29.201:8000/api/schedules
 *
 * @param {Object} sessionData
 * @returns {Promise<any>} Created or updated session schedule object
 */
export const createSession = async (sessionData) => {
  try {
    const speakerIdsList = Array.isArray(sessionData.speaker_ids)
      ? sessionData.speaker_ids.map(Number).filter((n) => !isNaN(n))
      : sessionData.speaker_id !== undefined && sessionData.speaker_id !== null && sessionData.speaker_id !== ''
      ? [Number(sessionData.speaker_id)]
      : [];

    const payload = {
      id: sessionData.id ? Number(sessionData.id) : null,
      speaker_ids: speakerIdsList,
      category: sessionData.category || sessionData.track || '',
      title: sessionData.title || '',
      description: sessionData.description || '',
      event_date: sessionData.event_date || sessionData.date || '2027-01-01',
      start_time: sessionData.start_time || sessionData.startTime || '09:00:00',
      end_time: sessionData.end_time || sessionData.endTime || '10:00:00',
      venue: sessionData.venue || 'RK Hospital Conference Hall',
      room: sessionData.room || 'Hall A',
    };

    // Optional PDF (field `session_pdf`, max 25 MB). The API only accepts the file as
    // multipart/form-data, so switch to FormData when one is attached; otherwise keep JSON.
    const pdf = sessionData.session_pdf;
    const hasPdf = typeof File !== 'undefined' && pdf instanceof File;

    let body;
    const headers = { 'Accept': 'application/json' };
    if (hasPdf) {
      body = new FormData();
      if (payload.id) body.append('id', String(payload.id));
      // Multipart takes speaker_ids as a comma-separated string. Sent empty on edit so
      // removing every presenter still clears them; omitted on create.
      if (speakerIdsList.length > 0 || payload.id) body.append('speaker_ids', speakerIdsList.join(','));
      ['category', 'title', 'description', 'event_date', 'start_time', 'end_time', 'venue', 'room'].forEach((k) => {
        body.append(k, payload[k] ?? '');
      });
      body.append('session_pdf', pdf, pdf.name);
      // No Content-Type header: the browser sets multipart/form-data with its boundary.
    } else {
      body = JSON.stringify(payload);
      headers['Content-Type'] = 'application/json';
    }

    const response = await fetch(API_ENDPOINTS.SCHEDULES, {
      method: 'POST',
      headers,
      body,
    });

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      let errorMessage = 'Failed to save session';
      if (data) {
        if (typeof data.detail === 'string') {
          errorMessage = data.detail;
        } else if (Array.isArray(data.detail) && data.detail[0]?.msg) {
          errorMessage = `${data.detail[0].loc ? data.detail[0].loc.join('.') + ': ' : ''}${data.detail[0].msg}`;
        } else if (data.message) {
          errorMessage = data.message;
        }
      }
      const error = new Error(errorMessage);
      error.status = response.status;
      error.data = data;
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error in createSession API:', error);
    throw error;
  }
};

/**
 * Delete Session Schedule API
 * Endpoint: DELETE http://192.168.29.201:8000/api/schedules/{schedule_id}
 *
 * @param {number|string} scheduleId
 * @returns {Promise<any>}
 */
export const deleteSession = async (scheduleId) => {
  try {
    const response = await fetch(`${API_ENDPOINTS.SCHEDULES}/${encodeURIComponent(scheduleId)}`, {
      method: 'DELETE',
      headers: { 'Accept': 'application/json' },
    });
    const data = await response.json().catch(() => null);
    if (!response.ok) {
      throw new Error(data?.message || `Failed to delete schedule with status ${response.status}`);
    }
    return data;
  } catch (error) {
    console.error('Error in deleteSession API:', error);
    throw error;
  }
};

/**
 * Session Feedback Summary API
 * Endpoint: GET https://api.kaizencon.in/api/sessions/feedback?session_id={id}
 *
 * Expected Response Structure:
 * {
 *   code: 200,
 *   message: "Feedback summary retrieved successfully.",
 *   results: [{
 *     session_id: 14,
 *     total_feedback: 2,
 *     average_rating: 4.0 | null,
 *     comments: {
 *       five_star: [{ id, rating, comment, submitted_at }],
 *       three_or_four_star: [...],
 *       one_star: [...]
 *     }
 *   }],
 *   isUser: true
 * }
 *
 * Returns 404 { detail: "Session not found" } for unknown sessions.
 *
 * @param {number|string} sessionId - The session (schedule) ID
 * @returns {Promise<any|null>} The feedback summary for that session, or null if none returned
 */
export const getSessionFeedback = async (sessionId) => {
  try {
    if (sessionId === undefined || sessionId === null || sessionId === '') {
      throw new Error('Session ID is required to fetch feedback');
    }

    const response = await fetch(
      `${API_ENDPOINTS.SESSIONS}/feedback?session_id=${encodeURIComponent(sessionId)}`,
      {
        method: 'GET',
        headers: { 'Accept': 'application/json' },
      }
    );

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      let errorMessage = `Request failed with status ${response.status}`;
      if (data) {
        if (typeof data.detail === 'string') {
          errorMessage = data.detail;
        } else if (Array.isArray(data.detail) && data.detail[0]?.msg) {
          errorMessage = data.detail[0].msg;
        } else if (data.message) {
          errorMessage = data.message;
        }
      }
      const error = new Error(errorMessage);
      error.status = response.status;
      error.data = data;
      throw error;
    }

    if (data && Array.isArray(data.results)) {
      return (
        data.results.find((r) => String(r?.session_id) === String(sessionId)) ||
        data.results[0] ||
        null
      );
    }

    return data;
  } catch (error) {
    console.error('Error in getSessionFeedback API:', error);
    throw error;
  }
};

/** Extract a readable message from a FastAPI / envelope error body */
const extractApiError = (data, status) => {
  if (data) {
    if (typeof data.detail === 'string') return data.detail;
    if (Array.isArray(data.detail) && data.detail[0]?.msg) {
      const loc = Array.isArray(data.detail[0].loc) ? data.detail[0].loc.filter((p) => p !== 'body').join('.') : '';
      return `${loc ? loc + ': ' : ''}${data.detail[0].msg}`;
    }
    if (data.message) return data.message;
  }
  return `Request failed with status ${status}`;
};

/**
 * Create & Send Push Notification API
 * Endpoint: POST https://api.kaizencon.in/api/notifications
 *
 * Request body (NotificationCreate, additionalProperties: false):
 * {
 *   title: string (1-200),
 *   body: string (1-2000),
 *   delegate_ids?: number[] (max 5000; [] = broadcast to every registered device),
 *   data?: { [key: string]: string }
 * }
 *
 * Response (201): { code, message, results: [{ id, title, body, data, delegate_ids,
 *   target_count, sent_count, failed_count, created_at }], isUser }
 *
 * NOTE: 201 only means the notification was saved — inspect target/sent/failed counts
 * for actual delivery.
 *
 * @param {{ title: string, body: string, delegate_ids: number[], data?: Record<string,string> }} payload
 * @returns {Promise<{ code: number, message: string, notification: any|null }>}
 */
export const sendNotification = async (payload) => {
  try {
    const response = await fetch(API_ENDPOINTS.NOTIFICATIONS, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      const error = new Error(extractApiError(data, response.status));
      error.status = response.status;
      error.data = data;
      throw error;
    }

    return {
      code: data?.code ?? response.status,
      message: data?.message || '',
      notification: Array.isArray(data?.results) && data.results.length > 0 ? data.results[0] : null,
    };
  } catch (error) {
    console.error('Error in sendNotification API:', error);
    throw error;
  }
};

/**
 * List Notifications (history) API
 * Endpoint: GET https://api.kaizencon.in/api/notifications?offset=0&limit=50[&delegate_id=]
 *
 * @param {{ offset?: number, limit?: number, delegateId?: number|null }} [params]
 * @returns {Promise<{ results: any[], count: number }>}
 */
export const getNotifications = async ({ offset = 0, limit = 50, delegateId = null } = {}) => {
  try {
    const query = new URLSearchParams({ offset: String(offset), limit: String(limit) });
    if (delegateId) query.set('delegate_id', String(delegateId));

    const response = await fetch(`${API_ENDPOINTS.NOTIFICATIONS}?${query.toString()}`, {
      method: 'GET',
      headers: { 'Accept': 'application/json' },
    });

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      const error = new Error(extractApiError(data, response.status));
      error.status = response.status;
      error.data = data;
      throw error;
    }

    const results = Array.isArray(data?.results) ? data.results : [];
    return { results, count: typeof data?.count === 'number' ? data.count : results.length };
  } catch (error) {
    console.error('Error in getNotifications API:', error);
    throw error;
  }
};

// Aliases for compatibility
export const getSchedules = getSessions;
export const getScheduleById = getSessionById;
export const saveSchedule = createSession;
export const deleteSchedule = deleteSession;

/**
 * Get Email Agent Contacts API
 * Endpoint: GET http://192.168.29.201:8000/api/v1/email-agent/contacts?offset=0&limit=100
 *
 * @param {number} [offset=0]
 * @param {number} [limit=100]
 * @returns {Promise<any[]>}
 */
/**
 * Get Email Agent Contacts API
 * Supports page-number based pagination via pag_number. (No limit parameter sent)
 *
 * @param {number|string} [page=1] - Page number (minimum: 1) or 'all' to fetch all contacts
 * @param {boolean|any} [fetchAll=false] - Whether to fetch all pages
 * @returns {Promise<any[]>} Array of contacts (with attached .total, .count, and .total_email_count)
 */
export const getEmailAgentContacts = async (page = 1, fetchAll = false) => {
  if (fetchAll || page === 'all' || page === 0) {
    return getAllEmailAgentContacts();
  }

  try {
    const pageNum = Math.max(1, Number(page) || 1);

    // Send pag_number without limit parameter
    const url = `${API_ENDPOINTS.EMAIL_AGENT_CONTACTS}?pag_number=${encodeURIComponent(pageNum)}`;
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      const errorMsg = data?.detail || data?.message || `Request failed with status ${response.status}`;
      const error = new Error(typeof errorMsg === 'string' ? errorMsg : JSON.stringify(errorMsg));
      error.status = response.status;
      error.data = data;
      throw error;
    }

    let items = [];
    let totalCount = 0;

    if (Array.isArray(data)) {
      items = [...data];
      totalCount = typeof data.total_email_count === 'number'
        ? data.total_email_count
        : typeof data.count === 'number'
        ? data.count
        : typeof data.total === 'number'
        ? data.total
        : data.length;
    } else if (data && typeof data === 'object') {
      totalCount =
        typeof data.total_email_count === 'number'
          ? data.total_email_count
          : typeof data.total_count === 'number'
          ? data.total_count
          : typeof data.count === 'number'
          ? data.count
          : typeof data.total === 'number'
          ? data.total
          : 0;

      if (Array.isArray(data.results)) {
        items = [...data.results];
      } else if (Array.isArray(data.value)) {
        items = [...data.value];
      } else if (Array.isArray(data.data)) {
        items = [...data.data];
      } else if (Array.isArray(data.contacts)) {
        items = [...data.contacts];
      }

      if (!totalCount) {
        totalCount = items.length;
      }
    }

    items.count = totalCount;
    items.total = totalCount;
    items.total_email_count = totalCount;
    items.currentPage = pageNum;

    return items;
  } catch (error) {
    console.error('Error in getEmailAgentContacts API:', error);
    throw error;
  }
};

/**
 * Get ALL Email Agent Contacts API
 * Automatically fetches all pages without limit parameter until all contacts are loaded.
 *
 * @returns {Promise<any[]>} Complete array of all contacts
 */
export const getAllEmailAgentContacts = async () => {
  try {
    // Attempt 1: Fetch all contacts in a single API call via preview endpoint (allows limit up to 5000)
    try {
      const previewUrl = `${API_ENDPOINTS.EMAIL_AGENT_CONTACTS}/preview?limit=5000`;
      const previewRes = await fetch(previewUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      });

      if (previewRes.ok) {
        const previewData = await previewRes.json().catch(() => null);
        let items = [];
        if (Array.isArray(previewData)) {
          items = [...previewData];
        } else if (previewData && Array.isArray(previewData.results)) {
          items = [...previewData.results];
        } else if (previewData && Array.isArray(previewData.data)) {
          items = [...previewData.data];
        }

        if (items.length > 0) {
          items.count = items.length;
          items.total = items.length;
          items.total_email_count = items.length;
          return items;
        }
      }
    } catch (previewErr) {
      console.warn('Single-call preview failed, falling back to paginated fetch:', previewErr);
    }

    // Attempt 2: Fallback to paginated fetch without limit parameter
    const firstUrl = `${API_ENDPOINTS.EMAIL_AGENT_CONTACTS}?pag_number=1`;
    const response = await fetch(firstUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });

    const firstData = await response.json().catch(() => null);

    if (!response.ok) {
      const errorMsg = firstData?.detail || firstData?.message || `Request failed with status ${response.status}`;
      throw new Error(typeof errorMsg === 'string' ? errorMsg : JSON.stringify(errorMsg));
    }

    let allItems = [];
    let totalCount = 0;

    if (Array.isArray(firstData)) {
      allItems = [...firstData];
      totalCount = typeof firstData.total_email_count === 'number'
        ? firstData.total_email_count
        : firstData.length;
    } else if (firstData && typeof firstData === 'object') {
      allItems = Array.isArray(firstData.results)
        ? [...firstData.results]
        : Array.isArray(firstData.data)
        ? [...firstData.data]
        : [];

      totalCount =
        typeof firstData.total_email_count === 'number'
          ? firstData.total_email_count
          : typeof firstData.total_count === 'number'
          ? firstData.total_count
          : typeof firstData.total === 'number'
          ? firstData.total
          : typeof firstData.count === 'number'
          ? firstData.count
          : allItems.length;
    }

    // 2. If there are more pages, fetch the remaining pages in parallel
    const pageSize = allItems.length > 0 ? allItems.length : 100;
    if (totalCount > pageSize) {
      const totalPages = Math.ceil(totalCount / pageSize);
      const pagePromises = [];

      for (let p = 2; p <= totalPages; p++) {
        pagePromises.push(
          fetch(`${API_ENDPOINTS.EMAIL_AGENT_CONTACTS}?pag_number=${p}`, {
            method: 'GET',
            headers: { 'Accept': 'application/json' },
          })
            .then((res) => (res.ok ? res.json() : null))
            .then((data) => {
              if (Array.isArray(data)) return data;
              if (data && Array.isArray(data.results)) return data.results;
              if (data && Array.isArray(data.data)) return data.data;
              return [];
            })
            .catch(() => [])
        );
      }

      const otherPages = await Promise.all(pagePromises);
      otherPages.forEach((pageItems) => {
        allItems.push(...pageItems);
      });
    }

    allItems.count = allItems.length;
    allItems.total = totalCount || allItems.length;
    allItems.total_email_count = totalCount || allItems.length;

    return allItems;
  } catch (error) {
    console.error('Error in getAllEmailAgentContacts API:', error);
    throw error;
  }
};

/**
 * Get Contact By ID API
 * Endpoint: GET {BASE_URL}/api/v1/email-agent/contacts/{contact_id}
 *
 * @param {string} contactId
 * @returns {Promise<any>} Contact object
 */
export const getContactById = async (contactId) => {
  try {
    if (!contactId) throw new Error('Contact ID is required');
    const url = `${API_ENDPOINTS.EMAIL_AGENT_CONTACTS}/${encodeURIComponent(contactId)}`;
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      const errorMsg = data?.detail || data?.message || `Failed to fetch contact with status ${response.status}`;
      const error = new Error(typeof errorMsg === 'string' ? errorMsg : JSON.stringify(errorMsg));
      error.status = response.status;
      error.data = data;
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error in getContactById API:', error);
    throw error;
  }
};

/**
 * Stop Contact API
 * Endpoint: POST http://192.168.29.201:8000/api/v1/email-agent/contacts/{contact_id}/stop
 *
 * @param {string} contactId
 * @returns {Promise<any>}
 */
export const stopContact = async (contactId) => {
  try {
    const url = `${API_ENDPOINTS.EMAIL_AGENT_CONTACTS}/${encodeURIComponent(contactId)}/stop`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
      },
    });

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      const errorMsg = data?.detail || data?.message || `Failed to stop contact with status ${response.status}`;
      const error = new Error(typeof errorMsg === 'string' ? errorMsg : JSON.stringify(errorMsg));
      error.status = response.status;
      error.data = data;
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error in stopContact API:', error);
    throw error;
  }
};

/**
 * Delete Contact API
 * Endpoint: DELETE http://192.168.29.201:8000/api/v1/email-agent/contacts/{contact_id}
 *
 * @param {string} contactId
 * @returns {Promise<any>}
 */
export const deleteContact = async (contactId) => {
  try {
    if (!contactId) throw new Error('Contact ID is required');
    const url = `${API_ENDPOINTS.EMAIL_AGENT_CONTACTS}/${encodeURIComponent(contactId)}`;
    const response = await fetch(url, {
      method: 'DELETE',
      headers: {
        'Accept': '*/*',
      },
    });

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      let errorMessage = 'Failed to delete contact';
      if (data) {
        if (typeof data.detail === 'string') {
          errorMessage = data.detail;
        } else if (Array.isArray(data.detail)) {
          errorMessage = data.detail.map((d) => d.msg || JSON.stringify(d)).join(', ');
        } else if (data.message) {
          errorMessage = data.message;
        }
      }
      const error = new Error(errorMessage);
      error.status = response.status;
      error.data = data;
      throw error;
    }

    return data || { success: true };
  } catch (error) {
    console.error('Error in deleteContact API:', error);
    throw error;
  }
};

/**
 * Import Excel Contacts API
 * Endpoint: POST http://192.168.29.201:8000/api/v1/email-agent/contacts/import-excel
 *
 * @param {File|Blob} file - Excel (.xlsx or .xls) file
 * @returns {Promise<any>} Response with { imported, invalid, duplicate_count, preview_only }
 */
export const importExcelContacts = async (file) => {
  try {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${API_ENDPOINTS.EMAIL_AGENT_CONTACTS}/import-excel`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
      },
      body: formData,
    });

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      let errorMessage = 'Failed to import Excel contacts';
      if (data) {
        if (typeof data.detail === 'string') {
          errorMessage = data.detail;
        } else if (Array.isArray(data.detail) && data.detail[0]?.msg) {
          errorMessage = data.detail[0].msg;
        } else if (data.message) {
          errorMessage = data.message;
        }
      }
      const error = new Error(errorMessage);
      error.status = response.status;
      error.data = data;
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error in importExcelContacts API:', error);
    throw error;
  }
};

/**
 * Get Email Agent Campaigns API
 *
 * @param {number} [offset=0] - Offset parameter (defaults to 0)
 * @param {number} [limit=10] - Limit parameter
 * @param {string|null} [campaignId=null] - Optional Campaign UUID
 * @returns {Promise<any[]>} Array of campaigns (with .count and .total)
 */
export const getCampaigns = async (offset = 0, limit = 10, campaignId = null) => {
  try {
    let url = `${API_ENDPOINTS.EMAIL_AGENT_CAMPAIGNS}?offset=${encodeURIComponent(offset)}&limit=${encodeURIComponent(limit)}`;
    if (campaignId) {
      url += `&campaign_id=${encodeURIComponent(campaignId)}`;
    }

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      const errorMsg = data?.detail || data?.message || `Request failed with status ${response.status}`;
      const error = new Error(typeof errorMsg === 'string' ? errorMsg : JSON.stringify(errorMsg));
      error.status = response.status;
      error.data = data;
      throw error;
    }

    // Direct single campaign object returned when queried by campaign_id
    if (data && data.id && !Array.isArray(data)) {
      const list = [data];
      list.count = 1;
      list.total = 1;
      return list;
    }

    if (Array.isArray(data)) {
      data.count = typeof data.count === 'number' ? data.count : data.length;
      data.total = data.count;
      return data;
    }

    if (data && Array.isArray(data.value)) {
      data.value.count = typeof data.count === 'number' ? data.count : data.value.length;
      data.value.total = data.value.count;
      return data.value;
    }

    if (data && Array.isArray(data.results)) {
      const results = [...data.results];
      results.count = typeof data.count === 'number' ? data.count : (data.total ?? data.results.length);
      results.total = results.count;
      return results;
    }

    return [];
  } catch (error) {
    console.error('Error in getCampaigns API:', error);
    throw error;
  }
};

/**
 * Create Email Agent Campaign API
 * Endpoint: POST http://192.168.29.201:8000/api/v1/email-agent/campaigns
 *
 * Request Body:
 * {
 *   "name": "string",
 *   "description": "string",
 *   "goal": "registration",
 *   "contact_ids": ["3fa85f64-5717-4562-b3fc-2c963f66afa6"],
 *   "template_id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
 *   "registration_url": "https://example.com/",
 *   "followup_interval_days": 1,
 *   "followup_delay_minutes": 1,
 *   "sending_delay_seconds": 3600,
 *   "max_followups": 10,
 *   "max_sends_per_day": 1
 * }
 *
 * @param {Object} campaignData
 * @returns {Promise<any>} Created campaign response object
 */
export const createCampaign = async (campaignData) => {
  try {
    let body;
    const headers = {
      'Accept': '*/*',
    };

    if (campaignData instanceof FormData) {
      body = campaignData;
    } else {
      const formData = new FormData();
      formData.append('name', campaignData.name ? String(campaignData.name).trim() : '');

      if (campaignData.description !== undefined && campaignData.description !== null && campaignData.description !== '') {
        formData.append('description', String(campaignData.description).trim());
      }

      formData.append('goal', campaignData.goal || 'registration');

      if (campaignData.registration_url) {
        formData.append('registration_url', String(campaignData.registration_url).trim());
      }

      if (campaignData.followup_interval_days !== undefined && campaignData.followup_interval_days !== null && campaignData.followup_interval_days !== '') {
        formData.append('followup_interval_days', String(campaignData.followup_interval_days));
      }

      if (campaignData.followup_delay_minutes !== undefined && campaignData.followup_delay_minutes !== null && campaignData.followup_delay_minutes !== '') {
        formData.append('followup_delay_minutes', String(campaignData.followup_delay_minutes));
      }

      if (campaignData.sending_delay_seconds !== undefined && campaignData.sending_delay_seconds !== null && campaignData.sending_delay_seconds !== '') {
        formData.append('sending_delay_seconds', String(campaignData.sending_delay_seconds));
      }

      if (campaignData.max_followups !== undefined && campaignData.max_followups !== null && campaignData.max_followups !== '') {
        formData.append('max_followups', String(campaignData.max_followups));
      }

      if (campaignData.max_sends_per_day !== undefined && campaignData.max_sends_per_day !== null && campaignData.max_sends_per_day !== '') {
        formData.append('max_sends_per_day', String(campaignData.max_sends_per_day));
      }

      if (campaignData.re_mail !== undefined) {
        formData.append('re_mail', String(Boolean(campaignData.re_mail)));
      }

      // Contact IDs: comma-separated or array
      const contactIds = Array.isArray(campaignData.contact_ids)
        ? campaignData.contact_ids
        : campaignData.contact_ids
        ? String(campaignData.contact_ids).split(',').map((id) => id.trim()).filter(Boolean)
        : [];
      if (contactIds.length > 0) {
        formData.append('contact_ids', contactIds.join(','));
      }

      // Template IDs: comma-separated or array
      const templateIdList = Array.isArray(campaignData.template_id)
        ? campaignData.template_id
        : Array.isArray(campaignData.template_ids)
        ? campaignData.template_ids
        : campaignData.template_id
        ? [campaignData.template_id]
        : [];
      if (templateIdList.length > 0) {
        formData.append('template_id', templateIdList.join(','));
      }

      // Attachments (files)
      if (campaignData.attachments) {
        const files = Array.isArray(campaignData.attachments)
          ? campaignData.attachments
          : [campaignData.attachments];
        files.forEach((file) => {
          if (file) {
            formData.append('attachments', file, file.name || 'attachment');
          }
        });
      }

      body = formData;
    }

    const response = await fetch(API_ENDPOINTS.EMAIL_AGENT_CAMPAIGNS, {
      method: 'POST',
      headers,
      body,
    });

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      let errorMessage = 'Failed to create campaign';
      if (data) {
        if (typeof data.detail === 'string') {
          errorMessage = data.detail;
        } else if (Array.isArray(data.detail)) {
          errorMessage = data.detail.map((d) => d.msg || JSON.stringify(d)).join(', ');
        } else if (data.message) {
          errorMessage = data.message;
        }
      }
      const error = new Error(errorMessage);
      error.status = response.status;
      error.data = data;
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error in createCampaign API:', error);
    throw error;
  }
};

/**
 * Approve Campaign API
 * Endpoint: POST http://192.168.29.201:8000/api/v1/email-agent/campaigns/{campaign_id}/approve
 *
 * @param {string} campaignId - The UUID of the campaign
 * @returns {Promise<any>} Updated campaign object
 */
export const approveCampaign = async (campaignId) => {
  try {
    if (!campaignId) throw new Error('Campaign ID is required to approve campaign');
    const url = `${API_ENDPOINTS.EMAIL_AGENT_CAMPAIGNS}/${encodeURIComponent(campaignId)}/approve`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
      },
    });

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      let errorMessage = 'Failed to approve campaign';
      if (data) {
        if (typeof data.detail === 'string') {
          errorMessage = data.detail;
        } else if (Array.isArray(data.detail)) {
          errorMessage = data.detail.map((d) => d.msg || JSON.stringify(d)).join(', ');
        } else if (data.message) {
          errorMessage = data.message;
        }
      }
      const error = new Error(errorMessage);
      error.status = response.status;
      error.data = data;
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error in approveCampaign API:', error);
    throw error;
  }
};

/**
 * Start Campaign API
 * Endpoint: POST http://192.168.29.201:8000/api/v1/email-agent/campaigns/{campaign_id}/start
 *
 * @param {string} campaignId - The UUID of the campaign
 * @returns {Promise<any>} Updated campaign object
 */
export const startCampaign = async (campaignId) => {
  try {
    if (!campaignId) throw new Error('Campaign ID is required to start campaign');
    const url = `${API_ENDPOINTS.EMAIL_AGENT_CAMPAIGNS}/${encodeURIComponent(campaignId)}/start`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
      },
    });

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      let errorMessage = 'Failed to start campaign';
      if (data) {
        if (typeof data.detail === 'string') {
          errorMessage = data.detail;
        } else if (Array.isArray(data.detail)) {
          errorMessage = data.detail.map((d) => d.msg || JSON.stringify(d)).join(', ');
        } else if (data.message) {
          errorMessage = data.message;
        }
      }
      const error = new Error(errorMessage);
      error.status = response.status;
      error.data = data;
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error in startCampaign API:', error);
    throw error;
  }
};

/**
 * Stop Campaign API
 * Endpoint: POST http://192.168.29.201:8000/api/v1/email-agent/campaigns/{campaign_id}/stop
 *
 * @param {string} campaignId - The UUID of the campaign
 * @returns {Promise<any>} Updated campaign object
 */
export const stopCampaign = async (campaignId) => {
  try {
    if (!campaignId) throw new Error('Campaign ID is required to stop campaign');
    const url = `${API_ENDPOINTS.EMAIL_AGENT_CAMPAIGNS}/${encodeURIComponent(campaignId)}/stop`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
      },
    });

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      let errorMessage = 'Failed to stop campaign';
      if (data) {
        if (typeof data.detail === 'string') {
          errorMessage = data.detail;
        } else if (Array.isArray(data.detail)) {
          errorMessage = data.detail.map((d) => d.msg || JSON.stringify(d)).join(', ');
        } else if (data.message) {
          errorMessage = data.message;
        }
      }
      const error = new Error(errorMessage);
      error.status = response.status;
      error.data = data;
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error in stopCampaign API:', error);
    throw error;
  }
};

/**
 * Pause Campaign API
 * Endpoint: POST {BASE_URL}/api/v1/email-agent/campaigns/{campaign_id}/pause
 *
 * @param {string} campaignId - The UUID of the campaign
 * @returns {Promise<any>} Updated campaign object
 */
export const pauseCampaign = async (campaignId) => {
  try {
    if (!campaignId) throw new Error('Campaign ID is required to pause campaign');
    const url = `${API_ENDPOINTS.EMAIL_AGENT_CAMPAIGNS}/${encodeURIComponent(campaignId)}/pause`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
      },
    });

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      let errorMessage = 'Failed to pause campaign';
      if (data) {
        if (typeof data.detail === 'string') {
          errorMessage = data.detail;
        } else if (Array.isArray(data.detail)) {
          errorMessage = data.detail.map((d) => d.msg || JSON.stringify(d)).join(', ');
        } else if (data.message) {
          errorMessage = data.message;
        }
      }
      const error = new Error(errorMessage);
      error.status = response.status;
      error.data = data;
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error in pauseCampaign API:', error);
    throw error;
  }
};

/**
 * Resume Campaign API
 * Endpoint: POST {BASE_URL}/api/v1/email-agent/campaigns/{campaign_id}/resume
 *
 * @param {string} campaignId - The UUID of the campaign
 * @returns {Promise<any>} Updated campaign object
 */
export const resumeCampaign = async (campaignId) => {
  try {
    if (!campaignId) throw new Error('Campaign ID is required to resume campaign');
    const url = `${API_ENDPOINTS.EMAIL_AGENT_CAMPAIGNS}/${encodeURIComponent(campaignId)}/resume`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
      },
    });

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      let errorMessage = 'Failed to resume campaign';
      if (data) {
        if (typeof data.detail === 'string') {
          errorMessage = data.detail;
        } else if (Array.isArray(data.detail)) {
          errorMessage = data.detail.map((d) => d.msg || JSON.stringify(d)).join(', ');
        } else if (data.message) {
          errorMessage = data.message;
        }
      }
      const error = new Error(errorMessage);
      error.status = response.status;
      error.data = data;
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error in resumeCampaign API:', error);
    throw error;
  }
};

/**
 * Delete Campaign API
 * Endpoint: DELETE http://192.168.29.201:8000/api/v1/email-agent/campaigns/{campaign_id}
 *
 * @param {string} campaignId - The UUID of the campaign
 * @returns {Promise<any>}
 */
export const deleteCampaign = async (campaignId) => {
  try {
    if (!campaignId) throw new Error('Campaign ID is required to delete campaign');
    const url = `${API_ENDPOINTS.EMAIL_AGENT_CAMPAIGNS}/${encodeURIComponent(campaignId)}`;
    const response = await fetch(url, {
      method: 'DELETE',
      headers: {
        'Accept': 'application/json',
      },
    });

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      let errorMessage = 'Failed to delete campaign';
      if (data) {
        if (typeof data.detail === 'string') {
          errorMessage = data.detail;
        } else if (Array.isArray(data.detail)) {
          errorMessage = data.detail.map((d) => d.msg || JSON.stringify(d)).join(', ');
        } else if (data.message) {
          errorMessage = data.message;
        }
      }
      const error = new Error(errorMessage);
      error.status = response.status;
      error.data = data;
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error in deleteCampaign API:', error);
    throw error;
  }
};

/**
 * Get Campaign Logs API
 * Endpoint: GET {BASE_URL}/api/v1/email-agent/campaigns/{campaign_id}/logs
 *
 * @param {string} campaignId - The UUID of the campaign
 * @returns {Promise<any>} Log page object with logs and metrics
 */
export const getCampaignLogs = async (campaignId, offset = 0, limit = 10) => {
  try {
    if (!campaignId) throw new Error('Campaign ID is required to fetch logs');
    const queryParams = new URLSearchParams();
    if (offset !== undefined && offset !== null) queryParams.append('offset', String(offset));
    if (limit !== undefined && limit !== null) queryParams.append('limit', String(limit));
    const queryString = queryParams.toString();
    const url = `${API_ENDPOINTS.EMAIL_AGENT_CAMPAIGNS}/${encodeURIComponent(campaignId)}/logs${queryString ? `?${queryString}` : ''}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      let errorMessage = 'Failed to fetch campaign logs';
      if (data) {
        if (typeof data.detail === 'string') {
          errorMessage = data.detail;
        } else if (Array.isArray(data.detail)) {
          errorMessage = data.detail.map((d) => d.msg || JSON.stringify(d)).join(', ');
        } else if (data.message) {
          errorMessage = data.message;
        }
      }
      const error = new Error(errorMessage);
      error.status = response.status;
      error.data = data;
      throw error;
    }

    if (data && Array.isArray(data.results) && data.results.length > 0 && typeof data.results[0] === 'object' && data.results[0] !== null) {
      const pageData = data.results[0];
      return {
        campaign_id: pageData.campaign_id || campaignId,
        total_recipients: Number(pageData.total_recipients ?? 0),
        sent_count: Number(pageData.sent_count ?? 0),
        pending_count: Number(pageData.pending_count ?? 0),
        received_count: Number(pageData.received_count ?? 0),
        first_sent_at: pageData.first_sent_at ?? null,
        last_sent_at: pageData.last_sent_at ?? null,
        count: Number(pageData.count ?? pageData.total_recipients ?? (pageData.logs ? pageData.logs.length : 0)),
        offset: Number(pageData.offset ?? offset),
        limit: Number(pageData.limit ?? limit),
        logs: Array.isArray(pageData.logs) ? pageData.logs : [],
      };
    }

    if (data && Array.isArray(data.logs)) {
      return {
        campaign_id: data.campaign_id || campaignId,
        total_recipients: Number(data.total_recipients ?? data.logs.length),
        sent_count: Number(data.sent_count ?? 0),
        pending_count: Number(data.pending_count ?? 0),
        received_count: Number(data.received_count ?? 0),
        first_sent_at: data.first_sent_at ?? null,
        last_sent_at: data.last_sent_at ?? null,
        count: Number(data.count ?? data.total_recipients ?? data.logs.length),
        offset: Number(data.offset ?? offset),
        limit: Number(data.limit ?? limit),
        logs: data.logs,
      };
    }

    if (Array.isArray(data)) {
      return {
        campaign_id: campaignId,
        total_recipients: data.length,
        sent_count: data.filter((l) => (l.message_status || l.status || '').toLowerCase().includes('sent')).length,
        pending_count: data.filter((l) => (l.message_status || l.status || '').toLowerCase().includes('pend')).length,
        received_count: 0,
        first_sent_at: null,
        last_sent_at: null,
        count: data.length,
        offset,
        limit,
        logs: data,
      };
    }

    return {
      campaign_id: campaignId,
      total_recipients: 0,
      sent_count: 0,
      pending_count: 0,
      received_count: 0,
      first_sent_at: null,
      last_sent_at: null,
      count: 0,
      offset,
      limit,
      logs: [],
    };
  } catch (error) {
    console.error('Error in getCampaignLogs API:', error);
    throw error;
  }
};

/**
 * Get Email Agent Templates API
 * Endpoint: GET http://192.168.29.201:8000/api/v1/email-agent/templates
 *
 * @returns {Promise<any[]>} Array of templates
 */
export const getTemplates = async () => {
  try {
    const response = await fetch(API_ENDPOINTS.EMAIL_AGENT_TEMPLATES, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      const errorMsg = data?.detail || data?.message || `Request failed with status ${response.status}`;
      const error = new Error(typeof errorMsg === 'string' ? errorMsg : JSON.stringify(errorMsg));
      error.status = response.status;
      error.data = data;
      throw error;
    }

    if (Array.isArray(data)) {
      return data;
    }
    if (data && Array.isArray(data.value)) {
      return data.value;
    }
    if (data && Array.isArray(data.results)) {
      return data.results;
    }
    return [];
  } catch (error) {
    console.error('Error in getTemplates API:', error);
    throw error;
  }
};

/**
 * Create Email Agent Template API
 * Endpoint: POST http://192.168.29.201:8000/api/v1/email-agent/templates
 * Expects multipart/form-data: name, purpose (initial|followup|registration), subject, html_file, active (boolean)
 *
 * @param {FormData|Object} templateData
 * @returns {Promise<any>}
 */
export const createTemplate = async (templateData) => {
  try {
    let body;
    if (templateData instanceof FormData) {
      body = templateData;
    } else {
      body = new FormData();
      body.append('name', templateData.name || '');
      body.append('subject', templateData.subject || '');
      if (templateData.purpose) {
        body.append('purpose', templateData.purpose);
      }
      body.append('active', templateData.active !== undefined ? String(templateData.active) : 'true');

      // Attach file as both docx_file and html_file for dual compatibility
      // (http://192.168.29.201:8000 expects docx_file, while https://api.kaizencon.in expects html_file)
      const isUpload = (file) => file instanceof File || file instanceof Blob;
      const docxCandidate = templateData.docx_file || templateData.file || templateData.doc_file;
      const htmlCandidate = templateData.html_file;

      if (isUpload(docxCandidate) && isUpload(htmlCandidate) && docxCandidate !== htmlCandidate) {
        body.append('docx_file', docxCandidate, docxCandidate.name || 'template.docx');
        body.append('html_file', htmlCandidate, htmlCandidate.name || 'template.html');
      } else {
        const file = isUpload(docxCandidate) ? docxCandidate : htmlCandidate;
        if (isUpload(file)) {
          const fileName = file.name || 'template.docx';
          const lowerName = String(fileName).toLowerCase();
          const isHtml = lowerName.endsWith('.html') || lowerName.endsWith('.htm') || file.type === 'text/html';
          if (isHtml) {
            body.append('html_file', file, fileName);
            body.append('docx_file', file, fileName);
          } else {
            body.append('docx_file', file, fileName);
            body.append('html_file', file, fileName);
          }
        }
      }

      if (typeof templateData.html_body === 'string' && templateData.html_body.trim()) {
        body.append('html_body', templateData.html_body);
      }
    }

    const response = await fetch(API_ENDPOINTS.EMAIL_AGENT_TEMPLATES, {
      method: 'POST',
      headers: {
        'Accept': '*/*',
      },
      body,
    });

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      let errorMessage = 'Failed to create template';
      if (data) {
        if (typeof data.detail === 'string') {
          errorMessage = data.detail;
        } else if (Array.isArray(data.detail)) {
          errorMessage = data.detail.map((d) => d.msg || JSON.stringify(d)).join(', ');
        } else if (data.message) {
          errorMessage = data.message;
        }
      }
      const error = new Error(errorMessage);
      error.status = response.status;
      error.data = data;
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error in createTemplate API:', error);
    throw error;
  }
};

/**
 * Update Email Agent Template API
 * Endpoint: PATCH http://192.168.29.201:8000/api/v1/email-agent/templates/{template_id}
 *
 * @param {string} templateId
 * @param {FormData|Object} updateData
 * @returns {Promise<any>}
 */
export const updateTemplate = async (templateId, updateData) => {
  try {
    let body;
    if (updateData instanceof FormData) {
      body = updateData;
    } else {
      body = new FormData();
      if (updateData.name !== undefined && updateData.name !== null) {
        body.append('name', updateData.name);
      }
      if (updateData.subject !== undefined && updateData.subject !== null) {
        body.append('subject', updateData.subject);
      }
      if (updateData.active !== undefined && updateData.active !== null) {
        body.append('active', String(updateData.active));
      }

      // Universal file attachment: Send across both docx_file and html_file
      // (FastAPI backend expects docx_file)
      const primaryDocx = updateData.docx_file || updateData.file || updateData.doc_file;
      if (primaryDocx instanceof File || primaryDocx instanceof Blob) {
        const fileName = primaryDocx.name || 'template.docx';
        body.append('docx_file', primaryDocx, fileName);
        body.append('html_file', primaryDocx, fileName);
      } else if (updateData.html_file instanceof File || updateData.html_file instanceof Blob) {
        const fileName = updateData.html_file.name || 'template.html';
        body.append('docx_file', updateData.html_file, fileName.endsWith('.docx') ? fileName : 'template.docx');
        body.append('html_file', updateData.html_file, fileName);
      }

      if (typeof updateData.html_body === 'string' && updateData.html_body.trim()) {
        body.append('html_body', updateData.html_body);
        if (!body.has('html_file')) {
          const blob = new Blob([updateData.html_body], { type: 'text/html' });
          body.append('html_file', blob, 'template.html');
        }
      }
    }

    const url = `${API_ENDPOINTS.EMAIL_AGENT_TEMPLATES}/${encodeURIComponent(templateId)}`;
    const response = await fetch(url, {
      method: 'PATCH',
      headers: {
        'Accept': 'application/json',
      },
      body,
    });

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      let errorMessage = 'Failed to update template';
      if (data) {
        if (typeof data.detail === 'string') {
          errorMessage = data.detail;
        } else if (Array.isArray(data.detail)) {
          errorMessage = data.detail.map((d) => d.msg || JSON.stringify(d)).join(', ');
        } else if (data.message) {
          errorMessage = data.message;
        }
      }
      const error = new Error(errorMessage);
      error.status = response.status;
      error.data = data;
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error in updateTemplate API:', error);
    throw error;
  }
};

/**
 * Delete Email Agent Template API
 * Endpoint: DELETE http://192.168.29.201:8000/api/v1/email-agent/templates/{template_id}
 *
 * @param {string} templateId - UUID of the template to delete
 * @returns {Promise<any>}
 */
export const deleteTemplate = async (templateId) => {
  try {
    if (!templateId) {
      throw new Error('Template ID is required for deletion');
    }

    const url = `${API_ENDPOINTS.EMAIL_AGENT_TEMPLATES}/${encodeURIComponent(templateId)}`;
    const response = await fetch(url, {
      method: 'DELETE',
      headers: {
        'Accept': 'application/json',
      },
    });

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      let errorMessage = 'Failed to delete template';
      if (data) {
        if (typeof data.detail === 'string') {
          errorMessage = data.detail;
        } else if (Array.isArray(data.detail)) {
          errorMessage = data.detail.map((d) => d.msg || JSON.stringify(d)).join(', ');
        } else if (data.message) {
          errorMessage = data.message;
        }
      }
      const error = new Error(errorMessage || `Request failed with status ${response.status}`);
      error.status = response.status;
      error.data = data;
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error in deleteTemplate API:', error);
    throw error;
  }
};


/**
 * Preview Email Agent Template API
 * Endpoint: POST http://192.168.29.201:8000/api/v1/email-agent/templates/{template_id}/preview?name={name}
 *
 * @param {string} templateId
 * @param {string} [name='Dr. Example']
 * @returns {Promise<any>}
 */
export const previewTemplate = async (templateId, name = 'Dr. Example') => {
  try {
    const url = `${API_ENDPOINTS.EMAIL_AGENT_TEMPLATES}/${encodeURIComponent(templateId)}/preview?name=${encodeURIComponent(name)}`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
      },
    });

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      const errorMsg = data?.detail || data?.message || `Failed to preview template (${response.status})`;
      const error = new Error(typeof errorMsg === 'string' ? errorMsg : JSON.stringify(errorMsg));
      error.status = response.status;
      error.data = data;
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error in previewTemplate API:', error);
    throw error;
  }
};

/**
 * Create Live Poll API
 * Endpoint: POST http://192.168.29.201:8000/polling/api/admin/polls
 * Header: x-admin-api-key
 * Request: { question: string, options: string[] }
 * Response (201): { id, question, options: [{ id, text, votes }], is_active, poll_url, qr_code_url }
 */
export const createPoll = async (pollData) => {
  try {
    const adminApiKey =
      (typeof import.meta !== 'undefined' && import.meta.env && (import.meta.env.VITE_POLL_KEY || import.meta.env.POLL_KEY)) ||
      '5IZNL1TLAMwzGOeHZudBXjsFkkWU5yuY3_VzJxeBXu1rv6EWWFLelJeujiIxKvEY';

    const headers = {
      'Content-Type': 'application/json',
      'accept': '*/*',
    };

    if (adminApiKey) {
      headers['x-admin-api-key'] = adminApiKey;
    }

    const payload = {
      question: pollData.question,
      options: pollData.options,
    };

    const response = await fetch(`${BASE_URL}/polling/api/admin/polls`, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      let errorMessage = `Failed to create poll: ${response.status} ${response.statusText}`;
      try {
        const errorData = await response.json();
        if (errorData.detail) {
          if (Array.isArray(errorData.detail)) {
            errorMessage = errorData.detail.map((d) => d.msg || d.loc?.join('.') || JSON.stringify(d)).join(', ');
          } else {
            errorMessage = errorData.detail;
          }
        } else if (errorData.message) {
          errorMessage = errorData.message;
        }
      } catch (_) {}
      throw new Error(errorMessage);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error in createPoll API:', error);
    throw error;
  }
};

/**
 * Get Admin Polls API
 * Endpoint: GET http://192.168.29.201:8000/polling/api/admin/polls
 * Header: x-admin-api-key
 * Returns: Array of { id, question, options: [{ id, text, votes }], is_active, poll_url, qr_code_url }
 */
export const getAdminPolls = async () => {
  try {
    const adminApiKey =
      (typeof import.meta !== 'undefined' && import.meta.env && (import.meta.env.VITE_POLL_KEY || import.meta.env.POLL_KEY)) ||
      '5IZNL1TLAMwzGOeHZudBXjsFkkWU5yuY3_VzJxeBXu1rv6EWWFLelJeujiIxKvEY';

    const headers = {
      'accept': 'application/json',
    };
    if (adminApiKey) {
      headers['x-admin-api-key'] = adminApiKey;
    }

    const response = await fetch(`${BASE_URL}/polling/api/admin/polls`, {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      let errorMessage = `Failed to fetch polls: ${response.status} ${response.statusText}`;
      try {
        const errorData = await response.json();
        if (errorData.detail) {
          if (Array.isArray(errorData.detail)) {
            errorMessage = errorData.detail.map((d) => d.msg || d.loc?.join('.') || JSON.stringify(d)).join(', ');
          } else {
            errorMessage = errorData.detail;
          }
        }
      } catch (_) {}
      throw new Error(errorMessage);
    }

    const data = await response.json();
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error('Error in getAdminPolls API:', error);
    throw error;
  }
};

/**
 * Delete Poll API
 * Endpoint: DELETE /polling/api/admin/polls/{poll_id}
 * Header: x-admin-api-key
 * @param {number|string} pollId - Poll ID to delete
 * @returns {Promise<any>}
 */
export const deletePoll = async (pollId) => {
  try {
    const id = Number(pollId);
    if (!id || isNaN(id)) {
      throw new Error(`Invalid poll ID: ${pollId}`);
    }

    const adminApiKey =
      (typeof import.meta !== 'undefined' && import.meta.env && (import.meta.env.VITE_POLL_KEY || import.meta.env.POLL_KEY)) ||
      '5IZNL1TLAMwzGOeHZudBXjsFkkWU5yuY3_VzJxeBXu1rv6EWWFLelJeujiIxKvEY';

    const headers = {
      'accept': 'application/json',
    };
    if (adminApiKey) {
      headers['x-admin-api-key'] = adminApiKey;
    }

    const response = await fetch(`${BASE_URL}/polling/api/admin/polls/${id}`, {
      method: 'DELETE',
      headers,
    });

    if (!response.ok) {
      let errorMessage = `Failed to delete poll: ${response.status} ${response.statusText}`;
      try {
        const errorData = await response.json();
        if (errorData.detail) {
          errorMessage = typeof errorData.detail === 'string' ? errorData.detail : JSON.stringify(errorData.detail);
        } else if (errorData.message) {
          errorMessage = errorData.message;
        }
      } catch (_) {}
      throw new Error(errorMessage);
    }

    const data = await response.json().catch(() => ({ success: true }));
    return data;
  } catch (error) {
    console.error('Error in deletePoll API:', error);
    throw error;
  }
};

/**
 * Vote in Poll API
 * Endpoint: POST http://192.168.29.201:8000/polling/api/polls/{poll_id}/vote
 * Body: { option_id: number, delegate_id: number }
 */
export const votePoll = async (pollId, optionId, delegateId = null) => {
  try {
    const payload = {
      option_id: Number(optionId),
    };
    if (delegateId) {
      payload.delegate_id = Number(delegateId);
    } else {
      const stored = typeof localStorage !== 'undefined'
        ? (localStorage.getItem('ignito_delegate_id') || localStorage.getItem('delegate_id'))
        : null;
      payload.delegate_id = stored ? Number(stored) : 99;
    }

    const response = await fetch(`${BASE_URL}/polling/api/polls/${pollId}/vote`, {
      method: 'POST',
      headers: bearerHeaders({
        'Content-Type': 'application/json',
        'accept': 'application/json',
      }),
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      handleUnauthorized(response);
      let errorMessage = `Failed to submit vote: ${response.status}`;
      try {
        const errorData = await response.json();
        if (errorData.detail) {
          errorMessage = typeof errorData.detail === 'string'
            ? errorData.detail
            : JSON.stringify(errorData.detail);
        }
      } catch (_) {}
      throw new Error(errorMessage);
    }

    return await response.json();
  } catch (error) {
    console.error('Error in votePoll API:', error);
    throw error;
  }
};

/**
 * Get WebSocket URL for Live Polling
 * @param {string} [sessionId]
 * @returns {string}
 */
export const getPollsWsUrl = (sessionId = QA_DEFAULT_SESSION_ID) => {
  let url;
  if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_POLL_WS_URL) {
    url = import.meta.env.VITE_POLL_WS_URL;
  } else {
    const sid = sessionId || QA_DEFAULT_SESSION_ID;
    const wsBase = (BASE_URL || 'http://192.168.29.201:8000').replace(/^http(s?):/, 'ws$1:');
    url = `${wsBase}/api/sessions/${sid}/ws?role=moderator`;
  }
  return appendAccessToken(url);
};

/**
 * Active polls
 * Endpoint: GET /polling/api/polls/active
 * Header: Authorization: Bearer <access_token>
 */
export const getActivePolls = async () => {
  try {
    const response = await fetch(`${BASE_URL}/polling/api/polls/active`, {
      method: 'GET',
      headers: bearerHeaders({
        Accept: 'application/json',
      }),
    });

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      handleUnauthorized(response);
      let errorMessage = `Failed to fetch active polls: ${response.status}`;
      if (data) {
        if (typeof data.detail === 'string') errorMessage = data.detail;
        else if (Array.isArray(data.detail)) {
          errorMessage = data.detail.map((d) => d.msg || JSON.stringify(d)).join(', ');
        } else if (data.message) errorMessage = data.message;
      }
      throw new Error(errorMessage);
    }

    if (Array.isArray(data)) return data;
    if (data && Array.isArray(data.results)) return data.results;
    if (data && data.id) return [data];
    return [];
  } catch (error) {
    console.error('Error in getActivePolls API:', error);
    throw error;
  }
};

/**
 * Get Poll and its current results (Live Poll API)
 * Endpoint: GET http://192.168.29.201:8000/polling/api/polls/{poll_id}
 *
 * Parameters:
 *   poll_id: number | string (integer required)
 *
 * Expected Response Structure (200):
 * {
 *   "id": 1,
 *   "question": "string",
 *   "options": [
 *     { "id": 1, "text": "string", "votes": 0 }
 *   ],
 *   "is_active": true
 * }
 *
 * @param {number|string} pollId - The ID of the poll to fetch
 * @returns {Promise<any>}
 */
export const getPollById = async (pollId) => {
  try {
    const id = Number(pollId);
    if (isNaN(id)) {
      throw new Error(`Invalid poll ID: ${pollId}`);
    }

    const response = await fetch(`${BASE_URL}/polling/api/polls/${id}`, {
      method: 'GET',
      headers: bearerHeaders({
        Accept: 'application/json',
      }),
    });

    if (!response.ok) {
      handleUnauthorized(response);
      let errorMessage = `Failed to get live poll: ${response.status} ${response.statusText}`;
      try {
        const errorData = await response.json();
        if (errorData.detail) {
          if (Array.isArray(errorData.detail)) {
            errorMessage = errorData.detail.map((d) => d.msg || JSON.stringify(d)).join(', ');
          } else if (typeof errorData.detail === 'string') {
            errorMessage = errorData.detail;
          } else {
            errorMessage = JSON.stringify(errorData.detail);
          }
        }
      } catch (_) {}
      throw new Error(errorMessage);
    }

    return await response.json();
  } catch (error) {
    console.error('Error in getPollById API:', error);
    throw error;
  }
};

// Alias for convenience
export const getLivePoll = getPollById;

/**
 * Unified Polling API:
 * - When fetching the list: call without ID: getPolls() -> calls GET /polling/api/admin/polls
 * - When showing results of a current poll: call with ID: getPolls(pollId) -> calls GET /polling/api/polls/{poll_id}
 *
 * @param {number|string} [pollId] - Optional ID. Omit to fetch listing, pass ID to get current poll results.
 * @returns {Promise<any>}
 */
export const getPolls = async (pollId = null) => {
  if (pollId !== null && pollId !== undefined && String(pollId).trim() !== '') {
    // Show results for current poll (Passing ID)
    return await getPollById(pollId);
  } else {
    // List all polls for dashboard (Do NOT pass ID)
    return await getAdminPolls();
  }
};

export const getPollsApi = getPolls;

/**
 * Get Poll QR Code Image URL
 * Endpoint: GET http://192.168.29.201:8000/polling/api/polls/{poll_id}/qr
 * Returns a PNG QR code image.
 *
 * @param {number|string} pollId - Poll ID
 * @returns {string} Direct URL to the PNG image
 */
export const getPollQrCodeUrl = (pollId) => {
  const id = Number(pollId);
  return `${BASE_URL}/polling/api/polls/${id}/qr`;
};

/**
 * Download Poll QR Code as a PNG file directly in the browser
 * Endpoint: GET http://192.168.29.201:8000/polling/api/polls/{poll_id}/qr
 *
 * @param {number|string} pollId - Poll ID
 * @param {string} [filename] - Optional filename
 */
export const downloadPollQrCode = async (pollId, filename = null) => {
  try {
    const id = Number(pollId);
    const url = getPollQrCodeUrl(id);
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch QR code image: ${response.status}`);
    }
    const blob = await response.blob();
    const blobUrl = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = blobUrl;
    a.download = filename || `kaizen-con-poll-${id}-qr.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(blobUrl);
    return true;
  } catch (error) {
    console.error('Error downloading QR code:', error);
    throw error;
  }
};

export const QA_DEFAULT_SESSION_ID = '00000000-0000-0000-0000-000000000001';
export const QA_WS_URL = `wss://api.kaizencon.in/api/sessions/${QA_DEFAULT_SESSION_ID}/ws?role=moderator`;

const unwrapQuestionList = (data) => {
  if (Array.isArray(data)) return data;
  if (data && Array.isArray(data.questions)) return data.questions;
  if (data && Array.isArray(data.results)) return data.results;
  if (data && data.id) return [data];
  return [];
};

/**
 * List session questions
 * Endpoint: GET /api/sessions/{session_id}/questions
 * Header: Authorization: Bearer <access_token>
 */
export const getSessionQuestions = async (sessionId) => {
  const targetSession = sessionId || QA_DEFAULT_SESSION_ID;
  const url = appendAccessToken(`${API_BASE_URL}/sessions/${targetSession}/questions`);
  const response = await fetch(url, {
    method: 'GET',
    headers: bearerHeaders({ Accept: 'application/json' }),
  });
  const data = await response.json().catch(() => null);
  if (!response.ok) {
    handleUnauthorized(response);
    const errorMsg = data?.detail || data?.message || `Failed to load questions: ${response.status}`;
    throw new Error(typeof errorMsg === 'string' ? errorMsg : JSON.stringify(errorMsg));
  }
  return unwrapQuestionList(data);
};

/**
 * Get one session question
 * Endpoint: GET /api/sessions/{session_id}/questions/{question_id}
 * Header: Authorization: Bearer <access_token>
 */
export const getSessionQuestion = async (sessionId, questionId) => {
  const targetSession = sessionId || QA_DEFAULT_SESSION_ID;
  const url = appendAccessToken(
    `${API_BASE_URL}/sessions/${targetSession}/questions/${encodeURIComponent(questionId)}`
  );
  const response = await fetch(url, {
    method: 'GET',
    headers: bearerHeaders({ Accept: 'application/json' }),
  });
  const data = await response.json().catch(() => null);
  if (!response.ok) {
    handleUnauthorized(response);
    const errorMsg = data?.detail || data?.message || `Failed to load question: ${response.status}`;
    throw new Error(typeof errorMsg === 'string' ? errorMsg : JSON.stringify(errorMsg));
  }
  if (data && Array.isArray(data.results) && data.results.length > 0) return data.results[0];
  return data;
};

/**
 * Delete one session question
 * Endpoint: DELETE /api/sessions/{session_id}/questions/{question_id}
 * Header: Authorization: Bearer <access_token>
 */
export const deleteSessionQuestion = async (sessionId, questionId) => {
  const targetSession = sessionId || QA_DEFAULT_SESSION_ID;
  const url = appendAccessToken(
    `${API_BASE_URL}/sessions/${targetSession}/questions/${encodeURIComponent(questionId)}`
  );
  const response = await fetch(url, {
    method: 'DELETE',
    headers: bearerHeaders({ Accept: 'application/json' }),
  });
  const data = await response.json().catch(() => null);
  if (!response.ok) {
    handleUnauthorized(response);
    const errorMsg = data?.detail || data?.message || `Failed to delete question: ${response.status}`;
    throw new Error(typeof errorMsg === 'string' ? errorMsg : JSON.stringify(errorMsg));
  }
  return data || { success: true };
};

export const approveQuestionApi = async (sessionId, questionId) => {
  const targetSession = sessionId || QA_DEFAULT_SESSION_ID;
  const url = appendAccessToken(
    `${API_BASE_URL}/sessions/${targetSession}/questions/${questionId}/approve`
  );
  const response = await fetch(url, {
    method: 'POST',
    headers: bearerHeaders({
      Accept: 'application/json',
      'Content-Type': 'application/json',
    }),
  });
  if (!response.ok) {
    const data = await response.json().catch(() => null);
    handleUnauthorized(response);
    const errorMsg = data?.detail || data?.message || `Failed to approve question: ${response.status}`;
    throw new Error(typeof errorMsg === 'string' ? errorMsg : JSON.stringify(errorMsg));
  }
  return await response.json();
};

export const rejectQuestionApi = async (sessionId, questionId) => {
  const targetSession = sessionId || QA_DEFAULT_SESSION_ID;
  const url = appendAccessToken(
    `${API_BASE_URL}/sessions/${targetSession}/questions/${questionId}/reject`
  );
  const response = await fetch(url, {
    method: 'POST',
    headers: bearerHeaders({
      Accept: 'application/json',
      'Content-Type': 'application/json',
    }),
  });
  if (!response.ok) {
    const data = await response.json().catch(() => null);
    handleUnauthorized(response);
    const errorMsg = data?.detail || data?.message || `Failed to reject question: ${response.status}`;
    throw new Error(typeof errorMsg === 'string' ? errorMsg : JSON.stringify(errorMsg));
  }
  return await response.json();
};

/**
 * Get WebSocket URL for Live Q&A session
 * @param {string} [sessionId]
 * @returns {string}
 */
export const getQaWsUrl = (sessionId = QA_DEFAULT_SESSION_ID) => {
  const sid = sessionId || QA_DEFAULT_SESSION_ID;
  const wsBase = (BASE_URL || 'https://api.kaizencon.in').replace(/^http(s?):/, 'ws$1:');
  return appendAccessToken(`${wsBase}/api/sessions/${sid}/ws?role=moderator`);
};

/**
 * Get All Live Sessions API
 * Endpoint: GET /api/sessions
 * @returns {Promise<any[]>}
 */
export const getLiveSessions = async () => {
  try {
    const response = await fetch(API_ENDPOINTS.SESSIONS, {
      method: 'GET',
      headers: bearerHeaders({ Accept: 'application/json' }),
    });

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      const errorMsg = data?.detail || data?.message || `Request failed with status ${response.status}`;
      throw new Error(typeof errorMsg === 'string' ? errorMsg : JSON.stringify(errorMsg));
    }

    if (Array.isArray(data)) {
      return data;
    }
    if (data && Array.isArray(data.results)) {
      return data.results;
    }
    return data || [];
  } catch (error) {
    console.error('Error in getLiveSessions API:', error);
    throw error;
  }
};

/**
 * Create Live Session API
 * Endpoint: POST /api/sessions
 * @param {Object} sessionData - { title, speaker_name, category?, venue?, start_time?, end_time? }
 * @returns {Promise<any>}
 */
export const createLiveSession = async (sessionData) => {
  try {
    const response = await fetch(API_ENDPOINTS.SESSIONS, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(sessionData),
    });

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      const errorMsg = data?.detail || data?.message || `Request failed with status ${response.status}`;
      throw new Error(typeof errorMsg === 'string' ? errorMsg : JSON.stringify(errorMsg));
    }

    return data;
  } catch (error) {
    console.error('Error in createLiveSession API:', error);
    throw error;
  }
};

/**
 * Start Live Session API
 * Endpoint: POST /api/sessions/{session_id}/start
 * @param {string} sessionId
 * @returns {Promise<any>}
 */
export const startLiveSession = async (sessionId) => {
  try {
    const response = await fetch(`${API_ENDPOINTS.SESSIONS}/${sessionId}/start`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
      },
    });

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      const errorMsg = data?.detail || data?.message || `Request failed with status ${response.status}`;
      throw new Error(typeof errorMsg === 'string' ? errorMsg : JSON.stringify(errorMsg));
    }

    return data;
  } catch (error) {
    console.error('Error in startLiveSession API:', error);
    throw error;
  }
};

/**
 * End Live Session API
 * Endpoint: POST /api/sessions/{session_id}/end
 * @param {string} sessionId
 * @returns {Promise<any>}
 */
export const endLiveSession = async (sessionId) => {
  try {
    const response = await fetch(`${API_ENDPOINTS.SESSIONS}/${sessionId}/end`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
      },
    });

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      const errorMsg = data?.detail || data?.message || `Request failed with status ${response.status}`;
      throw new Error(typeof errorMsg === 'string' ? errorMsg : JSON.stringify(errorMsg));
    }

    return data;
  } catch (error) {
    console.error('Error in endLiveSession API:', error);
    throw error;
  }
};

/**
 * Format bytes to readable string (e.g. 2.45 MB)
 */
export const formatFileSize = (bytes) => {
  if (!bytes || bytes <= 0) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return (bytes / Math.pow(1024, i)).toFixed(2) + " " + units[i];
};

/**
 * Extract filename from Content-Disposition header
 */
export const extractFilenameFromDisposition = (disposition, fallback = "Kaizencon_2027_Brochure.pdf") => {
  if (!disposition) return fallback;
  const starMatch = disposition.match(/filename\*=UTF-8''([^;]+)/i);
  if (starMatch && starMatch[1]) {
    try {
      return decodeURIComponent(starMatch[1].trim());
    } catch {
      return starMatch[1].trim();
    }
  }
  const match = disposition.match(/filename=["']?([^"';]+)["']?/i);
  if (match && match[1]) {
    return match[1].trim();
  }
  return fallback;
};

/**
 * Upload Brochure API
 * Endpoint: POST /api/brochure/upload
 * Content-Type: multipart/form-data
 * Field: file (PDF, max 25 MB)
 *
 * @param {File|Blob} file - PDF file to upload
 * @param {Function} [onProgress] - Optional upload progress callback (percent: number)
 * @returns {Promise<any>}
 */
export const uploadBrochure = async (file, onProgress) => {
  if (!file) {
    throw new Error("Please select a PDF file to upload.");
  }

  const isPdf = file.type === "application/pdf" || (file.name && file.name.toLowerCase().endsWith(".pdf"));
  if (!isPdf) {
    const error = new Error("Only PDF files are supported.");
    error.status = 415;
    throw error;
  }

  const MAX_SIZE = 25 * 1024 * 1024;
  if (file.size > MAX_SIZE) {
    const error = new Error("Maximum file size is 25 MB.");
    error.status = 413;
    throw error;
  }

  const formData = new FormData();
  formData.append("file", file);

  if (typeof onProgress === "function") {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open("POST", API_ENDPOINTS.BROCHURE_UPLOAD);
      xhr.setRequestHeader("Accept", "application/json");

      const token = localStorage.getItem("ignito_auth_token");
      if (token) {
        xhr.setRequestHeader("Authorization", "Bearer " + token);
      }

      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) {
          const percent = Math.round((e.loaded / e.total) * 100);
          onProgress(percent);
        }
      };

      xhr.onload = () => {
        let data = null;
        try {
          data = JSON.parse(xhr.responseText);
        } catch {
          data = xhr.responseText;
        }

        if (xhr.status >= 200 && xhr.status < 300) {
          resolve(data);
        } else {
          let msg = "Failed to upload brochure.";
          if (xhr.status === 400) msg = "The uploaded file is not a valid PDF.";
          else if (xhr.status === 409) msg = "A brochure already exists.";
          else if (xhr.status === 413) msg = "Maximum file size is 25 MB.";
          else if (xhr.status === 415) msg = "Only PDF files are supported.";
          else if (xhr.status === 422) {
            if (data && data.detail) {
              msg = typeof data.detail === "string" ? data.detail : (data.detail[0] && data.detail[0].msg ? data.detail[0].msg : JSON.stringify(data.detail));
            } else {
              msg = "Validation error occurred during upload.";
            }
          } else if (data && data.detail) {
            msg = typeof data.detail === "string" ? data.detail : (data.detail[0] && data.detail[0].msg ? data.detail[0].msg : msg);
          } else if (data && data.message) {
            msg = data.message;
          }

          const error = new Error(msg);
          error.status = xhr.status;
          error.data = data;
          reject(error);
        }
      };

      xhr.onerror = () => {
        const error = new Error("Network error during brochure upload. Please check your connection.");
        error.status = 0;
        reject(error);
      };

      xhr.send(formData);
    });
  }

  const headers = { Accept: "application/json" };
  const token = localStorage.getItem("ignito_auth_token");
  if (token) {
    headers["Authorization"] = "Bearer " + token;
  }

  const response = await fetch(API_ENDPOINTS.BROCHURE_UPLOAD, {
    method: "POST",
    headers,
    body: formData,
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    let msg = "Failed to upload brochure.";
    if (response.status === 400) msg = "The uploaded file is not a valid PDF.";
    else if (response.status === 409) msg = "A brochure already exists.";
    else if (response.status === 413) msg = "Maximum file size is 25 MB.";
    else if (response.status === 415) msg = "Only PDF files are supported.";
    else if (response.status === 422) {
      if (data && data.detail) {
        msg = typeof data.detail === "string" ? data.detail : (data.detail[0] && data.detail[0].msg ? data.detail[0].msg : JSON.stringify(data.detail));
      } else {
        msg = "Validation error occurred during upload.";
      }
    } else if (data && data.detail) {
      msg = typeof data.detail === "string" ? data.detail : (data.detail[0] && data.detail[0].msg ? data.detail[0].msg : msg);
    } else if (data && data.message) {
      msg = data.message;
    }

    const error = new Error(msg);
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
};

/**
 * Download / Fetch Current Brochure Blob API
 * Endpoint: GET /api/brochure/download
 *
 * @returns {Promise<{ blob: Blob, filename: string, size: number, url: string } | null>}
 */
export const downloadBrochure = async () => {
  const headers = {};
  const token = localStorage.getItem("ignito_auth_token");
  if (token) {
    headers["Authorization"] = "Bearer " + token;
  }

  const response = await fetch(API_ENDPOINTS.BROCHURE_DOWNLOAD, {
    method: "GET",
    headers,
  });

  if (response.status === 404) {
    return null;
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    const msg = errorData && (errorData.detail || errorData.message) ? (errorData.detail || errorData.message) : "Failed to fetch brochure (HTTP " + response.status + ")";
    const error = new Error(msg);
    error.status = response.status;
    error.data = errorData;
    throw error;
  }

  const disposition = response.headers.get("content-disposition");
  const filename = extractFilenameFromDisposition(disposition, "Kaizencon_2027_Brochure.pdf");
  const blob = await response.blob();
  const size = blob.size || Number(response.headers.get("content-length")) || 0;
  const url = URL.createObjectURL(blob);

  return {
    blob,
    filename,
    size,
    url,
  };
};

/**
 * Delete Current Brochure API
 * Endpoint: DELETE /api/brochure/delete
 *
 * @returns {Promise<any>}
 */
export const deleteBrochure = async () => {
  const headers = { Accept: "application/json" };
  const token = localStorage.getItem("ignito_auth_token");
  if (token) {
    headers["Authorization"] = "Bearer " + token;
  }

  const response = await fetch(API_ENDPOINTS.BROCHURE_DELETE, {
    method: "DELETE",
    headers,
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const msg = data && (data.detail || data.message) ? (data.detail || data.message) : "Failed to delete brochure.";
    const error = new Error(msg);
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
};

/**
 * Synchronize database with KAi Knowledge Base
 * Endpoint: POST /api/knowledge/sync-db
 *
 * @returns {Promise<any>}
 */
export const syncKnowledgeDb = async () => {
  try {
    const headers = { Accept: 'application/json' };
    const token = localStorage.getItem('ignito_auth_token');
    if (token) {
      headers['Authorization'] = 'Bearer ' + token;
    }

    const response = await fetch(API_ENDPOINTS.KNOWLEDGE_SYNC_DB, {
      method: 'POST',
      headers,
    });

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      const errorMsg = data?.detail || data?.message || `Sync database failed with status ${response.status}`;
      throw new Error(typeof errorMsg === 'string' ? errorMsg : JSON.stringify(errorMsg));
    }

    return data;
  } catch (error) {
    console.error('Error in syncKnowledgeDb API:', error);
    throw error;
  }
};

/**
 * Fetch knowledge documents from API
 * Endpoint: GET /api/knowledge/documents
 *
 * @returns {Promise<any>}
 */
export const getKnowledgeDocuments = async () => {
  try {
    const headers = { Accept: 'application/json' };
    const token = localStorage.getItem('ignito_auth_token');
    if (token) {
      headers['Authorization'] = 'Bearer ' + token;
    }

    const response = await fetch(API_ENDPOINTS.KNOWLEDGE_DOCUMENTS, {
      method: 'GET',
      headers,
    });

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      const errorMsg = data?.detail || data?.message || `Failed to fetch documents with status ${response.status}`;
      throw new Error(typeof errorMsg === 'string' ? errorMsg : JSON.stringify(errorMsg));
    }

    return data;
  } catch (error) {
    console.error('Error in getKnowledgeDocuments API:', error);
    throw error;
  }
};

/**
 * Upload knowledge document to KAi knowledge base
 * Endpoint: POST /api/knowledge/documents/upload
 * Content-Type: multipart/form-data
 * Field: file
 *
 * @param {File|Blob} file
 * @returns {Promise<any>}
 */
export const uploadKnowledgeDocument = async (file) => {
  try {
    if (!file) {
      throw new Error('Please select a file to upload.');
    }

    const headers = { Accept: 'application/json' };
    const token = localStorage.getItem('ignito_auth_token');
    if (token) {
      headers['Authorization'] = 'Bearer ' + token;
    }

    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(API_ENDPOINTS.KNOWLEDGE_DOCUMENT_UPLOAD, {
      method: 'POST',
      headers,
      body: formData,
    });

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      const errorMsg = data?.detail || data?.message || `Upload failed with status ${response.status}`;
      throw new Error(typeof errorMsg === 'string' ? errorMsg : JSON.stringify(errorMsg));
    }

    return data;
  } catch (error) {
    console.error('Error in uploadKnowledgeDocument API:', error);
    throw error;
  }
};

/**
 * Delete a knowledge document
 * Endpoint: DELETE /api/knowledge/documents/{document_id}
 *
 * @param {string|number} documentId
 * @returns {Promise<any>}
 */
export const deleteKnowledgeDocument = async (documentId) => {
  try {
    const headers = { Accept: 'application/json' };
    const token = localStorage.getItem('ignito_auth_token');
    if (token) {
      headers['Authorization'] = 'Bearer ' + token;
    }

    const response = await fetch(`${API_ENDPOINTS.KNOWLEDGE_DOCUMENTS}/${documentId}`, {
      method: 'DELETE',
      headers,
    });

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      const errorMsg = data?.detail || data?.message || `Failed to delete document with status ${response.status}`;
      throw new Error(typeof errorMsg === 'string' ? errorMsg : JSON.stringify(errorMsg));
    }

    return data;
  } catch (error) {
    console.error('Error in deleteKnowledgeDocument API:', error);
    throw error;
  }
};

/**
 * Generate Clinical Summary from transcript text
 * Endpoint: POST /api/clinical/summary
 * @param {string} transcript - Full transcript text
 * @returns {Promise<any>}
 */
export const generateClinicalSummary = async (transcript) => {
  try {
    const response = await fetch(API_ENDPOINTS.CLINICAL_SUMMARY, {
      method: "POST",
      headers: {
        "Accept": "*/*",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ transcript }),
    });

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      const errMsg =
        data?.detail ||
        data?.error_message ||
        data?.message ||
        "Failed to generate clinical summary";
      throw new Error(typeof errMsg === "string" ? errMsg : JSON.stringify(errMsg));
    }

    return data;
  } catch (error) {
    console.error("Error in generateClinicalSummary API:", error);
    throw error;
  }
};

export default {
  BASE_URL,
  API_BASE_URL,
  Baase_url,
  Base_url,
  API_ENDPOINTS,
  adminLogin,
  getDelegates,
  saveDelegate,
  deleteDelegate,
  getSpeakers,
  saveSpeaker,
  deleteSpeaker,
  getSessions,
  getSessionById,
  createSession,
  deleteSession,
  getSessionFeedback,
  sendNotification,
  getNotifications,
  getSchedules,
  getScheduleById,
  saveSchedule,
  deleteSchedule,
  getEmailAgentContacts,
  getAllEmailAgentContacts,
  stopContact,
  importExcelContacts,
  getCampaigns,
  createCampaign,
  approveCampaign,
  startCampaign,
  stopCampaign,
  pauseCampaign,
  resumeCampaign,
  getCampaignLogs,
  getTemplates,
  createTemplate,
  updateTemplate,
  deleteTemplate,
  previewTemplate,
  createPoll,
  getAdminPolls,
  deletePoll,
  votePoll,
  getActivePolls,
  getPollById,
  getLivePoll,
  getPolls,
  getPollQrCodeUrl,
  downloadPollQrCode,
  getPollsWsUrl,
  getSessionQuestions,
  getSessionQuestion,
  deleteSessionQuestion,
  approveQuestionApi,
  rejectQuestionApi,
  getQaWsUrl,
  getLiveSessions,
  createLiveSession,
  startLiveSession,
  endLiveSession,
  formatFileSize,
  extractFilenameFromDisposition,
  uploadBrochure,
  downloadBrochure,
  deleteBrochure,
  syncKnowledgeDb,
  getKnowledgeDocuments,
  uploadKnowledgeDocument,
  deleteKnowledgeDocument,
  generateClinicalSummary,
};