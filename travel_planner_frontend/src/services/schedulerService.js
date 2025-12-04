//
// schedulerService.js
// Schedules reminder timers using setTimeout with persistence via localStorage and recovery.
//

import { pushNotification } from './notificationsService';
import featureFlags from '../flags/featureFlags';

// Local storage key for scheduled timers metadata (pure data, not timers)
const SKEY = 'tp:scheduler';

const read = () => {
  try {
    const raw = localStorage.getItem(SKEY);
    return raw ? JSON.parse(raw) : { items: [] };
  } catch {
    return { items: [] };
  }
};

const write = (data) => {
  try {
    localStorage.setItem(SKEY, JSON.stringify(data));
  } catch {
    // ignore
  }
};

const timers = new Map();

/**
 * Recover timers on app load. Fires "missed" notifications if time already passed.
 * @param {string} tripId
 */
export async function recover(tripId) {
  const data = read();
  const now = Date.now();
  const relevant = data.items.filter((it) => it.tripId === tripId);
  for (const it of relevant) {
    // Clean any existing timeout
    if (timers.has(it.id)) {
      clearTimeout(timers.get(it.id));
      timers.delete(it.id);
    }
    const due = new Date(it.fireAt).getTime();
    if (due <= now) {
      // Emit missed notification
      await pushNotification(tripId, {
        type: 'reminder-missed',
        title: it.title || 'Missed reminder',
        message: it.message || 'You have a missed reminder.',
        meta: { reminderId: it.reminderId, scheduledFor: it.fireAt, missed: true },
      });
      // If repeat is configured, reschedule next occurrence
      scheduleNextOccurrence(it, tripId);
    } else {
      scheduleTimeout(it, tripId, due - now);
    }
  }
}

/**
 * Schedule a specific reminder.
 * @param {string} tripId
 * @param {{id:string, reminderId:string, fireAt:string, title:string, message:string, repeat?:'none'|'daily'|'once'}} job
 */
export function schedule(tripId, job) {
  const data = read();
  const items = data.items.filter((i) => i.id !== job.id).concat(job);
  write({ items });
  const delay = Math.max(0, new Date(job.fireAt).getTime() - Date.now());
  scheduleTimeout(job, tripId, delay);
}

/**
 * Cancel a scheduled job by id
 */
export function cancel(jobId) {
  const data = read();
  write({ items: data.items.filter((i) => i.id !== jobId) });
  if (timers.has(jobId)) {
    clearTimeout(timers.get(jobId));
    timers.delete(jobId);
  }
}

/**
 * Cancel all jobs for a trip
 */
export function cancelForTrip(tripId) {
  const data = read();
  const toCancel = data.items.filter((i) => i.tripId === tripId).map((i) => i.id);
  write({ items: data.items.filter((i) => i.tripId !== tripId) });
  toCancel.forEach((id) => {
    if (timers.has(id)) {
      clearTimeout(timers.get(id));
      timers.delete(id);
    }
  });
}

function scheduleTimeout(job, tripId, delay) {
  if (!featureFlags.REMINDERS || !featureFlags.FEATURE_NOTIFICATIONS) return;
  if (timers.has(job.id)) {
    clearTimeout(timers.get(job.id));
    timers.delete(job.id);
  }
  const t = setTimeout(async () => {
    // Fire in-app notification
    await pushNotification(tripId, {
      type: 'reminder',
      title: job.title || 'Reminder',
      message: job.message || '',
      meta: { reminderId: job.reminderId, scheduledFor: job.fireAt, missed: false },
      actions: ['snooze-10m', 'snooze-1h', 'mark-done', 'dismiss'],
    });
    // After firing, either remove or schedule next
    scheduleNextOccurrence(job, tripId);
  }, delay);
  timers.set(job.id, t);
}

function scheduleNextOccurrence(job, tripId) {
  // Remove current job from persistence
  const data = read();
  const others = data.items.filter((i) => i.id !== job.id);
  // Handle repeat
  if (job.repeat === 'daily') {
    const next = { ...job };
    const cur = new Date(job.fireAt);
    cur.setDate(cur.getDate() + 1);
    next.fireAt = cur.toISOString();
    write({ items: [...others, next] });
    const delay = Math.max(0, new Date(next.fireAt).getTime() - Date.now());
    scheduleTimeout(next, tripId, delay);
  } else {
    // 'once' or 'none' means remove
    write({ items: others });
  }
}
