import React from 'react';
import { createRoot } from 'react-dom/client';
import { OverlayApp } from './OverlayApp';

const container = document.getElementById('local-fill-overlay');
if (!container) {
  throw new Error('Overlay container not found');
}

const root = createRoot(container);
root.render(<OverlayApp />);
