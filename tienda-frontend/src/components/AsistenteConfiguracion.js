import React, { useState } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';

function AsistenteConfiguracion({ onCompletado }) {
  const [datos, setDatos] = useState({
    nombreTienda: '',
    pinActual: '',
    correoAlertas: '',
    passwordCorreo: '' // <-- Nuevo estado para la clave
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
        onCompletado();
      });
    } catch (error) {
      Swal.fire('Error', 'No se pudo guardar la configuración.', 'error');
    }
  };

  return (
    <div className="vh-100 d-flex justify-content-center align-items-center bg-dark text-white" style={{ position: 'fixed', top: 0, left: 0, width: '100%', zIndex: 9999, overflowY: 'auto' }}>
      <div className="card bg-black border-success shadow-lg p-5 my-4" style={{ width: '500px', borderRadius: '15px' }}>
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

          <div className="mb-3">
            <label className="form-label fw-bold text-secondary">Correo Gmail para Alertas</label>
            <input 
              type="email" 
              className="form-control form-control-lg bg-dark text-white border-secondary" 
              placeholder="tu_correo@gmail.com"
              value={datos.correoAlertas}
              onChange={e => setDatos({...datos, correoAlertas: e.target.value})}
              required
            />
          </div>

          {/* LA MINI-GUÍA PARA EL USUARIO NUEVO */}
          <div className="mb-4">
            <label className="form-label fw-bold text-secondary">Contraseña de Aplicación de Google</label>
            <input 
              type="password" 
              className="form-control form-control-lg bg-dark text-white border-secondary" 
              placeholder="16 letras (Ej: abcd efgh ijkl mnop)"
              value={datos.passwordCorreo}
              onChange={e => setDatos({...datos, passwordCorreo: e.target.value})}
            />
            <div className="mt-2 p-3 rounded bg-dark border-start border-warning border-4 text-white-50 small">
              <span className="d-block text-warning fw-bold mb-1">💡 ¿Cómo obtengo esta clave?</span>
              1. Ve a los ajustes de tu <b>Cuenta de Google</b>.<br/>
              2. Entra a <b>Seguridad</b> y activa la <b>Verificación en 2 pasos</b>.<br/>
              3. Busca <b>Contraseñas de aplicaciones</b> y genera una para "Correo".<br/>
              <span className="d-block mt-1 fst-italic">Si dejas esto en blanco, el sistema funcionará pero no te enviará alertas de intrusión.</span>
            </div>
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