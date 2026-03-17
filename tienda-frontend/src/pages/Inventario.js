import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';

function Inventario() {
  const [productos, setProductos] = useState([]);
  const [proveedores, setProveedores] = useState([]);
  const [filtro, setFiltro] = useState("");
  const [mostrarForm, setMostrarForm] = useState(false);

  // Estado para registro
  const [nuevoProducto, setNuevoProducto] = useState({
    codigoBarras: '', nombre: '', precioCompra: '', precioVenta: '', stockActual: '', proveedor: { id: '' }
  });

  // Estados para edición
  const [productoEditado, setProductoEditado] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const cargarDatos = () => {
    axios.get('http://localhost:8080/api/productos').then(res => setProductos(res.data));
    axios.get('http://localhost:8080/api/proveedores').then(res => setProveedores(res.data));
  };

  useEffect(() => { cargarDatos(); }, []);

  const manejarGuardar = (e) => {
    e.preventDefault();
    axios.post('http://localhost:8080/api/productos', nuevoProducto).then(() => {
      Swal.fire('¡Éxito!', 'Producto registrado', 'success');
      cargarDatos();
      setNuevoProducto({ codigoBarras: '', nombre: '', precioCompra: '', precioVenta: '', stockActual: '', proveedor: { id: '' } });
      setMostrarForm(false);
    }).catch(() => Swal.fire('Error', 'No se pudo guardar', 'error'));
  };

  const eliminarProducto = (id) => {
    Swal.fire({
      title: '¿Eliminar producto?',
      text: "Esta acción no se puede deshacer",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      confirmButtonText: 'Sí, eliminar'
    }).then((result) => {
      if (result.isConfirmed) {
        axios.delete(`http://localhost:8080/api/productos/${id}`).then(() => {
          cargarDatos();
          Swal.fire('Eliminado', 'El producto ha sido quitado', 'success');
        });
      }
    });
  };

  const prepararEdicion = (p) => {
    setProductoEditado({ ...p, proveedor: { id: p.proveedor?.id || '' } });
    setShowModal(true);
  };

  const manejarActualizar = (e) => {
    e.preventDefault();
    axios.put(`http://localhost:8080/api/productos/${productoEditado.id}`, productoEditado)
      .then(() => {
        Swal.fire('Actualizado', 'Cambios guardados', 'success');
        setShowModal(false);
        cargarDatos();
      }).catch(() => Swal.fire('Error', 'No se pudo actualizar', 'error'));
  };

  const productosFiltrados = productos.filter(p => 
    p.nombre.toLowerCase().includes(filtro.toLowerCase()) || p.codigoBarras?.includes(filtro)
  );

  return (
    <div className="container-fluid text-white pb-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="fw-bold m-0 text-white">📦 Gestión de Inventario</h2>
        <button 
          className={`btn ${mostrarForm ? 'btn-secondary' : 'btn-primary'} fw-bold shadow-sm`}
          onClick={() => setMostrarForm(!mostrarForm)}
        >
          {mostrarForm ? '✖️ Cancelar' : '➕ Nuevo Producto'}
        </button>
      </div>

      {/* FORMULARIO DE REGISTRO COLAPSABLE */}
      {mostrarForm && (
        <div className="card bg-dark border-primary mb-4 shadow animate__animated animate__fadeIn">
          <div className="card-header bg-primary text-white fw-bold">Registrar Nuevo Producto</div>
          <div className="card-body">
            <form onSubmit={manejarGuardar} className="row g-3">
              <div className="col-md-3">
                <label className="small text-secondary fw-bold">Código de Barras</label>
                <input type="text" className="form-control bg-dark text-white border-secondary" 
                  value={nuevoProducto.codigoBarras} onChange={e => setNuevoProducto({...nuevoProducto, codigoBarras: e.target.value})} required />
              </div>
              <div className="col-md-6">
                <label className="small text-secondary fw-bold">Nombre del Producto</label>
                <input type="text" className="form-control bg-dark text-white border-secondary" 
                  value={nuevoProducto.nombre} onChange={e => setNuevoProducto({...nuevoProducto, nombre: e.target.value})} required />
              </div>
              <div className="col-md-3">
                <label className="small text-secondary fw-bold">Empresa Proveedora</label>
                <select className="form-select bg-dark text-white border-secondary" 
                  value={nuevoProducto.proveedor.id} onChange={e => setNuevoProducto({...nuevoProducto, proveedor: {id: e.target.value}})} required>
                  <option value="">Selecciona...</option>
                  {proveedores.map(p => <option key={p.id} value={p.id}>{p.nombreEmpresa}</option>)}
                </select>
              </div>
              <div className="col-md-3">
                <label className="small text-secondary fw-bold">P. Compra</label>
                <input type="number" step="0.01" className="form-control bg-dark text-white border-secondary" 
                  value={nuevoProducto.precioCompra} onChange={e => setNuevoProducto({...nuevoProducto, precioCompra: e.target.value})} required />
              </div>
              <div className="col-md-3">
                <label className="small text-secondary fw-bold">P. Venta</label>
                <input type="number" step="0.01" className="form-control bg-dark text-white border-secondary" 
                  value={nuevoProducto.precioVenta} onChange={e => setNuevoProducto({...nuevoProducto, precioVenta: e.target.value})} required />
              </div>
              <div className="col-md-3">
                <label className="small text-secondary fw-bold">Existencia Inicial</label>
                <input type="number" className="form-control bg-dark text-white border-secondary" 
                  value={nuevoProducto.stockActual} onChange={e => setNuevoProducto({...nuevoProducto, stockActual: e.target.value})} required />
              </div>
              <div className="col-md-3 d-flex align-items-end">
                <button type="submit" className="btn btn-primary w-100 fw-bold">✅ Guardar Producto</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* BARRA DE BÚSQUEDA */}
      <div className="card bg-dark border-secondary mb-4 shadow-sm">
        <div className="card-body p-2">
          <div className="input-group">
            <span className="input-group-text bg-transparent border-0 text-secondary">🔍</span>
            <input type="text" className="form-control bg-transparent border-0 text-white" 
              placeholder="Buscar por nombre o código de barras..." onChange={(e) => setFiltro(e.target.value)} />
          </div>
        </div>
      </div>

      {/* TABLA DE PRODUCTOS */}
      <div className="card bg-dark border-secondary shadow">
        <div className="table-responsive">
          <table className="table table-dark table-hover align-middle mb-0">
            <thead className="text-secondary small">
              <tr>
                <th className="ps-4">CÓDIGO</th>
                <th>PRODUCTO</th>
                <th>P. COMPRA</th>
                <th>P. VENTA</th>
                <th className="text-center">STOCK</th>
                <th>EMPRESA</th>
                <th className="text-center">ACCIONES</th>
              </tr>
            </thead>
            <tbody>
              {productosFiltrados.map(p => (
                <tr key={p.id}>
                  <td className="ps-4 text-secondary small">{p.codigoBarras}</td>
                  <td className="fw-bold">{p.nombre}</td>
                  <td className="text-muted">${p.precioCompra}</td>
                  <td className="text-success fw-bold h5 mb-0">${p.precioVenta}</td>
                  <td className="text-center">
                    <span className={`badge rounded-pill ${p.stockActual < 5 ? 'bg-danger' : 'bg-primary'}`} style={{fontSize: '0.9rem'}}>
                      {p.stockActual} pz
                    </span>
                  </td>
                  <td>{p.proveedor?.nombreEmpresa || '---'}</td>
                  <td className="text-center">
                    <button className="btn btn-sm btn-outline-warning border-0 me-2" onClick={() => prepararEdicion(p)}>✏️</button>
                    <button className="btn btn-sm btn-outline-danger border-0" onClick={() => eliminarProducto(p.id)}>🗑️</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL PARA EDITAR */}
      {showModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.7)' }}>
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content bg-dark border-secondary shadow-lg">
              <div className="modal-header border-secondary bg-warning text-dark">
                <h5 className="modal-title fw-bold">✏️ Editar Producto</h5>
                <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
              </div>
              <form onSubmit={manejarActualizar}>
                <div className="modal-body row g-3 text-white">
                  {/* NUEVO CAMPO: Código de Barras */}
                  <div className="col-md-4">
                    <label className="small fw-bold text-secondary">Código de Barras</label>
                    <input type="text" className="form-control bg-dark text-white border-secondary" value={productoEditado.codigoBarras} 
                      onChange={e => setProductoEditado({...productoEditado, codigoBarras: e.target.value})} required />
                  </div>
                  <div className="col-md-8">
                    <label className="small fw-bold text-secondary">Nombre del Producto</label>
                    <input type="text" className="form-control bg-dark text-white border-secondary" value={productoEditado.nombre} 
                      onChange={e => setProductoEditado({...productoEditado, nombre: e.target.value})} required />
                  </div>
                  
                  <div className="col-md-3">
                    <label className="small fw-bold text-secondary">Empresa</label>
                    <select className="form-select bg-dark text-white border-secondary" value={productoEditado.proveedor.id} 
                      onChange={e => setProductoEditado({...productoEditado, proveedor: {id: e.target.value}})} required>
                      {proveedores.map(p => <option key={p.id} value={p.id}>{p.nombreEmpresa}</option>)}
                    </select>
                  </div>
                  <div className="col-md-3">
                    <label className="small fw-bold text-secondary">Precio Compra</label>
                    <input type="number" step="0.01" className="form-control bg-dark text-white border-secondary" value={productoEditado.precioCompra} 
                      onChange={e => setProductoEditado({...productoEditado, precioCompra: e.target.value})} required />
                  </div>
                  <div className="col-md-3">
                    <label className="small fw-bold text-secondary">Precio Venta</label>
                    <input type="number" step="0.01" className="form-control bg-dark text-white border-secondary" value={productoEditado.precioVenta} 
                      onChange={e => setProductoEditado({...productoEditado, precioVenta: e.target.value})} required />
                  </div>
                  <div className="col-md-3">
                    <label className="small fw-bold text-secondary">Existencia</label>
                    <input type="number" className="form-control bg-dark text-white border-secondary" value={productoEditado.stockActual} 
                      onChange={e => setProductoEditado({...productoEditado, stockActual: e.target.value})} required />
                  </div>
                </div>
                <div className="modal-footer border-secondary">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancelar</button>
                  <button type="submit" className="btn btn-warning fw-bold text-dark">Guardar Cambios</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Inventario;