import React, { useContext } from 'react';
import { TiendaContext } from '../context/TiendaContext'; // <-- Importamos la nube

const TicketVenta = React.forwardRef(({ venta, detalles }, ref) => {
  const { nombreTienda, iconoTienda } = useContext(TiendaContext); // <-- Extraemos el nombre de la tienda desde el contexto

  return (
    <div ref={ref} className="p-3 text-dark bg-white" style={{ width: '300px', fontSize: '12px', fontFamily: 'monospace' }}>
      
      {venta ? (
        <>
          <div className="text-center mb-2">
            {/* AQUÍ PONEMOS EL NOMBRE DINÁMICO */}
            <h5 className="fw-bold m-0 text-uppercase">
              {!iconoTienda.startsWith('data:image') && <span>{iconoTienda} </span>}
              {nombreTienda}
            </h5>
            <p className="m-0">¡Calidad y Confianza!</p>
            <p className="small">{new Date(venta.fechaVenta || venta.fecha).toLocaleString()}</p>
          </div>
          
          <hr style={{ borderTop: '1px dashed black' }} />
          
          <table className="w-100">
            <thead>
              <tr>
                <th className="text-start">Cant.</th>
                <th className="text-start">Prod.</th>
                <th className="text-end">Total</th>
              </tr>
            </thead>
            <tbody>
              {detalles.map((d, i) => {
                const precio = d.precioVenta || d.precioUnitario || 0;
                return (
                  <tr key={i}>
                    <td>{d.cantidad}</td>
                    <td className="text-truncate" style={{ maxWidth: '150px' }}>{d.nombre}</td>
                    <td className="text-end">${(d.cantidad * precio).toFixed(2)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          <hr style={{ borderTop: '1px dashed black' }} />
          
          <div className="d-flex justify-content-between h5 fw-bold mt-2">
            <span>TOTAL:</span>
            <span>${venta.totalVenta?.toFixed(2)}</span>
          </div>

          <div className="text-center mt-4">
            <p className="m-0">Gracias por su preferencia</p>
            {/* Opcional: También puedes hacer dinámico el nombre del dueño si gustas después */}
            <p className="small">José de Jesús Martín Zúñiga</p>
          </div>
        </>
      ) : (
        <div className="text-center">Generando ticket...</div>
      )}
      
    </div>
  );
});

export default TicketVenta;