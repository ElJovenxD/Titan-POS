import React, { useState } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';

function AsistenteConfiguracion({ onCompletado }) {
  const [datos, setDatos] = useState({
    nombreTienda: '',
    pinActual: '',
    correoAlertas: ''
  });

  const handleGuardar = async (e) => {
    e.preventDefault();
    
    if (datos.pinActual.length !== 4) {
      return Swal.fire('Atención', 'El PIN debe ser de 4 dígitos exactos.', 'warning');
    }

    try {
      await axios.post('http://localhost:8080/api/seguridad/inicial', datos);
      Swal.fire({
        title: '¡Todo listo!',
        text: 'Tu Punto de Venta ha sido configurado. Iniciando sistema...',
        icon: 'success',
        timer: 2000,
        showConfirmButton: false
      }).then(() => {
        onCompletado(); // Avisamos que ya terminó para que recargue
      });
    } catch (error) {
      Swal.fire('Error', 'No se pudo guardar la configuración.', 'error');
    }
  };

  return (
    <div className="vh-100 d-flex justify-content-center align-items-center bg-dark text-white" style={{ position: 'fixed', top: 0, left: 0, width: '100%', zIndex: 9999 }}>
      <div className="card bg-black border-success shadow-lg p-5" style={{ width: '500px', borderRadius: '15px' }}>
        <div className="text-center mb-4">
          <div className="display-1 mb-3">🚀</div>
          <h2 className="fw-bold text-success">¡Bienvenido!</h2>
          <p className="text-secondary">Vamos a configurar tu Punto de Venta por primera vez.</p>
        </div>

        <form onSubmit={handleGuardar}>
          <div className="mb-3">
            <label className="form-label fw-bold text-secondary">Nombre de tu Negocio</label>
            <input 
              type="text" 
              className="form-control form-control-lg bg-dark text-white border-secondary" 
              placeholder="Ej. Abarrotes Don Pepe"
              value={datos.nombreTienda}
              onChange={e => setDatos({...datos, nombreTienda: e.target.value})}
              required autoFocus
            />
          </div>

          <div className="mb-3">
            <label className="form-label fw-bold text-secondary">PIN de Seguridad (4 dígitos)</label>
            <input 
              type="password" 
              className="form-control form-control-lg bg-dark text-white border-secondary text-center letter-spacing-lg" 
              placeholder="****"
              maxLength="4"
              value={datos.pinActual}
              onChange={e => setDatos({...datos, pinActual: e.target.value.replace(/\D/g, '')})}
              required
            />
            <small className="text-muted">Con este código desbloquearás la caja.</small>
          </div>

          <div className="mb-4">
            <label className="form-label fw-bold text-secondary">Correo de Recuperación/Alertas</label>
            <input 
              type="email" 
              className="form-control form-control-lg bg-dark text-white border-secondary" 
              placeholder="tu@correo.com"
              value={datos.correoAlertas}
              onChange={e => setDatos({...datos, correoAlertas: e.target.value})}
              required
            />
          </div>

          <button type="submit" className="btn btn-success btn-lg w-100 fw-bold shadow">
            Comenzar a usar el sistema ➡️
          </button>
        </form>
      </div>
    </div>
  );
}

export default AsistenteConfiguracion;