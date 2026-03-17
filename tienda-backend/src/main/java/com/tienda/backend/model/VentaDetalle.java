package com.tienda.backend.model;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "detalle_ventas")
@Data
public class VentaDetalle {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "venta_id")
    private Long ventaId;

    @Column(name = "producto_id")
    private Long productoId;

    @Column(name = "producto_nombre")
    private String productoNombre;

    private Integer cantidad;

    @Column(name = "precio_unitario")
    private Double precioUnitario;
}