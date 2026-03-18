import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import { TiendaContext } from '../context/TiendaContext'; // <-- Importamos la nube

function Proveedores() {
  // Bajamos tema y colorPrincipal
  const { tema, colorPrincipal } = useContext(TiendaContext); 

  const [proveedores, setProveedores] = useState([]);
  const [nuevoProveedor, setNuevoProveedor] = useState({
    nombreEmpresa: '', contactoNombre: '', telefono: '', diasVisita: []
  });

  // Estados para la edición
  const [proveedorEditado, setProveedorEditado] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const cargarProveedores = () => {
    axios.get('http://localhost:8080/api/proveedores').then(res => setProveedores(res.data));
  };

  useEffect(() => { cargarProveedores(); }, []);

  const manejarCambioDia = (dia, esEdicion = false) => {
    if (esEdicion) {
      const { diasVisita } = proveedorEditado;
      setProveedorEditado({
        ...proveedorEditado,
        diasVisita: diasVisita.includes(dia) 
          ? diasVisita.filter(d => d !== dia) 
          : [...diasVisita, dia]
      });
    } else {
      const { diasVisita } = nuevoProveedor;
      setNuevoProveedor({
        ...nuevoProveedor,
        diasVisita: diasVisita.includes(dia) 
          ? diasVisita.filter(d => d !== dia) 
          : [...diasVisita, dia]
      });
    }
  };

  const guardarProveedor = (e) => {
    e.preventDefault();
    const dataAEnviar = { ...nuevoProveedor, diasVisita: nuevoProveedor.diasVisita.join(', ') };
    axios.post('http://localhost:8080/api/proveedores', dataAEnviar).then(() => {
      Swal.fire('Éxito', 'Empresa registrada', 'success');
      cargarProveedores();
      setNuevoProveedor({ nombreEmpresa: '', contactoNombre: '', telefono: '', diasVisita: [] });
    });
  };

  const eliminarProveedor = (id) => {
    Swal.fire({
      title: '¿Eliminar empresa?',
      text: "Esto podría afectar a los productos asociados",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      confirmButtonText: 'Sí, eliminar'
    }).then((result) => {
      if (result.isConfirmed) {
        axios.delete(`http://localhost:8080/api/proveedores/${id}`).then(() => {
          cargarProveedores();
          Swal.fire('Eliminado', 'La empresa ha sido quitada', 'success');
        }).catch(err => Swal.fire('Error', 'No puedes eliminar una empresa que tiene productos activos', 'error'));
      }
    });
  };

  const prepararEdicion = (prov) => {
    const diasArray = prov.diasVisita ? prov.diasVisita.split(', ') : [];
    setProveedorEditado({ ...prov, diasVisita: diasArray });
    setShowModal(true);
  };

  const manejarActualizar = (e) => {
    e.preventDefault();
    const dataAEnviar = { ...proveedorEditado, diasVisita: proveedorEditado.diasVisita.join(', ') };
    axios.put(`http://localhost:8080/api/proveedores/${proveedorEditado.id}`, dataAEnviar)
      .then(() => {
        Swal.fire('Actualizado', 'Datos de la empresa actualizados', 'success');
        setShowModal(false);
        cargarProveedores();
      });
  };

  // Clases dinámicas para no repetir código
  const cardClass = `card shadow-sm mb-4 border-${colorPrincipal} ${tema === 'claro' ? 'bg-white text-dark' : 'bg-dark text-white'}`;
  const inputClass = `form-control ${tema === 'claro' ? 'bg-light text-dark' : 'bg-dark text-white border-secondary'}`;
  const tableClass = `table table-hover shadow-sm align-middle mb-0 ${tema === 'claro' ? 'table-light' : 'table-dark'}`;

  return (
    <div className={`container-fluid pb-5 ${tema === 'claro' ? 'text-dark' : 'text-white'}`}>
      <h2 className="mb-4 fw-bold">🚚 Gestión de Proveedores</h2>
      
      {/* FORMULARIO DE REGISTRO */}
      <div className={cardClass}>
        {/* Usamos el colorPrincipal para la cabecera del formulario */}
        <div className={`card-header bg-${colorPrincipal} text-white fw-bold`}>Registrar Empresa Proveedora</div>
        <div className="card-body">
          <form onSubmit={guardarProveedor}>
            <div className="row g-3 mb-3">
              <div className="col-md-4">
                <input type="text" className={inputClass} placeholder="Nombre Empresa" value={nuevoProveedor.nombreEmpresa} onChange={e => setNuevoProveedor({...nuevoProveedor, nombreEmpresa: e.target.value})} required />
              </div>
              <div className="col-md-4">
                <input type="text" className={inputClass} placeholder="Nombre Contacto" value={nuevoProveedor.contactoNombre} onChange={e => setNuevoProveedor({...nuevoProveedor, contactoNombre: e.target.value})} />
              </div>
              <div className="col-md-4">
                <input type="text" className={inputClass} placeholder="Teléfono" value={nuevoProveedor.telefono} onChange={e => setNuevoProveedor({...nuevoProveedor, telefono: e.target.value})} />
              </div>
            </div>
            <div className="mb-3">
              <label className="fw-bold mb-2">Días de Visita:</label>
              <div className={`d-flex flex-wrap gap-3 border p-2 rounded ${tema === 'claro' ? 'bg-light border-light' : 'bg-secondary bg-opacity-25 border-secondary'}`}>
                {['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'].map(dia => (
                  <div key={dia} className="form-check">
                    <input className="form-check-input" type="checkbox" checked={nuevoProveedor.diasVisita.includes(dia)} onChange={() => manejarCambioDia(dia)} />
                    <label className="form-check-label">{dia}</label>
                  </div>
                ))}
              </div>
            </div>
            {/* El botón de guardar también usa el colorPrincipal */}
            <button className={`btn btn-${colorPrincipal} w-100 fw-bold shadow-sm`}>Registrar Empresa</button>
          </form>
        </div>
      </div>

      {/* TABLA DE PROVEEDORES */}
      <div className={`card border-secondary shadow-sm ${tema === 'claro' ? 'bg-white' : 'bg-dark'}`}>
        <div className="table-responsive">
          <table className={tableClass}>
            <thead className={tema === 'claro' ? 'table-secondary text-dark' : 'text-secondary small'}>
              <tr>
                <th className="ps-4">Empresa</th>
                <th>Contacto</th>
                <th>Teléfono</th>
                <th>Días de Visita</th>
                <th className="text-center">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {proveedores.map(prov => (
                <tr key={prov.id}>
                  {/* El nombre de la empresa también resalta con el color principal */}
                  <td className={`fw-bold ps-4 text-${colorPrincipal}`}>{prov.nombreEmpresa}</td>
                  <td>{prov.contactoNombre}</td>
                  <td>{prov.telefono}</td>
                  <td><span className="badge bg-info text-dark shadow-sm">{prov.diasVisita}</span></td>
                  <td className="text-center">
                    <button className="btn btn-sm btn-outline-warning border-0 me-2" onClick={() => prepararEdicion(prov)}>✏️</button>
                    <button className="btn btn-sm btn-outline-danger border-0" onClick={() => eliminarProveedor(prov.id)}>🗑️</button>
                  </td>
                </tr>
              ))}
              {proveedores.length === 0 && (
                <tr>
                  <td colSpan="5" className="text-center py-4 text-muted">No hay proveedores registrados.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL DE EDICIÓN */}
      {showModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}>
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className={`modal-content shadow-lg border-secondary ${tema === 'claro' ? 'bg-white text-dark' : 'bg-dark text-white'}`}>
              <div className="modal-header bg-warning text-dark border-secondary">
                <h5 className="modal-title fw-bold">✏️ Editar Empresa</h5>
                <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
              </div>
              <form onSubmit={manejarActualizar}>
                <div className="modal-body row g-3">
                  <div className="col-md-6">
                    <label className="form-label fw-bold">Nombre Empresa</label>
                    <input type="text" className={inputClass} value={proveedorEditado.nombreEmpresa} 
                      onChange={e => setProveedorEditado({...proveedorEditado, nombreEmpresa: e.target.value})} required />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label fw-bold">Teléfono</label>
                    <input type="text" className={inputClass} value={proveedorEditado.telefono} 
                      onChange={e => setProveedorEditado({...proveedorEditado, telefono: e.target.value})} />
                  </div>
                  <div className="col-12">
                    <label className="fw-bold mb-2">Días de Visita:</label>
                    <div className={`d-flex flex-wrap gap-3 border p-2 rounded ${tema === 'claro' ? 'bg-light border-light' : 'bg-secondary bg-opacity-25 border-secondary'}`}>
                      {['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'].map(dia => (
                        <div key={dia} className="form-check">
                          <input className="form-check-input" type="checkbox" 
                            checked={proveedorEditado.diasVisita.includes(dia)} 
                            onChange={() => manejarCambioDia(dia, true)} />
                          <label className="form-check-label">{dia}</label>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="modal-footer border-secondary">
                  <button type="button" className={`btn ${tema === 'claro' ? 'btn-outline-dark' : 'btn-secondary'}`} onClick={() => setShowModal(false)}>Cancelar</button>
                  <button type="submit" className="btn btn-warning fw-bold text-dark shadow-sm">Actualizar Empresa</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Proveedores;