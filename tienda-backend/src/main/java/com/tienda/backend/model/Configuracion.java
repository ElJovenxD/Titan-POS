package com.tienda.backend.model;

import jakarta.persistence.*;

@Entity
@Table(name = "configuracion")
public class Configuracion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String pinActual;
    private String correoAlertas;

    // NUEVA VARIABLE
    private String nombreTienda;
    private String iconoTienda;

    public String getIconoTienda() { return iconoTienda; }
    public void setIconoTienda(String iconoTienda) { this.iconoTienda = iconoTienda; }

    // Getters y Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getPinActual() { return pinActual; }
    public void setPinActual(String pinActual) { this.pinActual = pinActual; }

    public String getCorreoAlertas() { return correoAlertas; }
    public void setCorreoAlertas(String correoAlertas) { this.correoAlertas = correoAlertas; }

    public String getNombreTienda() { return nombreTienda; }
    public void setNombreTienda(String nombreTienda) { this.nombreTienda = nombreTienda; }
}