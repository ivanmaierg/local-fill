import React from 'react';
import { createRoot } from 'react-dom/client';
import { SidebarApp } from './SidebarApp';

const container = document.getElementById('local-fill-sidebar');
if (!container) {
  throw new Error('Sidebar container not found');
}

const root = createRoot(container);
root.render(<SidebarApp />);
