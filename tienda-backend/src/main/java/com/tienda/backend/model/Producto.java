package com.tienda.backend.model;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "productos")
@Data // Esto crea Getters y Setters automáticamente gracias a Lombok
public class Producto {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String nombre;
    private String codigoBarras;
    private Double precioCompra;
    private Double precioVenta;
    private Integer stockActual;

    @ManyToOne // Muchos productos pertenecen a un proveedor
    @JoinColumn(name = "proveedor_id")
    private Proveedor proveedor;
}