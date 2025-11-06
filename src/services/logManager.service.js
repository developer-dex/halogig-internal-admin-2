import { getApi, patchApi } from './api';

const LOG_MANAGER_BASE_URL = '/admin/logs';

export const logManagerService = {
  /**
   * Get all logs with pagination and filtering
   */
  getAllLogs: async (params = {}) => {
    const queryParams = new URLSearchParams();
    
    // Add pagination parameters
    if (params.page) queryParams.append('page', params.page);
    if (params.limit) queryParams.append('limit', params.limit);
    
    // Add filter parameters
    if (params.logLevel) queryParams.append('logLevel', params.logLevel);
    if (params.logType) queryParams.append('logType', params.logType);
    if (params.apiEndpoint) queryParams.append('apiEndpoint', params.apiEndpoint);
    if (params.isResolved !== undefined) queryParams.append('isResolved', params.isResolved);
    if (params.priority) queryParams.append('priority', params.priority);
    if (params.environment) queryParams.append('environment', params.environment);
    if (params.startDate) queryParams.append('startDate', params.startDate);
    if (params.endDate) queryParams.append('endDate', params.endDate);
    if (params.tags) queryParams.append('tags', params.tags);
    
    const url = `${LOG_MANAGER_BASE_URL}?${queryParams.toString()}`;
    return getApi(url);
  },

  /**
   * Get log by ID for detailed view
   */
  getLogById: async (logId) => {
    const url = `${LOG_MANAGER_BASE_URL}/${logId}`;
    return getApi(url);
  },

  /**
   * Mark log as resolved
   */
  resolveLog: async (logId, resolutionNotes = '') => {
    const url = `${LOG_MANAGER_BASE_URL}/${logId}/resolve`;
    const data = { resolutionNotes };
    return patchApi(url, data);
  },

  /**
   * Get log statistics
   */
  getLogStatistics: async () => {
    const url = `${LOG_MANAGER_BASE_URL}/statistics`;
    return getApi(url);
  },
};

export default logManagerService;
