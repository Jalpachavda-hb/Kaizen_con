// Base API Configuration
export const BASE_URL = 'http://192.168.29.201:8000';
export const API_BASE_URL = `${BASE_URL}/api`;

// API Endpoints
export const API_ENDPOINTS = {
  SPEAKERS: `${API_BASE_URL}/speakers`,
  SCHEDULES: `${API_BASE_URL}/schedules`,
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

export default {
  BASE_URL,
  API_BASE_URL,
  API_ENDPOINTS,
  getImageUrl,
  getSpeakers,
  getSchedules,
};
