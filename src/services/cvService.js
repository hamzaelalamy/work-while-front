/**
 * CV-based job matching API service.
 */
import apiClient, { API_ENDPOINTS, handleApiError } from '../config/apiConfig';

const cvService = {
  /**
   * Upload CV (PDF/DOCX) and get job matches with similarity scores.
   * @param {File} file - PDF or DOCX file
   * @param {number} [limit=20] - Max number of matches
   * @returns {Promise<{ matches: Array, total: number }>}
   */
  async uploadAndGetMatches(file, limit = 20) {
    const formData = new FormData();
    formData.append('cv', file);
    formData.append('limit', String(limit));

    // Do not set Content-Type: let the browser set multipart/form-data with boundary
    const response = await apiClient.post(API_ENDPOINTS.CV.UPLOAD, formData, {
      timeout: 60000 // CV processing can take time (embedding + search)
    });

    const body = response?.data;
    const payload = body && typeof body === 'object' && body.data !== undefined ? body.data : body;
    const list = payload && typeof payload === 'object' && Array.isArray(payload.matches) ? payload.matches : [];
    const total = payload && typeof payload === 'object' && typeof payload.total === 'number' ? payload.total : list.length;
    const semanticCount = payload && typeof payload.semanticCount === 'number' ? payload.semanticCount : list.length;
    const fallback = Boolean(payload && payload.fallback);
    return { matches: list, total, semanticCount, fallback };
  },

  /**
   * Get job matches from the last uploaded CV (no new upload).
   * @param {number} [limit=20]
   */
  async getMatches(limit = 20) {
    const response = await apiClient.get(API_ENDPOINTS.CV.MATCHES, {
      params: { limit }
    });
    const body = response?.data;
    const payload = body && typeof body === 'object' && body.data !== undefined ? body.data : body;
    const list = payload && typeof payload === 'object' && Array.isArray(payload.matches) ? payload.matches : [];
    const total = payload && typeof payload === 'object' && typeof payload.total === 'number' ? payload.total : list.length;
    const semanticCount = payload && typeof payload.semanticCount === 'number' ? payload.semanticCount : list.length;
    const fallback = Boolean(payload && payload.fallback);
    return { matches: list, total, semanticCount, fallback };
  }
};

export default cvService;
