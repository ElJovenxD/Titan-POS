import React, { useState, useEffect, useRef, useContext } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import { useReactToPrint } from 'react-to-print';
import TicketVenta from '../components/TicketVenta';
import { TiendaContext } from '../context/TiendaContext';

function PuntoVenta() {
  // 1. Bajamos el tema y el colorPrincipal de la nube
  const { nombreTienda, tema, colorPrincipal } = useContext(TiendaContext);
  const [productos, setProductos] = useState([]);
  const [carrito, setCarrito] = useState([]);
  const [filtro, setFiltro] = useState("");
  const [ultimaVenta, setUltimaVenta] = useState(null);
  const [detallesVenta, setDetallesVenta] = useState([]);
  
  const componentRef = useRef();

  const cargarProductos = () => {
    axios.get('http://localhost:8080/api/productos')
      .then(res => setProductos(res.data))
      .catch(err => console.error("Error cargando productos", err));
  };

  useEffect(() => {
    cargarProductos();
  }, []);

  const handlePrint = useReactToPrint({
    contentRef: componentRef, 
  });

  const agregarAlCarrito = (p) => {
    if (p.stockActual <= 0) {
      return Swal.fire('Sin Stock', 'Este producto no tiene existencias', 'error');
    }

    const existe = carrito.find(item => item.id === p.id);
    if (existe) {
      if (existe.cantidad >= p.stockActual) {
        return Swal.fire('Límite alcanzado', 'No hay más stock disponible', 'warning');
      }
      setCarrito(carrito.map(item => 
        item.id === p.id ? { ...item, cantidad: item.cantidad + 1 } : item
      ));
    } else {
      setCarrito([...carrito, { ...p, cantidad: 1 }]);
    }
  };

  const quitarDelCarrito = (id) => {
    setCarrito(carrito.filter(item => item.id !== id));
  };

  const calcularTotal = () => {
    return carrito.reduce((acc, item) => acc + (item.precioVenta * item.cantidad), 0);
  };

  const finalizarVenta = async () => {
    const detallesVenta = carrito.map(item => ({
      productoId: item.id,
      cantidad: item.cantidad
    }));

    try {
      const res = await axios.post('http://localhost:8080/api/ventas', detallesVenta);
      const ventaExitosa = res.data;

      setUltimaVenta(ventaExitosa);
      setDetallesVenta([...carrito]);

      Swal.fire({
        title: '¡Venta Realizada!',
        text: `Cobro por $${ventaExitosa.totalVenta.toFixed(2)}`,
        icon: 'success',
        showCancelButton: true,
        confirmButtonText: '🖨️ Imprimir Ticket',
        cancelButtonText: 'Nueva Venta',
        confirmButtonColor: '#28a745',
        cancelButtonColor: '#6c757d',
      }).then((result) => {
        if (result.isConfirmed) {
          handlePrint();
        }
        setCarrito([]);
        setFiltro("");
        cargarProductos();
      });

    } catch (error) {
      console.error("Detalle del error:", error);
      Swal.fire('Error', 'No se pudo procesar la venta', 'error');
    }
  };

  const productosFiltrados = productos.filter(p => 
    p.nombre.toLowerCase().includes(filtro.toLowerCase()) || 
    (p.codigoBarras && p.codigoBarras.includes(filtro))
  );

  // Clases dinámicas dependiendo del tema
  const cardClass = `card shadow-sm border-secondary p-3 mb-4 ${tema === 'claro' ? 'bg-white' : 'bg-dark text-white'}`;
  const inputClass = `form-control form-control-lg mb-3 shadow-sm ${tema === 'claro' ? 'bg-light text-dark' : 'bg-black text-white border-secondary'}`;
  const listGroupClass = `list-group-item list-group-item-action d-flex justify-content-between align-items-center py-3 ${tema === 'claro' ? 'bg-white text-dark' : 'bg-dark text-white border-secondary'}`;

  return (
    <div className={`container-fluid py-4 ${tema === 'claro' ? 'text-dark' : 'text-white'}`}>
      <h2 className="mb-4 fw-bold">🛒 Punto de Venta - {nombreTienda}</h2>
      
      <div className="row g-4">
        {/* BUSCADOR Y LISTA DE PRODUCTOS */}
        <div className="col-md-7">
          <div className={cardClass}>
            <label className="form-label fw-bold">Buscar Producto</label>
            <input 
              type="text" 
              className={inputClass} 
              placeholder="Nombre o escanea código..." 
              value={filtro}
              onChange={(e) => setFiltro(e.target.value)}
              onKeyUp={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  const valor = e.target.value.trim().replace(/\r|\n/g, "");
                  let productoEscaneado = productos.find(p => p.codigoBarras && String(p.codigoBarras) === valor);
                  if (!productoEscaneado) {
                    productoEscaneado = productos.find(p => p.nombre.toLowerCase() === valor.toLowerCase());
                  }
                  if (productoEscaneado) {
                    agregarAlCarrito(productoEscaneado);
                    setFiltro("");
                  } else {
                    Swal.fire({ toast: true, position: "top-end", icon: "warning", title: "Producto no encontrado", showConfirmButton: false, timer: 1500 });
                    setFiltro("");
                  }
                }
              }}
              autoFocus
            />
            
            <div className="list-group overflow-auto shadow-sm" style={{maxHeight: '550px'}}>
              {productosFiltrados.length > 0 ? productosFiltrados.map(p => (
                <button 
                  key={p.id} 
                  onClick={() => agregarAlCarrito(p)} 
                  className={listGroupClass}
                >
                  <div>
                    <div className="fw-bold">{p.nombre}</div>
                    <small className={p.stockActual < 5 ? "text-danger fw-bold" : "text-muted"}>
                      Existencia: {p.stockActual} pz
                    </small>
                  </div>
                  {/* Etiqueta de precio con tu color principal */}
                  <span className={`badge bg-${colorPrincipal} fs-6 shadow-sm`}>${p.precioVenta.toFixed(2)}</span>
                </button>
              )) : <div className="text-center p-4 text-muted">No hay productos que coincidan.</div>}
            </div>
          </div>
        </div>

        {/* CARRITO / LISTA DE COBRO */}
        <div className="col-md-5">
          <div className={`card shadow-sm border-secondary h-100 d-flex flex-column ${tema === 'claro' ? 'bg-white' : 'bg-dark'}`}>
            {/* Cabecera del carrito con tu color principal */}
            <div className={`card-header text-white fw-bold py-3 bg-${colorPrincipal}`}>
              📋 Lista de Cobro
            </div>
            <div className="card-body flex-grow-1 overflow-auto p-0" style={{minHeight: '300px'}}>
              {carrito.length === 0 ? (
                <div className="text-center text-muted mt-5">
                   <div className="display-1 opacity-25">🛒</div>
                   <p>El carrito está vacío</p>
                </div>
              ) : (
                <table className={`table table-hover align-middle mb-0 ${tema === 'claro' ? 'table-light' : 'table-dark'}`}>
                  <thead className={tema === 'claro' ? 'table-secondary text-dark' : 'text-secondary'}>
                    <tr>
                      <th className="ps-3">Cant.</th>
                      <th>Producto</th>
                      <th className="text-end pe-3">Subtotal</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {carrito.map(item => (
                      <tr key={item.id}>
                        <td className="ps-3 fw-bold">{item.cantidad}</td>
                        <td className="small">{item.nombre}</td>
                        {/* El subtotal de cada producto usa tu color */}
                        <td className={`text-end fw-bold text-${colorPrincipal} pe-3`}>
                          ${(item.precioVenta * item.cantidad).toFixed(2)}
                        </td>
                        <td className="text-center">
                          <button className="btn btn-sm text-danger" onClick={() => quitarDelCarrito(item.id)}>✕</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
            
            {/* Pie de la tarjeta donde está el Total */}
            <div className={`card-footer p-4 border-0 ${tema === 'claro' ? 'bg-light' : 'bg-secondary bg-opacity-25'}`}>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <span className={`h4 m-0 fw-bold ${tema === 'claro' ? 'text-dark' : 'text-white'}`}>TOTAL:</span>
                {/* El TOTAL gigante en tu color */}
                <span className={`h2 m-0 fw-bold text-${colorPrincipal}`}>${calcularTotal().toFixed(2)}</span>
              </div>
              
              {/* El botón de cobro usa tu color principal */}
              <button 
                className={`btn btn-${colorPrincipal} btn-lg w-100 fw-bold py-3 shadow`} 
                onClick={finalizarVenta}
                disabled={carrito.length === 0}
              >
                💰 COBRAR AHORA
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Componente oculto para la impresión */}
      <div style={{ display: 'none' }}>
        <TicketVenta 
          ref={componentRef} 
          venta={ultimaVenta} 
          detalles={detallesVenta} 
        />
      </div>
    </div>
  );
}

export default PuntoVenta;