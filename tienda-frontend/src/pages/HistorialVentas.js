import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';

function HistorialVentas() {
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
            <h2 style="margin:0">🏪 LOS CHILANGOS</h2>
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

  return (
    <div className="container-fluid">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="fw-bold m-0 text-white">🧾 Historial de Ventas</h2>
        <div className="d-flex gap-2 align-items-center bg-dark p-2 rounded shadow-sm">
          <label className="text-white-50 small mb-0">Filtrar Fecha:</label>
          <input 
            type="date" 
            className="form-control form-control-sm bg-secondary text-white border-0" 
            onChange={(e) => setBusqueda(e.target.value)} 
          />
        </div>
      </div>

      <div className="card border-0 shadow-sm bg-dark text-white">
        <div className="table-responsive">
          <table className="table table-dark table-hover align-middle mb-0">
            <thead>
              <tr className="text-secondary">
                <th>Folio</th>
                <th>Fecha y Hora</th>
                <th className="text-end">Total Cobrado</th>
                <th className="text-center">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {ventasFiltradas.length > 0 ? ventasFiltradas.map(v => (
                <tr key={v.id}>
                  <td className="fw-bold text-success">#V-{v.id}</td>
                  <td>{new Date(v.fechaVenta).toLocaleString()}</td>
                  <td className="text-end fw-bold text-white">${v.totalVenta.toFixed(2)}</td>
                  <td className="text-center">
                    <button className="btn btn-sm btn-outline-success" onClick={() => verDetalle(v)}>
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
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.8)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content bg-dark text-white border-secondary">
              <div className="modal-header border-secondary">
                <h5 className="modal-title fw-bold text-success">Ticket #V-{ventaSeleccionada.id}</h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setShowModal(false)}></button>
              </div>
              <div className="modal-body">
                <p className="small text-secondary">Fecha: {new Date(ventaSeleccionada.fechaVenta).toLocaleString()}</p>
                <table className="table table-dark table-sm">
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
                  <span className="h4 fw-bold text-success">${ventaSeleccionada.totalVenta.toFixed(2)}</span>
                </div>
              </div>
              <div className="modal-footer border-secondary">
                <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Cerrar</button>
                <button className="btn btn-success fw-bold" onClick={manejarImpresion}>🖨️ Imprimir</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default HistorialVentas;