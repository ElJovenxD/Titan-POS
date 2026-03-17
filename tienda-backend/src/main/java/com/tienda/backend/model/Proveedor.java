package com.tienda.backend.model;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "proveedores")
@Data
public class Proveedor {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "nombre_empresa") // Mapeo exacto al SQL
    private String nombreEmpresa;

    @Column(name = "contacto_nombre") // Mapeo exacto al SQL
    private String contactoNombre;

    @Column(name = "telefono")
    private String telefono;

    @Column(name = "dias_visita") // Esta la agregaremos para los checkboxes
    private String diasVisita;
}