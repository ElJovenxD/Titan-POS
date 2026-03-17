import React, { useState } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';

function PantallaBloqueo({ onDesbloquear }) {
  const [pinIngresado, setPinIngresado] = useState('');

  const presionarTecla = (numero) => {
    if (pinIngresado.length < 6) { // Límite de 6 dígitos
      setPinIngresado(prev => prev + numero);
    }
  };

  const borrar = () => {
    setPinIngresado('');
  };

  const intentarDesbloqueo = async () => {
    try {
      const res = await axios.post('http://localhost:8080/api/seguridad/verificar', { pin: pinIngresado });
      if (res.data === true) {
        onDesbloquear();
      } else {
        Swal.fire({
          toast: true,
          position: 'top',
          icon: 'error',
          title: 'PIN Incorrecto',
          showConfirmButton: false,
          timer: 1500
        });
        setPinIngresado('');
      }
    } catch (error) {
      console.error(error);
      Swal.fire('Error', 'No hay conexión con el servidor', 'error');
    }
  };

  return (
    <div className="d-flex flex-column justify-content-center align-items-center vh-100 bg-dark text-white" style={{ position: 'fixed', top: 0, left: 0, width: '100%', zIndex: 9999 }}>
      <h1 className="fw-bold mb-2">🏪 Los Chilangos</h1>
      <p className="text-secondary mb-4">Ingresa tu PIN para continuar</p>

      {/* Pantallita del PIN */}
      <div className="mb-4 bg-black rounded p-3 text-center" style={{ width: '250px', letterSpacing: '10px', fontSize: '24px', minHeight: '60px' }}>
        {pinIngresado.replace(/./g, '●')}
      </div>

      {/* Teclado numérico */}
      <div className="d-grid gap-2" style={{ gridTemplateColumns: 'repeat(3, 1fr)', width: '250px' }}>
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
          <button key={num} className="btn btn-outline-light btn-lg py-3 fw-bold" onClick={() => presionarTecla(num.toString())}>
            {num}
          </button>
        ))}
        <button className="btn btn-danger btn-lg py-3 fw-bold" onClick={borrar}>C</button>
        <button className="btn btn-outline-light btn-lg py-3 fw-bold" onClick={() => presionarTecla('0')}>0</button>
        <button className="btn btn-success btn-lg py-3 fw-bold" onClick={intentarDesbloqueo}>OK</button>
      </div>
    </div>
  );
}

export default PantallaBloqueo;