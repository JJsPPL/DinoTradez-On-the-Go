import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'sonner';
import App from './pages/App';
import './styles.css';

// Get the base URL depending on the environment
const baseUrl = import.meta.env.MODE === 'production' 
  ? '/DinoTradez-On-the-Go/' 
  : '/';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter basename={baseUrl}>
      <Toaster position="top-right" richColors />
      <Routes>
        <Route path="/" element={<App />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
); 