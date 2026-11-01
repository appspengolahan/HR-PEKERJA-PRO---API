import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { SystemDialogProvider } from './context/SystemDialogContext';

createRoot(document.getElementById('root')!).render(
  <SystemDialogProvider>
    <App />
  </SystemDialogProvider>
);
