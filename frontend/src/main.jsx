import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import App from './App.jsx';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#1a1e28',
            color: '#f0f2f7',
            border: '1px solid #2a2f3e',
            fontFamily: 'Inter, sans-serif',
            fontSize: '0.88rem',
          },
        }}
      />
    </BrowserRouter>
  </React.StrictMode>
);
