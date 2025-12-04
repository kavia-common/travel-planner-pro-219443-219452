import React from 'react';
import * as featureFlags from '../flags/featureFlags';

export default function Settings() {
  return (
    <div className="p-4">
      <div className="text-xl font-semibold text-gray-800 mb-4">Settings</div>
      <div className="bg-white rounded-lg shadow p-4 space-y-4">
        <div className="text-gray-700">Your application settings will appear here.</div>

        {featureFlags.FEATURE_NOTIFICATIONS && (
          <div className="p-4 border border-gray-100 rounded-lg">
            <div className="font-medium text-gray-800 mb-1">Notifications</div>
            <div className="text-sm text-gray-600 mb-2">
              Manage in-app and browser notifications preferences.
            </div>
            <a
              href="/notifications"
              className="inline-flex items-center text-blue-600 text-sm hover:underline"
            >
              Open Notifications Panel
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
