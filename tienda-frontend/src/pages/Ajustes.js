import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';

function Ajustes() {
  const [seccionActiva, setSeccionActiva] = useState('negocio'); // Que empiece en negocio

  // Estados para la Seguridad
  const [pinActual, setPinActual] = useState('');
  const [pinNuevo, setPinNuevo] = useState('');
  const [correoAlertas, setCorreoAlertas] = useState('');

  const [nombreTienda, setNombreTienda] = useState('');
  const [iconoTienda, setIconoTienda] = useState('🏪'); // <-- NUEVO

  const opcionesIconos = ['🏪', '🛒', '🛍️', '🍎', '🥩', '🍺', '💊', '🔧', '📱', '🎮'];
  // --- FUNCIÓN PARA LEER LA IMAGEN ---
  const handleSubirLogo = (e) => {
    const archivo = e.target.files[0];
    if (!archivo) return;

    // Limitar a 1 MB (1,048,576 bytes)
    if (archivo.size > 1048576) {
      Swal.fire('Imagen muy pesada', 'Por favor elige un logo que pese menos de 1 MB.', 'warning');
      e.target.value = null; // Limpiar el input
      return;
    }

    // Convertir la imagen a texto (Base64)
    const reader = new FileReader();
    reader.onloadend = () => {
      setIconoTienda(reader.result); // Guardamos el texto gigante en el mismo estado
    };
    reader.readAsDataURL(archivo);
  };

  // --- NUEVO: CARGAR DATOS ACTUALES AL ABRIR LA PANTALLA ---
  useEffect(() => {
    axios.get('http://localhost:8080/api/seguridad/obtener')
      .then(res => {
        setNombreTienda(res.data.nombreTienda);
        setIconoTienda(res.data.iconoTienda); // <-- NUEVO
      })
      .catch(err => console.error("Error al cargar la configuración", err));
  }, []);

  // --- NUEVO: FUNCIÓN GUARDAR NEGOCIO ---
  const handleGuardarNegocio = async () => {
    if (!nombreTienda.trim()) {
      Swal.fire('Atención', 'El nombre de la tienda no puede estar vacío.', 'warning');
      return;
    }

    try {
      const respuesta = await axios.post('http://localhost:8080/api/seguridad/actualizar-negocio', {
        nombreTienda: nombreTienda,
        iconoTienda: iconoTienda // <--- ¡ESTO ERA LO QUE FALTABA!
      });
      
      Swal.fire({
        title: '¡Actualizado!',
        text: respuesta.data.mensaje,
        icon: 'success',
        timer: 1500,
        showConfirmButton: false
      }).then(() => {
        // Recargamos la página rápidamente para que el menú izquierdo se actualice con el nuevo nombre
        window.location.reload();
      });
    } catch (error) {
      Swal.fire('Error', 'No se pudo guardar el nombre del negocio.', 'error');
    }
  };

  // --- FUNCIÓN: CAMBIAR PIN ---
  const handleCambiarPin = async () => {
    if (pinActual.length !== 4 || pinNuevo.length !== 4) {
      Swal.fire('Atención', 'Ambos PINs deben tener exactamente 4 números.', 'warning');
      return;
    }

    try {
      const respuesta = await axios.post('http://localhost:8080/api/seguridad/cambiar-pin', {
        pinActual: pinActual,
        pinNuevo: pinNuevo
      });
      
      Swal.fire('¡Éxito!', respuesta.data.mensaje, 'success');
      setPinActual(''); 
      setPinNuevo('');
    } catch (error) {
      if (error.response) {
        Swal.fire('Error', error.response.data.error, 'error');
      } else {
        Swal.fire('Error de conexión', 'No se pudo contactar al servidor.', 'error');
      }
    }
  };

  // --- FUNCIÓN: GUARDAR CORREO ---
  const handleGuardarCorreo = async () => {
    if (!correoAlertas.includes('@')) {
      Swal.fire('Atención', 'Ingresa un correo electrónico válido.', 'warning');
      return;
    }

    try {
      const respuesta = await axios.post('http://localhost:8080/api/seguridad/actualizar-correo', {
        correo: correoAlertas
      });
      
      Swal.fire('¡Actualizado!', respuesta.data.mensaje, 'success');
      setCorreoAlertas('');
    } catch (error) {
      Swal.fire('Error', 'No se pudo guardar el correo.', 'error');
    }
  };

  return (
    <div className="container p-4 text-white">
      <h2 className="fw-bold mb-4">⚙️ Configuración del Sistema</h2>

      <div className="row">
        {/* MENÚ LATERAL DE AJUSTES */}
        <div className="col-md-3 mb-4">
          <div className="list-group shadow-sm">
            <button 
              className={`list-group-item list-group-item-action fw-bold ${seccionActiva === 'negocio' ? 'active bg-success border-success text-white' : 'bg-dark text-secondary border-secondary'}`}
              onClick={() => setSeccionActiva('negocio')}
            >
              🏪 Datos del Negocio
            </button>
            <button 
              className={`list-group-item list-group-item-action fw-bold ${seccionActiva === 'seguridad' ? 'active bg-success border-success text-white' : 'bg-dark text-secondary border-secondary'}`}
              onClick={() => setSeccionActiva('seguridad')}
            >
              🔒 Seguridad
            </button>
            <button 
              className={`list-group-item list-group-item-action fw-bold ${seccionActiva === 'apariencia' ? 'active bg-success border-success text-white' : 'bg-dark text-secondary border-secondary'}`}
              onClick={() => setSeccionActiva('apariencia')}
            >
              🎨 Apariencia
            </button>
          </div>
        </div>

        {/* CONTENIDO DE LOS AJUSTES */}
        <div className="col-md-9">
          <div className="card shadow-sm border-secondary bg-dark text-white">
            <div className="card-body p-4">

              {seccionActiva === 'negocio' && (
                <div>
                  <h4 className="mb-4 text-success fw-bold">Información del Establecimiento</h4>
                  <div className="mb-3">
                    <label className="form-label text-secondary">Nombre de la Tienda</label>
                    <input type="text" className="form-control form-control-lg bg-dark text-white border-secondary" value={nombreTienda} onChange={(e) => setNombreTienda(e.target.value)} />
                  </div>
                  
                  <div className="mb-4">
                    <label className="form-label text-secondary">Ícono / Logo del Negocio</label>
                    
                    {/* VISTA PREVIA */}
                    <div className="mb-3 p-3 bg-black rounded text-center border border-secondary" style={{width: 'fit-content'}}>
                      {iconoTienda.startsWith('data:image') ? (
                        <img src={iconoTienda} alt="Logo" style={{ width: '80px', height: '80px', objectFit: 'contain' }} />
                      ) : (
                        <span style={{ fontSize: '60px' }}>{iconoTienda}</span>
                      )}
                    </div>

                    {/* BOTÓN PARA SUBIR IMAGEN */}
                    <input 
                      type="file" 
                      className="form-control bg-dark text-white border-secondary mb-3 w-50" 
                      accept="image/png, image/jpeg" 
                      onChange={handleSubirLogo}
                    />

                    <small className="text-secondary d-block mb-2">O elige un emoji rápido:</small>
                    <div className="d-flex flex-wrap gap-2 mb-2">
                      {opcionesIconos.map(icono => (
                        <button 
                          key={icono} 
                          className={`btn fs-4 ${iconoTienda === icono ? 'btn-success shadow' : 'btn-outline-secondary'}`}
                          onClick={() => setIconoTienda(icono)}
                        >
                          {icono}
                        </button>
                      ))}
                    </div>
                  </div>

                  <button onClick={handleGuardarNegocio} className="btn btn-success px-4 fw-bold shadow-sm">Guardar Cambios</button>
                </div>
              )}

              {seccionActiva === 'seguridad' && (
                <div>
                  <h4 className="mb-4 text-success fw-bold">Seguridad y Alertas</h4>
                  
                  <h6 className="fw-bold mt-4">Cambio de PIN de la Caja</h6>
                  <div className="row mb-3">
                    <div className="col-md-4">
                      <label className="form-label text-secondary">PIN Actual</label>
                      <input 
                        type="password" 
                        className="form-control text-center fs-4 bg-dark text-white border-secondary" 
                        maxLength="4"
                        value={pinActual}
                        onChange={(e) => setPinActual(e.target.value.replace(/\D/g, ''))}
                      />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label text-secondary">Nuevo PIN</label>
                      <input 
                        type="password" 
                        className="form-control text-center fs-4 bg-dark text-white border-secondary" 
                        maxLength="4"
                        value={pinNuevo}
                        onChange={(e) => setPinNuevo(e.target.value.replace(/\D/g, ''))}
                      />
                    </div>
                  </div>
                  <button onClick={handleCambiarPin} className="btn btn-danger mb-4 fw-bold shadow-sm">Actualizar PIN</button>

                  <hr className="border-secondary"/>

                  <h6 className="fw-bold mt-4">Correo de Alertas</h6>
                  <p className="text-secondary small">A este correo llegarán los avisos de intrusión y cortes de caja.</p>
                  <div className="mb-3">
                    <input 
                      type="email" 
                      className="form-control bg-dark text-white border-secondary" 
                      placeholder="ejemplo@correo.com"
                      value={correoAlertas}
                      onChange={(e) => setCorreoAlertas(e.target.value)}
                    />
                  </div>
                  <button onClick={handleGuardarCorreo} className="btn btn-success fw-bold shadow-sm">Guardar Correo</button>
                </div>
              )}

              {seccionActiva === 'apariencia' && (
                <div>
                  <h4 className="mb-4 text-success fw-bold">Personalización Visual</h4>
                  <p className="text-secondary">Próximamente... (Aquí pondremos el modo oscuro/claro y los colores)</p>
                </div>
              )}

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Ajustes;