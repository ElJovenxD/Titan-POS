import React from 'react';

const TicketVenta = React.forwardRef(({ venta, detalles }, ref) => {
  return (
    // El div con el REF siempre debe renderizarse, aunque esté vacío temporalmente
    <div ref={ref} className="p-3 text-dark bg-white" style={{ width: '300px', fontSize: '12px', fontFamily: 'monospace' }}>
      
      {/* Solo pintamos el contenido si "venta" ya trae datos */}
      {venta ? (
        <>
          <div className="text-center mb-2">
            <h5 className="fw-bold m-0">🏪 LOS CHILANGOS</h5>
            <p className="m-0">¡Calidad y Confianza!</p>
            {/* Ojo: en tu Java le pusimos fechaVenta, no fecha */}
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
                // Como le pasas el carrito directo, la propiedad es precioVenta
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