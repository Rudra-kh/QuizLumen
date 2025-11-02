import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import reportWebVitals from './reportWebVitals';
import ErrorBoundary from './ErrorBoundary';

function showErrorOverlay(err) {
  try {
    const root = document.getElementById('root');
    if (!root) return;
    const pre = document.createElement('pre');
    pre.style.background = '#fee';
    pre.style.padding = '16px';
    pre.style.borderRadius = '6px';
    pre.style.whiteSpace = 'pre-wrap';
    pre.textContent = String(err && err.stack ? err.stack : err);
    root.innerHTML = '';
    const wrapper = document.createElement('div');
    const h = document.createElement('h2');
    h.textContent = 'Application error';
    wrapper.appendChild(h);
    wrapper.appendChild(pre);
    root.appendChild(wrapper);
  } catch (e) {
    // fallback
    console.error('Failed to render error overlay', e);
  }
}

// Global error handlers to capture runtime and promise errors early
window.addEventListener('error', (event) => {
  console.error('window error', event.error || event.message);
  showErrorOverlay(event.error || event.message || 'Unknown error');
});
window.addEventListener('unhandledrejection', (ev) => {
  console.error('unhandledrejection', ev.reason);
  showErrorOverlay(ev.reason || 'Unhandled rejection');
});

// Dynamically import App so import-time exceptions can be caught and shown
(async function boot() {
  try {
    const { default: App } = await import('./App');
    const root = ReactDOM.createRoot(document.getElementById('root'));
    root.render(
      <React.StrictMode>
        <ErrorBoundary>
          <App />
        </ErrorBoundary>
      </React.StrictMode>
    );
  } catch (err) {
    console.error('Boot error', err);
    showErrorOverlay(err);
  }
})();

// reportWebVitals remains optional
reportWebVitals();
