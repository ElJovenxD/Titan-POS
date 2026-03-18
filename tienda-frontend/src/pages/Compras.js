import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import { TiendaContext } from '../context/TiendaContext'; // <-- Importamos la nube

function Compras() {
  // Bajamos el tema y el color principal
  const { tema, colorPrincipal } = useContext(TiendaContext);

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

  // Clases dinámicas dependiendo del tema
  const cardClass = `card border-secondary p-4 h-100 shadow-sm ${tema === 'claro' ? 'bg-white text-dark' : 'bg-dark text-white'}`;
  const inputClass = `form-control border-secondary ${tema === 'claro' ? 'bg-light text-dark' : 'bg-dark text-white'}`;
  const selectClass = `form-select border-secondary ${tema === 'claro' ? 'bg-light text-dark' : 'bg-dark text-white'}`;

  return (
    <div className={`container-fluid pb-5 ${tema === 'claro' ? 'text-dark' : 'text-white'}`}>
      <h2 className="fw-bold mb-4">📦 Registro de Mercancía (Entradas)</h2>
      
      <div className="row g-4">
        {/* BUSCADOR DE PRODUCTOS */}
        <div className="col-md-6">
          <div className={cardClass}>
            {/* El título usa tu color principal */}
            <h5 className={`mb-3 fw-bold text-${colorPrincipal}`}>1. Selecciona el Producto</h5>
            <input 
              type="text" 
              className={`${inputClass} mb-3`}
              placeholder="Buscar por nombre o escanear..." 
              autoFocus
              onChange={(e) => setFiltro(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && e.target.value !== "") {
                  e.preventDefault(); 
                  const productoEscaneado = productos.find(p => p.codigoBarras === e.target.value);
                  if (productoEscaneado) {
                    setSeleccion({...seleccion, prod: productoEscaneado});
                    setDatosCompra({...datosCompra, precio: productoEscaneado.precioCompra});
                    e.target.value = ""; 
                    setFiltro("");
                  }
                }
              }}
            />
            <div className="list-group overflow-auto shadow-sm border border-secondary rounded" style={{maxHeight: '300px'}}>
              {prodFiltrados.map(p => {
                const isSelected = seleccion.prod?.id === p.id;
                // Lógica de colores para la lista
                let btnClass = `list-group-item list-group-item-action d-flex justify-content-between align-items-center `;
                if (isSelected) {
                  btnClass += `bg-${colorPrincipal} text-white fw-bold border-${colorPrincipal}`;
                } else {
                  btnClass += tema === 'claro' ? 'bg-white text-dark' : 'bg-dark text-white';
                }

                return (
                  <button 
                    key={p.id} 
                    className={btnClass}
                    onClick={() => {
                      setSeleccion({...seleccion, prod: p});
                      setDatosCompra({...datosCompra, precio: p.precioCompra}); 
                    }}
                  >
                    <span>{p.nombre}</span>
                    <small className={isSelected ? 'text-white-50' : 'text-secondary'}>
                      (Stock: {p.stockActual})
                    </small>
                  </button>
                );
              })}
              {prodFiltrados.length === 0 && (
                <div className={`p-3 text-center ${tema === 'claro' ? 'text-muted' : 'text-secondary'}`}>No se encontraron productos.</div>
              )}
            </div>
          </div>
        </div>

        {/* DETALLES DE LA COMPRA */}
        <div className="col-md-6">
          <div className={cardClass}>
            {/* El título usa tu color principal */}
            <h5 className={`mb-4 fw-bold text-${colorPrincipal}`}>2. Datos de la Factura/Nota</h5>
            
            <div className="mb-3">
              <label className="form-label fw-bold">Proveedor</label>
              <select className={selectClass} onChange={(e) => setSeleccion({...seleccion, provId: e.target.value})}>
                <option value="">Selecciona quién te vende...</option>
                {proveedores.map(prov => <option key={prov.id} value={prov.id}>{prov.nombreEmpresa}</option>)}
              </select>
            </div>

            <div className="row">
              <div className="col-6 mb-3">
                <label className="form-label fw-bold">Cantidad que llegó</label>
                <input 
                  type="number" 
                  className={inputClass}
                  value={datosCompra.cantidad}
                  onChange={(e) => setDatosCompra({...datosCompra, cantidad: e.target.value})}
                />
              </div>
              <div className="col-6 mb-3">
                <label className="form-label fw-bold">Costo Unitario ($)</label>
                <input 
                  type="number" 
                  className={inputClass}
                  value={datosCompra.precio}
                  onChange={(e) => setDatosCompra({...datosCompra, precio: e.target.value})}
                />
              </div>
            </div>

            <div className="mt-auto">
              {/* La alerta toma el color principal sutilmente */}
              <div className={`alert alert-${colorPrincipal} bg-opacity-10 py-2 small border-${colorPrincipal}`}>
                Al guardar, el stock de <b className={`text-${colorPrincipal}`}>{seleccion.prod?.nombre || '---'}</b> subirá automáticamente.
              </div>
              {/* El botón gigante toma tu color */}
              <button className={`btn btn-${colorPrincipal} w-100 fw-bold py-3 shadow-sm`} onClick={ejecutarCompra}>
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