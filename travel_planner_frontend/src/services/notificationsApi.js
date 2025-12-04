//
// PUBLIC_INTERFACE
// notificationsApi.js - Helper for browser Notifications API with graceful fallback
//

/**
 * Request Notification permission from the browser if not already granted.
 * Returns 'granted' | 'denied' | 'default'
 */
export async function requestNotificationPermission() {
  if (!('Notification' in window)) {
    return 'denied';
  }
  if (Notification.permission === 'granted' || Notification.permission === 'denied') {
    return Notification.permission;
  }
  try {
    const perm = await Notification.requestPermission();
    return perm;
  } catch {
    return 'denied';
  }
}

/**
// PUBLIC_INTERFACE
 * showNativeNotification - Tries to display a browser notification.
 * Falls back to a provided onFallback if not permitted or unsupported.
 * @param {string} title
 * @param {{ body?: string, icon?: string }} [options]
 * @param {Function} [onFallback] - callback when native not shown
 */
export async function showNativeNotification(title, options = {}, onFallback) {
  if (!('Notification' in window)) {
    if (onFallback) onFallback();
    return false;
  }
  if (Notification.permission !== 'granted') {
    const perm = await requestNotificationPermission();
    if (perm !== 'granted') {
      if (onFallback) onFallback();
      return false;
    }
  }
  try {
    // Use app favicon by default if available
    const icon = options.icon || '/favicon.ico';
    new Notification(title, { ...options, icon });
    return true;
  } catch {
    if (onFallback) onFallback();
    return false;
  }
}
