//
// notificationsService.js
// Manages reminders and notifications per trip with HTTP-first and localStorage fallback
//

import http from './http';

// Storage keys helpers
const k = {
  reminders: (tripId) => `tp:reminders:${tripId}`,
  notifications: (tripId) => `tp:notifications:${tripId}`,
  settings: 'tp:notificationSettings',
};

// Helpers
const readStorage = (key, def) => {
  try {
    const v = localStorage.getItem(key);
    return v ? JSON.parse(v) : def;
  } catch {
    return def;
  }
};

const writeStorage = (key, val) => {
  try {
    localStorage.setItem(key, JSON.stringify(val));
  } catch {
    // ignore
  }
};

const genId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

// PUBLIC_INTERFACE
export async function listReminders(tripId) {
  // Try HTTP first
  try {
    const res = await http.get(`/trips/${tripId}/reminders`);
    return res.data || [];
  } catch {
    return readStorage(k.reminders(tripId), []);
  }
}

// PUBLIC_INTERFACE
export async function addReminder(tripId, reminder) {
  const payload = { id: genId(), createdAt: new Date().toISOString(), ...reminder };
  try {
    const res = await http.post(`/trips/${tripId}/reminders`, payload);
    return res.data || payload;
  } catch {
    const existing = readStorage(k.reminders(tripId), []);
    const next = [payload, ...existing];
    writeStorage(k.reminders(tripId), next);
    return payload;
  }
}

// PUBLIC_INTERFACE
export async function updateReminder(tripId, id, patch) {
  try {
    const res = await http.patch(`/trips/${tripId}/reminders/${id}`, patch);
    return res.data;
  } catch {
    const existing = readStorage(k.reminders(tripId), []);
    const next = existing.map((r) => (r.id === id ? { ...r, ...patch } : r));
    writeStorage(k.reminders(tripId), next);
    return next.find((r) => r.id === id);
  }
}

// PUBLIC_INTERFACE
export async function removeReminder(tripId, id) {
  try {
    await http.delete(`/trips/${tripId}/reminders/${id}`);
    return true;
  } catch {
    const existing = readStorage(k.reminders(tripId), []);
    const next = existing.filter((r) => r.id !== id);
    writeStorage(k.reminders(tripId), next);
    return true;
  }
}

// PUBLIC_INTERFACE
export async function listNotifications(tripId) {
  // Try HTTP first
  try {
    const res = await http.get(`/trips/${tripId}/notifications`);
    return res.data || [];
  } catch {
    return readStorage(k.notifications(tripId), []);
  }
}

// PUBLIC_INTERFACE
export async function pushNotification(tripId, notification) {
  const payload = {
    id: genId(),
    createdAt: new Date().toISOString(),
    read: false,
    ...notification,
  };
  try {
    const res = await http.post(`/trips/${tripId}/notifications`, payload);
    return res.data || payload;
  } catch {
    const existing = readStorage(k.notifications(tripId), []);
    const next = [payload, ...existing];
    writeStorage(k.notifications(tripId), next);
    return payload;
  }
}

// PUBLIC_INTERFACE
export async function markRead(tripId, id) {
  try {
    const res = await http.patch(`/trips/${tripId}/notifications/${id}`, { read: true });
    return res.data;
  } catch {
    const existing = readStorage(k.notifications(tripId), []);
    const next = existing.map((n) => (n.id === id ? { ...n, read: true } : n));
    writeStorage(k.notifications(tripId), next);
    return next.find((n) => n.id === id);
  }
}

// PUBLIC_INTERFACE
export async function clearAll(tripId) {
  try {
    await http.delete(`/trips/${tripId}/notifications`);
    return true;
  } catch {
    writeStorage(k.notifications(tripId), []);
    return true;
  }
}

// PUBLIC_INTERFACE
export function getNotificationSettings() {
  return readStorage(k.settings, { enableBrowserNotifications: true });
}

// PUBLIC_INTERFACE
export function updateNotificationSettings(patch) {
  const cur = getNotificationSettings();
  const next = { ...cur, ...patch };
  writeStorage(k.settings, next);
  return next;
}
