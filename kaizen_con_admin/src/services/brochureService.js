/**
 * BROCHURE MANAGEMENT SERVICE (ADMIN PANEL)
 * Provides centralized operations for uploading, downloading, replacing,
 * and deleting the official KaizenCon 2027 conference brochure PDF.
 */

import {
  API_ENDPOINTS,
  uploadBrochure,
  downloadBrochure,
  deleteBrochure,
  extractFilenameFromDisposition,
  formatFileSize,
} from '../api/ApiPath';

export {
  API_ENDPOINTS,
  uploadBrochure,
  downloadBrochure,
  deleteBrochure,
  extractFilenameFromDisposition,
  formatFileSize,
};

/**
 * Triggers a browser file download from a Blob or URL.
 * 
 * @param {Blob|string} blobOrUrl - Blob object or object URL
 * @param {string} [filename='Kaizencon_2027_Brochure.pdf'] - Download filename
 */
export function triggerBrochureDownload(blobOrUrl, filename = 'Kaizencon_2027_Brochure.pdf') {
  if (!blobOrUrl) return;
  const isUrl = typeof blobOrUrl === 'string';
  const downloadUrl = isUrl ? blobOrUrl : URL.createObjectURL(blobOrUrl);

  const anchor = document.createElement('a');
  anchor.href = downloadUrl;
  anchor.download = filename || 'Kaizencon_2027_Brochure.pdf';
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);

  if (!isUrl) {
    setTimeout(() => {
      URL.revokeObjectURL(downloadUrl);
    }, 1500);
  }
}

/**
 * Replaces an existing brochure by first deleting the current brochure
 * (via DELETE /api/brochure/delete) and then uploading the new PDF.
 * 
 * @param {File} newFile - New PDF file to upload
 * @param {Function} [onProgress] - Optional upload progress callback
 * @returns {Promise<any>}
 */
export async function replaceBrochure(newFile, onProgress) {
  try {
    // Attempt deleting existing brochure first
    await deleteBrochure().catch((err) => {
      // If 404, there was no brochure anyway, proceed to upload
      if (err.status !== 404) {
        console.warn('Delete attempt before replacement failed:', err);
      }
    });
  } catch (e) {
    console.warn('Replace brochure pre-delete exception:', e);
  }

  // Upload the new brochure
  return await uploadBrochure(newFile, onProgress);
}

export default {
  uploadBrochure,
  downloadBrochure,
  deleteBrochure,
  replaceBrochure,
  triggerBrochureDownload,
  extractFilenameFromDisposition,
  formatFileSize,
};

