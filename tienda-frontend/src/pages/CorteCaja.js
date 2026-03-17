import React, { useState, useEffect } from 'react';
import axios from 'axios';

function CorteCaja() {
  const [datos, setDatos] = useState({ ventas: 0, abonos: 0, compras: 0, totalCaja: 0 });
  
  // Obtenemos la fecha en formato bonito (ej. "lunes, 16 de marzo de 2026")
  const fechaHoy = new Date().toLocaleDateString('es-MX', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  const cargarCorte = () => {
    axios.get('http://localhost:8080/api/ventas/corte-diario')
      .then(res => {
          setDatos({
              ventas: res.data.ventas || 0,
              abonos: res.data.abonos || 0,
              compras: res.data.compras || 0,
              totalCaja: res.data.totalCaja || 0
          });
      })
      .catch(err => console.error("Error al cargar corte, revisa la consola de Java"));
  };

  useEffect(() => { cargarCorte(); }, []);

  return (
    <div className="container-fluid text-white pb-5">
      {/* MAGIA DE IMPRESIÓN: Esto transforma el modo oscuro a modo claro solo al imprimir */}
      <style>
        {`
          @media print {
            body { background-color: white !important; color: black !important; }
            .text-white, .text-info, .text-success, .text-danger, .text-secondary { color: black !important; }
            .bg-dark { background-color: white !important; border: 1px solid #ccc !important; }
            .no-print { display: none !important; }
            .shadow-sm, .shadow-lg { box-shadow: none !important; }
            .card { border: 1px solid #000 !important; margin-bottom: 20px; break-inside: avoid; }
          }
        `}
      </style>

      <div className="d-flex justify-content-between align-items-center mb-4 border-bottom border-secondary pb-3">
        <div>
            <h2 className="fw-bold m-0 text-white">💰 Corte de Caja del Día</h2>
            <p className="text-secondary text-capitalize m-0 mt-1">{fechaHoy}</p>
        </div>
        
        {/* Usamos la clase "no-print" para que estos botones desaparezcan en el papel */}
        <div className="no-print d-flex gap-2">
            <button className="btn btn-outline-light" onClick={cargarCorte}>🔄 Actualizar</button>
            <button className="btn btn-info fw-bold" onClick={() => window.print()}>🖨️ Imprimir Resumen</button>
        </div>
      </div>

      <div className="row g-4">
        {/* ENTRADAS */}
        <div className="col-md-6">
          <div className="card bg-dark border-success h-100 shadow-sm">
            <div className="card-body">
              <h6 className="text-success fw-bold">➕ ENTRADAS (Dinero que entró)</h6>
              <div className="d-flex justify-content-between mt-3">
                <span>Ventas en mostrador:</span>
                <span className="fw-bold text-white">${datos.ventas.toFixed(2)}</span>
              </div>
              <div className="d-flex justify-content-between border-bottom border-secondary pb-2 mt-2">
                <span>Cobro de fiados (Abonos):</span>
                <span className="fw-bold text-white">${datos.abonos.toFixed(2)}</span>
              </div>
              <div className="d-flex justify-content-between pt-3">
                <span className="h5">Subtotal Entradas:</span>
                <span className="h5 fw-bold text-success">${(datos.ventas + datos.abonos).toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* SALIDAS */}
        <div className="col-md-6">
          <div className="card bg-dark border-danger h-100 shadow-sm">
            <div className="card-body">
              <h6 className="text-danger fw-bold">➖ SALIDAS (Pagos realizados)</h6>
              <div className="d-flex justify-content-between mt-3 mb-4">
                <span>Pagos a proveedores:</span>
                <span className="fw-bold text-white">${datos.compras.toFixed(2)}</span>
              </div>
              <div className="d-flex justify-content-between pt-3 border-top border-secondary">
                <span className="h5">Total Salidas:</span>
                <span className="h5 fw-bold text-danger">-${datos.compras.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* RESULTADO FINAL */}
      <div className="mt-5 card bg-dark border-info shadow-lg overflow-hidden">
        <div className="card-body p-5 text-center">
          <h4 className="text-secondary mb-3 text-uppercase fw-bold">Efectivo total en caja</h4>
          <h1 className="display-1 fw-bold text-info">${datos.totalCaja.toFixed(2)}</h1>
          <p className="text-muted mt-3 fst-italic no-print">
            * Este cálculo suma ventas y abonos, y resta los pagos a proveedores registrados hoy.
          </p>
        </div>
      </div>
    </div>
  );
}

export default CorteCaja;