// Base API Configuration
// export const BASE_URL = 'http://192.168.29.201:8000';
export const BASE_URL = 'https://34g3qd2p-8000.inc1.devtunnels.ms';
export const API_BASE_URL = `${BASE_URL}/api`;

// API Endpoints
export const API_ENDPOINTS = {
  SPEAKERS: `${API_BASE_URL}/speakers`,
  SCHEDULES: `${API_BASE_URL}/schedules`,
  KNOWLEDGE_CHAT: 'https://kaizencondemo2027-1.onrender.com/api/knowledge/chat',
  EMAIL_AGENT_CONTACTS: `${BASE_URL}/api/v1/email-agent/contacts`,
};

/**
 * Helper to get the full image URL from relative media paths
 * @param {string} imagePath - Relative path like "/uploads/speakers/..."
 * @returns {string} Full URL or placeholder if empty
 */
export const getImageUrl = (imagePath) => {
  if (!imagePath) return '';
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }
  return `${BASE_URL}${imagePath.startsWith('/') ? '' : '/'}${imagePath}`;
};

/**
 * Fetch speakers list from API
 * Endpoint: GET http://192.168.29.201:8000/api/speakers
 *
 * Expected Response Structure:
 * {
 *   code: 200,
 *   message: "Request successful",         
 *   results: [ ...speakerObjects ],
 *   isUser: true
 * }
 *
 * @returns {Promise<Array>} List of speaker objects from results array
 */
export const getSpeakers = async () => {
  try {
    const response = await fetch(API_ENDPOINTS.SPEAKERS, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch speakers. HTTP status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching speakers in getSpeakers:', error);
    throw error;
  }
};

/**
 * Fetch schedules / event sessions from API
 * Endpoint: GET http://192.168.29.201:8000/api/schedules
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
 *       description: "Evidence-based approaches to cardiovascular risk reduction.",
 *       event_date: "2027-01-01",
 *       start_time: "09:00:00",
 *       end_time: "10:00:00",
 *       venue: "RK Hospital Conference Hall",
 *       room: "Hall A"
 *     },
 *     ...
 *   ],
 *   isUser: true
 * }
 *
 * @param {Object} [params] - Optional query parameters (e.g. { category, event_date, speaker_id })
 * @returns {Promise<Object>} API response containing results array of schedule items
 */
export const getSchedules = async (params = {}) => {
  try {
    let url = API_ENDPOINTS.SCHEDULES;

    if (params && Object.keys(params).length > 0) {
      const queryParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          queryParams.append(key, value);
        }
      });
      const queryString = queryParams.toString();
      if (queryString) {
        url = `${url}?${queryString}`;
      }
    }

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch schedules. HTTP status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching schedules in getSchedules:', error);
    throw error;
  }
};

/**
 * Call the KaizenCon AI Knowledge Chat API
 * Endpoint: POST https://kaizencondemo2027-1.onrender.com/api/knowledge/chat
 * Payload: { "question": string }
 *
 * @param {string} question - Question to ask the knowledge assistant
 * @returns {Promise<{ answer: string, sources: Array<{ document: string, page: number, section: string }> }>}
 */
export const askKnowledgeChat = async (question) => {
  try {
    const response = await fetch(API_ENDPOINTS.KNOWLEDGE_CHAT, {
      method: 'POST',
      headers: {
        'Accept': '*/*',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ question: question || '' }),
    });

    if (!response.ok) {
      throw new Error(`Chat API request failed with status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error in askKnowledgeChat:', error);
    throw error;
  }
};

/**
 * Get Email Agent Contacts API
 * Endpoint: GET {BASE_URL}/api/v1/email-agent/contacts?offset=0&limit=100
 *
 * @param {number} [offset=0]
 * @param {number} [limit=100]
 * @returns {Promise<any[]>}
 */
export const getEmailAgentContacts = async (offset = 0, limit = 100) => {
  try {
    const url = `${API_ENDPOINTS.EMAIL_AGENT_CONTACTS}?offset=${encodeURIComponent(offset)}&limit=${encodeURIComponent(limit)}`;
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      const errorMsg = data?.detail || data?.message || `Request failed with status ${response.status}`;
      throw new Error(typeof errorMsg === 'string' ? errorMsg : JSON.stringify(errorMsg));
    }

    if (Array.isArray(data)) return data;
    if (data && Array.isArray(data.value)) return data.value;
    if (data && Array.isArray(data.results)) return data.results;
    return [];
  } catch (error) {
    console.error('Error in getEmailAgentContacts API:', error);
    throw error;
  }
};

/**
 * Stop Contact API
 * Endpoint: POST {BASE_URL}/api/v1/email-agent/contacts/{contact_id}/stop
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
      throw new Error(typeof errorMsg === 'string' ? errorMsg : JSON.stringify(errorMsg));
    }

    return data;
  } catch (error) {
    console.error('Error in stopContact API:', error);
    throw error;
  }
};

/**
 * Import Excel Contacts API
 * Endpoint: POST {BASE_URL}/api/v1/email-agent/contacts/import-excel
 * Accepts Excel file with columns: Email, Name, Type
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
      const errorMsg = data?.detail || data?.message || `Failed to import contacts with status ${response.status}`;
      throw new Error(typeof errorMsg === 'string' ? errorMsg : JSON.stringify(errorMsg));
    }

    return data;
  } catch (error) {
    console.error('Error in importExcelContacts API:', error);
    throw error;
  }
};

export default {
  BASE_URL,
  API_BASE_URL,
  API_ENDPOINTS,
  getImageUrl,
  getSpeakers,
  getSchedules,
  askKnowledgeChat,
  getEmailAgentContacts,
  stopContact,
  importExcelContacts,
};
