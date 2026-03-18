import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

export const TiendaContext = createContext();

export const TiendaProvider = ({ children }) => {
  const [nombreTienda, setNombreTienda] = useState("Cargando...");
  const [iconoTienda, setIconoTienda] = useState("🏪"); // <-- NUEVO ESTADO

  useEffect(() => {
    axios.get('http://localhost:8080/api/seguridad/obtener')
      .then(res => {
        setNombreTienda(res.data.nombreTienda);
        setIconoTienda(res.data.iconoTienda); // <-- LO GUARDAMOS AL ABRIR
      })
      .catch(err => console.error("Error al cargar configuración", err));
  }, []);

  return (
    // LO COMPARTIMOS EN EL VALUE
    <TiendaContext.Provider value={{ nombreTienda, iconoTienda }}>
      {children}
    </TiendaContext.Provider>
  );
};