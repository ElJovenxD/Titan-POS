import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

export const TiendaContext = createContext();

export const TiendaProvider = ({ children }) => {
  const [nombreTienda, setNombreTienda] = useState("Cargando...");
  const [iconoTienda, setIconoTienda] = useState("🏪");
  const [tema, setTema] = useState("oscuro"); // <-- NUEVO
  const [colorPrincipal, setColorPrincipal] = useState("success"); // <-- NUEVO

  useEffect(() => {
    axios.get('http://localhost:8080/api/seguridad/obtener')
      .then(res => {
        setNombreTienda(res.data.nombreTienda);
        setIconoTienda(res.data.iconoTienda);
        setTema(res.data.tema); // <-- NUEVO
        setColorPrincipal(res.data.colorPrincipal); // <-- NUEVO
      })
      .catch(err => console.error("Error al cargar configuración", err));
  }, []);

  return (
    // AHORA SÍ COMPARTIMOS LAS FUNCIONES 'SET' PARA QUE AJUSTES.JS PUEDA USARLAS
    <TiendaContext.Provider value={{ 
        nombreTienda, setNombreTienda, 
        iconoTienda, setIconoTienda, 
        tema, setTema, 
        colorPrincipal, setColorPrincipal 
    }}>
      {children}
    </TiendaContext.Provider>
  );
};