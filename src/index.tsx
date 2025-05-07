import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { Theme, presetGpnDefault } from '@consta/uikit/Theme'; // тема из UI-кита

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <React.StrictMode>
    <Theme preset={presetGpnDefault}>
      <App />
    </Theme>
  </React.StrictMode >
);
