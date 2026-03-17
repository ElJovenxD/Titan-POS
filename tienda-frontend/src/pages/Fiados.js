import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';

function Fiados() {
  const [deudores, setDeudores] = useState([]);
  const [filtro, setFiltro] = useState("");

  // Cargar lista de deudores desde el backend
  const cargarDeudores = () => {
    axios.get('http://localhost:8080/api/deudores')
      .then(res => setDeudores(res.data))
      .catch(err => console.error("Error cargando deudores:", err));
  };

  useEffect(() => {
    cargarDeudores();
  }, []);

  // Función para registrar un nuevo cliente
  const agregarCliente = async () => {
    const { value: formValues } = await Swal.fire({
      title: 'Registrar Nuevo Cliente',
      background: '#1a1a1a',
      color: '#fff',
      html:
        '<input id="swal-input1" class="swal2-input" placeholder="Nombre completo">' +
        '<input id="swal-input2" class="swal2-input" placeholder="Teléfono (opcional)">',
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: 'Guardar',
      confirmButtonColor: '#198754',
      preConfirm: () => {
        return [
          document.getElementById('swal-input1').value,
          document.getElementById('swal-input2').value
        ]
      }
    });

    if (formValues && formValues[0]) {
      const nuevoDeudor = {
        nombreCliente: formValues[0],
        telefono: formValues[1],
        totalDeuda: 0.0
      };

      axios.post('http://localhost:8080/api/deudores', nuevoDeudor)
        .then(() => {
          Swal.fire('Éxito', 'Cliente registrado', 'success');
          cargarDeudores();
        })
        .catch(err => Swal.fire('Error', 'No se pudo guardar', 'error'));
    }
  };

  // Función para ver el historial detallado (Solución al error de visualización)
  const verHistorial = async (id, nombre, acumulados = [], offset = 0) => {
    try {
        const res = await axios.get(`http://localhost:8080/api/deudores/${id}/historial?offset=${offset}`);
        const nuevosMovimientos = res.data;
        const todosLosMovimientos = [...acumulados, ...nuevosMovimientos];

        if (todosLosMovimientos.length === 0) {
        return Swal.fire({ title: `Historial de ${nombre}`, text: 'Sin movimientos.', icon: 'info' });
        }

        const filasHtml = todosLosMovimientos.map(m => `
        <tr>
            <td style="color: #bbb; font-size: 0.8rem;">${new Date(m.fecha || m.FECHA).toLocaleString()}</td>
            <td style="font-weight: bold; color: ${(m.tipo || m.TIPO) === 'ABONO' ? '#28a745' : '#dc3545'}">
            ${m.tipo || m.TIPO}
            </td>
            <td style="font-weight: bold; text-align: right;">$${Number(m.monto || m.MONTO).toFixed(2)}</td>
        </tr>
        `).join('');

        // Botón de "Cargar más" solo si la última carga trajo 10 registros (posibilidad de que haya más)
        const botonCargarMas = nuevosMovimientos.length === 15 
        ? `<button id="btnCargarMas" class="btn btn-outline-info btn-sm w-100 mt-2">👇 Ver más antiguos</button>` 
        : `<p class="text-center text-muted small mt-2">Fin del historial</p>`;

        Swal.fire({
        title: `<span style="color: #fff">Historial de ${nombre}</span>`,
        background: '#1a1a1a',
        width: '600px',
        html: `
            <div id="contenedorHistorial" style="max-height: 350px; overflow-y: auto; border: 1px solid #444; border-radius: 8px;">
            <table class="table table-dark table-hover mb-0" style="width: 100%; font-size: 0.9rem; text-align: left;">
                <thead style="position: sticky; top: 0; background: #333; z-index: 1;">
                <tr><th>Fecha</th><th>Tipo</th><th style="text-align: right;">Monto</th></tr>
                </thead>
                <tbody>${filasHtml}</tbody>
            </table>
            </div>
            ${botonCargarMas}`,
        showConfirmButton: true,
        confirmButtonText: 'Cerrar',
        didOpen: () => {
            // Al abrir el modal, asignamos el evento al botón de cargar más
            const btn = document.getElementById('btnCargarMas');
            if (btn) {
            btn.onclick = () => {
                // Cerramos el modal actual y abrimos uno nuevo con más datos
                Swal.close();
                verHistorial(id, nombre, todosLosMovimientos, offset + 10);
            };
            }
            // Auto-scroll al final para ver los nuevos
            const cont = document.getElementById('contenedorHistorial');
            cont.scrollTop = cont.scrollHeight;
        }
        });

  } catch (error) {
    Swal.fire('Error', 'No se pudo cargar el historial', 'error');
  }
};

  // Función para registrar abonos o compras fiadas
  const registrarMovimiento = async (id, tipo) => {
    const { value: monto } = await Swal.fire({
      title: tipo === 'ABONO' ? '💰 Registrar Abono' : '🛒 Nueva Compra',
      input: 'number',
      inputLabel: 'Ingrese la cantidad en pesos',
      showCancelButton: true,
      confirmButtonColor: tipo === 'ABONO' ? '#198754' : '#0d6efd',
      background: '#1a1a1a',
      color: '#fff'
    });

    if (monto && monto > 0) {
      axios.post(`http://localhost:8080/api/deudores/${id}/movimiento`, { monto, tipo })
        .then(() => {
          cargarDeudores();
          Swal.fire({
            toast: true,
            position: 'top-end',
            icon: 'success',
            title: 'Movimiento registrado',
            showConfirmButton: false,
            timer: 2000
          });
        })
        .catch(err => Swal.fire('Error', 'No se pudo registrar', 'error'));
    }
  };

  // Filtrar deudores por nombre
  const filtrados = deudores.filter(d => 
    d.nombreCliente.toLowerCase().includes(filtro.toLowerCase())
  );

  return (
    <div className="container-fluid text-white">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="fw-bold m-0 text-white">📖 Libro de Fiados</h2>
        <button className="btn btn-success fw-bold shadow-sm" onClick={agregarCliente}>
          ➕ Nuevo Cliente
        </button>
      </div>

      {/* Buscador */}
      <div className="card bg-dark border-secondary mb-4 shadow-sm">
        <div className="card-body">
          <div className="input-group">
            <span className="input-group-text bg-dark border-secondary text-secondary">🔍</span>
            <input 
              type="text" 
              className="form-control bg-dark text-white border-secondary" 
              placeholder="Escribe el nombre del cliente para buscar..." 
              value={filtro}
              onChange={(e) => setFiltro(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Tabla de Deudores */}
      <div className="card bg-dark border-secondary shadow">
        <div className="table-responsive">
          <table className="table table-dark table-hover align-middle mb-0">
            <thead>
              <tr className="text-secondary small uppercase">
                <th className="ps-4">Cliente</th>
                <th>Estado</th>
                <th>Última Actividad</th>
                <th className="text-end">Deuda Total</th>
                <th className="text-center">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filtrados.length > 0 ? filtrados.map(d => {
                // Lógica de alerta (30 días)
                const fechaActividad = new Date(d.ultimaActividad);
                const hoy = new Date();
                const diasDiferencia = Math.floor((hoy - fechaActividad) / (1000 * 60 * 60 * 24));
                const esMoroso = diasDiferencia >= 30 && d.totalDeuda > 0;

                return (
                  <tr key={d.id} className={esMoroso ? "table-danger-custom" : ""}>
                    <td className="ps-4">
                      <div className="fw-bold text-white">{d.nombreCliente}</div>
                      <small className="text-muted">{d.telefono || "Sin teléfono"}</small>
                    </td>
                    <td>
                      {esMoroso ? (
                        <span className="badge bg-danger shadow-sm">MOROSO (+30 días)</span>
                      ) : (
                        <span className="badge bg-success-subtle text-success border border-success">Al día</span>
                      )}
                    </td>
                    <td className="text-secondary small">
                      {fechaActividad.toLocaleDateString()}
                    </td>
                    <td className="text-end">
                      <span className={`h5 fw-bold ${d.totalDeuda > 0 ? "text-warning" : "text-success"}`}>
                        ${d.totalDeuda.toFixed(2)}
                      </span>
                    </td>
                    <td className="text-center">
                        <div className="d-flex justify-content-center gap-2"> {/* gap-2 le da el espacio perfecto */}
                            <button 
                            className="btn btn-sm btn-success fw-bold px-3 shadow-sm border-0" 
                            onClick={() => registrarMovimiento(d.id, 'ABONO')}
                            style={{ borderRadius: '8px' }}
                            >
                            💰 Abonar
                            </button>
                            
                            <button 
                            className="btn btn-sm btn-primary fw-bold px-3 shadow-sm border-0" 
                            onClick={() => registrarMovimiento(d.id, 'COMPRA')}
                            style={{ borderRadius: '8px' }}
                            >
                            🛒 Fiar
                            </button>
                            
                            <button 
                            className="btn btn-sm btn-outline-info fw-bold px-3 shadow-sm" 
                            onClick={() => verHistorial(d.id, d.nombreCliente)}
                            style={{ borderRadius: '8px', borderWidth: '2px' }}
                            >
                            📜 Historial
                            </button>
                        </div>
                        </td>
                  </tr>
                );
              }) : (
                <tr>
                  <td colSpan="5" className="text-center py-5 text-secondary italic">
                    No se encontraron deudores con ese nombre.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default Fiados;