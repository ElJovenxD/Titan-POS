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
    private String passwordCorreo;

    // NUEVA VARIABLE
    private String nombreTienda;

    @Column(columnDefinition = "TEXT")
    private String iconoTienda;
    private String tema;
    @Column(name = "color_principal")
    private String colorPrincipal;


    public String getPasswordCorreo() { return passwordCorreo; }
    public void setPasswordCorreo(String passwordCorreo) { this.passwordCorreo = passwordCorreo; }

    public String getTema() { return tema; }
    public void setTema(String tema) { this.tema = tema; }

    public String getColorPrincipal() { return colorPrincipal; }
    public void setColorPrincipal(String colorPrincipal) { this.colorPrincipal = colorPrincipal; }


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