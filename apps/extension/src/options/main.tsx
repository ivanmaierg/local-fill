import React from 'react';
import { createRoot } from 'react-dom/client';
import { OptionsPage } from './OptionsPage';
import { ToastProvider } from 'ui';

const container = document.getElementById('root');
if (!container) {
  throw new Error('Root element not found');
}

const root = createRoot(container);
root.render(
  <ToastProvider>
    <OptionsPage />
  </ToastProvider>
);
