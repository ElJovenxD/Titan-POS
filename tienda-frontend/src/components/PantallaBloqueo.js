import React, { useState, useContext } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import { TiendaContext } from '../context/TiendaContext'; // <-- Importamos la nube

function PantallaBloqueo({ onDesbloquear }) {
  // Bajamos TODAS las variables de la nube
  const { nombreTienda, iconoTienda, tema, colorPrincipal } = useContext(TiendaContext); 
  const [pinIngresado, setPinIngresado] = useState('');

  const presionarTecla = (numero) => {
    if (pinIngresado.length < 6) {
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
          toast: true, position: 'top', icon: 'error', title: 'PIN Incorrecto', showConfirmButton: false, timer: 1500
        });
        setPinIngresado('');
      }
    } catch (error) {
      console.error(error);
      Swal.fire('Error', 'No hay conexión con el servidor', 'error');
    }
  };

  return (
    // MAGIA 1: Cambiamos el fondo general según el tema (Claro u Oscuro)
    <div className={`d-flex flex-column justify-content-center align-items-center vh-100 ${tema === 'claro' ? 'bg-light text-dark' : 'bg-dark text-white'}`} style={{ position: 'fixed', top: 0, left: 0, width: '100%', zIndex: 9999 }}>
      
      {/* Título y Logo */}
      <h1 className="fw-bold mb-2 d-flex align-items-center justify-content-center gap-3">
        {iconoTienda.startsWith('data:image') ? (
          <img src={iconoTienda} alt="Logo" style={{ width: '60px', height: '60px', objectFit: 'contain' }} />
        ) : (
          <span>{iconoTienda}</span>
        )}
        {nombreTienda}
      </h1>
      
      <p className="text-secondary mb-4">Ingresa tu PIN para continuar</p>

      {/* MAGIA 2: La pantallita del PIN cambia a blanco en modo claro */}
      <div className={`mb-4 rounded p-3 text-center ${tema === 'claro' ? 'bg-white border border-secondary' : 'bg-black'}`} style={{ width: '250px', letterSpacing: '10px', fontSize: '24px', minHeight: '60px' }}>
        {pinIngresado.replace(/./g, '●')}
      </div>

      {/* Teclado numérico */}
      <div className="d-grid gap-2" style={{ gridTemplateColumns: 'repeat(3, 1fr)', width: '250px' }}>
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
          // MAGIA 3: Los botones numéricos cambian su borde (oscuro o claro)
          <button key={num} className={`btn ${tema === 'claro' ? 'btn-outline-dark' : 'btn-outline-light'} btn-lg py-3 fw-bold`} onClick={() => presionarTecla(num.toString())}>
            {num}
          </button>
        ))}
        <button className="btn btn-danger btn-lg py-3 fw-bold" onClick={borrar}>C</button>
        <button className={`btn ${tema === 'claro' ? 'btn-outline-dark' : 'btn-outline-light'} btn-lg py-3 fw-bold`} onClick={() => presionarTecla('0')}>0</button>
        
        {/* MAGIA 4: El botón "OK" usa el color principal que elegiste (azul, rojo, verde...) */}
        <button className={`btn btn-${colorPrincipal} btn-lg py-3 fw-bold`} onClick={intentarDesbloqueo}>OK</button>
      </div>
    </div>
  );
}

export default PantallaBloqueo;