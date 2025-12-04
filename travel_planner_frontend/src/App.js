import React from 'react';
import './App.css';
import Header from './components/common/Header';
import Sidebar from './components/common/Sidebar';
import Card from './components/common/Card';
import Button from './components/common/Button';
import { BrowserRouter } from 'react-router-dom';
import { useTheme } from './hooks/useTheme';

// PUBLIC_INTERFACE
function App() {
  /** App shell providing Header, Sidebar, and Main content placeholder. */
  useTheme(); // initialize theme behavior (sets data-theme and persists)

  return (
    <BrowserRouter>
      <div className="app-shell">
        <Header />
        <div className="main-area">
          <div className="layout-row">
            <Sidebar />
            <main aria-label="Main content" className="transition-base" style={{ minHeight: '60vh' }}>
              <Card title="Welcome" subtitle="Your travel planning hub">
                <p className="text-muted">
                  This is a placeholder for future routes and content (dashboard, trips, calendar).
                </p>
                <div className="gap-2" style={{ display: 'flex' }}>
                  <Button variant="primary">Create Trip</Button>
                  <Button variant="ghost">Import</Button>
                </div>
              </Card>
            </main>
          </div>
        </div>
      </div>
    </BrowserRouter>
  );
}

export default App;
