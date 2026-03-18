import React, { useEffect, useState, useCallback, useContext } from 'react';
import axios from 'axios';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts';
import { useNavigate } from 'react-router-dom';
import { TiendaContext } from '../context/TiendaContext';

function Dashboard() {
  // Bajamos también el 'tema'
  const { nombreTienda, tema } = useContext(TiendaContext);
  const [productosBajos, setProductosBajos] = useState([]);
  const [visitasHoy, setVisitasHoy] = useState([]);
  const [datosVentas, setDatosVentas] = useState({ total_ventas: 0, total_ganancia: 0 });
  const [datosGrafica, setDatosGrafica] = useState([]);
  const [alzas, setAlzas] = useState([]);
  const [cargando, setCargando] = useState(true);
  
  const navigate = useNavigate();

  const cargarDashboard = useCallback(async () => {
    setCargando(true);
    try {
      const [resProd, resAlzas, resProv, resGrafica] = await Promise.allSettled([
        axios.get('http://localhost:8080/api/productos'),
        axios.get('http://localhost:8080/api/productos/recientes-alzas'),
        axios.get('http://localhost:8080/api/proveedores'),
        axios.get('http://localhost:8080/api/ventas/semana')
      ]);

      if (resProd.status === 'fulfilled') setProductosBajos(resProd.value.data.filter(p => p.stockActual < 5));
      if (resAlzas.status === 'fulfilled') setAlzas(resAlzas.value.data);
      if (resGrafica.status === 'fulfilled') setDatosGrafica(resGrafica.value.data || []);
      if (resProv.status === 'fulfilled') {
        const diasSemana = ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"];
        const hoy = diasSemana[new Date().getDay()];
        setVisitasHoy(resProv.value.data.filter(prov => prov.diasVisita && prov.diasVisita.toLowerCase().includes(hoy)));
      }

      try {
        const resVentas = await axios.get('http://localhost:8080/api/ventas/hoy');
        setDatosVentas({
          total_ventas: resVentas.data.total_ventas ?? resVentas.data.total ?? 0,
          total_ganancia: resVentas.data.total_ganancia ?? 0
        });
      } catch (e) {
        console.warn("Ventas hoy no disponibles");
      }
    } catch (error) {
      console.error("Error en Dashboard:", error);
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => { cargarDashboard(); }, [cargarDashboard]);

  // Colores dinámicos para las tarjetas
  const cardClass = `card border-secondary shadow ${tema === 'claro' ? 'bg-white text-dark' : 'bg-dark text-white'}`;

  if (cargando) return (
    <div className={`d-flex justify-content-center align-items-center vh-100 ${tema === 'claro' ? 'bg-light text-dark' : 'bg-dark text-white'}`}>
      <div className="text-center">
        <div className="spinner-border text-primary mb-3"></div>
        <p>Cargando resumen de {nombreTienda}...</p>
      </div>
    </div>
  );

  return (
    <div className={`container-fluid pb-4 min-vh-100 ${tema === 'claro' ? 'bg-light text-dark' : 'bg-dark text-white'}`}>
      <div className="d-flex justify-content-between align-items-center py-4">
        <h2 className="fw-bold m-0">🏠 Resumen - {nombreTienda}</h2>
        <button className={`btn btn-sm ${tema === 'claro' ? 'btn-outline-dark' : 'btn-outline-light'}`} onClick={cargarDashboard}>🔄 Actualizar</button>
      </div>
      
      <div className="row g-4">
        {/* TARJETA VENTAS */}
        <div className="col-md-4">
          <div className="card border-0 shadow bg-success text-white p-4 h-100">
            <h6 className="text-white-50 mb-1">💰 Ventas de Hoy</h6>
            <h2 className="fw-bold m-0">${Number(datosVentas.total_ventas).toLocaleString()}</h2>
            <small className="opacity-75">Ingreso bruto</small>
          </div>
        </div>

        {/* TARJETA GANANCIA */}
        <div className="col-md-4">
          <div className="card border-0 shadow bg-info text-white p-4 h-100">
            <h6 className="text-white-50 mb-1">📈 Ganancia Real</h6>
            <h2 className="fw-bold m-0">${Number(datosVentas.total_ganancia).toLocaleString()}</h2>
            <small className="opacity-75">Utilidad estimada</small>
          </div>
        </div>

        {/* ACCESO COMPRAS */}
        <div className="col-md-4">
          <div className="card border-0 shadow bg-primary text-white p-4 h-100" onClick={() => navigate('/compras')} style={{ cursor: 'pointer' }}>
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <h6 className="text-white-50 mb-1">📥 Inventario</h6>
                <h4 className="fw-bold m-0">Surtir Mercancía</h4>
              </div>
              <div className="fs-1">📦</div>
            </div>
          </div>
        </div>

        {/* GRÁFICA */}
        <div className="col-md-8">
          <div className={`${cardClass} p-4`} style={{ minHeight: '350px' }}>
            <h5 className="fw-bold mb-4">📊 Rendimiento de Ventas</h5>
            {datosGrafica.length > 0 ? (
              <div style={{ width: '100%', height: 250 }}>
                <ResponsiveContainer>
                  <BarChart data={datosGrafica}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={tema === 'claro' ? '#ccc' : '#444'} />
                    <XAxis dataKey="fecha" stroke={tema === 'claro' ? '#333' : '#888'} tick={{fontSize: 11}} />
                    <YAxis stroke={tema === 'claro' ? '#333' : '#888'} tick={{fontSize: 11}} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: tema === 'claro' ? '#fff' : '#1a1a1a', border: '1px solid #444', color: tema === 'claro' ? '#000' : '#fff' }}
                      itemStyle={{ fontSize: '12px' }}
                    />
                    <Legend />
                    <Bar dataKey="total" fill="#198754" name="Venta Bruta" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="ganancia" fill="#0dcaf0" name="Ganancia Real" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : <div className="text-center py-5 text-secondary">No hay datos esta semana.</div>}
          </div>
        </div>

        {/* ALZAS */}
        <div className="col-md-4">
          <div className={`${cardClass} h-100 p-3`}>
            <h5 className="fw-bold text-warning mb-3">📈 Alzas de Precio</h5>
            <div className="overflow-auto" style={{ maxHeight: '250px' }}>
              {alzas.length > 0 ? (
                <ul className="list-group list-group-flush">
                  {alzas.map((item, index) => (
                    <li key={index} className={`list-group-item bg-transparent d-flex justify-content-between px-0 border-secondary small ${tema === 'claro' ? 'text-dark' : 'text-white'}`}>
                      <span className="text-truncate" style={{maxWidth: '150px'}}>{item.nombre}</span>
                      <span className="text-warning fw-bold">↑ ${item.precioActual}</span>
                    </li>
                  ))}
                </ul>
              ) : <p className="text-secondary text-center mt-4 small">Sin cambios recientes.</p>}
            </div>
          </div>
        </div>

        {/* STOCK CRÍTICO */}
        <div className="col-md-6">
          <div className={`card border-danger shadow h-100 ${tema === 'claro' ? 'bg-white' : 'bg-dark'}`}>
            <div className="card-body">
              <h5 className="card-title text-danger fw-bold">⚠️ Stock Crítico</h5>
              <div className="mt-3 overflow-auto" style={{maxHeight: '180px'}}>
                {productosBajos.length > 0 ? productosBajos.map(p => (
                  <div key={p.id} className={`d-flex justify-content-between border-bottom py-2 ${tema === 'claro' ? 'text-dark' : 'text-white'}`}>
                    <span className="small">{p.nombre}</span>
                    <span className="badge bg-danger">{p.stockActual} pz</span>
                  </div>
                )) : <p className="text-secondary text-center py-3">Todo en orden ✅</p>}
              </div>
            </div>
          </div>
        </div>

        {/* PROVEEDORES */}
        <div className="col-md-6">
          <div className={`card border-primary shadow h-100 ${tema === 'claro' ? 'bg-white' : 'bg-dark'}`}>
            <div className="card-body">
              <h5 className="card-title text-primary fw-bold">🚚 Visitas Programadas</h5>
              <div className="mt-3">
                {visitasHoy.length > 0 ? visitasHoy.map(v => (
                  <div key={v.id} className={`p-2 mb-2 bg-opacity-10 border-start border-primary border-4 rounded ${tema === 'claro' ? 'bg-primary text-dark' : 'bg-secondary text-white'}`}>
                    <strong className="small">{v.nombreEmpresa}</strong><br/>
                    <small className="text-secondary">{v.contactoNombre}</small>
                  </div>
                )) : <p className="text-secondary text-center py-3">No hay visitas para hoy.</p>}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;