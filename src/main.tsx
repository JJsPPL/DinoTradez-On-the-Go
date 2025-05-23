
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'sonner';
import App from './pages/App';
import './styles.css';

const baseUrl = import.meta.env.MODE === 'production' 
  ? '/DinoTradez-On-the-Go/' 
  : '/';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('Root element not found');
}

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <BrowserRouter basename={baseUrl}>
      <Toaster position="top-right" richColors />
      <Routes>
        <Route path="/" element={<App />} />
        {/* Consider adding more routes as your app grows */}
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);
