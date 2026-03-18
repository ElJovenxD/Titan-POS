import React, { useContext } from 'react';
import { NavLink } from 'react-router-dom';
import { TiendaContext } from '../context/TiendaContext';

function Sidebar({ onBloquear }) {
  // Extraemos TODO de la nube
  const { nombreTienda, iconoTienda, tema, colorPrincipal } = useContext(TiendaContext); 

  // Clases dinámicas
  const activeClass = `nav-link text-white p-3 d-flex align-items-center shadow-sm bg-${colorPrincipal} rounded-3`;
  const inactiveClass = `nav-link ${tema === 'claro' ? 'text-secondary' : 'text-white-50'} p-3 d-flex align-items-center`;

  return (
    <div className={`d-flex flex-column vh-100 shadow ${tema === 'claro' ? 'bg-white border-end' : 'bg-dark text-white'}`} style={{ width: '260px', position: 'sticky', top: 0 }}>
      
      {/* LOGO Y TÍTULO */}
      <div className="p-4 mb-2 text-center border-bottom border-secondary">
        <div className="d-flex align-items-center justify-content-center gap-2">
          {iconoTienda.startsWith('data:image') ? (
            <img src={iconoTienda} alt="Logo" style={{ width: '35px', height: '35px', objectFit: 'contain', borderRadius: '5px' }} />
          ) : (
            <span className="fs-3">{iconoTienda}</span>
          )}
          <h4 className={`fw-bold m-0 text-${colorPrincipal}`}>{nombreTienda}</h4>
        </div>
        <small className="text-secondary opacity-75">Punto de Control</small>
      </div>

      {/* MENÚ DE NAVEGACIÓN (AQUÍ ESTÁ LA MAGIA DEL flex-nowrap) */}
      <nav className="nav nav-pills flex-column flex-nowrap p-3 gap-2 flex-grow-1 overflow-auto">
        <NavLink to="/" end className={({ isActive }) => isActive ? activeClass : inactiveClass}>
          <span className="me-3 fs-5">🏠</span> Dashboard
        </NavLink>
        <NavLink to="/inventario" className={({ isActive }) => isActive ? activeClass : inactiveClass}>
          <span className="me-3 fs-5">📦</span> Inventario
        </NavLink>
        <NavLink to="/proveedores" className={({ isActive }) => isActive ? activeClass : inactiveClass}>
          <span className="me-3 fs-5">🚚</span> Proveedores
        </NavLink>
        
        <div className="border-top border-secondary my-2"></div>
        
        <NavLink to="/ventas" className={({ isActive }) => isActive ? activeClass : inactiveClass}>
          <span className="me-3 fs-5">💰</span> Punto de Venta
        </NavLink>
        <NavLink to="/historial" className={({ isActive }) => isActive ? activeClass : inactiveClass}>
          <span className="me-3 fs-5">🧾</span> Historial de ventas
        </NavLink>
        <NavLink to="/fiados" className={({ isActive }) => isActive ? activeClass : inactiveClass}>
          <span className="me-3 fs-5">📖</span> Deudas
        </NavLink>
        <NavLink to="/compras" className={({ isActive }) => isActive ? activeClass : inactiveClass}>
          <span className="me-3 fs-5">📥</span> Compras
        </NavLink>
        <NavLink to="/corte" className={({ isActive }) => isActive ? activeClass : inactiveClass}>
          <span className="me-3 fs-5">💳</span> Corte de Caja
        </NavLink>
        <NavLink to="/ajustes" className={({ isActive }) => isActive ? activeClass : inactiveClass}>
          <span className="me-3 fs-5">⚙️</span> Ajustes
        </NavLink>
      </nav>

      {/* ZONA INFERIOR FIJA (BOTÓN DE BLOQUEO) */}
      <div className="p-3 border-top border-secondary mt-auto">
        <button 
          onClick={onBloquear} 
          className="btn btn-danger w-100 p-3 d-flex align-items-center justify-content-center fw-bold shadow mb-3"
          style={{ borderRadius: '10px', transition: 'all 0.2s' }}
        >
          <span className="me-2 fs-5">🔒</span> Bloquear Caja
        </button>
        <div className="text-center">
          <small className="text-secondary opacity-50">v1.1.0 - By ElJovenxD</small>
        </div>
      </div>
      
    </div>
  );
}

export default Sidebar;