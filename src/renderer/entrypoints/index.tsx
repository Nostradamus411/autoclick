import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from '@renderer/app/App';
import '@renderer/styles/theme.css';
import '@renderer/styles/globals.css';

const root = document.getElementById('root');
if (root) {
  ReactDOM.createRoot(root).render(<App />);
}
