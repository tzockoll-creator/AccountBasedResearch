import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { ToastProvider } from './components/Toast';
import { validateEnv } from './utils/validation';
import './index.css';

// Fail fast if required env vars are missing
const envCheck = validateEnv();
if (!envCheck.valid) {
  const root = document.getElementById('root')!;
  root.innerHTML = `
    <div style="display:flex;align-items:center;justify-content:center;min-height:100vh;padding:2rem;font-family:system-ui,sans-serif;">
      <div style="max-width:480px;text-align:center;">
        <h1 style="font-size:1.5rem;font-weight:700;color:#f87171;margin-bottom:1rem;">Configuration Error</h1>
        <p style="color:#94a3b8;line-height:1.6;">${envCheck.message}</p>
      </div>
    </div>
  `;
} else {
  ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
      <ToastProvider>
        <App />
      </ToastProvider>
    </React.StrictMode>,
  );
}
