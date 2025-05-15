// client/src/index.tsx
import React        from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';



import App          from './App';
import { AuthProvider } from './context/AuthContext';   //  import du provider
import './index.css';

const root = createRoot(document.getElementById('root')!);

root.render(
  <React.StrictMode>
    <AuthProvider>               {/* LE provider englobe toute l’app */}
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </AuthProvider>
  </React.StrictMode>
);