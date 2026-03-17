import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';

function Proveedores() {
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

  // Lógica para Eliminar
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

  // Lógica para preparar Edición
  const prepararEdicion = (prov) => {
    // Convertimos el string "Lunes, Martes" de vuelta a un array ["Lunes", "Martes"]
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

  return (
    <div>
      <h2 className="mb-4 fw-bold">🚚 Gestión de Proveedores</h2>
      
      {/* FORMULARIO DE REGISTRO */}
      <div className="card shadow-sm mb-4 border-0">
        <div className="card-header bg-success text-white fw-bold">Registrar Empresa Proveedora</div>
        <div className="card-body">
          <form onSubmit={guardarProveedor}>
            <div className="row g-3 mb-3">
              <div className="col-md-4">
                <input type="text" className="form-control" placeholder="Nombre Empresa" value={nuevoProveedor.nombreEmpresa} onChange={e => setNuevoProveedor({...nuevoProveedor, nombreEmpresa: e.target.value})} required />
              </div>
              <div className="col-md-4">
                <input type="text" className="form-control" placeholder="Nombre Contacto" value={nuevoProveedor.contactoNombre} onChange={e => setNuevoProveedor({...nuevoProveedor, contactoNombre: e.target.value})} />
              </div>
              <div className="col-md-4">
                <input type="text" className="form-control" placeholder="Teléfono" value={nuevoProveedor.telefono} onChange={e => setNuevoProveedor({...nuevoProveedor, telefono: e.target.value})} />
              </div>
            </div>
            <div className="mb-3">
              <label className="fw-bold mb-2">Días de Visita:</label>
              <div className="d-flex flex-wrap gap-3 border p-2 rounded bg-light">
                {['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'].map(dia => (
                  <div key={dia} className="form-check">
                    <input className="form-check-input" type="checkbox" checked={nuevoProveedor.diasVisita.includes(dia)} onChange={() => manejarCambioDia(dia)} />
                    <label className="form-check-label">{dia}</label>
                  </div>
                ))}
              </div>
            </div>
            <button className="btn btn-success w-100 fw-bold">Registrar Empresa</button>
          </form>
        </div>
      </div>

      {/* TABLA DE PROVEEDORES */}
      <table className="table table-hover shadow-sm bg-white align-middle">
        <thead className="table-dark">
          <tr>
            <th>Empresa</th>
            <th>Contacto</th>
            <th>Teléfono</th>
            <th>Días de Visita</th>
            <th className="text-center">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {proveedores.map(prov => (
            <tr key={prov.id}>
              <td className="fw-bold text-primary">{prov.nombreEmpresa}</td>
              <td>{prov.contactoNombre}</td>
              <td>{prov.telefono}</td>
              <td><span className="badge bg-info text-dark">{prov.diasVisita}</span></td>
              <td className="text-center">
                <button className="btn btn-sm btn-outline-warning me-2" onClick={() => prepararEdicion(prov)}>✏️</button>
                <button className="btn btn-sm btn-outline-danger" onClick={() => eliminarProveedor(prov.id)}>🗑️</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* MODAL DE EDICIÓN */}
      {showModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header bg-warning">
                <h5 className="modal-title fw-bold">✏️ Editar Empresa</h5>
                <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
              </div>
              <form onSubmit={manejarActualizar}>
                <div className="modal-body row g-3">
                  <div className="col-md-6">
                    <label className="form-label fw-bold">Nombre Empresa</label>
                    <input type="text" className="form-control" value={proveedorEditado.nombreEmpresa} 
                      onChange={e => setProveedorEditado({...proveedorEditado, nombreEmpresa: e.target.value})} required />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label fw-bold">Teléfono</label>
                    <input type="text" className="form-control" value={proveedorEditado.telefono} 
                      onChange={e => setProveedorEditado({...proveedorEditado, telefono: e.target.value})} />
                  </div>
                  <div className="col-12">
                    <label className="fw-bold mb-2">Días de Visita:</label>
                    <div className="d-flex flex-wrap gap-3 border p-2 rounded bg-light">
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
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancelar</button>
                  <button type="submit" className="btn btn-warning fw-bold">Actualizar Empresa</button>
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