import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import { TiendaContext } from '../context/TiendaContext'; // <-- Importamos la nube

function Fiados() {
  // Bajamos el tema y color de la nube
  const { tema, colorPrincipal } = useContext(TiendaContext);

  const [deudores, setDeudores] = useState([]);
  const [filtro, setFiltro] = useState("");

  const cargarDeudores = () => {
    axios.get('http://localhost:8080/api/deudores')
      .then(res => setDeudores(res.data))
      .catch(err => console.error("Error cargando deudores:", err));
  };

  useEffect(() => {
    cargarDeudores();
  }, []);

  // Configuraciones de color dinámicas para SweetAlert
  const swalBg = tema === 'claro' ? '#ffffff' : '#1a1a1a';
  const swalColor = tema === 'claro' ? '#000000' : '#ffffff';

  const agregarCliente = async () => {
    const { value: formValues } = await Swal.fire({
      title: 'Registrar Nuevo Cliente',
      background: swalBg,
      color: swalColor,
      html:
        `<input id="swal-input1" class="swal2-input" placeholder="Nombre completo" style="color: ${swalColor}; background: ${tema === 'claro' ? '#f8f9fa' : '#333'};">` +
        `<input id="swal-input2" class="swal2-input" placeholder="Teléfono (opcional)" style="color: ${swalColor}; background: ${tema === 'claro' ? '#f8f9fa' : '#333'};">`,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: 'Guardar',
      confirmButtonColor: '#198754', // O puedes usar tu color favorito, pero guardar suele ser verde
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
          Swal.fire({ title: 'Éxito', text: 'Cliente registrado', icon: 'success', background: swalBg, color: swalColor });
          cargarDeudores();
        })
        .catch(err => Swal.fire({ title: 'Error', text: 'No se pudo guardar', icon: 'error', background: swalBg, color: swalColor }));
    }
  };

  const verHistorial = async (id, nombre, acumulados = [], offset = 0) => {
    try {
        const res = await axios.get(`http://localhost:8080/api/deudores/${id}/historial?offset=${offset}`);
        const nuevosMovimientos = res.data;
        const todosLosMovimientos = [...acumulados, ...nuevosMovimientos];

        if (todosLosMovimientos.length === 0) {
          return Swal.fire({ title: `Historial de ${nombre}`, text: 'Sin movimientos.', icon: 'info', background: swalBg, color: swalColor });
        }

        const filasHtml = todosLosMovimientos.map(m => `
        <tr style="border-bottom: 1px solid ${tema === 'claro' ? '#dee2e6' : '#444'}">
            <td style="color: ${tema === 'claro' ? '#6c757d' : '#bbb'}; font-size: 0.8rem; padding: 8px;">${new Date(m.fecha || m.FECHA).toLocaleString()}</td>
            <td style="font-weight: bold; padding: 8px; color: ${(m.tipo || m.TIPO) === 'ABONO' ? '#28a745' : '#dc3545'}">
            ${m.tipo || m.TIPO}
            </td>
            <td style="font-weight: bold; text-align: right; padding: 8px;">$${Number(m.monto || m.MONTO).toFixed(2)}</td>
        </tr>
        `).join('');

        const botonCargarMas = nuevosMovimientos.length === 15 
        ? `<button id="btnCargarMas" class="btn btn-outline-info btn-sm w-100 mt-2">👇 Ver más antiguos</button>` 
        : `<p class="text-center text-muted small mt-2">Fin del historial</p>`;

        Swal.fire({
        title: `<span style="color: ${swalColor}">Historial de ${nombre}</span>`,
        background: swalBg,
        width: '600px',
        html: `
            <div id="contenedorHistorial" style="max-height: 350px; overflow-y: auto; border: 1px solid ${tema === 'claro' ? '#ccc' : '#444'}; border-radius: 8px; background-color: ${tema === 'claro' ? '#fff' : '#222'};">
            <table style="width: 100%; font-size: 0.9rem; text-align: left; border-collapse: collapse;">
                <thead style="position: sticky; top: 0; background: ${tema === 'claro' ? '#f8f9fa' : '#333'}; z-index: 1;">
                <tr><th style="padding: 8px;">Fecha</th><th style="padding: 8px;">Tipo</th><th style="text-align: right; padding: 8px;">Monto</th></tr>
                </thead>
                <tbody>${filasHtml}</tbody>
            </table>
            </div>
            ${botonCargarMas}`,
        showConfirmButton: true,
        confirmButtonText: 'Cerrar',
        confirmButtonColor: '#6c757d',
        didOpen: () => {
            const btn = document.getElementById('btnCargarMas');
            if (btn) {
            btn.onclick = () => {
                Swal.close();
                verHistorial(id, nombre, todosLosMovimientos, offset + 10);
            };
            }
            const cont = document.getElementById('contenedorHistorial');
            cont.scrollTop = cont.scrollHeight;
        }
        });

    } catch (error) {
      Swal.fire({ title: 'Error', text: 'No se pudo cargar el historial', icon: 'error', background: swalBg, color: swalColor });
    }
  };

  const registrarMovimiento = async (id, tipo) => {
    const { value: monto } = await Swal.fire({
      title: tipo === 'ABONO' ? '💰 Registrar Abono' : '🛒 Nueva Compra',
      input: 'number',
      inputLabel: 'Ingrese la cantidad en pesos',
      showCancelButton: true,
      confirmButtonColor: tipo === 'ABONO' ? '#198754' : '#0d6efd',
      background: swalBg,
      color: swalColor,
      customClass: {
        input: tema === 'claro' ? 'bg-light text-dark' : 'bg-dark text-white'
      }
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
            timer: 2000,
            background: swalBg,
            color: swalColor
          });
        })
        .catch(err => Swal.fire({ title: 'Error', text: 'No se pudo registrar', icon: 'error', background: swalBg, color: swalColor }));
    }
  };

  const filtrados = deudores.filter(d => 
    d.nombreCliente.toLowerCase().includes(filtro.toLowerCase())
  );

  // Clases dinámicas
  const cardClass = `card border-secondary shadow-sm mb-4 ${tema === 'claro' ? 'bg-white' : 'bg-dark'}`;
  const inputClass = `form-control border-secondary ${tema === 'claro' ? 'bg-white text-dark' : 'bg-dark text-white'}`;
  const tableClass = `table table-hover align-middle mb-0 ${tema === 'claro' ? 'table-light' : 'table-dark'}`;

  return (
    <div className={`container-fluid pb-5 ${tema === 'claro' ? 'text-dark' : 'text-white'}`}>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="fw-bold m-0">📖 Libro de Fiados</h2>
        {/* El botón de nuevo cliente usa tu color principal */}
        <button className={`btn btn-${colorPrincipal} fw-bold shadow-sm`} onClick={agregarCliente}>
          ➕ Nuevo Cliente
        </button>
      </div>

      {/* Buscador */}
      <div className={cardClass}>
        <div className="card-body">
          <div className="input-group">
            <span className={`input-group-text border-secondary ${tema === 'claro' ? 'bg-light text-secondary' : 'bg-dark text-secondary'}`}>🔍</span>
            <input 
              type="text" 
              className={inputClass} 
              placeholder="Escribe el nombre del cliente para buscar..." 
              value={filtro}
              onChange={(e) => setFiltro(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Tabla de Deudores */}
      <div className={`card border-secondary shadow ${tema === 'claro' ? 'bg-white' : 'bg-dark'}`}>
        <div className="table-responsive">
          <table className={tableClass}>
            <thead className={tema === 'claro' ? 'table-secondary text-dark' : 'text-secondary small uppercase'}>
              <tr>
                <th className="ps-4">Cliente</th>
                <th>Estado</th>
                <th>Última Actividad</th>
                <th className="text-end">Deuda Total</th>
                <th className="text-center">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filtrados.length > 0 ? filtrados.map(d => {
                const fechaActividad = new Date(d.ultimaActividad);
                const hoy = new Date();
                const diasDiferencia = Math.floor((hoy - fechaActividad) / (1000 * 60 * 60 * 24));
                const esMoroso = diasDiferencia >= 30 && d.totalDeuda > 0;

                return (
                  <tr key={d.id} className={esMoroso ? (tema === 'claro' ? "table-danger" : "table-danger-custom") : ""}>
                    <td className="ps-4">
                      {/* El nombre del cliente toma el color principal */}
                      <div className={`fw-bold text-${colorPrincipal}`}>{d.nombreCliente}</div>
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
                        <div className="d-flex justify-content-center gap-2"> 
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
                            
                            {/* El botón de historial toma el borde de tu color principal */}
                            <button 
                            className={`btn btn-sm btn-outline-${colorPrincipal} fw-bold px-3 shadow-sm`} 
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
                  <td colSpan="5" className="text-center py-5 text-secondary fst-italic">
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