import http from './http';
import { env } from '../config/env';

/**
 * Service for handling budget and expenses related API calls.
 * Uses base URL from environment via env.httpBase and shared http client.
 */

const baseUrl = env.httpBase || '';

// PUBLIC_INTERFACE
export async function getExpenses(tripId) {
  /** Fetch expenses for a given trip */
  if (!tripId) throw new Error('tripId is required');
  const url = `${baseUrl}/trips/${encodeURIComponent(tripId)}/expenses`;
  return http.get(url);
}

// PUBLIC_INTERFACE
export async function createExpense(tripId, data) {
  /** Create a new expense for a given trip */
  if (!tripId) throw new Error('tripId is required');
  const url = `${baseUrl}/trips/${encodeURIComponent(tripId)}/expenses`;
  return http.post(url, data);
}

// PUBLIC_INTERFACE
export async function updateExpense(tripId, expenseId, data) {
  /** Update an expense for a given trip */
  if (!tripId) throw new Error('tripId is required');
  if (!expenseId) throw new Error('expenseId is required');
  const url = `${baseUrl}/trips/${encodeURIComponent(tripId)}/expenses/${encodeURIComponent(expenseId)}`;
  return http.patch(url, data);
}

// PUBLIC_INTERFACE
export async function deleteExpense(tripId, expenseId) {
  /** Delete an expense for a given trip */
  if (!tripId) throw new Error('tripId is required');
  if (!expenseId) throw new Error('expenseId is required');
  const url = `${baseUrl}/trips/${encodeURIComponent(tripId)}/expenses/${encodeURIComponent(expenseId)}`;
  return http.del(url);
}

// PUBLIC_INTERFACE
export async function getBudget(tripId) {
  /** Fetch budget target/details for a given trip */
  if (!tripId) throw new Error('tripId is required');
  const url = `${baseUrl}/trips/${encodeURIComponent(tripId)}/budget`;
  return http.get(url);
}

// PUBLIC_INTERFACE
export async function updateBudget(tripId, data) {
  /** Update budget target/details for a given trip */
  if (!tripId) throw new Error('tripId is required');
  const url = `${baseUrl}/trips/${encodeURIComponent(tripId)}/budget`;
  return http.patch(url, data);
}

export default {
  getExpenses,
  createExpense,
  updateExpense,
  deleteExpense,
  getBudget,
  updateBudget,
};
