//
// User service: provides functions to interact with user/session endpoints
//

import http, { createHttpClient } from './http';
import { env } from '../config/env';

const base = env.httpBase ? createHttpClient({ baseUrl: env.httpBase }) : http;

// PUBLIC_INTERFACE
export const UserService = {
  /** Get current authenticated user profile */
  async me() {
    return base.get('/api/users/me');
  },

  // PUBLIC_INTERFACE
  /** Update profile settings */
  async updateProfile(payload) {
    return base.put('/api/users/me', { body: payload });
  },

  // PUBLIC_INTERFACE
  /** Begin login (example placeholder) */
  async login({ email, password }) {
    return base.post('/api/auth/login', { body: { email, password } });
  },

  // PUBLIC_INTERFACE
  /** Logout current session */
  async logout() {
    return base.post('/api/auth/logout');
  },
};

export default UserService;
