import apiClient from './api';

export const reportService = {
  /**
   * Fetch all waste reports with optional status filtering and search
   * @param {Object} params - { status, search, ordering }
   */
  async getReports(params = {}) {
    const response = await apiClient.get('/reports/', { params });
    return response.data;
  },

  /**
   * Fetch a single waste report by ID
   * @param {number|string} id
   */
  async getReportById(id) {
    const response = await apiClient.get(`/reports/${id}/`);
    return response.data;
  },

  /**
   * Submit a new waste report with image and geolocation
   * @param {FormData} formData
   */
  async createReport(formData) {
    const response = await apiClient.post('/reports/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  /**
   * Update report status (REPORTED | IN_PROGRESS | RESOLVED)
   * @param {number|string} id
   * @param {string} newStatus
   */
  async updateReportStatus(id, newStatus) {
    const response = await apiClient.patch(`/reports/${id}/`, {
      status: newStatus,
    });
    return response.data;
  },

  /**
   * Delete a waste report
   * @param {number|string} id
   */
  async deleteReport(id) {
    const response = await apiClient.delete(`/reports/${id}/`);
    return response.data;
  },

  /**
   * Fetch aggregate reporting stats for the dashboard
   */
  async getReportStats() {
    const response = await apiClient.get('/reports/stats/');
    return response.data;
  },
};

export default reportService;
