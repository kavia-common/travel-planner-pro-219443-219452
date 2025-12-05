//
// Trip templates data & helpers (frontend-only, no backend dependency).
//

/**
 * @typedef {Object} TemplateActivity
 * @property {string} time - Localized time label, e.g. "09:00"
 * @property {string} title - Activity title/summary
 * @property {string} category - High-level category such as "sightseeing", "meal", "meeting"
 * @property {number} durationMins - Duration in minutes (unit-safe)
 */

/**
 * @typedef {Object} TemplateDay
 * @property {number} dayIndex - 0-based index
 * @property {string} title - Human-friendly day label
 * @property {string} notes - Free-form notes or tips for the day
 * @property {TemplateActivity[]} activities - Ordered list of activities
 */

/**
 * @typedef {Object} TripTemplate
 * @property {string} id - Stable identifier
 * @property {string} name - Display name
 * @property {string} description - Short marketing / guidance copy
 * @property {number} recommendedDurationDays - Recommended duration in days
 * @property {string[]} tags - Free-form tags for filtering / badges
 * @property {TemplateDay[]} days - Sample itinerary structure
 */

// PUBLIC_INTERFACE
export const TRIP_TEMPLATES = /** @type {TripTemplate[]} */ ([
  {
    id: 'weekend-getaway',
    name: 'Weekend Getaway',
    description: '2–3 day city break with light sightseeing, great food, and relaxed pacing.',
    recommendedDurationDays: 3,
    tags: ['city', 'short', 'leisure', 'weekend'],
    days: [
      {
        dayIndex: 0,
        title: 'Arrival & First Impressions',
        notes: 'Check in, stretch your legs, and get a feel for the neighborhood.',
        activities: [
          { time: '10:00', title: 'Travel to destination', category: 'travel', durationMins: 180 },
          { time: '14:00', title: 'Hotel check-in', category: 'check-in', durationMins: 60 },
          { time: '16:00', title: 'Old town walk & coffee stop', category: 'sightseeing', durationMins: 120 },
          { time: '19:30', title: 'Welcome dinner at local bistro', category: 'dining', durationMins: 90 },
        ],
      },
      {
        dayIndex: 1,
        title: 'Highlights & Hidden Gems',
        notes: 'Mix a few headline attractions with slower moments in between.',
        activities: [
          { time: '09:00', title: 'Breakfast near hotel', category: 'dining', durationMins: 60 },
          { time: '10:30', title: 'Guided city tour or museum visit', category: 'sightseeing', durationMins: 180 },
          { time: '14:30', title: 'Lunch & coffee break', category: 'dining', durationMins: 90 },
          { time: '16:30', title: 'Neighborhood stroll / shopping', category: 'leisure', durationMins: 150 },
          { time: '20:00', title: 'Rooftop drinks or river walk', category: 'leisure', durationMins: 120 },
        ],
      },
      {
        dayIndex: 2,
        title: 'Slow Morning & Departure',
        notes: 'Pack, enjoy one last walk, and travel home without rushing.',
        activities: [
          { time: '09:30', title: 'Late breakfast / brunch', category: 'dining', durationMins: 90 },
          { time: '11:30', title: 'Packed bags & hotel check-out', category: 'check-out', durationMins: 60 },
          { time: '13:00', title: 'Last stroll or quick sight', category: 'sightseeing', durationMins: 90 },
          { time: '15:30', title: 'Travel home', category: 'travel', durationMins: 210 },
        ],
      },
    ],
  },
  {
    id: 'business-trip',
    name: 'Business Trip',
    description: '2–4 day work-focused itinerary with meetings, transit, and hotel time.',
    recommendedDurationDays: 3,
    tags: ['business', 'short', 'meetings'],
    days: [
      {
        dayIndex: 0,
        title: 'Arrival & Prep',
        notes: 'Arrive, settle into your hotel, and prepare for meetings.',
        activities: [
          { time: '08:00', title: 'Depart for destination', category: 'travel', durationMins: 180 },
          { time: '11:30', title: 'Hotel check-in & email catch-up', category: 'check-in', durationMins: 90 },
          { time: '13:30', title: 'Working lunch near office', category: 'dining', durationMins: 60 },
          { time: '15:00', title: 'Office visit / desk setup', category: 'work', durationMins: 120 },
          { time: '18:30', title: 'Light dinner & review agenda', category: 'dining', durationMins: 90 },
        ],
      },
      {
        dayIndex: 1,
        title: 'Meetings & Networking',
        notes: 'Primary meeting day with structured breaks and buffer time.',
        activities: [
          { time: '07:30', title: 'Breakfast & last-minute prep', category: 'dining', durationMins: 60 },
          { time: '09:00', title: 'Client meeting block', category: 'meeting', durationMins: 180 },
          { time: '12:30', title: 'Lunch with stakeholders', category: 'meeting', durationMins: 90 },
          { time: '14:30', title: 'Workshop / presentations', category: 'meeting', durationMins: 150 },
          { time: '17:30', title: 'Email wrap-up & notes', category: 'work', durationMins: 60 },
          { time: '19:30', title: 'Team dinner or networking event', category: 'networking', durationMins: 120 },
        ],
      },
      {
        dayIndex: 2,
        title: 'Follow-ups & Departure',
        notes: 'Handle follow-ups, then travel home or onward.',
        activities: [
          { time: '08:00', title: 'Breakfast and check-out', category: 'dining', durationMins: 60 },
          { time: '09:30', title: 'Follow-up coffee / 1:1s', category: 'meeting', durationMins: 90 },
          { time: '11:30', title: 'Desk time for summaries & next steps', category: 'work', durationMins: 120 },
          { time: '14:30', title: 'Travel to airport / station', category: 'travel', durationMins: 90 },
          { time: '16:30', title: 'Return travel', category: 'travel', durationMins: 210 },
        ],
      },
    ],
  },
  {
    id: 'family-vacation',
    name: 'Family Vacation',
    description: '5–7 day kid-friendly trip with balanced activities and downtime.',
    recommendedDurationDays: 6,
    tags: ['family', 'kids', 'long', 'relaxed'],
    days: [
      {
        dayIndex: 0,
        title: 'Travel & Settle In',
        notes: 'Travel, unpack, and explore the immediate surroundings.',
        activities: [
          { time: '09:00', title: 'Travel to destination', category: 'travel', durationMins: 240 },
          { time: '13:30', title: 'Check-in & unpack', category: 'check-in', durationMins: 90 },
          { time: '16:00', title: 'Pool time / playground visit', category: 'kids', durationMins: 120 },
          { time: '19:00', title: 'Casual family dinner', category: 'dining', durationMins: 90 },
        ],
      },
      {
        dayIndex: 1,
        title: 'Adventure Day',
        notes: 'A big attraction in the morning, with quiet time in the afternoon.',
        activities: [
          { time: '08:00', title: 'Breakfast together', category: 'dining', durationMins: 60 },
          { time: '09:30', title: 'Zoo / theme park / kid museum', category: 'kids', durationMins: 240 },
          { time: '14:30', title: 'Nap / quiet time at accommodation', category: 'rest', durationMins: 120 },
          { time: '17:00', title: 'Beach or park play', category: 'kids', durationMins: 120 },
          { time: '19:30', title: 'Family-friendly restaurant', category: 'dining', durationMins: 90 },
        ],
      },
      {
        dayIndex: 2,
        title: 'Local Culture',
        notes: 'Introduce kids to local culture in short, engaging bursts.',
        activities: [
          { time: '09:00', title: 'Breakfast at a local café', category: 'dining', durationMins: 60 },
          { time: '10:30', title: 'Old town walk & simple history stop', category: 'sightseeing', durationMins: 150 },
          { time: '13:00', title: 'Lunch & gelato / treat', category: 'dining', durationMins: 90 },
          { time: '15:00', title: 'Crafts / games at accommodation', category: 'kids', durationMins: 120 },
          { time: '18:30', title: 'Early dinner & movie night', category: 'leisure', durationMins: 120 },
        ],
      },
      {
        dayIndex: 3,
        title: 'Free Day',
        notes: 'Keep the day flexible based on everyone’s energy.',
        activities: [
          { time: '09:30', title: 'Slow breakfast & planning', category: 'dining', durationMins: 90 },
          { time: '11:00', title: 'Choose-your-own-adventure time', category: 'leisure', durationMins: 180 },
          { time: '15:00', title: 'Rest & reading / quiet games', category: 'rest', durationMins: 150 },
          { time: '18:30', title: 'Picnic dinner or takeaway', category: 'dining', durationMins: 90 },
        ],
      },
      {
        dayIndex: 4,
        title: 'Another Big Outing',
        notes: 'One more high-energy day while everyone still has fuel.',
        activities: [
          { time: '08:30', title: 'Breakfast', category: 'dining', durationMins: 60 },
          { time: '10:00', title: 'Boat ride / mountain tram / special outing', category: 'sightseeing', durationMins: 210 },
          { time: '14:00', title: 'Quiet time back at accommodation', category: 'rest', durationMins: 150 },
          { time: '18:00', title: 'Dinner & evening walk', category: 'dining', durationMins: 120 },
        ],
      },
      {
        dayIndex: 5,
        title: 'Pack & Head Home',
        notes: 'Enjoy a final relaxed morning before traveling home.',
        activities: [
          { time: '09:00', title: 'Breakfast & last playtime', category: 'kids', durationMins: 90 },
          { time: '10:30', title: 'Pack & check-out', category: 'check-out', durationMins: 90 },
          { time: '13:00', title: 'Travel home', category: 'travel', durationMins: 240 },
        ],
      },
    ],
  },
]);

/**
 * PUBLIC_INTERFACE
 * getTemplateById - find a template by ID (returns undefined if not found).
 */
export function getTemplateById(id) {
  return TRIP_TEMPLATES.find((t) => t.id === id);
}
