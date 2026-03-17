import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';

function Compras() {
  const [productos, setProductos] = useState([]);
  const [proveedores, setProveedores] = useState([]);
  const [filtro, setFiltro] = useState("");
  const [seleccion, setSeleccion] = useState({ prod: null, provId: "" });
  const [datosCompra, setDatosCompra] = useState({ cantidad: "", precio: "" });

  useEffect(() => {
    axios.get('http://localhost:8080/api/productos').then(res => setProductos(res.data));
    axios.get('http://localhost:8080/api/proveedores').then(res => setProveedores(res.data));
  }, []);

  const ejecutarCompra = () => {
    if (!seleccion.prod || !datosCompra.cantidad || !datosCompra.precio) {
      return Swal.fire('Faltan datos', 'Completa todos los campos', 'warning');
    }

    const payload = {
      productoId: seleccion.prod.id,
      proveedorId: seleccion.provId,
      cantidad: parseInt(datosCompra.cantidad),
      precioCompra: parseFloat(datosCompra.precio)
    };

    axios.post('http://localhost:8080/api/compras', payload)
      .then(() => {
        Swal.fire('Éxito', 'Stock actualizado y compra registrada', 'success');
        setSeleccion({ prod: null, provId: "" });
        setDatosCompra({ cantidad: "", precio: "" });
      })
      .catch(() => Swal.fire('Error', 'No se pudo registrar la compra', 'error'));
  };

  const prodFiltrados = productos.filter(p => 
    p.nombre.toLowerCase().includes(filtro.toLowerCase()) || 
    (p.codigoBarras && p.codigoBarras.includes(filtro))
  );

  return (
    <div className="container-fluid text-white">
      <h2 className="fw-bold mb-4">📦 Registro de Mercancía (Entradas)</h2>
      
      <div className="row g-4">
        {/* BUSCADOR DE PRODUCTOS */}
        {/* BUSCADOR DE PRODUCTOS */}
        <div className="col-md-6">
          <div className="card bg-dark border-secondary p-3">
            <h5 className="text-info mb-3">1. Selecciona el Producto</h5>
            <input 
              type="text" 
              className="form-control bg-dark text-white border-secondary mb-3" 
              placeholder="Buscar por nombre o escanear..." 
              autoFocus /* <-- IMPORTANTE: Pone el cursor ahí al abrir la pantalla */
              
              // 1. Aquí controlamos lo que escribes (o lo que escribe la pistola)
              onChange={(e) => setFiltro(e.target.value)}
              
              // 2. Aquí interceptamos el "Enter" de la pistola
              onKeyDown={(e) => {
                if (e.key === 'Enter' && e.target.value !== "") {
                  e.preventDefault(); // Evita que la página recargue por accidente
                  
                  // OJO: Asegúrate de que tu array original se llame 'productos' o cambia el nombre aquí abajo
                  const productoEscaneado = productos.find(p => p.codigoBarras === e.target.value);
                  
                  if (productoEscaneado) {
                    // Si encuentra el código, lo selecciona solito
                    setSeleccion({...seleccion, prod: productoEscaneado});
                    setDatosCompra({...datosCompra, precio: productoEscaneado.precioCompra});
                    
                    // Opcional: limpiar la barra de búsqueda después de escanear
                    e.target.value = ""; 
                    setFiltro("");
                  }
                }
              }}
            />
            <div className="list-group overflow-auto" style={{maxHeight: '300px'}}>
              {prodFiltrados.map(p => (
                <button 
                  key={p.id} 
                  className={`list-group-item list-group-item-action ${seleccion.prod?.id === p.id ? 'active' : 'bg-dark text-white border-secondary'}`}
                  onClick={() => {
                    setSeleccion({...seleccion, prod: p});
                    setDatosCompra({...datosCompra, precio: p.precioCompra}); // Sugerir el último precio
                  }}
                >
                  {p.nombre} <small className="text-muted">(Stock: {p.stockActual})</small>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* DETALLES DE LA COMPRA */}
        <div className="col-md-6">
          <div className="card bg-dark border-secondary p-4 h-100">
            <h5 className="text-info mb-4">2. Datos de la Factura/Nota</h5>
            
            <div className="mb-3">
              <label className="form-label">Proveedor</label>
              <select className="form-select bg-dark text-white border-secondary" onChange={(e) => setSeleccion({...seleccion, provId: e.target.value})}>
                <option value="">Selecciona quién te vende...</option>
                {proveedores.map(prov => <option key={prov.id} value={prov.id}>{prov.nombreEmpresa}</option>)}
              </select>
            </div>

            <div className="row">
              <div className="col-6 mb-3">
                <label className="form-label">Cantidad que llegó</label>
                <input 
                  type="number" 
                  className="form-control bg-dark text-white border-secondary" 
                  value={datosCompra.cantidad}
                  onChange={(e) => setDatosCompra({...datosCompra, cantidad: e.target.value})}
                />
              </div>
              <div className="col-6 mb-3">
                <label className="form-label">Costo Unitario ($)</label>
                <input 
                  type="number" 
                  className="form-control bg-dark text-white border-secondary" 
                  value={datosCompra.precio}
                  onChange={(e) => setDatosCompra({...datosCompra, precio: e.target.value})}
                />
              </div>
            </div>

            <div className="mt-auto">
              <div className="alert alert-info py-2 small">
                Al guardar, el stock de <b>{seleccion.prod?.nombre || '---'}</b> subirá automáticamente.
              </div>
              <button className="btn btn-info w-100 fw-bold py-3" onClick={ejecutarCompra}>
                📥 REGISTRAR ENTRADA
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Compras;