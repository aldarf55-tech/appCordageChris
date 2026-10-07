import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.tsx';

if (navigator.storage && navigator.storage.persist) {
  navigator.storage.persist().catch((error: unknown) => {
    console.warn('La persistance du stockage local a été refusée :', error);
  });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
