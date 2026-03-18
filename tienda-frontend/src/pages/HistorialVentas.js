import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import { TiendaContext } from '../context/TiendaContext'; // <-- Importamos la nube

function HistorialVentas() {
  // Bajamos tema, colorPrincipal, nombre e ícono
  const { nombreTienda, iconoTienda, tema, colorPrincipal } = useContext(TiendaContext);
  const [ventas, setVentas] = useState([]);
  const [detalles, setDetalles] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [ventaSeleccionada, setVentaSeleccionada] = useState(null);

  const cargarVentas = () => {
    axios.get('http://localhost:8080/api/ventas/historial')
      .then(res => setVentas(res.data.reverse()))
      .catch(err => console.error("Error al cargar ventas:", err));
  };

  useEffect(() => { cargarVentas(); }, []);

  const verDetalle = (venta) => {
    setVentaSeleccionada(venta);
    axios.get(`http://localhost:8080/api/ventas/detalle/${venta.id}`)
      .then(res => {
        setDetalles(res.data);
        setShowModal(true);
      })
      .catch(err => Swal.fire('Error', 'No se pudieron obtener los productos de esta venta', 'error'));
  };

  // Función para imprimir ticket térmico
  const manejarImpresion = () => {
    if (!ventaSeleccionada || detalles.length === 0) return;

    // Si el icono es una imagen base64, no la imprimimos en el ticket para evitar que la impresora térmica falle.
    // Solo imprimimos el emoji si es que tienes emoji guardado.
    const iconoParaTicket = !iconoTienda.startsWith('data:image') ? `${iconoTienda} ` : '';

    const ventanaTicket = window.open('', '_blank');
    ventanaTicket.document.write(`
      <html>
        <head>
          <style>
            @page { margin: 0; }
            body { font-family: 'Courier New', monospace; width: 280px; padding: 20px; font-size: 12px; }
            .text-center { text-align: center; }
            .dashed { border-top: 1px dashed #000; margin: 10px 0; }
            table { width: 100%; }
            .total { font-size: 16px; font-weight: bold; }
          </style>
        </head>
        <body>
          <div class="text-center">
            <h2 style="margin:0; text-transform: uppercase;">${iconoParaTicket}${nombreTienda}</h2>
            <p>¡Gracias por su preferencia!</p>
            <small>Folio: #V-${ventaSeleccionada.id}</small><br>
            <small>${new Date(ventaSeleccionada.fechaVenta).toLocaleString()}</small>
          </div>
          <div class="dashed"></div>
          <table>
            ${detalles.map(d => `
              <tr>
                <td colspan="2">${d.productoNombre}</td>
              </tr>
              <tr>
                <td>${d.cantidad} x $${d.precioUnitario.toFixed(2)}</td>
                <td style="text-align:right">$${(d.cantidad * d.precioUnitario).toFixed(2)}</td>
              </tr>
            `).join('')}
          </table>
          <div class="dashed"></div>
          <div class="text-center total">TOTAL: $${ventaSeleccionada.totalVenta.toFixed(2)}</div>
          <div class="text-center" style="margin-top:20px">
            <p>*** Punto de Control ***</p>
          </div>
          <script>
            window.onload = function() { window.print(); window.close(); };
          </script>
        </body>
      </html>
    `);
    ventanaTicket.document.close();
  };

  const ventasFiltradas = ventas.filter(v => v.fechaVenta.includes(busqueda));

  // Clases dinámicas dependiendo del tema
  const cardClass = `card border-secondary shadow-sm ${tema === 'claro' ? 'bg-white' : 'bg-dark text-white'}`;
  const tableClass = `table table-hover align-middle mb-0 ${tema === 'claro' ? 'table-light' : 'table-dark'}`;
  const modalClass = `modal-content border-secondary shadow-lg ${tema === 'claro' ? 'bg-white text-dark' : 'bg-dark text-white'}`;

  return (
    <div className={`container-fluid pb-5 ${tema === 'claro' ? 'text-dark' : 'text-white'}`}>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="fw-bold m-0">🧾 Historial de Ventas</h2>
        
        {/* Buscador de fecha con modo dinámico */}
        <div className={`d-flex gap-2 align-items-center p-2 rounded shadow-sm border-secondary ${tema === 'claro' ? 'bg-light border' : 'bg-dark'}`}>
          <label className={`small mb-0 fw-bold ${tema === 'claro' ? 'text-secondary' : 'text-white-50'}`}>Filtrar Fecha:</label>
          <input 
            type="date" 
            className={`form-control form-control-sm border-secondary ${tema === 'claro' ? 'bg-white text-dark' : 'bg-secondary text-white'}`} 
            onChange={(e) => setBusqueda(e.target.value)} 
          />
        </div>
      </div>

      <div className={cardClass}>
        <div className="table-responsive">
          <table className={tableClass}>
            <thead className={tema === 'claro' ? 'table-secondary text-dark' : 'text-secondary'}>
              <tr>
                <th className="ps-4">Folio</th>
                <th>Fecha y Hora</th>
                <th className="text-end">Total Cobrado</th>
                <th className="text-center">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {ventasFiltradas.length > 0 ? ventasFiltradas.map(v => (
                <tr key={v.id}>
                  {/* El Folio usa tu color principal */}
                  <td className={`ps-4 fw-bold text-${colorPrincipal}`}>#V-{v.id}</td>
                  <td>{new Date(v.fechaVenta).toLocaleString()}</td>
                  <td className={`text-end fw-bold ${tema === 'claro' ? 'text-dark' : 'text-white'}`}>${v.totalVenta.toFixed(2)}</td>
                  <td className="text-center">
                    {/* El botón de detalle usa tu color principal */}
                    <button className={`btn btn-sm btn-outline-${colorPrincipal} fw-bold`} onClick={() => verDetalle(v)}>
                      👁️ Ver Detalle
                    </button>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="4" className="text-center p-4 text-secondary">No se encontraron ventas.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL DE DETALLE */}
      {showModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.7)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className={modalClass}>
              <div className="modal-header border-secondary">
                {/* El título del ticket usa tu color principal */}
                <h5 className={`modal-title fw-bold text-${colorPrincipal}`}>Ticket #V-{ventaSeleccionada.id}</h5>
                <button type="button" className={`btn-close ${tema === 'claro' ? '' : 'btn-close-white'}`} onClick={() => setShowModal(false)}></button>
              </div>
              <div className="modal-body">
                <p className="small text-secondary">Fecha: {new Date(ventaSeleccionada.fechaVenta).toLocaleString()}</p>
                
                {/* Tablita interna del ticket */}
                <table className={`table table-sm ${tema === 'claro' ? 'table-light' : 'table-dark'}`}>
                  <thead>
                    <tr className="text-secondary">
                      <th>Cant.</th>
                      <th>Producto</th>
                      <th className="text-end">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {detalles.map(d => (
                      <tr key={d.id}>
                        <td>{d.cantidad}</td>
                        <td>{d.productoNombre}</td>
                        <td className="text-end">${(d.cantidad * d.precioUnitario).toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className="d-flex justify-content-between mt-3 border-top border-secondary pt-3">
                  <span className="h5 fw-bold">TOTAL:</span>
                  <span className={`h4 fw-bold text-${colorPrincipal}`}>${ventaSeleccionada.totalVenta.toFixed(2)}</span>
                </div>
              </div>
              <div className="modal-footer border-secondary">
                <button className={`btn ${tema === 'claro' ? 'btn-outline-dark' : 'btn-secondary'}`} onClick={() => setShowModal(false)}>Cerrar</button>
                {/* Botón de imprimir adaptado al color */}
                <button className={`btn btn-${colorPrincipal} fw-bold shadow-sm`} onClick={manejarImpresion}>🖨️ Imprimir</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default HistorialVentas;