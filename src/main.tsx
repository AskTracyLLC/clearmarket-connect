import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Unregister any previously registered service workers (legacy CRA/PWA)
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations?.().then((regs) => {
    regs.forEach((reg) => reg.unregister());
  }).catch(() => {
    // no-op
  });
}

createRoot(document.getElementById("root")!).render(<App />);
