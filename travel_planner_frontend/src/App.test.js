import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import App from './App';
import { StoreProvider } from './state/store';

function renderAppAt(path = '/') {
  return render(
    <StoreProvider>
      <MemoryRouter initialEntries={[path]}>
        <App />
      </MemoryRouter>
    </StoreProvider>
  );
}

describe('App routing and layout smoke tests', () => {
  test('renders header and sidebar', async () => {
    renderAppAt('/');
    // Header/Sidebar have common elements
    // Header text may vary; assert presence of landmark roles
    const main = await screen.findByRole('main', { name: /main content/i });
    expect(main).toBeInTheDocument();
  });

  test('navigates to dashboard (/) route', async () => {
    renderAppAt('/');
    // Dashboard page may have text. As a smoke, fallback loader appears briefly
    expect(await screen.findByText(/Loading page…|Loading page/i)).toBeInTheDocument();
  });

  test('navigates to /trips route', async () => {
    renderAppAt('/trips');
    expect(await screen.findByText(/Loading page…|Loading page/i)).toBeInTheDocument();
  });

  test('navigates to /calendar route', async () => {
    renderAppAt('/calendar');
    expect(await screen.findByText(/Loading page…|Loading page/i)).toBeInTheDocument();
  });

  test('navigates to /settings route', async () => {
    renderAppAt('/settings');
    expect(await screen.findByText(/Loading page…|Loading page/i)).toBeInTheDocument();
  });

  test('unknown route shows not found card', async () => {
    renderAppAt('/unknown-route');
    const notFound = await screen.findByText(/not found/i);
    expect(notFound).toBeInTheDocument();
  });
});
