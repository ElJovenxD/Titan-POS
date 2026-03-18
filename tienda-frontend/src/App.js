import React, { useState, useContext, useEffect } from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import axios from 'axios'; // <-- Importamos axios para preguntar el estado
import { TiendaContext } from './context/TiendaContext'; 

// Pantallas principales
import PantallaBloqueo from './components/PantallaBloqueo';
import AsistenteConfiguracion from './components/AsistenteConfiguracion'; // <-- Importamos el asistente

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

import 'bootstrap/dist/css/bootstrap.min.css';

function App() {
  const { tema } = useContext(TiendaContext); 
  
  // NUEVO: Estado para saber si el sistema ya se instaló
  const [configurado, setConfigurado] = useState(null); 
  const [bloqueado, setBloqueado] = useState(true);

  // Preguntamos a Java si ya existe una configuración en la BD
  useEffect(() => {
    axios.get('http://localhost:8080/api/seguridad/estado')
      .then(res => setConfigurado(res.data))
      .catch(err => {
        console.error("No se pudo conectar a la BD, asumiendo sistema nuevo.");
        setConfigurado(false);
      });
  }, []);

  // Control de Tema
  useEffect(() => {
    if (tema === 'claro') {
      document.body.style.backgroundColor = '#f8f9fa';
      document.body.style.color = '#212529';
    } else {
      document.body.style.backgroundColor = '#212529';
      document.body.style.color = '#f8f9fa';
    }
  }, [tema]);

  // REGLAS DE ACCESO (EL ORDEN IMPORTA)
  
  // 1. Si apenas estamos preguntando, mostramos una pantalla de carga
  if (configurado === null) {
    return <div className="vh-100 d-flex justify-content-center align-items-center bg-dark text-white"><h2 className="animate__animated animate__pulse animate__infinite">Iniciando sistema...</h2></div>;
  }

  // 2. Si Java dijo que NO está configurado (virgen), mostramos el asistente
  if (configurado === false) {
    return <AsistenteConfiguracion onCompletado={() => window.location.reload()} />;
  }

  // 3. Si SÍ está configurado pero está bloqueado, mostramos el teclado del PIN
  if (bloqueado) {
    return <PantallaBloqueo onDesbloquear={() => setBloqueado(false)} />;
  }

  return (
    <Router>
      {/* MAGIA: Cambiamos bg-dark o bg-light dependiendo del tema */}
      <div className={`d-flex ${tema === 'claro' ? 'bg-light text-dark' : 'bg-dark text-white'}`} style={{ minHeight: '100vh' }}>
      
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