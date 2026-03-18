import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Pantalla de Seguridad
import PantallaBloqueo from './components/PantallaBloqueo';

// Componentes
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import Inventario from './pages/Inventario';
import Proveedores from './pages/Proveedores';
import PuntoVenta from './pages/PuntoVenta';
import HistorialVentas from './pages/HistorialVentas';
import Fiados from './pages/Fiados';
import Compras from './pages/Compras';
import CorteCaja from './pages/CorteCaja';
import Ajustes from './pages/Ajustes';

// Estilos
import 'bootstrap/dist/css/bootstrap.min.css';

function App() {
  // El sistema empieza bloqueado por defecto
  const [bloqueado, setBloqueado] = useState(true);

  // 1. Si está bloqueado, devolvemos SOLO la pantalla de bloqueo
  if (bloqueado) {
    return <PantallaBloqueo onDesbloquear={() => setBloqueado(false)} />;
  }

  // 2. Si NO está bloqueado, devolvemos el sistema completo
  return (
    <Router>
      <div className="d-flex" style={{ minHeight: '100vh', backgroundColor: '#f8f9fa' }}>
      
        {/* Contenedor fijo para el Sidebar */}
        <div style={{ width: '260px', minWidth: '260px', height: '100vh', position: 'sticky', top: 0 }}>
          <Sidebar onBloquear={() => setBloqueado(true)} />
        </div>

        {/* Contenedor principal para las páginas */}
        <div className="flex-grow-1" style={{ overflowX: 'hidden' }}>
          <div className="p-4">
            <Routes>
              {/* Usamos exactitud en las rutas para evitar conflictos visuales */}
              <Route path="/" element={<Dashboard />} />
              <Route path="/inventario" element={<Inventario />} />
              <Route path="/proveedores" element={<Proveedores />} />
              <Route path="/ventas" element={<PuntoVenta />} />
              <Route path="/historial" element={<HistorialVentas />} />
              <Route path="/fiados" element={<Fiados />} />
              <Route path="/compras" element={<Compras />} />
              <Route path="/corte" element={<CorteCaja />} />
              <Route path="/ajustes" element={<Ajustes />} />
            </Routes>
          </div>
        </div>

      </div>
    </Router>
  );
}

export default App;