import http from './http';

// PUBLIC_INTERFACE
export const NotificationService = {
  /**
   * Fetch a paginated list of notifications for the current user.
   * @param {Object} opts - query options
   * @param {number} opts.page - page number, 1-based
   * @param {number} opts.pageSize - page size
   * @param {string} opts.status - optional filter: 'all' | 'unread' | 'read'
   */
  async getNotifications({ page = 1, pageSize = 20, status = 'all' } = {}) {
    const query = {};
    if (page) query.page = page;
    if (pageSize) query.pageSize = pageSize;
    if (status && status !== 'all') query.status = status;
    return http.get('/notifications', { query });
  },

  /**
   * Mark a notification as read.
   * @param {string} id - notification id
   */
  async markAsRead(id) {
    if (!id) throw new Error('Notification id is required');
    return http.put(`/notifications/${encodeURIComponent(id)}/read`, { body: {} });
  },

  /**
   * Get current user's notification preferences.
   */
  async getPreferences() {
    return http.get('/users/me/notification-preferences');
  },

  /**
   * Update current user's notification preferences.
   * @param {Object} prefs - preferences object as expected by the backend
   */
  async updatePreferences(prefs) {
    return http.put('/users/me/notification-preferences', { body: prefs || {} });
  },
};

export default NotificationService;
