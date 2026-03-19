import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import { TiendaContext } from '../context/TiendaContext';

function Ajustes() {
  // Extraemos las funciones 'set' del contexto para actualizar la UI en tiempo real
  const { tema, colorPrincipal, setTema, setColorPrincipal, setNombreTienda, setIconoTienda } = useContext(TiendaContext);

  const [seccionActiva, setSeccionActiva] = useState('negocio');

  // Estados locales para los formularios
  const [pinActual, setPinActual] = useState('');
  const [pinNuevo, setPinNuevo] = useState('');
  const [correoAlertas, setCorreoAlertas] = useState('');
  const [passwordCorreo, setPasswordCorreo] = useState(''); // <-- Estado para la clave de 16 dígitos
  const [nombreTiendaLocal, setNombreTiendaLocal] = useState('');
  const [iconoTiendaLocal, setIconoTiendaLocal] = useState('🏪');

  // Estados locales para la pestaña de apariencia (previsualización)
  const [temaLocal, setTemaLocal] = useState('oscuro');
  const [colorLocal, setColorLocal] = useState('success');

  const opcionesIconos = ['🏪', '🛒', '🛍️', '🍎', '🥩', '🍺', '💊', '🔧', '📱', '🎮'];

  useEffect(() => {
    axios.get('http://localhost:8080/api/seguridad/obtener')
      .then(res => {
        // Llenamos los estados locales para que los inputs no aparezcan vacíos
        setNombreTiendaLocal(res.data.nombreTienda || '');
        setIconoTiendaLocal(res.data.iconoTienda || '🏪');
        setTemaLocal(res.data.tema || 'oscuro');
        setColorLocal(res.data.colorPrincipal || 'success');
        setCorreoAlertas(res.data.correoAlertas || ''); 
        setPasswordCorreo(res.data.passwordCorreo || ''); // <-- Cargamos la clave guardada
      })
      .catch(err => console.error("Error al cargar la configuración", err));
  }, []);

  // 1. Guardar Datos del Negocio
  const handleGuardarNegocio = async () => {
    if (!nombreTiendaLocal.trim()) return Swal.fire('Atención', 'El nombre no puede estar vacío.', 'warning');
    try {
      const res = await axios.post('http://localhost:8080/api/seguridad/actualizar-negocio', { 
        nombreTienda: nombreTiendaLocal, 
        iconoTienda: iconoTiendaLocal 
      });
      
      // Actualizamos el contexto para que el Sidebar cambie sin recargar
      setNombreTienda(nombreTiendaLocal);
      setIconoTienda(iconoTiendaLocal);

      Swal.fire({ title: '¡Actualizado!', text: res.data.mensaje, icon: 'success', timer: 1500, showConfirmButton: false });
    } catch (error) {
      Swal.fire('Error', 'No se pudo guardar el negocio.', 'error');
    }
  };

  // 2. Cambiar PIN (Cierra sesión por seguridad)
  const handleCambiarPin = async () => {
    if (pinActual.length !== 4 || pinNuevo.length !== 4) return Swal.fire('Atención', 'Deben ser 4 números.', 'warning');
    try {
      await axios.post('http://localhost:8080/api/seguridad/cambiar-pin', { pinActual, pinNuevo });
      Swal.fire({
        title: '¡PIN Cambiado!',
        text: 'Por seguridad, el sistema se bloqueará. Ingresa con tu nuevo PIN.',
        icon: 'success'
      }).then(() => {
        window.location.reload(); 
      });
    } catch (error) {
      Swal.fire('Error', error.response?.data?.error || 'Error de servidor', 'error');
    }
  };

  // 3. Guardar Correo y Contraseña de Aplicación (CORREGIDO)
  const handleGuardarCorreo = async () => {
    if (!correoAlertas.includes('@')) return Swal.fire('Atención', 'Ingresa un correo válido.', 'warning');
    try {
      // Enviamos ambos campos a Java
      const res = await axios.post('http://localhost:8080/api/seguridad/actualizar-correo', { 
        correo: correoAlertas,
        password: passwordCorreo 
      });
      Swal.fire('¡Configuración Guardada!', res.data.mensaje, 'success');
    } catch (error) {
      Swal.fire('Error', 'No se pudo guardar la configuración de alertas.', 'error');
    }
  };

  // 4. Guardar Apariencia
  const handleGuardarApariencia = async () => {
    try {
      await axios.post('http://localhost:8080/api/seguridad/actualizar-apariencia', {
        tema: temaLocal, colorPrincipal: colorLocal
      });
      setTema(temaLocal);
      setColorPrincipal(colorLocal);
      Swal.fire({ toast: true, position: 'top-end', title: 'Apariencia aplicada 🐈🧡', icon: 'success', timer: 3000, showConfirmButton: false });
    } catch (error) {
      Swal.fire('Error', 'No se pudo guardar la apariencia.', 'error');
    }
  };

  const handleSubirLogo = (e) => {
    const archivo = e.target.files[0];
    if (!archivo) return;
    if (archivo.size > 1048576) {
      Swal.fire('Imagen muy pesada', 'Máximo 1 MB.', 'warning');
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => setIconoTiendaLocal(reader.result);
    reader.readAsDataURL(archivo);
  };

  // Clases dinámicas
  const cardClass = `card shadow-sm border-secondary ${tema === 'claro' ? 'bg-white text-dark' : 'bg-dark text-white'}`;
  const inputClass = `form-control form-control-lg border-secondary ${tema === 'claro' ? 'bg-light text-dark' : 'bg-dark text-white'}`;
  const inputPinClass = `form-control text-center fs-4 border-secondary ${tema === 'claro' ? 'bg-light text-dark' : 'bg-dark text-white'}`;
  
  const getMenuBtnClass = (seccion) => {
    if (seccionActiva === seccion) {
      return `list-group-item list-group-item-action fw-bold active bg-${colorPrincipal} border-${colorPrincipal} text-white`;
    }
    return `list-group-item list-group-item-action fw-bold ${tema === 'claro' ? 'bg-light text-secondary border-bottom' : 'bg-dark text-secondary border-secondary border-bottom'}`;
  };

  return (
    <div className={`container-fluid pb-5 ${tema === 'claro' ? 'text-dark' : 'text-white'}`}>
      <h2 className="fw-bold mb-4">⚙️ Configuración del Sistema</h2>

      <div className="row">
        <div className="col-md-3 mb-4">
          <div className="list-group shadow-sm">
            <button className={getMenuBtnClass('negocio')} onClick={() => setSeccionActiva('negocio')}>🏪 Datos del Negocio</button>
            <button className={getMenuBtnClass('seguridad')} onClick={() => setSeccionActiva('seguridad')}>🔒 Seguridad</button>
            <button className={getMenuBtnClass('apariencia')} onClick={() => setSeccionActiva('apariencia')}>🎨 Apariencia</button>
          </div>
        </div>

        <div className="col-md-9">
          <div className={cardClass}>
            <div className="card-body p-4">

              {seccionActiva === 'negocio' && (
                <div>
                  <h4 className={`mb-4 fw-bold text-${colorPrincipal}`}>Información del Establecimiento</h4>
                  <div className="mb-3">
                    <label className="form-label text-secondary fw-bold">Nombre de la Tienda</label>
                    <input type="text" className={inputClass} value={nombreTiendaLocal} onChange={(e) => setNombreTiendaLocal(e.target.value)} />
                  </div>
                  
                  <div className="mb-4">
                    <label className="form-label text-secondary fw-bold">Ícono / Logo del Negocio</label>
                    <div className={`mb-3 p-3 rounded text-center border border-secondary ${tema === 'claro' ? 'bg-light' : 'bg-black'}`} style={{width: 'fit-content'}}>
                      {iconoTiendaLocal.startsWith('data:image') ? (
                        <img src={iconoTiendaLocal} alt="Logo" style={{ width: '80px', height: '80px', objectFit: 'contain' }} />
                      ) : (
                        <span style={{ fontSize: '60px' }}>{iconoTiendaLocal}</span>
                      )}
                    </div>
                    <input type="file" className={inputClass} accept="image/*" onChange={handleSubirLogo} />
                    <div className="d-flex flex-wrap gap-2 mt-3">
                      {opcionesIconos.map(icono => (
                        <button key={icono} className={`btn fs-4 ${iconoTiendaLocal === icono ? `btn-${colorPrincipal} shadow` : 'btn-outline-secondary'}`} onClick={() => setIconoTiendaLocal(icono)}>
                          {icono}
                        </button>
                      ))}
                    </div>
                  </div>
                  <button onClick={handleGuardarNegocio} className={`btn btn-${colorPrincipal} px-4 fw-bold shadow-sm`}>Guardar Datos</button>
                </div>
              )}

              {seccionActiva === 'seguridad' && (
                <div>
                  <h4 className={`mb-4 fw-bold text-${colorPrincipal}`}>Seguridad y Alertas</h4>
                  <div className="row mb-3">
                    <div className="col-md-4">
                      <label className="form-label text-secondary fw-bold">PIN Actual</label>
                      <input type="password" className={inputPinClass} maxLength="4" value={pinActual} onChange={(e) => setPinActual(e.target.value.replace(/\D/g, ''))} />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label text-secondary fw-bold">Nuevo PIN</label>
                      <input type="password" className={inputPinClass} maxLength="4" value={pinNuevo} onChange={(e) => setPinNuevo(e.target.value.replace(/\D/g, ''))} />
                    </div>
                  </div>
                  <button onClick={handleCambiarPin} className="btn btn-danger mb-5 fw-bold shadow-sm">Actualizar PIN</button>

                  <hr className="border-secondary opacity-25 mb-4" />

                  <h5 className="fw-bold mb-3">Configuración de Envío de Alertas</h5>
                  <div className="mb-3">
                    <label className="form-label text-secondary fw-bold">Tu Correo Gmail</label>
                    <input type="email" className={inputClass} placeholder="ejemplo@gmail.com" value={correoAlertas} onChange={(e) => setCorreoAlertas(e.target.value)} />
                  </div>
                  <div className="mb-3">
                    <label className="form-label text-secondary fw-bold">Contraseña de Aplicación de Google</label>
                    <input type="password" className={inputClass} placeholder="Clave de 16 dígitos" value={passwordCorreo} onChange={(e) => setPasswordCorreo(e.target.value)} />
                    <small className="text-secondary">Esta clave permite que el sistema envíe alertas desde tu cuenta.</small>
                  </div>
                  <button onClick={handleGuardarCorreo} className={`btn btn-${colorPrincipal} mt-2 fw-bold shadow-sm px-4`}>Guardar Configuración de Correo</button>
                </div>
              )}

              {seccionActiva === 'apariencia' && (
                <div className="animate__animated animate__fadeIn">
                  <h4 className={`mb-4 fw-bold text-${colorPrincipal}`}>Personalización Visual</h4>
                  <div className="mb-4">
                    <label className="form-label fw-bold text-secondary">Modo de Pantalla</label>
                    <div className="d-flex gap-3">
                      <button className={`btn px-4 py-2 fw-bold ${temaLocal === 'claro' ? 'btn-light text-dark shadow border-secondary' : 'btn-outline-secondary'}`} onClick={() => setTemaLocal('claro')}>☀️ Claro</button>
                      <button className={`btn px-4 py-2 fw-bold ${temaLocal === 'oscuro' ? 'btn-dark shadow border-light' : 'btn-outline-secondary'}`} onClick={() => setTemaLocal('oscuro')}>🌙 Oscuro</button>
                    </div>
                  </div>
                  <div className="mb-5">
                    <label className="form-label fw-bold text-secondary">Color Principal</label>
                    <div className="d-flex gap-3 flex-wrap">
                      {['success', 'primary', 'danger', 'warning', 'info', 'orange'].map(color => (
                        <div 
                          key={color} onClick={() => setColorLocal(color)}
                          className={`rounded-circle bg-${color} shadow cursor-pointer`}
                          style={{ 
                            width: '50px', height: '50px',
                            border: colorLocal === color ? '4px solid #888' : 'none',
                            opacity: colorLocal === color ? '1' : '0.4',
                            transform: colorLocal === color ? 'scale(1.1)' : 'scale(1)',
                            transition: 'all 0.2s'
                          }}
                        ></div>
                      ))}
                    </div>
                  </div>
                  <button onClick={handleGuardarApariencia} className={`btn btn-${colorPrincipal} px-4 fw-bold shadow-sm`}>Aplicar Apariencia</button>
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