import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import 'bootstrap/dist/css/bootstrap.min.css';

// Importamos nuestro nuevo proveedor
import { TiendaProvider } from './context/TiendaContext';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    {/* Envolvemos la App aquí */}
    <TiendaProvider>
      <App />
    </TiendaProvider>
  </React.StrictMode>
);

reportWebVitals();