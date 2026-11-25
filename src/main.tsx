import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import {setupTelegramPolyfills} from './telegram.ts';
import App from './App.tsx';
import './index.css';

// Ensure Telegram WebApp CloudStorage polyfill is applied prior to rendering
setupTelegramPolyfills();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
